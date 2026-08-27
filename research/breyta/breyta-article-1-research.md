# Breyta article 1 research: First extract, then synthesize

Research memo. Not an article draft.

This memo deepens the highest-ranked story in the Breyta research package. It
supersedes one important gap in the earlier inventory: the discarded
combined-corpus implementation has now been recovered from Git.

Evidence labels used below:

- `CODE-CLEAR`: the implementation or contract is directly visible in code.
- `HISTORY-CLEAR`: commit chronology or commit text directly establishes the
  change, but not necessarily its motivation or production impact.
- `INTERVIEW-CONFIRMED`: Andreas's recollection establishes motivation,
  experience or customer behavior. This is not a measurement.
- `INFERENCE`: the conclusion follows reasonably from adjacent evidence but is
  not stated directly.
- `GAP`: the repository and interview evidence do not resolve the point.

## 1. Core story

### April 2024: the apparently obvious architecture

The earliest recovered research prototype was small and direct.

- Frontend commit `b4db83911` (2024-04-08), `transcript insights page`, accepted
  one transcript as text, URL or ID.
- Backend commit `39b37b46f6` exposed a `transcriptionInsights` GraphQL resolver
  that sent one system message and the transcript as one user message to
  `gpt-4-turbo-preview`.
- Frontend commit `c6ca34cb3` (2024-04-10), `list available transcripts, allow
  choosing which transcripts goes into llm`, let the user select several
  transcripts and concatenated them with:

  ```ts
  selectedTranscriptText.join('\n\n')
  ```

- Commit `d841d4ca4` (2024-04-11) made the combined input more explicit. It
  assembled a single prompt containing a research plan, notes, desired output
  format and sections named `Transcript #1`, `Transcript #2`, and so on.

This is the recovered all-files predecessor. `[CODE-CLEAR]`

The first version was not unreasonable. It matched the visible product action:
select interviews, describe the research question, and ask a capable model to
analyze them. It also minimized orchestration and intermediate state.

Andreas remembers that this was far from good enough in every important
dimension: it did not scale to enough files, hallucinated more, and could not
produce sufficiently precise references. He does not remember a specific
threshold, report or characteristic malformed answer. `[INTERVIEW-CONFIRMED]`

There is no benchmark, evaluation set or production incident artifact supporting
those comparative claims. Git proves what was sent to the model, not what the
model returned or why the architecture changed.

The transition was fast but not clean. Per-transcript findings appeared in the
production-oriented report path by roughly 2024-04-17, less than a week after
the combined-input prototype. The original page and the newer report pipeline
coexisted for a period; the old research-track page was removed later as part of
a broader cleanup. It would be inaccurate to write that one commit deleted the
all-files approach and replaced it with the final architecture.

### First decomposition: generate evidence per transcript

The early report pipeline separated two jobs:

1. inspect an individual transcript and extract relevant observations;
2. combine observations after every selected transcript had been processed.

Repository milestones include:

- `8d41989ce1` (2024-04-22): text findings followed by a summary across
  findings;
- `6a10912c36` (2024-05-15): parallel findings generation;
- `da475e71c8` (2024-06-17): explicit project orchestration waiting for the
  selected transcripts before continuing.

The first per-file versions should not be described as identical to the mature
January 2025 contract. The data model, reference representation and application
surface continued to change through 2024. `[HISTORY-CLEAR]`

The stable design idea was already present: the cross-file call should not have
to rediscover evidence in the raw corpus. A prior call would extract a smaller
set of source-bound observations from each file.

### An epistemic boundary, not only a scaling trick

The decomposition was also a product decision about which work the model should
perform.

Andreas remembers a period when Breyta attempted to produce more analytical
conclusions. It was too easy for the model to hallucinate or speculate.
Meanwhile, the UX researchers using the product considered pattern recognition,
deep connections and interpretation the most important and professionally
valuable part of their own job. They preferred compressed, traceable facts and
wanted to draw the conclusions themselves. Chat remained a surface where a user
could explicitly request freer analysis. `[INTERVIEW-CONFIRMED]`

The exact dates and implementation of the more analytical experiment have not
been recovered. It must not be assigned to a particular commit or prompt stage.
`[GAP]`

This makes the eventual architecture more specific than generic map/reduce:

- extraction was question-directed but constrained to source-supported facts;
- the intermediate result was visible and editable application data;
- synthesis compressed facts across sources without being granted authority to
  invent an interpretation;
- the human researcher retained the final analytical step.

### December 2024: nuggets, then findings, then themes

The intermediate representation briefly became a three-level domain model.
Snapshot `608845d144` (2024-12-13) exposes the mechanism clearly.

#### Nuggets

Long input was split into pieces of approximately 6,000 tokens. Transcript CSV
was split along rows and the header was repeated. Piece-level model calls could
run in parallel with `pmap`.

Each nugget had approximately this shape:

```clojure
{:id           "generated-uuid"
 :nugget       "A self-contained factual observation"
 :citation     "One or more exact source quotes"
 :timestamp    183420
 :transcriptId "persistent-transcript-id"}
```

