# Kari article structure memo

This memo proposes narrative structures for Andreas to write. It intentionally avoids finished article prose.

## Recommended structure: five main ideas and a conclusion

The first article should be deliberately less complete than the research. Its narrative chain is:

> A test passed for the wrong reason and exposed the gap after a genuinely useful demo → prompting stopped scaling → consequences required application state → realtime required evidence of delivery → the shipped model itself had to be tested.

“Production keeps going” is the conclusion, not a sixth technical section.

### 1. The test that passed for the wrong reason

Give the identity-number incident room to work as a story.

- Spoken identity-number testing succeeds perfectly for Andreas and often for a colleague.
- A wider group of roughly ten testers performs terribly.
- Discovery: Andreas's own number was present as a prompt example; the model had a hidden answer prior, and the colleague's similar number partly benefited.
- Larger point: the test was measuring the prompt's narrow distribution, not the production product.
- Zoom out briefly after the reveal: the original demo was useful and could take calls, answer questions, and take messages.
- Establish the title honestly: tutorial-level voice agents can take an afternoon, while Kari has required continuous production engineering since March 2025.
- Introduce real operations and higher stakes before returning to what eleven spoken digits actually require.
- Mention the eventual response—deterministic validation, DTMF primary, separate speech fallbacks—without explaining the entire identity architecture.

Avoid false causality: the incident exposed poor generalization and belongs to the path toward the later architecture, but the evidence does not establish that this single discovery immediately caused every FNR mechanism.

### 2. “IMPORTANT!!!” is not an architecture

- The natural first fix for model behavior is another prompt rule.
- Rules become emphatic; one patch fixes a behavior while breaking another.
- Introduce the historical transition to explicit modes, scoped tools, and application state.
- State the design effect: fewer simultaneously active instructions and fewer available actions.

Mention dynamic `_instruksjoner` in one or two paragraphs, not a separate section:

- A tool result can return facts plus local guidance for what happens next.
- The operation knows which outcome branch became real; every possible branch need not be loaded up front.
- Save the three instruction lifetimes and full prompt compiler for a later article.

### 3. A “yes” is not a transaction

This is the technical center of the article.

- Start with the reasonable rule: always obtain explicit confirmation before booking.
- Show the recurring failures: an earlier yes, a later correction/question, or “yes, but…” could still lead to booking.
- Ask the real invariant: did the caller confirm this version of these details after hearing them, with nothing material changing afterward?
- Explain the programmatic confirmation round/guard.
- Derive the broader principle: the model may interpret intent, but it does not own operational truth or authorization.

Canonical IDs, offered slots, deterministic booking state, and partial success should appear only as brief supporting examples. Do not enumerate the full booking workflow.

### 4. Generated is not heard

This is the second major technical realization and should connect directly to confirmation.

- In text, “generated” and “received” are often treated as nearly the same event. Telephone audio can be generated, buffered, partially played, interrupted, or never heard.
- Therefore “the caller heard the confirmation summary” cannot become true when generation completes.
- Explain playback acknowledgements and audible-delivery state.
- Use barge-in to show that the model may retain words the caller never heard.

Then move through two concise realtime consequences:

1. **Silence is state, not a timeout.** A quiet yes can disappear; the model can omit the question that tells the caller it is their turn; the agent may stall until “Hello?”. But “give me a second” means Kari should remain silent. Mention differentiated mode timers rather than listing every threshold.
2. **Recovery participates in concurrency.** The delayed “one moment” message raced the real tool result, producing double preambles and delaying the proper response.

Speakerphone and speech to other people in the room deserve at most one or two sentences. Exclude the ambient audio bed from this article.

### 5. Test the system that actually ships

Use scenario testing as the climax.

- Deterministic tests prove state transitions, confirmation guards, formatting, prompt assembly, and tool availability.
- They cannot prove that the actual deployed model will follow the assembled behavior for a caller utterance.
- Explain production-path scenarios against real model families, stable behavioral assertions, recorded artifacts, and transcript review.
- Preserve the mixed evaluation approach: hard failures where reasonable; Andreas or an agent reads transcripts for conversational regressions that should not be reduced to regex.
- Describe current practice: significant model-behavior changes add/adjust scenarios and run a relevant regression selection. Avoid unmeasured cost, runtime, or catch-count claims beyond the qualified recollection.

