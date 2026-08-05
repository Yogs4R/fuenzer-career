# Fuenzer Career | AI Interview Coach with Voice Practice

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Apache 2.0 License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Alpha-FF6B35)](https://github.com/Yogs4R/fuenzer-career)

---

> **Nail Your Next Interview** — Practise with voice-driven mock interviews, get AI-powered feedback, and track your progress over time. No account required.

Fuenzer Career is a **career intelligence and interview coaching platform** that helps job seekers project confidence during interviews. It combines **live market research**, **real-time voice transcription**, and **AI-powered evaluation** in a single, seamless experience.

Built with ❤️ for the [NativelyAI Hackathon](https://nativelyai.com).

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Live Market Research** | Scrapes LinkedIn & Indeed for trending skills in your target role |
| 🎤 **Voice Interview Practice** | Answer questions aloud with real-time transcription via Speechmatics |
| 🤖 **AI-Generated Questions** | Contextual questions based on your role and selected skills |
| 📊 **Instant AI Feedback** | Per-question scoring, skill-match analysis, and delivery insights |
| 🗣️ **Filler Word Detection** | Real-time tracking of "um", "uh", "like" and other hesitation patterns |
| 🌍 **Multi-Language** | English & Bahasa Indonesia with i18n-ready architecture |
| 🔐 **Guest-First** | No sign-up required — all features work instantly as a guest |
| 📈 **Progress Tracking** | Sign in with Google to save history and track improvement over time |

---

## 🚀 Live Demo

[![Open in NativelyAI](https://img.shields.io/badge/Open_in-NativelyAI-3FCF8E?logo=netlify&logoColor=white)](https://21v8y7jsmp02dfsevr4cz79bq.nativelyai.app)

---

## 📸 Screenshots

| Dashboard | Interview Room | Evaluation Report |
|-----------|---------------|-------------------|
| Hero with role combobox, trending skills carousel, agent workflow, testimonials, FAQ | Live transcription, audio visualizer, STAR method hints, per-question progress | Score gauge, per-question breakdown, skill match, filler word analysis |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React)                          │
│                                                                 │
│  ┌─────────┐  ┌──────────────┐  ┌──────────────────────────────┐│
│  │Dashboard│→ │InterviewRoom │→ │     EvaluationReport         ││
│  │  (/)    │  │  (/interview)│  │          (/report)            ││
│  └────┬────┘  └──────┬───────┘  └──────────────┬───────────────┘│
│       │              │                          │                │
│       └──────────────┴──────────────────────────┘                │
│                         │                                       │
│            ┌────────────┴────────────┐                          │
│            │ InterviewSessionContext │   ← localStorage-persisted│
│            │    (guest state)        │                          │
│            └────────────┬────────────┘                          │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              │ Supabase Client SDK │                            │
│              └──────────┬──────────┘                            │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│              Supabase (Edge Functions)                          │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ market-agent   │  │ interview-prep │  │ evaluation     │     │
│  │ (Bright Data +  │  │ (AIMLAPI LLM)  │  │ (AIMLAPI LLM)  │     │
│  │  AIMLAPI LLM)  │  │                │  │                │     │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘     │
│          │                   │                    │              │
│  ┌───────┴────────┐  ┌──────┴───────┐  ┌─────────┴────────┐    │
│  │speechmatics-   │  │ interview-   │  │ delete-user      │    │
│  │token           │  │ hint         │  │ (Supabase Auth)  │    │
│  └───────┬────────┘  └──────────────┘  └──────────────────┘    │
│          │                                                      │
└──────────┼──────────────────────────────────────────────────────┘
           │
┌──────────┴──────────────────────────────────────────────────────┐
│                     External Services                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Bright Data  │  │ AIMLAPI      │  │ Speechmatics         │  │
│  │ Web Unlocker │  │ (deepseek/   │  │ (Real-time STT via   │  │
│  │ (Scraping)   │  │ deepseek-v4- │  │  WebSocket)          │  │
│  │              │  │ flash)       │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Guest-first architecture** | Zero friction — user starts practicing immediately, no sign-up wall |
| **Edge Functions for all AI calls** | API keys never reach the browser; CORS + short-lived JWTs ensure security |
| **LocalStorage persistence** | Guest sessions survive page reloads without a database |
| **Single React Context** | `InterviewSessionContext` holds all state across the 3-page flow |
| **WebSocket for transcription** | Low-latency real-time captions vs. batch upload |
| **LLM as parser** | Pass raw scraped HTML text to the LLM instead of brittle HTML selectors |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript 5.9, Vite 7.2 |
| **Styling** | Tailwind CSS 4.1 with custom design tokens |
| **Routing** | react-router-dom v7 |
| **Backend** | Supabase Edge Functions (Deno) |
| **Auth** | Supabase Auth (Google OAuth) |
| **Database** | Supabase PostgreSQL (interview_history, notifications) |
| **Speech-to-Text** | Speechmatics Real-Time API (WebSocket) |
| **Web Scraping** | Bright Data Web Unlocker |
| **AI / LLM** | AIMLAPI (`deepseek/deepseek-v4-flash`, OpenAI-compatible) |
| **Analytics** | Google Analytics G-MKSPXBHK42 (opt-in via cookie consent) |

---

## 🧩 Project Structure

```
fuenzer-career/
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── *.svg                  # Logos & OG image
├── src/
│   ├── components/
│   │   ├── NavBar.tsx          # Responsive nav with auth, history, notifications, i18n
│   │   ├── CookieConsent.tsx   # GDPR-compliant Google Analytics opt-in
│   │   └── RoleCombobox.tsx    # Typeahead combobox for job roles (60+ presets)
│   ├── hooks/
│   │   └── usePageTitle.ts     # Dynamic document.title hook
│   ├── lib/
│   │   ├── supabaseClient.ts   # Supabase SDK singleton
│   │   ├── AuthContext.tsx      # Auth state management
│   │   ├── InterviewSession.tsx # Guest interview state (localStorage-persisted)
│   │   ├── audio.ts            # PCM 16 kHz audio capture pipeline
│   │   ├── speechmatics.ts     # WebSocket transcription + filler detection
│   │   └── sectionLink.ts      # Cross-route hash link handler
│   ├── pages/
│   │   ├── Dashboard.tsx       # Landing page (8 sections)
│   │   ├── InterviewRoom.tsx   # Voice interview with live transcription
│   │   ├── EvaluationReport.tsx# Score gauge, per-question breakdown, analysis
│   │   ├── Login.tsx           # Google OAuth + guest access
│   │   ├── SignUp.tsx          # Sign-up with Google
│   │   ├── Privacy.tsx         # Privacy policy
│   │   ├── Terms.tsx           # Terms of service
│   │   └── NotFound.tsx        # 404 page
│   ├── App.tsx                 # Root: BrowserRouter → providers → routes
│   ├── main.tsx                # Entry point
│   └── index.css               # Design tokens, animations, keyframes
├── docs/
│   ├── prd/                    # Product requirements & phase docs
│   ├── specs/                  # Detailed specifications
│   └── design-system/          # Design tokens and component specs
├── supabase/
│   └── functions/              # Edge Functions (deployed via Supabase CLI)
├── LICENSE                     # Apache 2.0
└── README.md                   # You are here
```

---

## 🚦 Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Landing page with hero, skills, agent workflow, testimonials, FAQ, footer |
| `/interview` | InterviewRoom | Voice interview with live transcription and AI hints |
| `/report` | EvaluationReport | Score gauge, per-question breakdown, skill match, filler analysis |
| `/login` | Login | Sign in with Google or continue as guest |
| `/signup` | Sign Up | Create account with Google |
| `/privacy` | Privacy Policy | Data handling, cookies, Google Analytics disclosure |
| `/terms` | Terms of Service | Usage terms, age requirements |
| `*` | 404 Not Found | Catch-all with navigation help |

---

## 🧪 Edge Functions

| Function | Purpose | Secrets | Transport |
|----------|---------|---------|-----------|
| `market-agent` | Scrapes LinkedIn & Indeed via Bright Data → LLM extracts keywords | `BRIGHT_DATA_API_TOKEN`, `AIMLAPI_API_KEY` | REST (invoked from Dashboard) |
| `interview-prep` | Generates contextual interview questions | `AIMLAPI_API_KEY` | REST (invoked from Dashboard) |
| `interview-hint` | Generates per-question STAR-method hints | `AIMLAPI_API_KEY` | REST (invoked from InterviewRoom) |
| `evaluation` | Scores answers, analyzes skill match & delivery | `AIMLAPI_API_KEY` | REST (invoked from InterviewRoom) |
| `speechmatics-token` | Mints short-lived JWTs for Speechmatics WebSocket | `SPEECHMATICS_API_KEY` | REST (invoked from InterviewRoom) |
| `delete-user` | Deletes authenticated user account | Supabase Admin | REST (invoked from NavBar) |

All functions are deployed with `verify_jwt: false` (guest-first) and include CORS handling.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase account (free tier)
- Bright Data account (Web Unlocker zone)
- AIMLAPI account with API key
- Speechmatics account with API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Yogs4R/fuenzer-career.git
cd fuenzer-career

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Secrets are managed through **Supabase Edge Function Secrets** (never `.env` files). Store these via the Supabase dashboard:

| Secret | Description |
|--------|-------------|
| `BRIGHT_DATA_API_TOKEN` | Bright Data Web Unlocker API token |
| `AIMLAPI_API_KEY` | AIMLAPI key for `deepseek/deepseek-v4-flash` |
| `SPEECHMATICS_API_KEY` | Speechmatics real-time API key |

The Supabase anon/publishable key is safe in client source (`src/lib/supabaseClient.ts`).

---

## 🔐 Authentication Model

```
                    ┌────────────────────┐
                    │  Supabase Auth     │
                    │  (Google OAuth)    │
                    └────────┬───────────┘
                             │
              ┌──────────────┴──────────────┐
              │  Guest mode                 │
              │  (default, no sign-up)      │
              └──────────────┬──────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │  LocalStorage session                   │
        │  (role, keywords, questions, answers,   │
        │   evaluation) persisted automatically   │
        └─────────────────────────────────────────┘
```

- **Guest users**: Full interview flow, evaluation, all features — no barrier
- **Authenticated users**: Same experience + history saved to Supabase DB, progress tracking, notifications

---

## 📊 Data Flow (Happy Path)

```
1. User enters role → Dashboard
2. Dashboard → market-agent → Bright Data scrapes LinkedIn & Indeed
3. market-agent → AIMLAPI LLM → extracts trending keywords
4. User selects keywords → Dashboard → interview-prep → AIMLAPI → questions
5. Navigate to InterviewRoom → Speechmatics token minted via Edge Function
6. User speaks → 16 kHz PCM streamed via WebSocket → live partial captions
7. On stop → final transcript + filler word counts stored per question
8. User finishes → evaluation Edge Function → AIMLAPI scores each answer
9. Navigate to EvaluationReport → full breakdown rendered
```

---

## 🌟 Key Design Patterns

- **Agentic Pipeline**: Three AI agents (Market → Interviewer → Evaluation) form a sequential pipeline, each consuming the previous output
- **State Machine**: Microphone uses 3-state machine (`idle` → `recording` → `processing`) with corresponding UI
- **Rate Limiting**: Cooldown between market research calls prevents API abuse
- **Graceful Degradation**: Mic denied → textarea fallback; API failure → cached skills; scraping failure → general skills only
- **Optimistic UI**: Loading overlays with elapsed-time indicators keep the user informed during async operations
- **Responsive Design**: All 8 landing page sections + nav + modals adapt from 375px to 1440px

---

## 🏆 Hackathon Awards Category

Fuenzer Career is designed for the **Best AI Integration** and **Best User Experience** categories:

- **Real AI, not mock**: Every piece of content is generated live by AI (skills, questions, hints, evaluation)
- **Voice as primary input**: Speechmatics WebSocket with real-time filler detection is the core interaction
- **No auth wall**: Demonstrates that AI-powered products can be accessible instantly
- **Agentic architecture**: Multiple specialized AI agents collaborating in a pipeline

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Yog** — Architecture, Full-Stack Development, AI Integration
- Built with [NativelyAI](https://nativelyai.com) Conductor Platform

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) — Backend, Auth, Edge Functions
- [Speechmatics](https://speechmatics.com) — Real-time speech-to-text
- [Bright Data](https://brightdata.com) — Web scraping infrastructure
- [AIMLAPI](https://aimlapi.com) — LLM inference
- [Tailwind CSS](https://tailwindcss.com) — Styling framework
- [NativelyAI](https://nativelyai.com) — Project conductor platform

---

<p align="center">
  Built with ❤️ for the NativelyAI Hackathon<br>
  <a href="https://21v8y7jsmp02dfsevr4cz79bq.nativelyai.app"><strong>Try Fuenzer Career →</strong></a>
</p>