The prompt asked for exhaustive, objective observations, without conclusions or
extrapolation. Research context could focus the extraction, but did not license
interpretation. For Breyta transcripts, timestamps were checked against a
plausible range. `[CODE-CLEAR]`

The purpose was deliberate: extract exhaustive coverage before asking another
call to consolidate it. `[INTERVIEW-CONFIRMED]`

#### Findings

For each transcript, Breyta passed that transcript's nuggets to a second model
call. Durable nugget UUIDs were replaced with temporary integers. The output was
approximately:

```clojure
{:finding   "A broader factual observation"
 :category  "Research-question-related category"
 :nuggetIds [0 3 7]}
```

The backend mapped the integers back to durable nugget UUIDs. A finding could be
based on one nugget but was normally intended to consolidate several while
retaining nuance. The prompt still prohibited interpretation, conclusions and
extrapolation. `[CODE-CLEAR]`

#### Themes

Only after all per-transcript findings existed did a third model call receive
the project's findings, grouped by category and again identified by temporary
integers. A theme had a title, summary and supporting finding IDs. The prompt
required support from at least two findings and asked the model to retain
contradictions and varying perspectives.

Execution was therefore:

```text
transcript pieces --parallel--> nuggets
all nuggets for one transcript --> findings
all findings for the project   --> themes
```

There were at least three semantic model stages. A long transcript could require
several calls in the nugget stage. `[CODE-CLEAR]`

The architecture worked. Andreas's recollection is not that it was a failed
analysis model, but that the extra model layer did not justify the added AI cost
and waiting time. He cannot recall a specific painfully slow report or measured
latency. `[INTERVIEW-CONFIRMED]`

No commit message directly states that cost or latency motivated its removal.
Commit history establishes that the architecture existed and that new projects
later defaulted to the simpler synthesis path; it does not establish why.

### January 2025: collapse extraction into one per-file call

The replacement did not abandon the nugget discipline. It fused the nugget and
finding jobs.

Commit `5f6e3aca2e` (2025-01-09) introduced findings as answers to a user prompt
against one file. In the mature `findings2.clj` and `findings2_prompt.txt`, each
call received:

- the project's research context;
- exactly one file or transcript as `dataCsv`;
- one user question or area of focus;
- output language;
- where relevant, an instruction to exclude interviewer statements.

The input was delimited as project context, file text and user prompt. The model
was told to be thorough but to return an empty findings list when the file did
not contain relevant evidence.

For a timestamped Breyta transcript, the output contract was:

```clojure
{:findings
 [{:finding "A concise, factual answer based on this one file"
   :citations
   [{:quote    "An exact verbatim excerpt"
     :start_ms 183420}]}]}
```

The prompt retained almost verbatim the central nugget constraints:

- factual observations;
- directly related to the user prompt;
- no interpretation, conclusions or extrapolation;
- at least one verbatim citation per finding;
- exact `start_ms` from the source row;
- no translated citation text.

Andreas remembers that models, prompts and the surrounding harness had improved
enough to do extraction and per-file consolidation in one call. The
simplification was not merely an acceptance of worse coverage to save money.
`[INTERVIEW-CONFIRMED]`

At generation time, each citation received its own UUID (`20c23d585c`,
2025-01-09). The commit message says this supported an editable quote. The
finding itself received a durable Firestore document ID when persisted.

The async worker added `workspaceId`, `projectId`, `transcriptId` and
`userPromptId`, then created each finding as its own Firestore document inside a
transaction. `from-firestore` injected the Firestore snapshot ID into the
application map as `id`. `[CODE-CLEAR]`

The finding was therefore not hidden model scratch space. It was a durable,
queryable, user-visible domain object with its own identity and provenance.
Andreas confirms that this was a conscious design, inherited from the nugget
model, rather than an accidental consequence of the orchestration.
`[INTERVIEW-CONFIRMED]`

### Cross-file synthesis: deliberately less context

The mature January synthesis path is in `answer_across_findings.clj`, introduced
through `ad83cd3749`, `f24d565d4f` and `2cdb6e13ec` (2025-01-09–17).

Before the model call, Breyta reduced every stored finding to:

```clojure
{:id        "persistent-finding-id"
 :finding   "finding text"
 :citations ["verbatim quote one" "verbatim quote two"]}
```

It then placed those maps in a sorted index keyed by compact integers:

```clojure
{0 {:finding "..." :citations ["..."]}
 1 {:finding "..." :citations ["..." ]}}
```

The model received the compact IDs, finding text, citation text and the user
prompt. It did **not** receive:

- the raw files or transcripts;
- timestamps;
- transcript IDs or file names;
- project context as a separate synthesis input;
- citation UUIDs;
- persistent finding IDs.

This was not retrieval over the original corpus. Synthesis was bounded by what
the per-file extraction calls had retained. Missing evidence could not be
recovered at this stage. `[CODE-CLEAR]`

The synthesis prompt asked for a coherent Markdown response with frequent
references such as `[0]` or `[0,2]`. It explicitly required factual wording,
source-count discipline, preservation of contradictions, and no assumptions or
extrapolation. Here, "synthesis" meant organizing and compressing facts across
files, not delegating the researcher's interpretive conclusion to the model.
`[CODE-CLEAR, INTERVIEW-CONFIRMED]`

