# First extract, then synthesize

_Second draft._

_How an AI research product grew from one large prompt into evidence a
researcher could inspect._

## Put all the interviews in one prompt

Breyta was not originally an AI research product. Our first product was
somewhere between a CRM and a data-activation tool. It had customers, but it was
not growing fast enough for the kind of company we were trying to build. In the
spring of 2024, we were looking for Breyta's second product.

Qualitative research was a natural place for us to look. The team had quite a
bit of experience with user testing from a previous startup. We knew the work:
record interviews, transcribe them, go through the material, find patterns and
keep track of the evidence behind the conclusions.

The product we started building let researchers upload audio, video and text,
organize the material into projects, describe the research context and ask
questions across the files. Breyta generated findings and longer synthesis
documents. It also had chat over the material. For video interviews, transcript
and playback were part of the same research surface.

Claude 3 Opus had made a different version of that workflow suddenly plausible.
It was clearly the strongest model available for this work at the time. We could
put perhaps ten transcripts into its context and ask what was going on across
all of them.

So we did. And it was surprisingly good.

Opus found many of the important themes and observations. This was one of those
moments where a model did enough of the work that the product suddenly seemed
real. A researcher could upload a collection of interviews, ask a question and
get something recognizably useful back.

It was not good enough to become the production architecture. It still missed a
lot, especially the smaller observations that matter in qualitative research.
References back to the interviews were poor, so checking the result could mean
doing much of the source work again. And Opus was far too expensive for us to
send the entire corpus through it again for every analysis.

The implementation was about as direct as the experiment sounds.

The first multi-file frontend contained this line:

```ts
selectedTranscriptText.join('\n\n')
```

The user selected several transcripts. We joined their contents with two
newlines and sent them in one request. The next iteration added labels such as
`Transcript #1` and `Transcript #2`, together with the research plan, notes and
the requested output format.

That is almost the whole first architecture. One Opus call received the selected
source material and was asked to work out what mattered, compare the interviews,
write the analysis and preserve useful references to where its claims came from.

There was nothing silly about trying this. It matched the action in the UI. The
model got all the selected material rather than a retrieval system's guess about
what it might need. There were no intermediate jobs to coordinate and no earlier
stage that could discard evidence before the final answer.

The large prompt had demonstrated the capability. It had also shown us the gap
between an impressive inference and a product researchers could use repeatedly.
We needed better coverage, much better provenance and an architecture whose
economics did not depend on rerunning the whole corpus through Opus.

A plausible summary was not enough for qualitative research. If the output said
that participants struggled with a workflow, the researcher needed to see which
participants, what they had actually said and whether the surrounding interview
supported that compression.

Within days of the combined-prompt prototype, another path in the product was
already generating findings independently per transcript. The two approaches
coexisted for a while. Breyta's product changes were usually less tidy than the
version numbers I now use to describe them.

Rate limits made the production gap even more concrete. As we began running
separate findings jobs across customer interviews, the number of calls grew. I
changed one of those paths from Opus to GPT-4 Turbo specifically because we were
being rate-limited by the Anthropic API. Opus was clearly better at the work,
but an expensive model we could not call at the required rate was not enough to
build the product around. A good run over a selected set of interviews and a
service that had to finish real customer projects were different things.

## A finding had to survive the model call

The early per-file output evolved into an explicit finding object. In the mature
version, one looked roughly like this:

```clojure
{:finding "The participant uses exports for weekly reporting."
 :citations [{:quote "We export it every Friday"
              :start_ms 183420}]}
```

The content is synthetic. The shape is representative.

Each extraction call received the project context, one file and one research
question. It returned concise observations related to that question, with one
or more verbatim quotes. For our timestamped transcripts, it also copied the
exact `start_ms` value from the row containing the quote. If the file contained
nothing relevant, an empty list was a valid result.

Quotes stayed in the language used in the source even when the finding itself
was written in another language. A translated quote would look cleaner in the
output, but it would no longer be the exact text we needed to find and show in
the transcript.

Interviewers made the extraction slightly more subtle. Their questions often
contained detailed hypotheses. A question like “When you struggle to export the
report, is it because the filters are confusing?” should not become a finding
about the participant. We had to tell the model that findings and quotes should
come from the interviewee.

The finding was stored with a persistent application ID and a relationship to
the transcript, project and question. It appeared in the product before
synthesis and could be grouped by file or by research question. A document
could refer to it. Later, it could be edited.

