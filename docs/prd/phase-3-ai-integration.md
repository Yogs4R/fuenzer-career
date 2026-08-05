# Fuenzer Career | Phase 3: Real AI Agents + Voice Interviews (PRD)

## Description
Phase 3 replaces the mock data of the shipped MVP with the real product: the **Market Job Agent** scrapes live LinkedIn & Indeed listings via Bright Data and extracts trending skills per role + language, the **Interview Prep Agent** generates contextual interview questions, the Interview Room captures real voice answers via Speechmatics real-time transcription (with live captions and filler-word detection), and the **Evaluation Agent** scores each answer with AI feedback. All three agents run as Supabase Edge Functions powered by an OpenAI-compatible LLM (deepseek/deepseek-v4-flash via AIMLAPI). No user accounts are required — the app remains guest-first, and the session is held client-side in a React context.

## Goals
- Replace mock trending skills, questions, and report data with real, live AI-generated results end-to-end.
- Capture real voice answers in the Interview Room (microphone → Speechmatics → transcript) instead of a visual-only mic toggle.
- Deliver a real Evaluation Report: per-question score + feedback, skill-match against the role, and confidence/delivery analysis including counted filler words.
- Keep the app guest-first: zero sign-up required, no database, no server-side session.
- Cost-conscious: one cheap/fast LLM (deepseek-v4-flash via AIMLAPI) powers all three agents.

## User Stories
- As a job seeker, I want to see live trending skills for my target role and language, so I know what to focus on before an interview.
- As a job seeker, I want interview questions generated from the real market data for my role, so practice feels relevant.
- As a job seeker, I want to answer aloud and see my words transcribed live, so I can practise real speaking.
- As a job seeker, I want per-question scores, skill-match feedback, and filler-word analysis, so I know exactly what to improve.

## User Flows

### Happy Path
1. User lands on **Dashboard** (`/`) and types/selects a target role + language (EN/ID) in the hero `RoleCombobox`.
2. User clicks **"Start Target Research"**. The loading overlay shows (real time now — no fixed 2s delay).
3. Dashboard calls **`market-agent`** Edge Function → scrapes LinkedIn + Indeed for the role in the selected market → LLM extracts trending skills → dashboard renders the **Trending Skills** chips from live data (replacing the hardcoded array), plus a keyword picker.
4. User confirms/picks keywords → Dashboard calls **`interview-prep`** → LLM generates 3–5 questions → session saved in React context → navigate to `/interview`.
5. **Interview Room** shows question 1. User taps the mic → browser `getUserMedia` → 16 kHz PCM audio streamed to Speechmatics WebSocket → live partial captions render under the question; final transcripts accumulate per question.
6. Filler words (words tagged as disfluency by Speechmatics) are counted live and stored per question.
7. User taps "Finish & Get Result" → Dashboard calls **`evaluation`** Edge Function with questions + transcripts + role + keywords → returns per-question scores/feedback + skill match + delivery analysis → session saved → navigate to `/report`.
8. **Evaluation Report** renders real data: overall score ring, per-question cards, skill-match card, confidence & delivery card (filler counts + AI feedback).

### Error / Alternate Paths
- **Mic permission denied / no mic**: Interview Room shows a clear error state and falls back to a textarea so the user can type answers (transcript = typed text, no filler analysis). Prompts match the FAQ promise ("you can still explore the platform without one").
- **Bright Data failure (rate limit / block)**: `market-agent` returns a 502-style error with a user-readable message; dashboard shows "Live data temporarily unavailable" and falls back to cached/static skills so the flow is never dead-ended.
- **Speechmatics connection drops**: client auto-reconnects (new token minted via Edge Function, new WebSocket); any finalized transcripts already received are kept.
- **LLM malformed JSON**: agents retry once with a stricter prompt; on second failure return a 500 with a readable message.

## Design & UX
- **No visual redesign** — this phase swaps data sources and wires real behavior into the existing v2 UI (see `prd/v2-ui-overhaul.md`, `design-system/MASTER.md`).
- **Dashboard**: Trending Skills chips + growth badges become live output of `market-agent` (same chip design). Add a lightweight keyword-selection step (selectable chips) before proceeding, or auto-proceed with the top N keywords if selection is skipped (default: top 5).
- **Interview Room**: live caption panel (partials in muted gray, finals in solid text), per-question progress, a small live "filler count" badge per question, mic state machine (idle → recording → processing) reused from `specs/phase-2-interactivity.md`.
- **Report**: reuse existing score ring, Skill Match card, Confidence & Delivery card; add a per-question breakdown list with score + feedback + tips.

## Integrations
All four Edge Functions are browser-callable → **every one must handle CORS** (respond 200 + CORS headers to `OPTIONS` preflight, and include the same headers on real responses). **All are deployed with `verify_jwt: false`** — the product is guest-first; no JWT is required to call them. (Conditional JWT verification may be added in a later auth phase.)

