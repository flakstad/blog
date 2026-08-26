# Kari engineering article series

Working plan, not a publication commitment. Article 1 gives the narrative overview; later articles retain the implementation depth deliberately omitted from it.

## 1. A voice agent demo takes a day. Production takes a year.

- **Core thesis:** Kari's first useful demo was genuinely useful, but authentic callers and real operations turned a conversational prototype into a realtime application with explicit boundaries around state and consequences.
- **Likely sections:** The demo really did work; The test that passed for the wrong reason; “IMPORTANT!!!” is not an architecture; A “yes” is not a transaction; Generated is not heard; Test the system that actually ships; Production keeps going.
- **Reserved stories/mechanisms:** Identity-number prompt overfit; the large prompt and modes; fresh-confirmation guard; playback-aware state; silence recovery; late “one moment” race; overview of real-model scenarios.
- **Do not consume:** Complete FNR architecture; prompt compiler and instruction lifetimes; full scenario DSL; transcript reconciliation; multilingual implementation; detailed retries/idempotency/partial failures; ambient audio bed.
- **Publication notes:** Never reveal an identity number, patient data, private prompts, clinic-specific rules, or unsupported scale claims. Present “a day” and “a year” as Kari's rhetorical chronology, not an industry benchmark.

## 2. Testing the model is part of testing the application

- **Core thesis:** Deterministic tests can verify application logic and prompt assembly, but regressions in the probabilistic component require running important situations through the actual production model path.
- **Likely sections:** What ordinary tests can prove; The missing failure layer; Scenarios as data; Running production prompts and tools; Assertions without exact prose; Artifacts and transcript review; Cost, latency, and run selection.
- **Reserved stories/mechanisms:** EDN scenario DSL; real model families; production prompt/tool construction; stubbed versus real tools; assertion severities; failure artifacts; transcript review by a person or agent; model/prompt comparison workflow.
- **Article 1 should not consume:** DSL schema, runner lifecycle, assertion catalogue, artifact formats, nondeterminism strategy, or detailed caught-regression reconstruction.
- **Publication notes:** Do not claim a measured catch count, runtime, or cost without data. Synthetic scenario fixtures must not be confused with real patients or callers.

## 3. Our voice agent doesn't have one prompt

- **Core thesis:** Kari's runtime instructions are compiled from mode, account capabilities, live state, language, model family, and operation outcomes; instruction scope and lifetime matter as much as wording.
- **Likely sections:** The single-prompt beginning; Modes and scoped tools; Runtime prompt compilation; Progressive disclosure; Why tool results return `_instruksjoner`; Session-, response-, and conversation-scoped instructions; Model-family forks and regression tests.
- **Reserved stories/mechanisms:** November 2025 progression from static prompt to result instructions and modes; account settings/flags/instructions; capability pruning; response overlays; synthetic transition messages; stale instruction tradeoffs; Realtime 1.5/2 prompt families.
- **Article 1 should not consume:** Full instruction-source map, three-lifetime taxonomy, model-specific prompt parity, detailed `_instruksjoner` branches, or account prompt composition.
- **Publication notes:** Describe prompt structure and representative intent, not full production prompts, customer instructions, healthcare rules, or dialect overrides.

## 4. Generated is not delivered

- **Core thesis:** Telephone output has separate generated, buffered, played, interrupted, and heard states. Correct realtime behavior depends on transport evidence, not only model events.
- **Likely sections:** The missing delivery event; Twilio playback acknowledgements; Barge-in and unheard model context; Silence as state; Opening and ending protocols; Progress speech races; Reconstructing an audible transcript.
- **Reserved stories/mechanisms:** Playback marks/drain; queued-audio clearing; response cancellation and item truncation; mode-dependent silence timers; exact-wait behavior; greeting watchdog; playback-safe ending; hybrid transcript reconciliation; optional audio-bed sidebar if useful.
- **Article 1 should not consume:** Exact timer matrix, complete interruption algorithm, ending state machine, transcript reconciliation architecture, or audio mixing details.
- **Publication notes:** Current thresholds are Kari's tuning, not universal constants. Do not imply that every generated transcript item was audible.

## 5. Let the model talk. Let the application own reality.

- **Core thesis:** The model is useful for interpreting callers and phrasing responses, while application code owns authoritative facts, authorization, external effects, retries, and partial outcomes.
- **Likely sections:** Conversation context is not a database; Fresh confirmation; Canonical IDs and offered choices; Purpose-built tools and validation; Idempotency and stale actions; Retryable versus terminal failure; When “move” is not atomic; Human follow-up as a safety net.
- **Reserved stories/mechanisms:** Reused yes in full depth; booking state; selection integrity; SMS/lookup/transfer guards; transient retry policy; replacement appointment partial failure; deterministic post-call follow-up overrides.
- **Article 1 should not consume:** Detailed confirmation state, booking field model, retry status set, duplicate-action guards, rescheduling transaction semantics, or follow-up classifier logic.
- **Publication notes:** Keep patient/customer data and clinic rules out. Explain external-operation categories without exposing sensitive API details or implying universal healthcare policy.

## 6. Language is application state

- **Core thesis:** Model multilingual fluency was not enough to keep workflow checkpoints linguistically consistent, so active language became explicit, sticky state with localized control behavior.
- **Likely sections:** The Ukrainian call; Conflicting exact instructions; A language-change tool; Sticky BCP-47 state; First-class Norwegian and English behavior; Speech-safe data and translation; Prepared best-effort languages; What remains model-owned.
- **Reserved stories/mechanisms:** Ukrainian/Norwegian mixing; confirmation before automatic third-language switches; Norwegian/English restriction; localized progress and endings; English speed; Norwegian time/price/phone projections; natural versus 24-hour account setting.
- **Article 1 should not consume:** The Ukrainian narrative, language state machine, localization tables, detection rules, or speech-formatting asymmetry beyond one brief mention.
- **Publication notes:** State accurately that Norwegian and English are first-class. Additional languages are prepared but currently rely more on best-effort model translation. Do not publish customer dialect configuration.