### Temporary IDs became durable application references

After generation, backend code parsed numeric reference groups and resolved each
number through the private index. A reference such as:

```text
[0,2]
```

became application markup containing the persistent finding IDs:

```html
<finding id="firestore-finding-id-for-0" />
<finding id="firestore-finding-id-for-2" />
```

The exact grouping/rendering evolved, but the boundary is stable: the model used
short local identifiers; the application stored references to durable objects.
`[CODE-CLEAR]`

This achieved more than reducing tokens:

- the model did not have to reproduce opaque Firestore IDs correctly;
- internal IDs did not consume the synthesis prompt;
- generated prose could be persisted using application-level references;
- a finding could retain citations, transcript identity and later UI behavior
  without duplicating those fields into the synthesis document.

The first test set covered valid single and multiple references, several
reference groups, no references, empty text, existing finding tags and a mixture
of existing and new references. It did not cover unknown integers,
non-numeric IDs or malformed mixed lists.

An unknown numeric reference followed a path that could produce a tag with a
missing/`null` persistent ID. A later frontend could render an unresolved
reference as a minimal `Finding F` rather than a usable button. Andreas remembers
seeing missing buttons or `Finding F` in the product, but not the triggering
report, model or lifecycle event. `[CODE-CLEAR, INTERVIEW-CONFIRMED]`

In September 2025, commit `8c0b62476a`, `ensuring proper synthesis references`,
expanded the parser after a switch from Claude Sonnet to GPT-4.1 produced bad
reference formatting. Tests were added for mixed valid/invalid IDs, empty
brackets, quoted strings or file names, ordinary Markdown links and other
bracket text. Invalid IDs were filtered rather than blindly converted.

This was reference-syntax validation. It did not verify that the prose claim was
semantically entailed by the referenced finding or citation.

### Provenance became a traversable product path

The mature application chain was:

```text
synthesized statement
  -> <finding id="..." />
  -> durable finding object
  -> one or more citation objects
  -> transcriptId + quote + start_ms
  -> selected finding/citation in URL state
  -> transcript scroll and highlight
  -> audio/video seek to start_ms
```

The frontend Markdown/document layer parsed finding tags and resolved them
against loaded findings. A reference rendered as a button/popover containing the
full finding and its citations. Finding tags could also be copied, including by
keyboard shortcut or context menu, and inserted into editable documents.

Selecting a citation propagated finding ID, citation ID, transcript ID and
timestamp into application state. `Transcript.tsx` found the nearest transcript
row by timestamp and used approximate word matching—roughly `0.9` similarity—to
locate and highlight the quote. `MediaViewer.tsx` converted milliseconds to
seconds and sought audio, video or YouTube playback.

The mature citation did not preserve `row_id` as its primary locator. It used an
exact model-returned `start_ms` plus quote text. Timestamp provided a robust
media location; tolerant text matching provided the visible excerpt. This
dual-locator design was practical but imperfect. `[CODE-CLEAR]`

Repository history contains concrete repairs:

- retry quote matching after dropping a leading word (`1fb2f9134`, 2024-08-22);
- fixes for last-word/off-by-one and rerendering behavior in October 2024;
- a crash involving parentheses in quotes plus extracted matching tests
  (`c10db1b09`, 2025-01-23);
- selection, scrolling and highlight updates when navigating citations
  (`e33519047`, `d2592e2a1`, `c76553697`, 2025-01-21);
- playback corrected to use timestamp milliseconds rather than seconds
  (`26ca51bf1`, 2025-03-07);
- handling of deleted or missing assets in the surrounding evidence UI.

Some malformed-reference repairs elsewhere in Breyta concern chat
`<reference ...>` tags rather than synthesis `<finding ...>` tags. They show a
related product-wide provenance problem but must not be presented as failures in
the same parser.

### Editing preserved identity, not full consistency

The application allowed stored findings and later transcripts to be edited.

Backend commit `91c76354d2` and frontend commit `9bc20c25c` (2025-01-20) added
`edit-finding`, but the implementation updated only the finding's `:finding`
text. Citation UUIDs had already been added in anticipation of editable quotes,
but a separate shipped citation-text update path has not been recovered.
`[CODE-CLEAR]`

Andreas remembers editing as primarily motivated by small transcription and
quotation errors. The citation UUID commit supports the intent, although the
located write path is narrower than the recollection. He does not remember the
missing implementation details. `[INTERVIEW-CONFIRMED, GAP]`

Transcript editing arrived in February–March 2025 with history and "correct
single/correct all" operations. The code constrained structural fields such as
`row_id`, `start_ms` and speaker while allowing transcript text corrections.

Customers did not normally regenerate findings and synthesis after correcting a
transcription error. `[INTERVIEW-CONFIRMED]` Consequently:

- stable finding IDs continued to resolve;
- timestamps could still open the right media moment;
- an old citation quote could differ from the corrected transcript;
- tolerant matching might still locate the nearby text;
- synthesized prose could describe the earlier finding text after that finding
  had been edited.

