---
date: 2026-07-10T09:30:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Why Vev Exists"
---

Idea note.

This should be the fundamental Vev motivation post, separate from the existing
draft about Datomic ideas in a native package. That draft already says the main
thing: a database snapshot can be a value. This post can start from the same
admiration, but be broader and more personal: Datomic is genuinely cool, and I
want more programmers to have access to that way of building software outside
the Clojure ecosystem.

The center should stay small. Facts accumulate. Transactions are explicit. Reads
happen against immutable database values. Queries are data. Pull patterns are
data. Application code can pass a database snapshot into ordinary functions
instead of smuggling a mutable connection through everything.

This post should praise Datomic plainly before Vev enters too strongly. It can
then explain the practical desire: a small embedded native package that keeps
the important shape intact. DataScript, Datalevin, and Day of Datomic /
MusicBrainz should be acknowledged as part of the path, but the deeper
open-source lineage deserves its own note.

Possible angles:

- why immutable database values change application code more than most database
  features do
- why embedded matters: adoption, tests, local tools, small applications, and
  ordinary deployment
- why Vev is Datomic-flavored without trying to become Datomic
- why DataScript and Datalevin are references, not just inspirations
- why the first durable shape can be simple if the semantic center is right
- why this is a companion to the existing Datomic/Vev draft, not a replacement

Concrete source notes:

- `../vev/.worktrees/codex-item-vev-datalog/README.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/thesis.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/design-principles.md`
- existing blog draft: `content/posts/datomic-ideas-in-a-native-package.md`
- Vev README acknowledgements for DataScript, Datalevin, and Day of Datomic /
  MusicBrainz

Open questions for the actual post:

- How much overlap with the existing Datomic/Vev draft is acceptable?
- Should it name the non-goals early: not SQL, not a server first, not a
  Datomic clone?
- How much Datomic praise belongs here versus in a separate setup post?
