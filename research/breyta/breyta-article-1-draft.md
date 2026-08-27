# First extract, then synthesize

_First draft._

_Notes from building multi-file qualitative analysis that could lead back to
the exact moment in an interview._

## Put all the interviews in one prompt

In April 2024, the first version of Breyta that could analyze several interview
transcripts contained this line:

```ts
selectedTranscriptText.join('\n\n')
```

The user selected the transcripts. We joined their contents with two newlines
and sent the result to the model. The next iteration was more structured. It
labelled the inputs `Transcript #1`, `Transcript #2` and so on, and included the
research plan, notes and requested output format.

Conceptually it was still one request: here is the source material, please read
it and produce the analysis.

That was a reasonable first implementation. It matched what the user was doing
in the interface, and it let us test the product without first building an
analysis pipeline. The model got the complete selected source material. There
were no intermediate results to store, no jobs to coordinate and no earlier
stage that might discard something the final call needed.

I do not have a benchmark for what happened next, or a particularly bad output
I saved for future writing. My recollection is simply that it was far from good
enough in several ways. It stopped scaling as we added more files. Parts of the
analysis became too speculative. Precise references to the source material were
difficult.

The last part mattered more than it might in a normal document summary. Our
customers were mainly doing qualitative analysis of user interviews, often
video interviews. A statement about what participants did or believed was much
more useful if the researcher could inspect who said it, the words they used and
what came before and after.

Within days of the combined-prompt prototype, another product path was already
generating findings independently per transcript. These versions coexisted for
a while; there was no single clean commit where we removed one architecture and
installed the final one.

The split was initially simple. First inspect each source and extract what is
relevant. Only after that, combine the extracted material across sources.

## A finding had to survive the model call

The per-file output gradually became a more specific object. By the mature
version, a finding looked roughly like this:

```clojure
{:finding "The participant uses exports for weekly reporting."
 :citations [{:quote "We export it every Friday"
              :start_ms 183420}]}
```

The example is synthetic, but the shape is representative. A finding was a
concise observation related to the research question. It had one or more
verbatim quotes, and for our transcripts the quote carried the exact
`start_ms` value from the transcript row.

The prompt asked for factual observations, not conclusions or extrapolations.
It also allowed the model to return no findings when a file had nothing relevant
to the question. A quote was not to be translated. The timestamp had to be
copied from the row containing the quote.

Each extraction call received the project context, one file and one user
question. For an interview we could also tell it to exclude statements made by
the interviewer. This was useful because an interviewer's question can contain
a detailed hypothesis that should not be reported as something the participant
said.

These findings were stored separately, with a persistent application ID and a
relationship to the transcript, project and question. They were visible to the
user. They could be opened and, later, edited. They were not disposable text
used only to prepare the next model call.

The distinction affected the interface. A project could show findings grouped
by file or question before synthesis existed. A finding could be linked from a
document and reopened later. We were putting an application boundary around
something that had started as an intermediate model response.

This was partly an engineering response to the combined prompt. The synthesis
step no longer had to inspect every transcript and find the evidence again. It
received a smaller set of source-bound observations.

There was also a product decision behind it.

We experimented for a period with letting the model produce more analytical
conclusions. I do not remember the exact version or prompt where this happened,
but I remember the result: it was too easy for the model to speculate. It could
write a plausible interpretation that went further than the interviews.

The UX researchers we worked with did not necessarily want us to automate that
part anyway. Pattern recognition, deeper connections and interpretation were
among the parts of the work they were most proud of. They wanted help going
through the material and bringing the relevant facts together, but they wanted
to inspect the context and make the deeper judgement themselves.

So a finding was not meant to be neutral transcription. It was selected and
compressed in light of a research question. But it was still supposed to stay
close to what one source supported.

That distinction was sometimes awkward to describe. An observation can be
factual and still reflect what the researcher asked the system to look for. A
different research question could produce a different set of findings from the
same interview. The constraint was that the text should not go further than its
citations, not that the model had somehow removed every choice from the
extraction.

The division of work became roughly this: the model extracted and compressed
source-supported observations; the application kept their identity and
evidence; the researcher inspected the source and interpreted it. Breyta also
had chat, where a user could explicitly ask for freer analysis when that was
what they wanted.