This also changed how partial progress looked. Findings from one file were useful
on their own; they did not have to remain invisible until the final cross-file
document was ready. The researcher could inspect the evidence layer directly.

This mattered because the output between the two model calls was no longer
disposable text. The application could open it, render its evidence and use its
identity again after the original generation request had finished.

While building this, we also tried giving the model more freedom to make
analytical conclusions. The results could sound good, but in my experience they
became too speculative too easily. The text could move from what the interviews
said to an interpretation that was plausible but weakly supported.

The UX researchers we worked with did not necessarily want us to automate that
part of the work. Finding patterns, noticing deeper connections and interpreting
the material were important parts of their professional judgement. They wanted
help getting through a large amount of material and bringing the relevant
observations together. They still wanted to inspect context and decide what the
evidence meant.

So a finding was question-directed, but source-bound. It was not neutral
transcription: asking a different research question could produce a different
set of findings from the same interview. The constraint was that the finding
should stay close to what its citations supported.

The product settled into a useful division of work. The model extracted and
compressed observations. The application preserved identity and evidence. The
researcher could inspect the source and make the deeper interpretation. Breyta
also had chat, where users could deliberately ask the model for freer analysis
when they wanted it.

## The extra layer worked

By December 2024, one version of the pipeline had three named levels: nuggets,
findings and themes.

Long transcripts were divided into pieces of roughly 6,000 tokens. Transcript
CSV was split along rows and the header was repeated for every piece. We could
process the pieces in parallel.

The first call extracted nuggets. A nugget was a self-contained, source-bound
observation with an exact citation and, where available, a timestamp. The prompt
asked the model to be exhaustive and avoid conclusions or extrapolation. The
research context focused the extraction on the questions we cared about.

Each transcript piece could produce many nuggets. The intention was to collect
the relevant details before a later call decided which ones belonged together.
Splitting the transcript at this stage also meant that the first model call did
not need to know what the final report should look like.

Once all the nuggets for one transcript existed, another call consolidated them
into findings. A finding was broader and normally combined several related
nuggets. The model saw the nuggets under small integer IDs, while the
application kept their generated UUIDs and mapped the returned references back
to the stored objects.

After every transcript had findings, a third call produced themes across the
project. A theme needed support from at least two findings. Not every isolated
observation had to fit into one. The themes prompt also asked the model to retain
contradictions and different perspectives rather than forcing every interview
into one clean pattern.

The sequence was:

`transcript pieces -> nuggets -> findings -> themes`

A long interview could require several parallel model calls in the first stage,
then a per-transcript consolidation call, followed by the project-level themes
call.

The output of every stage also became state that the next stage depended on. A
failed piece could hold back the findings for its transcript, and themes waited
for findings across the project. The architecture was understandable, but it was
no longer one model request with a spinner.

This architecture worked.

The nugget stage gave us exhaustive extraction before consolidation. Each later
stage had a narrower job and explicit references to its supporting objects. It
was a serious design, not an embarrassing detour on the way to the obvious
answer.

It also meant more model calls, more model cost and more waiting. As the models,
our prompts and the surrounding harness improved, we eventually judged that the
separate nugget and finding stages were no longer worth keeping.

One per-file call became good enough at doing both jobs together. It still had
to return factual observations, verbatim quotes and exact timestamps. It could
still say that a file contained nothing relevant. We removed a semantic layer
without removing the evidence contract.

New projects moved to the simpler path while the structured workflow remained
in the repository as legacy code. We did not prove equal recall between the two
designs. We judged the simpler call good enough with the models, prompts and
harness we had. The surviving architecture was roughly:

`per-file findings -> cross-file synthesis`

## The synthesis model knew less than the product

Before a synthesis call, the application reduced every finding to its finding
text and citation text, then assigned it a small local number. The model did not
receive timestamps, transcript IDs, persistent finding IDs or the rest of the
application metadata.

It generated references such as `[0]` or `[0,2]`. After generation, code used a
private lookup table to replace those numbers with references to the persistent
finding objects:

```text
model:       [0,2]
application: <finding id="..." /> <finding id="..." />
```

The short numbers only meant something inside that synthesis request. The model
did not have to reproduce database identifiers. The saved document referred to
objects that already knew which transcript they came from and which citations
they contained.

The reduced input kept the synthesis job narrow. It could combine findings,
preserve disagreements and write a readable answer across files. It did not need
media timestamps because it was not seeking a video; the application retained
those for later.