The final three points are consequences of the code and remembered workflow,
not recovered customer incidents. `[INFERENCE]`

Commit `403f244ede` (2025-02-07) stored synthesis versions before overwrite, but
this did not make every referenced finding or transcript an immutable versioned
dependency. The provenance graph preserved navigation better than it preserved
historical snapshot consistency.

### What customers did with the chain

Customers mainly used Breyta for qualitative analysis of video interviews.
Clickable sources and synchronized playback were critical and well received.
Inspecting the source was a normal and essential action in polished synthesis
documents and in project/workspace chat. Users checked wording, speaker,
surrounding context, nuance, tone and whether a statement had been overinterpreted.
`[INTERVIEW-CONFIRMED]`

Andreas cannot remember a customer or team member finding an incorrect reference
in Breyta #2. That supports a recollection of high perceived reliability; it is
not evidence that references were always correct. He does remember visible
missing reference buttons/`Finding F`, which is a different failure class:
resolution or formatting rather than necessarily false semantic support.

The human division of labor matters:

- Breyta extracted and compressed facts with navigable evidence;
- the researcher inspected source material and owned patterns, deep connections
  and interpretation;
- chat could be used when the researcher deliberately wanted freer model
  analysis.

Whether Breyta replaced manual coding/affinity mapping or mainly supplemented it
is unresolved. `[GAP]`

### Remaining weaknesses

The mature architecture did not solve all reliability problems.

- Extraction omissions bounded synthesis. A fact absent from findings was
  unavailable to the cross-file model.
- Finding compression could erase nuance before synthesis.
- More calls created more orchestration, persistence and retry state.
- Temporary-reference parsing remained model-sensitive.
- Syntactically valid finding IDs did not prove semantic support.
- Quotes and source text could diverge after editing without regeneration.
- Stable object identity was not the same as immutable provenance.
- No controlled comparison quantified hallucination, reference accuracy,
  coverage, cost or latency.
- No experiment establishes how current long-context models would change the
  result.

The honest story is not "the staged pipeline made hallucination impossible."
It is that Breyta moved model work into narrower, inspectable jobs; made the
intermediate evidence part of the product; tried an extra level of structure;
removed it when the models and harness could combine two extraction stages; and
still carried ordinary distributed-state and generated-syntax failures.

## 2. Best concrete stories

Ranked by memorability and usefulness to the eventual article, not by technical
sophistication.

### 1. `Finding F` instead of a citation button

- The compact-reference mechanism normally converted `[0]` into a durable
  finding tag.
- The first parser did not test unknown or malformed IDs.
- The frontend had a minimal fallback when it could not resolve a finding.
- Andreas remembers actually seeing missing buttons or `Finding F`.
- Why memorable: a small, visible symptom exposes the entire contract between
  generated syntax, ID remapping, persistence and UI resolution.
- Limitation: no specific report or exact root cause is remembered.

### 2. The model never saw the IDs users clicked

- Synthesis used small integers.
- Backend privately remapped them to Firestore finding IDs.
- The UI used those durable IDs to reveal quotes, transcripts and media.
- Why memorable: a concrete boundary between a model-local representation and
  the application's persistent object graph.

### 3. One synthesized sentence could open the exact moment in a video

- Finding tag -> finding -> citation -> transcript -> approximate highlight ->
  `start_ms` -> synchronized playback.
- Source checking was normal customer behavior, not only an error-recovery path.
- Why memorable: provenance is visible as an interaction rather than an abstract
  metadata promise.
- Limitation: no attributable customer scene or usage metric exists.

### 4. The architecture that worked but was removed

- Nuggets exhaustively extracted facts from 6,000-token pieces.
- Findings consolidated nuggets per transcript.
- Themes combined findings across the project.
- The design worked, but the extra call layer was not worth its cost and waiting
  time once the model/prompt harness improved.
- Why memorable: an honest simplification rather than a failed prototype or
  inevitable final design.

### 5. The "all transcripts" implementation was literally a string join

- Selected transcript text was joined with blank lines, then improved to named
  `Transcript #N` sections in one prompt.
- It is an unusually concrete predecessor to the later object graph.
- Why memorable: the obvious implementation is easy for an engineer to
  recognize without calling it naive.
- Limitation: no specific bad output survives.

### 6. Two source locators because neither was enough alone

- `start_ms` selected the media moment and nearest transcript row.
- Approximate quote matching selected the visible words.
- History contains fixes for punctuation, parentheses, missing leading words,
  rerenders and millisecond/second confusion.
- Why memorable: exact provenance still required tolerant UI engineering.

### 7. Facts, not conclusions, was a customer-aligned retreat

- More analytical model output was tried and judged too speculative.
- UX researchers considered interpretation their core professional work.
- Breyta returned compressed evidence; chat offered a freer mode when requested.
- Why memorable: the product boundary contradicted the temptation to automate
  the most impressive-looking task.
- Evidence is interview-only and lacks a dated implementation artifact.

### 8. Correcting the source did not rewrite the analysis graph

