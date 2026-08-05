# Phase 3 | Fixes & Enhancements

## 1. Navbar Enhancements

### 1.1 Add Testimonials & FAQ to Desktop Nav
Add "Testimonials" and "FAQ" nav links beside the existing "Trending" and "How It Works" links in the desktop navigation bar. Move the entire nav link group to the center of the navbar (between the logo on the left and the icon controls on the right).

**Layout:**
```
[Logo]  ---  Trending | How It Works | Testimonials | FAQ  ---  [History] [Notif] [Lang] [Sign In] [Sign Up]
         ^ centered in remaining space ^
```

### 1.2 Notification Box Improvements
- Each notification item must show: **title**, **description**, and **date** (ISO date string).
- Items must be clickable — clicking expands/collapses long descriptions (show `text-sm` truncated to 2 lines by default, expand to full text on click).
- The close button (X) in the modal header must use `text-foreground` (black) instead of `text-muted-foreground` when not hovered. On hover it should use `hover:text-foreground` / `hover:bg-muted`.

**Updated mockNotifications:**
Add a `date` field to each item: `"2025-0{(i % 9) + 1}-{String((i * 2) % 28 + 1).padStart(2, "0")}"`.

### 1.3 History Items — Date
Date is already shown. Ensure it uses a clean format (already done).

### 1.4 Sign Up Button & Page
- Change the existing "Sign In" link to point to `/login`.
- Add a separate **"Sign Up"** button beside "Sign In" in the desktop nav.
- Design improvements:
  - **Sign In**: outlined/ghost style: `text-white/80 border border-white/30 hover:bg-white/10 hover:text-white`
  - **Sign Up**: solid filled style: `bg-accent hover:bg-accent/90 text-white shadow-sm`
- Both should be `px-4 py-1.5 rounded-md text-sm font-semibold`.
- Create a new `/signup` route with its own page (`SignUp.tsx`).
- The Sign Up page should be similar to Login but with:
  - Heading: "Create Your Account"
  - Subtitle: "Sign up to track your progress and get personalised feedback."
  - Fields: Email, Password, Confirm Password
  - Submit: "Create Account"
  - Google sign-up button: "Sign up with Google"
  - "Continue as Guest" button (same as login)
  - Bottom text: "Already have an account? Sign In" linking to `/login`.
- Update mobile nav panel footer: replace the single "Sign In / Sign Up" link with two buttons: **Sign In** (`/login`) and **Sign Up** (`/signup`), stacked vertically.

### 1.5 New Files
- `src/pages/SignUp.tsx` — new sign-up page
- Update `src/App.tsx` — add `/signup` route
- Update `src/components/NavBar.tsx` — all nav changes above

---

## 2. Landing Page Fixes

### 2.1 Workflow Arrow Alignment
In the "How It Works" / Agent Workflow section, the connecting arrows between agents are positioned in grid columns 2 and 4 but are not vertically centered with the agent cards. Fix by:

- Using absolute positioning for the arrows relative to the grid container, or
- Adjusting flex alignment on the arrow containers to `items-center` (remove the `pt-8` offset) and match their height to the row.

The arrows should sit at the vertical midpoint of the agent cards they connect.

### 2.2 Footer — Replace "Updates & History" with Legal Links
Replace the footer column currently labeled "Updates & History" (which shows "No notifications yet" and "No practice history") with:

**Title:** "Legal"
**Links:**
- "Privacy Policy" → `/privacy`
- "Terms of Service" → `/terms`

### 2.3 Privacy & Terms Pages
Create two new static pages:
- `src/pages/Privacy.tsx` — Privacy Policy page describing how user data is handled in this project.
- `src/pages/Terms.tsx` — Terms of Service page describing usage terms.

Both should follow the app's design system (consistent with the Dashboard page styling: `bg-background`, white cards with shadow, `font-heading` for headings, etc.).

Update `src/App.tsx` to add routes: `/privacy` and `/terms`.

---

## 3. Interview Page — Hint Box

### 3.1 Improved Hint Content
The STAR method hint box currently has generic placeholder text. Improve it by adding:

**Title change:** "Need a Hint?" → "STAR Method Hint"

**Content enhancements per STAR section:**

| Section | Text |
|---------|------|
| Situation | "Describe the context — the project, team, and what made it complex." |
| Task | "Explain your specific responsibility and what needed to be achieved." |
| Action | "Walk through the steps you took — tools, techniques, decisions." |
| Result | "Share the measurable outcome — faster load times, happier users, etc." |

**Add a mock suggestion text** below the STAR grid that simulates what the Interviewer Agent would suggest. This is placeholder content for future integration:

```
💡 Interviewer Agent Suggestion: For this question about an optimisation project, try framing your answer around a specific performance metric. For example: "I reduced page load time from 8s to 2s by implementing lazy loading and image compression."
```

Wrap this in a distinct visual style: `bg-accent/5 border border-accent/20 rounded-lg p-3 mt-3`.

---

## 4. Evaluation Report / Dashboard Page

### 4.1 Metric Bar Color & Animation
The metric bar (AnimatedBar component) tracks are currently `bg-muted` (gray) — change the track to `bg-blue-100` or `bg-accent/10` to give a blue tint instead of gray.
The fill bar (`.h-full`) already uses `bg-accent` (blue) — verify this is rendering correctly.
Add a subtle entrance animation: the bars should animate from 0 → score width when the page loads (this already exists via the `transition-all duration-1000 ease-out` — just ensure it's working).

### 4.2 Transcript Pagination
The transcript section currently only shows a mock snippet for "Question 1 of 10". Build a pagination system:

1. Create mock transcripts for all 10 interview questions (array of strings).
2. Show one transcript at a time with a **question selector** (either a row of numbered tabs/buttons 1–10 or prev/next buttons with a counter).
3. Each question's transcript should be a realistic mock answer snippet.
4. Keep the "Question X of 10" label.

**Mock transcript data** (example for all 10 questions):
```ts
const mockTranscripts = [
  '"I was working on a large e-commerce platform where we had severe performance issues..."',
  '"During my time at Company X, we had a critical deadline for a client launch..."',
  // ... up to 10
];
```

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/components/NavBar.tsx` | Add Testimonials/FAQ links, center nav, notification date + expand, close button color, sign up button, mobile panel updates |
| `src/pages/SignUp.tsx` | **New file** — sign-up page |
| `src/pages/Privacy.tsx` | **New file** — privacy policy page |
| `src/pages/Terms.tsx` | **New file** — terms of service page |
| `src/pages/Dashboard.tsx` | Fix workflow arrows alignment, update footer legal links |
| `src/pages/InterviewRoom.tsx` | Enhanced hint box with suggestion text |
| `src/pages/EvaluationReport.tsx` | Blue-tinted bar track, transcript pagination (10 questions) |
| `src/App.tsx` | Add routes: `/signup`, `/privacy`, `/terms` |
