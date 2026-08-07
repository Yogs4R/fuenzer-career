# Fuenzer Career | Architecture Document

## Table of Contents

- [System Overview](#system-overview)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [Data Flow — Complete Happy Path](#data-flow--complete-happy-path)
- [API Contract — Edge Functions](#api-contract--edge-functions)
- [Database Schema](#database-schema)
- [Security Architecture](#security-architecture)
- [Error Handling Strategy](#error-handling-strategy)
- [Performance Considerations](#performance-considerations)
- [Key Design Patterns](#key-design-patterns)

---

## System Overview

Fuenzer Career is a **guest-first, AI-powered interview coaching platform** built on a serverless architecture. The entire backend runs as Supabase Edge Functions (Deno), and the frontend is a single-page React application.

```mermaid
flowchart TB
    subgraph Client["CLIENT (Browser)"]
        subgraph React["React Application"]
            ISP["InterviewSessionProvider<br/>(React Context — guest state, localStorage-backed)"]
            D["Dashboard<br/>(/)"] --> ISP
            IR["InterviewRoom<br/>(/interview)"] --> ISP
            ER["EvaluationReport<br/>(/report)"] --> ISP
            subgraph UI["UI Infrastructure"]
                NB["NavBar<br/>(auth + history)"]
                CC["CookieConsent<br/>(GA opt-in)"]
                RC["RoleCombobox<br/>(typeahead)"]
            end
        end
        SCS["Supabase Client SDK<br/>(supabase.functions.invoke + auth)"] --> React
    end

    subgraph Serverless["SERVERLESS (Supabase)"]
        subgraph Edge["Edge Functions (Deno)"]
            MA["market-agent<br/>GET /market-data<br/>Scrapes job listings → LLM extracts skills"]
            IP["interview-prep<br/>POST /questions<br/>Generates 3-5 contextual interview Qs"]
            E["evaluation<br/>POST /evaluate<br/>Scores answers + skill match + delivery"]
            IH["interview-hint<br/>POST /hint<br/>STAR-method suggestion per question"]
            ST["speechmatics-token<br/>POST /token<br/>Mints short-lived JWTs for WS auth"]
            DU["delete-user<br/>POST /delete<br/>Admin API call to remove user"]
        end
        subgraph Infra["Supabase Infrastructure"]
            PG[("PostgreSQL<br/>(history, notifications)")]
            SM[("Secret Manager<br/>(API keys)")]
            AU[("Auth (Google OAuth)")]
        end
    end

    subgraph External["EXTERNAL SERVICES"]
        BD[("Bright Data<br/>Web Unlocker<br/>REST API")]
        AML[("AI/ML API<br/>OpenAI-compat<br/>deepseek-v4-flash")]
        SMX[("Speechmatics<br/>Real-Time API<br/>WebSocket<br/>PCM 16 kHz → transcripts")]
    end

    Client -->|"supabase.functions.invoke"| Serverless
    MA -->|"scrapes job listings"| BD
    MA -->|"LLM extracts skills"| AML
    IP -->|"generates questions"| AML
    IH -->|"generates hints"| AML
    E -->|"scores answers"| AML
    ST -->|"POST /v1/api_keys?type=rt"| SMX
```

---

## Component Hierarchy

```mermaid
flowchart LR
    BR["&lt;BrowserRouter&gt;"]
    AP["&lt;AuthProvider&gt;<br/>Supabase auth state"]
    ISP["&lt;InterviewSessionProvider&gt;<br/>Guest interview context"]
    NAV["&lt;NavBar /&gt;<br/>Responsive nav, auth, history, i18n"]
    CC["&lt;CookieConsent /&gt;<br/>GA opt-in banner"]
    R1["Route / → Dashboard<br/>Landing, 8 sections"]
    R2["Route /interview → InterviewRoom<br/>Voice + transcription"]
    R3["Route /report → EvaluationReport<br/>Score + analysis"]
    R4["Route /login → Login<br/>Google OAuth"]
    R5["Route /signup → SignUp<br/>Registration"]
    R6["Route /privacy → Privacy<br/>Legal"]
    R7["Route /terms → Terms<br/>Legal"]
    R8["Route * → NotFound<br/>404"]

    BR --> AP
    AP --> ISP
    ISP --> NAV
    ISP --> R1
    ISP --> R2
    ISP --> R3
    ISP --> R4
    ISP --> R5
    ISP --> R6
    ISP --> R7
    ISP --> R8
    ISP --> CC
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
| `session.language` | `"en" \| "de" \| "fr" \| "id" \| "ja" \| "zh"` | localStorage |
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

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> recording: click mic
    recording --> processing: click mic
    recording --> processing: user stops recording
    processing --> idle: 800ms timeout
    processing --> idle: 800ms timeout (hasRecording=true)
    idle --> recording: click mic (hasRecording=true)
```

---

## Data Flow — Complete Happy Path

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant InterviewRoom
    participant Report as EvaluationReport
    participant MA as market-agent
    participant IP as interview-prep
    participant ST as speechmatics-token
    participant Eval as evaluation
    participant BD as Bright Data
    participant AML as AI/ML API
    participant SMX as Speechmatics

    Note over User, SMX: Step 1: Market Research
    User->>Dashboard: Enter role
    Dashboard->>MA: POST /market-data
    MA->>BD: Scrape LinkedIn + Indeed
    BD-->>MA: Raw HTML
    MA->>AML: Extract trending skills
    AML-->>MA: { keywords }
    MA-->>Dashboard: keywords[]

    Note over User, SMX: Step 2: Question Generation
    User->>Dashboard: Select keywords
    Dashboard->>IP: POST /questions
    IP->>AML: Generate 3-5 questions
    AML-->>IP: { questions }
    IP-->>Dashboard: questions[]
    Dashboard-->>User: Navigate to /interview

    Note over User, SMX: Step 3: Voice Interview
    InterviewRoom->>ST: POST /token
    ST->>SMX: POST /v1/api_keys?type=rt
    SMX-->>ST: { token: "jwt" }
    ST-->>InterviewRoom: { token }
    InterviewRoom->>SMX: WebSocket wss://...?jwt=<token>
    User->>InterviewRoom: Speak
    InterviewRoom->>SMX: Stream PCM 16 kHz
    SMX-->>InterviewRoom: AddPartialTranscript (live captions)
    SMX-->>InterviewRoom: AddTranscript (final + disfluency)
    InterviewRoom->>SMX: EndOfStream
    SMX-->>InterviewRoom: EndOfTranscript

    Note over User, SMX: Step 4: Evaluation
    User->>InterviewRoom: Finish & Get Result
    InterviewRoom->>Eval: POST /evaluate
    Eval->>AML: Score answers
    AML-->>Eval: { overallScore, perQuestion, skillMatch, delivery }
    Eval-->>InterviewRoom: evaluation data
    InterviewRoom-->>User: Navigate to /report

    Note over User, SMX: Step 5: Report
    Report-->>User: Score gauge, per-question breakdown, skill match, filler analysis
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

```mermaid
flowchart LR
    subgraph SM["Supabase Secret Manager"]
        BDK["BRIGHT_DATA_API_TOKEN"]
        AAK["AIMLAPI_API_KEY"]
        SPK["SPEECHMATICS_API_KEY"]
    end

    subgraph Functions["Edge Functions"]
        MA["market-agent"]
        IP["interview-prep"]
        IH["interview-hint"]
        E["evaluation"]
        ST["speechmatics-token"]
    end

    subgraph Services["External Services"]
        BD["Bright Data API"]
        AML["AI/ML API"]
        SMX["Speechmatics API"]
    end

    BDK --> MA
    AAK --> MA
    AAK --> IP
    AAK --> IH
    AAK --> E
    SPK --> ST
    MA --> BD
    MA --> AML
    IP --> AML
    IH --> AML
    E --> AML
    ST -->|"mints 60s JWT"| SMX
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

```mermaid
flowchart LR
    Guest["Guest<br/>→ No auth<br/>→ Full app access<br/>→ Session in localStorage<br/>→ Optional sign-up later"]
    Auth["Auth<br/>→ Google OAuth<br/>→ Supabase session<br/>→ History saved to DB<br/>→ Profile/notifications"]
    Guest -->|"sign in"| Auth
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
