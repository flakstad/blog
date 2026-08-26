# Breyta engineering inventory

Status: PROVISIONAL — repository archaeology plus interview rounds. Updated 2026-08-26.

Confidence vocabulary: CODE-CLEAR, HISTORY-CLEAR, INTERVIEW-CONFIRMED, INFERENCE, NEEDS-INTERVIEW.

Publication labels are conservative pending security/commercial review.

## Structured transcript → citation → synchronized playback

- Generations: #2, retained into #3/#4 chat surfaces.
- What it did: represented transcripts as rows with `row_id`, `start_ms`, `speaker`, and text; asked models to emit file/timestamp reference tags; rendered citations as interactive controls that opened the source, highlighted evidence and sought audio/video to the cited time.
- Relevant files: `breyta/bases/graphql-api/src/breyta/graphql_api/research_track/prompts.clj`; `breyta-frontend-mono/apps/breyta-ai-frontend/src/ResearchTrack/ConversationMarkdown.tsx`; `Transcript.tsx`; `MediaViewer.tsx`; `useMediaTimestamp.ts`; findings/evidence components.
- Commits/history: `1f818c02fc` (2024-04-20), `19ebfb0a5` (2024-05-16), `d792179836`/`8c1aeccd3`/`b9085e98a` (2024-08-27–29), global evidence context `0e2601488c` (2024-09-20), clickable chat references `3dd515039a` (2024-10-18), structured findings `caf72ff648` (2024-12-05), selection/highlight and copy/edit refinements through March 2025.
- Why it appears to exist: qualitative-research claims needed inspectable source grounding and direct navigation.
- Predecessor/simple approach: generated findings/quotes without a mature end-to-end interactive citation surface.
- Failure pressure: model-produced reference tags and timestamps were malformed often enough to require normalization/repair; quote highlighting also needed retry/fallback logic.
- Tradeoffs: custom markup parsing; coupling among prompt, stored IDs/timestamps and UI; missing/deleted files; approximate highlight matching; transcript edits/versioning; unverified model claims can still carry syntactically valid references.
- Confidence: CODE-CLEAR/HISTORY-CLEAR for mechanism; NEEDS-INTERVIEW for user value and production failure frequency.
- Article value: exceptional.
- Publication: PUBLIC-HIGH-LEVEL until sample/customer data and exact failure cases are reviewed.

## LLM-driven Elasticsearch query-string retrieval

- Generations: #2/#3.
- What it did: exposed `file_search` to chat. The model generated one or more search strings; default mode used fuzzy AND after stop-word preprocessing, while explicit Elasticsearch query-string syntax allowed phrases, boolean logic, proximity, boosting and wildcards. Results included highlighted matching source fragments and file metadata.
- Relevant files: `breyta/libraries/llm/src/breyta/llm/tools.clj`; `breyta/libraries/search/src/breyta/search/elastic.clj`; `breyta/bases/graphql-api/src/breyta/graphql_api/research_track/prompts.clj`; chat/tool handlers.
- Commits/history: `1310d56715` (2024-10-03), `a6b0d0a070` (2024-10-16 multiple searches), `260310caac` (2025-04-02 default AND).
- Why it appears to exist: corpus-wide chat could not fit all files in context and needed targeted evidence retrieval.
- Predecessor/simple approach: selected/full files in context; OpenAI vector-store RAG demo; separate embedding experiments.
- Failure pressure: context size, irrelevant retrieval and inability to know which files to load. Exact production symptom needs interview.
- Interview evidence (2026-08-26): embeddings alone often returned too many poor results; lexical query formulation gave higher precision. This was qualitative, not benchmarked.
- Tradeoffs: relies on model vocabulary/query formulation; lexical mismatch; query-string syntax can be brittle; highlighted fragments reduce context cost but may omit needed surrounding evidence. Embeddings helped with cross-language and broader “possibly relevant” recall.
- Confidence: CODE-CLEAR/HISTORY-CLEAR/INTERVIEW-CONFIRMED for the narrow qualitative observation; no measured-superiority claim.
- Article value: exceptional if comparison can be made narrow and honest.
- Publication: PUBLIC-HIGH-LEVEL.

