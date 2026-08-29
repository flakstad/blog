---
date: 2026-08-29T12:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Kvist: A Lisp for Systems Programming"
---

I keep coming back to Clojure.

I like that the syntax mostly gets out of the way. Programs are built from a
small number of uniform forms. Data literals are pleasant to read. Macros can
extend the language without introducing a separate template language. And the
REPL makes it natural to work with a program while it is running.

But not every program I want to build fits the runtime model that comes with
Clojure. Sometimes I want a small native executable or library, concrete data
layouts, explicit allocation, and no VM or garbage collector. I do not want to
hide those things. For systems programs, they are part of the program.

I found a lot to like in [Odin](https://odin-lang.org/): native values, explicit
memory, fast builds, direct access to a useful core and vendor library, and
source code that is refreshingly straightforward. That led to a question:

> What would a Lisp look like if it started from Odin's semantics?

[Kvist](https://github.com/kvist-lang/kvist) is my attempt to answer that. It
has Clojure-inspired syntax, macros, data-shaped code, and interactive
development, but it compiles to Odin and keeps Odin's native execution model.
It is not an implementation of Clojure, and it is not an attempt to make all of
Clojure fit into a native binary.

<!--more-->

## Lisp on the surface, native values underneath

Here is a small Kvist function:

```clojure
(defstruct User {
  name: string
  active?: bool
})

(defn active-names [users: []User] -> [dynamic]string
  (into [dynamic]string
    (comp
      (filter .active?)
      (map .name))
    users))
```

The parentheses and names are Lisp-like, but the types are concrete. `User` is
a native struct. `[]User` is a slice of those structs. The result is an owned
Odin dynamic array of strings, not a persistent vector of boxed objects.

That distinction matters when using the result:

```clojure
(let [names (active-names users) :defer]
  (println names))
```

`:defer` arranges for the owned array to be deleted at the end of the scope. A
function can instead return an owned value or pass it to something that takes
ownership. Views such as slices borrow their backing storage. Kvist diagnoses
some obvious mistakes, but the model is deliberately close to Odin: allocation
and cleanup remain visible.

Mutation is visible too. Names ending in `!` mutate, while the equivalent
non-bang operation returns a new owned value:

```clojure
(arr.sort-by! .name users)
(set! user.active? true)

(let [sorted (arr.sort-by .name users) :defer]
  ...)
```

This is one of the places where familiar Clojure spelling can otherwise give
the wrong impression. Kvist vectors, maps, and arrays are not all persistent
collections. Ordinary Kvist code uses native, homogeneous storage and its
ownership rules.

## Native values and `Data`

Still, sometimes the shape of a value really is data.

HTML is a good example. So are configuration, messages, database transactions,
pull patterns, and Datalog queries. Giving each possible shape its own native
struct can make these jobs less clear, not more.

Kvist has an immutable value called `Data` for those cases. I think of it as
EDN in memory: nil, booleans, numbers, strings, keywords, symbols, lists,
vectors, maps, sets, and tagged values in one heterogeneous tree.

This function returns Hiccup-shaped `Data`:

```clojure
(defn page [title: string] -> Data
  [:main {:class "page"}
   [:h1 title]
   [:p "Ready"]])
```

The official [HTML package](https://github.com/kvist-lang/html) renders this
shape without requiring HTML nodes to become a universal language type.

And a Datalog query can simply be quoted data:

```clojure
(def names-query
  '[:find ?name
    :where [?e :contact/name ?name]])
```

`Data` is not the representation of every Kvist value. It is an explicit
dynamic island in an otherwise statically typed language. Its presence is
visible in function signatures, and the compiler manages its lifetime
deterministically. There is still no tracing garbage collector.

The boundary can go in either direction. Code can keep an evolving message as
`Data`, validate it against a native type, or decode it when a subsystem wants
a concrete representation:

```clojure
(defstruct Settings {
  port: int
  mode: keyword
})

(let [[settings error ok] (data.decode Settings message)]
  (if ok
    (start settings)
    (report error)))
```

This split is probably the most important design choice in Kvist. Lisp is very
good at representing little languages as data. That does not require making
every integer, struct, pointer, and array in the rest of the program dynamic.

## Collection pipelines without a sequence runtime

I also wanted collection code to retain the shape I like in Clojure without
bringing in lazy sequences or allocating an array for every step.

A transform in Kvist is compile-time syntax describing how one item moves
through a pipeline:

```clojure
(deftransform paid-nets
  (filter paid?)
  (map net)
  (filter positive?))

(defn total-paid-net [] -> int
  (transduce paid-nets + 0 (sample-orders)))
```

The same transform can collect into a native array with `into`, reduce with
`transduce`, or drive a `for` loop. It is not a runtime sequence value.

The generated Odin for `total-paid-net` contains one loop:

```odin
total_paid_net :: proc() -> int {
    return (proc(kvist_source: [4]Order, kvist_init: int) -> int {
        kvist_acc := kvist_init
        for kvist_item in kvist_source {
            if paid_p(kvist_item) {
                kvist_xform_2 := net(kvist_item)
                if positive_p(kvist_xform_2) {
                    kvist_acc += kvist_xform_2
                }
            }
        }
        return kvist_acc
    })(sample_orders(), 0)
}
```

There are no intermediate collections here. There is also no general lazy
sequence machinery to optimize away. The source language can be more
expressive than the execution model without being dishonest about what runs.

Not every pipeline should use a transform. Eager helpers are useful when the
intermediate collection is itself meaningful, and a direct loop is often the
clearest answer when the work has unusual state. Kvist provides all three and
keeps their allocation behavior distinct.

## A REPL that runs native code

The REPL was the part I was least willing to give up.

Kvist's REPL does not evaluate forms with a separate interpreter. Each
submission is read, macro-expanded, type checked, ownership checked, lowered to
Odin, compiled, loaded, and then executed as native code.

```text
$ kvist repl hello.kvist
Kvist native REPL
kvist=> (+ 1 1)
2
kvist=> (defn scale [x: int] -> int (* x 2))
kvist=> (scale 21)
42
kvist=> (defn scale [x: int] -> int (* x 3))
kvist=> (scale 21)
63
```

The file passed to `kvist repl` supplies the package graph, imports, compiler
options, and symbol context. Definitions, supported typed values, imports,
macros, and recent results remain available to later submissions. Compatible
function redefinitions affect later calls.

Earlier runtime forms are not replayed to rebuild the session. A resident
worker retains loaded native generations and session state. Later submissions
compile the native declarations they need and load another generation.

There are practical limits, and I prefer that they stay explicit. Some native
resources cannot be retained safely. Loaded generations live until the session
is reset. A crash in submitted native code can still crash the worker. And a
clean `check`, `test`, or `run` remains the reproducible truth; REPL history is
development state, not a hidden part of the program.

The same model can attach to a running application built with
[Olive](https://github.com/flakstad/olive). The application chooses safe
checkpoints between frames, requests, or jobs. At those points, the live console
can evaluate native Kvist code against capabilities exposed by the application
without throwing away the state that made the current bug interesting.

## Why compile to Odin?

Kvist could have targeted C, LLVM, or a custom backend. Odin gives it something
I value during this stage of the language: a readable systems language between
Kvist and machine code.

Generated Odin is useful evidence. I can inspect whether a transform really
became one loop, whether cleanup happens at the expected scope, and whether a
language feature requires more machinery than its Kvist source suggests. I
want readable generated output to remain a constraint on the compiler, not
just a debugging accident.

Odin also gives Kvist a practical ecosystem immediately. Core and vendor
packages can be imported directly:

```clojure
(import os "core:os")
(import sha2 "core:crypto/sha2")
(import raylib "vendor:raylib")
```

Their procedures, types, constants, multiple return values, allocators, and
errors retain their Odin semantics. Kvist and Odin files can live in the same
package and call each other without a wrapper layer. If an abstraction in
Kvist is not helping, I can write the low-level part in ordinary Odin and keep
the two side by side.

This does mean that Kvist inherits constraints from Odin. That is intentional.
The point is not to disguise one runtime as another. It is to add a
Lisp-shaped, transformable source language while keeping the native model
recognizable.

## Macros without a dynamic runtime

Uniform forms are not only a preference about punctuation. They give the
language a simple representation that macros can transform before normal
lowering:

```clojure
(defmacro unless [condition & body]
  `(if ~condition
     (do)
     (do ~@body)))
```

Macros receive source forms and return source forms. They can validate small
DSLs or generate structs, unions, constructors, and other repetitive native
declarations. They run at compile time and do not add a runtime object model.

Macro syntax and runtime `Data` are deliberately separate. Syntax retains
compiler context and source locations. `Data` is an ordinary immutable runtime
value. They look related because this is a Lisp, but they solve different
problems.

## VevDB as a test of the language

A language can make almost any idea look convincing in a small example. I
wanted Kvist to answer to a real program.

[VevDB](https://github.com/vevdb/vev) is a native embedded Datalog database
written in Kvist. It has Datomic-style transactions, queries, pull, immutable
database values, in-memory and durable storage, several indexes, a query
planner, SQLite integration, a C ABI, and packages for other host languages.

It also makes direct use of the split between native values and `Data`:

```clojure
(def initial-contacts
  '[{:db/id 1
     :contact/name "Ada Lovelace"
     :contact/email "ada@example.com"}
    {:db/id 2
     :contact/name "Grace Hopper"
     :contact/email "grace@example.com"}])

(def contact-names-query
  '[:find ?name
    :where [?e :contact/name ?name]])

(defn contact-names [db: d.DB] -> Data
  (d.q contact-names-query db))
```

Transactions and queries are naturally `Data`. The database engine underneath
uses native structs, arrays, maps, pointers, local mutation, and explicit
storage lifetimes where those are the right tools.

VevDB has forced Kvist to deal with less attractive but more important
questions: ownership across package boundaries, query execution without
unnecessary allocation, stable native interfaces, large generated packages,
and readable code after lowering. It is not only a demo for Kvist. It is the
program that keeps the language honest.

## Where it is now

Kvist is still alpha software. The language and tooling are moving, and I am
still finding the boundaries between helpful inference and hidden behavior.
The compiler is tested on macOS and Linux. The core CLI and representative
programs are also tested on Windows. Its output needs no VM or tracing garbage
collector.

I am not trying to replace Clojure or Odin. I want the way a Lisp lets me shape
a program, paired with the concrete execution model I want for native tools and
libraries.

That is the experiment: keep the Lisp, change the starting assumptions.

Source code: [github.com/kvist-lang/kvist](https://github.com/kvist-lang/kvist)
