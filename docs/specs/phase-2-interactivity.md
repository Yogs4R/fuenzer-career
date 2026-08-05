# Phase 2: Interactive Workflows & State Management

## Overview

Six targeted improvements to make the app feel like an active Agentic AI system: language toggle visual polish, combobox refinement, a loading transition on dashboard CTA, smooth hint toggle, microphone recording state machine, and report entry animations.

---

## 1. Language Toggle — Active State Pill

**File:** `src/components/NavBar.tsx`

### Current behaviour
The active language is indicated only by text opacity (`text-white` vs `text-white/40`). The visual difference is subtle.

### Required change
Replace the static border with an **active pill** that slides:

- The container is a `relative` rounded-md border in white/20.
- Inside, two `span` elements for "EN" and "ID" separated by `/`.
- A positioned `span` (absolute, inset-0) with a white background at 15% opacity (`bg-white/15`) slides left/right behind the active label.
  - `lang === "EN"` → `left-0` half-width
  - `lang === "ID"` → `left-1/2` half-width
- Use `transition-all duration-200` on the pill.
- Active text is `text-white`, inactive `text-white/40`.
- The `/` separator stays `text-white/20`.

No functional change — the `toggleLang` handler and `aria-pressed` remain the same.

---

## 2. Combobox — Verified Behaviour

**File:** `src/components/RoleCombobox.tsx`

The combobox already:
- Filters the dropdown list (`filtered`) as the user types via `value.toLowerCase()` matching.
- Accepts custom text (free input — `value` is a plain string, no validation).
- Shows "No matching roles — press Enter to use \"{value}\"" when filter yields zero results.

**No code change needed.** This section documents that the requirement is already met.

---

## 3. Dashboard — Loading Overlay on "Start Target Research"

**File:** `src/pages/Dashboard.tsx`

### State
```ts
const [isLoading, setIsLoading] = useState(false);
```

### Behaviour
1. User clicks "Start Target Research" on either the Hero or Bottom `RoleCombobox`.
2. `handleStart` calls `setIsLoading(true)` instead of immediately navigating.
3. A full-page overlay renders, blocking interaction:
   - Fixed position (`fixed inset-0 z-50`).
   - Background: translucent white backdrop (`bg-white/80 backdrop-blur-sm`).
   - Centered flex column.
   - Animated spinner SVG (rotating circle, `animate-spin`, accent color).
   - Text: "Agent is fetching live market data and preparing questions…"
   - Text style: `font-heading text-lg font-semibold text-foreground mt-6`.
   - A smaller sub-text: "This will only take a moment." in `text-muted-foreground text-sm mt-2`.
4. After **2000ms**, navigate to `/interview` and reset loading: `setIsLoading(false)`.
5. If the user typed/selected a role, that value should be passed along (via `navigate("/interview", { state: { role: heroRole || bottomRole } })`) so the InterviewRoom can display the role.

### Code changes
- Add `isLoading` state to `Dashboard`.
- Modify `handleStart` to set loading and schedule navigation.
- Add spinner overlay CSS animation in `index.css` if `animate-spin` is not already available (Tailwind v4 includes it).
- Render overlay conditionally at the top of the returned JSX.

---

## 4. Hint — Smooth Toggle with CSS Transition

**File:** `src/pages/InterviewRoom.tsx` + `src/index.css`

### Current behaviour
Hint is conditionally rendered (`{showHint && <div>…</div>}`) — it pops in/out instantly.

### Required change
Always mount the hint `<div>` but control visibility via CSS classes:

1. Convert the hint container to always-rendered with dynamic classes:

```tsx
<div
  ref={hintRef}
  role="dialog"
  aria-modal="true"
  aria-labelledby="hint-title"
  tabIndex={-1}
  className={`absolute left-0 top-full mt-2 w-full sm:w-96 bg-white rounded-xl border border-border shadow-2xl p-5 z-40 transition-all duration-200 ease-out ${
    showHint
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 -translate-y-1 pointer-events-none"
  }`}
>
```

2. Use `pointer-events-none` when hidden so it doesn't block clicks through it.
3. Add a custom keyframe for a subtle scale-in if desired, but opacity + translate-y is sufficient.
4. Remove the conditional rendering — the `<div>` is always in the DOM.

**No change to the hint content or behaviour.** The outside-click handler and Escape key handler remain the same.

---

## 5. Microphone — Recording State Machine

**File:** `src/pages/InterviewRoom.tsx` + `src/index.css`