### Conclusion: production keeps going

Keep this short and reflective.

- Authentic callers continue to create combinations developer role-play did not cover.
- Mention customer-specific workflows, multi-clinic structure, language state, speakerphone/room speech, third-party appointment constraints, and caller corrections only as a compact list.
- The goal is not to enumerate all human conversation.
- The engineering decision is which mistakes can remain recoverable conversational detours and which must be stopped before they create real-world consequences.
- Closing idea: a caller correction can recover a conversational detour; an old yes must not create an appointment.

### Why this outline works

- It gives the strongest stories enough space instead of cataloguing every mechanism.
- It preserves the real usefulness of the original demo.
- It builds one argument from test distribution through state, delivery, and testing.
- It uses healthcare booking to raise the stakes without becoming a booking-system article.
- It leaves several substantial follow-up articles intact.

## Alternative structure 2: one booking, layer by layer

Use a synthetic, explicitly composite booking journey as the organizing device. Do not present it as one real caller.

1. Caller asks for an appointment.
2. Intent must select the right mode rather than message-taking/change/cancel.
3. Availability returns canonical slots plus speech projections and local instructions.
4. Identity moves to DTMF with speech fallbacks.
5. Final confirmation needs a fresh round, not an old yes.
6. The external operation may fail, retry, or partially succeed.
7. Confirmation must actually be heard; silence and interruption alter state.
8. Scenario tests replay each dangerous junction against the real model.
9. Different accounts alter the graph; authentic callers add paths nobody scripted.

**Advantages:** Extremely concrete and technically cohesive.

**Risks:** Can overrepresent healthcare booking and understate the original call-answering/message product. A composite journey must be labelled clearly to avoid inventing a production anecdote.

## Alternative structure 3: three boundaries around probability

Organize the argument conceptually around where Kari places boundaries.

### Boundary 1: contextual scope

- Giant prompt failure
- modes and tool allowlists
- progressive `_instruksjoner`
- language state

### Boundary 2: operational authority

- validated booking state
- fresh confirmation
- IDs and availability
- idempotency, retry, partial success, follow-up

### Boundary 3: realtime evidence

- generated versus heard
- interruption and transcript reconciliation
- silence modes and progress races
- scenario tests against actual models

Finish with the identity-number prompt-overfit story as proof that the unbounded part is not only language—it is the distribution of real callers.

**Advantages:** Strongest expression of the central engineering thesis; compact and intellectually clean.

**Risks:** More essay-like and less chronological. The best human stories may feel inserted as examples rather than driving the piece.

## Research map, not the first-article outline

The earlier broad outline remains useful for locating material, but it should not determine the first article's section count:

1. Useful demo
2. Identity-number test distribution
3. Giant prompt and modes
4. Transactional state and confirmation
5. Realtime delivery, interruption, silence, and progress
6. Dynamic instruction lifetimes and progressive disclosure
7. Multilingual application state
8. Real-model scenario testing
9. Customer variation and continued state-space growth

Items 6, 7, and most of 9 are deliberately compressed or teased in the recommended article. The engineering inventory remains the complete source of truth.

## Working thesis

Core problem statement:

> The apparent problem is open-ended conversation. The production problem is making that input drive bounded, reliable operations.

Architectural formulation:

> A production voice agent is a realtime application that lets a probabilistic model operate inside explicit boundaries.

Practical formulation:

> Let the model interpret and converse. Let the application own state, authority, and consequences.

Treat these as descriptions of Kari's evolution, not universal laws. Avoid “let the model handle language,” because active conversation language itself eventually became explicit application state.

## Recommended opening angle

Use the identity-number testing incident, then immediately protect the article from the wrong interpretation:

- The demo was not fake; it answered calls, questions, and messages.
- The identity test genuinely appeared to work.
- The failure was that the test environment and prompt had bounded the problem invisibly.
- Real users revealed what the system actually had to handle.

