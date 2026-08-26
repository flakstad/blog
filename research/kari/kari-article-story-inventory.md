# Kari article story inventory

Editorial handoff, not article prose. This ranks the stories most capable of carrying the argument in “A voice agent demo takes a day. Production takes a year.” Detailed mechanisms and safety classifications remain in `docs/kari-production-voice-engineering-inventory.md`.

The inventory is intentionally broader than the first article. For that article, use the identity-number incident, giant-prompt transition, reused confirmation, realtime delivery/silence/progress, and scenario testing as the main spine. Treat progressive `_instruksjoner` as a brief example; defer the full multilingual architecture, customer variation, acoustic-scene handling, and ambient audio bed.

## Recommended core stories

### 1. The identity-number test that already contained the answer

- **Narrative role:** Opening incident or the first decisive turn from demo confidence to production humility.
- **Problem:** Spoken national identity numbers seemed to work perfectly in developer testing.
- **What happened:** Andreas's own number was embedded in the prompt as an example. It worked every time for him. A colleague with a similar number succeeded often. A broader group of roughly ten testers failed badly, exposing that the model had learned a specific prior rather than robust digit capture.
- **Engineering response:** Deterministic validation, DTMF as the primary channel, and two independent speech fallbacks.
- **Why it matters:** It demonstrates that self-testing can validate the prompt's hidden assumptions rather than the product. Authentic users change the input distribution.
- **Tradeoff:** Spoken input remains a useful fallback, but not the authoritative path.
- **Evidence:** Interview; `src/kari/websockets.clj`; `src/kari/fnr_speech_transcription.clj`; `src/kari/realtime/transcription.clj`; FNR modes and tests.
- **Safety:** Never reveal the identifier or sensitive prompt body.

### 2. “IMPORTANT!!!” was not an architecture

- **Narrative role:** Explain why the large prompt stopped scaling.
- **Problem:** Fixing one behavior by adding or emphasizing another instruction caused unrelated regressions. The prompt accumulated rules competing with many simultaneously available tools.
- **What happened:** Andreas recalls frustration, failed wording changes, and increasingly emphatic markers such as “IMPORTANT!!!”. There is no single remembered call, but history shows the architectural response.
- **Engineering response:** First progressive outcome instructions, then base + mode prompts, explicit application modes, mode-scoped tools, and deterministic state.
- **Why it matters:** The important shift was not finding a better prompt. It was reducing how much behavior and authority the model had to consider at once.
- **Tradeoff:** Prompts still matter and still regress; modes constrain rather than eliminate model behavior.
- **Evidence:** Interview; commits `ba63d608` and `ce876c79`; agent prompt/mode/tool namespaces.

### 3. A previous “yes” is not current authorization

- **Narrative role:** Strongest deterministic-boundary example.
- **Problem:** The model reused an earlier yes or a qualified “yes, but…” to authorize booking after later questions or corrections.
- **What happened:** Bookings were performed without a fresh confirmation of the final current details. Prompt rules requiring confirmation were insufficient because the model could locate a plausible yes in its own context.
- **Engineering response:** A confirmation protocol in application state: arm after presenting the current summary, track intervening turns/corrections, and reject submission until a fresh clean confirmation occurs in the correct round.
- **Why it matters:** A conversational concept became a transactional invariant once it authorized an external action.
- **Tradeoff:** The model still interprets the latest utterance, but old context can no longer independently authorize the action.
- **Evidence:** Interview; confirmation guard code; commits `bc687f6a` and `65acf7a4`; real-guard scenario.

### 4. Silence is a state machine

- **Narrative role:** Main realtime/audio section.
- **Problem:** A quiet “yes” may not trigger semantic VAD; the model may omit a question and leave the caller waiting; or the model may simply stall until the caller says “Hello?”. But silence may also mean the caller explicitly asked Kari to wait or is entering sensitive digits.
- **Engineering response:** Playback-anchored, mode-dependent timers: ordinary re-engagement, explicit-wait classification, longer staged identity nudges reset by digit progress, one post-tool recovery, and a separate ending timeout.
- **Why it matters:** “No event” has multiple meanings. A universal timeout is not a recovery policy.
- **Tradeoff:** Nudges recover the interaction, not missed audio; thresholds remain heuristic.
- **Evidence:** Interview; silence code and scenarios; timing inventory.

### 5. The “one moment” message that arrived too late

- **Narrative role:** Concrete concurrency/latency story inside the realtime section.
- **Problem:** Delayed progress speech intended to cover a slow tool raced the actual tool result.
- **What callers heard:** Double preambles and unnecessary delay before the useful response.
- **Engineering response:** Prefer a localized preamble before/in the tool-calling response; keep timing observability, but disable delayed progress generation in the synchronous callback path where it can become stale.
- **Why it matters:** A UX latency fix becomes a concurrent protocol participant and needs cancellation/ownership semantics.
- **Tradeoff:** Models remain imperfect at speaking preambles, while forcing them on fast internal steps sounds slow and robotic.
- **Evidence:** Interview; commit `9db83115`; response admission and progress lifecycle in `src/kari/websockets.clj`.

### 6. An operation returns facts and the local policy for what happens next

