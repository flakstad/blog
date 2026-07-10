---
date: 2026-07-10T11:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Kvist and Vev Post Order"
---

Planning note.

The Kvist and Vev idea notes are a loose cluster, not a numbered series. The
dates are not meant to define reading order. Some posts overlap on purpose
because they approach the same projects from different angles: motivation,
lineage, language design, database design, and the current LLM-assisted working
style.

Suggested first pass order:

1. `why-datomic-still-feels-special.md`
2. `datomic-ideas-in-a-native-package.md`
3. `why-vev-exists.md`
4. `standing-on-datascript-datalevin-and-musicbrainz.md`
5. `sqlite-is-storage-not-the-model.md`
6. `why-kvist-exists.md`
7. `taste-is-an-engineering-constraint.md`
8. `output-shape-is-part-of-the-language.md`
9. `why-odin-made-sense-for-kvist.md`
10. `odin-in-parentheses.md`
11. `native-programming-inside-the-program.md`
12. `vev-as-the-program-kvist-needed.md`
13. `build-while-the-agents-are-cheap.md`

Another reasonable path is to split them into smaller clusters:

- Datomic and Vev: Datomic appreciation, native package, Vev motivation,
  open-source lineage, SQLite storage boundary
- Kvist motivation: why Kvist exists, taste, output shape, Odin fit, Odin in
  parentheses
- Building practice: native live development, Vev keeping Kvist honest, LLM
  agent timing

The order should stay flexible. When turning one note into a full post, choose
the strongest concrete situation for that post rather than trying to make every
piece depend on the previous one.
