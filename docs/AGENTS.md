# Fuenzer Career | AI Agent Documentation

Fuenzer Career uses four AI agents working together in a pipeline. Each agent is a Supabase Edge Function powered by an OpenAI-compatible LLM (AIMLAPI, `deepseek/deepseek-v4-flash`), with one agent (`market-agent`) also orchestrating web scraping.

---

## Agent Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Market Job  │────>│  Interviewer │────>│  Evaluation  │
│    Agent     │     │    Agent     │     │    Agent     │
└──────────────┘     └──────────────┘     └──────────────┘
      │                     │                     │
      ▼                     ▼                     ▼
  Trending skills      Interview Qs         Score + feedback
  + keywords           + STAR hints         + skill match
                                             + delivery
```

Each agent consumes the output of the previous one:

1. **Market Job Agent** → extracts keywords from job listings
2. **Interviewer Agent** → generates questions targeting those keywords
3. **Evaluation Agent** → scores answers against the role and keywords

---

## Agent 1: Market Job Agent

### Identity
- **Edge Function:** `market-agent`
- **Secrets:** `BRIGHT_DATA_API_TOKEN`, `AIMLAPI_API_KEY`
- **Transport:** Request/response REST
- **Model:** `deepseek/deepseek-v4-flash`

### Purpose
Scrapes live job listings from LinkedIn and Indeed for a given role and market (language-driven), extracts trending skills and keywords using the LLM.

### Input
```typescript
{
  role: string,           // e.g. "Frontend Developer"
  language: "en" | "id"   // drives market (en → .com domains, id → id.indeed.com)
}
```

### Process
```
1. Build target URLs:
   - LinkedIn: linkedin.com/jobs/search?keywords=<role>
   - Indeed: indeed.com/jobs?q=<role> (or id.indeed.com for Indonesian)

2. POST to Bright Data Web Unlocker API:
   POST https://api.brightdata.com/request
   Authorization: Bearer <BRIGHT_DATA_API_TOKEN>
   Body: { zone: "fuenzer_career_scraper", url: "<target>", format: "json" }

3. Scrape both boards in parallel (Promise.all)

4. Truncate scraped HTML/text to ~50-100KB budget

5. Call AIMLAPI:
   POST https://api.aimlapi.com/v1/chat/completions
   Model: deepseek/deepseek-v4-flash
   System: "Extract the top 10-15 trending skills required for a {role} in {language}
            market from the job listing text below. Return as JSON array with name and count."
   response_format: { type: "json_object" }

6. Parse response → return { keywords: [{ name, count }] }
```

### Output
```typescript
{
  keywords: { name: string, count: number }[],   // top 10-15, sorted by count
  error?: string                                   // non-fatal error (e.g. one board failed)
}
```

### Error Handling
- Timeout: 25 seconds total
- Board failure: skip failed board, proceed with successful one
- Both boards fail: return empty keywords array; caller falls back to cached/general skills
- Malformed LLM JSON: retry once with stricter prompt

---

## Agent 2: Interviewer Agent

### Identity
- **Edge Function:** `interview-prep`
- **Secrets:** `AIMLAPI_API_KEY`
- **Transport:** Request/response REST
- **Model:** `deepseek/deepseek-v4-flash`

### Purpose
Generates 3-5 contextual interview questions based on the user's target role and selected keywords. Questions are a mix of behavioral (STAR method) and technical.

### Input
```typescript
{
  role: string,
  language: "en" | "id",
  keywords: { name: string, count: number }[]
}
```

### Process
```
Call AIMLAPI with prompt:
"You are an expert interviewer for a {role} position.
Generate 3-5 interview questions in {language} that assess the candidate's
proficiency in these skills: {keyword names}.
Include a mix of behavioral (STAR method) and technical questions.
Return as JSON with a 'questions' array of strings."

