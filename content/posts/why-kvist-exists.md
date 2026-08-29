---
date: 2026-08-29T12:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Kvist: A Lisp for Systems Programming"
---

I have spent the last ten years working with Clojure, and I love the language.

The syntax mostly gets out of the way. Programs are built from a small number
of uniform forms. Data literals are pleasant to read. Macros can extend the
language without introducing a separate template language. The REPL makes it
natural to work with a program while it is running.

But Clojure is not the language I want for every kind of software. When I ship
a desktop application or a CLI, binary size, startup time, and memory use are
part of the product. I often want one small native executable, concrete data
layouts, explicit allocation, and no VM or garbage collector.

The same concerns matter on servers. Memory use affects how much software fits
on a machine and how much it costs to run. I wanted the parts of Clojure that I
enjoy working with, but with a native execution model suited to these programs.

I found a lot to like in [Odin](https://odin-lang.org/): native values, explicit
memory, fast builds, a large core and vendor library, and source code that is
refreshingly straightforward. That led to a question:

> What would a Lisp look like if it started from Odin's semantics?

[Kvist](https://github.com/kvist-lang/kvist) is my attempt to answer that.

<!--more-->

## What I wanted to keep

The parentheses are the least interesting part of Lisp.

What I value is the uniformity. Code has a small number of shapes, so it is easy
to read, rearrange, and generate. Macros feel like part of the language rather
than a separate metaprogramming system. Data-shaped APIs such as Hiccup and
Datalog queries can use the same literals as ordinary programs.

I also wanted the working rhythm. A REPL is not only a command prompt for trying
small expressions. It lets me stay close to a program while I am building it,
inspect real values, redefine a function, and keep the state that made the
current problem interesting.

```text
kvist=> (defn square [x: int] -> int (* x x))
kvist=> (square 11)
121
```

Kvist keeps those ideas, but it does not recreate Clojure's runtime to get them.
Its REPL submissions are compiled and executed as native code. Its macros run at
compile time. Ordinary functions and values remain statically typed.

## Starting from Odin

I think Odin is a beautiful language. It is readable and direct, and it gives me
useful systems-programming primitives without trying to hide the machine.
Structs have concrete layouts. Slices are views. Dynamic arrays own storage.
Pointers, mutation, allocation, and cleanup are visible.

Its practical choices matter too. A directory of source files is a package.
The core and vendor libraries already cover much of what I need for native
programs, from files, networking, and cryptography to graphics and audio. The
compiler is fast enough to sit inside Kvist's development loop.

Odin is therefore more than an output format for Kvist. Kvist and Odin files can
live in the same package, use the same native types, and call each other without
a C ABI or generated bindings between them. I can write most of a package in
Kvist and keep a low-level part in Odin when Odin is the clearer tool.

Targeting a readable language also gives me a way to check the compiler. I can
look at the generated Odin and see whether a collection pipeline became one
loop, where cleanup happens, and how much machinery a Kvist feature introduces.
Readable output is a useful constraint on the source language.

Kvist starts with this execution model and asks how much of Lisp's way of
shaping programs can live there. The result should still look native when the
parentheses are gone.

```clojure
(defstruct User {
  name: string
  active?: bool
})

(defn display-name [user: User] -> string
  (if user.active?
    user.name
    "inactive"))
```

This is Lisp-shaped source, but `User` is a native struct and the function has a
concrete native signature. Ordinary Kvist does not pass these values through a
dynamic Lisp representation.

## When the shape itself is data

Not every value wants to be a native struct or homogeneous array.

HTML trees, configuration, messages, database transactions, pull patterns, and
Datalog queries are often clearer when their shape remains data. Kvist has an
immutable value called `Data` for these cases. I think of it as EDN in memory:
maps, vectors, sets, lists, keywords, symbols, tagged values, and scalars in one
heterogeneous tree.

```clojure
(defn page [title: string] -> Data
  [:main {:class "page"}
   [:h1 title]
   [:p "Ready"]])
```

`Data` is an explicit dynamic island in an otherwise statically typed
language. Most of a program can use native values with concrete representation
and cost. The parts that benefit from Lisp's data-oriented style can use
`Data` without making every value in the language dynamic.

This is the design choice that made Hiccup and VevDB's Datomic-shaped APIs feel
natural without pulling the database engine or the rest of a program into a
universal runtime object model. It is also the clearest example of what I want
from Kvist: keep the Lisp idea where it helps, while changing the assumptions
underneath it.

## A real program

A language can make almost any design look convincing in a small example. I
needed Kvist to answer to a real program.

[VevDB](https://github.com/vevdb/vev) is a native embedded Datalog database
written in Kvist. Its transactions and queries are naturally `Data`. The
engine underneath uses native structs, arrays, maps, pointers, local mutation,
and explicit storage lifetimes.

VevDB has forced Kvist to handle package boundaries, ownership, query execution,
large generated packages, SQLite integration, and a stable native interface.
It is not only a demo for Kvist. It is the program that keeps the language
honest.

Kvist has quite a bit more machinery than I will cover here. This post is about
why I wanted the language and the design choices that follow from that.

That is the experiment: keep the Lisp, change the starting assumptions.

The [README](https://github.com/kvist-lang/kvist/blob/main/README.md) has
examples, installation, and an overview of the current language. The
[language reference](https://github.com/kvist-lang/kvist/blob/main/docs/language.md)
contains the details. The source is on
[GitHub](https://github.com/kvist-lang/kvist).
