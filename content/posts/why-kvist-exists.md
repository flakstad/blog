---
date: 2026-07-10T09:00:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Why Kvist Exists"
---

Idea note.

This should be the plain motivation post for Kvist. Not a feature tour first,
and not a language manifesto first. More like: I wanted the parts of Clojure
that make programs pleasant to shape and change, but I also wanted the output to
be small, native, explicit, and close to the machine.

The useful tension is that none of the existing choices quite sit in that spot.
Clojure gives the expression-oriented source, macros, data-shaped code, and a
good working rhythm, but it brings a runtime and deployment shape that does not
fit every systems program. Odin has a philosophy I like: fast builds, simple
tooling, explicit memory, readable code, no heavy package-manager story, and
native binaries that feel like ordinary programs. Kvist is the attempt to put a
Lisp-shaped source language on top of that execution model without pretending
the execution model changed.

This post should carry several claims at once. There is a native Lisp gap.
Taste and readability are real constraints, because most programming time is
spent reading, changing, and living with code. And Kvist is not meant to replace
Odin's model with a hidden runtime; it is meant to keep that model and add more
source leverage.

Possible angles:

- the native Lisp gap: expression-oriented code, macros, and REPL-like feedback
  for programs that still build to native binaries
- aesthetics as a real engineering force; it matters whether I like reading the
  code every day
- why Clojure syntax and naming keep pulling me back
- why binary size, memory use, and deployment shape are not secondary details
- why Kvist should stay honest about ownership, allocation, mutation, and
  cleanup
- how much of the motivation is personal taste, and why that is still an
  engineering reason
- why the right caveat is calm: Kvist is alpha, personal, and still moving, but
  the problem it points at is real

Concrete source notes:

- `../kvist/.worktrees/codex-core-bootstrap-plan/README.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/LANGUAGE.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/FALSE-FRIENDS.md`

Open questions for the actual post:

- How much should this mention Odin by name before the reader understands Kvist
  on its own terms?
- Should the post start from frustration with existing tools, or from the
  positive shape I wanted?
- Is this mostly about language design, or mostly about the day-to-day feeling
  of working in a codebase?
- How much should this hub post defer to separate notes on aesthetics, native
  output, and Odin's philosophy?
