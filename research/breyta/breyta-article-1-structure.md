# Breyta article 1 structure: First extract, then synthesize

Structure memo. Not an article draft.

Source of truth: `breyta-article-1-research.md`. The structure deliberately
selects from that memo rather than attempting to reproduce it.

## 1. Article thesis

### Candidate A: extraction and synthesis were different jobs

Formulation:

> We stopped asking one model call to inspect every source, find the evidence and
> write the conclusion. Per-file extraction produced evidence-bearing findings;
> cross-file synthesis operated on those findings.

What it emphasizes:

- the concrete architectural transition;
- why findings existed;
- the difference between source inspection and cross-source composition;
- a clean chronology from one request to a staged pipeline.

What it risks flattening:

- It can sound like generic map/reduce or document chunking.
- It does not by itself explain why findings became user-visible objects.
- It can imply that synthesis was the final analytical authority, when the
  product intentionally left deeper interpretation to the researcher.

Assessment: technically accurate, but insufficient as the article's main
framing. Use it as the architectural description beneath a richer thesis.

### Candidate B: deciding what the model could compress without hiding the evidence

Formulation:

> The hard part was not merely fitting more interviews into context. It was
> deciding what the model could compress while keeping every intermediate claim
> inspectable, and where the researcher still needed to make the interpretation.

What it emphasizes:

- compression versus provenance;
- findings as application objects rather than model scratch space;
- the human/product boundary;
- why less context at the synthesis stage could be intentional rather than a
  limitation to eliminate;
- the connection from backend decomposition to source playback in the product.

What it risks flattening:

- "Compression" can sound more deliberate and stable than the actual evolution
  was.
- It could become an abstract essay about epistemology unless the string join,
  three-level pipeline and parser/UI failures carry the narrative.
- It must not become a universal claim that models should never interpret.

Assessment: recommended. It captures both the architecture and the product
decision without reducing the story to scaling.

### Candidate C: the intermediate evidence became part of the product

Formulation:

> Reliability improved when the output between extraction and synthesis stopped
> being disposable model text and became durable evidence that users could open,
> correct and trace back to the original interview.

What it emphasizes:

- finding identity and provenance;
- compact-ID remapping;
- synchronized source inspection;
- the difference between hidden reasoning and inspectable product state.

What it risks flattening:

- It underplays the all-files failure and the working-but-overcomplicated
  nuggets/findings/themes design.
- "Reliability improved" is interview judgement, not a measured result.
- It may drift into the generic claim that citations create trust.

Assessment: strongest secondary formulation. It should appear after the first
decomposition, when the article explains why a finding deserved durable identity.

### Recommendation

Use candidate B as the article's thesis, supported by candidate A as the
architectural mechanism and candidate C as the product consequence.

The article should not announce the thesis as a maxim in the opening. Let the
reader first see the string join and the first decomposition. State the fuller
framing only after introducing what a finding represented and why UX researchers
wanted source-supported facts rather than model-owned interpretation.

## 2. Recommended opening

### Entry point

Open in April 2024 in the first recovered multi-file UI.

The first concrete detail is one line:

```ts
selectedTranscriptText.join('\n\n')
```

Explain factually:

- the user selected several transcripts;
- the frontend joined their text and sent one model request;
- the next iteration added `Transcript #1`, `Transcript #2`, the research plan,
  notes and requested output formatting;
- it remained one request asking the model to inspect sources and produce the
  result.

Protect the first design from retrospective ridicule. It closely matched the
user action, minimized machinery and was a reasonable way to test whether the
product idea worked.

### First tension

Move from the code to Andreas's qualified recollection:

- it was far from good enough as the number of files grew;
- hallucination/speculation and exact source references were also inadequate;
- no preserved bad answer, threshold or benchmark exists.

Do not invent a dramatic customer incident. The absence of one is acceptable;
the exact implementation is concrete enough to establish the predecessor.

### First zoom-out

Zoom out only far enough to define the actual product task:

- UX researchers were analyzing collections of interviews, often video;
- they needed to answer a research question across files;
- a useful output had to remain connected to the words and moment in the
  original interview.