### State
Replace `isRecording: boolean` with a three-state string:
```ts
type MicState = "idle" | "recording" | "processing";
const [micState, setMicState] = useState<MicState>("idle");
```

### Behaviour Flow

| Current State | Action | New State | Visual |
|---|---|---|---|
| `idle` | Click mic | `recording` | Pulsing red ring, "Recording… Tap to stop" |
| `recording` | Click mic | `processing` | Spinner, "Processing Audio…" |
| `processing` | (auto after 800ms) | `idle` | Enable "Finish & Get Result" button, mic resets |

### Detailed Specification

#### idle state
- Mic button: `bg-white border-2 border-border text-muted-foreground hover:border-accent hover:text-accent`
- Status text: `"Tap to start recording"` (muted)
- "Finish & Get Result" button: **disabled** (`opacity-50 cursor-not-allowed`, no hover effects)

#### recording state
- Mic button: `bg-destructive text-white shadow-xl animate-pulse-recording`
- Red indicator dot visible (already implemented)
- Status text: `"Recording… Tap to stop"` (destructive color)
- "Finish & Get Result" button: **disabled** (user hasn't finished their answer yet)

#### processing state
- Mic button shows a spinning SVG spinner icon (replace the mic icon temporarily)
- Status text: `"Processing Audio…"` (accent color)
- "Finish & Get Result" button: **disabled** (processing not done yet)
- After **800ms timeout**: automatically reset to `idle` mic appearance but **enable** the "Finish & Get Result" button.
- Store a boolean `hasRecording: true` so the Finish button stays enabled even once mic returns to idle.

### Additional State
```ts
const [hasRecording, setHasRecording] = useState(false);
```

Set `hasRecording = true` when processing ends. This persists the "ready" state so the user can click Finish. Reset on page unmount or new recording.

### "Finish & Get Result" button condition
```tsx
disabled={!hasRecording}
className={`... ${!hasRecording ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
```

### Tailwind animation additions (index.css)
```css
/* Processing spinner */
@keyframes spin-slow {
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 1s linear infinite;
}
```

---

## 6. Report — Entry Animations

**File:** `src/pages/EvaluationReport.tsx` + `src/index.css`

### Requirements
- Score ring: fade in + scale up on mount.
- Feedback cards (Skill Match, Confidence): slide up from below with staggered delays.
- All animations respect `prefers-reduced-motion`.

### CSS keyframes (index.css)
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

.animate-scale-in {
  animation: scaleIn 0.5s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up,
  .animate-scale-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

### Applied classes

| Element | Class | Animation Delay |
|---|---|---|
| Score ring wrapper (`<div className="flex justify-center ...">`) | `animate-scale-in` | `animation-delay: 0ms` |
| Skill Match card | `animate-fade-in-up` | `animation-delay: 150ms` |
| Confidence card | `animate-fade-in-up` | `animation-delay: 350ms` |
| "Try Another Role" button | `animate-fade-in-up` | `animation-delay: 550ms` |

Since Tailwind v4 doesn't natively support `animation-delay`, use inline `style={{ animationDelay: '150ms' }}` for each element.

---

## Files Changed Summary

| File | Change |
|---|---|
| `src/components/NavBar.tsx` | Active language pill with sliding background |
| `src/pages/Dashboard.tsx` | Loading overlay state + 2s delay + role state pass-through |
| `src/pages/InterviewRoom.tsx` | Mic state machine (idle/recording/processing), smooth hint toggle |
| `src/pages/EvaluationReport.tsx` | Entry animations on score ring + cards + button |
| `src/index.css` | New keyframes: fadeInUp, scaleIn, spin-slow; classes: animate-fade-in-up, animate-scale-in, animate-spin-slow |

## Acceptance Criteria

1. **Language Toggle** — Active language shows a white pill highlight that slides left/right smoothly.
2. **Combobox** — Typing filters the dropdown list; custom text not in the list is accepted via keyboard Enter.
3. **Dashboard Transition** — Clicking "Start Target Research" shows a full-screen loading overlay with spinner and "Agent is fetching…" text for 2 seconds, then navigates to `/interview`.
4. **Hint Smooth Toggle** — The hint modal fades/slides in/out with `pointer-events-none` when hidden; no layout shift.
5. **Microphone State Machine** — Three states work: idle → recording (pulsing red) → processing (spinner, 800ms) → idle with Finish button enabled. Finish button is disabled until a recording has been processed.
6. **Report Entry Animations** — Score ring scales in, cards slide up with staggered delays on mount. Animations are disabled when `prefers-reduced-motion: reduce`.
