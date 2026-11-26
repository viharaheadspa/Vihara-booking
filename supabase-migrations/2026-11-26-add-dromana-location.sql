-- Adds the Dromana location (bookings there failed without it). Already run on 26 Nov 2026.
insert into locations (id, name, address, suburb, postcode, phone, email) values
  ('00000000-0000-0000-0000-000000000002', 'Vihara Head Spa Dromana',
   'Inside HUM Yoga & Pilates (level 1), 183 Point Nepean Rd', 'Dromana', '3936',
   '+61392792895', 'hello@viharaheadspa.com.au')
on conflict (id) do nothing;