Then return immediately to the engineering change: within days, another
pipeline began generating findings independently per transcript.

### Do not explain yet

Do not introduce in the opening:

- nuggets/findings/themes;
- Clojure maps or Firestore;
- compact numeric IDs;
- `Finding F`;
- fuzzy matching or playback bugs;
- modern long-context speculation;
- generic language about RAG, map/reduce or intermediate representations.

The opening's job is to establish a reasonable design, its experienced limits
and the need to separate jobs—not to preview every mechanism.

## 3. Recommended article arc

Six sections provide enough room for the real evolution while avoiding a
seven-step architecture report.

### Section 1: Put all the interviews in one prompt

Working heading: **Put all the interviews in the prompt**

Narrative job:

- establish the first design without caricaturing it;
- give the reader an exact starting point;
- introduce the failure pressure conservatively;
- make source traceability part of the problem before discussing architecture.

Concrete story/detail that carries it:

- `selectedTranscriptText.join('\n\n')`;
- the next commit's numbered transcript sections and research-plan/formatting
  instructions;
- per-transcript findings appearing within days in a parallel product path.

Technical mechanism explained:

- one combined request performed source inspection, relevance selection,
  comparison and answer writing in the same context;
- no deeper prompt or API walkthrough.

Central claim:

- The first design matched the product action but combined too many jobs to meet
  the scale and reference precision Andreas experienced as necessary.

Evidence basis:

- code-clear for concatenation and the single request;
- interview-confirmed for poor scaling, hallucination behavior and reference
  quality;
- no quantitative comparison.

Omit:

- exact commit hashes in the article body unless used in a footnote;
- the single-transcript prototype before multi-select;
- provider/model details (`gpt-4-turbo-preview`);
- deleted-page history and the precise duration of coexistence;
- claims that the design was a production failure or was immediately deleted.

Transition:

- The first useful split was not arbitrary chunking. One call should inspect one
  source; another should answer across what had been found.

### Section 2: A finding had to survive the model call

Working heading: **A finding had to survive the model call**

Narrative job:

- explain the first decomposition;
- introduce the human/product boundary early;
- show why the intermediate output became inspectable product state rather than
  disposable model text.

Concrete story/detail that carries it:

- per-transcript extraction followed by cross-file combination;
- a minimal mature finding containing a factual observation, an exact quote and
  `start_ms`;
- the finding persisted with its own application ID and transcript relationship.

Technical mechanism explained:

- extraction received one source and a research question;
- output was constrained to factual observations with verbatim evidence;
- each finding became a durable, queryable object used by later synthesis and
  the UI.

Central claim:

- Findings were not only a way to shrink context. They represented the part of
  the model's work the researcher needed to inspect before making deeper
  interpretations.

Evidence basis:

- code-clear for the per-file contract, persistence and citation fields;
- interview-confirmed that durable findings were a conscious continuation of
  the nugget idea;
- interview-confirmed that more analytical model conclusions had become too
  speculative for this workflow;
- interview-confirmed that UX researchers wanted to own pattern recognition and
  deep interpretation.

Human/product boundary placement:

- Introduce it in the second half of this section, immediately after showing the
  finding shape.
- Explain that "factual" was still question-directed compression, not neutral
  transcription.
- State that chat offered a freer surface when a user explicitly wanted more
  model analysis.
- Do not say that AI should never interpret; this was a boundary chosen for
  qualitative UX research and the customers using this product.

Omit:

- Firestore transactions, workspace/project/user-prompt IDs and collection
  helpers;
- Temporal task tokens and parallel-cell implementation;
- the claim that no incorrect citation was ever found;
- detailed prompt wording and every exclusion rule;
- speculation about whether Breyta replaced manual affinity mapping.

Transition:

- Once evidence had a shape, the next temptation was to make that shape more
  complete and more hierarchical.

### Section 3: The extra layer worked

Working heading: **The extra layer worked**

This is preferable to "We made the intermediate representation too deep,"
which judges the design before explaining why it existed.

