---
title: "Projects and products"
type: "page"
eyebrow: "Independent software"
lede: "I build products for real use and smaller technical tools that explore how software could work differently."
description: "Independent products and open-source software by Andreas Flakstad, including Kari, Ro, Kvist, VevDB, Kimen, Olive, pbt, and statecharts."
---

## Kari

Kari is an AI receptionist for Norwegian businesses. It answers real phone calls and handles useful work such as appointment booking, changes and cancellations. Building it has involved the less visible parts of production voice AI: conversational state, robust tool use, audio and silence monitoring, structured data, and careful handling of operational failure modes.

[heikari.no](https://heikari.no/)

## Ro

Ro is a native, local-first system for work and attention. Its general model is built around collections and items, with an outline as the primary working view and more focused surfaces for agendas and things that need attention.

The portable product engine is written mainly in Kvist, VevDB is the canonical database, and the macOS application renders through native AppKit controls. Product state and behavior stay outside the platform adapter, leaving room for other native renderers without introducing a second application architecture.

[Original idea and interactive outline demo](/posts/keyboard-first-outlining/)

## Kvist

Kvist is a practical Lisp for systems programming. It combines expression-oriented, Clojure-inspired syntax and macros with static types, explicit ownership and direct memory management. It transpiles to readable Odin and uses Odin to build native programs, without adding a virtual machine, garbage collector or lazy-sequence runtime.

Ordinary values remain concrete and native. Kvist also has an explicit immutable `Data` world for the places where Lisp-shaped heterogeneous data is useful, such as configuration, messages and queries. Kvist and Odin files can live in the same package, and Kvist code can use Odin libraries directly.

[Source code and documentation](https://github.com/kvist-lang/kvist)

## VevDB

VevDB is a native, embedded Datalog database built around immutable database values. It brings Datomic-style facts, transactions, queries, pull expressions, history and snapshots into an in-process library that can run in memory or durably using bundled SQLite.

Applications work with VevDB’s data model and indexes rather than managing SQL schemas. The engine is written in Kvist and compiles through Odin to a native library. Clojure and Kvist are the primary APIs, backed by a C ABI and additional language integrations.

[Source code and documentation](https://github.com/vevdb/vev)

## Other tools

### Kimen

Kimen is a small local-first secrets tool. A repository describes the configuration it needs without containing the secret values; Kimen keeps those values in a local vault and projects them into environment variables or temporary files when a process starts.

[Read about Kimen](/posts/kimen/) · [Source code](https://github.com/flakstad/kimen)

### Olive

Olive brings a live-development workflow to Odin. It can rebuild and load changed code into a running process while preserving the program state being tested, without changing the application’s normal production entry point or build.

[Source code](https://github.com/flakstad/olive)

### pbt

`pbt` is a property-based testing library for Odin with deterministic replay and shrinking. It supports ordinary properties, stateful models, CLI programs, HTTP services and external runners.

[Source code](https://github.com/flakstad/pbt)

### statecharts

`statecharts` is a deterministic Harel-style statechart implementation for Odin. It supports nested and parallel states, history, delayed events, run-to-completion processing, snapshots, and diagram export, with a small Kvist authoring layer over the same runtime.

[Source code](https://github.com/flakstad/statecharts)

<p class="page-actions"><a href="/">Read my technical writing →</a></p>
