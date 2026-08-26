# Breyta product history

Status: PROVISIONAL — repository archaeology plus interview rounds. Updated 2026-08-26.

## Method and repository scope

- Repositories inspected: `breyta`, `breyta-frontend-mono`, `breyta-cli`.
- Historical reconstruction currently follows local `main`; selected searches also used `--all` to detect branch/tag-only evidence.
- Local `breyta/main` was 13 commits behind `origin/main`; local `breyta-cli/main` was 35 commits behind. Historical conclusions below do not depend on those recent missing commits.
- Dirty shared checkouts were treated as read-only. No historical worktrees have been created yet.
- Dates describe code appearing in repository history, not launch dates or customer availability.

## Provisional chronology

### Breyta #1 — product-data-first CRM / data activation

Approximate repository range: 2021-09-02 to 2024-04-07. The end is a technical boundary, not yet a confirmed product/launch boundary.

Product thesis and user concepts:

- Began with workspace, user/CLI, HubSpot and Segment data, account/person models, signal lists and scoring.
- Grew into integrations, custom objects/fields, process boards, reporting/widgets, signals and activation-oriented product surfaces.
- Backend architecture included GraphQL plus multiple data/sync/job/worker libraries and bases. This establishes system presence, not Andreas's ownership of the core sync architecture.

Transition evidence:

- First backend commit clearly belonging to AI qualitative research: `39b37b46f6` (2024-04-08), “transcript query: query openai gpt through GQL”.
- Immediately preceding backend snapshot: `34e90c15a0` (2024-04-04), “video-upload: mutation to build signed url to upload video”. Video upload itself may be transition work rather than pure #1.
- First frontend AI application commit: `b29fa4a65` (2024-05-03), “Breyta AI copy”. It copied substantial CRM-era UI alongside a new `ResearchTrack`, so the pivot was not a clean-slate boundary.

Retained/discarded:

- Retained initially: existing GraphQL service, workspace/auth/integration concepts, and a large copied frontend component base.
- Gradual discard is visible later: many old backend bases remained through 2024, while the June 2025 tree had reduced active bases to `events-worker`, `graphql-api`, and `template-base`; many legacy libraries had also disappeared.
- Interview (2026-08-26): the company explicitly decided to explore other products/services because the CRM/data-activation product had customers but was not growing quickly enough for a VC-backed company. The team chose qualitative research partly because it had substantial user-testing experience from an earlier startup. Reuse of the existing application/workspace substrate was deliberate.

Ownership evidence:

- Andreas-authored commits are dense in reporting, product/web integration and later research UI/API work.
- No current evidence supports attributing the original sync engine to Andreas.

Uncertainties:

- Interview confirms #2 started in 2024. This now agrees with the April 2024 repository boundary.
- The best #1 snapshot may need to move earlier than April 2024 to avoid transition-era video work.

### Breyta #2 — AI qualitative research

Approximate repository range: 2024-04-08 to mid-2025. Product availability dates need interview confirmation.

Product thesis and user concepts:

- Upload audio/video/text research material, transcribe it, define research context/questions, generate findings/themes/reports, inspect evidence, and chat over files/projects.
- Frontend evidence includes transcripts, media viewer, findings, projects, citations/references, file panels and synchronized playback.

Relevant architecture:

- Research commands and queries lived primarily under `bases/graphql-api/.../research_track/`.
- Asynchronous generation lived in `events-worker` workers for findings/themes and later cross-finding analysis.
- Firestore represented assets, transcripts, projects/reports, conversations and generated material.
- LLM provider support moved into `libraries/llm`; first addition was `a16cd3debb` (2024-05-07).
- Retrieval experiments included OpenAI vector stores (`c049b8b1eb`, 2024-05-23), embeddings (`32636f4957`, 2024-06-10), Elasticsearch file search exposed as an LLM tool (`1310d56715`, 2024-10-03), later Elasticsearch `semantic_text` (`71a3803d51`, 2025-05-19), and an explicit semantic+keyword query (`9d8f55af52`, 2025-05-21).
- Evidence used structured reference tags carrying file identity and transcript timestamps. The UI opened the source, highlighted the cited section/quote and sought media playback to the timestamp.
- The core analysis pipeline was hierarchical rather than a single corpus-sized prompt. By April 2024 it generated findings independently per selected transcript and only summarized after all transcripts had results. The June 2024 worker rewrite made that dependency explicit. In December the intermediate representation evolved through structured nuggets/findings/themes.
- January 2025 sharpened the contract: answer a user prompt against each file independently, retain verbatim citations/timestamps, then synthesize only across the resulting findings. The synthesis referenced compact temporary finding IDs, which the backend remapped to persistent finding references understood by the UI. This preserved a navigable chain from synthesis to per-file finding to original evidence while keeping the cross-file prompt smaller.
- Interview establishes the missing predecessor: the first multi-file architecture placed all selected files in one large prompt. It failed to scale in file count and produced more hallucinations and less accurate references. Current repository history begins with a single-transcript prototype and already shows per-transcript findings within the first production-oriented weeks; the discarded combined-corpus implementation has not yet been found in Git.
- The December nuggets → findings → themes hierarchy worked, but was replaced because three generation levels did not justify their additional model cost and analysis latency. The findings → synthesis design was both a simplification and an evolution of the same decomposition principle.

