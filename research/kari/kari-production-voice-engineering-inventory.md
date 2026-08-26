# Kari production voice engineering inventory

Repository pass updated 2026-08-26 at commit `fd9539b9`.

This is working research material, not article prose. It consolidates the original 18 mechanisms, the timing/reliability follow-up pass, and the dedicated prompt/instruction and multilingual pass. It deliberately distinguishes code evidence from production motivation that still needs Andreas's confirmation.

Publication labels:

- **PUBLIC** — safe to explain with ordinary implementation detail.
- **PUBLIC-HIGH-LEVEL** — useful architecture, but omit exact sensitive rules, identifiers, customer configuration, or operational thresholds unless reviewed.
- **HOLD** — potentially strong, but the production story or publication boundary needs an interview answer.
- **PRIVATE** — do not publish. No private prompt bodies, secrets, patient data, or customer-specific configuration are reproduced here.

## Consolidated engineering inventory

### 1. Explicit conversation modes replace one giant prompt

- **What it does:** Represents the call as one of a bounded set of modes: discovery, action clarification, booking, identity capture, appointment change/cancellation, and ending. Each mode has its own instructions and tools.
- **Where:** `src/kari/agent/modes.clj`, `src/kari/agent/realtime2/modes.clj`, `resources/modes/`, `resources/realtime2/modes/`, `src/kari/websockets.clj`.
- **Why it exists:** The repository says modes reduce context and improve focus. Andreas confirmed that a large prompt plus many tools caused instruction interference, wrong speech behavior, wrong tool selection, and made changes hard to reason about. Identity-number capture appears to have been the forcing function.
- **Evidence status:** Code and interview-confirmed. Git commit `ce876c79` (2025-11-28, `modus!`) split a large prompt into a base prompt plus mode resources and added extensive tests.
- **Article value:** Very high. This is a central transition from “conversation prompt” to application state machine.
- **Publication:** **PUBLIC**.

### 2. Mode transitions are application state, not merely conversational suggestions

- **What it does:** Transition tools and deterministic handlers change `:current-mode`, rebuild the session, preserve or clear subflow state, and sometimes inject a bridge message telling the model what has just changed. Automatic transitions also occur after validated identity or completed actions.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/subflow.clj`, `src/kari/agent/modes.clj`.
- **Why it exists:** A prompt cannot reliably guarantee that the model has entered, left, or pivoted between appointment workflows. Explicit state also supports changing from move to cancel without re-collecting already validated data.
- **Evidence status:** Code-clear. The real-call incidents behind individual transition fixes need confirmation.
- **Article value:** High, especially as the concrete meaning of “bounded behavior.”
- **Publication:** **PUBLIC**.

### 3. Mode-scoped tool allowlists reduce both ambiguity and authority

- **What it does:** The application calculates available tools from the current mode, account capabilities, subscription, booking configuration, and feature flags. Ending mode requires an ending tool; identity modes expose only the relevant validation path; unavailable capabilities disappear.
- **Where:** `src/kari/agent/modes.clj`, `src/kari/agent/realtime2/modes.clj`, `src/kari/agent/tools.clj`, `src/kari/agent/realtime2/tools.clj`.
- **Why it exists:** Tool descriptions alone did not make a large set of possible actions safe or easy for the model to choose among. Removing irrelevant actions reduces instruction and choice overload and prevents entire classes of calls.
- **Evidence status:** Code-clear; motivation corroborated by Andreas's account of the pre-mode system.
- **Article value:** Very high. A clean example of limiting probabilistic authority through ordinary application design.
- **Publication:** **PUBLIC**.

### 4. Booking facts live in deterministic validated state

- **What it does:** Holds collected name, phone, identity, appointment time, practitioner, service, location, price, validation status, offered slots, and confirmation status outside the model. Field validators return structured success/failure and missing-field data.
- **Where:** `src/kari/booking.clj`, `src/kari/core/voice/booking_validation.clj`, `src/kari/websockets.clj`, tests in `test/kari/booking_test.clj` and `test/kari/core/voice/booking_validation_test.clj`.
- **Why it exists:** Conversation context is not a reliable database. Operational actions must use validated fields and canonical IDs rather than whatever the model recalls or paraphrases.
- **Evidence status:** Code-clear; commit `08f789e5` (2025-10-27) explicitly added persisted validated booking state for downstream use.
- **Article value:** Very high.
- **Publication:** **PUBLIC-HIGH-LEVEL**; use synthetic examples only.

### 5. A fresh confirmation is a stateful protocol, not the word “yes” in context

- **What it does:** Arms a confirmation guard when a complete summary is presented, counts assistant and caller turns, invalidates confirmation after intervening questions/corrections, and refuses submission until a new summary is followed by a fresh clean confirmation.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/booking_confirmation.clj`, `src/kari/agent/instructions.clj`, `dev/scenarios/realtime/production_booking_confirmation_follow_up_question_real_guard.edn`.
- **Why it exists:** Andreas confirmed that a model instructed to “get confirmation” can search its own context, find an earlier yes, and treat it as current consent. Prompt wording was supplemented by a programmatic turn/round guard.
- **Evidence status:** Code and interview-confirmed. Commits around 2026-03-23/24 (`bc687f6a`, `65acf7a4`) show the migration.
- **Article value:** Exceptional. It is a compact example of an apparently conversational requirement becoming a transactional invariant.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 6. National identity capture is a multi-path sidecar architecture

- **What it does:** Keeps sensitive digit capture outside the ordinary conversational path when possible. DTMF is primary. Spoken input can be recognized by the main realtime model's validation tool and by an independent transcription sidecar; accepted values update deterministic booking state and can trigger the next lookup.
- **Where:** `src/kari/websockets.clj`, `src/kari/fnr_speech_transcription.clj`, `src/kari/realtime/transcription.clj`, `src/kari/core/voice/dtmf.clj`, FNR mode resources.
- **Why it exists:** Identity numbers are unusually hostile to speech models: digit grouping, pauses, number words, corrections, and transcription errors all matter. Andreas confirmed that the two speech paths are fallbacks and work better together than either alone.
- **Evidence status:** Code and interview-confirmed.
- **Article value:** Very high. The safe story is architectural redundancy and moving structured input to a more appropriate channel.
- **Publication:** **PUBLIC-HIGH-LEVEL**. Do not publish validation internals, live identifiers, logs, or sensitive prompt bodies.

### 7. DTMF became the primary identity input through an accidental discovery