## Multiple embedding/vector retrieval experiments

- Generations: #2/#3.
- What it did: at least three distinct paths existed: OpenAI Assistant vector stores, explicit embedding calls with a vector-service demo, and Elasticsearch `semantic_text`/inference search. Chunked dense-vector code also exists but is reader-discarded/commented in the mature snapshot. On 2025-05-21 the Elasticsearch semantic path was explicitly combined with lexical `query_string`/fuzzy `multi_match` clauses in one `should` query.
- Relevant files: `libraries/llm/src/breyta/llm/openai/{assistants,vector_stores,embeddings}.clj`; `libraries/search/src/breyta/search/data.clj`; `libraries/search/src/breyta/search/elastic.clj`; research search query handler.
- Commits/history: `c049b8b1eb` (2024-05-23), `32636f4957` (2024-06-10), `71a3803d51` (2025-05-19), `b064e8df3b` (2025-05-20), `9d8f55af52` (2025-05-21, “semantic keyword hybrid search”). Frontend history labels the option “Keyword + Semantic”.
- Why it appears to exist: semantic retrieval across research material and later a controlled demo/search mode.
- Predecessor/simple approach: full-context or selected-file prompting; exact chronology between experiments needs deeper file history.
- Failure pressure: INTERVIEW-CONFIRMED qualitatively: embedding-only retrieval had excessive low-quality results, while lexical search improved precision. Embeddings retained value for cross-language and broad recall.
- Tradeoffs: indexing/chunking/inference cost, opaque similarity, loss of exact structured terms, multiple infrastructure paths, demo versus production ambiguity.
- Negative finding: mature code retains both lexical and semantic paths. The repository does not support a blanket replacement story.
- Confidence: CODE-CLEAR/HISTORY-CLEAR/INTERVIEW-CONFIRMED; comparison remained qualitative.
- Article value: exceptional when combined with the lexical-search mechanism and framed as a qualitative hybrid-retrieval story.
- Publication: PUBLIC-HIGH-LEVEL.

## Prompt-constrained references plus repair code

- Generations: #2/#3.
- What it did: prompts specified exact reference markup and transcript timestamp semantics; backend repair normalized malformed `start_ms`, removed invalid values and inserted missing whitespace before tags.
- Relevant files: `bases/graphql-api/.../research_track/prompts.clj`; `chat.clj` function `ensure-well-behaved-references`.
- Commits/history: `d2626b4c37` (2024-10-29), `728abee785` (2024-11-26), plus numerous UI parsing/highlight fixes.
- Why it appears to exist: actual model output violated formatting rules in observed repeatable ways.
- Predecessor/simple approach: trust the prompt/model output.
- Failure pressure: known malformed timestamp containing combined row ID and timestamp; invalid timestamps; and missing separators. The `728abee785` commit message records that text emitted directly adjacent to a `<reference>` caused the application to crash. This is evidence of a concrete parser/rendering failure, though not its production frequency.
- Tradeoffs: repair handles known syntax/transport failures but cannot prove that a cited passage entails the generated claim. No semantic reference verifier has been found.
- Confidence: CODE-CLEAR/HISTORY-CLEAR.
- Article value: high; strong supporting mechanism for “Evidence before fluency”.
- Publication: PUBLIC.

## Per-file findings followed by cross-file synthesis

