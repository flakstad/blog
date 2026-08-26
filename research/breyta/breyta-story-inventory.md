# Breyta story inventory

Status: RANKED — repository archaeology plus interview rounds. Updated 2026-08-26.

## Editorial ranking

| Rank | Candidate | Article role | Confidence | Reason for rank |
|---:|---|---|---|---|
| 1 | Reliability came from separating extraction from synthesis | Whole article | High | Failed one-prompt predecessor, concrete staged mechanism, cost-driven simplification, precise provenance and strong customer-use evidence |
| 2 | Code execution replaced composition pressure, not all tools | Whole article | High mechanism / medium outcome | Surprising preemptive pivot at six tools, unusually concrete SCI/progressive-disclosure design and direct conceptual lineage into #4 |
| 3 | From assistant feature to programmer/user of the platform | Flagship whole article | High architecture | Four dated transitions connect code-as-interface to workflows, CLI and hosted agents; broadly relevant beyond Breyta |
| 4 | When agent-formulated lexical search was unusually effective | Whole article if kept narrow | High mechanism / qualitative outcome | Contradicts simplistic RAG advice while preserving a useful hybrid conclusion |
| 5 | The CLI became an agent API | Whole article or center of rank 3 | High | Strong first-commit intent, implementation depth, first-party reuse and a real UI/control-surface product tension |
| 6 | Evidence was a product system, not a prompt instruction | Combine with rank 1 | High | End-to-end customer-critical behavior and concrete parser/UI failures, but overlaps heavily with the extraction/synthesis story |
| 7 | Dogfooding the external-agent interface inside first-party chat | Whole article after review | High mechanism / medium outcome | Honest architectural trade: interface reuse versus a much larger distributed control plane |
| 8 | Recurring research made time and delivery part of correctness | Whole article only with sharper incident | High mechanism / medium motivation | Clear shadow-project bridge and cross-runtime coordination rewrite, but no remembered representative failure |
| 9 | When the richest interface was not the power-user interface | Opening/support for ranks 3 or 5 | Interview-only outcome | Strong product observation, but one power user cannot carry a general standalone claim |
| 10 | Python spreadsheet agent as the bridge to general code execution | Supporting material | High mechanism | Useful predecessor for rank 2, weaker as an independent thesis |
| 11 | A product pivot preserved more substrate than the UI implied | Supporting or retrospective | High | Good product-engineering context, but currently less surprising than the mechanism stories |
| 12 | Generated research became knowledge—and a forbidden future input | Supporting material | High code / low causal | Interesting boundary, but the motivation is unknown and the feedback-contamination story is only inference |
| 13 | AI chat changed identity three times | Do not commission yet | Medium | Risks becoming the chronological feature dump the research brief explicitly rejects |

Ranking notes:

- Ranks 1 and 6 should normally become one article. Separating them would repeat the same citation and playback material.
- Ranks 3 and 5 can support separate articles only if the flagship platform article reserves enough CLI implementation detail.
- Rank 7 is HOLD until infrastructure/security review and needs a sharper product outcome before commissioning.
- Rank 12 must not be presented as a discovered self-contamination incident.

## Candidate dossiers

## Evidence was a product system, not a prompt instruction

- Generation: #2.
- Problem: fluent qualitative findings were insufficient unless users could inspect exact source material.
- Observed symptoms: the first all-files prompt did not scale and degraded hallucination/reference behavior; later model output could still contain malformed reference markup/timestamps; highlight mismatches, deleted/missing sources and repeated UI/backend fixes remained transport/UI concerns.
- Previous approach: one combined prompt over selected files and generated prose without a mature source-navigation loop.
- Response: structured transcript rows; findings generated per file; cross-file synthesis linked back through finding IDs; explicit reference markup and repair code; clickable citations, transcript highlighting and synchronized playback.
- Remaining tradeoffs: syntactic repair does not verify semantic entailment; edits/versioning can weaken links.
- Evidence: see engineering inventory and commits `1f818c02fc`, `19ebfb0a5`, `8c1aeccd3`, `d2626b4c37`.
- Interview evidence: customers primarily analyzed video interviews. Source inspection was a normal, essential part of reading polished synthesis and asking workspace/project chat questions. Andreas describes the experience as critical and very well received because user trust in AI answers was central. He cannot recall customers or the team finding a single incorrect #2 reference. Treat the latter as recollection, not an exhaustive accuracy measurement.
- Confidence/publication: high code confidence; PUBLIC-HIGH-LEVEL.
- Possible thesis: trustworthy research output required treating provenance as an end-to-end product contract.
- Scope: likely whole article.