## The extra layer worked

By December 2024, one version of the analysis pipeline had three named levels:
nuggets, findings and themes.

Long transcripts were divided into pieces of roughly 6,000 tokens. For
transcript data, we split along rows and repeated the CSV header. The pieces
could be processed in parallel.

The first call extracted nuggets. A nugget was intended to be a self-contained,
objective observation with an exact citation and, where available, a timestamp.
The prompt asked for exhaustive coverage. The research context focused what to
look for, but the model was not supposed to draw conclusions.

Once all nuggets for a transcript existed, another call consolidated them into
findings. A finding was broader and would normally combine several related
nuggets while retaining their nuance. Temporary integer IDs connected each
finding back to the nuggets supporting it.

The model might see nuggets numbered `0`, `1` and `2`, while the application
kept their generated UUIDs outside the prompt. When the model returned
`nuggetIds`, we mapped the small numbers back to those stored objects. We later
used the same basic technique at the finding-to-synthesis boundary.

After all transcripts had findings, a final call generated themes across the
project. A theme needed support from at least two findings. Its input could
contain observations from several interviews, including disagreements and
different perspectives. Not every finding had to become part of a theme.

The full path was therefore transcript pieces -> nuggets -> findings -> themes.
A long interview could require several model calls in the first stage, followed
by the per-transcript consolidation and the final project-level call.

This architecture worked. It was not a dead end caused by a faulty idea. The
nugget stage gave us a way to pursue exhaustive extraction before asking the
model to compress anything. The following stages had narrower jobs and explicit
links to their supporting objects.

It was also expensive in model calls and waiting time. I do not have useful
numbers for either, and I cannot remember a particular report where the delay
became the decisive incident. We judged that the extra semantic layer was no
longer worth what it added.

Models had improved. Our prompts and the harness around them had improved too.
We found that one per-file call could now do the nugget extraction and the
finding consolidation well enough together. The new call still had to return
factual, question-directed observations with verbatim quotes and timestamps. It
could still return an empty list. We removed a layer without removing the
evidence contract.

The transition was not a satisfying deletion of every old namespace. New
projects moved to the findings-and-synthesis path while the structured workflow
remained as legacy code. That is common in the Breyta history: the product
changed faster than the old implementation disappeared.

This left two main stages: generate findings independently from each file, then
synthesize across those findings.

## The synthesis model knew less than the product

For synthesis, the application reduced each finding to its text and citation
texts. It assigned the findings small local numbers. The model did not receive
the raw transcripts, timestamps, transcript IDs or persistent finding IDs.

At this boundary, timestamps were omitted. Synthesis needed the words supporting
a finding, but it did not need to seek a video. The application still held the
timestamp on the stored citation for when a user opened it later.

It produced references such as `[0]` or `[0,2]` in the generated Markdown. After
generation, application code used a private lookup table to replace those
numbers with references to the stored finding objects:

```text
model:       [0,2]
application: <finding id="..." /> <finding id="..." />
```

The model only had to work with short IDs that were meaningful inside that one
request. It did not need to reproduce long database identifiers. The saved
document referred to durable objects that contained the transcript relationship,
citations and the rest of the application data.

This reduced representation also constrained synthesis. If the extraction calls
had missed something, the synthesis call could not go back to the transcript and
recover it. It could only combine the findings it had been given. We asked it to
preserve disagreement, avoid unsupported source counts and reference the
findings frequently.

This made some synthesis wording quite mechanical by design. If evidence came
from one source, the output should not turn it into what "participants" thought.
When several findings supported the same statement, the model was supposed to
include all relevant local IDs. The source-count discipline was another thing
the reduced representation had to retain.

The mapping was compact, but it was still a generated syntax crossing into
application state. Our first tests covered valid individual references,
multiple references and text without references. They did not cover every
malformed or unknown ID the model could produce.

I remember seeing synthesis output where a reference did not become the normal
button. Sometimes it was missing; sometimes the fallback UI showed `Finding F`.
I do not remember the exact report or the precise triggering output well enough
to reconstruct one incident.

`Finding F` did not necessarily mean that the adjacent claim was false. It meant
that the application had failed to resolve the generated reference into the
object the UI expected. That was still a serious product failure: the reader had
lost the route to the evidence.