- Generations: #2, retained as substrate for #3.
- What it did: decomposed a multi-file research question into evidence-bearing findings generated independently for each transcript/file, then ran a separate synthesis over those findings. The mature January 2025 path supplied only finding text, verbatim citation text and compact temporary IDs to synthesis; generated references were remapped to persistent finding IDs for the application. Users could traverse from a synthesized claim to a finding and onward to the original quote/timestamp.
- Relevant files: historical `bases/graphql-api/.../research_track/findings.clj`; `bases/events-worker/.../workers/{project,findings2,answer_across_findings,async_request}.clj`; their prompt resources and tests; frontend finding/reference components.
- Commits/history: text findings plus cross-finding summary `8d41989ce1` (2024-04-22); parallel generation `6a10912c36` (2024-05-15); explicit project orchestration `da475e71c8` (2024-06-17); structured findings `d45427a985` (2024-12-05); answer-across implementation `ad83cd3749` and single-file user-prompt findings `5f6e3aca2e` (2025-01-09); minimal synthesis payload and compact-ID remapping `f24d565d4f`/`2cdb6e13ec` (2025-01-17).
- Why it appears to exist: a single model call over many long transcripts would mix extraction, comparison and prose generation while making source grounding harder. The staged pipeline narrowed each task and made cross-file claims traceable through intermediate findings.
- Predecessor/simple approach: one large prompt containing all selected files. INTERVIEW-CONFIRMED; the discarded implementation has not been located. The first committed prototype instead accepts one transcript, and per-transcript findings appear very early in the production-oriented code.
- Failure pressure: the all-files prompt did not scale in file count and was worse for hallucinations and precise references. The staged decomposition was essential to perceived quality and reliability. This is qualitative interview evidence; no controlled comparison artifact has been found.
- Intermediate-design evolution: nuggets → findings → themes worked, but three LLM levels were judged too costly and slow for their incremental value. Findings → synthesis replaced it as a simpler two-level mechanism.
- User outcome: INTERVIEW-CONFIRMED that clickable sources and synchronized playback were critical and very well received because trust in AI answers was a central concern. Source inspection was normal workflow, especially for video-interview analysis, not merely an exception path. The same navigation contract served polished synthesis documents and workspace/project-scoped chat. Andreas cannot recall a single customer- or team-discovered incorrect reference in #2. That is a strong recollection, not proof that no incorrect references existed.
- Tradeoffs: more LLM calls and orchestration than one prompt; intermediate findings can omit evidence needed for synthesis; synthesis is bounded by extraction quality; references are indirect; compact-ID remapping and regeneration/edit semantics add state complexity. Reducing three semantic levels to two cut model cost/waiting but may have discarded useful hierarchical structure. The staged design improves inspectability but does not itself semantically verify claims.
- Ownership: Andreas-authored history is strong across the April and January product mechanism; interview confirms personal design ownership. Other contributors owned parts of worker orchestration and generation infrastructure.
- Confidence: CODE-CLEAR/HISTORY-CLEAR/INTERVIEW-CONFIRMED; no quantitative quality evaluation found.
- Article value: exceptional.
- Publication: PUBLIC-HIGH-LEVEL.

## Shared chat tool catalogue before SCI

- Generations: late #2/#3.
- What it did: routed intent and let chat search/list/read files, add project questions and execute Python for spreadsheet analysis.
- Relevant files: `libraries/llm/src/breyta/llm/tools.clj`; `tool_handlers.clj`; `bases/graphql-api/.../chat.clj`; `events-worker/.../agent_findings.clj`.
- Commits/history: tool-based file search begins `1310d56715` (2024-10-03); functional provider/tool refactor `a9d0dc4053` (2025-04-08); Python analysis `1ec68ceaeb` (2025-10-23).
- Observed count at backend `910750596e` (2025-11-10): six named schemas/constants; four shared executable handlers plus two dispatcher/product tools.
- Why it appears to exist: retrieval, routing, project actions and spreadsheet computation required capabilities beyond plain completion.
- Predecessor/simple approach: selected/full context and specialized non-agent workflows.
- Failure pressure: interview (2026-08-26) says the planned expansion would have taken the catalogue beyond 20 tools. SCI was a preemptive response to projected schema/token/context cost and weak composition, not a cleanup after 20+ tools had shipped.
- Tradeoffs: prompt/schema tokens, routing layers, per-tool handlers and model selection complexity; but the observed catalogue is small.
- Negative finding: existing website copy says the agent had already gained 20–30+ tools; this should be corrected before using it as public evidence.
- Confidence: CODE-CLEAR/HISTORY-CLEAR/INTERVIEW-CONFIRMED.
- Article value: high, but the honest framing is “we changed course at six before the roadmap created 20+”.
- Publication: PUBLIC-HIGH-LEVEL.