## Reliability came from separating extraction from synthesis

- Generation: #2.
- Problem: the initial combined-corpus prompt did not scale in file count and performed poorly on hallucinations and exact references; answering across many interviews/files in one step combined evidence extraction, comparison and prose generation.
- Observed implementation: per-transcript findings existed in April 2024; June orchestration waited for all selected transcripts; December introduced more structured intermediate findings; January 2025 generated user-question-specific findings per file and synthesized only those findings across files.
- Previous/simple approach: all selected files in one large prompt. This predecessor is INTERVIEW-CONFIRMED but has not been found in Git; committed history starts with a one-transcript prototype and quickly reaches per-transcript extraction.
- Engineering response: treat findings as an intermediate evidence layer. Each retained verbatim citations/timestamps; synthesis received reduced fields and temporary numeric IDs; backend remapped them to durable finding references used by the UI.
- Intermediate dead end: nuggets → findings → themes worked, but three LLM layers were not worth their additional cost and waiting time. It was simplified to findings → synthesis.
- Remaining tradeoffs: additional calls/state/retries versus one prompt; extraction omissions cap synthesis quality; intermediate abstractions can erase nuance; no semantic verifier or benchmark. Modern long-context models might change the boundary, but that has not been evaluated.
- Evidence: `8d41989ce1`, `da475e71c8`, `d45427a985`, `5f6e3aca2e`, `ad83cd3749`, `f24d565d4f`, `2cdb6e13ec` and associated prompts/tests.
- Interview evidence: Andreas says he devised the approach and that it was essential to quality and reliability. Evidence navigation was normal customer workflow and strongly received; no remembered incorrect-reference case.
- Confidence/publication: CODE-CLEAR/HISTORY-CLEAR/INTERVIEW-CONFIRMED; PUBLIC-HIGH-LEVEL.
- Possible thesis: reliable multi-document AI analysis benefited from an inspectable intermediate representation, not merely better prompting or larger context windows.
- Scope: likely whole article; may be combined with the evidence-system story rather than consuming the same mechanism twice.

## When agent-formulated lexical search was unusually effective

- Generation: #2/#3.
- Problem: find exact support across many semi-structured research files without loading the corpus.
- Observed implementation: LLM-issued repeated Elasticsearch fuzzy/query-string searches with highlighted fragments; separate semantic paths coexisted.
- Previous approaches: full/selected context, OpenAI vector-store demo, embedding/vector experiments.
- Why previous approach failed: embedding-only experiments often returned too much weakly relevant material. Lexical queries were more precise; embeddings remained useful for cross-language/broad recall.
- Response: small file-search tool with model-controlled query formulation and explicit search syntax guidance.
- Remaining tradeoffs: vocabulary mismatch, brittle query syntax and no repository-proven superiority.
- Evidence: `1310d56715`, `260310caac`, search/tool/prompt files; semantic work `71a3803d51`.
- Interview evidence: 2026-08-26; qualitative observation only, no benchmark.
- Confidence/publication: mechanism and narrow qualitative comparison high; PUBLIC-HIGH-LEVEL.
- Possible thesis: task structure can make compositional lexical retrieval more useful than generic semantic similarity.
- Scope: whole article only if comparison conditions can be reconstructed.

## Code execution replaced composition pressure, not all tools