- Findings and transcripts were editable.
- Users normally did not regenerate after correcting small transcription errors.
- IDs and timestamps kept navigation working, but old quotes or synthesis could
  remain stale.
- Why memorable: provenance systems have versioning semantics even when the UI
  presents editing as a small correction.
- No concrete customer harm is known.

### 9. Switching models broke bracket syntax months later

- September 2025 history explicitly ties stricter reference parsing to malformed
  output after a Claude Sonnet -> GPT-4.1 change.
- The fix had to distinguish finding IDs from Markdown links, file names and
  ordinary bracketed text.
- Why memorable: a mature evidence feature still depended on a tiny generated
  language whose grammar had not been fully specified.
- Chronologically later than the core #2 launch; use briefly.

## 3. Technical mechanisms worth explaining

### Evidence-bearing findings as domain objects

- What it did: represented a source-bound factual observation as stored data with
  its own durable identity, file/transcript relationship and citations.
- Why it existed: synthesis needed smaller inputs, users needed inspectable
  evidence, and the product deliberately separated factual compression from
  human interpretation.
- Useful detail: show a safe, synthetic finding map with quote and `start_ms`;
  explain that Firestore supplied the durable finding ID.
- Omit: Firestore helper implementation, workspace validation boilerplate and
  collection constants.
- Publication risk: low. Use invented sample content, never customer text.

### Parallel per-file extraction and dependency orchestration

- What it did: processed files independently, persisted results, then allowed
  synthesis only after the required cells were complete.
- Why it existed: increase corpus size without combining raw transcripts and
  make each output attributable to one file.
- Useful detail: user prompts and transcript cells ran in parallel; synthesis
  depended on completion state. Mention the transcript-ID readiness bug and
  stranded-cell recovery only if the article needs operational texture.
- Omit: full Temporal task-token protocol and service topology.
- Publication risk: low at high level. Avoid claiming commit titles prove
  customer incidents.

### Nuggets -> findings -> themes

- What it did: chunk-level exhaustive extraction, transcript-level consolidation,
  then project-level theme generation.
- Why it existed: ensure coverage before compression and only then look for
  cross-source patterns.
- Useful detail: the approximate 6,000-token split, temporary ID remapping at
  both boundaries, and minimum two findings per theme.
- Omit: prompt templating implementation and token guidepost comments unless
  needed to explain splitting.
- Publication risk: low. Cost/latency motivation must be attributed to Andreas's
  recollection, not Git.

### Fused per-file finding generation

- What it did: combined nugget extraction and finding consolidation into one
  question-specific call per file.
- Why it existed: improved models, prompts and harness could preserve acceptable
  quality without the extra semantic stage.
- Useful detail: exact input/output shape, empty-list behavior, verbatim quotes
  and exact timestamp contract.
- Omit: provider-selection commentary unless model reliability becomes part of
  the story.
- Publication risk: low. Do not claim equal quality was benchmarked.

### Compact synthesis IDs and durable-ID remapping

- What it did: exposed `0`, `1`, `2` to the model, retained persistent IDs
  privately, then converted generated numeric references into application tags.
- Why it existed: compact prompts and reliable separation between model-local
  syntax and persistent identity.
- Useful detail: one before/after payload and one `[0,2]` -> finding-tag example.
- Omit: full regex/parser source.
- Publication risk: low. Exact production ID formats should remain synthetic.

### Traversable provenance and synchronized playback

- What it did: resolved synthesis references into findings and citations, then
  scrolled, highlighted and sought media.
- Why it existed: customers needed to evaluate wording, context, speaker and
  interpretation quickly.
- Useful detail: show the complete contract chain and the split responsibility of
  quote matching versus timestamp seeking.
- Omit: component styling, modal variants and every URL parameter.
- Publication risk: low. Customer workflow should remain generalized unless a
  customer approves attribution.

### Reference parsing and repair

- What it did: normalized model-produced numeric references while preserving
  ordinary Markdown and rejecting unknown IDs.
- Why it existed: model formatting varied, including after model changes.
- Useful detail: `Finding F`, missing invalid-ID tests, and later mixed input such
  as `[0, invalid, 2]`.
- Omit: adjacent chat `<reference>` repairs unless clearly labelled as a
  different syntax.
- Publication risk: low. Never describe it as semantic citation verification.

### Editable evidence and version drift

- What it did: allowed correction of finding text and transcript text; stored
  synthesis history on regeneration.
- Why it existed: transcripts and quotes could contain small transcription
  errors.
- Useful detail: correction normally did not trigger regeneration, so object
  identity and navigation outlived content consistency.
- Omit: speculative consequences not observed in customer use.
- Publication risk: medium. Present as a known semantic tradeoff, not a data
  corruption incident.

## 4. Claims audit