## Python code execution for spreadsheet research

- Generations: #3.
- What it did: an LLM iteratively generated Python against preloaded CSV/Excel data in an isolated external executor, returning only a designated `result`; analysis and tool-call history were stored and converted into report findings.
- Relevant files: `libraries/llm/src/breyta/llm/python_executor.clj`; `events-worker/.../agent_findings.clj`; separate `python-executor` repository may be relevant even though not in the user's initial top three.
- Commits/history: `1ec68ceaeb` (2025-10-23) and subsequent spreadsheet-agent commits.
- Why it appears to exist: static prompting was poorly suited to open-ended numeric/tabular analysis.
- Predecessor/simple approach: prompt pipelines over CSV text and specialized analysis passes.
- Failure pressure: NEEDS-INTERVIEW.
- Tradeoffs: external-service latency, data movement, debugging generated code, execution limits, result serialization and another security boundary.
- Confidence: CODE-CLEAR/HISTORY-CLEAR for mechanism.
- Article value: high; may be predecessor/supporting material rather than the main “code instead of tools” story.
- Publication: PUBLIC-HIGH-LEVEL.

## One execute_clojure tool over SCI primitives

- Generations: #3→#4 transition.
- What it did: exposed a single `execute_clojure` function tool. Generated code ran through SCI with curated namespaces/state atoms and callable primitives for files, data analysis, reports and reusable skills. Tool results were returned to the Responses API loop; streaming surfaced thinking, code/tool events and results.
- Relevant files: `libraries/llm/src/breyta/llm/agent_chat/{executor,loop,openai_client,schemas}.clj`; `resources/.../execute_clojure_tool.txt`.
- Commits/history: `48786f97a1` (2025-11-11), `fa9640dcee` (2025-11-11), `53cf173696` (2025-11-12), `ca3ea1968f` (2025-11-18).
- Contemporaneous design drafts: `BLOG_POST_EXECUTE_CLOJURE.md` and `BLOG_POST_EXECUTE_CLOJURE_2.md` were committed in `c7d325e20c` (2025-12-10, Andreas) and deleted by `6793b7f033` (2026-01-09) as obsolete documentation/blog posts. They describe the intended rationale, Python/Unix alternatives, atoms, preview-with-guidance, skills, scratch, change-log, Malli and the SCI threat model. These are strong evidence for how the architecture was understood in December, but not independent proof of outcomes.
- Earlier draft supplied in interview (2026-08-26): “Building AI Agents with `execute_clojure`: One Tool Instead of Twenty”. Andreas recovered it from private X/Grok chat history where he had pasted it for feedback on 2025-11-25. Its exact text/title is not present in the repository object database. Treat it as dated, private interview-provided material, not a public repository source. Its Malli “coming soon” section coexists with repository implementation from `ca3ea1968f` on 2025-11-18, indicating either incomplete rollout or prose assembled across different implementation stages.
- Related but weaker source: `../blog/content/work.md` summarizes the concept, but its “20–30 or more tools” wording is historically inaccurate according to code plus interview and must not be used to establish the count.
- Why it appears to exist: let the model compose operations and maintain/reuse code-shaped skills/state.
- Predecessor/simple approach: direct function tools plus Python-only data analysis.
- Failure pressure: INTERVIEW-CONFIRMED as projected token/context growth and the cost of providing schemas/context up front, plus composition pressure. This was preventative architectural work rather than a proven collapse of a 30-tool production catalogue.
- Progressive disclosure evidence: the tool prompt advertises a small surface and `(doc symbol)` for detailed schemas/examples; config and skill bodies use lazy-loading sentinels; file reads return bounded windows with `offset`, `limit`, and `has-more`. Source comments explicitly connect lazy loading to reduced token use.
- Contextual-affordance evolution: by `44885ec3a8` (2025-11-21), printed config/scratch/change-log values contained bounded previews plus executable instructions for retrieving more; the OpenAI client added hints for common errors. This supports the interview recollection that results taught the model what to try next instead of front-loading every contract.
- State/persistence evolution: the initial `48786f97a1` executor still labeled file/data implementations as mocks. `44885ec3a8` later created a Firestore-synced agent context and added change-log/report integration. Do not describe the first SCI commit as already containing the full production boundary.
- Malli chronology: `ca3ea1968f` (2025-11-18) added 784 lines of schemas plus extensive tests and validation wrappers. Inputs/config/skills are strongly validated in code; some result validation is explicitly soft and logs warnings rather than failing. The earlier pasted draft's TODO and its later blanket “every operation” statements reflect different stages and should not be collapsed.
- Safety: SCI context and curated namespaces; Malli validation; bounded agent iterations; separate Python executor remains behind a primitive. Detailed allow/deny surface and escape analysis require deeper inspection.
- What remained outside code: the model still had one host function tool; I/O and product mutations remained host-provided primitives; Python analysis remained an external execution boundary.
- Tradeoffs: generated-code failures, harder observability, error/result serialization, state semantics, larger instruction surface and sandbox risk; composition may reduce tool schema sprawl.
- Quantitative claim status: interview (2026-08-26) says the token figures were counted/estimated and the latency figures estimated. No stored measurement artifacts have been found. The ~80–90/90%+ reductions, 7,000→950 or 10–12k→600–1.5k token ranges and 25–35s→4–7s latency must be presented, if at all, as contemporary estimates rather than measured production results. The four-call example is illustrative arithmetic, not an evaluation.
- Alternative-environment status: an agent executing Python on a VM already existed and was used for Excel/tabular analysis. Expanding Python to the whole product interface and using Unix-style containers were discussed alternatives; no implementation evidence has been established for those broader designs.
- Outcome status: Andreas distinctly remembers the agent composing code in useful ways he had not anticipated, but has no recoverable concrete example. He does not remember meaningful end-customer production usage and considers it possible the implementation primarily served as an idea donor for #4 and the workflow engine. Do not claim demonstrated customer impact, general reliability improvement or durable skill reuse without further evidence.
- Other claims needing security review: absolute sandbox statements such as “cannot escalate privileges”.
- Confidence: CODE-CLEAR/HISTORY-CLEAR/INTERVIEW-CONFIRMED for motivation; NEEDS-INTERVIEW for outcomes/regressions.
- Article value: exceptional if the predecessor discrepancy is resolved.
- Publication: PUBLIC-HIGH-LEVEL; sandbox specifics require review.