Evidence/citation evolution:

- Backend on-demand evidence generation: `1f818c02fc` (2024-04-20).
- Frontend evidence feature: `19ebfb0a5` (2024-05-16).
- Media streaming and playback navigation: `d792179836`, `8c1aeccd3` and `b9085e98a` (2024-08-27–29).
- Global evidence context arrived in `0e2601488c` (2024-09-20); chat references became clickable in `3dd515039a` (2024-10-18), followed by URL-state evidence modals.
- Backend repair `d2626b4c37` (2024-10-29) handled a known malformed generated timestamp form and removed invalid timestamps. `728abee785` (2024-11-26) inserted missing whitespace after model output had caused the application to crash while parsing/rendering a reference.
- Findings became more structured in `caf72ff648` (2024-12-05). Citation selection, scrolling/highlighting, URL copying and inline reference editing continued to evolve through March 2025.
- These repairs validate and transport the reference contract; no semantic citation/entailment verifier has been found.
- Interview (2026-08-26): customers mainly analyzed video interviews. Inspecting sources was a normal, essential part of using both polished synthesis documents and chat. Chat could operate across the workspace knowledge base or within one project; a reference opened the file, highlighted/scrolled to the transcript excerpt and sought audio/video to the precise timestamp.

Retained/discarded:

- Retained: workspace/auth/integration foundation and initially much of the #1 web application.
- Rebuilt: primary domain centered on assets, transcripts, projects, findings and conversations rather than CRM objects/signals.
- Old CRM backend subsystems were removed gradually rather than in one pivot commit.

Ownership evidence:

- Andreas authored much of the visible evidence/citation UI, transcript interaction, chat, early RAG/search work, and research API/product integration.
- Repository history also strongly supports Andreas ownership of the evolving per-file-finding/cross-file-synthesis product mechanism: the initial April text-finding summary work and the January 2025 user-prompt-specific findings, synthesis prompt and compact-ID reference remapping are Andreas-authored. Interview (2026-08-26) confirms he devised this approach and regarded it as essential to quality and reliability.
- This does not imply sole ownership of research generation, transcription or backend infrastructure.

Representative mature snapshot candidates:

- Backend `608f22e486` (2025-06-25).
- Frontend `2fe3ec85e` (2025-06-27).
- Rationale: mature projects/chat/evidence/search implementation immediately before clear continuous-research/agent product work becomes dominant.

Uncertainties:

- Exact #2 → #3 boundary is gradual.
- Interview (2026-08-26): this was a qualitative observation, not a measured benchmark. Embeddings alone produced too many poor results. Lexical/query-string search was better for precision; embeddings remained useful for cross-language and broad potentially relevant matches. The implementation ended with a hybrid. No evaluation artifact has been found.

### Breyta #3 — continuous AI research

Approximate repository range: mid-2025 to late November/December 2025, overlapping #4 incubation.

Product thesis and user concepts:

- Recurring “agents”/data subscriptions monitored or received material, generated memos/deep research reports, supported subscribers/email and accumulated reports over time.
- Evidence includes `data_subscription.clj`, Temporal subscription schedules, `agent_report.clj`, public agent reports/previews, web-monitor behavior and frontend agent/subscription routes.
- Interview context (2026-08-26): the product change followed a reduction from six to three employees. The remaining team wanted to build something they needed and would use themselves rather than continue UX-oriented qualitative analysis; the CEO was personally interested in analyzing newsletters, websites and similar continuously changing material. The board also pressed for a product capable of VC-scale growth: #2 again had customers, but too few and with weak growth. Andreas considers this publishable, while exact wording and attribution should still be reviewed.

Relevant architecture:

