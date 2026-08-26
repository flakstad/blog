# Breyta engineering article series

Status: PROPOSED PORTFOLIO — research plan, not article prose or publication commitment. Updated 2026-08-26.

The recommended portfolio is four core essays plus two reserves. The division is designed to avoid a chronological product tour and to preserve one concrete engineering mechanism per article.

## 1. First extract, then synthesize

- Thesis: reliable multi-document qualitative analysis required an evidence-bearing intermediate representation. Splitting extraction per file from synthesis across findings scaled farther and preserved exact provenance better than putting the corpus in one prompt.
- Strongest opening: the first multi-file architecture put every selected file into one prompt. It failed on file count, hallucinations and precise references—the exact properties UX researchers needed when analyzing video interviews.
- Likely headings:
  - The obvious first architecture
  - A finding is an intermediate representation
  - From three layers back to two
  - Remapping compact IDs to durable evidence
  - The reference is part of the product
  - What a 2026 long-context model might change
- Reserved mechanisms: combined-corpus failure; per-file findings; nuggets/findings/themes dead end; findings/synthesis simplification; compact ID remapping; exact quotes/timestamps; clickable synthesis/chat references; synchronized transcript/audio/video navigation; syntax repair versus semantic verification.
- Material deliberately not consumed: Elasticsearch/embedding retrieval; recurring-report orchestration; generic prompt-engineering lessons.
- Publication considerations: avoid customer material. State “no remembered incorrect references” only as recollection, never measured accuracy. Distinguish syntactic repair from claim verification.
- Evidence confidence: high. Sufficient for a whole article.

## 2. We changed course at six tools

- Thesis: once the roadmap required many composable capabilities, the useful move was to change the abstraction before a 20-tool catalogue shipped: one constrained code-execution tool, small primitives and documentation loaded on demand.
- Strongest opening: the remembered “30-tool agent” never existed. Six tools existed; the roadmap showed where it was heading, and the team chose to run an experiment before paying that cost.
- Likely headings:
  - Six tools, not thirty
  - Python had already proved the value of execution
  - Code as the composition layer
  - SCI, curated host capabilities and what remained outside
  - Documentation and state on demand
  - An idea donor, not a production victory lap
- Reserved mechanisms: Python spreadsheet predecessor; one `execute_clojure` tool; SCI namespaces; atoms/state; Malli chronology; `(doc ...)`; lazy fields; bounded/windowed reads; result hints; tool/result loop; transition into #4 thinking.
- Material deliberately not consumed: the #4 workflow runtime implementation; CLI details; unsupported reliability/latency claims; the fictional shipped 20–30-tool catalogue.
- Publication considerations: contemporary token figures are counted/estimated and latency estimated. Customer usage may have been limited. Sandbox absolutes require security review.
- Evidence confidence: high for problem framing, code and conceptual influence; medium/low for production outcome. Sufficient if written explicitly as an architectural experiment.

## 3. When the agent wrote the Elasticsearch query

- Thesis: retrieval quality depended on the task. Model-composed lexical queries often supplied precision that embedding-only experiments lacked, while embeddings remained useful for cross-language and broader recall; the eventual answer was hybrid rather than ideological.
- Strongest opening: embeddings found things that might be relevant—even across languages—but often returned too much weak material. Letting the model formulate Elasticsearch query syntax was qualitatively better for finding exact support.
- Likely headings:
  - What “relevant” meant in a research corpus
  - The embedding-only experiments
  - Giving the model a query language
  - Precision, highlighted fragments and repeated searches
  - Where lexical search failed
  - Why the implementation ended hybrid
- Reserved mechanisms: OpenAI vector-store and embedding experiments; `file_search`; fuzzy AND defaults; phrases/boolean/proximity/boosting/wildcards; highlighted fragments; Elasticsearch `semantic_text`; hybrid `should` query.
- Material deliberately not consumed: the findings/synthesis evidence hierarchy except as brief context; generic RAG explanation; any claim that Elasticsearch universally beats embeddings.
- Publication considerations: the comparison was qualitative, not benchmarked. Define the task shape and chronology narrowly.
- Evidence confidence: high for implementations, high for qualitative recollection, absent for measured superiority. Sufficient for a careful essay.

## 4. What changes when the agent is a programmer of the platform?

