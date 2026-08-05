# Landing Page Enhancement | Fuenzer Career

## Goal
Expand the Dashboard (`/`) landing page from its current 2 sections (Hero + Trending Skills) to a full 8-section page that informs, builds trust, and converts visitors into trying the interview simulation.

## Sections to Add (in order)

### 1. Hero Section (exists — refine)
Already built: headline, subtitle, combobox role input, "Start Target Research" CTA.
- **Keep as-is.** It works well.
- No changes needed here.

---

### 2. How It Works (NEW — 3-step visual guide)
A clean, icon-led walkthrough showing the user journey:

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 📋 (SVG: clipboard/list icon) | Choose a Target Role | Pick from trending roles like Frontend Developer, Data Scientist, or enter your own. |
| 2 | 🎤 (SVG: microphone icon) | Practice with Voice | Answer realistic interview questions using your microphone. No account needed. |
| 3 | 📊 (SVG: chart-bar icon) | Get AI-Powered Feedback | View your score, skill match analysis, and delivery insights instantly. |

**Design:**
- 3-column grid on desktop, single column on mobile.
- Each step is a card (`card` style from design system) with an SVG icon at top, bold title, and description text.
- Connect the 3 cards visually with a subtle dotted line or arrow between them (desktop only).

---

### 3. Trending Skills Section (exists — keep)
Already built. No changes.

---

### 4. Why Fuenzer Career (NEW — feature benefits grid)
A 3-column card grid selling the core value propositions:

| Feature | Icon | Description |
|---------|------|-------------|
| Market-Driven Research | 📈 (SVG: trending-up icon) | Know which skills employers are looking for in your target role before you walk into the interview. |
| Voice Interview Practice | 🎤 (SVG: microphone icon) | Practice aloud with realistic questions. Build muscle memory for your actual interview. |
| AI-Powered Insights | 🤖 (SVG: sparkles/brain icon) | Get instant feedback on your confidence, hesitation patterns, and skill alignment. |

**Design:**
- 3-column grid on desktop, single on mobile.
- Cards with icon, heading, paragraph, and an optional subtle accent top border.

---

### 5. What Users Say (NEW — testimonials)
3 testimonial cards with mock quotes:

1. **"I felt so much more confident after just three practice sessions. The feedback on my filler words was eye-opening."** — Sarah K., Fresh Graduate
2. **"The trending skills section helped me tailor my resume. Landed my first dev role in 3 weeks."** — Alex M., Frontend Developer
3. **"Finally, a tool that lets me practice speaking, not just typing answers. Game changer."** — Priya R., Product Manager

**Design:**
- Carousel-like row or static 3-column grid. Static grid is simpler and preferred.
- Each card: quote text in italics, author name + role below, subtle quote mark SVG decoration.

---

### 6. FAQ Section (NEW — accordion)
Expandable accordion with common questions:

| Question | Answer |
|----------|--------|
| **Is this free?** | Yes! Phase 1 is completely free. No account or credit card needed — just type a role and start practising. |
| **Do I need a microphone?** | For the best experience, yes. You can still explore the platform without one. |
| **How does the AI feedback work?** | Our AI analyses your speech patterns, filler word usage, and how well your answers match the target role's required skills. |
| **Can I save my progress?** | Account features and progress tracking are coming soon. For now, everything works instantly without sign-up. |

**Design:**
- Stacked vertically. Each item is a clickable row with a question on the left and a chevron/plus icon on the right.
- Clicking toggles open to reveal the answer below with a smooth height transition (200ms ease).
- Only one item open at a time (accordion pattern).

---

### 7. Ready to Nail Your Interview? (NEW — bottom CTA)
A compact repeat of the hero's combobox + CTA, so users who scrolled all the way down can act without scrolling back up.

**Design:**
- Centered section with a heading "Ready to Nail Your Interview?" and the same combobox + button component used in the hero.
- Slightly smaller/compact styling than the hero version.
- Background: subtle gradient or a light accent background to distinguish it from the FAQ above.

---

### 8. Footer (NEW — simple footer)
Minimal footer with:

```
Fuenzer Career — Nail Your Next Interview
© 2024 Fuenzer. All rights reserved.
```

- Dark background (`bg-primary text-on-primary`) or light muted background (`bg-muted text-muted-foreground`). Light muted is preferred to keep the page feeling open.
- Centered text.

---

## Visual / Design Guidelines

- **Colors**: Use existing CSS variables (`--color-primary`, `--color-accent`, `--color-background`, `--color-muted`, `--color-border`, `--color-foreground`, `--color-on-primary`). See `design-system/MASTER.md` for reference.
- **Typography**: `font-heading` (Lexend) for section titles, `font-sans` (Source Sans 3) for body text.
- **Icons**: Use inline SVGs from **Heroicons** or **Lucide** — never emojis as icons (per design system anti-patterns). Emojis in the table above are placeholders for the actual SVG icon chosen.
- **Spacing**: Section padding uses `py-16 sm:py-20` or `py-12 sm:py-16`. Maintain generous whitespace between sections (at least `mt-16`).
- **Cards**: Use `rounded-xl bg-white border border-border shadow-sm` with optional `hover:shadow-md` transitions.
- **Responsiveness**: All sections must work at 375px, 768px, 1024px, and 1440px. Grids collapse to single column on mobile.
- **Animations**: Subtle fade-in-up on scroll (use CSS `animate` or Intersection Observer — simple CSS approach preferred if possible).

## Acceptance Criteria
- [ ] Hero section unchanged
- [ ] "How It Works" section with 3 steps and icons
- [ ] "Why Fuenzer Career" section with 3 feature cards
- [ ] "What Users Say" section with 3 testimonial cards
- [ ] FAQ accordion section with 4 questions (smooth open/close)
- [ ] Bottom CTA section with combobox + button
- [ ] Footer section
- [ ] All sections use existing design system tokens (colors, fonts, spacing)
- [ ] Fully responsive (375px – 1440px)
- [ ] No emojis used as icons — all icons are SVGs
- [ ] Page scrolls smoothly between sections

## Out of Scope
- Animations beyond simple CSS transitions (no framer-motion or third-party animation libs)
- Real data fetching — all content is static/mock
- Backend integration of any kind

## Files to Modify
- `src/pages/Dashboard.tsx` — add new sections within the existing component

## Handoff Note
This document is exhaustive enough for the Builder to implement directly. The existing 2 sections remain untouched; the 6 new sections are inserted between them and the component's closing wrapper.
