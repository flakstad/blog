# First extract, then synthesize

_Notes from building Breyta's qualitative research product in 2024._

## The big prompt was surprisingly good

In the spring of 2024, we were looking for Breyta's second product.

Our first one was somewhere between a CRM and a data-activation platform. It
had customers, but it was not growing fast enough for the kind of company we
were trying to build. We decided to try something quite different: qualitative
research.

The team had a lot of experience with user testing from a previous startup. We
knew the work: record interviews, transcribe them, look for patterns and keep
the conclusions connected to what people had actually said.

We started building a product where researchers could upload audio, video and
text, organize it into projects and ask questions across the material. Breyta
produced findings, longer synthesis documents and chat answers. For video, the
transcript and player lived in the same research surface.

Claude 3 Opus had just made a new experiment possible. For this kind of work it
was clearly the strongest model available at the time. We could fit perhaps ten
interview transcripts into its context and ask what was going on across all of
them.

So we did.

And it was surprisingly good.

Opus found many of the important observations and themes. I remember being
impressed. This was one of those moments where a model did enough of a difficult
job that the product suddenly seemed obvious. A researcher could upload a set of
interviews, ask a question and get something recognizably useful back.

It also missed plenty. It was reasonably good at finding the large themes, but
qualitative research often depends on smaller observations and exceptions too.
References back to the interviews were poor. Checking the analysis could mean
returning to the transcripts and doing much of the source work again.

Opus was also extremely expensive for this use. Every new analysis meant sending
the corpus through the model again.

The implementation was about as direct as that sounds. We really did more or
less put the interviews into one prompt:

```ts
selectedTranscriptText.join('\n\n')
```

The user selected several transcripts. We joined them with two newlines and sent
them to the model. The next version added `Transcript #1`, `Transcript #2`, the
research plan, notes and some formatting instructions. It was still one call
asking Opus to read the sources, decide what mattered, compare them, write the
analysis and remember where everything came from.

It nearly worked. That was what made the next part interesting. We were trying
to turn an impressive inference into something we could run for real customers.

We needed to find more of the material, keep much better references and stop
making the final model call rediscover every source from scratch.

## What a finding became

We began by analyzing each transcript separately and only combining the results
afterward. The per-file output eventually became a finding that looked roughly
like this:

```clojure
{:finding "The participant uses exports for weekly reporting."
 :citations [{:quote "We export it every Friday"
              :start_ms 183420}]}
```

The example is synthetic, but that was the basic shape. One observation, one or
more verbatim quotes, and for a transcript an exact `start_ms` copied from the
row containing the quote.

The call also received the project context and the research question. Findings
were not an attempt to extract every statement from an interview. They were the
parts of one source relevant to what the researcher was trying to understand.
If the file had nothing relevant, returning no findings was fine.

The number of model calls now grew with the number of interviews, and we ran
straight into Anthropic's rate limits. I changed one findings path from Opus to
GPT-4 Turbo specifically because the Anthropic API kept rate-limiting us. Opus
was clearly better at the work, but that did not help if it was too expensive
and we could not call it at the rate the product required.

Interview questions caused a surprisingly easy error. An interviewer might ask
something like, “When you struggle to export the report, is it because the
filters are confusing?” The premise is in the transcript, but the participant
has not said it. We had to be explicit that findings and citations should come
from the interviewee, not from a detailed hypothesis embedded in the question.

We stored each finding with its own application ID and links to its transcript,
project and research question. Findings appeared in the UI before synthesis was
ready. Researchers could browse them by file or question, open the citations
and later link the same finding from a document.

We spent some time working out what kind of statement a finding should be. We
tried letting the model make more analytical conclusions. It could produce
convincing prose and move rather casually beyond what the interviews supported.

The UX researchers we worked with were not asking us to take over all of that
work anyway. Finding patterns, making connections and interpreting nuance were
valuable parts of their job. They wanted help getting through the material and
bringing the relevant observations together without losing the source. Then
they wanted to make the deeper judgement themselves.

That is why a finding ended up in a slightly unusual place. It was not neutral
transcription. A different research question could produce different findings
from the same interview. But it was supposed to stay close enough to the source
that the researcher could inspect the quote and decide whether the compression
was fair.

Chat was less constrained. If a user deliberately wanted the model to explore an
interpretation, they could ask for that. The default analysis pipeline stayed
closer to the evidence.

## We made it more complicated, then simpler

By December 2024 we had turned the original prompt into quite a lot of machinery.
The pipeline had three named levels: nuggets, findings and themes.

Long transcripts were split into pieces of roughly 6,000 tokens. We split the
CSV along transcript rows and repeated the header for each piece, then processed
the pieces in parallel.

The first calls produced nuggets. A nugget was a self-contained observation with
an exact citation and, when available, a timestamp. We asked for exhaustive
coverage and no interpretation. The idea was to collect the details before a
later model call decided which ones belonged together.

One transcript piece could produce many nuggets. At this stage the model did
not need to know what the final report should look like. It only had to work
through its part of the interview without skipping relevant observations. That
made the first stage rather repetitive, which was intentional.

Once all the nuggets for a transcript existed, another call consolidated them
into findings. The model saw the nuggets under temporary integer IDs. The
application kept their real UUIDs and mapped the returned references back after
generation.