The contract remained sensitive to model behavior after the feature had been in
use for a while. When we later changed one of the synthesis models, generated
bracket syntax changed enough that the parser needed hardening. It had to deal
with mixtures of valid and invalid IDs, empty brackets, ordinary Markdown links
and other text that happened to use square brackets.

The repair code could check whether a generated number existed in the private
finding index and normalize the syntax. It could not establish that the sentence
next to the reference was actually entailed by the cited finding. Those are
different checks.

## A citation was a route back to the interview

In a synthesis document, a finding reference appeared inline with the generated
text. Opening it showed the stored finding and its citations. Clicking a
citation opened the transcript, scrolled to the relevant section, highlighted
the quote and sought the audio or video to the corresponding moment.

The selected finding and citation were carried in application and URL state, so
the evidence view did not depend on the synthesis component keeping a private
in-memory selection. The same basic navigation could be reached from findings
pages and documents.

A researcher could move from a statement covering several interviews to one
supporting observation, then hear the original participant say it.

This was normal use of the product, not only something we expected people to do
when the model appeared obviously wrong. Researchers used the source to check
the exact wording, who said it, the surrounding context and the tone. They could
decide whether the synthesized wording had compressed the source too
aggressively or missed an important qualification.

Making that interaction work involved more than rendering a citation marker.
The timestamp and quote did different jobs.

`start_ms` gave us the approximate row and the media location. The quote text
identified the words to highlight. Exact string matching was too fragile for
this. Transcript formatting and punctuation varied, and small transcription
corrections could change the text. We used tolerant word matching instead.

The transcript view found the row nearest the timestamp, then searched for the
quoted words around it. Audio and ordinary video used the timestamp to set
playback position; YouTube needed its own seek path. These were separate pieces
of frontend state that had to agree about whether the number represented
milliseconds or seconds.

That matcher accumulated ordinary fixes. Quotes containing parentheses could
crash one version. There were off-by-one problems around the last word. When a
match failed, one later version tried again after removing the first word from
the generated quote. None of this changed the analysis architecture, but it
determined whether clicking evidence actually showed evidence.

The timestamp was also useful when the visible text was imperfect. Even if the
quote matcher needed tolerance, the media player could seek to the recorded
moment. For video interviews, the researcher could listen to the speaker rather
than treating the model's extracted text as the final source.

We later added editing for findings and transcripts because transcription was
not perfect either.

## The reference could survive while the evidence changed

Most edits were small corrections. A transcript might have a wrong word. A
finding might need wording adjusted to better match the source. Users did not
normally regenerate every finding and synthesis after correcting the
transcription.

Transcript editing preserved structural fields such as row ID, timestamp and
speaker while allowing the text to change. That made sense for correcting a
word without moving the moment in the recording. It also meant an older stored
quote could now differ from the transcript text at that same timestamp.

The persistent IDs and timestamps often kept the navigation working. A
synthesis could still refer to the same finding, and the finding could still
open the same moment in the recording.

But stable identity was not the same as a historically immutable evidence
graph. A stored citation could contain the old transcript text. Synthesized prose
could have been written against an earlier version of a finding. We stored
synthesis history later, but that did not version every source and intermediate
object as one consistent snapshot.

I do not remember this causing a specific customer incident. It is a consequence
of how editing and regeneration worked, not a failure story I can document from
production.

There were other limits. A syntactically valid finding reference was not a
semantic verification of the surrounding claim. We did not have an entailment
model checking every sentence against every quote. And if per-file extraction
omitted a relevant observation, synthesis had no access to it.

I regarded the findings-and-synthesis design as essential to the quality and
inspectability we reached, but we did not run a benchmark that proves it was
optimal. I also do not know where I would draw the same boundaries using current
long-context models without testing them. They would handle the first combined
prompt better than the models we used in 2024. That does not give me a measured
answer for reference precision, coverage or the right division of work in this
product.

What we built could compress a collection of interviews into a smaller set of
source-bound observations and then into a readable synthesis. The useful path
also ran in the opposite direction. A researcher could leave the generated
summary, open the finding, inspect the quote and hear the original person speak
before deciding what the evidence meant.
