---
title: "Work with me"
type: "page"
eyebrow: "Consulting"
lede: "I help software companies define and build difficult products. I work hands-on from early product decisions and architecture through implementation and production."
description: "Senior product-engineering consulting for difficult software products, architecture, reliability, production AI agents, and voice AI."
---

I’m most useful when the problem is important, the requirements are incomplete, and the technical choices still matter. I help work out what to build, choose a sound approach, and implement it.

## Situations where I’m useful

- Building an important new product or difficult feature.
- Figuring out what to build when the product and technical choices are still unclear.
- Taking a prototype or early product into reliable production.
- Getting a stalled product or subsystem moving again.
- Planning and implementing a rewrite, migration or major technical change.
- Improving the reliability and testing of a critical system.

## AI and agent systems

I have deep recent experience building LLM and agent products for production. The work includes evidence-backed analysis, citations and provenance, retrieval, AI chat, asynchronous execution, tools, sandboxed code execution, agent workflows, and CLIs designed for coding agents. I have worked across the whole product, from streaming interfaces to backend execution and reliability. This is one specialization within my broader product-engineering work.

## Voice AI

A convincing voice-agent demo is easy to build. A reliable production system is much harder. Real callers vary in dialect, language, audio quality and behavior. They interrupt, talk over the agent, go silent and make ambiguous requests. Tool failures add more ways for the conversation to get stuck.

I have been building and operating Kari since March 2025. It keeps evolving as new customers and callers expose cases that were hard to predict beforehand. Prompts are necessary but not enough. Reliability has required explicit conversational modes and state, purpose-built tools, and deterministic code around operations the model should not improvise. Dates and other values are formatted before the model reads them aloud. Sensitive structured input, including Norwegian national identity numbers, is handled separately. Audio checks, stall detection, nudging and careful tool state help keep calls moving.

Appointment booking, changes and cancellations make the risk concrete. Through collaboration with Legelisten.no, Kari is also being developed for healthcare workflows. The system must handle identity, dates, availability and actions correctly, not merely sound plausible. I’m available for serious production voice-AI work where this experience is useful, but voice is not my only consulting focus.

## Correctness and testing

I think about testability while choosing the architecture, not only after the code is written. Where it fits, I use a Functional Core / Imperative Shell style: important domain behavior stays in a deterministic core, while the shell handles I/O, networks, persistence and other side effects.

I prefer tests that exercise real system behavior. Unit tests are useful, but I rely heavily on integration tests because many failures happen between components. For large input or state spaces, I also use property-based, generative and stateful testing to check invariants that hand-picked examples miss. Differential tests are useful when a rewrite or migration can be compared with an existing implementation.

AI systems need another layer because the model is part of the production behavior. For Kari I developed **scenario tests** defined as data in a small DSL. They replay conversations through the real production path against the actual models, prompts, tools and orchestration. These tests are slower and more expensive, so they run periodically or after relevant changes rather than on every edit. They catch model regressions that deterministic tests cannot, such as a small prompt change breaking an unrelated behavior.

## How I work

I can take ownership of a bounded implementation, work alongside an existing team, or provide senior engineering capacity for a period. The right setup depends on the work and how much is already known.

When the problem itself is still unclear, a **Technical Product Assessment** can be an optional way to start. Over 5–8 working days, I inspect the product, code and available evidence. I investigate the main risks and build focused experiments, tests or implementation spikes where they provide better answers.

The result is concrete findings and a realistic next implementation step. This is not a workshop or a slide-deck exercise. Implementation can continue as a fixed-price milestone, reserved weekly capacity, or time-based work where uncertainty remains.

<blockquote class="testimonial">
  <p>“He works incredibly efficiently and consistently delivers. He’s patient, speaks his mind, and takes a pragmatic approach to engineering, always looking for the clearest path forward.”</p>
  <footer>— Chris Moen, CEO &amp; Co-founder, Breyta</footer>
</blockquote>

## Talk to me

If you have an important software product that needs experienced hands-on help, send a short note about what you are building and where that help would be useful.

<p class="page-actions"><a class="primary-link" href="mailto:hey@andreasflakstad.no">hey@andreasflakstad.no</a></p>
