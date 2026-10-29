# The First Time Iko Broke His Arm

An eternal, no-buttons stopwatch (HTML + CSS + JS, no build, no libraries) that counts days, hours, minutes and seconds since a fixed moment, with Iko's story, his original Bangla statement, and a photograph.

## Files
- `index.html` – structure and content
- `style.css` – design (black / crimson / silver), responsive layout
- `script.js` – timing logic, live Bangladesh clock, photo fallback, light particles
- `photo-fallback.jpg` – optimised copy of the photo, used only if the GitHub raw image fails

## Deploy on GitHub Pages
1. Put all files in the repository root (e.g. `AlphaStopwatch/The-First-Time-Iko-Broke-His-Arm`).
2. Make sure the original photo `IMG_20261029_211619.jpg` is in the same repo on the `main` branch (the page loads it from `raw.githubusercontent.com`).
3. Settings → Pages → Deploy from branch → `main` / root. Open the published URL.

## How the timing works
- The start is hard-coded: `2026-10-29T13:30:00+06:00` (= `2026-10-29T07:30:00Z` = `1793259000000` ms).
- On every update the page computes `now − start` from scratch. There is no `seconds++` counter, so throttled or suspended tabs cannot drift, and refreshing, reopening or opening on another device never changes the start.
- Elapsed time is held in `BigInt`, so the day count has no fixed digit limit. The number is formatted with separators and shrinks to fit its box only when needed.
- Updates are aligned to wall-clock seconds, paused while the tab is hidden, and recalculated immediately when it becomes visible again.
- Before the start moment, a "not begun yet" notice is shown instead of negative numbers.
- `localStorage` is not used.

## Honest limits
- A static page only runs while it is open; when closed or the device is off it catches up on the next visit.
- Time comes from each visitor's device clock. A wrong clock shifts the displayed time by the same amount; there is no server time check.
- The 1:30 PM start is a designated stopwatch moment, not a medically verified injury time.

## Fonts
Bengali text prefers Noto Serif Bengali / Hind Siliguri from Google Fonts, falling back to system Bengali fonts if blocked.