## Recurring agent/data-subscription orchestration

- Generations: #3.
- What it did: scheduled recurring research/report runs over sources selected by date range and configured data sources; generated findings, synthesis, “what changed”, memos and deliveries; managed subscribers and exposed public previews/reports.
- Relevant files: `bases/graphql-api/.../data_subscription.clj`; `temporal/subscription_schedule.clj`; `bases/temporal-worker/.../agent_report.clj`; `libraries/data-subscriptions`; corresponding frontend Agents/DataSubscription pages.
- Relevant predecessor files: `breyta-frontend-mono/apps/workflow-worker/src/workflows/projectWorkflow.ts` and `activities/{cell,synthesis,memoGeneration,reportDelivery,subscriptionProjectActivities}.ts`; backend `events-worker/.../async_request.clj`.
- Commits/history: frontend feature-flag/mock `78838e6f160` (2025-07-30); backend CRUD `f07fc5060ae` (2025-07-31); manual generation through a reused/shadow project `a3c3a61bb4` (2025-08-04); removal of redundant subscription-report storage `734961e6ef` (2025-08-12); TypeScript Temporal subscription scaffolding `787f4ca5c` (2025-08-12/13); dedicated Clojure agent-report workflow and schedule integration `af094ee7e4` (2025-10-10); subscriber/prompt/format/personalization/state changes through October; durable report knowledge assets `af9621c666` and exclusion from automatic re-analysis `59c43fbde1` (2025-11-03).
- Why it appears to exist: move from one-shot project analysis to ongoing monitoring/research.
- Predecessor/simple approach: user-triggered projects/questions/chat. The first recurring implementation deliberately reused that pipeline by representing each run as a report project; it briefly duplicated state into a second collection before simplifying to the project alone.
- Predecessor architecture: the old project workflow lived in the frontend monorepo as a TypeScript Temporal workflow. Its activities created Firestore `asyncRequests`, while Clojure polling workers executed findings/synthesis/memo work and used stored task tokens/signals to complete Temporal activities. This split let subscriptions reuse #2, but coupled two services, Firestore state and Temporal signaling.
- Transition rationale: INTERVIEW-CONFIRMED. Shadow projects were chosen so the new subscription product could participate in the existing setup. The dedicated October workflow was then rebuilt from scratch in Clojure because the older workflows had weaknesses and bugs and the team wanted a cleaner, correct implementation.
- Failure evidence: the TypeScript workflow history contains deterministic-activity corrections, stranded-cell recovery, signal timeouts, duplicate-trigger/double-delivery guards and a 592-line October hardening change (`5c90429b2`). These are HISTORY-CLEAR design pressures, not individually verified production incidents. Andreas does not remember the separate October 31 filter/timestamp incident cluster.
- Interview narrows the rewrite pressure to coordination rather than dissatisfaction with the findings/synthesis quality model.
- Failure pressure: ongoing work required cadence, overlap and catch-up policy, source-time filtering, explicit stage dependencies, no-data behavior, subscriber state and idempotent delivery. Commit history establishes that these concerns were repeatedly changed; whether they reflect incidents or anticipated correctness work is NEEDS-INTERVIEW.
- Durable-output boundary: completed reports became long-term searchable research artifacts, but automatic source selection explicitly rejected assets carrying a `reportId`. This is strong negative evidence against describing the system as a recursive/self-feeding research loop.
- Exclusion motivation: NEEDS-INTERVIEW remains unresolved; Andreas does not remember the reason and did not recognize a self-contamination incident. Treat feedback-loop prevention as an architectural interpretation, not an incident claim.
- Tradeoffs: freshness/window semantics, duplicate/missed schedules, accumulating generated artifacts, report comparison, notification correctness and deciding whether prior generated conclusions are context or contamination.
- Confidence: CODE-CLEAR/HISTORY-CLEAR for mechanics and chronology; NEEDS-INTERVIEW for causal incidents and customer use.
- Article value: high; potentially exceptional if the generated-output exclusion came from an observed failure.
- Publication: PUBLIC-HIGH-LEVEL.

