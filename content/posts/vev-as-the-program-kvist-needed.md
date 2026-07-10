---
date: 2026-07-10T09:50:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Vev as the Program Kvist Needed"
---

Idea note.

This is the bridge post. Kvist needs a serious program to keep it honest, and
Vev is exactly the kind of program that can do that. It has parsing, typed data
structures, indexes, transactions, query planning, host-language boundaries,
storage, tests, and performance pressure. It is not a toy compiler demo.

Vev also fits Kvist philosophically. The public semantics are value-oriented:
database values in, query results out, transactions as explicit transitions.
The implementation can still use local mutation where it makes the engine more
direct. That is close to the balance Kvist is trying to make available in the
language itself: functional shape at the boundary, explicit native machinery
inside.

The concrete forcing function should be the C ABI and host wrappers. It is one
thing for Kvist code to feel nice inside a repository. It is another thing for
that code to produce a native library with a stable enough boundary for C,
Python, Java, Clojure, Go, Rust, Node, and Odin clients. That pressure keeps
the language practical.

Possible angles:

- why a language needs a demanding real project before its design settles
- how Vev tests Kvist's ownership model, collection helpers, transforms,
  interop, and generated Odin readability
- why "functional semantics, imperative implementation" is a useful shared
  phrase for both projects
- how the C ABI and host wrappers force Kvist output to be practical, not only
  elegant
- why Vev should make Kvist better without making Vev require users to care
  about Kvist
- how LLM-assisted development changes what a small project can attempt, while
  still leaving the resulting tool useful without the agents

Concrete source notes:

- `../kvist/.worktrees/codex-core-bootstrap-plan/README.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/CORE-BOOTSTRAP.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/design-principles.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/c-abi.md`

Open questions for the actual post:

- Should this be honest about circularity: building the language to build the
  database, and the database to test the language?
- What is the best concrete example from Vev where Kvist changed because the
  database needed it?
- Should this be mostly personal narrative, or mostly a technical design note?
- How much should it mention the LLM-agent working style versus leaving that for
  a separate post?