Parse response → return { questions: [string] }
```

### Output
```typescript
{
  questions: string[]   // 3-5 questions in the target language
}
```

### Error Handling
- Timeout: 15 seconds
- Empty response: retry once; on second failure return error to caller

---

## Agent 3: Interview Hint Agent

### Identity
- **Edge Function:** `interview-hint`
- **Secrets:** `AIMLAPI_API_KEY`
- **Transport:** Request/response REST
- **Model:** `deepseek/deepseek-v4-flash`

### Purpose
Generates a contextual STAR-method suggestion for a specific question during the interview. Called on-demand when the user opens the hint panel.

### Input
```typescript
{
  role: string,
  language: "en" | "id",
  question: string,
  keywords: { name: string, count: number }[]
}
```

### Process
```
Call AIMLAPI with prompt:
"You are an interview coach. The candidate is interviewing for {role}
and needs to answer: '{question}'. Give a 1-2 sentence suggestion on how
to frame a STAR-method answer using the following keywords: {keyword names}.
Be specific and actionable. Return as JSON: { suggestion: string }"
```

### Output
```typescript
{
  suggestion: string   // 1-2 sentence STAR-method hint
}
```

### Error Handling
- On failure: show "Couldn't generate a hint" with retry button
- Loading state: "Generating personalised hint..." with spinner

---

## Agent 4: Evaluation Agent

### Identity
- **Edge Function:** `evaluation`
- **Secrets:** `AIMLAPI_API_KEY`
- **Transport:** Request/response REST
- **Model:** `deepseek/deepseek-v4-flash`

### Purpose
Analyzes the user's answers against the target role and keywords, providing per-question scoring, overall score, skill match analysis, and delivery feedback.

### Input
```typescript
{
  role: string,
  language: "en" | "id",
  keywords: { name: string, count: number }[],
  questions: string[],
  answers: {
    question: string,
    answer: string,
    fillerCount: number,
    fillerWords: string[]
  }[]
}
```

### Process
```
Call AIMLAPI with prompt:
"You are an expert interview evaluator. Evaluate the candidate's answers
for a {role} position in {language}.

Questions & Answers:
{q1}: {a1}
{q2}: {a2}
...

Target skills: {keyword names}
Filler word counts per answer: {fillerCounts}

Score each answer 0-100 based on relevance, clarity, completeness, and
demonstration of target skills. Provide specific, actionable feedback per
question. Also analyze skill match (which skills demonstrated, which missing)
and overall delivery.

Return JSON with:
{
  overallScore: number (0-100),
  perQuestion: [{ question, score, feedback, tips: [string] }],
  skillMatch: { matched: [string], missing: [string] },
  delivery: { feedback: string }
}"
```

### Output
```typescript
{
  overallScore: number,
  perQuestion: {
    question: string,
    score: number,
    feedback: string,
    tips: string[]
  }[],
  skillMatch: {
    matched: string[],
    missing: string[]
  },
  delivery: { feedback: string },
  fillerWords?: {
    totalCount: number,
    breakdown: { word: string, count: number }[],
    feedback: string
  }
}
```

### Notes
- Filler word counts come from Speechmatics disfluency tags, NOT from the LLM
- The LLM receives filler counts to factor into its delivery/confidence assessment
- Filler word breakdown and feedback are computed client-side from the raw Speechmatics data

---

## Supporting Function: Speechmatics Token Agent

### Identity
- **Edge Function:** `speechmatics-token`
- **Secrets:** `SPEECHMATICS_API_KEY`
- **Transport:** Request/response REST

### Purpose
Mints short-lived JWTs for Speechmatics WebSocket authentication. The raw API key never leaves this function.

### Process
```
POST https://mp.speechmatics.com/v1/api_keys?type=rt
Authorization: Bearer <SPEECHMATICS_API_KEY>
Body: { ttl: 60 }

Response: { "token": "short-lived-jwt" }

Return to client: { token: "<jwt>" }
```

### Security
- Token TTL: 60 seconds
- Client fetches new token before each recording session
- No token caching on the client

---

## Supporting Function: Delete User Agent

### Identity
- **Edge Function:** `delete-user`
- **Required permissions:** `supabase_admin` (service role)
- **Transport:** Request/response REST

### Purpose
Deletes the authenticated user's account and all associated data.

### Process
```
1. Verify JWT from Authorization header
2. Delete user from auth.users (cascades to interview_history, notifications)
3. Return { success: true }
```

---

## Agent Orchestration Summary

| Step | Agent | Called From | Trigger | Data Produced |
|------|-------|-------------|---------|---------------|
| 1 | Market Job | Dashboard | "Start Target Research" click | `keywords[]` |
| 2 | Interviewer | Dashboard | Keyword confirmation | `questions[]` |
| 3 | Hint | InterviewRoom | Hint panel open | `suggestion` |
| 4 | Speechmatics Token | InterviewRoom | Mic button click | `token` (WS auth) |
| 5 | Evaluation | InterviewRoom | "Finish & Get Result" click | `evaluation` (all scores) |

All agents are stateless — the session state (`InterviewSessionContext`) tracks the pipeline progress client-side.