### 1. Bright Data Web Unlocker — job listing scraping
- **Used for**: fetching live LinkedIn + Indeed job search result pages for `market-agent`.
- **Zone**: `fuenzer_career_scraper` (created in Bright Data dashboard — a config string, not a secret; hardcode it in the `market-agent` function).
- **Credential**: `BRIGHT_DATA_API_TOKEN` — **SECRET** (Supabase Secret Manager, read only inside the Edge Function via `Deno.env.get`). Never sent to the browser.
- **Where code runs**: server-side only (Edge Function). The API token must never leave the function.
- **Transport**: request/response REST. `POST https://api.brightdata.com/request` with headers `Authorization: Bearer <token>`, `Content-Type: application/json`, body `{ "zone": "fuenzer_career_scraper", "url": "<target>", "format": "json" }`. Response: `{ status: <http>, body: "<page content>", headers: {...} }`.
- **Target URLs** (language drives the locale): English → `https://www.linkedin.com/jobs/search?keywords=<role>` and `https://www.indeed.com/jobs?q=<role>`; Indonesian → `https://www.linkedin.com/jobs/search?keywords=<role>` (locale param optional) and `https://id.indeed.com/jobs?q=<role>`.
- **Parsing strategy**: do NOT write brittle HTML selectors against LinkedIn/Indeed markup. Pass the scraped text (truncated to a sane budget, e.g. first ~50–100KB) to the LLM and let it extract skills. This is robust to site layout changes.
- **Timeout/cost guard**: scrape both boards in parallel with `Promise.all`; a failed board is skipped, not fatal.

### 2. AIMLAPI — LLM (model `deepseek/deepseek-v4-flash`)
- **Used for**: all three agents — keyword extraction (Market), question generation (Prep), answer evaluation (Coach).
- **Credential**: `AIMLAPI_API_KEY` — **SECRET** (Supabase Secret Manager, read only inside Edge Functions). Never sent to the browser.
- **Where code runs**: server-side only (Edge Function). The key must never reach client code.
- **Transport**: request/response REST, OpenAI-compatible. `POST https://api.aimlapi.com/v1/chat/completions` with `Authorization: Bearer <key>`, body `{ model: "deepseek/deepseek-v4-flash", messages: [...], temperature, response_format: { type: "json_object" } }`. Response follows OpenAI chat-completion shape; read `choices[0].message.content` and `JSON.parse` it.
- **Prompt contract** (each agent returns strict JSON):
  - `market-agent`: input = scraped job text + role + language → output `{ "keywords": [{ "name": string, "count": number }] }` (top ~10–15, sorted by count; growth badge derived from count ranking client-side).
  - `interview-prep`: input = role + language + selected keywords → output `{ "questions": [string] }` (3–5 questions, mix of behavioral/STAR and technical, in the selected language).
  - `evaluation`: input = role + keywords + language + array of `{ question, answer }` → output `{ "overallScore": number, "perQuestion": [{ "question": string, "score": number, "feedback": string, "tips": [string] }], "skillMatch": { "matched": [string], "missing": [string] }, "delivery": { "feedback": string } }`. Filler counts come from Speechmatics tags, NOT the LLM.
- **SDK**: none needed — plain `fetch` from Deno inside the Edge Function. Use `response_format.json_object` to force valid JSON; retry once on parse failure.

### 3. Speechmatics — real-time speech-to-text
- **Used for**: transcribing the user's spoken answers live in the Interview Room, including per-word disfluency tags for filler detection.
- **Credential**: `SPEECHMATICS_API_KEY` — **SECRET** (Supabase Secret Manager, read only inside the `speechmatics-token` Edge Function). Never sent to the browser.
- **Key exposure model**: the raw API key never reaches the client. The `speechmatics-token` Edge Function calls `POST https://mp.speechmatics.com/v1/api_keys?type=rt` with `Authorization: Bearer <key>` and body `{"ttl": 60}`, and returns a short-lived JWT `{ "token": "<jwt>" }`. The client fetches a fresh token immediately before each session (tokens are short-lived — never cache).
- **Where code runs**: token minting server-side (Edge Function); the WebSocket transcription runs in the browser using the minted JWT.
- **Transport**: 
  - Token: request/response REST (above).
  - Audio: WebSocket `wss://eu.rt.speechmatics.com/v2?jwt=<token>`. Client sends `StartRecognition` with `audio_format: { type: "raw", encoding: "pcm_s16le", sample_rate: 16000 }` and `transcription_config: { language: "en" | "id", max_delay: 2, enable_partials: true, additional_vocab: [role, ...keywords] }`, then streams raw 16 kHz PCM binary frames.
  - Messages: `AddPartialTranscript` → live/interim text (never appended permanently); `AddTranscript` → finalized text with `metadata.words[].tags` (e.g. `Disfluency`, `FilledPause`). Count words with a disfluency tag per question for filler analysis.
- **Audio pipeline (client)**: `navigator.mediaDevices.getUserMedia({ audio: true })` → `new AudioContext({ sampleRate: 16000 })` → worklet/script processor converting Float32 → Int16 → send binary chunks over the WebSocket. If 16 kHz isn't supported, resample (OfflineAudioContext) before encoding.
- **Session lifecycle**: open WS per question or one WS for the whole interview (recommended: one per question, mint a fresh token each time). On `EndOfTranscript`/user stop, close the WS cleanly.