When every transcript had findings, a final call produced themes across the
project. A theme needed support from at least two findings. The prompt told the
model to retain disagreements rather than forcing every interview into a tidy
common story.

Not every finding had to become a theme. An isolated but relevant observation
could remain a finding. And one participant saying something was not enough for
the final text to say that “participants” had said it. When a statement did
combine several interviews, we expected it to carry the references for all of
the findings behind it.

The sequence was:

`transcript pieces -> nuggets -> findings -> themes`

The annoying part was that it worked.

The nugget stage gave us broad coverage before consolidation. The next call had
a much smaller job, and every finding still pointed back to the observations
supporting it. Themes then worked across those findings instead of reading the
raw corpus again.

But a long interview could require several model calls for nuggets, followed by
another call for findings, and then the project still had to wait for themes.
There was more model cost, more waiting and more intermediate state to recover
when something failed.

The dependencies were quite literal. One failed transcript piece could hold
back all the findings for that interview. The theme job waited for findings
across the project. We had started with one request and a spinner; now we had
parallel extraction jobs, per-transcript consolidation and a project-level job
that could only begin when enough of the earlier work had finished.

Models improved. Our prompts and the code around them improved too. Eventually
we decided that a separate nugget call was no longer worth it. One per-file call
could extract the relevant material and consolidate it into findings well enough
for the product.

We did not throw away the useful contract. The combined call still returned
source-bound findings with verbatim quotes and timestamps, or an empty list when
the file had nothing to contribute. New projects moved to the simpler path. The
old structured workflow stayed around as a legacy path for a while, because
software history is rarely as neat as the product story.

We were back to two main stages:

`per-file findings -> cross-file synthesis`

The synthesis model did not get the transcripts again. We gave it the finding
text and citation text, with each finding assigned a small number. It did not
get timestamps, transcript IDs or persistent application IDs. Those stayed
with the application, which already knew how to show a transcript and seek the
video.

The references it generated looked like `[0]` or `[0,2]`. Afterward, a private
lookup table replaced those numbers with references to the actual finding
objects:

```text
model:       [0,2]
application: <finding id="..." /> <finding id="..." />
```

The short IDs existed only inside that request. The model did not have to copy
database identifiers. The saved document still referred to the real findings.

Sometimes a generated reference failed to resolve. The UI would show a missing
button or the fallback label `Finding F`. That was obviously not great.

`Finding F` did not necessarily mean the synthesis claim was wrong. It meant we
had lost the link to the object that could show its evidence. Later, switching
synthesis models changed the bracket formatting enough that we had to harden the
parser. It learned about invalid IDs, empty brackets, Markdown links and other
text that happened to contain square brackets.

There was another cost to the reduced synthesis input. If the per-file calls had
missed an observation, synthesis could not return to the transcript and find it.
The coverage of the final document was bounded by the findings we had kept.

## Back to the interview

In the finished product, synthesis was a readable document with finding
references embedded in the text. Open one and you saw the finding and its exact
quotes. Click a quote and Breyta opened the transcript, scrolled to the right
place, highlighted the words and sought the audio or video to that moment.

The same reference was useful outside the generated synthesis. Researchers
could link findings from editable documents, and chat answers used the same
route back to the evidence. The persistent finding ID was what let those
surfaces share the interaction without copying the transcript or citation into
each of them.

Researchers used this routinely. They checked exactly what had been said, who
had said it and what came before and after. With video, they could hear the tone
or notice that the next sentence qualified the neat observation in the finding.
Opening the source was not only a way to catch a broken reference. It was part
of continuing the analysis.

A finding could be accurate and still leave out the workaround mentioned in the
next sentence. Or it could make a hesitant answer look firmer than it sounded.
The short written observation got the researcher to the interesting part; it
did not have to replace the interview.

Getting from a citation to the right moment had its own small collection of
problems. The timestamp and the quote did different jobs. `start_ms` got us to
roughly the right transcript row and media position. The quote identified the
words to highlight.

Exact matching was too fragile. Punctuation changed, transcripts were corrected
and a generated quote could differ slightly around the edges. We ended up using
tolerant word matching. Parentheses in a quote broke one version of the matcher.
Another retry simply dropped the first word and tried again. Small fixes, but
without them “show me the evidence” sometimes showed the wrong piece of text or
nothing at all.

We also let users correct transcripts and findings. A transcript edit preserved
the row ID, timestamp and speaker while changing the words. Users did not
normally regenerate every downstream finding and synthesis after correcting a
small transcription error.

The persistent IDs and timestamps often kept the route working even when the
text along it had changed. An older quote could differ from the corrected
transcript, or synthesis could have been written against an earlier version of
a finding. We later stored synthesis history, but we never had one immutable,
versioned snapshot containing every transcript, finding and report.

I would absolutely retry the big-prompt experiment with today's long-context
models. I expect it would work much better. I would not choose all the same
boundaries again without running it through real research projects. A model
being able to read the whole corpus still does not tell me whether researchers
want inspectable findings they can work with.

Our generation pipeline moved from interviews to findings, and from findings to
synthesis.

One of the most useful parts of the product moved in the opposite direction. A
researcher could leave the synthesis, open a finding, inspect the quote and hear
the original participant speak before deciding what the evidence meant.
