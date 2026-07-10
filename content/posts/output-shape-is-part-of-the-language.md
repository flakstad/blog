---
date: 2026-07-10T10:40:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Output Shape Is Part of the Language"
---

Idea note.

This should be the native-output post. The argument is that binary size, memory
use, startup time, deployment shape, and runtime assumptions are not afterthought
details. They change what a language feels suitable for. A language that always
drags a large runtime, garbage collector, or complicated packaging story into
the room is making a product decision, even when the source language is nice.

Kvist exists partly because I want Clojure-like source leverage without giving
up the ordinary native shape: small binaries, explicit memory, no hidden lazy
sequence runtime, no VM requirement, and generated code that can be inspected.
The source should feel high-leverage, but the output should still feel like a
normal native program.

Possible angles:

- deployment shape affects which tools feel reasonable to build
- memory and binary size are part of the user experience for command-line tools,
  embedded libraries, and small services
- no hidden runtime is not only ideology; it keeps costs and behavior visible
- readable generated Odin is a contract with the implementation
- why this connects to earlier work shrinking native images

Concrete source notes:

- `../kvist/.worktrees/codex-core-bootstrap-plan/README.md`
- `../kvist/.worktrees/codex-core-bootstrap-plan/docs/FALSE-FRIENDS.md`
- existing blog post: `content/posts/native-image-308m-to-41m.md`

Open questions for the actual post:

- Should it compare with Clojure/GraalVM explicitly or keep the contrast softer?
- What concrete binary-size or memory story is fair to include for Kvist today?
- Should this be mostly about language design or about shipping software?