- **What it does:** Collects exactly the expected digit count, suppresses model responses while typing is active, validates complete candidates, delays invalid feedback briefly to avoid racing ongoing input, resets capture/nudge state on progress, and masks digits in logs.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/dtmf.clj`, `test/kari/websockets_dtmf_test.clj`.
- **Why it exists:** Andreas accidentally pressed keys, noticed unusual events in logs, and realized phone keypad events provided a more reliable structured channel than speech.
- **Evidence status:** Code and interview-confirmed. The discovery story is not in git, so attribute it explicitly as recollection.
- **Article value:** Exceptional human/engineering story: production capability discovered by observing the underlying transport.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 8. Machine values have separate display and speech projections

- **What it does:** Retains canonical timestamps, phone numbers, and numeric prices while adding fields such as readable appointment time, digit-by-digit phone, display price, and Norwegian number-word price. Times avoid raw `13:00`-style strings and disambiguate natural 12-hour expressions.
- **Where:** `src/kari/util.clj`, `src/kari/booking.clj`, `src/kari/websockets.clj`, tool instruction resources.
- **Why it exists:** Raw machine-readable data invites bad prosody, “nine zero zero,” ambiguous half-hour expressions, hallucinated digits, or lost currency semantics. The code explicitly says these fields reduce readback hallucination.
- **Evidence status:** Code-clear. Commit `65acf7a4` fixed spoken slot prices; `9694c75e` made Realtime 2 respect formatted readback fields. Actual caller examples should be collected before using vivid anecdotes.
- **Article value:** Very high.
- **Publication:** **PUBLIC**.

### 9. Selection and identifier integrity are enforced around model choices

- **What it does:** Keeps human names separate from practitioner/service/appointment IDs, validates that a selected slot was actually offered and is still eligible, carries the original appointment scope into rescheduling, and refuses to invent or accept missing IDs in unsafe paths.
- **Where:** `src/kari/booking.clj`, `src/kari/booking/ids.clj`, `src/kari/appointments/change.clj`, `src/kari/core/voice/appointment_change.clj`, tool definitions and scenarios.
- **Why it exists:** A natural-sounding model can map an ambiguous name or short answer to the wrong backend entity. IDs must come from authoritative tool results, not linguistic inference.
- **Evidence status:** Code-clear; history contains repeated practitioner/service/appointment routing fixes. Specific production incidents need confirmation.
- **Article value:** High.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 10. Availability is filtered by deterministic temporal rules before presentation

- **What it does:** Filters stale or too-near slots using an application cutoff, constrains rescheduling to valid service/practitioner scope, detects complete versus partial day results, and returns explicit “no slots”/urgent fallback outcomes.
- **Where:** `src/kari/booking.clj`, `src/kari/core/voice/booking_slots.clj`, `src/kari/appointments/change.clj`.
- **Why it exists:** The model should not decide whether a past/too-close slot is operationally bookable or whether a replacement changes the nature of an appointment.
- **Evidence status:** Code-clear. Exact business cutoffs and customer-specific policies should not be generalized.
- **Article value:** High as a prompt-vs-code boundary example.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 11. Playback acknowledgements define when speech was actually delivered

- **What it does:** Uses Twilio media marks/playback drain rather than model generation completion to know that a greeting, confirmation, ending question, or farewell reached the caller. Timers are anchored to audible delivery.
- **Where:** `src/kari/websockets.clj`, tests covering marks, greeting, confirmation delivery, and goodbye behavior.
- **Why it exists:** Generated audio is not the same as heard audio. Starting a timer or committing an action at generation time creates races with buffered playback and interruptions.
- **Evidence status:** Code-clear; several commit titles explicitly mention confirmation delivery and playback-safe endings.
- **Article value:** Exceptional. This is voice-specific and easy for text-agent engineers to overlook.
- **Publication:** **PUBLIC**.

### 12. Barge-in requires coordinated cancellation, truncation, and suppression

- **What it does:** Cancels an active model response, clears queued Twilio audio, marks output as audibly interrupted, truncates the corresponding conversation item, and suppresses likely echo/false barge-in for a short protected window.
- **Where:** `src/kari/websockets.clj`, `src/kari/realtime/transcript.clj`, related tests.
- **Why it exists:** Without coordinated state, the caller hears stale audio, the model believes unheard words were delivered, or its own playback is mistaken for caller speech.
- **Evidence status:** Code-clear. Concrete caller incidents need interview confirmation.
- **Article value:** Very high.
- **Publication:** **PUBLIC**.

### 13. Silence is not one timeout; it is a mode- and intent-dependent state

- **What it does:** Starts silence timing only after outbound playback drains and applies different policies:
  - ordinary conversation: about 10 seconds, then a classifier-guided nudge;
  - explicit “hold on/wait”: remain quiet rather than nudging;
  - identity capture: about 20 seconds, up to three staged nudges, reset by digit progress;
  - post booking/change/cancel tool stall: about 10 seconds, at most once per tool;
  - ending question: about 15 seconds after the question was heard, then farewell and close;
  - partial DTMF remains “in progress” for about 5 seconds; invalid feedback waits about 1.2 seconds.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/language.clj`, silence scenarios including `production_conversation_silence_nudge.edn` and `production_conversation_silence_explicit_wait.edn`.
- **Why it exists:** Dead air, caller thinking time, explicit requests to wait, sensitive digit entry, and end-of-call silence have different meanings. One universal watchdog would interrupt callers or leave them stranded.
- **Evidence status:** Code-clear. The user specifically corrected the earlier inventory to emphasize per-mode timing and explicit-wait behavior.
- **Article value:** Exceptional.
- **Publication:** **PUBLIC**; exact thresholds can be framed as Kari's current tuning, not universal constants.

### 14. The opening greeting has its own protected response and watchdog

- **What it does:** Sends an exact response-scoped greeting instruction, protects the initial playback, detects a silent/missing opening, and retries once after roughly 10 seconds.
- **Where:** `src/kari/agent/prompts.clj`, `src/kari/websockets.clj`, greeting tests; commit `16e8cb4f`.
- **Why it exists:** Realtime session startup and automatic response triggering can fail even when the connection appears alive. The first utterance also needs stronger exactness than the general prompt provides.
- **Evidence status:** Code-clear; the exact observed provider failure should be confirmed.
- **Article value:** High.
- **Publication:** **PUBLIC**.

### 15. Long-running tools need audible progress, but response timing can race the tool