- The first frontend “Subscribe to data” feature appeared behind a feature flag/mock surface in `78838e6f160` (2025-07-30). Backend CRUD followed in `f07fc5060ae` (2025-07-31).
- The first manual report generation in `a3c3a61bb4` (2025-08-04) reused the #2 project/report pipeline by creating a “shadow project”. It also created a separate subscription-report document and left a TODO noting that driving generation from both was unnecessary. `734961e6ef` (2025-08-12) removed that second collection and used the report project alone.
- Interview confirms this reuse was deliberate so subscriptions could participate in the existing project setup. The inherited orchestration crossed repository/runtime boundaries: a TypeScript Temporal worker in `breyta-frontend-mono/apps/workflow-worker` created Firestore `asyncRequests`; Clojure workers performed the LLM work and completed/signaled Temporal activities. The later clean-slate workflow was chosen because the older workflows had accumulated weaknesses and bugs; the team wanted to reimplement the behavior correctly in Clojure.
- A dedicated 830-line agent-report workflow arrived in `af094ee7e4` (2025-10-10), with Temporal schedules for daily/weekly/monthly cadence, overlap cancellation, catch-up behavior, pausing and manual triggers.
- The workflow selected source material by time range/data source, then moved through findings, synthesis, “what changed”, memo and delivery stages with explicit status/dependency guards.
- Data-subscription configuration included cadence, prompts/goals/context, data filters/sources, subscribers and recent reports.
- Subscriber memos, generated prompts, formatting, personalization and pending/done state were added through October; several source-filter/timestamp/no-data fixes show concrete pressure around temporal selection and delivery correctness.
- `af9621c666` (2025-11-03) stored completed reports as durable knowledge assets. `59c43fbde1` immediately excluded report-derived assets from automatic future source selection. The system retained outputs without allowing scheduled research to recursively analyze its own generated reports.
- Agentic spreadsheet analysis introduced isolated Python execution, with tool-call history stored alongside analysis.
- The pre-SCI shared chat tool catalogue visible at the selected snapshot has six named tools: `file_search`, `get_file`, `list_files`, `search_agent`, `add_project_questions`, `execute_python`. Four have shared registered handlers; two are dispatcher/product-level tools.
- Interview (2026-08-26): 20+ was the projected catalogue if the planned system expansion continued, not the observed count at the SCI decision point. SCI was explored before that growth was implemented.
- Contemporary architecture/blog documents were added to the backend repo in `c7d325e20c` (2025-12-10) and removed as obsolete in `6793b7f033` (2026-01-09). They preserve the team's intended narrative but repeatedly describe the counterfactual 20+ catalogue as if it had already been replaced; code and interview take precedence for the count.

Representative snapshot candidates:

- Backend `910750596e` (2025-11-10), immediately before SCI agent-chat begins.
- Frontend `874c13c999` (2025-11-10).
- Rationale: captures recurring agents/data subscriptions and Python analysis while avoiding the next day's code-execution agent-chat pivot.

Transition evidence toward #4:

- `48786f97a1` (2025-11-11), “init agent chat with sci”.
- `96d949d4d1` (2025-11-26), “Breyta flows”.
- These show overlapping incubations: SCI chat precedes the general flows runtime by about two weeks.

Ownership evidence:

- Andreas authored significant agent/chat/product/report integration and spreadsheet-analysis work.
- Andreas also authored much of the subscription adaptation in the old TypeScript workflow and the new Clojure `agent_report` workflow. This supports personal ownership of the rewrite/product integration, while the broader Temporal platform and later general flow runtime remain mixed ownership.
- Runtime/orchestration ownership remains mixed; do not attribute Temporal or the later flow runtime wholesale to Andreas.

Uncertainties:

- Earlier website copy in `../blog/content/work.md` stated that the agent “gained 20–30 or more tools”. Repository evidence plus interview now show that phrasing is historically too strong: there were six, with an anticipated path to 20+.
- Interview (2026-08-26): end-customer usage of the SCI chat may have been limited. Andreas remembers useful, unanticipated code composition but no concrete example; the implementation may be historically more important as an idea donor for #4 and the workflow engine than as a production-proven #3 capability.
- A private X/Grok feedback copy dates the earlier execute-clojure draft to 2025-11-25. Its token figures were counted/estimated and latency estimated, not benchmark results.
- It remains unclear whether the report-as-asset exclusion prevented an observed feedback/contamination problem or was a precaution designed before one occurred.
- Andreas has no recollection of the reason for that exclusion; do not construct a production feedback-loop incident from the adjacent commits.

### Breyta #4 — agent-first workflow/application platform

Approximate repository range: incubation from 2025-11-11; flows implementation from 2025-11-26; CLI from 2025-12-12; continuing through current code.

