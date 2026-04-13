# Podium — CLAUDE.md

## Product

**Name:** Podium — Your personal motorsport race log

### Core object
The **Race** is the primary unit. One log entry per Grand Prix. Not per session, not per season.

### Race log entry fields
- Rating (1–5 checkered flags)
- Driver of the Day (from that race's grid)
- Watched live or replay
- Date logged

### Explicitly cut from V1
- Written reviews / notes
- Rewatch count
- Social feed
- Live timing or telemetry
- Other motorsport series in the UI

---

## Data

**API:** `https://api.jolpi.ca/ergast/f1` — Jolpica (drop-in Ergast replacement; do not revert to ergast.com)
**Scope:** 2000–current only. No data before 2000. No OpenF1, no live timing.

Country flags: `flag-icons` npm package keyed to ISO 3166-1 alpha-2. Mapping lives in `src/utils/countryFlags.js` — do not duplicate.

---

## Tech Stack

| Layer    | Choice                                       |
|----------|----------------------------------------------|
| Frontend | React + Vite                                 |
| Styling  | Tailwind CSS — no component library          |
| Database | Supabase (hosted, free tier)                 |
| Auth     | Supabase Auth — email/password, max 3 users  |
| Hosting  | Netlify                                      |

### Tailwind design tokens

```js
// tailwind.config.js — colors
tarmac: '#1E1E1E', amber: '#F0A500', concrete: '#F4F3EF', gravel: '#7A7672', gold: '#C9A84C'
// Custom tracking tokens
tracking-display: '-0.03em', tracking-heading: '-0.02em'
```

Typography: `font-normal` (400) and `font-medium` (500) only — never semibold or bold. Sentence case always.

### Supabase schema

```sql
create table race_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  series text not null default 'f1',
  season int not null,
  round int not null,
  rating int check (rating between 1 and 5),
  driver_of_the_day text,
  watched_live boolean default false,
  logged_at timestamptz default now(),
  unique(user_id, series, season, round)
);

alter table race_logs enable row level security;
create policy "Users manage own logs" on race_logs for all using (auth.uid() = user_id);
```

---

## Project structure

```
/src
  /components/ui       # CheckeredFlag, FlagRating, CountryFlag, Toggle, Logo
  /components/layout   # AppShell, Header, NavBar
  /components/screens  # Auth, SeasonBrowser, RaceDetail, Diary, Stats
  /hooks               # useAuth, useSeasonData, useRaceLogs
  /utils               # countryFlags.js, ergastApi.js, supabaseClient.js
```

For screen layouts and component specs: @docs/screen-specs.md

---

## Design rules

### Never
- Hardcode hex values — Tailwind tokens only
- Use `font-semibold` or `font-bold`
- Use title case or all caps in copy or CSS
- Add drop shadows or gradients
- Use localStorage for any user data
- Put two amber or two gold elements on the same screen
- Use amber and gold together on the same element
- Skip RLS on any Supabase table

### Always
- Mobile-first: base = mobile, `md:` = desktop
- `px-4` screen padding
- Sentence case in all copy and labels
- Logged races → read state by default; unlogged → edit state directly
- `series` field on all data operations (always `'f1'` in V1)
- Human empty states: "Log your first race" not "No data"

---

## Scalability rules

1. `series` field in schema and all hooks — V1 passes `'f1'`, future series pass other values
2. Supabase Auth from day one — no single-user shortcuts
3. No localStorage — all user data in Supabase, must work across devices
4. RLS always on — every table, no exceptions
5. Tailwind tokens only — brand changes via `tailwind.config.js` alone

---

## Out of scope for V1
- Written reviews / notes, social features, series other than F1 in the UI
- Race data before 2000, push notifications, native app, revenue/paywall, admin dashboard
- Rewatch tracking, custom fonts, animations beyond Tailwind defaults

---

## Build status

All screens and components complete as of 2026-04-12.

### Known gaps
- [ ] `race_logs` table — run the schema SQL above in Supabase SQL editor (`hzzecysvwcplrmyavine.supabase.co`)
- [ ] Auth guard — `App.jsx` has no protected routes; unauthenticated users can reach all screens; add `<ProtectedRoute>` wrapper