| Claim | Evidence | Confidence | Safe wording | Unsafe wording |
|---|---|---|---|---|
| The first multi-file implementation put all selected files in one prompt | `c6ca34cb3`, `d841d4ca4`, `39b37b46f6` | High / `CODE-CLEAR` | "The first recovered multi-file prototype concatenated the selected transcripts into one model request." | "The production system always used one giant prompt before the rewrite." |
| The all-files prompt performed worse | Andreas remembers failure across file count, hallucination and reference precision; no evaluation artifact | Medium / `INTERVIEW-CONFIRMED` | "In our testing, I found the combined prompt far from good enough, especially as the corpus grew." | "Per-file extraction proved statistically superior." |
| Hallucinations improved after decomposition | Interview recollection; prompt/code chronology; no benchmark | Medium-low | "I experienced fewer hallucination and grounding problems after narrowing the calls." | "The architecture eliminated hallucinations" or a quantified reduction. |
| References improved after decomposition | Structured quote/timestamp contracts and UI chain are code-clear; comparative result is remembered | Medium-high for mechanism, medium for outcome | "The staged design made precise, navigable references an explicit output contract." | "Every reference was correct because generation happened per file." |
| Findings were objective facts rather than model conclusions | Nugget/findings/findings2 prompts; interview on product boundary | High | "We prompted extraction and synthesis to stay with source-supported observations and left interpretation to the researcher." | "The output contained no interpretation whatsoever." |
| Customers preferred to make analytical conclusions themselves | Andreas's recollection of UX researcher feedback | Medium-high / `INTERVIEW-CONFIRMED` | "The UX researchers we worked with told us that pattern finding and interpretation were the part they most wanted to own." | "UX researchers universally reject AI analysis." |
| Customers trusted the output | Source inspection was normal and evidence UI well received; no survey | Medium | "Clickable evidence was critical to how customers evaluated the output and was well received." | "Citations made customers trust all AI answers." |
| No incorrect references were found | Andreas cannot remember one in #2; `Finding F` and syntax errors did occur | Low as universal claim | "I cannot remember a customer or team member reporting a semantically wrong #2 citation." | "The citation system never produced an incorrect reference." |
| `Finding F` occurred in the product | Frontend fallback and Andreas recollection | High for symptom, low for exact cause | "I remember seeing missing buttons or the fallback label `Finding F`." | "GPT-4.1 caused every `Finding F` failure." |
| Three levels were too expensive and slow | Three-stage code; Andreas recollection; no cost/latency measurement or explicit commit rationale | Medium | "The three stages worked, but in my judgement the extra call did not justify its cost and waiting time." | "Removing nuggets reduced latency by X%" or "customers abandoned reports because they were too slow." |
| The simplified per-file call was good enough | Prompt transition plus Andreas recollection that models/prompts/harness improved | Medium-high | "By January, we judged one per-file extraction/consolidation call good enough to replace two stages." | "The new design had identical recall at half the cost." |
| Compact IDs reduced errors and tokens | Smaller payload is evident; no measured error comparison | High for smaller representation, medium for behavioral benefit | "Compact IDs kept persistent application identifiers out of the model-facing payload and shortened references." | "Compact IDs measurably eliminated ID-copying errors." |
| Reference repair verified support | Parser tests only validate/normalize syntax and known IDs | High negative finding | "The repair code checked reference syntax and whether an ID existed in the supplied index." | "Breyta verified that every claim was entailed by its citation." |
| Editing retained consistent provenance | Stable IDs/timestamps; no automatic regeneration; possible stale text | Low / contradicted in full form | "Editing usually preserved navigation, but did not update every downstream representation." | "The provenance graph remained historically consistent after edits." |
| Modern long-context models make this unnecessary | No test | Unknown | "I do not know where I would draw the boundary with current long-context models without testing it." | "Long context solves this now" or "this architecture remains necessary for every modern model." |
| Findings/synthesis was essential to quality and reliability | Andreas's production judgement; customer reception; no benchmark | Medium-high as first-person experience | "I came to regard this decomposition as essential to the quality and inspectability we needed." | "The architecture is proven to be the optimal approach to qualitative research." |

## 5. Ownership and attribution

### Safe personal ownership claims

Repository authorship plus interview confirmation supports saying Andreas:

- designed and implemented much of the evolving per-file finding and cross-file
  synthesis mechanism;
- authored the January user-prompt-specific finding prompt and implementation;
- authored the answer-across-findings prompt and compact-ID/persistent-ID
  remapping;
- added citation UUIDs in anticipation of editable quotes;
- built much of the visible finding/reference, transcript highlighting and
  synchronized evidence interaction;
- contributed the early April combined-input frontend and subsequent report
  product flow;
- made the deliberate product distinction between source-supported factual
  compression and freer analysis.

It is reasonable for the article to use first person for these mechanisms and
decisions.

### Shared or other ownership

Do not imply Andreas alone built the entire analysis backend or research
product.

- January TypeScript Temporal workflow/orchestration work, including cell and
  synthesis coordination, was substantially authored by Jani/Jan Tore.
- Backend persistence, GraphQL infrastructure and workflow fixes were shared
  across the team.
- Jani authored the first located `edit-finding` backend and frontend change.
- Vegard authored or contributed parts of quote matching, reference rendering
  and media fixes.
- Nazarii authored parts of earlier worker/service implementation.
- General asset ingestion, transcription infrastructure, storage and media
  infrastructure were broader system work and should not be claimed as Andreas's
  personal design without narrower evidence.