- Generation: #3→#4.
- Problem: hypothesis says specialized capabilities became difficult for agents/developers to compose.
- Observed symptom: six tools existed, but planned expansion would have pushed the catalogue beyond 20. The pressure was projected schema/context/token growth and limited composition, not an already-deployed 30-tool failure.
- Previous approach: function tools for routing/search/files/product actions plus separate Python execution.
- Response: one `execute_clojure` tool over SCI and curated host primitives; Python stayed behind a primitive.
- Remaining tradeoffs: sandbox, generated-code debugging, state/result semantics, latency and bounded iterations.
- Evidence: `48786f97a1`, `fa9640dcee`, `ca3ea1968f`; pre-SCI `libraries/llm/tools.clj` at `910750596e`.
- Contemporaneous sources: two backend-repo drafts, `BLOG_POST_EXECUTE_CLOJURE{,_2}.md`, were committed in `c7d325e20c` on 2025-12-10 and deleted as obsolete in `6793b7f033` on 2026-01-09. An earlier differently titled draft was supplied in interview but is not byte-identical to a Git object found so far.
- Private draft provenance: Andreas recovered the earlier version from private X/Grok chat history dated 2025-11-25, where it had been pasted for feedback. It is a contemporaneous but PRIVATE source.
- Draft claim audit: the drafts strongly corroborate the intended architecture and progressive-disclosure rationale. They overstate the shipped predecessor count. Token figures were counted/estimated and latency estimated, not production benchmarks; reliability improvement remains unsupported. Malli, persistence and preview-with-guidance are independently code-supported, but arrived incrementally across November.
- Production outcome: possibly little end-customer use. Interview supports remembered unanticipated/useful code composition but no concrete recoverable case. The better-supported architectural role may be that the experiment became an idea donor for #4 and the workflow engine.
- Interview evidence: 2026-08-26 confirms the six-tool count and that 20+ described the roadmap avoided by the SCI experiment. Token/context cost and progressive disclosure were primary motivations.
- Progressive-disclosure evidence: on-demand `(doc ...)`, lazy config/skill fields and windowed file reads are explicit in the implementation.
- Confidence/publication: high for motivation, mechanism and influence hypothesis; low for customer outcomes. PUBLIC-HIGH-LEVEL, with the X/Grok source itself PRIVATE.
- Possible thesis: the interesting decision was changing course at six tools, before the roadmap forced 20+, and using code plus on-demand documentation to keep capability out of the initial context. Frame it as an architectural experiment that shaped the next platform, not a proven replacement deployed at scale.
- Scope: potentially whole article; currently not rankable.

## The CLI became an agent API

- Generation: #4.
- Problem: external coding agents needed a stable way to inspect, modify, deploy and debug workflows.
- Observed implementation: the first commit combined a human TUI with stable JSON and recursively machine-readable command docs explicitly intended for agents/tooling. It was created before the backend “API for CLI use” and rapidly expanded into flows/runs/triggers/waits/resources/installations plus skill/docs, authentication, delimiter repair and contract tests.
- Previous approach: product web UI and internal/direct API surfaces.
- Why this interface: interview says the decision was primarily architectural argument rather than measurement: coding agents already knew shell environments; a documented CLI plus skill was expected to use less context; MCP was viewed as overcomplicated/token-heavy at the time.
- Response: a conventional CLI shared by human inspection/automation, external coding agents and—later—the first-party hosted coding agent.
- Remaining tradeoffs: auth/bootstrap, output stability, duplicated docs/concepts, version skew.
- Evidence: CLI `9d5f3e0`, `f6f21d1`; backend `6feaca1f6b`; January CLI↔API integration commits; hosted runtime prompt and bootstrap lineage from `e2c3e69205`/`92e12c55a3`.
- Interview evidence: TUI-for-humans and CLI-for-agents was intentional from the beginning. The TUI quickly lost to the web app, but the CEO/largest power user later reportedly used the web rarely or almost never.
- Confidence/publication: high code/history confidence; PUBLIC.
- Possible thesis: the useful agent interface was a programmable control surface with ordinary operational semantics, not a bespoke pile of chat tools.
- Scope: likely whole article or central section of agent-first workflow story.

## When the richest interface was not the power-user interface

- Generation: #4.
- Problem: a new SaaS platform appeared to require a rich, familiar web application even though agents could operate its programmable control surface directly.
- Concrete tension: Andreas argued early that web might not be central for power users but did not gain agreement; the TUI was replaced by a rich web app. The CEO/largest user later reportedly used web rarely or almost never.
- Previous/simple approach: human TUI plus agent CLI, followed by the conventional SaaS web investment.
- Engineering/product response: CLI, skills and eventually hosted coding agents remained first-class while web provided the mainstream product surface.
- Tradeoffs: a CLI is less approachable for ordinary users; web still matters for onboarding, visualization and trust; one power user's behavior cannot establish a universal interface rule.
- Evidence: initial CLI/TUI history plus later hosted CLI reuse. Usage outcome is INTERVIEW-CONFIRMED only; aggregate analytics not inspected.
- Publication: PUBLIC-HIGH-LEVEL. Andreas considers the underlying observation publishable; exact CEO attribution and wording should still be reviewed during drafting.
- Possible thesis: when agents become the operators, the power-user interface may be the control surface rather than the richest human UI.
- Scope: potentially a whole article when combined with CLI/hosted-agent mechanics; otherwise the strongest opening/ending observation for the #4 flagship story.

