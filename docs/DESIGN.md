# Fuenzer Career | Design System & UX Guidelines

## Brand Identity

Fuenzer Career is a **career intelligence and interview coaching platform** targeting fresh graduates and professionals. The visual identity is inspired by LinkedIn — professional, trustworthy, and authoritative — with a modern card-based layout, generous whitespace, and subtle shadows.

---

## Color Palette

| Role | Hex | OKLCH | CSS Variable | Usage |
|------|-----|-------|-------------|-------|
| Primary | `#0F172A` | `oklch(0.2077 0.0398 265.75)` | `--color-primary` | Nav bar, hero backgrounds, primary buttons |
| On Primary | `#FFFFFF` | `oklch(1.0 0 0)` | `--color-on-primary` | Text on primary backgrounds |
| Secondary | `#334155` | `oklch(0.3717 0.0392 257.29)` | `--color-secondary` | Secondary background elements |
| Accent/CTA | `#0369A1` | `oklch(0.52 0.17 255)` | `--color-accent` | Buttons, links, interactive elements |
| Background | `#F8FAFC` | `oklch(0.9842 0.0034 247.86)` | `--color-background` | Page backgrounds |
| Foreground | `#020617` | `oklch(0.1288 0.0406 264.7)` | `--color-foreground` | Primary text |
| Muted | `#E8ECF1` | `oklch(0.9415 0.008 253.85)` | `--color-muted` | Secondary backgrounds, disabled states |
| Border | `#E2E8F0` | `oklch(0.9288 0.0126 255.51)` | `--color-border` | Borders, dividers, cards |
| Destructive | `#DC2626` | `oklch(0.5771 0.2152 27.33)` | `--color-destructive` | Errors, recording state, delete actions |
| Ring | `#0369A1` | `oklch(0.52 0.17 255)` | `--color-ring` | Focus outlines |

### Color Usage Rules

- **Text contrast**: All text must maintain 4.5:1 minimum contrast ratio against its background
- **Muted foreground**: Use `text-muted-foreground` for secondary information, captions, timestamps
- **Accent for interactivity**: All links, buttons, and clickable elements use `text-accent` or `bg-accent`
- **Destructive sparingly**: Only for recording states, error banners, and destructive actions (delete account)

---

## Typography

### Font Stack

| Role | Font | Weight Range | CSS Class |
|------|------|-------------|-----------|
| Headings | **Lexend** | 300-700 | `font-heading` |
| Body | **Source Sans 3** | 300-700 | `font-sans` |

### Import
```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
```

### Type Scale

| Element | Size | Weight | Class |
|---------|------|--------|-------|
| Hero H1 | `text-4xl sm:text-5xl lg:text-6xl` | `font-bold` | `font-heading` |
| Section H2 | `text-2xl sm:text-3xl` | `font-bold` | `font-heading` |
| Card title | `text-lg` | `font-semibold` | `font-heading` |
| Body text | `text-sm sm:text-base` | `font-normal` | `font-sans` |
| Caption | `text-xs` | `font-medium` | `font-sans` |
| Label / badge | `text-xs` | `font-semibold` | `font-sans` |

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px / 0.25rem | Tight gaps, icon spacing |
| `--space-sm` | 8px / 0.5rem | Inline spacing, small gaps |
| `--space-md` | 16px / 1rem | Standard padding (cards, sections) |
| `--space-lg` | 24px / 1.5rem | Card padding, section spacing |
| `--space-xl` | 32px / 2rem | Large gaps, hero padding |
| `--space-2xl` | 48px / 3rem | Section margins, footer gaps |
| `--space-3xl` | 64px / 4rem | Hero padding, large section spacing |

Section padding: `py-16 sm:py-20` on desktop, `py-12` on mobile.

---

## Shadows

| Level | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift for cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Standard card shadow |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Featured cards, hero images |

Cards use `shadow-sm` with `hover:shadow-md` transition.