- Thesis: an agent-first workflow platform needs inspectable source, small programmable primitives, constrained execution and operational feedback—not merely more buttons or more function tools.
- Strongest opening: #4 began with the question of whether users asking agents to “build an app” often needed backend behavior rather than another frontend. The eventual largest power user reportedly barely used the rich web surface.
- Likely headings:
  - From research agent to platform programmer
  - Workflows as source
  - The runtime boundary and ownership boundary
  - A control surface agents can inspect
  - Reuse and marketplace as program distribution
  - Where humans still need an interface
- Reserved mechanisms: #3 conceptual lineage; Clojure/EDN flow source; SCI execution boundary; agent generation/modification; stable identifiers; validation/compile/deploy/run feedback; marketplace/installations; human web versus programmable control surface.
- Material deliberately not consumed: detailed CLI chronology and hosted session machinery, which are reserved for articles 5 and 6; claims that Andreas built the core workflow runtime.
- Publication considerations: clearly attribute the initial runtime primarily to Vegard and focus Andreas's voice on product thesis, web/chat/CLI and integration work. Treat the CEO observation as one power-user case.
- Evidence confidence: high. Sufficient for a flagship article.

## Reserve 5. The CLI became the agent API

- Thesis: a documented CLI with stable structured output became the shared interface for external agents, automation and later Breyta's own hosted agent.
- Strongest opening: the CLI's first commit already contained a human TUI, stable JSON and recursively machine-readable command documentation explicitly intended for agents. The TUI faded; the programmable contract survived.
- Likely headings:
  - TUI for humans, commands for agents
  - Source lifecycle as ordinary shell operations
  - Docs and skills as progressive disclosure
  - Why CLI instead of a large MCP/tool surface
  - Dogfooding the same interface internally
  - Versioning, auth and text-contract costs
- Reserved mechanisms: first CLI commit; `breyta docs`; JSON/EDN; pull/edit/push/deploy/run; skill bundle; delimiter repair; CLI↔API contract tests; hosted-agent CLI bootstrap.
- Material deliberately not consumed: hosted VM/session/streaming failure details; broad workflow-runtime thesis.
- Publication considerations: CLI-versus-MCP token claims are architectural judgment, not a benchmark. Avoid claiming one power user represents general adoption.
- Evidence confidence: high. Sufficient independently, but publish only if article 4 keeps CLI treatment compact.

## Reserve 6. Reusing the agent interface was the easy part

- Thesis: giving first-party Codex/OpenCode the same CLI as external agents removed a domain-integration fork, but embedding a real coding harness behind web chat introduced a distributed process/session system whose complexity may not have been worth it.
- Strongest opening: domain dogfooding succeeded—the hosted agent used the same pre-authenticated CLI and skill—but the surrounding control plane accumulated readiness, streaming, stop, recovery and session-consistency machinery.
- Likely headings:
  - Why run a real coding harness
  - One domain interface, two operating modes
  - Chat becomes a distributed process controller
  - Streaming and transcript consistency
  - Isolation and lifecycle boundaries
  - Reuse can move complexity rather than remove it
- Reserved mechanisms: Codex/OpenCode bootstrap; shared CLI/skill; session allocation/reuse/restart/stop; persisted events; live streaming; readiness/watchdog/recovery history.
- Material deliberately not consumed: sensitive infrastructure coordinates, credential wiring, containment specifics or unverified incident narratives.
- Publication considerations: HOLD for security review. The retrospective “perhaps not worth it” is interview judgment; a representative customer outcome or failure would strengthen the piece.
- Evidence confidence: high architecture/history, medium outcome. Do not commission yet without review.

## Material not currently assigned a standalone article

- Continuous research and the TypeScript→Clojure Temporal rewrite: strong supporting dossier, but no remembered incident yet makes it better than the four core essays.
- Product pivots #1→#2 and #2→#3: valuable openings/context, not a chronological article.
- Generated reports excluded from future automatic analysis: interesting code boundary with unknown motivation; retain as supporting evidence only.
- “AI chat through three products”: useful connective tissue, but currently a chronology rather than a story.

## Relationship to the Kari series

Kari already reserves articles about realtime state, application-owned authority, real-model testing, prompt compilation/progressive disclosure, operation-result instructions and delivery correctness. Breyta should not repeat those theses generically.

The complementary picture is:

- Kari: correctness at probabilistic/realtime/external-effect boundaries.
- Breyta #2: evidence-bearing intermediate representations and retrieval over multi-document corpora.
- Breyta #3: code execution as an agent composition interface.
- Breyta #4: workflow source, CLI/control surfaces and agents as platform programmers.

Progressive disclosure appears in both histories, but should play different roles: instruction lifetime and local policy in Kari; capability discovery and context economy in Breyta.
