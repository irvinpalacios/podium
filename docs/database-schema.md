# Supabase Database Schema

**Database:** `hzzecysvwcplrmyavine.supabase.co` (applied)

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
  notes text,
  logged_at timestamptz default now(),
  unique(user_id, series, season, round)
);
alter table race_logs enable row level security;
create policy "Users manage own logs" on race_logs for all using (auth.uid() = user_id);
```

Refer to this schema when:
- Adding new fields to race logs
- Modifying data operations (queries, mutations)
- Setting up the database from scratch
- Understanding the data model and constraints
