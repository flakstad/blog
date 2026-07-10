---
date: 2026-07-10T10:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Why Datomic Still Feels Special"
---

Idea note.

This should be the Datomic appreciation post. It should not rush to Vev. It can
just spend time with the ideas that still feel unusually good: the database as a
value, facts accumulating over time, transactions as data, Datalog as data, and
pull as explicit data selection instead of object loading.

The tone should be direct praise. Datomic made a set of ideas feel coherent,
not just individually clever. A connection is not the thing most application
logic should carry around. A stable database value is. That difference changes
how functions are shaped, how tests are written, how history can be thought
about, and how much accidental mutable context leaks through a program.

Possible angles:

- a database snapshot that does not change under your feet
- facts over time instead of destructive updates as the only mental model
- transactions, queries, and pull patterns being ordinary data
- why Datalog is a good fit for relationship-heavy application data
- why this model still feels under-distributed outside Clojure

Concrete source notes:

- existing blog draft: `content/posts/datomic-ideas-in-a-native-package.md`
- `../vev/.worktrees/codex-item-vev-datalog/README.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/thesis.md`
- Day of Datomic / Datomic MusicBrainz material as practical examples of the
  model in use

Open questions for the actual post:

- Should this avoid mentioning Vev until the final paragraph?
- What is the smallest example that makes database-as-value concrete for a
  programmer who has never used Datomic?
- How much history or product context should be included before it becomes a
  different kind of post?