---

## Border Radius

| Element | Radius | Class |
|---------|--------|-------|
| Cards | 12px (xl) | `rounded-xl` |
| Buttons | 8px (lg) | `rounded-lg` |
| Inputs | 8px (lg) | `rounded-lg` |
| Modals | 16px (2xl) | `rounded-2xl` |
| Chips/badges | 9999px (full) | `rounded-full` |
| Nav profile | 9999px (full) | `rounded-full` |

---

## Component Architecture

### Buttons

```css
/* Primary */
bg-primary text-white font-semibold rounded-lg px-6 py-3
hover:bg-primary/90 hover:-translate-y-0.5
transition-all duration-200

/* Accent (CTA) */
bg-accent text-white font-semibold rounded-lg px-6 py-3 shadow-md
hover:bg-accent/90 hover:-translate-y-0.5
transition-all duration-200

/* Ghost/Outline */
border-2 border-border text-muted-foreground font-semibold rounded-lg px-6 py-3
hover:text-foreground hover:border-accent hover:-translate-y-0.5
transition-all duration-200

/* Disabled */
opacity-50 cursor-not-allowed
```

### Cards

```css
bg-white rounded-xl border border-border shadow-sm p-6
transition-all duration-200 hover:shadow-md hover:-translate-y-1
```

### Inputs

```css
w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground
placeholder-muted-foreground text-base
focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
transition-all duration-200
```

### Modals

```css
/* Overlay */
fixed inset-0 z-50 bg-black/30 backdrop-blur-sm

/* Content */
bg-white rounded-2xl shadow-2xl border border-border overflow-hidden
max-w-md w-full
```

---

## Animations

### Entry Animations (EvaluationReport)

| Element | Animation | Delay |
|---------|-----------|-------|
| Score ring | `animate-scale-in` | 0ms |
| Skill Match card | `animate-fade-in-up` | 100ms |
| Transcript card | `animate-fade-in-up` | 350ms |
| Recommendations card | `animate-fade-in-up` | 450ms |
| Per-question cards | `animate-fade-in-up` | 200ms + index * 80ms |
| CTA button | `animate-fade-in-up` | 550ms |

### Keyframes

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes pulse-recording {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.6); }
  50%      { box-shadow: 0 0 0 20px rgba(220,38,38,0); }
}

@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