- **What it does:** Records tool start/end and preamble delivery, expects the model to speak a localized preamble in the same response as selected tool calls, and has infrastructure for delayed progress around 1.8 seconds with an upper bound around 10 seconds. In the synchronous callback path, delayed progress is deliberately disabled because it can arrive after the real tool result.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/tool_progress.clj`, `src/kari/core/voice/language.clj`, tool descriptions, `docs/PROD_CALL_DEBUGGING.md`.
- **Why it exists:** Andreas confirmed both dead air and late “one moment” messages. Realtime models are also unreliable at producing a requested preamble before a tool call.
- **Evidence status:** Code and interview-confirmed. Commit `9db83115` replaced delayed prompts in the main path with localized preambles after timing races.
- **Article value:** Exceptional because the “obvious” UX fix creates a new concurrency bug.
- **Publication:** **PUBLIC**.

### 16. Call ending is an isolated, playback-safe protocol

- **What it does:** Enters a dedicated ending mode, emits the ending question with no tools, waits for audible delivery and a caller response, distinguishes “new need” from thanks/no, requires a farewell before accepting termination, suppresses duplicate goodbyes, and closes only after playback.
- **Where:** `resources/modes/avslutning.txt`, `src/kari/core/voice/call_control.clj`, `src/kari/websockets.clj`, ending scenarios.
- **Why it exists:** Ending is not a single model intent. Premature tool calls can cut off speech; a local “no” can be mistaken for ending the whole call; new needs arrive after an apparent conclusion.
- **Evidence status:** Code-clear. History includes `bfd56509` (dedicated ending mode), `b244a6b0` (duplicate goodbye), and playback-safe ending commits.
- **Article value:** Very high.
- **Publication:** **PUBLIC**.

### 17. Scenario tests execute the production prompt/tool path against real realtime models

- **What it does:** Loads EDN scenarios, builds production account/call fixtures, insists on the production prompt type, opens a real model session, sends scripted caller turns, feeds tool outputs (stubbed or selected real tools), follows model-emitted tool chains, and evaluates assertions.
- **Where:** `dev/kari/realtime_scenarios.clj`, `dev/scenarios/realtime/*.edn`, `scripts/realtime-scenarios.sh`.
- **Why it exists:** Deterministic unit tests cannot reveal that the deployed model stopped following a prompt, called the wrong tool, mixed languages, or regressed after wording/model changes.
- **Evidence status:** Code-clear and interview-confirmed practice. They were previously part of deployment, but are now run during development of significant model-behavior features: add or adjust a scenario, select relevant existing scenarios, run them, and inspect regressions. Current deployment scripts explicitly do not run them automatically.
- **Article value:** Exceptional and central to the thesis.
- **Publication:** **PUBLIC**.

### 18. Scenario assertions and artifacts turn nondeterministic calls into inspectable evidence

- **What it does:** Assertions check tool calls/order/arguments, response text or exclusions, modes, and other events with configurable severity. Runs record transcript-like markdown, raw events, tool activity, timing, usage, and assertion results even on failure. Scenarios can pin/override model and prompt family for comparisons.
- **Where:** `dev/kari/realtime_scenarios.clj`, `test/kari/realtime_scenarios_test.clj`, scenario EDN files.
- **Why it exists:** Exact string snapshots are too brittle for generative behavior, while manual phone calls do not scale or produce comparable artifacts. Hard assertions catch machine-checkable failures, but Andreas or an agent also reads transcripts because many conversational quality regressions are not reasonably expressible as regular-expression checks.
- **Evidence status:** Code and interview-confirmed. Actual monetary cost and run duration were not quantified and are not necessary for the article.
- **Article value:** Very high.
- **Publication:** **PUBLIC**.

### 19. Realtime response creation has an admission controller and protocol recovery

- **What it does:** Allows only one active response, debounces repeated `response.create` events for roughly 800 ms, queues one pending request, retries after `response.done`, optimistically marks requests active to close the creation race, and repairs local state when the provider reports an already-active response. Unknown tool calls still receive a function output so the model session does not hang.
- **Where:** `src/kari/websockets.clj` (`request-response-create!` and event handlers).
- **Why it exists:** VAD, tool completion, nudges, DTMF, and mode transitions can all request responses concurrently. The provider protocol rejects overlapping responses and can otherwise strand a pending turn.
- **Evidence status:** Code-clear; individual incidents need confirmation.
- **Article value:** Very high.
- **Publication:** **PUBLIC**.

### 20. Startup provider failover uses attempt ownership to reject stale callbacks

- **What it does:** Tries configured realtime providers in sequence before the call is ready, tags attempts, and ignores callbacks from superseded attempts so a late open/error cannot take ownership of the live call.
- **Where:** `src/kari/websockets.clj`, provider configuration namespaces and tests.
- **Why it exists:** WebSocket establishment is asynchronous; failover creates stale-event races unless connection ownership is explicit.
- **Evidence status:** Code-clear. Negative finding: there is no general mid-call reconnect with replay of conversation/application state.
- **Article value:** High, with the honest limitation included.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 21. Idempotency is workflow-specific, not a universal exactly-once layer

- **What it does:** Suppresses duplicate appointment lookup while a matching lookup is in flight or already succeeded, ignores stale conflicting identity calls after a sidecar value is accepted, limits SMS sends per call, rejects repeat transfer/end actions, and recognizes already-cancelled appointments.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/sms_tool.clj`, appointment and call-control code.
- **Why it exists:** Models may repeat tools, race sidecars, or emit multiple actions in one response. Network retries and caller repetition compound this.
- **Evidence status:** Code-clear. The repository does not contain one universal exactly-once abstraction; guards are attached to the business operation that needs them.
- **Article value:** Very high.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 22. Appointment mutations distinguish retryable, terminal, and partial outcomes

- **What it does:** Retries transient upstream/transport failures with bounded backoff but not unavailable slots or ordinary validation errors. Where direct patching is unavailable, rescheduling can create a replacement first and then cancel the original. Failure to create leaves the old appointment intact; failure to cancel after creation is explicit partial success requiring follow-up.
- **Where:** `src/kari/appointments/change.clj`, `src/kari/core/voice/appointment_change.clj`, agent result instructions and tests.
- **Why it exists:** “Move appointment” is not atomic when implemented across multiple remote operations. The caller must not hear success when the real system is in a two-appointment state.
- **Evidence status:** Code-clear. Production motivation for the fallback mechanics should be confirmed before narrating a customer incident.
- **Article value:** Exceptional.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 23. Human call transfer is gated and recoverable

- **What it does:** Checks plan/configuration, target validity, and schedule; gives spoken audio a short grace period; retries a specific transient telephony response with bounded delays; and closes the local leg only when the transfer was accepted. Otherwise it returns a continuation policy to take a message or arrange follow-up.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/call_control.clj`, transfer scenarios.
- **Why it exists:** “Transfer the call” spans model intent, account policy, office availability, telephony state, and audible handoff UX.
- **Evidence status:** Code-clear. Do not publish numbers, customer schedules, or provider-sensitive operational details.
- **Article value:** High.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 24. Post-call human follow-up is a deterministic safety net around an LLM summary

- **What it does:** Uses a structured summary model, then overrides/augments its decision with verified operational facts: confirmed bookings, partial mutation failures, duration-limit termination, and evidence that no meaningful caller input was heard.
- **Where:** `resources/call_summary_prompt.txt`, call summary/follow-up code, schema follow-up fields, tests.
- **Why it exists:** A fluent summary can miss an unresolved real-world obligation. Confirmed actions and technical termination facts are stronger evidence than transcript inference.
- **Evidence status:** Code-clear; exact operational follow-up process is sensitive.
- **Article value:** Very high.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 25. Transcript reconciliation is based on what was audible, not one provider's text

- **What it does:** Uses independently transcribed physical stereo audio to attribute caller/assistant speech. Exact realtime assistant text is accepted only for complete, non-audibly-interrupted output; interrupted or partial assistant audio is transcribed from the recording. Small timing overlap is tolerated and only verified segments are included.
- **Where:** realtime transcript/recording reconciliation code, Assembly transcription integration, production debugging documentation.
- **Why it exists:** Model text can contain words generated but never heard after barge-in; a single mixed transcript can misattribute overlapping speakers.
- **Evidence status:** Code-clear. Negative finding: this is chiefly post-call reconciliation, not a mid-call consensus system.
- **Article value:** Very high.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 26. Norwegian and English have first-class, explicit conversation-language support

- **What it does:** Provides first-class Norwegian and English behavior, stores a validated BCP-47 tag, keeps it until a language-change tool succeeds, distinguishes explicit requests from high-confidence detection, requires confirmation before switching automatically to languages beyond Norwegian/English, optionally restricts accounts to Norwegian/English, and adjusts output speed for English. Additional languages are architecturally prepared but currently use best-effort model translation rather than the same complete localized path.
- **Where:** `src/kari/core/voice/language.clj`, language tool definitions, `src/kari/websockets.clj`, multilingual scenarios.
- **Why it exists:** Letting the model infer language afresh on every turn causes switching on accents, isolated foreign words, noise, or Norwegian prompt/tool text. Sticky state makes the decision observable and testable.
- **Evidence status:** Code-clear. History shows a progression from prompt language rules to explicit state/tool control in `467db7cf`, `fbd68a31`, and `20c05c68`.
- **Article value:** Exceptional.
- **Publication:** **PUBLIC**.

### 27. Deployment drains active calls and protects post-call work

- **What it does:** Marks readiness unavailable, pauses background job claims, waits for active calls and tracked post-call handoffs up to a bounded limit, and protects recording mix/transcription/summary work during shutdown.
- **Where:** shutdown/deployment code and scripts; `scripts/deploy-lib.sh`; job queue and recording handoff code.
- **Why it exists:** A deploy that cleanly restarts the web process can still cut off callers or lose the operational record immediately after hangup.
- **Evidence status:** Code and commit-history clear.
- **Article value:** High. It broadens “production voice” beyond the realtime loop.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 28. Observability is correlated by call and shaped for incident reconstruction

- **What it does:** Stores sanitized tool arguments/results, function-call IDs, durations, mode transitions, DTMF/model usage, close/error data, audio/playback facts, and a tool timeline. Upstream errors include sanitized structured request/response context. Debugging guidance correlates sources by call SID.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/log_event.clj`, admin logs, `docs/PROD_CALL_DEBUGGING.md`.
- **Why it exists:** Voice failures are distributed across telephony, two or more model streams, application state, tools, audio buffers, and remote booking APIs. A transcript alone cannot explain them.
- **Evidence status:** Code-clear. Commit history repeatedly adds logging around booking, provider limits, audio, and tool progress.
- **Article value:** Very high.
- **Publication:** **PUBLIC-HIGH-LEVEL**; never include live identifiers or payloads.

### 29. Context, cost, latency, and model reasoning are explicit controls

- **What it does:** Warns on large instruction sets, configures realtime context retention/truncation, accumulates model usage, supports account/model-specific reasoning effort, and lets scenario runs compare prompt/model configurations. Previous-call context is bounded and sensitive data is stripped.
- **Where:** `src/kari/websockets.clj`, `src/kari/agent/prompts.clj`, realtime model/settings code, scenario runner.
- **Why it exists:** Prompt size affects cost, latency, attention, and reliability; model upgrades and reasoning settings are operational changes rather than transparent substitutions.
- **Evidence status:** Code-clear. Exact business cost figures and run cadence need interview answers.
- **Article value:** High.
- **Publication:** **PUBLIC** for mechanisms; **HOLD** for actual cost/volume claims.

### 30. NEW: Runtime instructions are compiled from account, capability, state, and mode

- **What it does:** Builds a session prompt from a base resource plus runtime data: current Oslo time, caller context, sanitized previous calls, business facts, account note-taking instructions, greeting, knowledge-base document metadata, booking locations, feature/capability flags, language policy, voice policy, and one mode resource. Tool availability is computed from the same state.
- **Where:** `src/kari/agent/prompts.clj`, `src/kari/agent/realtime2/prompts.clj`, `src/kari/agent/modes.clj`, `src/kari/websockets.clj`, base/mode resources.
- **When/lifetime:** Compiled at call initialization and on every mode session update. The resulting session instructions and tool list remain active until the next `session.update` replaces them.
- **Behavior/actions:** Both: instruction text changes behavior while capability calculation and mode selection change available actions. Operational values remain distinct template data before rendering, though the rendered result becomes instruction text.
- **Why it exists:** Kari is not one prompt. It is a prompt compiler whose output is a projection of current application state and authority. Customer variation is material: feature flags, account settings, and account instructions alter behavior. One implementation supports an account representing five underlying clinics, requiring an explicit subclinic or cross-clinic selection path before availability can be handled correctly. Other accounts vary in follow-up policy, cancellation rules, bookable appointment types, and which caller intents qualify for human callback.
- **Evidence status:** Code and interview-confirmed. Account-specific prompt bodies and healthcare rules must remain private; publish only the architectural categories and the already-approved multi-clinic example.
- **Article value:** Very high and previously under-represented.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 31. NEW: Instructions have three different lifetimes

- **What it does:** The architecture has distinct scopes:
  1. **Session-scoped:** base + account + mode + language + voice + available tools; replaced on mode/language updates.
  2. **Response-scoped:** `response.create` overlays with tools disabled/forced and a narrow instruction for exactly one response, used for opening greeting, language acknowledgement, silence decisions, progress, ending question, terminal confirmation, duration warning, and farewell recovery.
  3. **Conversation-carried:** synthetic system/user items and tool outputs stay in conversation context; selected trigger items are explicitly deleted when stale.
- **Where:** `src/kari/websockets.clj`, `src/kari/core/voice/language.clj`, provider adapters.
- **When/lifetime:** Session scope persists to replacement; response scope is one generation; conversation items persist until deletion or context truncation.
- **Why it exists:** Not every rule belongs in the permanent prompt. Exact one-off speech and transition bridges need stronger, shorter instructions without permanently polluting every later turn.
- **Evidence status:** Code-clear. This lifetime taxonomy is an inference from API payload construction, not a term used by the codebase.
- **Article value:** Exceptional prompt-architecture material.
- **Publication:** **PUBLIC**.

### 32. NEW: Tool results carry outcome-conditioned continuation policy

- **What it does:** Tool output contains ordinary result data plus a separate `_instruksjoner`/`_instructions` field telling the model what the just-resolved outcome means for the next conversational step. Examples include: present a few returned slots; ask for the next missing validated field; disambiguate multiple appointments; do not retry an unavailable slot; explain partial rescheduling truthfully; return to an interrupted booking after answering a document question; ask for language confirmation; or stop repeating an SMS/action.
- **Where:** `src/kari/agent/instructions.clj`, `src/kari/agent/realtime2/instructions.clj`, `src/kari/core/voice/{language,subflow,sms_tool,booking_slots,booking_validation,appointment_change,call_control}.clj`, `src/kari/websockets.clj`.
- **When/lifetime:** Added only after the operation has resolved and derived from its structured result/application state. Semantically it is intended to guide the immediate continuation. Physically it is part of the function-call output and therefore remains in model context until deletion/truncation; it is not automatically ephemeral.
- **Behavior/actions:** Usually controls the next speech and which action should or should not follow. Deterministic code still decides whether the operation succeeded and what actions are legal.
- **Why an operation may modify instructions:** Before the operation returns, the correct next policy is unknowable. Returning local continuation policy beside the facts reveals only the relevant branch at the moment it becomes true, instead of loading every success/failure/retry/escalation branch into every mode. This is progressive disclosure, not permission for the backend to rewrite arbitrary global policy.
- **Operational-data boundary:** The code generally keeps facts (`success`, appointments, fields, error codes) separate from the underscored instruction field, even though both travel in the same JSON tool output.
- **Evidence status:** Code and history-clear. Commit `ba63d608` (2025-11-27) introduced an instruction namespace explicitly described as “progressive disclosure.”
- **Article value:** Exceptional and likely one of the strongest new mechanisms.
- **Publication:** **PUBLIC-HIGH-LEVEL**. Describe representative categories, not full healthcare/customer rules.

### 33. NEW: Model families have deliberately separate prompt implementations

- **What it does:** Realtime 1.5 and Realtime 2 use parallel base prompts, modes, tool descriptions, and result-instruction namespaces. Realtime 2 also has resource-backed tool-result fragments and account-overridable dialect guidance. Other provider adapters reuse the core prompt/mode state and append provider-specific system guidance or tool-safety rules.
- **Where:** `src/kari/agent/realtime2/`, `resources/realtime2/`, `src/kari/gemini/live/protocol.clj`, `src/kari/voice/account.clj`, `src/kari/voice/llm/responses.clj`.
- **When/lifetime:** A prompt family is selected for the call/provider; its compiled session prompt persists by mode as above. Provider-specific response safety can be appended per request.
- **Why it exists:** A prompt that works for one realtime model is not assumed safe for another. Commit `66051b84` intentionally created a separate Realtime 2 path so it could evolve without destabilizing the production 1.5 path.
- **Evidence status:** Code and history-clear. Whether maintaining copies has caused drift or excessive cost needs interview confirmation.
- **Article value:** High, especially as an honest tradeoff rather than a universal recommendation.
- **Publication:** **PUBLIC**; account dialect overrides are **PRIVATE** in their actual contents.

### 34. NEW: Prompt assembly contracts and realtime scenarios protect different failure layers

- **What it does:** Deterministic prompt tests assert inclusion, exclusion, non-duplication, capability pruning, language restrictions, and separation between model families. Realtime scenarios then test whether actual deployed models follow those assembled instructions and tool boundaries across multi-turn situations.
- **Where:** `test/kari/agent/prompts_test.clj`, `test/kari/agent/modes_test.clj`, `test/kari/agent/realtime2_prompts_test.clj`, `test/kari/agent/instructions_test.clj`, `dev/kari/realtime_scenarios.clj`.
- **Why it exists:** A unit test can prove that an instruction is present exactly once and an unavailable tool is absent; only a real-model scenario can show whether the model obeys it. Commit `f8f362ba` added prompt-assembly regressions immediately after the model-specific fork.
- **Evidence status:** Code-clear.
- **Article value:** Very high. It sharpens the explanation of why ordinary tests remain necessary but insufficient.
- **Publication:** **PUBLIC**.

### 35. NEW: The transcription sidecar has its own prompt—and a workaround for prompt echo

- **What it does:** Configures a separate realtime transcription session with Norwegian digit-focused guidance, fixed audio/VAD parameters, and provider-specific payload differences. Final transcripts strip known fragments when the transcription model echoes its own guidance instead of caller speech.
- **Where:** `src/kari/realtime/transcription.clj`, transcription event tests.
- **When/lifetime:** The guidance is session-scoped to the sidecar, not part of the conversational agent prompt. Echo cleanup happens deterministically on each finalized segment before it can influence identity capture or stored transcripts.
- **Why it exists:** Conditioning speech recognition toward digits improves the sensitive-input fallback, but the conditioning text itself can leak into output. The workaround makes a model/provider quirk an explicit application boundary.
- **Evidence status:** Code-clear. The frequency and production impact of the echo behavior need interview confirmation.
- **Article value:** High if there is a concrete incident; otherwise a concise supporting example.
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 36. NEW: Call-quality classification is an independent post-call shadow model bounded by facts

- **What it does:** Separately classifies whether Kari resolved a call, handled an unresolvable request correctly, needs improvement, or lacks enough evidence. Before invoking the classifier, deterministic code can decide terminal/insufficient-evidence cases and supplies authoritative booking/action facts that outrank transcript claims. The shadow result does not drive caller-facing follow-up or rewrite the summary.
- **Where:** `resources/call_handling_prompt.txt`, `src/kari/core/call_handling.clj`, `src/kari/sh/call_handling.clj`, `src/kari/job_queue.clj`, admin reporting and tests.
- **When/lifetime:** Runs asynchronously after a completed call when its feature is enabled. Its prompt applies to one structured classification request and its versioned result is stored for internal review/aggregation.
- **Why it exists:** A conversationally smooth transcript is not proof that the requested operation happened or that the whole need was handled well. Keeping this as an independent shadow measurement avoids allowing one LLM-generated summary to grade itself.
- **Evidence status:** Code-clear. Whether and how this metric has exposed real regressions needs interview confirmation.
- **Article value:** High as supporting evidence for “test the outcome, not just the conversation.”
- **Publication:** **PUBLIC-HIGH-LEVEL**.

### 37. NEW: An optional ambient audio bed is part of realtime turn-taking, not just decoration

- **What it does:** Mixes very low-volume, non-intelligible office-like room tone into outbound assistant audio and emits bed-only 20 ms frames during otherwise idle periods. It can use a packaged PCMU loop or a deterministic synthetic fallback and is controlled per account.
- **Where:** `src/kari/realtime/audio_bed.clj`, `src/kari/websockets.clj`, `resources/schema.edn`, account settings and `test/kari/realtime/audio_bed_test.clj`.
- **Timing/safeguards:** It starts only after the startup cue is cleared, does not fill over buffered assistant output, stops during call ending, and pauses briefly after barge-in so ambient frames do not interfere with interruption handling. Gain is deliberately low and bounded.
- **Why it exists:** The product setting describes it as making the call feel more natural. The implementation also reveals a non-obvious consequence: once synthetic ambience enters a telephone audio path, it must participate in playback timing, barge-in suppression, startup ordering, mixing, and transcript cleanup.
- **Failure evidence:** The feature was first added, moved behind an account setting, then fixed to start after the startup cue and later made quieter. Post-call transcript cleanup explicitly notes that background noise can cause invented words or repeated caption-credit hallucinations.
- **Evidence status:** Code/history-clear. Whether callers preferred it or which exact UX experiment motivated it needs confirmation; do not claim measured naturalness.
- **Article value:** Medium as a memorable supporting detail. It should not displace the central state/tools/testing narrative.
- **Publication:** **PUBLIC**.

## Complete prompt/instruction source map

This map separates live caller-facing instructions from other model prompts in the repository.

| Source | Constructed from | Scope and lifetime | Purpose / boundary |
|---|---|---|---|
| Realtime 1.5 base prompt | `resources/kari_base_prompt.txt` rendered by `src/kari/agent/prompts.clj` | Session-scoped; rebuilt at initialization and mode updates | General voice behavior plus runtime account/caller/capability context. |
| Realtime 1.5 mode prompt | `resources/modes/*.txt` selected/rendered by `src/kari/agent/modes.clj` | Session-scoped until the next mode update | Current workflow only; paired with a mode-specific tool set. |
| Realtime 2 base/modes | `resources/realtime2/kari_base_prompt.txt`, `resources/realtime2/modes/*.txt`, Realtime 2 prompt/mode namespaces | Same session scope, selected by model-family feature | Independent model-family behavior, not a conditional paragraph inside the 1.5 prompt. |
| Realtime 2 dialect | Default dialect resource or account override via `src/kari/agent/realtime2/dialect.clj` | Session-scoped for Realtime 2 | Pronunciation/style control; actual account override contents are private. |
| Account/runtime template data | Business facts, caller context, sanitized prior calls, note-taking instructions, documents, capability/feature flags | Rendered into each session prompt rebuild | Personalizes facts and prunes instructions/actions. Operational source data is structured before rendering. |
| Tool descriptions | `src/kari/agent/tools.clj` and Realtime 2 counterpart | Session-scoped with the current mode's available tools | Argument contract, call conditions, preamble rules, and reminder to follow result instructions. |
| Tool-result continuation instructions | Instruction namespaces and pure voice-domain result builders | Conversation-carried function output; intended for the immediate continuation | Reveals outcome-specific next policy beside, but separate from, result facts. |
| Response overlays | `response.create` options from `src/kari/websockets.clj` and localized builders | One response | Exact greeting, progress, language acknowledgement, ending, duration, silence/recovery, or tool-disabled response. |
| Synthetic transition/recovery messages | System/user conversation items built in `src/kari/websockets.clj`; provider equivalents | Persist in conversation until deletion/truncation | Bridges state transitions, sidecar results, and caller “new need” recovery into model context. Some trigger items are deleted when stale. |
| Language/voice overlays | `src/kari/core/voice/language.clj`, voice stability and FNR additions | Rebuilt into session by language/mode; some messages response-scoped | Sticky language, localized control speech, speed, voice stability, and sensitive-mode guidance. |
| Legacy single prompt | `resources/kari_system_prompt.txt` via `create-system-prompt` | Legacy/chat/backward-compatible path | Evidence of earlier architecture; not the preferred live mode-based path. |
| Provider adapter additions | Gemini setup/mode messages; owned-pipeline account prompt; Responses API tool-safety addition | Provider session, mode message, or individual Responses request | Adapts shared domain prompt/state to provider protocol quirks and safety constraints. |
| Realtime transcription prompt | Internal guidance in `src/kari/realtime/transcription.clj` | Sidecar transcription session | Biases digit transcription; never intended as caller-facing agent policy. |
| Post-call summary prompt | `resources/call_summary_prompt.txt` via `src/kari/llm.clj` | One post-call structured request | Creates summary/follow-up proposal; deterministic facts can override it downstream. |
| Post-call handling shadow prompt | `resources/call_handling_prompt.txt` via call-handling shell/job | One independent post-call structured request | Grades handling separately from summary/follow-up, using authoritative facts. |
| Other non-voice prompts | Website extraction and document-description resources | One background request | Repository model usage, but not part of the voice agent's instruction architecture and not article inventory mechanisms. |

## Prompt architecture over time

The history supports a real evolution rather than a retrospective architecture story:

| Date | Evidence | Architectural move | Confidence |
|---|---|---|---|
| 2025-05-30 | `ed4404c5`, `6a2e77bf` | System prompt introduced and moved to a resource file. | Commit-clear. |
| 2025-10 to 2025-11 | Booking/tool commits and expanding prompt history | Live operations add validation, tool output, identity, formatting, and logging pressure. | Code/history-clear; incident narrative needs interview. |
| 2025-11-27 | `ba63d608` | Dedicated instruction namespace for “progressive disclosure”: result-specific next-step policy leaves the global prompt. | Commit-clear. |
| 2025-11-28 | `ce876c79` | Base prompt plus explicit modes, mode resources, mode tools, session updates, and a large new test surface replace/supplement the single-prompt approach. | Commit and interview-confirmed. |
| 2026-03-23/24 | `bc687f6a`, `65acf7a4` | Clean/fresh confirmation moves from wording alone to programmatic turn state; speech-safe price fields are added. | Code and interview-confirmed. |
| 2026-05-08 | `66051b84`, `f8f362ba` | Realtime 2 gets an independent prompt family and prompt-assembly regression tests. | Commit-clear. |
| 2026-07-06 onward | `6aae259e` and later fixes | Instruction priority, account rules, multilingual continuity, and model-family behavior continue to be tuned and tested. | Commit-clear; production triggers need interview. |
| 2026-08-19 to 2026-08-23 | `fbd68a31`, `467db7cf`, `20c05c68` | Language behavior becomes sticky validated application state, with explicit confirmation for third-language auto-detection and localized control messages. | Commit-clear. |

## Prompt regressions and prompt-to-code transitions worth investigating

These are evidence-backed candidates, but commit titles/diffs do not by themselves prove the exact caller incident.

1. **A previous yes was reused as current booking confirmation.** Prompt instructions became a programmatic confirmation round/turn guard plus a real-model scenario. This is already interview-confirmed and is the strongest prompt-to-code transition.
2. **A model promised appointment SMS that the operation did not guarantee.** Commit `88e61d1d` removes the promise from the legacy prompt and both model-family outcome instructions, then updates prompt tests and scenarios. Ask whether this followed real callers receiving no SMS or was caught before production.
3. **Language rules present in the prompt were not enough to keep language sticky.** `9d63298d` added scenarios for ambiguous greetings, English/Ukrainian switching, mid-flow language questions, and “restart” semantics; later commits added explicit state and a language-change tool. Ask what users actually experienced—mixed-language booking data, oscillation, or wrong auto-detection.
4. **Ending rules in a large base prompt were not isolated enough.** `2ab2ce4e` removes a substantial ending section from base prompts, relies on a dedicated ending mode, and adds scenarios. Ask which premature ending/duplicate goodbye/new-need failures drove it.
5. **Delayed “one moment” responses raced synchronous tool results.** `9db83115` prefers localized preambles and disables delayed progress in the main callback path. Andreas already confirmed dead air and late progress messages; collect one exact trace if available.
6. **Formatted fields still require instruction priority.** `65acf7a4`, `9694c75e`, and language prompt changes repeatedly direct models to use speech-safe price/time fields. Ask for actual misread price/time examples rather than inferring them.
7. **Caller-ID data was treated like caller-confirmed speech data.** Commit `4e4699c5` prevents reading a known caller-ID phone number aloud unless the caller just supplied/changed it. Ask whether this was privacy, UX, or a concrete wrong-readback incident.
8. **Model-specific prompt tuning created a need for isolated copies and parity tests.** History contains prompt tuning, reverts, parity work, and model snapshot rollback (`ab1e9eb8`). Ask which model/prompt change improved one workflow while regressing another.

## Multilingual boundary: what code owns versus what the model owns

### Deterministic/application-owned

- First-class Norwegian and English conversation support.
- Validation and canonicalization of the BCP-47 language tag.
- Sticky active-language state and the only legal mechanism for changing it.
- Confirmation requirement for automatically detected languages beyond Norwegian/English.
- Optional Norwegian/English account restriction.
- Localized exact control strings for Norwegian and English: language-change acknowledgement, tool progress/preambles, ending question, farewell, and selected recovery messages.
- Preparatory support for additional languages, including validated language tags and a smaller set of fixed strings in the provider-swappable pipeline.
- English output-speed adjustment.
- Machine-neutral operational fields and IDs used for actual booking/change/cancellation.
- Norwegian speech-safe projections for times, dates, phone digits, and prices.

### Model-owned, but instruction-constrained

- Translating the main Norwegian prompt's semantic examples into the active language.
- Best-effort responses in languages other than Norwegian and English, using model instructions to translate the conversation and presentation data.
- Translating Norwegian `formatert`, `pris_tale`, and similar speech projections into a non-Norwegian active language.
- Choosing natural phrasing, tone, and appropriate conversational acknowledgement.
- Detecting a likely language from a sufficiently clear utterance and proposing the language-change tool call.

### Important limitation

Norwegian and English are both properly supported conversation languages. The asymmetry is narrower: the code does **not** currently implement a general locale-aware speech formatter for appointment dates, times, prices, and phone numbers. Canonical ISO/numeric values coexist with Norwegian-specific speech-safe representations. English presentation is explicitly supported and instructed, but translation of those Norwegian-formatted fields is still performed by the model. Languages beyond Norwegian and English are prepared as best-effort paths and currently rely mainly on model instructions for translation. This is a pragmatic hybrid, not a fully deterministic locale-specific presentation layer for every supported or prepared language.

Dialect handling is also asymmetric: Realtime 2 has explicit Norwegian pronunciation/dialect guidance and an account-level override, while callers' dialects are primarily left to model comprehension. There is no repository evidence that operational parsing branches by Norwegian caller dialect.

## Prompt vs code boundary

The repository's recurring boundary is:

| Concern | Model freedom | Deterministic boundary |
|---|---|---|
| Natural conversation | Wording, acknowledgement, paraphrase, clarification | Active mode, allowed tools, application state |
| Caller intent | Interpret an utterance and propose a transition/tool | Transition handlers reject illegal or ambiguous moves |
| Language | Detect/propose; translate and speak naturally | Sticky validated language code, restrictions, explicit switch tool |
| Booking data | Ask for and conversationally confirm fields | Validation, canonical values/IDs, offered-slot checks, fresh-confirmation guard |
| Operation outcome | Explain facts naturally | Backend decides success/failure/partial state; result supplies continuation policy |
| Spoken structured data | Present naturally; for English and prepared additional languages, translate localized presentation fields | Canonical data plus Norwegian-specific speech-safe projections |
| Silence | Classify whether the caller asked to wait | Playback-anchored timers, mode-specific thresholds, capped nudges |
| Ending | Interpret thanks/new need and say farewell | Dedicated mode, delivery gates, termination tool checks |
| Retry/escalation | Explain and offer the allowed next step | Retryable status set, attempt caps, idempotency guards, follow-up flags |

The model is intentionally free where variation is useful and reversible. Code takes over where a wrong guess changes state, repeats an external action, violates a timing contract, misstates an operation, or turns old conversational evidence into current authorization.

## Negative findings and cautions

- No general mid-call WebSocket reconnect/replay mechanism was found. Startup failover is real; full session recovery after a live connection dies is not.
- No universal exactly-once tool executor was found. Idempotency is operation-specific.
- Norwegian and English are first-class conversation languages. Norwegian currently has more deterministic speech-formatting helpers; English translates those projections through explicit model instructions, while prepared additional languages use a broader best-effort model-translation path.
- `_instruksjoner` is semantically “for what happens next” but remains physically in conversation context. The repository selectively deletes some synthetic items, not every old tool instruction.
- Custom per-mode account instructions are marked TODO in the main prompt builder. Account note-taking/business instructions and Realtime 2 dialect overrides exist, but a general per-mode customer override is not currently wired there.
- The repository contains many healthcare-specific rules and customer/configuration data. Their existence supports the architectural argument, but their bodies should not be copied into an article.
- Commit history proves that fixes occurred, not that each was triggered by a production caller. Interview before attaching a real-call narrative.

## Highest-value interview targets from this pass

The repository pass is accepted. Ask these in small batches, prioritizing the concrete origin stories below before returning to the remaining repository-derived questions.

### Priority origin stories

1. **Modes:** What exact behavior made you conclude the giant-prompt model had fundamentally stopped scaling, rather than merely needing better wording?
2. **Confirmation:** Tell the exact story behind the reused “yes.” What did the model see in context, what did it do, and why could another prompt rule not solve it reliably?
3. **Playback:** What was the first bug where Kari behaved as though the caller had heard something they actually had not?
4. **Silence:** Which caller or model behavior caused the first silence nudge? Which later behavior showed that a universal silence timeout was wrong?
5. **Progress speech:** Reconstruct the timeline of the “one moment” concurrency failure from one actual call or trace.
6. **Scenario tests:** Name three to five regressions that scenario tests have actually caught. Which would deterministic application tests definitely have missed?
7. **Dynamic instructions:** What did `_instructions` replace? Was the alternative putting every outcome branch in every tool description or mode prompt? At what point did that become visibly unmanageable?
8. **Language:** What was the worst actual multilingual failure before language became sticky application state?
9. **Architecture/possible opening:** Looking at the system today, which parts would you never have believed were necessary when you built the first demo?

### Additional repository-derived questions

1. What real failure led to commit `88e61d1d` removing automatic SMS promises? Did a caller hear a confirmation the system could not guarantee?
2. Which exact prompt edit or model upgrade improved one workflow while breaking another? Is there a scenario test that now preserves that incident?
3. When the transcription sidecar echoed its digit-conditioning prompt, did that reach booking state, caller-visible speech, or only logs?
4. What real caller behavior caused the system to stop reading caller-ID phone numbers aloud?
5. Which misread time, date, price, or phone number best demonstrates why raw machine data was unsafe to speak?
6. Has maintaining separate Realtime 1.5 and Realtime 2 prompt families prevented regressions, or mostly created parity/drift work?
7. Are old `_instruksjoner` ever known to conflict with later tool results because they remain in context, or has mode replacement/context truncation been sufficient?

## Interview story inventory

This section records Andreas's recollections separately from what the repository proves. Rank is relative article interest for a strong software engineer and will change as the interview continues.

### Story A — A booking “yes” has a validity window

- **Rank:** 1 — strongest current story.
- **Problem:** A model can treat any semantically suitable confirmation in its conversation context as authorization for the current booking state.
- **Observed production failure:** This occurred several times. Kari sometimes performed a booking without a new confirmation after reading the final details when the caller then asked a question, corrected information, or replied “yes, but…”. In other cases, a yes to an earlier, unrelated question was reused and Kari proceeded with booking.
- **Naive/simple solution:** Tell the model in the prompt to obtain explicit final confirmation and not to act on qualified or stale answers.
- **Why insufficient:** The model can search its own context and reinterpret an older yes as satisfying the instruction. More wording does not give the application a reliable concept of which summary the caller confirmed or whether intervening dialogue invalidated it.
- **Engineering solution:** Programmatic confirmation state tracks presentation of the current summary, intervening turns/corrections, and whether a fresh clean confirmation occurred in the correct round. Submission is rejected when that invariant is not satisfied.
- **Remaining tradeoffs:** The model still interprets the caller's latest speech as clean confirmation, correction, question, or qualification; application state bounds when that interpretation can authorize the action.
- **Useful code/example:** Mechanism 5; `src/kari/websockets.clj`; `src/kari/core/voice/booking_confirmation.clj`; the real-guard confirmation scenario.
- **Possible lesson:** Conversational consent becomes an application protocol when it authorizes an irreversible external action.
- **Evidence/publication:** Interview-confirmed recurring behavior plus code/history. **PUBLIC-HIGH-LEVEL**.

### Story B — Silence has multiple causes, not one duration

- **Rank:** 2.
- **Problem:** Semantic VAD and model turn-taking can leave a live caller in indefinite silence even when a human would know a response is due.
- **Observed production failure:** Very short or quiet replies—especially a brief “yes”—can be missed, so semantic VAD never gives the agent a turn. The model sometimes ends its response without a question, causing the caller to wait because they do not know it is their turn. In other cases the model simply stops despite it clearly being the agent's turn and resumes only when the caller says “Hello?”.
- **Naive/simple solution:** Add one silence timeout that tells the model to speak.
- **Why insufficient:** Silence can mean missed speech, caller uncertainty, model stall, deliberate thinking, explicit “hold on,” digit entry, or the end of a call. A universal nudge would interrupt legitimate waiting and sensitive input or use the wrong recovery behavior.
- **Engineering solution:** Anchor timers to actual playback completion and use mode-specific timeouts and recovery policies, including a classifier distinction between an unanswered turn and an explicit request to wait.
- **Remaining tradeoffs:** A nudge cannot recover speech the system never captured; it reopens the turn and gives the caller another chance. Thresholds remain tuned heuristics.
- **Useful code/example:** Mechanism 13; ordinary-silence and explicit-wait scenarios; FNR and ending timers in `src/kari/websockets.clj`.
- **Possible lesson:** In realtime systems, “nothing happened” is an ambiguous event that needs state and context.
- **Evidence/publication:** Interview-confirmed failure categories plus code. **PUBLIC**.

### Story C — Prompt escalation stopped scaling

- **Rank:** 4 until paired with a concrete trace; still strong as reflective architecture history.
- **Problem:** The single prompt accumulated patches for interacting behaviors and tools.
- **Observed production failure:** Andreas recalls repeated frustration and reaching a point where prompt changes either failed to control the model or fixed one behavior while breaking another. The prompt accumulated increasingly emphatic rules such as “IMPORTANT!!!”. No single representative call is currently recalled.
- **Naive/simple solution:** Keep improving wording and add stronger priority markers for each failure.
- **Why insufficient:** More rules increased context and instruction conflicts while leaving every behavior and action simultaneously in scope.
- **Engineering solution:** Progressive tool-result instructions, explicit modes, mode-scoped tools, and deterministic application state/checks.
- **Remaining tradeoffs:** Prompts still matter and still regress; the architecture limits their scope rather than eliminating them.
- **Useful code/example:** Commits `ba63d608` and `ce876c79`; mechanisms 1–3 and 30–32. Historical prompt diffs can illustrate emphatic-rule accumulation without claiming a specific caller story.
- **Possible lesson:** Repeatedly increasing the volume of a rule is a signal that the missing abstraction may be state or authority, not wording.
- **Evidence/publication:** Interview recollection and repository history, but no exact incident. **PUBLIC** as reflection; do not invent a call narrative.

### Story D — Generated speech is not delivered speech

- **Rank:** 7 pending a concrete incident.
- **Problem:** Application/model state can advance when audio was generated even though the caller never heard it.
- **Observed production failure:** Andreas cannot currently recall the first exact incident; greeting, confirmation, and ending paths are all plausible, but none should be asserted as the originating production story.
- **Naive/simple solution:** Treat model response completion as completion of the conversational turn.
- **Why insufficient:** Telephony playback is buffered and interruptible.
- **Engineering solution:** Twilio playback marks/drain tracking, audible interruption state, and delivery-anchored timers/actions.
- **Remaining tradeoffs:** Multiple transport and playback signals must remain correlated; reconstructing the historical first incident may require logs or commit archaeology rather than memory.
- **Useful code/example:** Mechanisms 11, 12, 14, and 16; playback-safe ending and confirmation-delivery commits.
- **Possible lesson:** Realtime output has at least three states—generated, queued, and heard.
- **Evidence/publication:** Architecture is code-clear; origin story is unconfirmed. **HOLD** for production anecdote, **PUBLIC** for the mechanism.

### Story E — The progress message arrived after the progress

- **Rank:** 3.
- **Problem:** A slow tool creates dead air, but asynchronously generating filler speech competes with the real tool result for the same realtime response channel.
- **Observed production failure:** The expected race occurred in real calls: the caller could hear double preambles, and the late progress response introduced unnecessary delay before the proper result response.
- **Naive/simple solution:** Schedule “one moment” after a tool has been running for a short threshold.
- **Why insufficient:** The tool executes synchronously in the callback path while response creation is asynchronous and serialized. The tool can finish and trigger its result response while the previously scheduled filler is still pending. The late filler then consumes or delays the response slot despite no longer being true or useful.
- **Engineering solution:** Prefer a localized preamble emitted before/in the same model response as the tool call; retain progress timing/observability, but disable the delayed progress response in the synchronous main path where cancellation cannot reliably beat completion.
- **Remaining tradeoffs:** The model is not perfectly reliable at saying preambles. Speaking before every quick internal step would add latency and robotic repetition, so the policy is tool-specific.
- **Useful code/example:** Mechanism 15; commit `9db83115`; tool-progress lifecycle and response admission logic in `src/kari/websockets.clj`.
- **Possible lesson:** A latency mitigation is itself a concurrent participant in the realtime protocol and can become stale before it is delivered.
- **Evidence/publication:** Code/history plus interview-confirmed caller effect. **PUBLIC**.

### Story F — Progressive disclosure makes operation results carry the next local policy

- **Rank:** 4.
- **Problem:** Loading every success, no-result, clarification, retry, partial-failure, and escalation branch up front consumes context and makes unrelated instructions compete.
- **Observed engineering pressure:** Andreas had used progressive disclosure for a long time, originally developing the technique independently at his day job. For Kari, the result-instruction namespace predates modes by one day in the visible repository history and became a foundation for the later architecture.
- **Naive/simple solution:** Put all possible future behavior in the base prompt, mode prompt, or permanent tool descriptions.
- **Why insufficient:** Most branches are irrelevant until an operation resolves. Up-front inclusion costs tokens and model attention and increases the number of simultaneously active rules.
- **Engineering solution:** Return structured operation facts together with an underscored, outcome-specific instruction that tells the model how to continue now. Realtime 2 further divides large availability guidance into composable resource fragments.
- **Remaining tradeoffs:** The instruction remains physically in conversation context after its intended next step. Model-family copies can drift, and deterministic application guards are still required for irreversible actions.
- **Useful code/example:** Mechanism 32; commits `ba63d608` and `ce876c79`; `src/kari/agent/instructions.clj` and its Realtime 2 counterpart.
- **Possible lesson:** Give the model policy when the relevant state becomes true, rather than describing the entire future state space in advance.
- **Evidence/publication:** Code/history and interview-confirmed design intent. Avoid claiming the general technique was invented universally. **PUBLIC**.

### Story G — Multilingual ability conflicted with exact workflow language

- **Rank:** 5.
- **Problem:** The model was already good at accommodating other languages, but Kari also had detailed Norwegian instructions and mandatory phrases for particular workflow points.
- **Observed production failure:** In one remembered call, a caller asked to speak Ukrainian and Kari obliged, but Norwegian utterances were mixed into the later conversation. A representative conflict was the coexistence of “always speak the caller's language” with an exact Norwegian ending question.
- **Naive/simple solution:** Add a global prompt instruction to always use the caller's language while leaving exact Norwegian phrases elsewhere in the prompt/tool results.
- **Why insufficient:** Both instructions are locally plausible and can be treated as mandatory. The model may translate some free speech correctly while reproducing a higher-priority exact Norwegian phrase at a workflow boundary.
- **Engineering solution:** Make active language sticky application state, change it through an explicit tool, rebuild session instructions, provide localized Norwegian/English control strings, and treat other languages as prepared best-effort paths with explicit translation instructions.
- **Remaining tradeoffs:** Norwegian has more deterministic speech-formatting helpers. English is first-class but translates those fields through model instructions; additional languages rely more broadly on best-effort translation.
- **Useful code/example:** Mechanism 26; language core; Ukrainian and language-continuity scenarios; commits `9d63298d`, `fbd68a31`, and `467db7cf`.
- **Possible lesson:** Multilingual conversation is easy; keeping language consistent across deterministic workflow checkpoints is the engineering problem.
- **Evidence/publication:** Code/history plus one interview-confirmed Ukrainian call. **PUBLIC**.

### Story H — Real-model scenarios are a regression suite for the probabilistic layer

- **Rank:** 6 pending commit-to-scenario reconstruction.
- **Problem:** Deterministic tests can prove that prompt text, state transitions, and tool guards are assembled correctly, but not that the deployed model responds to them correctly.
- **Observed engineering experience:** Andreas estimates that realtime scenarios have caught problems tens or hundreds of times. They were especially valuable before the current mode architecture was fully developed, and remain useful afterward. He does not recall a reliable list of individual catches.
- **Naive/simple solution:** Unit/integration-test application code and manually phone the agent after risky prompt changes.
- **Why insufficient:** A prompt can contain the intended rule while the model ignores, misprioritizes, or generalizes it incorrectly. Manual calls do not scale across the growing behavior matrix.
- **Engineering solution:** Execute data-defined situations through production prompt/tool assembly against real deployed-model families, assert behavioral properties, and retain artifacts for comparison.
- **Remaining tradeoffs:** Runs cost money and wall-clock time, remain nondeterministic, and are not in deploy scripts. Concrete caught-regression examples should be reconstructed from commits that add a scenario alongside a behavioral fix rather than invented from memory.
- **Useful code/example:** Mechanisms 17, 18, and 34; `dev/scenarios/realtime/`; `dev/kari/realtime_scenarios.clj`.
- **Possible lesson:** Test deterministic code deterministically, and test the probabilistic component by actually exercising the probabilistic component.
- **Evidence/publication:** Scale/frequency is an approximate interview recollection; implementation is code-clear. Phrase as “tens or perhaps hundreds of times,” not a measured count. **PUBLIC**.

### Story I — The first demo already contained the product's essence

- **Rank:** Opening/closing frame rather than a technical section by itself.
- **Problem:** The gap between demo and production is easy to caricature as “the demo was fake.” That is not Kari's story.
- **Observed starting point:** The first convincing demo could take calls, answer questions, and take a message. That remains the essence of the product outside the later healthcare booking work.
- **Naive/simple system:** A realtime model, a useful prompt, telephony, question answering, and message capture were enough to demonstrate genuine value.
- **Why insufficient for production operations:** Booking introduced identity, authoritative availability, external mutations, confirmation, retries, partial failure, customer-specific behavior, and much larger conversational state. Robust realtime behavior added delivery, silence, interruption, and recovery protocols even around the original simple capabilities.
- **Engineering solution:** The current layered system described throughout the inventory; not one replacement architecture but accumulated boundaries around the original conversational core.
- **Remaining tradeoffs:** The original value proposition remains simple even though operational correctness is not. Avoid implying that every voice agent needs Kari's healthcare machinery.
- **Useful code/example:** The contrast between the early static-prompt history and today's modes, booking core, realtime orchestration, and scenario suite.
- **Possible lesson/opening:** “The demo worked” is precisely what makes the following year of engineering interesting.
- **Evidence/publication:** Interview-confirmed. **PUBLIC**.

### Story J — Human-selectable speech projections for Norwegian appointment times

- **Rank:** 5; concise but concrete.
- **Problem:** An ISO timestamp or ordinary display string does not specify how a Norwegian caller should naturally hear an appointment time. Even correct speech can use different conventions with different ambiguity/readability tradeoffs.
- **Observed engineering work:** Dates and times required repeated work to sound natural and match Norwegian speech. Andreas and Legelisten partners explicitly discussed natural phrasing such as “halv fem” versus explicit 24-hour speech such as “seksten tredve.”
- **Naive/simple solution:** Give the model the timestamp or formatted UI value and let it choose how to say it.
- **Why insufficient:** Raw punctuation and digits can be pronounced badly; natural 12-hour expressions can be ambiguous; stakeholders can reasonably prefer different conventions.
- **Engineering solution:** Deterministic Norwegian speech formatters for both natural and 24-hour styles, including relative dates and disambiguation, selected by an account setting and carried in separate speech-safe fields beside canonical values.
- **Remaining tradeoffs:** The account setting makes the presentation policy explicit but cannot prevent every model pronunciation error. English and prepared additional languages translate these projections through instructions rather than equivalent locale-specific formatter families.
- **Useful code/example:** Mechanism 8; `src/kari/util.clj`; `src/kari/booking.clj`; account time-format setting and tests.
- **Possible lesson:** Formatting for speech is product behavior, not serialization—and “natural” can itself be a configurable domain choice.
- **Evidence/publication:** Code plus interview-confirmed partner design discussion. **PUBLIC**; mentioning Legelisten is already authorized context.

### Story K — Real rooms are harder than clean caller turns

- **Rank:** 8 as a supporting realtime example.
- **Problem:** Callers use speakerphone, speak to other people in the room, and produce background speech/audio that is easy for a human listener to attribute but hard for the model to distinguish from speech directed at Kari.
- **Observed production behavior:** Andreas identifies speech directed at other people and speakerphone/background audio as one of the hardest caller behaviors, and it remains imperfect.
- **Naive/simple solution:** Treat every recognized utterance after VAD as the caller's next turn to the agent.
- **Why insufficient:** The audio channel does not encode addressee. Background conversation can trigger an answer, intent change, tool call, or spurious transcript despite being irrelevant to Kari.
- **Engineering solution:** Prompt guidance to distinguish addressed speech from room conversation, semantic/server VAD tuning, barge-in suppression, noise reduction, mode persistence through noise, transcript cleanup, and recovery when the caller corrects the agent.
- **Remaining tradeoffs:** This remains a model-level perceptual judgment and humans are still much better at it. There is no deterministic addressee classifier demonstrated in the repository.
- **Useful code/example:** Base prompts, FNR noise examples, audio/VAD configuration, background-noise transcript cleanup, interruption mechanisms.
- **Possible lesson:** “User input” in voice is not a clean sequence of messages; it is an acoustic scene.
- **Evidence/publication:** Interview-confirmed plus code. **PUBLIC**.

### Story L — The remaining fragility is at integration boundaries and recoverable intent mistakes

- **Rank:** Closing reflection.
- **Problem:** Production maturity does not mean the system is solved.
- **Observed current limitations:** Third-party behavior around moving appointments remains the main operational fragility. The model can still mishear a small detail and start booking when the caller meant to change an appointment, or start an appointment workflow when it should simply take a message.
- **Naive/simple expectation:** Once prompts, modes, and tools are sufficiently detailed, the supported workflow should become fully reliable.
- **Why insufficient:** External APIs have their own constraints and failures, while intent interpretation remains probabilistic under real audio.
- **Engineering solution:** Explicit pivots/abort tools, preserved validated state, action clarification, partial-failure semantics, retries where safe, human follow-up, and allowing the caller's correction to recover the flow.
- **Remaining tradeoffs:** These mechanisms reduce impact rather than eliminating errors. A correctable conversational detour differs from an incorrect external action, so deterministic guards concentrate on the latter.
- **Useful code/example:** Appointment subflow state, move/cancel fallback logic, clarification scenarios, and mechanisms 21–24.
- **Possible lesson:** A production system can remain probabilistic at the conversational edge if mistakes are recoverable and irreversible effects are bounded.
- **Evidence/publication:** Interview-confirmed current assessment plus code. **PUBLIC-HIGH-LEVEL** for third-party specifics.

### Story M — Optional synthetic office ambience creates real systems obligations

- **Rank:** 10; a memorable sidebar/detail, not a central argument.
- **Problem:** Perfectly clean synthetic voice on an otherwise silent line can feel less like a live receptionist, motivating optional low office-like background sound.
- **Observed product choice:** Kari exposes an account setting for quiet office-like background noise intended to make calls feel more natural.
- **Naive/simple solution:** Loop an audio file beneath the model's speech.
- **Why insufficient:** The ambient channel can collide with startup cues, buffered speech, barge-in detection, endings, mixing levels, and downstream transcription. Background noise can itself induce transcript hallucinations.
- **Engineering solution:** A frame-aware PCMU audio-bed controller with bounded gain, synthetic fallback, startup ordering, output-buffer tracking, idle-only frames, post-barge-in suppression, ending checks, and transcript artifact removal.
- **Remaining tradeoffs:** Naturalness is subjective and no measured caller benefit is established here. The feature intentionally adds acoustic complexity to a system already fighting noisy input.
- **Useful code/example:** Mechanism 37; commits `42cdf83c`, `f428e2f3`, `63c09805`, and `2f81ba30`.
- **Possible lesson:** In voice products, even atmosphere becomes transport and concurrency engineering.
- **Evidence/publication:** Product intent from setting text; implementation/history code-clear. **PUBLIC** without efficacy claims.

### Story N — The identity-number demo was accidentally trained on its tester

- **Rank:** 1 — strongest opening or first-real-users story.
- **Problem:** Spoken national identity numbers appeared to work reliably in developer testing, creating confidence that the audio path was solved.
- **Observed failure:** It worked perfectly for Andreas. A colleague's number worked often but not always. With roughly ten other testers, recognition was consistently very poor. Much later, Andreas realized that his own identity number had been placed in the prompt as an example. The model could guess his exact input, and the colleague's similar number benefited partially from the same bias.
- **Naive/simple solution:** Demonstrate speech recognition repeatedly with the developer and a nearby colleague and treat successful repetition as evidence of general reliability.
- **Why insufficient:** The test fixture contaminated the prompt and the testers were not representative. The system was not robustly transcribing arbitrary digit sequences; it was benefiting from a highly specific prior hidden inside its instructions.
- **Engineering solution:** Remove reliance on prompt examples for correctness, validate identity data deterministically, use DTMF as the primary structured channel, retain two independent speech fallbacks, and test across varied users and scenarios.
- **Remaining tradeoffs:** Even a larger tester pool is not equivalent to authentic callers with real needs, uncontrolled audio, and no role-playing script. Speech fallback remains probabilistic.
- **Useful code/example:** Mechanisms 6, 7, and 35; FNR modes, DTMF capture, transcription sidecar, and speech-safe validation paths. The historic prompt content should be described but never reproduced with the identifier.
- **Possible lesson:** A demo can pass every test you perform because the prompt has accidentally encoded the test answer. Real users do not merely find edge cases; they invalidate the test distribution.
- **Evidence/publication:** Interview-confirmed. The sensitive value itself is **PRIVATE**; the engineering story is **PUBLIC-HIGH-LEVEL**.

### Story O — Scenario testing is part assertion suite, part model-behavior review

- **Rank:** 6; use within the broader scenario-testing section.
- **Problem:** Some failures are crisp—wrong tool, forbidden retry, missing transition—while others are a conversation that technically passes but no longer makes sense.
- **Observed practice:** Scenario tests used to run during deployment. They now accompany development of significant model-behavior changes: add or adjust a scenario, select relevant existing cases, run assertions, and inspect regressions. Hard failures are reported automatically; Andreas or an agent also reads transcripts for behavior that is not sensible to encode as regex assertions.
- **Naive/simple solution:** Either automate everything with brittle text checks or rely entirely on manual phone testing.
- **Why insufficient:** Exact language varies legitimately, but unconstrained human review is slow and irreproducible. Neither extreme covers both operational invariants and conversational coherence.
- **Engineering solution:** Structured assertions for stable behavioral properties plus retained transcripts/artifacts for semantic review by a human or another agent.
- **Remaining tradeoffs:** Transcript review still consumes judgment and model runs remain slower/costlier than deterministic tests. Selection of relevant scenarios is currently part of development judgment rather than an exhaustive deploy gate.
- **Useful code/example:** Scenario runner, EDN scenarios, assertion reports, transcript artifacts, current deployment-script exclusion.
- **Possible lesson:** Testing a generative system needs both executable invariants and reviewable evidence.
- **Evidence/publication:** Code and interview-confirmed workflow. **PUBLIC**.

## Interview completion note

The interview is complete after three bounded batches. Further questions should be asked only if Andreas requests another pass or a specific outline exposes a factual blocker. The repository and history remain the default evidence sources; lack of a remembered origin story is not a reason to exclude a code-clear mechanism.

The working thesis is now more precise than the title alone: a useful voice-agent demo can be built in an afternoon or a few days, but Kari has required more than a year of continuous production engineering. The decisive input was not elapsed time by itself—it was exposure to authentic callers with real needs, varied audio, and behavior that developer role-play did not reproduce.