Narrative job:

- present nuggets -> findings -> themes as a serious attempted architecture;
- show the pursuit of exhaustive coverage before consolidation;
- create a genuine reversal when the working design is later simplified.

Concrete story/detail that carries it:

- long transcripts split into roughly 6,000-token pieces;
- parallel piece-level extraction of nuggets;
- per-transcript consolidation into findings;
- project-level themes supported by multiple findings;
- the architecture worked but added another model stage, cost and waiting.

Technical mechanism explained:

Describe the flow inline as `transcript pieces -> nuggets -> per-file findings
-> cross-file themes`; it should not become a fourth code/data block.

- nuggets were exhaustive, source-bound facts;
- findings combined related nuggets without adding conclusions;
- themes collected patterns supported by findings from the corpus;
- temporary IDs connected stages without exposing durable IDs to the model.

Central claim:

- More decomposition was useful up to a point. The problem was not that the
  hierarchy failed, but that improved models, prompts and harness later made one
  semantic boundary unnecessary.

Evidence basis:

- code-clear for 6k-ish splitting, stage contracts, parallelism and ID mapping;
- interview-confirmed for exhaustive-coverage intent;
- interview-confirmed, not measured, for added cost/waiting versus incremental
  value;
- interview-confirmed that later model/prompt/harness improvements made the
  fused per-file call good enough.

Omit:

- full nugget and finding maps;
- the timestamp plausibility range;
- token estimates from code comments;
- billing/credit details;
- claims of equivalent recall or a quantified latency saving;
- a separate section for the January simplification.

How simplification appears in this section:

- After the three-stage mechanism is understood, show that nuggets plus findings
  were collapsed into one per-file extraction/consolidation call.
- Preserve the contract that mattered: factual observation, exact quote,
  timestamp and empty output when the file had no relevant evidence.
- The surviving boundary was therefore per-file evidence -> cross-file
  synthesis, not the maximum possible number of intermediate stages.

Transition:

- The simplified synthesis stage did not receive the raw corpus again. It saw a
  deliberately smaller and stranger representation than the application held.

### Section 4: The synthesis model knew less than the product

Working heading: **The synthesis model knew less than the product**

Narrative job:

- provide the article's strongest backend implementation detail;
- connect model-local representation to durable application identity;
- introduce a mundane generated-syntax failure without derailing into parser
  implementation.

Concrete story/detail that carries it:

- synthesis received finding text and citation text, but not raw transcripts,
  timestamps, file IDs or persistent finding IDs;
- the model referred to evidence as `[0,2]`;
- backend code remapped those local numbers into durable finding references;
- unresolved mappings could surface as missing buttons or `Finding F`;
- a later model switch required stricter handling of bracket syntax.

Technical mechanism explained:

```text
model output [0,2]
    -> private lookup table
    -> durable finding references in the saved document
```

Explain that the application retained transcript identity, citations and UI
behavior on the finding objects. The model did not need to copy opaque database
IDs or receive every field.

Central claim:

- Giving synthesis less context was part of the boundary: it could combine the
  extracted evidence, while the application retained the richer provenance
  needed for inspection.

Evidence basis:

- code-clear for the reduced payload, numeric IDs, remapping and initial test
  gaps;
- interview-confirmed that `Finding F` or missing buttons occurred;
- history-clear that later model output prompted parser hardening;
- no evidence that compact IDs measurably improved model accuracy.

Omit:

- exact regexes and exhaustive malformed-input cases;
- all unit-test cases;
- claims that the compact representation was primarily a token optimization;
- adjacent chat `<reference>` repair bugs, which used a different syntax;
- Firestore ID formats or real IDs.

Transition:

- A durable finding reference mattered only because the product could do
  something useful with it after generation.

### Section 5: A citation was a route back to the interview

Working heading: **A citation was a route back to the interview**

Narrative job:

- pay off the product and human stakes introduced in section 2;
- show provenance as an interaction, not a prompt feature;
- add enough frontend messiness to keep the story grounded in a real system.