@keyframes scrollCarousel {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes slideInNav {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up,
  .animate-scale-in,
  .animate-slide-in-nav,
  .animate-carousel {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

---

## Page Layouts

### Dashboard (Landing Page)

8 sections in order:
1. **Hero** — Full-width gradient bg (`bg-gradient-to-br from-primary via-primary to-secondary`), centered content
2. **Trending Skills** — Max-width container, auto-scrolling carousel + search/filter/sort controls
3. **How It Works** — Muted bg (`bg-muted/50`), 3-column grid of agent cards with connecting elements
4. **Why Fuenzer Career** — Max-width container, 3-column feature card grid
5. **Testimonials** — Muted bg, carousel with dot indicators + prev/next buttons
6. **FAQ** — Narrow container (`max-w-2xl`), accordion pattern
7. **Bottom CTA** — Full-width gradient bg, centered heading + scroll-to-hero button
8. **Footer** — Muted bg, 4-column grid (brand, quick links, legal, connect)

### Interview Room

- Top status bar with question counter
- Single centered card with question text
- Live transcription panels (partial + final)
- Canvas element for audio visualizer
- Microphone button with 3-state interaction
- Action buttons: Skip, Retry, Next/Finalize
- Collapsible STAR method hint panel with AI-generated suggestions

### Evaluation Report

- **Score gauge** — SVG circular gauge with gradient, animated dashoffset
- **Summary** — Score label + contextual feedback + achievement badges
- **Skill Match** — Two-column layout (demonstrated vs. focus areas)
- **Per-Question Breakdown** — 2-column grid of scored cards with animated bars
- **Transcript** — Paginated question viewer with filler word display
- **Recommendations** — Skill match insight, delivery feedback, filler word analysis with bar charts, actionable tips
- **CTA** — "Try Another Role" button

---

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|-----------|-------|----------|
| Default | 375px+ | Single column, hamburger nav, stacked layouts |
| `sm` | 640px+ | Nav links visible, 2-column grids possible |
| `md` | 768px+ | 2-3 column grids, language selector visible |
| `lg` | 1024px+ | Full desktop layout, 3-5 column grids, max-width containers |
| `xl` | 1440px+ | Maximum content width, comfortable whitespace |

---

## Interactive States

| State | Transition | Duration |
|-------|-----------|----------|
| `hover` | `background-color`, `color`, `border-color`, `transform: translateY(-0.5px)` | 200ms ease |
| `focus-visible` | `outline-2 outline-offset-2 outline-ring` | Instant |
| `active` | `transform: scale(0.97)` (`.btn-active` class) | 150ms ease-out |
| `disabled` | `opacity-50 cursor-not-allowed` | 200ms |
| Dropdown open | `rotate-180` on chevron | 200ms |
| Accordion open | `max-h-0` → `max-h-96` | 200ms ease-in-out |

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis as icons** — Use SVG icons (Heroicons/Lucide/Phosphor for UI, `react-icons/si` for brand logos)
- ❌ **Brand icons from `lucide-react`** — Lucide no longer ships brand icons. Use `react-icons/si` for GitHub, LinkedIn, etc.
- ❌ **Missing `cursor:pointer`** — All clickable elements must have cursor pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift surrounding layout
- ❌ **Low contrast text** — Always maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms) for hover/focus/visibility changes
- ❌ **Invisible focus states** — Keyboard focus outlines must always be visible
- ❌ **Hardcoded `\u` escape sequences** — Use real Unicode characters in JSX

---

## Page Titles

All pages use the `usePageTitle` hook to set dynamic `<title>`:

| Route | Title |
|-------|-------|
| `/` | `Fuenzer Career \| AI Interview Coach` |
| `/interview` | `Fuenzer Career \| Interview Room` |
| `/report` | `Fuenzer Career \| Evaluation Report` |
| `/login` | `Fuenzer Career \| Sign In` |
| `/signup` | `Fuenzer Career \| Sign Up` |
| `/privacy` | `Fuenzer Career \| Privacy` |
| `/terms` | `Fuenzer Career \| Terms` |
| 404 | `Fuenzer Career \| Page Not Found` |

---

## Loading States

| Location | Pattern |
|----------|---------|
| Dashboard → Start Research | Full-screen overlay with spinner + "Agent is fetching live market data…" + elapsed time message |
| Dashboard → Generate Questions | Full-screen overlay with spinner + "Agent is generating interview questions…" |
| Interview → Hint | Inline spinner: "Generating personalised hint..." |
| Interview → Evaluation | Full-screen overlay with spinner + "Analysing your answers…" |
| History modal (authenticated) | Inline spinner centered in modal |
| Notifications modal (authenticated) | Inline spinner centered in modal |
| Historical report load | Full-page centered spinner |

---

## Error States

| Location | Pattern |
|----------|---------|
| Market research failure | Amber banner: "Live data temporarily unavailable. Using general skills." + fallback skills |
| Prep question failure | Red banner in keyword selection panel with "Try Again" button |
| Hint generation failure | Inline error in hint panel with "Retry" link |
| Mic denied | Amber banner: "Microphone access was denied. Type your answer instead." + textarea |
| Mic not found | Amber banner: "No microphone found. Type your answer instead." + textarea |
| Evaluation failure | Error state → redirect to dashboard with error message |
| Historical report not found | Dedicated error page with "Go to Dashboard" CTA |
| Network offline | Loading overlay stays visible with elapsed time; user can wait or navigate away |
