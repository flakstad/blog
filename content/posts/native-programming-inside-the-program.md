---
date: 2026-07-10T09:20:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Native Programming Inside the Program"
---

Idea note.

This should be the live-development post for Kvist. The interesting part is not
"hot reload is cool" in the abstract. It is the old Lisp habit of working close
to a running program, translated into a native setting where memory layout,
state ownership, ABI compatibility, and safe swap points still matter.

Kvist has two loops that should be explained together. Scratch evaluation is
for asking what one form does in the context of a real file. Resident reload is
for keeping a native process alive while swapping code at explicit checkpoints.
Neither one makes the program magical. The program still has to cooperate.
State layout changes can be rejected. Reload should happen between request
cycles, frames, jobs, or other safe outer boundaries.

The best opening situation is probably a simulation, editor, UI, or other tool
that has been moved into a deep state. Restarting the process does not just cost
seconds; it costs the path back to the state where the interesting behavior
exists. Olive belongs in the lineage here as an attempt to bring a REPL-like
workflow to Odin. Kvist adds Lisp-shaped source forms, scratch evaluation,
macro expansion, and generated-output inspection to that same native
development pressure.

Possible angles:

- "REPL-like" does not have to mean mutating a running dynamic image
- why scratch eval is useful even when the final program is compiled
- why explicit `reload.checkpoint!` is a feature, not just a limitation
- how source maps, macro expansion, generated Odin, and eval fit the same loop
- why live development matters more when runtime state is expensive to rebuild
- why practical limits are part of the model: checkpoints, state layout, and
  reload boundaries should be visible

Concrete source notes:

- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/LIVE-DEVELOPMENT.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/TOOLING.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/experimental/LIVE-DEVELOPMENT.md`

Open questions for the actual post:

- What specific UI/tool state would make the pain concrete without needing a
  long setup?
- How candid should the post be about current reload limits?