Concrete story/detail that carries it:

Describe the reverse path in prose: synthesized statement -> finding -> exact
quote -> highlighted transcript -> synchronized audio/video moment. It should
read as user behavior, not as another architecture diagram.

- Researchers checked wording, speaker, surrounding context, nuance, tone and
  possible overinterpretation.
- Timestamp selected the media location; tolerant quote matching selected the
  visible words.
- Quote matching needed repairs for punctuation, parentheses and small leading-
  word differences.

Technical mechanism explained:

- `start_ms` found the nearest transcript/media moment;
- approximate text matching highlighted the excerpt despite minor formatting or
  transcription differences;
- URL/application state carried the selected finding and citation through the
  interface.

Central claim:

- Provenance was useful because the researcher could move quickly from compressed
  output back into the source and make a judgement. The citation marker alone
  was not the product boundary.

Evidence basis:

- code-clear for the navigation, matching and media-seek path;
- interview-confirmed that this source inspection was normal and essential in
  customer use;
- no usage metric or attributable customer scene.

Omit:

- milliseconds-versus-seconds playback bug from the main text;
- the complete list of matcher fixes;
- modal variants, URL parameter names and component hierarchy;
- deleted/missing asset behavior;
- any statement that clickable sources caused universal customer trust.

One messy detail is enough here. Prefer punctuation/parentheses/leading-word
matching because it follows naturally from correcting and locating transcript
text. Keep the milliseconds bug in reserve.

Transition:

- The link could remain navigable even when the source or finding text later
  changed. That exposes the limit of what stable identity actually guaranteed.

### Section 6: The reference could survive while the evidence changed

Working heading: **The reference could survive while the evidence changed**

Narrative job:

- prevent the mature design from becoming a triumphant endpoint;
- separate navigability from semantic and historical correctness;
- preserve uncertainty about measurements and current models;
- return to the human boundary rather than ending on architecture advice.

Concrete story/detail that carries it:

- users corrected small finding/transcription errors;
- findings and timestamps retained stable identity/navigation;
- analyses were not normally regenerated after those corrections;
- old citation or synthesis text could therefore diverge from the corrected
  source;
- syntax repair validated known reference IDs, not entailment.

Technical mechanism explained:

- stable object IDs and synthesis history did not amount to an immutable,
  versioned provenance graph;
- extraction omissions still bounded everything synthesis could say;
- syntactically resolvable evidence was not proof that a claim was semantically
  supported.

Central claim:

- The architecture made evidence inspectable and useful; it did not make the
  evidence chain complete, immutable or formally verified.

Evidence basis:

- code-clear for edit behavior, stable IDs and synthesis history;
- interview-confirmed that corrections normally did not trigger regeneration;
- inferred, not incident-confirmed, content drift consequences;
- no benchmark or semantic verifier;
- no experiment with current long-context models.

Omit:

- detailed edit UI and citation-UUID implementation history;
- assertions that stale data caused a customer error;
- an exhaustive caveat list;
- a prescription for how to build a fully versioned evidence graph;
- speculation that modern models either solve or still require this exact
  architecture.

Ending transition:

- Return to the researcher opening the source. The system's job was to preserve
  a short path from compression back to evidence; the researcher still decided
  what that evidence meant. Leave open where the same boundary should be drawn
  with current models.

## 4. Red thread

### Primary: compression versus inspectability

The question connecting the article is:

> As source material is repeatedly compressed—from transcripts to observations
> to a cross-file answer—what must remain inspectable, addressable and connected
> to the original source?

This thread appears in every section:

1. The combined prompt compresses everything in one opaque operation.
2. Per-file findings make the first compression explicit and inspectable.
3. Nuggets/findings/themes test how many compression stages are useful.
4. Synthesis receives compact evidence while the application retains richer
   identities.
5. The UI reverses the compression path back to the original media.
6. Editing reveals that inspectable identity is weaker than immutable truth.

This is more precise than "scale versus inspectability." Scale creates the first
pressure, but does not explain the customer boundary or durable finding objects.