### Recommended attribution style

Use:

> I designed the findings/synthesis and provenance mechanism with the team, and
> implemented the central prompts, compact-reference mapping and much of the
> product interaction around it.

Avoid:

> I built Breyta's qualitative research backend.

When discussing Temporal coordination bugs or Firestore persistence, describe
"the system" or "we" unless the paragraph concerns Andreas-authored code.

## 6. Material to reserve

Do not spend the following mechanisms in this article.

### Elasticsearch versus embeddings

Reserve the agent-generated Elasticsearch query syntax, embedding retrieval,
cross-language recall, hybrid context and qualitative comparison for its own
article. Search is not the mechanism behind the findings/synthesis pipeline
described here.

### Tool catalogue and `execute_clojure`

Reserve tool-count projections, SCI, atoms, lazy loading, progressive
disclosure, Python execution and the private November 2025 draft. They belong to
the later agent-composability story.

### Workflow platform and SCI runtime

Do not use the #4 Clojure/EDN workflow representation to make the #2 pipeline
appear like an early workflow-platform design. The generations are connected by
ideas, but the runtime and product thesis differ.

### CLI as agent interface

Reserve Unix composability, CLI-plus-skill, MCP criticism, dogfooding and the
human-TUI/agent-CLI thesis.

### Hosted Codex/OpenCode agents

Reserve container isolation, harness reuse and CLI dogfooding for the hosted
agent article.

### Broader #3 recurring research orchestration

The TypeScript Temporal coordination issues can provide one short operational
detail here. The shadow project, recurring reports, source filtering,
"what changed", memo and delivery pipeline belong to the continuous-research
article.

## 7. Potential opening stories

These are factual scene descriptions, not proposed finished prose.

### Opening A: `Finding F`

Scene:

- A generated synthesis contains what should be a clickable evidence marker.
- Instead of a numbered finding button, the UI shows no button or the fallback
  `Finding F`.
- Following the failure backward reveals a compact numeric model ID, a parser,
  a missing durable-ID mapping and a frontend object lookup.

Why it could work:

- Starts with an observed, slightly awkward product failure.
- Introduces the compact-ID trick without abstract setup.
- Establishes immediately that provenance was application behavior, not a prompt
  footnote.

Risk:

- Andreas does not remember the exact report, model or root cause. The opening
  must be framed as a recurring/remembered symptom, not one reconstructed
  incident with invented details.

### Opening B: the string join

Scene:

- The first multi-file UI takes every selected transcript and executes
  `join('\n\n')`.
- The next commit adds `Transcript #1`, `Transcript #2` headings, research plan
  and desired format, but it is still one request.
- Within days, a separate pipeline begins extracting findings per transcript.

Why it could work:

- Gives an exact, recognizable implementation before the architectural language.
- The apparent simplicity is credible rather than caricatured.
- Creates a clean chronological engine for the article.

Risk:

- No bad generated output survives, so the failure must be stated through
  qualified recollection.

### Opening C: click a sentence, hear the interview

Scene:

- A UX researcher reads a synthesized statement.
- The finding marker opens the factual finding and exact quote.
- One more action scrolls and highlights the transcript and seeks the video to
  the corresponding millisecond.
- The researcher checks wording, speaker, context and tone before deciding what
  the observation means.

Why it could work:

- Shows the final product value before explaining the pipeline.
- Makes the human/model division of labor tangible.

Risk:

- This is a representative workflow confirmed by interview and code, not one
  attributable customer episode.

### Opening D: delete a layer that worked

Scene:

- One transcript is split into 6,000-token pieces.
- Parallel calls extract nuggets; another call consolidates findings; a final
  call constructs themes.
- The hierarchy works, but the team later removes one level because improved
  models and prompts can combine extraction and consolidation well enough.

Why it could work:

- Starts with a genuine attempted architecture rather than a strawman.
- Supports a story about finding the useful intermediate representation, not
  maximizing the number of stages.

Risk:

- There is no concrete latency number or remembered slow report.

### Opening E: the IDs the model never saw

Scene:

- The model writes `[0,2]`.
- The saved document contains persistent finding tags.
- A user clicks one and reaches the exact video excerpt.
- The persistent IDs and media metadata were never present in the model prompt.

Why it could work:

- Strong engineering puzzle with a compact reveal.
- Connects prompt design, persistence and UI in very little setup.

Risk:

- More mechanism-first and less human than openings A–C.

## 8. Likely article arc

Recommended seven-section shape. This is an outline, not draft prose.

### 1. Put all the interviews in the prompt

- Start with the recovered April code, preferably the string join.
- Explain why this was the obvious first implementation.
- State the remembered failures conservatively: corpus size, speculative output
  and imprecise references; no benchmark or surviving bad answer.
- Do not call it RAG, chunking or map/reduce.

### 2. Extraction and synthesis are different jobs

- Introduce one-file extraction followed by cross-file combination.
- Explain the second product boundary: attempts at analytical conclusions became
  speculative, while researchers wanted to own interpretation.