## Flow source plus SCI workflow runtime

- Generations: #4.
- What it did: represented workflows as Clojure/EDN source and executed them through a constrained SCI-based runtime with host-provided clients/steps.
- Relevant files: `libraries/flows/src/breyta/flows/execution/sci_sandbox.clj`; `sci_sandbox/safe.clj`; flow schemas/execution/tests; `bases/flows-api`.
- Commits/history: initial flows `96d949d4d1` (2025-11-26), followed by security and runtime hardening from late November onward.
- Why it appears to exist: programmable workflows that agents could inspect, generate, validate and modify.
- Conceptual lineage: INTERVIEW-CONFIRMED that the earlier agent-chat experiment contributed all five central ideas to #4 thinking: code as interface, small primitives, SCI sandboxing, progressive disclosure and the agent as programmer. This establishes intellectual/product lineage, not personal ownership of the later runtime implementation.
- Predecessor/simple approach: product-specific workflows/Temporal jobs and agent-chat-specific SCI execution.
- Failure pressure: NEEDS-INTERVIEW; do not conflate agent-chat SCI with the general workflow runtime without deeper history.
- Tradeoffs: sandbox completeness, host interop, determinism/replay, resource limits, debugging and a language surface that must remain learnable to agents.
- Ownership: architecture present; initial runtime primarily authored by Vegard Steen. Andreas ownership not claimed.
- Confidence: CODE-CLEAR/HISTORY-CLEAR.
- Article value: exceptional as part of agent-first platform story.
- Publication: PUBLIC-HIGH-LEVEL; detailed sandbox vulnerabilities/mitigations require review.

