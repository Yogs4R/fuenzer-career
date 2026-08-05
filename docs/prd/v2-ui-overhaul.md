# Fuenzer Career | v2 UI Overhaul

## Description
A comprehensive frontend refresh of the Fuenzer Career app covering the navigation bar, landing page, interview room, evaluation dashboard, and a new placeholder login page. The goal is to elevate the UI to a more professional, polished experience that feels like a real career platform.

## Goals
- Modernize the NavBar with navigation menu, history, notifications, multilingual support, and auth entry point
- Improve the landing page with LinkedIn-style trending carousel, agent workflow visualization, testimonials carousel, and a proper company footer
- Upgrade InterviewRoom with multi-question flow, recording timer, microphone audio visualizer, and wider STAR hint layout
- Redesign EvaluationReport as a polished company-style dashboard
- Add a placeholder /login route

## User Stories
- As a visitor, I want a professional NavBar with clear navigation, so I can access all parts of the app easily.
- As a job seeker, I want to see trending skills in an auto-scrolling carousel, so I know what's in demand.
- As a user, I want to understand the agent workflow (market → interview → evaluation), so I trust the process.
- As a user, I want to see a timer and audio visualizer while recording, so I know my mic is active and how long I've been speaking.
- As a user, I want to answer multiple questions in sequence during an interview session.
- As a user, I want a dashboard-style evaluation report that is visually organized and easy to scan.
- As a returning user, I want to sign in via a /login page.

## User Flows

### NavBar
1. User sees the NavBar with logo, hamburger menu (mobile), language dropdown (EN | ID | JP | DE | FR), history icon, notification icon, and Sign In / Sign Up button.
2. Clicking hamburger toggles a slide-in nav menu with smooth animation.
3. Clicking language opens a dropdown; selecting a language changes the UI locale (UI labels only — i18n ready, actual translations deferred).
4. Clicking Sign In / Sign Up navigates to `/login`.
5. History/notification icons show a tooltip or small badge count (placeholder).

### Dashboard — Trending Skills
1. Section displays trending skills cards in a horizontally auto-scrolling carousel (LinkedIn-style).
2. Scroll pauses briefly on hover (CSS `animation-play-state: paused`).
3. Cards show skill name, growth percentage, and an up-trend icon.

### Dashboard — Agent Workflow
1. Three agent cards displayed in a horizontal flow: Market Job Agent → Interviewer Agent → Evaluation Agent.
2. Connecting arrows or a dotted path shows the sequential pipeline.
3. Each card has an icon, title, and short description.

### Dashboard — Testimonials
1. Cards auto-scroll in a carousel with a fade/slide transition.
2. Each card shows reviewer avatar, name, role, and quote.

### Dashboard — Footer
1. Company-style footer with: logo, quick links, GitHub repo link (opens new tab), contact email link, copyright.

### Interview Room — Question Flow
1. User sees a question counter: Question 1 of 10.
2. STAR method hint box displayed wider than before (flex-grow / wider max-width).
3. User clicks mic button to start recording — a timer begins counting up (mm:ss).
4. An audio visualizer (real Web Audio API bars) animates beneath/near the button.
5. No red dot indicator on the recording button.
6. User clicks stop → answer is saved → next question loads automatically or via next button.
7. After the 10th question, user is taken to the evaluation.

### Evaluation Dashboard
1. Score displayed prominently at top with a circular gauge or large numeral.
2. Breakdown cards: Communication, Clarity, Relevance, Completeness (or similar metrics).
3. Transcript review section.
4. Overall feedback / recommendation.

## Design & UX
- Tailwind CSS v4 with the existing design tokens (`@theme` tokens in `index.css`).
- Fonts: Lexend (headings), Source Sans 3 (body) — already set up.
- No new external component libraries — use custom Tailwind components.
- Animations: CSS transitions and keyframes (smooth slide-in nav, carousel scroll, fade-in-up report entries).
- Mobile-responsive: NavBar collapses to hamburger, carousels become swipeable.

## Integrations
- **Supabase Auth**: used for the /login page. Credentials handled by the `@supabase/supabase-js` client with ANON_KEY (PUBLISHABLE, safe in client source). Login flow uses email/password auth.
- **No other third-party integrations** at this stage. The audio visualizer uses the browser's native `getUserMedia` + `AnalyserNode` (Web Audio API) — no external service.

## Components to Modify

| File | Changes |
|------|---------|
| `src/components/NavBar.tsx` | Add hamburger menu with slide animation, history icon, notification icon, language dropdown (EN/ID/JP/DE/FR), auth button → /login |
| `src/pages/Dashboard.tsx` | Trending carousel (auto-scroll), agent workflow section, testimonials carousel, CTA scrolls to hero, company footer |
| `src/pages/InterviewRoom.tsx` | 10 questions array, question index state, wider STAR hint, remove red dot on mic, recording timer, Web Audio API visualizer, next-question flow |
| `src/pages/EvaluationReport.tsx` | Dashboard-style report with score gauge, metric cards, transcript section, overall feedback |
| `src/pages/Login.tsx` | NEW — placeholder login page with email/password form (no real auth logic yet) |
| `src/App.tsx` | Add `/login` route, import Login page |

## Acceptance Criteria
- NavBar collapses to hamburger on mobile; hamburger opens/closes a slide-in menu with smooth animation.
- Language dropdown shows EN, ID, JP, DE, FR; selecting one changes visible locale label (i18n structure ready).
- Trending skills cards auto-scroll horizontally with pause on hover.
- Agent workflow section shows 3 agent cards with connecting arrows.
- Testimonials carousel auto-rotates.
- Footer contains GitHub link and email contact.
- Interview Room shows question counter (X of 10), timer while recording, audio visualizer bars from real mic input, and wider STAR hint.
- Recording button has no red dot indicator.
- Evaluation Report displays score, metric cards, transcript, and feedback in a dashboard layout.
- `/login` route renders a placeholder page.

## Out of Scope
- Actual authentication logic (login, signup, session management) — placeholder only.
- Actual i18n translation of page content — UI structure and locale switching only.
- Backend API changes — the interview question data will be hardcoded for now.
- Real data fetching for trending skills, testimonials — static/demo cards.
- History and notification backend integration — UI shells only.
- Speech-to-text or evaluation backend integration.

## Open Questions
- What specific metrics should the evaluation dashboard show? (Will use placeholder metrics: Communication, Clarity, Relevance, Completeness, Confidence.)

## Implementation Notes
- Audio visualizer: use `navigator.mediaDevices.getUserMedia` → `AudioContext` → `AnalyserNode` → `requestAnimationFrame` loop drawing `<canvas>` bars.
- Carousels: pure CSS `overflow-x: auto` + `scroll-snap` for touch support; `@keyframes` auto-scroll with `animation-play-state: paused` on hover for trending skills.
- New `/login` page file: `src/pages/Login.tsx`.
- Update `src/App.tsx` to add the route.
