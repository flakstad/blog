---
title: "Projects and products"
type: "page"
eyebrow: "Independent software"
lede: "I build products for real use and smaller technical tools that explore how software could work differently."
description: "Independent products and open-source software by Andreas Flakstad, including Kari, Ro, Kvist, VevDB, Kimen, Olive, pbt, and statecharts."
---

## Products

### Kari

Kari is an AI receptionist for Norwegian businesses. I have been building and operating it since March 2025, and it keeps evolving as real callers expose new edge cases. It handles appointment booking, changes and cancellations, including healthcare work in collaboration with Legelisten.no.

[heikari.no](https://heikari.no/)

### Ro

Ro is a native, local-first system for work and attention. Collections and items form the general model. An outline is the main working view, with focused views for agendas and things that need attention.

Most of the portable core is written in Kvist. VevDB is the database, and the macOS app uses native AppKit controls. Product state and behavior stay in the portable core rather than the platform adapter.

[Original idea and interactive outline demo](/posts/keyboard-first-outlining/)

## Tools and technology

### Kvist

Kvist is a practical Lisp for systems programming. It combines Clojure-inspired syntax and macros with static types, explicit ownership and direct memory management. It transpiles to readable Odin and builds native programs without a virtual machine or garbage collector.

Ordinary values remain concrete and native. An explicit immutable `Data` model handles heterogeneous values such as configuration, messages and queries. Kvist and Odin files can share a package, and Kvist code can call Odin libraries directly.

[Source code and documentation](https://github.com/kvist-lang/kvist)

### VevDB

VevDB is a native, embedded Datalog database built around immutable database values. It provides Datomic-style facts, transactions, queries, pull, history and snapshots. It runs in process, either in memory or durably with bundled SQLite.

Applications use VevDB’s data model and indexes rather than managing SQL schemas. The engine is written in Kvist and compiles through Odin to a native library. Clojure and Kvist are the main APIs, backed by a C ABI and other language integrations.

[Source code and documentation](https://github.com/vevdb/vev)

### Kimen

Kimen is a small local-first secrets tool. A repository describes the configuration it needs without storing secret values. Kimen keeps those values in a local vault and injects them as environment variables or temporary files when a process starts.

[Read about Kimen](/posts/kimen/) · [Source code](https://github.com/flakstad/kimen)

### Olive

Olive brings a live-development workflow to Odin. It can rebuild and load changed code into a running process while preserving the program state being tested, without changing the application’s normal production entry point or build.

[Source code](https://github.com/flakstad/olive)

### pbt

`pbt` is a property-based testing library for Odin with deterministic replay and shrinking. It supports ordinary properties, stateful model tests, CLI programs, HTTP services and external runners.

[Source code](https://github.com/flakstad/pbt)

### statecharts

`statecharts` is a deterministic Harel-style statechart implementation for Odin. It makes complex stateful behavior explicit through nested and parallel states, history, delayed events, run-to-completion processing and snapshots. It also includes diagram export and a small Kvist authoring layer over the same runtime.

[Source code](https://github.com/flakstad/statecharts)

<p class="page-actions"><a href="/">Read my technical writing →</a></p>