### Secondary: automation versus researcher judgement

The secondary tension is not humans versus AI. It is which stage of this
particular research workflow the product automated.

- The model extracted and compressed question-relevant facts.
- Attempts at freer analytical conclusions became too speculative in Andreas's
  experience.
- UX researchers wanted to own patterns, deep connections and interpretation.
- Chat remained available when users deliberately wanted broader model analysis.

Introduce this in section 2 and pay it off in section 5 and the ending. Do not
save it as a philosophical lesson after the architecture has already been
explained.

## 5. Concrete-detail budget

| Detail | Keep / Cut / Reserve | Where | Why |
|---|---|---|---|
| `selectedTranscriptText.join('\n\n')` | Keep | Opening / section 1 | Exact, recognizable predecessor; makes the chronology real without portraying it as naive. |
| Roughly 6k transcript pieces | Keep briefly | Section 3 | Shows nuggets were a real chunk-level extraction stage; one number is enough. |
| Nuggets -> findings -> themes | Keep | Section 3 | Necessary working intermediate architecture and the article's central non-inevitable pivot. |
| Durable finding objects | Keep | Sections 2 and 4 | Turns an intermediate representation into product state and supports the human boundary. |
| `[0,2]` | Keep | Section 4 | Best compact implementation detail linking model syntax to application identity. |
| `Finding F` | Keep | Section 4 | Observed mundane failure and memorable consequence of an unresolved generated reference. Do not assign a specific root cause. |
| Bracket/parser break after model change | Keep in one sentence | Section 4 | Demonstrates format drift after a mature implementation; do not enumerate parser cases. |
| Fuzzy quote matching | Keep | Section 5 | Explains how exact source navigation worked despite transcription/format variation. |
| Milliseconds/seconds playback bug | Cut from main article; reserve | Possible sidebar or later evidence/UI article | Funny and real, but a second low-level playback bug dilutes the stronger fuzzy-matching detail. |
| Synchronized playback | Keep | Section 5 | Product payoff: synthesized prose could lead to the exact source moment. |
| Edit/version drift | Keep briefly | Section 6 | Prevents a falsely perfect ending and distinguishes stable identity from historical correctness. |
| Per-cell orchestration and stranded-cell fixes | Cut | Later continuous-research/workflow article | Adds distributed-systems detail without advancing the compression/inspectability thread. |
| Citation UUID added for editable quotes | Cut | Research notes only | The planned-versus-shipped editing path is unresolved and too detailed for the article. |
| Empty finding list for irrelevant files | Keep in prose if space permits | Section 3, during fused call | Small sign that extraction was allowed to find no evidence rather than force an answer. |
| Model/provider chronology | Cut | None | Provider names distract except for the single later model-switch/parser sentence. |
| Claim that no wrong #2 citation is remembered | Cut from main narrative | Claims/notes only | Too easy to hear as an accuracy claim; `Finding F` already provides a more honest reliability detail. |

## 6. Code/data examples

Use exactly three compact blocks. No full Clojure implementation.

### Example 1: the string join

Shows:

```ts
selectedTranscriptText.join('\n\n')
```

Why prose is insufficient:

- The literal operation is the opening's strongest factual texture.
- Showing it prevents the predecessor from becoming a vague "giant prompt"
  abstraction.

Size:

- one line, optionally followed by three prose bullets describing the added
  transcript headings/research context;
- do not reproduce the entire frontend function or prompt.

Synthetic values:

- not needed; the line contains no private data.

### Example 2: the mature per-file finding

Shows a synthetic minimal shape:

```clojure
{:finding "The participant uses exports for weekly reporting."
 :citations [{:quote "We export it every Friday"
              :start_ms 183420}]}
```

Why prose is insufficient:

- The co-location of compressed observation, verbatim source and media location
  is the central evidence contract.
- It demonstrates why the object is more than a text summary.

Size:

- four lines of meaningful data;
- omit UUIDs, workspace/project/transcript fields, categories and storage
  metadata.

Synthetic values:

- required. Never use customer transcript content or real IDs.

