-- LOCKDOWN: stop the public from reading or writing private data.
-- After this, only (a) the booking system's server (using the service role key) and
-- (b) staff logged in to /admin whose email is in admin_users can see bookings, clients,
-- invoices and gift cards.
--
-- RUN ONLY AFTER:
--   1. SUPABASE_SERVICE_ROLE_KEY is set in Vercel (Production and Preview)
--   2. The new booking code is deployed
--   3. Staff logins exist in Supabase → Authentication → Users
-- Safe to run more than once.

-- Who counts as admin
create table if not exists admin_users (email text primary key);
alter table admin_users enable row level security;   -- no policies: not readable from the website

create or replace function public.is_vihara_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_users where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;

insert into admin_users (email) values ('viharaheadspa@gmail.com') on conflict do nothing;
-- Add other staff who need admin, e.g.:
-- insert into admin_users (email) values ('bee@example.com') on conflict do nothing;

-- Remove public access to private data
drop policy if exists "anon can select appointments"      on appointments;
drop policy if exists "Anyone can create appointment"     on appointments;
drop policy if exists "anon can insert appointments"      on appointments;
drop policy if exists "Anyone can create appt_services"   on appointment_services;
drop policy if exists "anon can insert appointment_services" on appointment_services;
drop policy if exists "Anyone can create a client"        on clients;
drop policy if exists "anon can insert clients"           on clients;
drop policy if exists "anon can select own client"        on clients;
drop policy if exists "Anyone can create invoice"         on invoices;
drop policy if exists "anon can insert invoices"          on invoices;
drop policy if exists "allow all bookings"                on bookings;
drop policy if exists "allow all config"                  on spa_config;
drop policy if exists "Admin can add days off"            on staff_days_off;
drop policy if exists "Admin can change days off"         on staff_days_off;
drop policy if exists "Admin can remove days off"         on staff_days_off;

-- Logged-in admins can do everything
do $$
declare t text;
begin
  foreach t in array array[
    'appointments','appointment_services','clients','invoices','payments','gift_cards',
    'staff_days_off','staff','staff_hours','staff_services','services','service_categories',
    'locations','roster_overrides','closed_dates','bookings','spa_config','notifications_log'
  ] loop
    execute format('drop policy if exists "Vihara admin full access" on %I', t);
    execute format('create policy "Vihara admin full access" on %I for all to authenticated
                    using (public.is_vihara_admin()) with check (public.is_vihara_admin())', t);
  end loop;
end $$;

-- Reporting views must respect the rules above
alter view if exists v_appointments_today set (security_invoker = true);
alter view if exists v_revenue_summary   set (security_invoker = true);
