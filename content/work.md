---
title: "Selected work"
type: "page"
eyebrow: "Experience"
lede: "More than ten years of hands-on software development across early-stage products, applied research, financial software, and independent products."
description: "Selected product-engineering work by Andreas Flakstad across Breyta, Kari, DNV Research, and EVRY mobile banking."
---

## Breyta

I joined Breyta as its first employee and later became one of two lead engineers. Over roughly four and a half years, I worked across product, frontend, backend, architecture, infrastructure, integrations and developer tooling. During that time, Breyta went through four substantially different product generations.

### Product-data CRM and Data Activation

The first product was a product-data-first CRM for product-led companies. Product usage was first-class customer data, not a secondary note beside sales records. I worked on the data model, custom table views, visual queries, reports, kanban workflows, scoring, enrichment and Signals: indicators derived from product behavior and custom queries.

We later moved from replacing the CRM to Data Activation beside it. Product data from PostHog or Segment became scores, signals and query results in the customer’s existing CRM. Replacing the system of record gave us more control. Integrating with it made the product easier to adopt. I worked mainly on the product model and workflows around this system. The core data-sync engine was not my main area.

### AI qualitative research

The next product helped researchers analyse interview video and transcripts. This was early in the current LLM wave. We did not yet know whether frontier models could produce useful, reliable qualitative analysis. I was central to making the results grounded and dependable. Every generated claim or theme could link back to its supporting transcript evidence.

The product combined video upload and streaming, editable transcripts, playback state, timestamps, automatic scrolling and highlighting. A researcher could move from a generated claim to the exact supporting point in the transcript and recording. This required complex frontend work as well as AI engineering.

We used embeddings and vector RAG extensively. For some research tasks, however, an LLM agent that formulated searches against Elasticsearch found better evidence. This was not a universal result. It was a reason to test the fashionable approach against what worked for the product. I was the main owner of AI chat through this and the next two generations, including context, retrieval, streaming and tool behavior.

### Continuous AI research

The third product expanded this work beyond user research. Users could combine their own material with web research, talk with the knowledge base through AI chat, and receive recurring reports by email. I worked on chat, web-search infrastructure, report generation and delivery, while simplifying and reusing parts of the previous product.

As the agent gained 20–30 or more tools, their schemas consumed more context and tokens. The tools also remained awkward to combine. Instead of adding another tool for every operation, I experimented with letting the agent write small Clojure programs in a sandbox and combine simpler building blocks itself. The language was an implementation choice. The idea was to use code execution as a more general agent interface instead of adding another specialized tool for every operation. This idea led into the next product.

### Agent-first workflow platform

The question behind the final generation was: what should a workflow platform look like if AI agents are first-class programmers? The initial model was for users to bring an existing coding agent such as Codex or Claude Code and let it operate Breyta through the CLI I created. The CLI was part of the product interface, not just developer tooling.

Workflows used Clojure and EDN and ran inside SCI, a sandboxed Clojure interpreter. Code let agents express and combine logic compactly. Declarative or JSON definitions can be easier to inspect, validate and edit visually. It remains an open question whether code is always the better representation when an agent is the programmer.

The later web chat ran Codex in an isolated environment and wrapped a web interface around it. It reused the same CLI that external agents used. I mainly built the web application, AI chat, CLI and the code connecting these parts. The workflow runtime was outside my main area of ownership.

The platform also expanded toward reusable apps and a marketplace. An agent should not generate every solution from scratch. It could find a working workflow, copy it and adjust it to a new context. Users could potentially publish and sell those workflows and apps. The open question was how generated code, reusable components and declarative structure should fit together.

<blockquote class="testimonial">
  <p>“Andreas is an unusually strong full-stack product engineer. He combines technical depth with excellent product judgment and a strong instinct for how complex systems should work for users.”</p>
  <footer>— Vegard Steen, Lead Software Engineer &amp; Co-founder at Breyta</footer>
</blockquote>

## Kari

Kari is an AI receptionist for Norwegian businesses. I have been building and operating it since March 2025. The work spans product decisions, realtime model behavior, telephony, backend systems, integrations, deployment and operations.

A convincing voice demo is easy to assemble. Real callers create a much larger state and reliability problem. Audio quality varies. People interrupt, talk over the agent or go silent. Dialects and languages change, and requests are often ambiguous. New customers and callers continue to expose failures that were hard to predict in advance.

Prompts are necessary, but not enough. Reliable calls require explicit modes and state, purpose-built tools, and deterministic code around decisions the model should not improvise. Dates are formatted before the model reads them aloud. Sensitive input such as Norwegian national identity numbers is handled separately. Audio checks, stall detection, nudging and careful tool state keep the conversation moving.

Important failures also become **scenario tests**: conversations defined as data and replayed through the real production path against the actual models. They are too slow and expensive to run constantly, but they let me replay a growing set of real cases and catch regressions when prompts, models or orchestration change.

Appointment booking, changes and cancellations make the distinction clear. I also work with Legelisten.no on uses of Kari in the healthcare sector. The conversation cannot merely sound plausible. Intent, identity, dates and availability must lead to the correct action. The apparent problem is open-ended conversation. The production problem is making that input drive bounded, reliable operations.

## DNV Research

For roughly three years I worked in DNV Research on web products around FMU-based co-simulation, including Simulation Trust Center and some work related to Open Simulation Platform. I mainly built applications around the simulation technology, not the core engine. Much of the job was turning complex research technology into software people could use.

## Mobile banking at EVRY

My first job after university was roughly three years building and operating 23 iOS mobile-banking applications with more than 200,000 users in total. I worked on iOS development, DevOps and production releases. A little over a year after joining, I became System Manager for iOS Mobile Banking. This was technical responsibility, not people management. It gave me early responsibility for software where reliability and careful releases mattered.

<p class="page-actions"><a href="/consulting/">Work with me →</a></p>