## From assistant feature to programmer/user of the platform

- Generation: #3→#4.
- Problem: product-specific agents could research and report, but could not freely construct new operational behavior.
- Observed transition: SCI agent chat on 2025-11-11; general flows runtime on 2025-11-26; dual human/agent CLI on 2025-12-12; hosted coding-agent control plane on 2026-04-09; first web panel in April.
- Previous approach: domain-specific research chat, data subscriptions and fixed report workflows.
- Response: inspectable workflow source, constrained runtime, CLI/control surface, marketplace/installations and later hosted coding agent.
- Remaining tradeoffs: human UI versus source, security, runtime correctness, discoverability and ownership boundaries.
- Evidence: product history #3/#4; `e2c3e69205`, `92e12c55a3`, `f48f3a7647`; current hosted-agent runtime prompt directly requiring the pre-authenticated Breyta CLI and skill.
- Interview evidence: all five concepts from the SCI experiment carried into #4 thinking—code as interface, small primitives, SCI sandboxing, progressive disclosure and the agent as programmer. #4 also hypothesized that many “build me an app” demands were really demands for backend workflows rather than new frontends.
- Confidence/publication: high architecture evidence; HOLD on first-party Codex details.
- Possible thesis: once the agent is a programmer, the platform must expose source, execution boundaries and inspectable operational feedback.
- Scope: likely flagship whole article.

## Dogfooding the external-agent interface inside first-party chat

- Generation: later #4.
- Problem: provide first-party chat without creating a separate, weaker agent integration architecture.
- Previous approach: users brought external coding agents to the Breyta CLI; Breyta's earlier chat used a purpose-built SCI/function loop.
- Response: run Codex/OpenCode as the first-party agent and give it the same pre-authenticated CLI, skill and workspace contract. Reuse harness capabilities such as web research and skills.
- Concrete failure pressure: the surrounding control plane accumulated substantial session, VM readiness, streaming, stop and recovery complexity.
- Retrospective: Andreas considers it possible the architectural reuse was not worth the operational complexity. No single remembered incident is available.
- Evidence: hosted runtime prompt; `e2c3e69205`, `92e12c55a3`, April–May hardening sequence; interview 2026-08-26.
- Publication: HOLD until infrastructure/security review.
- Possible thesis: reusing the same agent interface removed one kind of duplication but introduced the operational cost of embedding a real coding harness behind web chat.
- Scope: potentially whole article; provides valuable counterweight to an overly celebratory agent-first thesis.

## AI chat changed identity three times

- Generations: #2/#3/#4.
- Problem: the same UI label “chat” sat over materially different contracts.
- Observed sequence: project/file research assistant with citations; configurator/operator for recurring research agents; SCI code executor; later hosted coding agent.
- Previous/simple approach and failure: varies by transition; requires focused chat lineage pass.
- Response/tradeoffs: progressively larger application access and stronger execution/isolation requirements.
- Evidence: research chat history, SCI agent chat commits, hosted runtime.
- Interview evidence: pending.
- Confidence/publication: medium; risk of becoming a chronology dump.
- Possible thesis: retain only if one concrete recurring design pressure links all transitions.
- Scope: supporting material unless a sharper failure story emerges.

## Python spreadsheet agent as the bridge to general code execution

- Generation: #3.
- Problem: open-ended tabular questions did not fit fixed prompt pipelines.
- Observed response: isolated Python with preloaded data, iterative tool calls, stored code/results/history, then conversion into report findings.
- Previous approach/failure: prompt-based CSV/findings passes; production comparison pending.
- Remaining tradeoffs: external execution service, data movement, serialization and debugging.
- Evidence: `1ec68ceaeb`, `agent_findings.clj`, `python_executor.clj`.
- Interview evidence: 2026-08-26 confirms an agent running Python on a VM was already used for Excel/tabular analysis. Python as the complete product interface and Unix containers were discussed rather than established implementations.
- Confidence/publication: high mechanism confidence; PUBLIC-HIGH-LEVEL.
- Possible thesis: the first useful code-execution boundary appeared around a task where composition and calculation were unavoidable.
- Scope: supporting material or a narrower whole article.

## A product pivot preserved more substrate than the UI implied

