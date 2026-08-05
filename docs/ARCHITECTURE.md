# Fuenzer Career | Architecture Document

## System Overview

Fuenzer Career is a **guest-first, AI-powered interview coaching platform** built on a serverless architecture. The entire backend runs as Supabase Edge Functions (Deno), and the frontend is a single-page React application.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    React Application                         │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │              InterviewSessionProvider                │   │   │
│  │  │  (React Context — guest state, localStorage-backed)  │   │   │
│  │  └────────────────────────┬─────────────────────────────┘   │   │
│  │                           │                                  │   │
│  │  ┌──────────┐  ┌─────────┴────────┐  ┌──────────────────┐   │   │
│  │  │Dashboard │→│  InterviewRoom    │→│ EvaluationReport │   │   │
│  │  │   (/)    │ │   (/interview)    │ │    (/report)      │   │   │
│  │  └──────────┘ └──────────────────┘ └──────────────────┘   │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │  UI Infrastructure                                  │   │   │
│  │  │  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │   │   │
│  │  │  │ NavBar   │  │ CookieConsent│  │ RoleCombobox  │  │   │   │
│  │  │  │ (auth +  │  │ (GA opt-in)  │  │ (typeahead)   │  │   │   │
│  │  │  │  history)│  │              │  │               │  │   │   │
│  │  │  └──────────┘  └──────────────┘  └───────────────┘  │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                           │                                        │
│              ┌────────────┴────────────┐                          │
│              │  Supabase Client SDK    │                          │
│              │  (supabase.functions.   │                          │
│              │   invoke + auth)        │                          │
│              └────────────┬────────────┘                          │
└───────────────────────────┼───────────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────────────┐
│                    SERVERLESS (Supabase)                          │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                  Edge Functions (Deno)                    │   │
│  │                                                           │   │
│  │  ┌──────────────────┐  ┌──────────────────┐              │   │
│  │  │ market-agent     │  │ interview-prep   │              │   │
│  │  │ GET /market-data │  │ POST /questions  │              │   │
│  │  ├──────────────────┤  ├──────────────────┤              │   │
│  │  │ Scrapes job      │  │ Generates 3-5    │              │   │
│  │  │ listings → LLM   │  │ contextual       │              │   │
│  │  │ extracts skills  │  │ interview Qs     │              │   │
│  │  └────────┬─────────┘  └────────┬─────────┘              │   │
│  │           │                     │                         │   │
│  │  ┌────────┴─────────┐  ┌────────┴─────────┐              │   │
│  │  │ evaluation       │  │ interview-hint   │              │   │
│  │  │ POST /evaluate   │  │ POST /hint       │              │   │
│  │  ├──────────────────┤  ├──────────────────┤              │   │
│  │  │ Scores answers + │  │ STAR-method      │              │   │
│  │  │ skill match +    │  │ suggestion per   │              │   │
│  │  │ delivery         │  │ question         │              │   │
│  │  └────────┬─────────┘  └──────────────────┘              │   │
│  │           │                                               │   │
│  │  ┌────────┴─────────┐  ┌──────────────────┐              │   │
│  │  │ speechmatics-    │  │ delete-user      │              │   │
│  │  │ token            │  │ POST /delete     │              │   │
│  │  ├──────────────────┤  ├──────────────────┤              │   │
│  │  │ Mints short-lived│  │ Admin API call   │              │   │
│  │  │ JWTs for WS auth │  │ to remove user   │              │   │
│  │  └────────┬─────────┘  └──────────────────┘              │   │
│  │           │                                               │   │
│  └───────────┼───────────────────────────────────────────────┘   │
│              │                                                    │
│  ┌───────────┴───────────────────────────────────────────────┐   │
│  │              Supabase Infrastructure                     │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │ PostgreSQL   │  │ Secret Mgr   │  │ Auth (Google   │  │   │
│  │  │ (history,    │  │ (API keys)   │  │  OAuth)        │  │   │
│  │  │  notifs)     │  │              │  │                │  │   │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │   │
│  └───────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                    │
│  │ Bright Data      │    │ AIMLAPI          │                    │
│  │ Web Unlocker     │    │ (OpenAI-compat)  │                    │
│  │ REST API         │    │ deepseek-v4-flash│                    │
│  └────────┬─────────┘    └────────┬─────────┘                    │
│           │                       │                              │
│  ┌────────┴──────────────────────────────────┐                   │
│  │  Speechmatics Real-Time API               │                   │
│  │  WebSocket (wss://eu.rt.speechmatics.com) │                   │
│  │  PCM 16 kHz → transcripts + disfluency    │                   │
│  └───────────────────────────────────────────┘                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
<BrowserRouter>
  <AuthProvider>                           ← Supabase auth state
    <InterviewSessionProvider>             ← Guest interview context
      <div>
        <NavBar />                        ← Responsive nav, auth, history, i18n
        <Routes>
          <Route "/" → <Dashboard />      ← Landing, 8 sections
          <Route "/interview" → <InterviewRoom />  ← Voice + transcription
          <Route "/report" → <EvaluationReport />  ← Score + analysis
          <Route "/login" → <Login />     ← Google OAuth
          <Route "/signup" → <SignUp />   ← Registration
          <Route "/privacy" → <Privacy /> ← Legal
          <Route "/terms" → <Terms />     ← Legal
          <Route "*" → <NotFound />       ← 404
        </Routes>
        <CookieConsent />                 ← GA opt-in banner
      </div>
    </InterviewSessionProvider>
  </AuthProvider>
</BrowserRouter>
```

---

## State Management

### AuthContext (`src/lib/AuthContext.tsx`)

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current Supabase user, null if guest |
| `loading` | `boolean` | Auth initialization in progress |
| `signInWithGoogle` | `() => Promise<void>` | Triggers Google OAuth flow |
| `signOut` | `() => Promise<void>` | Signs out current user |
| `deleteAccount` | `() => Promise<void>` | Calls `delete-user` Edge Function |

### InterviewSessionContext (`src/lib/InterviewSession.tsx`)

| Property | Type | Persistence |
|----------|------|-------------|
| `session.role` | `string` | localStorage |
| `session.language` | `"en" \| "id"` | localStorage |
| `session.keywords` | `Keyword[]` | localStorage |
| `session.questions` | `string[]` | localStorage |
| `session.answers` | `QuestionAnswer[]` | localStorage |
| `session.totalFillerCount` | `number` | localStorage |
| `session.evaluation` | `EvaluationData \| null` | localStorage |
| `session.isLoading` | `boolean` | Memory only |
| `session.error` | `string \| null` | Memory only |

**Persistence strategy:**
- Guest users: all data persisted to `localStorage` under key `fuenzer_interview_session`
- Authenticated users: no localStorage (data saved to Supabase DB instead)
- Sign-out clears localStorage and resets state to `initialState`
- Progressive saving: `setKeywords`, `setQuestions`, `addAnswer`, and `setEvaluation` all call `saveState` inside their functional updaters to prevent data loss on unmount

### Mic State Machine (local to InterviewRoom)

```
         ┌──────────┐
         │   idle   │
         └────┬─────┘
              │ click mic
              ▼
         ┌──────────┐
         │recording │── click mic ──→ ┌────────────┐
         └──────────┘                 │ processing │
              │                       └──────┬─────┘
              │ user stops recording         │ 800ms timeout
              ▼                              ▼
         ┌──────────┐                 ┌──────────┐
         │processing│                 │   idle   │
         └──────────┘                 │ (hasRec= │
              │                       │  true)   │
              800ms timeout           └──────────┘
              ▼
         ┌──────────┐
         │   idle   │
         │ (hasRec= │
         │  true)   │
         └──────────┘
```

---

## Data Flow — Complete Happy Path

```
Step 1: Market Research
───────────────────────
Dashboard ──POST──→ market-agent
                       │
                       ├── Bright Data: scrapes linkedin.com + indeed.com
                       │
                       └── AIMLAPI: "extract trending skills from this text"
                            → returns { keywords: [{ name, count }] }

Dashboard ←─── keywords ───
  ↓
  Renders trending skills carousel + keyword selection chips


Step 2: Question Generation
───────────────────────────
Dashboard ──POST──→ interview-prep
                       │
                       └── AIMLAPI: "generate 3-5 interview questions for {role}
                            focusing on {keywords}"
                            → returns { questions: [string] }

Dashboard ←─── questions ───
  ↓
  Navigate to /interview


Step 3: Voice Interview
───────────────────────
InterviewRoom ──POST──→ speechmatics-token
                           │
                           └── Speechmatics API: POST /v1/api_keys?type=rt
                                → returns { token: "short-lived-jwt" }

←── token ──

InterviewRoom ──WebSocket──→ wss://eu.rt.speechmatics.com/v2?jwt=<token>
  │  streams PCM 16 kHz binary chunks
  │
  ├── receives: AddPartialTranscript (live captions)
  ├── receives: AddTranscript (finalized text + disfluency tags)
  │
  └── on stop → SetRecognitionConfig { end_of_stream }
       → EndOfTranscript → close WS

Per-question: { question, answer, fillerCount, fillerWords[] }


Step 4: Evaluation
──────────────────
InterviewRoom ──POST──→ evaluation
                           │
                           └── AIMLAPI: "score these answers for {role} in {language},
                                compare against {keywords}"
                                → returns { overallScore, perQuestion[], skillMatch, delivery }

←── evaluation data ──
  ↓
  Navigate to /report


Step 5: Report
─────────────
EvaluationReport renders:
  - Circular score gauge (SVG with animated dashoffset)
  - Summary + badges
  - Skill Match (matched vs. missing skills)
  - Per-question breakdown cards with animated bars
  - Transcript pagination
  - Filler word analysis with bar charts
  - Recommendations
```

---

## API Contract — Edge Functions

### market-agent

```typescript
// POST /market-agent
Request:  { role: string, language: "en" | "id" }
Response: {
  keywords: { name: string, count: number }[],
  error?: string    // present if a scrape board failed
}
```

### interview-prep

```typescript
// POST /interview-prep
Request:  { role: string, language: "en" | "id", keywords: { name: string, count: number }[] }
Response: { questions: string[] }
```

### interview-hint

```typescript
// POST /interview-hint
Request:  { role: string, language: "en" | "id", question: string, keywords: { name: string, count: number }[] }
Response: { suggestion: string }
```

### evaluation

```typescript
// POST /evaluation
Request: {
  role: string,
  language: "en" | "id",
  keywords: { name: string, count: number }[],
  questions: string[],
  answers: { question: string, answer: string, fillerCount: number, fillerWords: string[] }[]
}
Response: {
  overallScore: number,             // 0-100
  perQuestion: {
    question: string,
    score: number,                  // 0-100
    feedback: string,
    tips: string[]
  }[],
  skillMatch: {
    matched: string[],
    missing: string[]
  },
  delivery: { feedback: string },
  fillerWords?: {                   // only if answers have fillerCount > 0
    totalCount: number,
    breakdown: { word: string, count: number }[],
    feedback: string
  }
}
```

### speechmatics-token

```typescript
// POST /speechmatics-token
Request:  (no body)
Response: { token: string }   // short-lived JWT, 60s TTL
```

### delete-user

```typescript
// POST /delete-user
Request:  (no body — uses Authorization header for auth)
Response: { success: true }
```

---

## Database Schema

### interview_history

```sql
CREATE TABLE interview_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL,
  keywords      JSONB,
  questions     JSONB,
  answers       JSONB,
  evaluation    JSONB,
  overall_score INTEGER,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_interview_history_user ON interview_history(user_id, created_at DESC);
```

### notifications

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
```

---

## Security Architecture

### Secrets Management

```
┌─────────────────────────────────────────────┐
│              Supabase Secret Manager         │
│                                             │
│  BRIGHT_DATA_API_TOKEN   → market-agent     │
│  AIMLAPI_API_KEY         → all LLM agents   │
│  SPEECHMATICS_API_KEY    → speechmatics-    │
│                            token only       │
└─────────────────────────────────────────────┘
         │                    │
         │ never leaves       │ never leaves
         │ Edge Function      │ Edge Function
         ▼                    ▼
  Bright Data API        AIMLAPI API
```

**Rules:**
- No API key ever reaches the browser
- Speechmatics key is further protected: Edge Function mints a 60-second JWT, which is the only credential the browser sees
- Supabase anon key (publishable) is safe in client source — it only gates Edge Function access, and all functions are `verify_jwt: false`

### CORS Policy

Every Edge Function implements:
- Responds to `OPTIONS` preflight with 200 + CORS headers
- Includes `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Headers: *`, `Access-Control-Allow-Methods: POST, OPTIONS` on all responses

### Auth Flow

```
Guest:  → No auth → Full app access → Session in localStorage → Optional sign-up later
Auth:   → Google OAuth → Supabase session → History saved to DB → Profile/notifications
```

---

## Error Handling Strategy

| Scenario | Detection | User Experience |
|----------|-----------|-----------------|
| Mic permission denied | `DOMException.name === "NotAllowedError"` | Shows textarea fallback with explanatory message |
| No microphone | `DOMException.name === "NotFoundError"` | Shows textarea fallback |
| Speechmatics WS failure | WebSocket `onerror` / timeout | Falls back to textarea; existing transcripts preserved |
| Bright Data rate limit | 429 / timeout from API | Returns "Live data temporarily unavailable" + fallback skills |
| AIMLAPI malformed JSON | `JSON.parse` failure | Retries once with stricter prompt; on second failure returns 500 with readable message |
| AIMLAPI timeout | `Promise.race` with 25s timeout | Shows "This search is taking longer than expected" + fallback skills |
| Network offline | `fetch` rejection | Loading overlay shows elapsed time; user can retry |
| Evaluation LLM failure | Error from Edge Function | Returns error message to user with retry option |
| History fetch failure | Supabase query error | Shows "Report Not Found" with navigation back to dashboard |

---

## Performance Considerations

1. **No auth wall** — Zero barrier to entry, instant access to all features
2. **LocalStorage persistence** — No DB reads for guest sessions; pages load instantly
3. **Progressive saving** — State is flushed to localStorage inside React's functional updaters, not deferred to effects
4. **Rate-limited market research** — 10-second cooldown between calls prevents accidental API abuse
5. **Parallel scraping** — LinkedIn + Indeed scraped simultaneously; a single board failure is non-fatal
6. **PCM audio at 16 kHz** — Optimal balance between quality and bandwidth for Speechmatics
7. **CSS-only animations** — All entry animations use CSS keyframes, not JS animation libraries
8. **Font subsetting** — Lexend + Source Sans 3 loaded via Google Fonts with display=swap

---

## Key Design Patterns

| Pattern | Usage |
|---------|-------|
| Provider Pattern | AuthContext + InterviewSessionProvider wrap the entire app |
| State Machine | Microphone: idle → recording → processing |
| Pipeline | Market Agent → Interview Prep Agent → Evaluation Agent |
| Optimistic UI | Loading overlays with elapsed timers |
| Graceful Degradation | Mic denied → textarea; API down → cached fallback |
| Rate Limiting | 10s cooldown + 25s timeout on market research |
| Progressive Enhancement | Guest → full features; Auth → history + persistence |
