# Fuenzer Career | Product Requirements Document

## Description
Fuenzer Career is a career intelligence and interview coaching platform that helps fresh graduates and professionals project confidence during recruitment. Phase 1 delivers a 3-page frontend MVP with mock data, establishing the core UI and navigation.

## Goals
- Establish a professional, LinkedIn-inspired visual identity (deep blue, white, light gray).
- Deliver a working 3-page app with seamless React Router navigation.
- Populate all pages with realistic mock data — no blank states.
- Validate the user flow: Dashboard → Interview Room → Evaluation Report → back to Dashboard.

## User Stories
- As a user, I want to see a professional dashboard so I feel confident using the platform.
- As a user, I want to enter my target job role and navigate to an interview simulation.
- As a user, I want to see a mock interview question with a microphone button (idle/recording states).
- As a user, I want to view a mock evaluation report with a score and feedback cards.
- As a user, I want to navigate back to the dashboard to try another role.

## User Flows

### Happy Path: Dashboard → Interview → Report → Back
1. User lands on **Dashboard** (`/`).
2. Sees hero headline "Nail Your Next Interview".
3. Types a target role (e.g. "Frontend Developer") and clicks **"Start Target Research"**.
4. App navigates to **Interview Room** (`/interview`).
5. A mock question is displayed: "Tell me about a time you optimized a complex web application."
6. User can click the **Microphone** button (toggles idle ↔ recording visual state).
7. User clicks **"Finish & Get Result"**.
8. App navigates to **Evaluation Report** (`/report`).
9. Report shows: overall score (85/100), "Skill Match" card, "Confidence & Delivery" card.
10. User clicks **"Try Another Role"** → returns to Dashboard.

## Design & UX
- **Color palette**: Deep professional blue (`#0A66C2` LinkedIn blue), crisp white, light gray (`#F3F5F7`).
- **Typography**: Clean, modern sans-serif (system font stack).
- **Layout**: Centered card-based layout, generous whitespace, subtle shadows.
- **Navigation bar**: Top bar with "Fuenzer Career" logo text (bold, styled).
- **Microphone button**: Circular button with two visual states — idle (gray/muted) and recording (red/pulsing).

### Page 1 — Dashboard (`/`)
- Top nav bar with app name.
- Hero section with headline.
- Input field + CTA button.
- "Trending Skills" section with mock tag chips.

### Page 2 — Interview Room (`/interview`)
- Central card showing the interview question.
- Microphone button at bottom with toggle state.
- "Finish & Get Result" button below.

### Page 3 — Evaluation Report (`/report`)
- Score display (85/100) as a prominent number or ring.
- "Skill Match" card (mock comparison data).
- "Confidence & Delivery" card (mock hesitation data: filler words, pauses).
- "Try Another Role" CTA button.

## Integrations
- **None for Phase 1.** This is a pure frontend MVP. No third-party services, no Supabase backend. Integrations (Speech-to-text, AI analysis) will be introduced in Phases 2 and 3.

## Acceptance Criteria
- [ ] App renders three routes: `/`, `/interview`, `/report`.
- [ ] Navigation between all three pages works (no dead ends, no 404s).
- [ ] Dashboard shows nav bar, hero, input + button, trending skills tags (mock).
- [ ] Clicking "Start Target Research" navigates to `/interview`.
- [ ] Interview page shows a mock question and microphone button.
- [ ] Microphone button toggles between idle and recording visual states.
- [ ] Clicking "Finish & Get Result" navigates to `/report`.
- [ ] Report page shows score (85/100), Skill Match card, Confidence & Delivery card.
- [ ] Clicking "Try Another Role" navigates back to `/`.
- [ ] Visual theme matches LinkedIn-inspired professional color palette.
- [ ] No page is blank — all have mock/placeholder content.

## Out of Scope (Phase 1)
- Real voice recording / speech-to-text.
- AI-powered analysis or hesitation detection.
- Real-time job data scraping.
- User authentication or accounts.
- Backend or database of any kind.
- Supabase integration.

## Open Questions
- None — scope is fully defined for Phase 1.

## Implementation Notes
- **Framework**: Vite + React (TypeScript).
- **Routing**: `react-router-dom` v7 with `createBrowserRouter` or straight `<BrowserRouter>`.
- **Styling**: Plain CSS or Tailwind CSS. Use the project's existing setup (`src/index.css`).
- **State**: Local React state (`useState`) for mock data and microphone toggle. No global state needed.
- **No API calls**: All data is hardcoded mock data within components.