### Example 3: model-local IDs becoming application references

Shows:

```text
model:       [0,2]
application: <finding id="..." /> <finding id="..." />
```

Why prose is insufficient:

- The two representations are easier to understand side by side.
- It makes clear that the model did not emit persistent IDs.

Size:

- two lines plus a small prose explanation of the private lookup table;
- do not show parser or regex code.

Synthetic values:

- use ellipses or obviously synthetic IDs.

### Do not show

- a separate nugget map;
- the complete indexed synthesis payload;
- Firestore documents;
- Temporal workflow state;
- quote-matching code;
- prompt excerpts longer than a phrase.

The nuggets/findings/themes pipeline should be represented as a one-line flow in
prose or a compact inline sequence, not a fourth code block.

## 7. Human/product thread

### Where it enters

The human boundary enters in section 2, after the reader has seen the first
finding shape and before nuggets/findings/themes.

Sequence:

1. Show that a per-file finding contains an observation plus source evidence.
2. Ask why the observation became a durable product object rather than temporary
   model output.
3. Introduce the experiments with more analytical conclusions and Andreas's
   recollection that they became too speculative.
4. Introduce the user feedback: UX researchers considered pattern recognition,
   deep connections and interpretation central to their own work.
5. Define the product's chosen division of labor for this workflow.

This placement changes how the remainder is read. The three-level hierarchy is
not merely prompt optimization; it is an attempt to extract and consolidate
evidence without taking over the researcher's interpretive step.

### How it changes the meaning of findings

A finding is:

- selected in light of a research question, so it is not an unfiltered fact;
- constrained to what one source supports;
- stored with exact evidence;
- inspectable and correctable;
- input to later compression;
- not presented as the model's final interpretation of the research.

Avoid calling findings "objective truth." The prompts asked for objective,
non-extrapolated observations, but generation remained probabilistic and
question-directed.

### How it changes the meaning of synthesis

Synthesis is:

- cross-file organization and compression;
- expected to preserve contradictions and source-count nuance;
- bounded by extracted findings;
- deliberately not given the raw corpus again;
- not the same thing as the UX researcher's final pattern finding or strategic
  interpretation.

The term can otherwise mislead readers into assuming that the model authored
the analytical conclusion.

### How it changes the meaning of source inspection

Source inspection is not a trust badge added after generation. It is where the
researcher resumes the work:

- check the exact wording;
- identify speaker and surrounding context;
- hear tone and nuance;
- decide whether compression overstates the evidence;
- form or reject the deeper interpretation.

Chat belongs in one sentence: users could explicitly choose a freer analytical
interaction there. Do not add the chat architecture or retrieval implementation.

## 8. Claim discipline

### All-files prompt quality

Safe:

- "In my experience, the combined prompt was far from good enough as the corpus
  grew, and it struggled with speculation and precise references."
- "The first design did not meet the product quality we needed."

Avoid:

- measured superiority;
- a precise file/token threshold;
- saying every result was poor;
- claiming a particular commit was caused by a production incident.

### Hallucination reduction

Safe:

- "Narrower extraction calls made the hallucination and grounding behavior more
  manageable in our experience."
- "I regarded the staged design as essential to the quality we reached."

Avoid:

- "The pipeline solved hallucinations";
- percentages or benchmark language;
- implying decomposition alone caused every improvement while models, prompts
  and harness were also changing.

### Reference accuracy

Safe:

- "The mature pipeline required verbatim quotes and exact timestamps and kept a
  navigable link to the source."
- "I cannot remember a semantically wrong #2 reference being reported" only if
  a carefully qualified personal recollection is genuinely needed.

Prefer omitting the latter. Avoid:

- "References were always correct";
- treating `Finding F` as proof of a wrong semantic citation;
- treating quote/timestamp format validation as evidence validation.

### Customer trust

Safe:

- "Customers used source inspection as a normal part of reading the result."
- "The citation and playback flow was critical and well received."

Avoid:

- "Citations made users trust AI";
- universal customer claims;
- invented customer quotes or scenes;
- asserting Breyta replaced manual qualitative analysis.

