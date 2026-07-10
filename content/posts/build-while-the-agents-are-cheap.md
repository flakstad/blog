---
date: 2026-07-10T10:20:00+02:00
draft: true
params:
    author: Andreas Flakstad
title: "Build While the Agents Are Cheap"
---

Idea note.

This should be a pragmatic, candid, personal-log post about building during the
current LLM subsidy window. Not AI hype, and not a prediction essay. More like:
right now, a solo builder can point a lot of cheap agent time at difficult,
messy work. That may not stay true. If there are tools I want to exist later, it
may be rational to build as much of the foundation as possible while this kind
of leverage is available.

The important argument is not that LLMs make the resulting tools dependent on
LLMs. It is almost the opposite. Use temporary cheap leverage to build durable
tools that can still be useful when the economics change, the models get more
expensive, or the subsidy disappears. Kvist and Vev fit this because both are
foundation projects: if they work, they become ordinary software that does not
need an agent sitting beside every user.

Possible angles:

- LLMs changed what I can attempt alone, especially across compiler, database,
  docs, tests, wrappers, and benchmarks
- subsidized agent time is a strange resource, and ignoring it may be wasteful
- the right target for the leverage is durable infrastructure, not disposable
  glue
- cheap agents do not remove taste, judgment, verification, or responsibility
- the risk that this working style gets more expensive later is itself a reason
  to build now

Concrete source notes:

- current Kvist and Vev worktrees as examples of scope that would have been much
  harder without LLM-assisted iteration
- Vev C ABI and host wrappers as examples of breadth that agents made more
  feasible
- DataScript/Datalevin/MusicBrainz lineage note as the other half: LLMs help,
  but open-source reference work also makes the attempt possible

Open questions for the actual post:

- How much should this disclose about the actual agent workflow?
- Should it mention cost directly, or stay with the broader subsidy/timing
  argument?
- How do I avoid sounding like I am outsourcing the thinking, when the real
  point is compounding judgment with cheap mechanical help?
