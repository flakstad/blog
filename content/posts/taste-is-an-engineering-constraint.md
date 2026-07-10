---
date: 2026-07-10T10:30:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Taste Is an Engineering Constraint"
---

Idea note.

This should be the source-aesthetics post. The argument is simple but easy to
dismiss: taste matters because reading and changing code is real work. A syntax,
set of names, and source shape that I want to live in every day is not just
decoration. It affects how quickly I notice structure, how willing I am to
reshape code, and how much friction accumulates while working.

Kvist is partly about that. Clojure-like syntax and names feel good to me. The
uniformity of forms matters. The way data literals, macros, threading, and small
expressions compose matters. None of that replaces performance, ownership, or
deployment concerns, but it belongs beside them instead of being apologized for.

Possible angles:

- most programming is reading and changing existing code
- aesthetic preference can be an honest constraint when the author will maintain
  the system for years
- Clojure syntax is not only familiarity; it supports a way of thinking about
  source as data
- why "I like reading this" can be a practical reason to build a language
- where taste must still be checked by generated output, tests, and real
  programs

Concrete source notes:

- `../kvist/.worktrees/codex-core-bootstrap-plan/README.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/LANGUAGE.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/CORE-BOOTSTRAP.md`

Open questions for the actual post:

- How personal should this be before it loses usefulness for other readers?
- Should it mention specific disliked source shapes, or keep the post positive?
- What example best shows "source I want to read" without becoming a style
  argument?
