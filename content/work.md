---
title: "Selected work"
type: "page"
eyebrow: "Experience"
lede: "More than ten years of hands-on software development across early-stage products, applied research, financial software, and independent products."
description: "Selected product-engineering work by Andreas Flakstad across Breyta, Kari, DNV Research, and EVRY mobile banking."
---

## Breyta

I joined Breyta as its first employee and later became one of two lead engineers. Over roughly four and a half years, I worked across product development, frontend, backend, architecture, infrastructure, integrations and developer tooling. Breyta went through four substantially different product generations during that time, with broad engineering responsibility in a small team.

### Product-data CRM and Data Activation

The original product explored a product-data-first CRM for product-led companies. Instead of treating usage as secondary context to sales records, it made product events first-class data in how commercial teams understood accounts. I worked across CRM and product-data modelling, custom table views, visual queries, reporting, kanban workflows, scoring, enrichment and Signals: derived indicators based on product behavior and custom queries.

The product later moved from replacing the CRM toward Data Activation beside it: product data from systems such as PostHog or Segment became scores, signals and query results synchronized into the customer’s existing CRM. The shift exposed a real tradeoff between controlling the system of record and making a new capability easier to adopt beside an incumbent. My work centered on the product capabilities and workflows around this model; the core data-sync engine was owned elsewhere.

### AI qualitative research

The next product helped researchers analyse interview video and transcripts. This was early in the current LLM wave, when it was uncertain whether frontier models could perform high-quality qualitative analysis reliably enough to support a product. I was central to making the analysis useful, grounded and dependable. Generated claims and themes linked back to the relevant transcript material, so evidence and citations were part of the architecture and trust model rather than decoration added afterwards.

The surrounding product combined video upload and streaming, editable transcripts, timestamp and playback state, automatic scrolling and highlighting, and navigation from generated analysis to the relevant source moment. It was AI product work and complex frontend engineering at the same time.

We used the then-standard embedding and vector-RAG pattern extensively, but for some research tasks an LLM agent formulating searches against Elasticsearch produced better retrieval behavior. It was a useful reminder to measure product behavior rather than keep a fashionable abstraction when conventional search worked better. I was the main owner of AI chat through this and the next two product generations, including its context, retrieval, streaming interaction and tool behavior.

### Continuous AI research

That technology later broadened into continuous research over user-provided material and the web. Users could maintain a knowledge base, talk with it through AI chat and receive recurring research reports, including by email—monitoring subjects they cared about but could not continuously consume themselves. I worked significantly on chat, web-search infrastructure, report generation and delivery while helping simplify and repackage the earlier capabilities.

This work also led me to question a common agent design. Exposing 20–30 or more tools creates schema and context overhead, consumes tokens and still limits composition. I experimented instead with a sandboxed Clojure environment where the agent could write small programs and compose operations itself. Clojure was an implementation choice; the important idea was code execution as a general computational interface, rather than anticipating every action as another tool. This early direction in our agent work helped shape Breyta’s next generation.

### Agent-first workflow platform

The product question for the final generation was: what should a workflow and application platform look like if AI agents are first-class programmers? The problem space resembled conventional workflow tools, but the initial model let people use an existing agent such as Codex or Claude Code to operate Breyta through the CLI I created. It was an agent-facing product interface, not merely developer convenience.

Workflows were expressed through Clojure and EDN and executed with SCI, a sandboxed Clojure interpreter. Code gave agents a compact way to compose logic, while a constrained declarative or JSON representation can be easier to inspect, validate and edit visually. The interesting question was whether the representation should change when an AI agent is the programmer. I do not think the answer is automatically code for every workflow.

The later first-party web chat ran Codex in an isolated environment and put the web experience around it, reusing and dogfooding the same CLI exposed externally. My contribution centered on the web application, AI chat, CLI and surrounding product integration. The workflow runtime itself sat outside my main area of ownership.

The platform also expanded toward reusable apps and a marketplace. Agents should not regenerate every solution from scratch: they could discover a known-working workflow, copy it and adjust it to a new context, while users could potentially publish and sell reusable apps. The aim was to make reuse cheaper as well as creation, though the right boundary between generated code, reusable components and declarative structure remained open.

<blockquote class="testimonial">
  <p>“Andreas is an unusually strong full-stack product engineer. He combines technical depth with excellent product judgment and a strong instinct for how complex systems should work for users.”</p>
  <footer>— Vegard Steen, Lead Software Engineer &amp; Co-founder at Breyta</footer>
</blockquote>

## Kari

Kari is an AI receptionist I built for Norwegian businesses and the source of roughly a year of production voice-AI experience. Building it end to end has spanned product decisions, realtime model behavior, telephony, backend systems, integrations, deployment and operational workflows.

A convincing voice demo is easy to assemble. Real callers turn it into a much larger state and reliability problem: audio quality varies, people interrupt or go silent, dialects and languages change, and requests are ambiguous. Many important failure modes only became visible through real calls.

Prompts are necessary, but insufficient. Reliable operation has required explicit conversational modes, purpose-built tools, deterministic logic alongside the model, deliberate formatting of dates and other spoken values, sidecar handling of sensitive input such as Norwegian national identity numbers, audio checks, stall detection and nudging, operational monitoring, and robust state around tool calls. Edge cases from real calls become explicit behavior and checks.

Appointment booking, changes and cancellations make the distinction especially clear, including in healthcare-related use cases. The conversation cannot merely sound plausible; intent, identity, dates and availability must become correct operational state transitions. The apparent problem is open-ended conversation. The production problem is making that input drive bounded, reliable operations.

## DNV Research

For roughly three years I worked in DNV’s research organisation on web products around FMU-based co-simulation, including Simulation Trust Center and some work related to Open Simulation Platform. My responsibility was mainly the applications surrounding the simulation technology, not the core simulation engine. The work sat at the boundary between complex industrial simulation technology and applications people could use.

## Mobile banking at EVRY

My first job after university was roughly three years building and operating 23 iOS mobile banking applications with more than 200,000 users in aggregate. A little over a year after joining, I became System Manager for iOS Mobile Banking, with technical and system responsibility rather than personnel management. I worked across iOS development, operations and production releases. It gave me unusually early responsibility for software with real users and little tolerance for careless releases.

<p class="page-actions"><a href="/consulting/">Work with me →</a></p>