Do not write the opening as “AI is unpredictable.” The sharper point is: the apparent test was measuring a narrower system than the one production callers used.

## Recommended closing angle

- More than a year did not produce a solved conversational universe.
- It produced explicit recovery paths and hard boundaries around costly mistakes.
- Kari can still mishear intent, especially in messy rooms, and third-party appointment movement remains fragile.
- A caller correction can recover a conversational detour; an old yes must not create an appointment. Production engineering is deciding which uncertainty is tolerable and which must be bounded.

## Suggested article weight

| Section family | Approximate share |
|---|---:|
| Demo + identity-number incident | 20% |
| Giant prompt → modes | 15% |
| Confirmation / operational truth | 20% |
| Realtime/audio/timing | 20% |
| Scenario testing | 15% |
| Conclusion / authentic callers | 10% |

## Deliberately deferred from the first article

- Full multilingual architecture and the Ukrainian story: at most a brief mention that language became explicit state.
- Full `_instruksjoner` and runtime prompt-lifetime architecture: one example under modes.
- Detailed customer variation: conclusion only.
- Acoustic-scene handling: one or two sentences.
- Ambient audio bed: exclude.
- Full transcript reconciliation, provider workaround, retry, idempotency, and partial-failure implementations: reserve for focused follow-ups.

## Follow-up article backlog

Treat this as material already available, not a promised publication sequence:

1. **Testing the model is part of testing the application** — scenario DSL, production paths, real models, assertions, artifacts, transcript evaluation, and model upgrades.
2. **Our voice agent doesn't have one prompt** — prompt compiler, modes, session/response/conversation lifetimes, `_instruksjoner`, and progressive disclosure.
3. **Generated is not delivered** — playback acknowledgements, barge-in, transcript truth, silence, and ending protocols.
4. **Let the model talk; let the application own reality** — confirmation, canonical IDs, retries, idempotency, and partial success.
5. **Language is application state** — Ukrainian incident, sticky language, localized control speech, and the current hybrid formatting boundary.

## Evidence index for drafting

| Claim/story | Primary repository evidence | Interview evidence |
|---|---|---|
| Static prompt to progressive disclosure to modes | `agent/prompts.clj`; `agent/instructions.clj`; `agent/modes.clj`; commits `ba63d608`, `ce876c79` | Frustration, interaction regressions, “IMPORTANT!!!” |
| Identity-number prompt overfit and DTMF architecture | FNR modes; DTMF and sidecar code/tests | Personal-number example, colleague/broader testers, accidental DTMF discovery |
| Fresh confirmation | confirmation core/guard; real-guard scenario; March 2026 commits | Reused earlier yes, corrections, “yes, but…” |
| Speech-safe time policy | `util.clj`; `booking.clj`; prompt/tool result fields | Legelisten discussion; natural versus 24-hour account choice |
| Silence state machine | `websockets.clj`; language recovery builders; silence scenarios | Quiet yes, missing question, model stall, “Hello?” |
| Progress race | progress lifecycle; response admission; `9db83115` | Double preambles and delayed proper response |
| Multilingual state | language core; mode/session rebuild; multilingual scenarios/commits | Ukrainian call with Norwegian phrases |
| Partial appointment move | appointment change core, retries, result instructions/tests | Current third-party rescheduling fragility |
| Scenario tests | runner, EDN cases, assertion tests, scripts | Development workflow, transcript review, repeated catches |
| Customer variation | prompt compiler, flags, account settings, multi-clinic code | Five-underlying-clinics example and policy categories |
| Acoustic scene | VAD/noise settings, prompts, transcript cleanup | Speakerphone and speech to others remains hard |
| Ambient audio bed | audio-bed controller/tests and June/July 2026 commits | Account-setting rediscovery; no efficacy claim |

## Remaining unknowns that do not block writing

- The first exact playback-delivery production incident.
- A measured count of scenario regressions, runtime, or monetary cost.
- One canonical giant-prompt failure trace.
- Measured caller preference for background ambience.
- Exact production scale and customer volume.

These should remain absent or qualified. None is necessary for the recommended outline.