- Establish findings as question-directed factual observations, not hidden model
  reasoning.

### 3. We made the intermediate representation too deep

- Walk through nuggets -> findings -> themes with one synthetic data example.
- Explain exhaustive chunk extraction, per-file consolidation and cross-file
  patterns.
- Preserve the positive result: it worked.
- Then explain the remembered cost/waiting tradeoff without invented numbers.

### 4. Collapse two stages, preserve the contract

- Show the mature per-file input and output shape.
- Explain why improved models, prompts and harness made the fused call good
  enough.
- Emphasize what survived: factuality constraint, empty result, verbatim quote,
  exact timestamp and durable finding object.

### 5. The synthesis model got less than the user could inspect

- Show the deliberately reduced finding payload.
- Explain compact integer IDs and remapping to durable finding IDs.
- Use `Finding F` and the later parser hardening as the messy implementation
  detail.
- Clearly separate syntax validation from semantic verification.

### 6. Provenance became product behavior

- Trace synthesis -> finding -> quote -> transcript -> playback.
- Explain timestamp plus tolerant quote matching and a few concrete repairs.
- Show the researcher's workflow: verify wording/context/tone, then perform the
  interpretation.
- Mention that chat provided a freer analytical surface when explicitly wanted.

### 7. Stable references are not immutable truth

- Discuss edits without automatic regeneration and synthesis history without a
  fully versioned dependency graph.
- List the important unresolved boundaries: extraction recall, nuance loss,
  no entailment verifier, no benchmark and unknown modern-long-context result.
- End with uncertainty rather than a universal architecture prescription.

### Arc in one line

```text
one combined request
-> source and reference failure pressure
-> factual intermediate objects
-> an over-deep hierarchy
-> fused extraction with preserved evidence
-> compact synthesis references
-> source inspection as the human analysis loop
-> unresolved consistency and verification limits
```

## Primary evidence index

### Backend repository (`breyta`)

| Area | Primary files/commits |
|---|---|
| Direct completion prototype | `39b37b46f6` |
| Early findings and summary | `8d41989ce1`, `6a10912c36`, `da475e71c8` |
| Nuggets/findings/themes | snapshot `608845d144`; `workers/nuggets.clj`, `nuggets_prompt.txt`, `findings.clj`, `findings_prompt.txt`, `themes.clj`, `themes_prompt.txt`, `project_structured.clj` |
| Direct per-file findings | `5f6e3aca2e`; `workers/findings2.clj`, `findings2_prompt.txt` |
| Citation UUID | `20c23d585c` |
| Synthesis and compact IDs | `ad83cd3749`, `f24d565d4f`, `2cdb6e13ec`; `answer_across_findings.clj`, prompt and tests |
| Persistence and IDs | `workers/async_request.clj`; `libraries/firebase/.../firestore.clj`, `references.clj` at `2cdb6e13ec` |
| Finding editing | `91c76354d2` |
| Synthesis syntax repair | `8c0b62476a` |

### Frontend repository (`breyta-frontend-mono`)

| Area | Primary files/commits |
|---|---|
| Single/all-files prototypes | `b4db83911`, `c6ca34cb3`, `d841d4ca4` |
| Findings/synthesis orchestration | historical `apps/workflow-worker/src/workflows/projectWorkflow.ts`; `activities/cell.ts`, `synthesis.ts`; `2e26a34d8`, `501e8915b`, `ed43af448` |
| Finding editing | `9bc20c25c` |
| Finding reference rendering | historical `packages/breyta-design/src/components/Finding/`; `DocumentEditor.tsx` |
| Citation selection and evidence UI | `e33519047`, `d2592e2a1`, `c76553697` |
| Transcript matching | `Transcript.tsx`; `1fb2f9134`, `c10db1b09` and October 2024 matching fixes |
| Media playback | `MediaViewer.tsx`, `useMediaTimestamp.ts`; `26ca51bf1` |
| Transcript editing/history | February–March 2025 transcript editing commits, including `add07a050`, `95fa3e864`, `e7b64c1ab` |

### Interview evidence, 2026-08-26–27

- Combined all-files prompt was far from good enough for scale,
  hallucination behavior and precise references; no more specific incident is
  remembered.
- Findings/synthesis was considered essential to perceived quality and
  reliability, not established through a benchmark.
- More analytical model conclusions were tried and judged too speculative.
- UX researchers preferred compressed facts and source inspection because they
  considered interpretation and deep pattern finding their core work.
- Nuggets were intended to ensure exhaustive extraction before consolidation.
- Improved models, prompts and harness made direct per-file findings good enough
  to replace separate nugget and finding calls.
- The three-level architecture worked but did not justify added cost and waiting
  time.
- Missing buttons/`Finding F` were seen, but the triggering conditions are not
  remembered.
- Finding/transcript correction primarily addressed small transcription or quote
  errors; regeneration was not normally run afterward.
- Source inspection checked wording, speaker, context, nuance, tone and possible
  overinterpretation.
- Andreas personally designed and implemented the central analysis/provenance
  mechanism; orchestration, persistence and broader infrastructure were shared.

