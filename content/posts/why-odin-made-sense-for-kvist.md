---
date: 2026-07-10T10:50:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Why Odin Made Sense for Kvist"
---

Idea note.

This should explain why Kvist targets Odin instead of starting from C, LLVM, or
a custom backend. Odin already has many of the traits I wanted the generated
program to keep: fast builds, explicit memory, simple tooling, readable source,
direct foreign and vendor package use, useful core libraries, and a practical
attitude toward systems programming.

There is also a philosophical fit. Odin feels allergic to unnecessary ceremony
in a way that overlaps with what I like in Clojure. The languages look very
different, but both value directness in their own domains. Kvist is the attempt
to put a Lisp-shaped, macro-friendly source surface over Odin's concrete native
model without losing the boring strengths that made Odin attractive in the
first place.

Possible angles:

- why targeting a readable systems language is different from targeting an
  opaque backend first
- how Odin gives Kvist a practical base for checking, building, running, and
  interop
- why fast builds and simple tooling matter for language experimentation
- why avoiding a heavy package-manager story is part of the appeal
- where Kvist should drop down to ordinary Odin instead of abstracting over it

Concrete source notes:

- `../kvist/.worktrees/codex-core-bootstrap-plan/README.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/TOOLING.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/PACKAGES.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/CORE-BOOTSTRAP.md`

Open questions for the actual post:

- How much should this assume the reader already knows Odin?
- Should it include examples of mixed `.kvist` and `.odin` packages?
- How candid should it be about the tradeoff of inheriting Odin's constraints?