Product thesis and user concepts:

- Workflows expressed as inspectable Clojure/EDN programs and executed through SCI-backed boundaries.
- CLI/control surface for flows, runs, triggers, resources, connections, installations and debugging/validation.
- Marketplace/installations/reuse concepts appeared in the CLI's first days.
- Current backend contains the later hosted workspace-agent control plane for real coding-agent sessions, reconstructed separately below because it postdates the early #4 snapshot.
- Product hypothesis: many users attracted to Lovable/Claude Code-style building did not necessarily need another frontend application; their underlying need could often be served by backend workflows operated by an agent.

Relevant architecture and sequence:

- `48786f97a1` (2025-11-11): SCI-based agent chat with one `execute_clojure` function tool and namespaced primitives.
- `96d949d4d1` (2025-11-26): initial general flows runtime, authored by Vegard Steen.
- `9d5f3e0` (2025-12-12): CLI repository created by Andreas.
- `6feaca1f6b` (2025-12-16): backend “api for cli use”, authored by Andreas.
- January 2026 shows extensive CLI↔API contract/integration testing and agent-oriented authoring guidance.
- The initial CLI was dual-purpose from its first commit: human TUI/product exploration plus stable JSON and machine-readable documentation for agents/tooling.
- Interview confirms the intended split was human TUI versus agent CLI. The TUI quickly gave way to a conventional rich web application—the familiar, lower-perceived-risk SaaS choice.
- Late #4 counterexample: the CEO/largest power user reportedly ended up using the web surface rarely or almost never. This supports the early agent/control-surface thesis qualitatively, but it is one user's behavior and must not be presented as aggregate adoption data.
- Hosted first-party coding agents were a later #4 phase, beginning with plan/scaffold and a session control plane on 2026-04-09. The first panel shipped in April; OpenCode joined Codex in June.
- The hosted runtime explicitly bootstrapped an isolated workspace root with a pre-authenticated Breyta CLI, local `AGENTS.md` and installed Breyta skill. This is direct code evidence that the first-party agent reused the external-agent interface rather than receiving a wholly separate catalogue of Breyta function tools.
- Interview confirms this was deliberate dogfooding, not incidental reuse. A second motive was inheriting mature harness capabilities such as web research and skills rather than rebuilding them inside Breyta chat. Codex and OpenCode were both supported.
- Flows-api owned the surrounding lifecycle: placement/transport, session health/reuse/restart/stop, event/transcript persistence, live streaming and recovery. The hardening history shows that making a coding agent feel like web chat introduced distributed process and consistency problems absent from a normal completion loop.
- Retrospective: Andreas considers the hosted control plane possibly not worth its considerable complexity. No single remembered incident should be substituted for the broad iteration visible in history.
- Interview confirms that code-as-interface, small primitives, SCI, progressive disclosure and agents-as-programmers all carried from the #3 experiment into #4's conceptual foundation. Runtime implementation ownership remains separate.

Ownership boundary:

- Repository history supports Andreas ownership of the initial CLI and substantial API/web/product integration.
- Initial flow runtime commits are primarily Vegard-authored; do not frame the runtime as Andreas's implementation.

Representative snapshot candidates:

- Backend `efd7d33fbb` (2026-01-30).
- CLI `dadf0c4fd1` (2026-01-30).
- Frontend `8464925a20` (2026-01-28), mainly to document how much of the old React application still remained.
- A second current snapshot will be needed for the later hosted-Codex/agent runtime, because January predates much of that implementation.

Uncertainties:

- Exact hosted-agent containment guarantees and publishable infrastructure detail require security review.
- Product launch boundary versus technical incubation remains unknown.

## Snapshot plan

No worktrees created yet. Proposed read-only worktrees after interview confirmation:

| Generation | Repository/commit | Why inspect coherently |
| --- | --- | --- |
| #1 | backend `34e90c15a0`; frontend `4b0ba9acd8` | Last state before explicit AI-research commits, though video upload makes this transition-adjacent |
| #2 | backend `608f22e486`; frontend `2fe3ec85ed` | Mature projects/chat/evidence and both keyword/semantic retrieval code |
| #3 | backend `910750596e`; frontend `874c13c999` | Recurring agents/data subscriptions plus Python analysis, immediately before SCI chat |
| #4 early | backend `efd7d33fbb`; CLI `dadf0c4fd1` | Coherent early flows + CLI + SCI sandbox platform |
| #4 current | current backend and CLI refs | Hosted Codex/workspace-agent runtime and mature shared control surface |

The snapshots are evidence anchors, not claims that transitions happened on one day.
