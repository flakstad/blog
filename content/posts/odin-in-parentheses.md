---
date: 2026-07-10T09:10:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Odin in Parentheses"
---

Idea note.

This post should explain the line Kvist is trying to walk, mostly for Clojure
readers. Kvist looks like a Lisp, but it should not trick you into thinking you
are writing a garbage-collected dynamic language. The generated program is still
Odin-shaped. Values copy. Pointers mean something. Dynamic arrays and maps own
storage. Cleanup is part of the code.

The phrase "Odin in parentheses" is useful, but it can also be misleading if it
sounds like a thin syntax joke. The point is deeper than replacing braces with
parens. Uniform forms make code easier to transform. Macros become possible in
a way that fits the source. Data shaping can be written once and lowered to
direct loops. But the result should still be readable Odin, not a hidden runtime
wearing native clothes.

The concrete example should probably be owned arrays. A vector literal and
`arr.map` may look familiar to a Clojure programmer, but in Kvist they produce
owned dynamic storage. The post should show the pleasant source shape and then
show the cleanup expectation directly, ideally with one small generated Odin
excerpt as evidence rather than as the whole structure.

Possible angles:

- why Kvist keeps Odin's execution model visible instead of smoothing it away
- why false friends matter for Clojure programmers reading Kvist
- what changes when vector literals are owned arrays, not persistent vectors
- why package-qualified calls like `arr.map` should make ownership and eager
  behavior visible
- how readable generated Odin acts as a pressure test for language features
- why `:defer` is not incidental syntax but part of making ownership livable

Concrete source notes:

- `../kvist/.worktrees/codex-core-bootstrap-plan/README.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/FALSE-FRIENDS.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/FUNCTIONAL-TRANSFORMS.md`

Open questions for the actual post:

- What is the smallest generated Odin excerpt that proves the point without
  turning the post into compiler documentation?
- Which example best shows the honesty of the model without turning the post
  into reference documentation?
