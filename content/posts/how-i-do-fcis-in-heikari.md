---
date: 2026-07-10T11:10:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "How I Do FC/IS in HeiKari"
---

Idea note.

This should be the dedicated Functional Core / Imperative Shell post for
HeiKari. Do not make the Datomic post carry the whole architecture. This one can
explain the actual shape in the codebase: command envelopes, core planners,
tuple effects, shell adapters, and centralized effect execution.

The useful starting point is that FC/IS sounds simple until a real web
application has forms, sessions, Datomic, SSE, email, SMS, queues, redirects,
logging, and several APIs. HeiKari has been moving toward a shape where the core
decides and the shell executes.

Possible angles:

- request adapters normalize incoming data into command envelopes
- `kari.core.*` planners make domain decisions and return `{:effects [...]}` as
  explicit tuple data
- `kari.sh.*` code executes DB, HTTP, SSE, SMS, email, queue, and runtime
  effects
- Datomic fits the pattern because the core can receive a stable `db` value
  while the shell owns `conn` and transactions
- effect tuples are intentionally plain data, not small wrapper objects
- logging is a deliberate impurity exception in the current rollout
- realtime Twilio/OpenAI code is intentionally not forced through this shape yet

Concrete source notes:

- `../kari/kari/docs/FCIS_PATTERNS.md`
- `../kari/kari/docs/FCIS_NON_REALTIME_ROLLOUT.md`
- `../kari/kari/libs/fcis/src/kari/fcis/`
- `../kari/kari/src/kari/sh/command_dispatch.clj`
- `../kari/kari/src/kari/sh/effects.clj`
- `../kari/kari/src/kari/core/account_phone.clj`
- `../kari/kari/src/kari/core/admin.clj`

Open questions for the actual post:

- Should this start from one concrete form submission, such as adding a phone
  number or enabling a feature?
- How much implementation detail is useful before it becomes internal docs?
- Should the post mention the parts that are still transitional and messy?
- Should this be published before or after the Datomic/FCIS post?
