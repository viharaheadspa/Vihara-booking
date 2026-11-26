-- Days off for therapists (holidays, sick days). Used by the booking page and admin "Days off" tab.
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to run twice.
create table if not exists staff_days_off (
  id         uuid primary key default gen_random_uuid(),
  staff_id   uuid not null references staff(id) on delete cascade,
  off_date   date not null,
  note       text,
  created_at timestamptz default now(),
  unique (staff_id, off_date)
);
alter table staff_days_off enable row level security;
drop policy if exists "Anyone can read days off" on staff_days_off;
create policy "Anyone can read days off" on staff_days_off for select using (true);
-- TEMPORARY: admin currently uses the public key. Tighten when admin login is added.
drop policy if exists "Admin can add days off" on staff_days_off;
create policy "Admin can add days off" on staff_days_off for insert with check (true);
drop policy if exists "Admin can change days off" on staff_days_off;
create policy "Admin can change days off" on staff_days_off for update using (true);
drop policy if exists "Admin can remove days off" on staff_days_off;
create policy "Admin can remove days off" on staff_days_off for delete using (true);