We were careful about plurality in this prompt. Evidence from one finding should
not become “participants said”. When several findings supported a statement,
the generated text should include all the relevant local references. This was a
small detail in the prompt, but an important difference in a qualitative
research report.

There was an important limitation: synthesis could only use what extraction had
kept. If a relevant observation had been missed, the final call could not go
back into the transcripts and recover it. This was compression with a lossy
boundary, even though the retained findings had evidence.

The compact reference format was also generated input entering ordinary
application code. Sometimes a reference did not resolve to the expected object.
I remember seeing missing finding buttons and the fallback label `Finding F` in
the interface.

That label did not prove the adjacent sentence was false. It meant the route
from generated prose to the finding object had broken. The user could no longer
open the evidence from that reference.

The parser assumptions did not remain stable forever. After a later change of
synthesis model, bracket formatting changed enough that we had to harden the
parser. It learned to distinguish valid IDs from invalid ones, empty brackets,
Markdown links and other text that happened to use square brackets.

There is nothing particularly exotic about that. Generated reference syntax
had crossed an application boundary, so it needed validation and repair like
other external input. Validating the syntax and finding ID still did not prove
that the surrounding sentence was semantically supported by the citation.

## A citation was a route back to the interview

The output of synthesis was a readable document with finding references inline.
Opening one showed the stored finding and its citations. Clicking a citation
opened the transcript, moved to the relevant section, highlighted the quote and
sought the audio or video to the corresponding moment.

The finding reference was not restricted to the generated report. Findings
could be linked from editable documents, and the same evidence interaction also
appeared around chat answers. The durable ID made the route reusable across
these surfaces.

The path in the product was synthesis -> finding -> quote -> transcript ->
original audio or video.

This was normal customer use, not a debugging screen for when the model was
obviously wrong. Researchers checked the exact wording, who had said it and what
came before and after. With video, they could hear the tone and decide whether a
short written observation had lost an important qualification.

The finding could be accurate while the next sentence qualified it or described
a workaround. The point of opening the source was not only to catch a bad
reference; it was to continue the analysis in material the model had compressed.

The citation contained two useful locators. `start_ms` got the application to
roughly the right transcript row and media position. The verbatim quote
identified the visible words to highlight.

Exact string matching was too fragile. Punctuation could differ, transcription
could be corrected and model output could vary slightly around the quote. We
used tolerant word matching instead.

That small matcher still accumulated real bugs. Parentheses in a quote caused
one version to fail. When matching failed in another case, we tried again after
dropping the first word from the generated quote. These fixes were not part of
the AI analysis, but they determined whether “show me the evidence” actually
showed anything useful.

The timestamp remained a useful second route when the text was imperfect. It
could put the player at the relevant moment even when highlighting needed
tolerance. A researcher could leave the compressed finding and listen to the
participant rather than treating extracted text as the final source.

## The reference could survive while the evidence changed

We added editing because transcripts contained small errors and findings
sometimes needed correction. Transcript editing preserved structural fields
such as row ID, timestamp and speaker while allowing the text to change.

Users did not normally regenerate every downstream finding and synthesis after
a small correction. The persistent IDs and timestamps could therefore keep the
route navigable while some of the text along that route had changed. A stored
quote might contain the old wording. A synthesis might have been written against
an earlier version of a finding.

We later stored synthesis history, but that still did not turn every transcript,
finding and report into one immutable snapshot. The link could survive more
changes than the exact evidence state that originally produced it.

There were two other important limits. Synthesis could only work with the
observations extracted earlier. And a reference that resolved to a valid
finding ID was not semantic entailment verification. We did not have another
model proving every sentence against every quote.

We also never benchmarked this architecture as the generally optimal way to
analyze interviews. It was the design we arrived at with the models and product
we had.

The combined-corpus experiment that convinced me there was a product used
Claude 3 Opus in the spring of 2024. Today's long-context models would handle
that prompt differently and, I expect, better. I do not know whether I would
draw every boundary in the same place now without testing it. I would still want
to test coverage, reference precision and how readily the output moved from
source-supported observation to speculation. I would also want to know whether
the researchers still benefited from findings they could inspect and manipulate
as real product objects.

Our generation pipeline moved in one direction: interviews became findings,
and findings became synthesis.

One of the most useful parts of the product moved in the other direction. A
researcher could leave the synthesis, open a finding, inspect the quote and hear
the original participant speak before deciding what the evidence meant.