- Generation: #1→#2.
- Problem: rebuild product thesis quickly while retaining auth/workspaces/integrations and operational substrate.
- Observed symptom: `breyta-ai-frontend` was introduced as a broad copy including CRM-era UI plus `ResearchTrack`; backend #1 services/libraries coexisted with research code before later purge.
- Response: incremental pivot within existing repos rather than clean rewrite.
- Remaining tradeoffs: legacy surface, ambiguous boundaries, later purge/migration cost.
- Evidence: `b29fa4a65`, April–May 2024 backend sequence, tree diffs 2024→2025.
- Interview evidence: 2026-08-26. CRM/data activation had customers but insufficient growth for a VC-backed company; the company explicitly explored a pivot. The team's prior user-testing experience informed the research direction, and reuse was deliberate.
- Confidence/publication: CODE-CLEAR/HISTORY-CLEAR/INTERVIEW-CONFIRMED; PUBLIC-HIGH-LEVEL.
- Possible thesis: product generations are often overlapping hypotheses in one codebase, not versions separated by rewrites.
- Scope: possible whole article if there was a concrete engineering decision/failure.

## Recurring research made time and delivery part of correctness

- Generation: #3.
- Problem: ongoing monitoring/reports introduced schedules, freshness windows, subscribers and notifications.
- Observed evolution: a July feature-flag/mock became backend CRUD; the first August report run reused the #2 project pipeline as a “shadow project” and briefly duplicated state into a second report collection; October introduced a dedicated Temporal agent-report workflow with explicit findings/synthesis/change/memo/delivery stages.
- Transition motivation: shadow projects deliberately let the new feature reuse #2. The inherited workflow crossed a TypeScript Temporal worker, Firestore `asyncRequests` and Clojure polling/execution workers. The later workflow was a clean Clojure rewrite because this arrangement had coordination weaknesses and bugs; interview does not identify the analysis model itself as the rewrite pressure.
- Observed response: daily/weekly/monthly schedules, overlap cancellation, catch-up and pause semantics, date/data-source filtering, status/dependency guards, subscriber memos, public reports and delivery state.
- Concrete engineering pressure: the old workflow history contains fixes for nondeterministic Firestore access, stranded cells/synthesis, signal timeouts, duplicate triggers/delivery and a large October hardening rewrite. The new workflow then received repeated source-filter, timestamp and no-data fixes. Code/history does not establish which were production incidents.
- Remaining tradeoffs: duplicate/missed schedules, stale windows, notification correctness and accumulation.
- Evidence: `78838e6f160`, `f07fc5060ae`, `a3c3a61bb4`, `734961e6ef`, TypeScript workflow `787f4ca5c`/`5c90429b2`, Clojure rewrite `af094ee7e4` and the October follow-on sequence.
- Interview evidence: the technical transition above is confirmed. Product context: the company reduced from six to three employees; the remaining team wanted to build something they needed themselves, particularly continuous analysis of newsletters/websites, rather than continue UX qualitative analysis. The board again pressed for VC-scale growth because #2 had customers but too few and weak growth. Andreas considers this publishable.
- Confidence/publication: high mechanism/history confidence; PUBLIC-HIGH-LEVEL.
- Possible thesis: moving from on-demand AI to continuous AI turns orchestration semantics into product semantics.
- Scope: whole article only with concrete incidents/failures.

## Generated research became knowledge—and a forbidden future input

- Generation: #3.
- Problem: recurring reports should accumulate into durable organizational knowledge, but generated conclusions can contaminate later analysis if they are treated as fresh source evidence.
- Observed transition: `af9621c666` stored each completed report as an asset/transcript containing memo, changes and synthesis and described it as a long-term research artifact. `59c43fbde1`, committed immediately afterward, excluded assets with a `reportId` from automatic analysis.
- Previous/simple approach: reports existed as run output rather than durable source-shaped knowledge.
- Engineering response: preserve reports for retrieval/history while putting a one-way boundary around scheduled source selection.
- Remaining tradeoffs: older conclusions may still be useful context; exclusion loses potentially valuable longitudinal synthesis; inclusion risks amplification, circular citation and stale claims.
- Interview evidence: Andreas does not remember the reason and does not recognize a concrete self-feedback incident. The contamination framing is therefore INFERENCE only.
- Confidence/publication: CODE-CLEAR/HISTORY-CLEAR for the boundary; PUBLIC-HIGH-LEVEL.
- Possible thesis: a continuous AI system needs provenance classes because its own output is useful knowledge but unsafe evidence.
- Scope: potentially a whole article if motivation/failure can be recovered; otherwise a strong section in the continuous-research story.