### Three-stage cost and latency

Safe:

- "The hierarchy worked, but in my judgement the extra semantic layer did not
  justify its model cost and waiting time."

Avoid:

- cost totals, percentages or duration;
- claiming users abandoned analyses;
- calling nuggets/findings/themes a failed architecture.

### Simplified pipeline quality

Safe:

- "Models, prompts and our harness had improved enough that we judged one
  per-file extraction/consolidation call good enough."

Avoid:

- equivalent recall or quality;
- claiming simplification was only a cost optimization;
- presenting two levels as universally optimal.

### Compact IDs

Safe:

- "The model handled short local IDs; application code restored durable finding
  identities afterward."
- "This shortened and simplified the model-facing representation."

Avoid:

- measured token or error reductions;
- claiming compact IDs prevented malformed references;
- presenting internal ID hiding as a security boundary.

### Semantic citation correctness

Safe:

- "The system checked and repaired reference syntax and could reject IDs that
  were not in the supplied finding set."
- "It did not run a semantic entailment verifier."

Avoid:

- "References were verified" without immediately specifying syntactic versus
  semantic verification;
- claiming a valid finding ID proves the adjacent sentence.

### Current long-context models

Safe:

- "I do not know where I would draw the same boundary with current long-context
  models without testing it."
- "Newer models might move the tradeoff, but do not remove the product question
  of what users need to inspect."

The second sentence is an argument/inference, not an experimental result. Avoid:

- claiming long context now solves the original problem;
- claiming the historical architecture remains necessary;
- hypothetical benchmarks.

## 9. Attribution

### Section 1: first implementation

First-person singular is appropriate for:

- building/contributing the multi-transcript frontend;
- personal recollection of its limitations;
- personal judgement that it was not good enough.

Use "we" for the broader product experiment and transition because the early
backend/report product was team work.

### Section 2: findings and the product boundary

First-person singular is appropriate for:

- designing and implementing central findings/synthesis prompts and mechanism;
- the judgement to constrain findings to source-supported facts;
- direct conversations/recollections about UX researcher preferences.

Use "we" when describing the product decision and experimentation with more
analytical conclusions. Do not imply Andreas alone defined the customer research
method or built ingestion/transcription/storage.

### Section 3: nuggets/findings/themes and simplification

First-person singular is appropriate for the prompt/data-mechanism design where
the article is describing Andreas's own work and judgement.

Use "we" for:

- the complete working pipeline;
- model/provider/harness evolution;
- deciding the extra layer was not worth its operational cost;
- broader orchestration and product rollout.

### Section 4: compact IDs and parser behavior

First-person singular is appropriate for the compact-ID/persistent-ID remapping
and central synthesis implementation, which repository authorship and interview
support.

Use "the system" or "we" for:

- Firestore persistence;
- frontend fallback behavior;
- model-switch/parser hardening across the shared codebase;
- unit-test coverage gaps.

Do not assign `Finding F` to one person's mistake.

### Section 5: evidence UI and playback

First-person singular is appropriate for much of the visible citation,
highlighting and interaction work Andreas authored.

Use "we" or "the application" for the entire transcript/media pipeline because
quote matching, rendering, media infrastructure and fixes were shared with
Vegard and others.

Use "customers" only for the generalized workflow confirmed in interview. Do
not invent an individual researcher.

### Section 6: editing and limits

Use "the system" for editing semantics and synthesis history. Jani authored the
located `edit-finding` change, and transcript/versioning work was broader than
one mechanism.

First-person singular is appropriate for uncertainty:

- "I do not remember...";
- "I do not know how current models would change...";
- "I regarded...";
- "I would want to test...".

## 10. What this article is NOT

Explicitly reserve:

- **Elasticsearch versus embeddings:** agent-generated Elasticsearch query
  syntax, semantic retrieval, hybrid context and cross-language recall.
- **`execute_clojure`:** tool-count projection, SCI, atoms, lazy state, skills,
  Python analysis and progressive disclosure.
