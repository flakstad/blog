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
It takes ideas I value in Clojure into a different runtime model rather than
trying to reproduce Clojure itself in a native binary.

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
a native struct. `[]User` is a slice of those structs. The result is an Odin
dynamic array of strings, and it owns its storage:

```clojure
(let [names (active-names users) :defer]
  (println names))
```

`:defer` deletes the array at the end of the scope. Slice views borrow their
backing storage, and names ending in `!` make mutation explicit:

```clojure
(arr.sort-by! .name users)
(set! user.active? true)
```

Ordinary Kvist collections use native, homogeneous storage rather than a
universal persistent collection model. Allocation, borrowing, mutation, and
cleanup remain part of the source.

## Ordinary Kvist

Most Kvist code is built from structs, enums, unions, arrays, maps, pointers,
and procedures. Control forms are expressions, fields use dot access, and
multiple return values bind directly.

```clojure
(defenum Method [Get Post])

(defstruct Request {
  method: Method
  attempts: int
})

(defn lookup-method [name: string] -> [method: Method, ok: bool]
  (case name
    "GET" (return .Get true)
    "POST" (return .Post true)
    (return .Get false)))

(defn make-request [name: string] -> [request: Request, ok: bool]
  (let [[method found] (lookup-method name)]
    (if found
      (return (Request {method: method attempts: 0}) true)
      (return (Request {}) false))))

(defn retry! [request: ^Request]
  (when (< request^.attempts 3)
    (set! request^.attempts (+ request^.attempts 1))))
```

`lookup-method` returns two native values, not a boxed tuple. `^Request` is a
pointer, and `request^` dereferences it. `case`, `if`, `when`, and `let` lower
to ordinary native control flow. Odin APIs that return a value and an error use
the same multiple-return model.

## Kvist and Odin in the same package

One of the Odin design choices I like most is its package model: a directory of
source files is a package. Source layout, imports, and compilation line up.
Kvist uses the same model, and a package can contain both `.kvist` and `.odin`
files. They are compiled together.

An Odin file can define a native type and procedure:

```odin
// geometry/point.odin
package geometry

Point :: struct {
    x, y: f32,
}

length_squared :: proc(point: Point) -> f32 {
    return point.x * point.x + point.y * point.y
}
```

A Kvist file in the same directory can use them directly:

```clojure
;; geometry/predicates.kvist
(package geometry)

(defn origin? [point: geometry.Point] -> bool
  (= (geometry.length-squared point) 0))
```

Declarations on both sides can call each other directly. Code importing
`geometry` sees `Point`, `length-squared`, and `origin?` through the same package
alias. There is no C boundary, binding generator, or wrapper package between
the two languages. A low-level subsystem can stay in Odin while the rest of the
package is written in Kvist, with native types crossing between them.

## Native values and `Data`

Sometimes the shape of a value really is data.

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

Code can keep an evolving message as `Data`, validate it against a native type,
or decode it when a subsystem wants a concrete representation:

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

`total-paid-net` has no intermediate collections or general lazy sequence
machinery to optimize away. The source language can be more expressive than
the execution model without being dishonest about what runs.

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

The model has practical limits. Some native resources cannot be retained
safely. Loaded generations live until the session is reset. A crash in
submitted native code can still crash the worker. A clean `check`, `test`, or
`run` remains the reproducible truth; REPL history is development state, not a
hidden part of the program.

The same model can attach to a running application built with
[Olive](https://github.com/flakstad/olive). The application chooses safe
checkpoints between frames, requests, or jobs. At those points, the live console
can evaluate native Kvist code against capabilities exposed by the application
without throwing away the state that made the current bug interesting.

## Why Odin?

I think Odin is a beautiful language. It is readable, direct, and has little
syntax devoted to ceremony. It is not a Lisp, and I prefer Lisp forms when I am
shaping programs, writing macros, and building data DSLs. Kvist puts that source
shape on top of a language I already like.

Kvist targets Odin because its semantics are close to the ones I want in the
generated program. Structs have concrete layouts. Slices are views and dynamic
arrays own storage. Pointers are visible. Procedures can return several values
directly. Allocation goes through an explicit allocator, normally supplied by
Odin's implicit `context`.

In ordinary Odin code I can see data representation, mutation, and allocation.
Kvist emits the same model instead of inventing another memory or object model.

The build speed matters too. The Kvist REPL invokes the compiler for every
submission. Fast native compilation is part of what makes that workflow
practical.

I use the generated Odin to check what Kvist is actually doing. I can inspect
whether a transform became one loop, whether cleanup happens at the expected
scope, and whether a language feature requires more machinery than its Kvist
source suggests. Readable output is a constraint on the compiler.

Odin is also unusually batteries-included for a systems language. Core and
vendor packages can be imported directly:

```clojure
(import os "core:os")
(import sha2 "core:crypto/sha2")
(import raylib "vendor:raylib")
```

`core:*` covers files, networking, text, encodings, cryptography, math, and
concurrency. `vendor:*` includes maintained packages for raylib, SDL, Vulkan,
WebGPU, miniaudio, curl, Lua, and more. Their procedures, types, constants,
multiple return values, allocators, and errors retain their Odin semantics in
Kvist.

## Compile-time macros

Uniform forms give the language a simple representation that macros can
transform before normal lowering:

```clojure
(defmacro unless [condition & body]
  `(if ~condition
     (do)
     (do ~@body)))
```

Macros receive source forms and return source forms. They can validate small
DSLs or generate structs, unions, constructors, and other repetitive native
declarations. They run at compile time and do not add a runtime object model.

`Data` is not the macro representation. Macro syntax retains compiler context
and source locations; `Data` is an ordinary immutable runtime value.

## VevDB as a test of the language

A language can make almost any idea look convincing in a small example. I
wanted Kvist to answer to a real program.

[VevDB](https://github.com/vevdb/vev) is a native embedded Datalog database
written in Kvist. It has Datomic-style transactions, queries, pull, immutable
database values, in-memory and durable storage, several indexes, a query
planner, SQLite integration, a C ABI, and packages for other host languages.

`Data` is a natural fit for its public API:

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

VevDB has forced Kvist to handle ownership across package boundaries, query
execution without unnecessary allocation, stable native interfaces, large
generated packages, and readable code after lowering. It is not only a demo
for Kvist. It is the program that keeps the language honest.

## Building with it

Kvist already builds native executables and libraries, supports interactive
development, imports Odin packages directly, and compiles VevDB. The compiler
is tested on macOS and Linux, with the core CLI and representative programs
also tested on Windows. Its output needs no VM or tracing garbage collector.

Source code: [github.com/kvist-lang/kvist](https://github.com/kvist-lang/kvist)

That is the experiment: keep the Lisp, change the starting assumptions.
