# A voice agent demo takes a day. Production takes a year.

_First draft._

_Notes from turning a useful phone-answering demo into a realtime system for
real callers and real appointments._

## The test that passed for the wrong reason

At one point, while working on appointment booking, I thought Kari had become
very good at understanding Norwegian national identity numbers, or
_fødselsnummer_, over the phone. I could read mine aloud and she got it right every
time. A colleague tried his and it worked fairly often, though not quite as
reliably. Then I asked roughly ten other people to test it, and the result was
terrible.

The explanation took me much longer to find than it should have. My own tests
were unusually favorable: I knew what Kari expected, spoke clearly and repeated
the same number. But much more importantly, my identity number was in the prompt as an
example. The model was not reliably transcribing an arbitrary eleven-digit
number. It had seen the answer it needed for my tests. That also explained why
my colleague's similar number worked unusually often.

I had tested the prompt more than I had tested the product.

A Norwegian national identity number has eleven digits. It is structured data,
but on a phone call it arrives as speech: digit groups, pauses, corrections,
different rhythms and sometimes number words rather than individual digits. The
model has to distinguish between similar sounds and avoid helpfully completing a
sequence it thinks it recognizes.

I kept working on the spoken path, but I no longer wanted the conversational
model to be the only thing standing between a caller and an incorrect
eleven-digit identifier.

The better input method appeared almost by accident. While testing, I noticed
events I was not expecting in the logs. Turns out I had touched the keypad
during testing. The telephony stream already exposed each keypad press as a DTMF event.

That changed the problem. Kari could ask the caller to type the number and
validate the result deterministically, rather than relying on the model to
recover all eleven digits from arbitrary speech. The spoken path remains useful
as a fallback, and has also improved, but the complete identity-number
architecture is a story of its own.

The lesson for me was not simply that more testers are better. Even the next ten
testers were still testers. They knew they were exercising an AI system and were
role-playing a task. Real callers are not trying to help the test succeed. They
may use speakerphone, speak quietly or talk to someone else in the room, and
they have an actual appointment or problem at the end of the interaction.

I have since found assumptions like this in more than the prompt. They also hide
in application state, the audio transport or the shape of an external API. The
identity-number failure was one of the times when the difference between a
useful demo and a robust system became impossible for me to ignore.

This was not because the original Kari demo was fake. The first useful version
could answer the phone, answer questions about a business and take a message.
That is still much of the product's basic value. A caller gets a conversation
rather than a voicemail greeting, and the business gets more than a missed-call
notification.

And the first useful version did not take very long to build. A basic voice
agent can be put together in an afternoon now, following one of many tutorials;
add a few more days of development and you can have a pretty convincing demo.

I started building Kari in March 2025. I have now spent more than a year
building what came after that first useful version, and the work is still
continuing. I do not mean that a production voice agent always takes exactly a
year, or that the first year ends at some recognizable point. The title is a
description of the difference I experienced between proving the idea and
operating it for real callers.

The largest increase in complexity came when Kari started doing more than
answering and recording information. Through my work with Legelisten.no, she can
also help with booking, moving and cancelling appointments for clinics where the
integration supports it. Now a conversational mistake can become an appointment
in an external system. The caller's identity, the selected clinic and
appointment type, the time that is actually available, the confirmation and the
result of the remote API call all have to agree.

## “IMPORTANT!!!” is not an architecture

My first response to unwanted model behavior was the obvious one: change the
prompt. If Kari did the wrong thing, I described the correct thing more
precisely. If that did not work, the instruction became important. Eventually
some instructions became `IMPORTANT!!!`.

This works surprisingly often, which is part of the trap. A prompt change can
fix the call in front of you. As the prompt and tool set grow, the same change
may affect a different part of the conversation. An instruction intended for
booking can change how the model answers an ordinary question. A rule that makes
one transition more eager can cause Kari to start booking when the caller only
wanted to leave a message. More tools give the model more ways to be helpful,
including several that are wrong for the current stage of the call.

I remember becoming quite frustrated with this. I would patch one behavior and
find that another had changed. The model had a long collection of instructions,
exceptions and available actions, and better wording no longer felt like a
sufficient way to reason about the system.

Kari now has explicit conversation modes. A call starts in a discovery mode.
Booking, identity capture, changing an appointment, cancellation and ending the
call have narrower modes of their own. A mode does not merely add a sentence
saying what Kari is currently doing. It changes the session instructions
completely and, importantly, which tools are available.