### 4. Supabase — Edge Functions platform
- **Used for**: hosting all four functions + Secret Manager.
- **Functions to deploy** (all `verify_jwt: false`, all with CORS):
  1. `speechmatics-token` — mints the short-lived Speechmatics JWT.
  2. `market-agent` — Bright Data scrape → LLM keyword extraction.
  3. `interview-prep` — LLM question generation.
  4. `evaluation` — LLM answer evaluation.
- **Secrets to store (3)**: `BRIGHT_DATA_API_TOKEN`, `AIMLAPI_API_KEY`, `SPEECHMATICS_API_KEY` — all SECRETS in Supabase Secret Manager. There are no `.env` files; no secret is ever read by client code.
- **No database, no auth enforcement, no storage** in this phase.

## Acceptance Criteria
- [ ] `speechmatics-token` Edge Function deployed (CORS + verify_jwt off), returns `{ token }` given a valid `SPEECHMATICS_API_KEY` secret; returns 401 without it.
- [ ] `market-agent` deployed (CORS + verify_jwt off); given `{ role, language }` returns `{ keywords: [{ name, count }] }`; scrapes LinkedIn + Indeed via the `fuenzer_career_scraper` zone; skips a board that fails instead of erroring the whole request.
- [ ] `interview-prep` deployed; given `{ role, language, keywords }` returns `{ questions: [string] }` in the selected language (3–5 questions).
- [ ] `evaluation` deployed; given questions + answers + role + language returns the full JSON contract (overallScore, perQuestion[], skillMatch, delivery).
- [ ] No API key appears anywhere in client source, network tab, or repo; all three keys exist only as Supabase secrets.
- [ ] Dashboard: trending skills come from `market-agent` (no hardcoded array); loading overlay is real-time and clears on success/failure with readable error states and a non-dead-end fallback.
- [ ] Interview Room: mic button actually records; live partial captions render; final transcripts are per-question; filler words tagged as disfluency are counted per question.
- [ ] Mic-denied fallback: textarea answer entry works and flows through evaluation (filler analysis skipped).
- [ ] Report: renders real per-question scores/feedback, skill match, and confidence/delivery with counted filler words; "Try Another Role" returns to Dashboard.
- [ ] Full flow works guest-first with no login and no Supabase database tables.
- [ ] `verify_jwt` is `false` on all four functions; OPTIONS preflight returns 200 with CORS headers on all four.

## Out of Scope
- User accounts, JWT enforcement, or any auth beyond the existing (unused) Login/SignUp pages.
- Database persistence, interview history, saved reports.
- Batch/file upload transcription (Speechmatics batch API).
- Salary data extraction from listings (skills only for now).
- Multi-market geo/location targeting beyond the EN/ID language-driven Indeed domains.
- Report export (PDF) and email delivery.
- Rate limiting, quotas, or per-user usage tracking.

## Open Questions
- **AIMLAPI model string**: user specified `deepseek/deepseek-v4-flash` via `https://api.aimlapi.com` (OpenAI-compatible, Bearer auth) — confirmed by user. Exact model naming to be verified with a live call during build; adjust `model` field if the 404s.
- **LinkedIn scrape reliability**: Web Unlocker renders JS and handles bot detection, but LinkedIn may still throttle. Fallback is Indeed-only + cached skills. Needs live verification during build.
- **Keyword selection UX**: auto-proceed with top 5 vs. explicit chip selection — defaulting to explicit selection with a "skip" that auto-picks top 5.

## Implementation Notes
- **Frontend framework**: Vite + React (TypeScript), react-router-dom, existing `src/index.css` design tokens (see `design-system/MASTER.md`).
- **Session state**: React Context (`InterviewSessionProvider` mounted in `App.tsx`) holding `{ role, language, keywords, questions, answers[], perQuestionResults, overallScore, skillMatch, delivery, fillerCounts }`. Pages read/write context instead of `navigate` state only. No external state library.
- **Supabase client**: `@supabase/supabase-js` (or `@supabase/ssr`) with the project URL + anon/publishable key for calling Edge Functions via `supabase.functions.invoke(name, { body })`. The anon/publishable key is PUBLISHABLE (safe in client source) — it only gates Edge Function access, and functions are deliberately `verify_jwt: false`.
- **Edge Function runtime**: Deno. Plain `fetch` for Bright Data + AIMLAPI; use `response_format: { "type": "json_object" }` for LLM calls and `JSON.parse` with a single retry.
- **Audio encoding helper**: shared client util `src/lib/audio.ts` (getUserMedia → Int16 PCM at 16 kHz) and `src/lib/speechmatics.ts` (token fetch + WS session + partial/final event handling + disfluency counting). Transcript per question stored as `{ question, answer, fillerCount, fillerWords[] }`.
- **Deploy order**: secrets first → `speechmatics-token` → `market-agent` → `interview-prep` → `evaluation` → then frontend wiring page by page (Dashboard → Interview Room → Report).
