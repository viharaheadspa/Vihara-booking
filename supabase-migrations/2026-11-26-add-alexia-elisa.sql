-- Adds Alexia and Elisa as therapists so their bookings can be saved.
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to run twice.
insert into staff (id, location_id, first_name, role, show_online, colour) values
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Alexia', 'Massage & Head Spa Therapist', true, '#A07855'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'Elisa', 'Holistic Wellness Practitioner', true, '#7A8A6E')
on conflict (id) do nothing;