This reduced both context and authority. During identity capture the model does
not need to weigh every instruction for ordinary questions and appointment
changes. During ending of the call, it should not have the whole operational
tool set available. When the caller changes direction, application code records
that transition and builds the next session from the new state.

Identity capture made this narrowing necessary. The model needs to focus on
eleven digits and wait while the caller enters or speaks them. A generic
receptionist prompt has several reasonable impulses: fill silence, ask how it
can help, move the conversation forward or infer the rest of a familiar
sequence. During identity capture, those are precisely the wrong impulses.

Some instructions are scoped even more narrowly than a mode. A tool result can
return the operational facts together with an `_instructions` field for what
should happen next. An availability lookup with no suitable times needs
different guidance from one with several choices, so there is little value in
loading both branches into the permanent prompt. This technique of progressive
disclosure is something I designed for Breyta several years ago, and was able to
reuse for Kari. It saves context and keeps irrelevant rules out of the way until
they are needed.

Modes and local instructions made the system easier to reason about, but they
did not turn the model into a state machine. Confirmation was the next problem.

## A “yes” is not a transaction

Before creating an appointment, Kari reads back the final details and asks the
caller to confirm them. A prompt rule for this sounds straightforward: always
get explicit confirmation before booking.

I have seen several cases where that was not enough. The caller might hear the
summary and ask a question. They might correct their surname or some other
detail. They might say “yes, but…” and add a condition. In other cases they had
said yes to an earlier question. The model could look back through the
conversation, find language that resembled confirmation and proceed with the
booking without obtaining a fresh confirmation of the current details.

From the model's perspective, this is not entirely irrational. Its context
contains an affirmative answer and instructions saying that an affirmative
answer is required. What the application needs to know is more specific: did the
caller hear this version of the booking summary and then confirm it, with no
question, correction or material change in between?

That is now represented programmatically. The application arms a confirmation
guard when the current summary is presented. It tracks the subsequent assistant
and caller turns. If there is another question, a correction or other dialogue,
the old confirmation round is no longer sufficient. Kari has to present the
updated summary and receive a new, clean confirmation before the booking can be
submitted.

The model can still decide whether the latest utterance sounds like a
confirmation, a correction or a qualification. Application code decides whether
that answer counts as confirmation now. An old yes elsewhere in the transcript
cannot satisfy the guard by itself.

Moving an appointment gives another example. In some cases it means creating the
new appointment and then cancelling the old one. If the second operation fails,
the caller may now have both. Kari must not say that the appointment was moved
successfully just because the first half succeeded.

These details define what is true and what the system is permitted to do.
Callers do not speak in database fields, but that does not make the conversation
history a database or every plausible interpretation an authorization.

There is another condition hidden inside the confirmation question: the caller
must actually have heard it.

## Generated is not heard

The model can finish generating a sentence the caller never hears. Telephone
audio has more stages: the response is streamed, the telephony provider buffers
it, some portion is played, and the caller may interrupt before the rest is
heard.

Kari cannot mark a summary as delivered merely because the model finished
generating it. The realtime path uses playback acknowledgements from Twilio to
track when queued speech has drained. Timers for silence and ending are tied to
audible delivery rather than generation completion. This matters for ordinary
turn-taking, and it matters even more when the next caller response could
authorize an appointment.

Interruption makes the distinction concrete. When the caller starts speaking
over Kari, the system cancels the active model response, clears queued telephone
audio and records that the output was audibly interrupted. It also has to
correct the model's conversation context. Otherwise the model may continue as if
it said the complete sentence even though the caller heard only the beginning.

That coordination is easy to miss in a demo. If I am testing politely, I wait
for Kari to finish. Real callers interrupt when they have understood enough,
when Kari misunderstood them, or when they simply speak as they would with
another person.

Silence has the opposite problem: nothing observable happens, but for several
different reasons. A caller may answer with a very short or quiet “yes” that
semantic voice activity detection does not turn into a usable caller turn.
Sometimes the model ends its response without a question, and the caller waits
because it is not obvious who should speak next. Sometimes the model appears to
stop even when it is clearly its turn, and only continues when the caller
eventually says “Hello?”.