## CLI as shared programmable control surface

- Generations: #4.
- What it did: exposed flow source lifecycle, deployment/runs, triggers, waits, resources/artifacts, connections, installations, validation/compilation, step isolation/testing and authentication. From the first commit it combined an interactive Bubble Tea TUI with stable JSON commands and a machine-readable `breyta docs` tree explicitly marked for agents/tooling.
- Relevant files: `breyta-cli/internal/cli`; CLI README/history; backend command handlers and public CLI/skill docs.
- Commits/history: CLI created `9d5f3e0` (2025-12-12) by Andreas as a mock-backed product/TUI prototype with agent-readable docs; marketplace TUI and broader API surface added 2025-12-14; local flows API integration and deliberate hiding of the larger mocked surface in `f6f21d1` (2025-12-16); backend API `6feaca1f6b` (2025-12-16); agent skill bundle documented by 2025-12-16; authentication, skill installation, delimiter repair and extensive CLI↔API contracts followed in January 2026.
- Why it appears to exist: provide both a human truth/inspection surface and a scriptable control surface that coding agents could discover and compose. The earliest README says “truth surface first” and “scriptable CLI”; machine-readable docs eliminate any need to infer agent intent solely from later usage.
- Initial channel intent: INTERVIEW-CONFIRMED (2026-08-26) that the TUI was intended for humans and the command surface for agents. The TUI was soon displaced by the web application.
- Predecessor/simple approach: web UI and direct/internal API calls.
- Failure pressure: agents needed stable structured output, inspectable source and ordinary operational feedback across pull/edit/push/deploy/run rather than a bespoke tool for each action. The causal business motivation still needs interview confirmation.
- Selection rationale: argument-based rather than measured. Andreas argued that coding agents were already competent in Unix/PowerShell environments, and that a documented CLI plus skill would consume less context than large bespoke tool/MCP surfaces. At the time he considered MCP overcomplicated and token-heavy. Treat this as architectural judgment/interview evidence, not a benchmark of CLI versus MCP.
- Agent-specific affordances: strict JSON/optional EDN; self-describing command/flag tree; non-zero failures with server messages; local source pull/edit/push; installed Codex/Claude/Cursor/Gemini skill guidance; auto-repair of Clojure delimiters; stable workspace/resource identifiers; contract tests across CLI and backend.
- Tradeoffs: duplicated concepts/docs, CLI/API version compatibility, textual error contracts, auth/bootstrap friction and a larger public support surface.
- Product/UI counterevidence: by late #4, the CEO and largest Breyta user reportedly used the web surface rarely or almost never. Andreas had argued early that a rich web surface might not be central for power users but did not initially gain agreement; the familiar SaaS choice was still a rich web app. This is a single interview observation, not product-wide usage evidence, and publication should be reviewed with the person/company involved.
- Ownership: strong git evidence for Andreas as initial CLI author and API/product integrator.
- Confidence: CODE-CLEAR/HISTORY-CLEAR.
- Article value: exceptional/high; may stand alone or support the broader #4 thesis.
- Publication: PUBLIC.