- **Workflow platform:** Clojure/EDN workflow representation, SCI execution,
  marketplace/app reuse and agents programming workflows.
- **CLI:** Unix composability, CLI-plus-skill, MCP comparison and CLI as an agent
  API.
- **Hosted Codex/OpenCode:** container isolation, harness reuse, lifecycle and
  first-party agent dogfooding.
- **Broad continuous-research orchestration:** recurring reports, shadow
  projects, source date ranges, "what changed", memo, delivery and the #3
  workflow rewrite.

Also cut these tempting Breyta #2 details:

- workspace/project chat retrieval architecture;
- full evidence markup evolution across chat and documents;
- all transcript schemas and ingestion/transcription implementation;
- model/provider chronology beyond one brief parser-drift example;
- Temporal external activities, task tokens, stranded cells and retry machinery;
- frontend modal/component evolution;
- every highlighting and playback bug;
- exact billing/credit behavior;
- transcript edit UI and version-history mechanics;
- claims about whether the product replaced affinity mapping;
- the broader Breyta #1 -> #2 product pivot;
- synchronized playback as a generic "citations build trust" argument.

This is also not:

- a tutorial for multi-document analysis;
- a RAG or chunking article;
- a Clojure case study;
- a taxonomy of intermediate representations;
- a defence of human-only interpretation;
- a benchmark report;
- an argument that the final architecture is still optimal.

## 11. Ending options

### Option A: return from compression to the original voice

Structure:

- Return to a researcher clicking a synthesized statement.
- Follow the short reverse path to the finding, quote and exact video moment.
- The system has compressed the corpus but has not claimed the final
  interpretation.
- The researcher hears the source and decides what it means.
- Briefly acknowledge that current models might change implementation tradeoffs,
  but not resolve this historical story retroactively.

Strength:

- Pays off both primary and secondary red threads.
- Ends on product behavior and human work, not an architecture slogan.
- Preserves the reason findings became objects.

Risk:

- Must remain a generalized, code-and-interview-supported workflow rather than
  an invented customer scene.

### Option B: stable identity was not immutable truth

Structure:

- End with a corrected transcript whose old finding ID still resolves.
- Navigation survives, but old quote or synthesis text may not describe the new
  source exactly.
- Contrast inspectability with versioned historical correctness and semantic
  verification.
- Leave the unresolved design problem open.

Strength:

- Technically honest and unusually specific.
- Prevents a triumphant "we solved provenance" conclusion.

Risk:

- The content-drift consequence is inferred rather than remembered as a concrete
  incident.
- Ending on data consistency may underpay the researcher/product thread.

### Option C: redraw the experiment with current models

Structure:

- Return to the one-request prototype.
- Acknowledge that current long-context models would handle it differently.
- State that the old comparison cannot answer where the boundary belongs now.
- Identify what would need testing: coverage, reference precision, speculative
  conclusions, latency/cost and researcher workflow.

Strength:

- Preserves uncertainty and avoids declaring the architecture timeless.

Risk:

- Invites a generic modern-model discussion and can make the historical product
  story feel provisional or obsolete.

### Recommendation

Use option A, with one compact caveat borrowed from option B before the return to
the source:

- stable references made inspection practical;
- they did not create immutable or semantically verified truth;
- the important product action remained the researcher moving back from the
  compressed answer to the original evidence.

If current long-context models are mentioned, keep them to the penultimate
paragraph or a short note. Do not make them the final image.

## Final editorial test

An experienced engineer reading this structure should encounter:

- an exact first implementation rather than a strawman;
- a failure remembered qualitatively rather than upgraded into a benchmark;
- a product decision about researcher authority;
- a working three-stage design that was later simplified;
- a compact but real model/application identity boundary;
- parser, matching and versioning imperfections;
- an endpoint that remains useful without becoming optimal or complete.

If the draft can be summarized as "use intermediate representations with
citations," it has lost the story. Revise by restoring the string join, the
working extra layer, `Finding F`, and the researcher returning to the video
before deciding what the evidence means.
