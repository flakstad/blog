---
date: 2026-07-10T10:10:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Standing on DataScript, Datalevin, and MusicBrainz"
---

Idea note.

This should be the open-source lineage and gratitude post. Vev would not be
attemptable without the existing work around Datomic-shaped databases,
especially DataScript, Datalevin, and the Day of Datomic / MusicBrainz
materials. That should be said plainly.

DataScript gives Vev a semantic compatibility target. It is not just
inspiration; its behavior, tests, and shape help define what "Datomic-like
enough to be useful" can mean for an embedded implementation. Datalevin gives
implementation and benchmark reference points, especially for the path from
in-memory semantics toward durable embedded storage and serious query
performance. Day of Datomic and the MusicBrainz material give a workload that
feels like a real tutorial and a real pressure test instead of a made-up demo.

Possible angles:

- why open source changes what a small project can responsibly attempt
- the difference between copying an idea and studying a working implementation
- why compatibility targets, benchmarks, and tutorial workloads are all
  different kinds of help
- why license care matters, including EPL compatibility and retained upstream
  notices when material is copied or adapted
- why gratitude belongs in technical writing, not only in README footnotes

Concrete source notes:

- `../vev/.worktrees/codex-item-vev-datalog/README.md` acknowledgements
- `../vev/.worktrees/codex-item-vev-datalog/docs/datascript-compat.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/datascript-test-matrix.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/musicbrainz.md`
- `../vev/.worktrees/codex-item-vev-datalog/docs/benchmarks.md`

Open questions for the actual post:

- Should this be mostly gratitude, or also a practical account of how the
  references guide implementation?
- How much licensing detail is useful before it becomes legal housekeeping?
- Should the post include concrete examples of tests or queries that came from
  those references?