## First-party hosted Codex/workspace agent

- Generations: later #4/current.
- What it did: first-party web chat controlled real Codex and later OpenCode coding-agent sessions. The coding agent ran in an isolated workspace/user root on hosted compute; flows-api owned session allocation, health, send/stop/restart, persisted events/transcript, live streaming and recovery. The runtime prompt states that the Breyta CLI is installed and pre-authenticated and requires the local `AGENTS.md` plus installed Breyta skill, demonstrating reuse of the external-agent control surface.
- Relevant files: `bases/flows-api/src/breyta/flows_api/workspace_agents/{runtime,actions,store,live_stream,watchdog}.clj`; `resources/public/docs/operate/GUIDE_HOSTED_WORKSPACE_AGENTS.md`; hosted VM helper/runbook docs and tests. Do not copy concrete infrastructure coordinates, secret wiring or operational thresholds into public artifacts.
- Commits/history: plan/scaffold `e2c3e69205` (2026-04-09, Andreas); session control plane `92e12c55a3` (2026-04-09, Andreas); dedicated hosted compute and isolation spikes April 12–14; panel v1 `f48f3a7647` (2026-04-17); local relay transport `47b5fb546a` (2026-04-21); repeated readiness, session, streaming, stop and recovery hardening through May; OpenCode parity `740c13fcc8` (2026-06-16).
- Why it appears to exist: first-party web chat backed by an actual coding agent rather than a narrow function-calling loop.
- Product motivation: INTERVIEW-CONFIRMED as (1) dogfooding exactly the CLI/control surface available to users bringing their own agent and (2) reusing an existing coding-agent harness that already provided web research, skills and other capabilities. Both Codex and OpenCode were supported.
- Predecessor/simple approach: SCI-based agent chat and external bring-your-own agents using the CLI.
- What remained shared: Breyta operations were still reached through the CLI/agent skill and authenticated workspace API rather than being reimplemented as a separate set of hosted-chat function tools. Flows-api added the control plane around the coding process, not a second domain API.
- Isolation/security boundary: dedicated hosted compute; per-workspace/user roots; restricted runtime/isolation layer; scoped/pre-authenticated workspace credentials; explicit rollout gate; curated bootstrap/instructions. Exact containment guarantees require dedicated security review and should not be inferred from configuration alone.
- Failure pressure/tradeoffs: history is unusually dense with readiness, stale-session, VM connectivity, streaming ordering/finalization, stop races and recovery changes. This proves engineering pressure and evolving failure handling, not that each commit corresponds to a production incident. Costs include long-lived process/session state, transport failure modes, token/auth rotation, eventual transcript consistency, hosted-compute operations and a substantially larger security boundary than function calling.
- Retrospective outcome: Andreas remembers the runtime as very complicated, requiring substantial iteration across many problems, and considers it possible the result was not worth that complexity. No single representative failure is currently recoverable from memory; use commit clusters as implementation evidence without inventing an incident narrative.
- Ownership: Andreas authored the initial hosted-agent plan/control plane and a large share of runtime, streaming and recovery work. UI polish and later product capabilities also have substantial contributions from Gustav Jönsson, Chris Moen and Vegard Steen.
- Confidence: CODE-CLEAR/HISTORY-CLEAR for architecture, chronology and CLI reuse; NEEDS-INTERVIEW for product motivation and customer outcomes.
- Article value: exceptional.
- Publication: HOLD until security review.

## Evidence hygiene notes

- Historical source contains secrets and customer/interview-like sample material. None should be copied into research artifacts or articles.
- Commit authorship establishes who committed a change, not sole design ownership.
- No benchmark/evaluation artifact has yet been found for lexical versus semantic retrieval.
