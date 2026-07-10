---
date: 2026-07-10T09:40:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "SQLite Is Storage, Not the Model"
---

Idea note.

This post should explain a design boundary that will probably matter more as
Vev gets easier to install: durable Vev can use SQLite without becoming a SQL
database. SQLite stores durable facts, transaction metadata, logical index
chunks, and roots. Vev still owns the database model, Datalog execution, pull,
entity navigation, and immutable snapshot semantics.

There is a useful trap here. If people hear "SQLite-backed", they may assume
Vev compiles Datalog to SQL or exposes tables as its real model. That is not the
shape. SQLite is the boring, portable durability layer. The public model should
remain facts, transactions, database values, and queries over Vev-owned indexes.

The audience should be technical peers. The post can assume readers understand
that storage and query models can be separate, but it should not become a long
architecture dump. The main point is boundary clarity: SQLite helps with
durability and deployment, while Vev preserves the Datomic-shaped model at the
programming boundary.

Possible angles:

- why SQLite is attractive for adoption but should not leak into the semantic
  layer
- the difference between using SQLite and being SQLite-shaped
- why in-memory Vev should stay first-class
- why query execution should target Vev logical indexes and typed operators
- how this boundary preserves future choices like compaction, history, or other
  storage engines
- why "SQLite-backed" should not imply app-owned SQL schemas or Datalog-to-SQL

Concrete source notes:

- `../vev/.worktrees/codex-item-vev-datalog/docs/storage-architecture.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/architecture.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/query-model.md`

Open questions for the actual post:

- How technical should this get before it stops being useful to non-database
  implementers?
- Should it show a durable `connect "app.vev"` example and then explain what is
  intentionally hidden?
- Is the strongest analogy "SQLite as file/storage engine" or "SQLite as an
  implementation detail with good deployment properties"?