- **Narrative role:** Explain dynamic instructions/progressive disclosure.
- **Problem:** Every possible outcome branch cannot remain active in every prompt and tool description without consuming context and creating conflicts.
- **Engineering response:** Tool results contain structured operational facts plus `_instruksjoner`: outcome-conditioned guidance revealed only after success, no result, validation failure, partial failure, retry exhaustion, or escalation becomes true.
- **Why it matters:** The operation is the first component that knows which branch is real. It can reveal the relevant continuation policy without granting the model authority over the operation's truth.
- **Tradeoff:** The instruction is meant for the next step but physically remains in conversation context; deterministic guards remain necessary.
- **Evidence:** Interview; commit `ba63d608`; instruction namespaces and pure voice result builders.

### 7. The call switched to Ukrainian, but the workflow stayed partly Norwegian

- **Narrative role:** Multilingual section and another prompt-conflict example.
- **Problem:** “Always speak the caller's language” conflicted with exact Norwegian workflow phrases such as the ending question.
- **What happened:** Kari accommodated a caller's request for Ukrainian, but Norwegian utterances appeared throughout the conversation.
- **Engineering response:** Sticky validated language state, an explicit language-change tool, session rebuilds, first-class Norwegian/English localized control behavior, and prepared best-effort model translation for additional languages.
- **Why it matters:** General multilingual fluency is easier than keeping every deterministic workflow boundary in the same language.
- **Tradeoff:** Norwegian has richer deterministic speech projections; English translates them explicitly; other prepared languages rely more broadly on the model.
- **Evidence:** Interview; language core; multilingual commits and Ukrainian scenarios.

### 8. Test the model by running the model

- **Narrative role:** Testing climax.
- **Problem:** Unit tests can prove that the right prompt and tools were assembled, not that the deployed realtime model will obey them.
- **Engineering response:** EDN scenarios run through production prompt/tool construction against real model families, with tool stubs or selected real tools, hard behavioral assertions, artifacts, and transcript review by Andreas or an agent.
- **Practice:** Significant model-behavior changes add or adjust a scenario, then run a relevant regression selection. Scenarios used to be part of deployment but are now a development tool.
- **Why it matters:** Stable invariants can be automated; conversational coherence still needs reviewable evidence. Andreas estimates scenarios have caught regressions tens or perhaps hundreds of times.
- **Tradeoff:** Slow, costly, nondeterministic, selectively run, and partly dependent on judgment.
- **Evidence:** Interview; scenario runner, scripts, EDN files, tests, artifacts, deployment documentation.

## Strong supporting stories

### Operations can partially succeed

Moving an appointment may require creating a new one and then cancelling the old one. The code distinguishes “new creation failed; old appointment intact” from “new created; old cancellation failed; caller may now have both.” This is the strongest example of why conversational plausibility cannot define operational truth. Current third-party rescheduling remains Kari's main fragility.

### Speech formatting is product policy

Dates and times required deterministic Norwegian speech forms. Kari supports both natural phrasing such as “halv fem” and explicit 24-hour speech such as “seksten tredve,” selected per account after discussion with Legelisten partners. The canonical timestamp remains separate.

### An authentic call is an acoustic scene

People use speakerphone, speak to others in the room, and generate background audio. Humans infer addressee easily; the model may treat room conversation as a turn. Prompt guidance, VAD, noise reduction, mode persistence, transcript cleanup, and caller correction mitigate but do not solve this.

### Customer configuration changes the workflow graph

Kari uses account instructions, settings, and feature flags. One customer-facing account represents five underlying clinics and needs a location/cross-location selection path. Accounts also differ in follow-up policy, cancellation behavior, bookable services, and callback eligibility. Describe categories, not private rules.

### Optional office ambience becomes infrastructure

The account-level background-noise option requires PCMU mixing, startup ordering, output-buffer awareness, idle framing, barge-in suppression, ending checks, gain tuning, and transcript artifact cleanup. Good sidebar; do not claim measured naturalness.

## Editorial ranking summary

| Priority | Story | Best use |
|---|---|---|
| 1 | Prompt contained the identity-number answer | Opening / first-real-users turn |
| 2 | Giant prompt and “IMPORTANT!!!” | Prompt-to-state transition |
| 3 | Reused “yes” | Deterministic boundary |
| 4 | Silence state machine | Realtime/audio core |
| 5 | Late “one moment” | Concrete concurrency example |
| 6 | Progressive tool-result instructions | Prompt architecture |
| 7 | Ukrainian mixed with Norwegian | Multilingual boundary |
| 8 | Real-model scenarios | Testing climax |

## Claims supported by the evidence

- A useful voice-agent demo can be built in an afternoon or a few days.
- Kari's initial demo already delivered genuine product value: calls, questions, and messages.
- More than a year of continuous engineering was driven by real operations and authentic callers, not merely by adding conversational features.
- Explicit state, tools, validation, timing, and tests bound a probabilistic conversational component.
- Real-model scenario tests cover a failure layer deterministic application tests cannot observe.
- The system continues to evolve and still has known fragility.

## Claims to avoid

- That every voice agent requires Kari's exact architecture or healthcare complexity.
- That the first demo was fake or useless.
- That prompts are unimportant or that modes make the model deterministic.
- That scenario tests eliminate nondeterminism or catch every regression.
- That all languages have equal deterministic presentation formatting.
- That background ambience is proven to improve caller outcomes.
- Any precise customer scale, patient detail, private clinic rule, identity value, secret, or full production prompt.