I added nudges to recover those calls, but a single silence timeout was wrong.
If the caller says “give me a second,” silence is exactly the correct response.
Identity-number entry needs more time and should reset its timer whenever
another keypad digit arrives. The ending question has a different timeout and
recovery from an ordinary conversation. The current implementation therefore
treats silence according to the active mode and recent caller intent rather than
as one global duration.

Even a sensible recovery mechanism can introduce another race. For slower tool
calls, I tried scheduling a short “one moment” response so the caller would not
sit in dead air. The tool itself ran synchronously while generation of the
progress response was asynchronous. Sometimes the tool finished and the proper
result was ready, but the scheduled progress response still arrived. The caller
could hear two preambles and then wait longer for the answer that was already
available.

The main path now prefers a localized preamble spoken before or together with
the tool call, and does not schedule that delayed progress response where it can
arrive stale. This is less elegant than the original idea, but it matches the
actual concurrency model. A message intended to hide latency is still a response
competing for the realtime session.

Model events alone are not enough to describe a phone call. The application also
needs evidence about audio, playback and time.

This created another problem: how could I test the model inside these
boundaries?

## Test the system that actually ships

Most of Kari can and should be tested with ordinary deterministic tests.
Validation, state transitions, time formatting, retry decisions, confirmation
guards and prompt assembly all have behavior that can be asserted without
calling a model. I can also test that the current mode contains the intended
instructions and that tools which should be unavailable are actually absent.

What I cannot test that way is whether the model will obey those constraints.
Given the production prompt, tools and model, will Kari actually do the right
thing when a caller says this?

The prompt can contain the correct instruction and the model can still ignore it
or call the wrong tool. A model update can change that behavior without changing
any application code.

I built a realtime scenario system for this layer. Scenarios are EDN data
describing a call situation, the caller turns, relevant account and feature
configuration, tool outputs and the properties expected from the run. The runner
builds the production prompt and tool set, connects to an actual realtime model
and continues through model-emitted tool calls. Tools can be stubbed when the
test is about model behavior, while selected scenarios can use more of the real
path.

One scenario recreates the fresh-confirmation failure above and checks that Kari
does not book after a follow-up question, only after a new, clean confirmation.

Assertions focus on properties that should remain stable despite generative
wording: which tool was called, its order and arguments, a required or forbidden
action, a mode transition, or text that must not appear. The run also records
artifacts, including the conversation and tool activity, so a failure can be
inspected rather than reduced to a boolean.

Not every useful judgement belongs in a regular expression. I still read
transcripts, or have an agent read them, to see whether the call makes sense. A
scenario may avoid every prohibited phrase and still answer the wrong concern,
repeat itself or leave the caller in an odd conversational position. The
combination of hard assertions and transcript review has been more useful than
pretending either one is sufficient.

The scenarios used to run as part of deployment. They are slower and more
expensive than deterministic tests, and the suite grew, so I now use them mainly
while developing significant changes to model behavior. A feature gets a new or
adjusted scenario, then I select relevant existing scenarios and check them for
regressions. They have caught problems repeatedly, but I do not have a measured
count I would trust enough to publish as a statistic.

Before the mode architecture was as developed as it is now, the tests were
particularly good at exposing the way a prompt change leaked into another
workflow. They remain useful after modes because the component inside each
boundary is still a model. The application can provide the correct state, prompt
and tools; the scenario reveals whether the model behaves usefully inside them.
Even a growing scenario suite only covers situations I have learned to describe.

## Production keeps going

Kari now has far more explicit state than the first demo, but the goal is not to
enumerate every sentence a human might say. That would be contrary to the reason
for using a language model. Even active conversation language eventually became
explicit state, but much of what callers say should remain open to
interpretation.

Real callers keep finding cases I did not think to simulate. They interrupt,
answer quietly, speak to someone else in the room and combine otherwise
familiar requests in new ways. New accounts add paths too. One account can
represent five underlying clinics and needs a location-selection flow before
availability can be handled correctly. Moving appointments still has
third-party fragility.

Kari can also mishear a detail and start a new booking when the caller meant to
change an appointment, or begin an appointment flow when taking a message would
have been better. Those mistakes are usually recoverable when the caller
corrects her. Silently creating, moving or cancelling the wrong appointment is
not.

The first demo showed that a model could have a useful phone conversation. More
than a year of production work has been about deciding what that conversation
may change, and what evidence the application needs before allowing it.

A conversational detour can be corrected. An old yes should not create an
appointment.
