# Phase 4 | Bug Fixes: Navbar, Landing Page, Evaluation Report

Scope: fix the following issues in the existing app. All are UI/layout/behavior bugs, no new features.

## 1. Navbar — `src/components/NavBar.tsx`

### 1.1 Desktop nav links overlap the History button and don't collapse to hamburger cleanly
Current behavior:
- Desktop links container: `hidden sm:flex items-center gap-3 lg:gap-5 mr-auto ml-4 lg:ml-8 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:m-0`
- Right-side controls container: `flex items-center gap-1 sm:gap-2 ... shrink-0 lg:ml-auto`
- Hamburger is `sm:hidden`; desktop links are `hidden sm:flex`.

Reported bugs:
- Between `sm` (640px) and `lg` (1024px) the nav links collide with / sit under the History icon ("navbar button is override with history button").
- When shrinking the window, links do not immediately switch to the hamburger — the breakpoint is wrong.
- Nav links are not centered in the space between "Fuenzer Career" and the History button.

Required fix:
- Make the desktop nav links truly centered between the logo and the right icon group at every desktop width (e.g. `flex-1` spacer + centered links + right group, or absolute centering applied at all `sm+` widths — not only `lg`).
- Guarantee the right controls (History / Notification / Language / Sign In / Sign Up) always sit at the far right and never overlap the links at any width.
- Align the collapse breakpoint: the links must switch to the hamburger as soon as they would collide, i.e. the hamburger must appear at the same width the links disappear. Verify no intermediate state where both are visible or they overlap.

### 1.2 History modal — date color contrast
History item date: `<p className="text-xs text-muted-foreground">{item.date}</p>` inside a `bg-muted/50` row.
- Current `text-muted-foreground` does not contrast enough with the box.
- Change to a dark gray or black (e.g. `text-gray-600` or `text-foreground`) so it clearly contrasts with the `bg-muted/50` box.

### 1.3 Notifications modal — description color contrast
Notification description: `<p className="text-sm text-muted-foreground mt-1 ...">{item.description}</p>` inside a `bg-muted/50` row.
- Same contrast problem as the history date — change to a dark gray or black that contrasts with the box.

### 1.4 Mobile — History and Notification buttons not on the right
On mobile (below `sm`) the right-side controls sit directly beside the logo instead of at the far right of the navbar.
- Add `ml-auto` to the right-side controls container (or `justify-between` on the navbar row) so History and Notification buttons are pushed to the right edge on mobile.

## 2. Landing page — `src/pages/Dashboard.tsx`

### 2.1 "How It Works" arrows misaligned ("falling")
Current markup: grid `grid-cols-1 md:grid-cols-5 gap-4 items-center relative`; agent cards at `md:col-start-1/3/5`; arrow divs at `md:col-start-2` and `md:col-start-4` with `justify-center items-center self-center`.
- The arrows are not vertically centered with the agent cards — they appear too low / "fallen".
- Fix so each arrow sits at the vertical midpoint of the cards it connects. Recommended: make the arrow containers stretch the full row height (`self-stretch`) and center the SVG with `flex items-center justify-center`, or absolutely position each arrow at the row's vertical center (`top-1/2 -translate-y-1/2`) with correct left/right offsets. Verify at all desktop widths.

### 2.2 Nav anchor links break on /privacy and /terms
Reported: on `/privacy` or `/terms`, clicking "Trending" produces `/privacy#trending` and never scrolls the landing page.
Cause: bare hash links `<a href="#trending">` used in:
- `NavBar.tsx` desktop links (`#trending`, `#how-it-works`, `#testimonials`, `#faq`)
- `NavBar.tsx` mobile slide-in panel links (same 4)
- `Dashboard.tsx` footer "Quick Links" (same 4)

Required fix: change all of these to root-relative hashes so they navigate to the landing page first, then scroll: `/#trending`, `/#how-it-works`, `/#testimonials`, `/#faq`. Ensure the scroll behavior works from other routes (if a manual scroll handler is needed after navigation, add it).

## 3. Evaluation Report — `src/pages/EvaluationReport.tsx`

### 3.1 Score bar is blue, must be gray
`AnimatedBar`: track `bg-accent/10`, fill `bg-accent` — renders blue.
- Change the track to a neutral light gray (e.g. `bg-gray-200` / `bg-muted`).
- Change the fill to a gray with clear contrast against the track (e.g. `bg-gray-500` or `bg-gray-600`).
- Keep the entrance animation (`transition-all duration-1000 ease-out` from width 0 → score).
- Note: the score number text (`text-accent`) and circular gauge are NOT part of this complaint — leave them unless they render blue where gray was expected; the user specifically pointed at the score bar.

## 4. Loading screen — remove ALL `\u` escapes

In `src/pages/Dashboard.tsx`, the loading overlay text contains:
`Agent is fetching live market data and preparing questions\u2026`
- In JSX text this renders literally as `\u2026` — replace with the real ellipsis character `…`.

Additionally: search the whole `src/` tree for any other `\uXXXX` escape sequences and replace them with the actual UTF-8 characters (e.g. `\u2014` → `—`, `\u2026` → `…`, `\u2013` → `–`). The user requirement: no `\u` should appear anywhere in the rendered output. (Escape sequences inside JS string literals currently render correctly but should still be replaced with literal characters for consistency and safety.)

## Files changed
| File | Change |
|------|--------|
| `src/components/NavBar.tsx` | Nav centering + breakpoint fix, right-controls `ml-auto` on mobile, history date + notification description contrast colors, root-relative hash links |
| `src/pages/Dashboard.tsx` | How-It-Works arrow vertical centering, footer Quick Links root-relative hashes, loading text `…` (no `\u`), any other `\u` → literal chars |
| `src/pages/EvaluationReport.tsx` | AnimatedBar track + fill gray |
| other `src/**` files | Replace any remaining `\uXXXX` with literal characters |
