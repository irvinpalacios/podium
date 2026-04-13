# Podium — screen & component specs

Reference this file when modifying any screen or UI component.
All screens and components are fully implemented as of 2026-04-12.

---

## Screens

### 1. Season browser — `/`

- `<Header />` logo left, user avatar right
- `<NavBar />` Seasons active
- Season selector: year `text-[22px] font-medium tracking-display` + prev/next chevron buttons
- Progress row: amber bar + `X / Y logged` Gravel `text-[11px]`
- 2-column `RaceCard` grid, `gap-2`, `px-4`

RaceCard states:

| State    | Background (dark) | Background (light) | Flag opacity | Circuit opacity |
|----------|-------------------|--------------------|--------------|-----------------|
| Unlogged | `#242424`         | `#ECEAE4`          | 0.35         | 0.08            |
| Logged   | `#2A2A2A`         | `#FFFFFF`          | 1.0          | 0.20            |
| 5-flag   | `#2E2A1A`         | `#FFF8E6`          | 1.0 (gold)   | 0.20            |

RaceCard anatomy (top → bottom):
1. Round number — `text-[10px] font-medium` Gravel
2. Circuit sketch SVG left (flex-1, abstract lines only) + CountryFlag right (22×15px)
3. Race name — `text-[13px] font-medium`, 25% opacity when unlogged
4. Country — `text-[11px]` Gravel, 25% opacity when unlogged
5. FlagRating (10px squares) left + `+` icon right (18px circle, muted border) when unlogged

Tapping unlogged → RaceDetail in edit state. Tapping logged → RaceDetail in read state.

---

### 2. Race detail — `/race/:season/:round`

Logged races open in read state. Unlogged open directly in edit state.

**Both states:**
- Back button → `/{season}` with season year label
- Round badge + CountryFlag (24×16px)
- Race title — `text-[22px] font-medium tracking-display` (two lines max)
- Race meta — date + circuit name, Gravel `text-[11px]`
- Abstract circuit line SVG
- Podium strip: P1 (gold tint bg + gold text), P2, P3 — surname + constructor `text-[11px]`
- Divider `border-b border-white/8`
- "Your log" label — `text-[11px] font-medium uppercase tracking-wider` Gravel

**Read state:**
- Amber "Edit" pill — top right of log section
- FlagRating — 28px flags, non-interactive, gold at rating 5
- DOTD row — label left, driver name right
- Watched row — "Live" amber pill or "Replay" muted pill

**Edit state:**
- Muted "Cancel" pill — top right of log section
- FlagRating — 34px flags, interactive, gold animates in at 5
- DOTD — native `<select>` from Ergast driver list for that season
- Watched live toggle — amber track when on
- Full-width CTA: "Save log" (first time) / "Save changes" (edit)
  - Dark: amber bg + tarmac text. Light: tarmac bg + white text

---

### 3. Diary — `/diary`

- `<Header />` + `<NavBar />` Diary active
- Horizontal scrolling season filter pills — "All" default, then years descending
  - Active dark: amber bg + tarmac text. Active light: tarmac bg + white text. Inactive: muted.
- Feed grouped by season with dividers: year `font-medium` + race count Gravel + `border-b`

DiaryEntry row (left → right):
- Left col: CountryFlag md (28×19px) + round number Gravel `text-[10px]`
- Body: race name `text-[14px] font-medium` + chevron right (muted) / date Gravel `text-[11px]` / FlagRating 10px / DOTD pill (muted bg) + live dot (amber = live, muted = replay)

Tapping → RaceDetail in read state.

---

### 4. Stats — `/stats`

Metrics:
- Total races logged
- Average rating (1 decimal)
- Most picked Driver of the Day
- Live % vs Replay %
- Top 3 highest-rated races
- Races logged per season — horizontal bar, amber fill

---

### 5. Auth — `/login`

- Full-height tarmac bg (dark only — no light variant)
- Logo centred, large
- Sign in / Create account tab toggle
- Email + password inputs
- Single CTA button — "Sign in" / "Create account"
- Redirect to `/` on success. Never store session in localStorage.

---

## Component specs

### `<Logo />`
```
ViewBox: 0 0 32 28
P3 bar: x=0  y=18  w=8  h=10  rx=1.5
P2 bar: x=12 y=10  w=8  h=18  rx=1.5
P1 bar: x=24 y=4   w=8  h=24  rx=1.5  fill always amber (#F0A500)
```
P3 + P2: white on dark, tarmac on light. Props: `size` (number), `theme` ('dark'|'light')

### `<CheckeredFlag />`
3×3 alternating squares in a rounded rect (`rx` = size/5). Square = (size − 2×padding) / 3.

| Variant     | Rect fill  | Squares                              |
|-------------|------------|--------------------------------------|
| Filled dark | tarmac     | white / dark alternating             |
| Filled light| `#C8C6C0`  | same pattern                         |
| Gold        | `#C9A84C`  | white + `#7A5C1E` alternating        |
| Ghost       | transparent| muted border, very low opacity fill  |

Props: `size` (px), `filled` (bool), `gold` (bool)

### `<FlagRating />`
Five `<CheckeredFlag />` in a row, `gap-1`. Gold activates automatically at rating 5.
Props: `rating` (1–5 | null), `interactive` (bool), `size` ('sm'=10px | 'md'=28px | 'lg'=34px), `onChange` (fn)

### `<CountryFlag />`
`flag-icons` package: `<span className={`fi fi-${isoCode}`} />` wrapped in sized div with `rounded-sm overflow-hidden border border-black/10`.
Props: `country` (Ergast country string), `size` ('sm'=22×15px | 'md'=28×19px), `dimmed` (bool → `opacity-35`)

### `<Toggle />`
Track: 36×20px `rounded-full`. Amber bg when on, muted border when off.
Thumb: 16×16px white circle, `top-[2px]`. Off: `left-[2px]`. On: `left-[18px]`. `transition-all duration-150`.
Props: `checked` (bool), `onChange` (fn)

### `<NavBar />`
Three items below `<Header />`, separated by `border-b border-white/8`.
Active: `text-amber` + 1.5px amber underline (dark) / `text-tarmac` + tarmac underline (light).
Inactive: `text-white/30` (dark) / `text-black/30` (light).
