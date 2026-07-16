-- ============================================================
-- Vihara Head Spa & Blow Dry Lounge — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL editor (gradzqvzfbhtiqvnwdlj.supabase.co)
-- Execute in order: tables → indexes → RLS → seed data

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Drop existing tables (clean slate) ───────────────────────────────────────
drop table if exists notifications_log      cascade;
drop table if exists payments               cascade;
drop table if exists invoices               cascade;
drop table if exists appointment_services   cascade;
drop table if exists appointments           cascade;
drop table if exists roster_overrides       cascade;
drop table if exists staff_hours            cascade;
drop table if exists staff_services         cascade;
drop table if exists staff                  cascade;
drop table if exists services               cascade;
drop table if exists service_categories     cascade;
drop table if exists closed_dates           cascade;
drop table if exists locations              cascade;
drop table if exists clients                cascade;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. LOCATIONS
-- Multi-location ready (Parkdale now, second location coming soon)
-- ─────────────────────────────────────────────────────────────────────────────
create table locations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text,
  suburb      text,
  state       text default 'VIC',
  postcode    text,
  phone       text,
  email       text,
  timezone    text default 'Australia/Melbourne',
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SERVICE CATEGORIES
-- ─────────────────────────────────────────────────────────────────────────────
create table service_categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  sort_order  int  default 0,
  is_active   boolean default true
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SERVICES
-- ─────────────────────────────────────────────────────────────────────────────
create table services (
  id              uuid primary key default uuid_generate_v4(),
  category_id     uuid references service_categories(id) on delete set null,
  name            text not null,
  description     text,
  duration_mins   int  not null,  -- total treatment time
  price           numeric(8,2) not null,
  deposit_type    text default 'full',   -- 'full' | 'percent' | 'fixed' | 'none'
  deposit_value   numeric(8,2) default 0, -- percent (0-100) or fixed amount
  is_active       boolean default true,
  sort_order      int  default 0,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. STAFF
-- ─────────────────────────────────────────────────────────────────────────────
create table staff (
  id          uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete set null,
  first_name  text not null,
  last_name   text,
  display_name text generated always as (
    coalesce(first_name || ' ' || last_name, first_name)
  ) stored,
  role        text,
  email       text unique,
  phone       text,
  bio         text,
  colour      text default '#DACCBC',  -- calendar display colour
  is_active   boolean default true,
  show_online boolean default true,    -- visible in online booking
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. STAFF ↔ SERVICES (which staff can perform which services)
-- ─────────────────────────────────────────────────────────────────────────────
create table staff_services (
  staff_id    uuid references staff(id)    on delete cascade,
  service_id  uuid references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. STAFF HOURS (regular weekly roster)
-- day_of_week: 0=Sunday, 1=Monday … 6=Saturday
-- ─────────────────────────────────────────────────────────────────────────────
create table staff_hours (
  id          uuid primary key default uuid_generate_v4(),
  staff_id    uuid references staff(id) on delete cascade,
  day_of_week int  not null check (day_of_week between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  unique (staff_id, day_of_week)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. ROSTER OVERRIDES (public holidays, leave, special hours)
-- override_type: 'closed' | 'hours'
-- ─────────────────────────────────────────────────────────────────────────────
create table roster_overrides (
  id              uuid primary key default uuid_generate_v4(),
  staff_id        uuid references staff(id) on delete cascade,
  override_date   date not null,
  override_type   text not null default 'closed',
  start_time      time,
  end_time        time,
  note            text,
  unique (staff_id, override_date)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. CLOSED DATES (whole-business closures)
-- ─────────────────────────────────────────────────────────────────────────────
create table closed_dates (
  id          uuid primary key default uuid_generate_v4(),
  location_id uuid references locations(id) on delete cascade,
  closed_date date not null,
  reason      text,
  unique (location_id, closed_date)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. CLIENTS
-- Linked to Supabase Auth user if they create a login
-- ─────────────────────────────────────────────────────────────────────────────
create table clients (
  id              uuid primary key default uuid_generate_v4(),
  auth_user_id    uuid unique,   -- links to auth.users if client has portal login
  first_name      text not null,
  last_name       text,
  email           text,
  phone           text,
  date_of_birth   date,
  notes           text,          -- internal staff notes
  marketing_opt_in boolean default true,
  sms_opt_in      boolean default true,
  referral_source text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_clients_email on clients(email);
create index idx_clients_phone on clients(phone);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. APPOINTMENTS
-- status: 'pending' | 'confirmed' | 'pencilled' | 'cancelled' | 'no_show' | 'completed'
-- ─────────────────────────────────────────────────────────────────────────────
create table appointments (
  id              uuid primary key default uuid_generate_v4(),
  location_id     uuid references locations(id),
  client_id       uuid references clients(id) on delete set null,
  staff_id        uuid references staff(id)   on delete set null,
  start_time      timestamptz not null,
  end_time        timestamptz not null,
  duration_mins   int  not null,
  total_price     numeric(8,2) not null default 0,
  deposit_paid    numeric(8,2) not null default 0,
  status          text not null default 'confirmed',
  notes           text,                        -- client notes at booking
  staff_notes     text,                        -- internal staff notes
  cancellation_reason text,
  stripe_payment_intent_id text,
  booked_online   boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),

  constraint valid_status check (
    status in ('pending','confirmed','pencilled','cancelled','no_show','completed')
  )
);

create index idx_appointments_start  on appointments(start_time);
create index idx_appointments_client on appointments(client_id);
create index idx_appointments_staff  on appointments(staff_id);
create index idx_appointments_status on appointments(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. APPOINTMENT SERVICES (services within a booking — multi-service support)
-- ─────────────────────────────────────────────────────────────────────────────
create table appointment_services (
  id              uuid primary key default uuid_generate_v4(),
  appointment_id  uuid references appointments(id) on delete cascade,
  service_id      uuid references services(id)     on delete set null,
  service_name    text not null,    -- snapshot at time of booking
  duration_mins   int  not null,
  price           numeric(8,2) not null,
  sort_order      int  default 0
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. INVOICES
-- status: 'unpaid' | 'paid' | 'refunded' | 'voided'
-- ─────────────────────────────────────────────────────────────────────────────
create table invoices (
  id              uuid primary key default uuid_generate_v4(),
  appointment_id  uuid references appointments(id) on delete set null,
  client_id       uuid references clients(id)      on delete set null,
  invoice_number  serial,
  subtotal        numeric(8,2) not null default 0,
  discount        numeric(8,2) not null default 0,
  total           numeric(8,2) not null default 0,
  amount_paid     numeric(8,2) not null default 0,
  status          text not null default 'unpaid',
  notes           text,
  issued_at       timestamptz default now(),
  due_at          timestamptz default now(),
  paid_at         timestamptz,

  constraint valid_invoice_status check (
    status in ('unpaid','paid','refunded','voided')
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. PAYMENTS
-- method: 'stripe' | 'cash' | 'eftpos' | 'gift_voucher' | 'credit'
-- ─────────────────────────────────────────────────────────────────────────────
create table payments (
  id              uuid primary key default uuid_generate_v4(),
  invoice_id      uuid references invoices(id) on delete cascade,
  amount          numeric(8,2) not null,
  method          text not null default 'stripe',
  stripe_charge_id text,
  reference       text,
  paid_at         timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. NOTIFICATIONS LOG
-- type: 'email_confirmation' | 'email_cancellation' | 'sms_reminder' |
--       'sms_followup' | 'email_pencilled'
-- ─────────────────────────────────────────────────────────────────────────────
create table notifications_log (
  id              uuid primary key default uuid_generate_v4(),
  appointment_id  uuid references appointments(id) on delete set null,
  client_id       uuid references clients(id)      on delete set null,
  type            text not null,
  channel         text not null,  -- 'email' | 'sms'
  recipient       text,           -- email address or phone number
  subject         text,
  body            text,
  status          text default 'sent',  -- 'sent' | 'failed' | 'pending'
  sent_at         timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────
alter table locations           enable row level security;
alter table service_categories  enable row level security;
alter table services            enable row level security;
alter table staff               enable row level security;
alter table staff_services      enable row level security;
alter table staff_hours         enable row level security;
alter table roster_overrides    enable row level security;
alter table closed_dates        enable row level security;
alter table clients             enable row level security;
alter table appointments        enable row level security;
alter table appointment_services enable row level security;
alter table invoices            enable row level security;
alter table payments            enable row level security;
alter table notifications_log   enable row level security;

-- Public read access for booking flow (services, staff, hours)
create policy "Public can read locations"          on locations          for select using (true);
create policy "Public can read categories"         on service_categories for select using (true);
create policy "Public can read services"           on services           for select using (is_active = true);
create policy "Public can read staff"              on staff              for select using (is_active = true and show_online = true);
create policy "Public can read staff_services"     on staff_services     for select using (true);
create policy "Public can read staff_hours"        on staff_hours        for select using (true);
create policy "Public can read roster_overrides"   on roster_overrides   for select using (true);
create policy "Public can read closed_dates"       on closed_dates       for select using (true);

-- Clients can insert themselves
create policy "Anyone can create a client"         on clients            for insert with check (true);
-- Clients can read their own record
create policy "Clients read own record"            on clients            for select using (auth.uid() = auth_user_id);

-- Appointments: anyone can insert (during booking), auth users can read their own
create policy "Anyone can create appointment"      on appointments       for insert with check (true);
create policy "Anyone can create appt_services"    on appointment_services for insert with check (true);
create policy "Anyone can create invoice"          on invoices           for insert with check (true);

-- Service role (used by edge functions / admin) has full access — no policy needed
-- when using the service_role key it bypasses RLS

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED DATA
-- ─────────────────────────────────────────────────────────────────────────────

-- Location
insert into locations (id, name, address, suburb, postcode, phone, email) values
  ('00000000-0000-0000-0000-000000000001',
   'Vihara Head Spa & Blow Dry Lounge',
   '1 Chandler Street', 'Parkdale', '3195',
   '+61392792895', 'hello@viharaheadspa.com.au');

-- Service Categories
insert into service_categories (id, name, sort_order) values
  ('10000000-0000-0000-0000-000000000001', 'Japanese Head Spa',        1),
  ('10000000-0000-0000-0000-000000000002', 'For Him',                  2),
  ('10000000-0000-0000-0000-000000000003', 'Reiki',                    3),
  ('10000000-0000-0000-0000-000000000004', 'Sensory Rituals',          4),
  ('10000000-0000-0000-0000-000000000005', 'Pregnancy & Postpartum',   5);

-- Services — Japanese Head Spa
insert into services (id, category_id, name, description, duration_mins, price, sort_order) values
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'The Soul Spa',
   'Our most expansive head spa experience designed to nurture the body, calm the mind, and restore balance and wellbeing. Includes guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, hand and arm massage, chest exfoliation, third-eye oil ritual, herbal-infused water pours, aromatherapy, steam hair treatment, signature water therapy, sound healing, chakra crystal placement and energy work. Concludes with a personalised blow-dry finish.',
   135, 360.00, 1),

  ('20000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000001',
   'The Vihara Signature Journey',
   'A 90-minute journey of deep relaxation designed to calm the nervous system, ease tension and support scalp and hair health. Includes guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, hand and arm massage, third-eye oil ritual, herbal-infused water pours, aromatherapy, signature water therapy and sound healing. Concludes with a personalised blow-dry finish.',
   90, 252.00, 2),

  ('20000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000001',
   'Enlighten Ritual Head Spa',
   'A 45-minute introduction to the Vihara experience designed to calm the nervous system and restore balance. Includes guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, third-eye oil ritual, herbal-infused water pours, aromatherapy and signature water therapy. Concludes with nourishing hair products, towel drying and gentle detangling.',
   45, 159.00, 3);

-- Services — For Him
insert into services (id, category_id, name, description, duration_mins, price, sort_order) values
  ('20000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000002',
   'His Grounded Journey',
   'A focused 75-minute head spa for men who are tired, tense and need proper time to switch off. Includes deep scalp and hair cleanse, gentle scalp exfoliation, warm water therapy, slow targeted massage through the head, neck and shoulders, grounding chest scrub, beard cleanse, and hand and arm massage.',
   75, 220.00, 1),

  ('20000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000002',
   'The Reset For Him',
   'A focused 45-minute head spa to clear the head, calm the body and give the scalp a proper reset. Includes deep scalp and hair cleanse, gentle scalp exfoliation, warm water therapy and slow targeted massage through the head, neck and shoulders. Simple, grounding and effective.',
   45, 156.00, 2);

-- Services — Reiki
insert into services (id, category_id, name, description, duration_mins, price, sort_order) values
  ('20000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000003',
   'Initial Reiki Session',
   'A deeper journey into energetic restoration and nervous system support. This extended session moves through each energy centre with intention, releasing stored tension and emotional stagnation while gently guiding the body back into alignment. Through intuitive energy work, grounding rituals and intentional stillness, we create space for clarity, reconnection and inner steadiness.',
   60, 159.00, 1),

  ('20000000-0000-0000-0000-000000000007',
   '10000000-0000-0000-0000-000000000003',
   'Return Reiki Session',
   'A focused reset to bring your body and energy back into balance. Using gentle, intuitive energy work with light touch, this session supports the release of built-up stress, emotional tension and energetic heaviness. You will leave feeling lighter, clearer and more centred.',
   45, 110.00, 2);

-- Services — Sensory Rituals
insert into services (id, category_id, name, description, duration_mins, price, sort_order) values
  ('20000000-0000-0000-0000-000000000008',
   '10000000-0000-0000-0000-000000000004',
   'Quiet Touch',
   'A waterless ritual designed to provide deep emotional rest and nervous system support through gentle, intentional touch. Using soothing sensory tools, your practitioner creates soft tracing patterns across the back, arms, chest and scalp, encouraging the body to relax and the mind to slow.',
   60, 159.00, 1),

  ('20000000-0000-0000-0000-000000000009',
   '10000000-0000-0000-0000-000000000004',
   'Sound Alignment',
   'A calming, full-body experience designed to support deep relaxation and restore balance to the nervous system. Through therapeutic sound and subtle energetic support, the body is invited to release tension, settle the mind, and gently reset after periods of stress or mental fatigue.',
   60, 159.00, 2),

  ('20000000-0000-0000-0000-000000000010',
   '10000000-0000-0000-0000-000000000004',
   'Nervous System Reset',
   'A nurturing ritual designed to support deep rest, regulation and reconnection. Through gentle body rocking, rhythmic movement, supportive holding techniques and intentional touch, this treatment encourages the body to release tension and settle into safety and calm.',
   60, 159.00, 3),

  ('20000000-0000-0000-0000-000000000011',
   '10000000-0000-0000-0000-000000000004',
   'Cloud Ritual',
   'A gentle 45-minute escape into our sensory cloud chairs. Weighted blanket, eye mask and a soothing head massage blend with slow hair play to soften your mind and unravel tension. The perfect express ritual when your nervous system needs a moment.',
   45, 89.00, 4),

  ('20000000-0000-0000-0000-000000000012',
   '10000000-0000-0000-0000-000000000004',
   'Cloud Ritual (30min)',
   'A gentle 30-minute escape into our sensory cloud chairs — weighted blanket, eye mask and soothing sound to help you soften and unwind.',
   30, 69.00, 5);

-- Services — Pregnancy & Postpartum
insert into services (id, category_id, name, description, duration_mins, price, sort_order) values
  ('20000000-0000-0000-0000-000000000013',
   '10000000-0000-0000-0000-000000000005',
   'Sacred Mother To Be Retreat',
   'A 2-hour 15-minute deeply calming retreat created especially for mothers, available as a single or double treatment experience. Warm cascading water, slow rhythmic scalp massage and nourishing Oway treatments melt away tension through the scalp, neck and shoulders. Elevated with a soothing herbal foot bath, facial massage and a 30-minute Quiet Touch ritual.',
   135, 360.00, 1),

  ('20000000-0000-0000-0000-000000000014',
   '10000000-0000-0000-0000-000000000005',
   'Expecting Mother to Be Ritual',
   'Created especially for mothers-to-be, this nurturing head spa ritual offers a moment of deep calm during pregnancy. Begins with our Enlighten Head Spa — warm cascading water, slow rhythmic scalp massage and nourishing Oway treatments. Gentle neck stretches, soothing massage techniques and carefully selected scalp tools encourage deep relaxation.',
   75, 220.00, 2),

  ('20000000-0000-0000-0000-000000000015',
   '10000000-0000-0000-0000-000000000005',
   'Postpartum Cocoon',
   'A deeply nurturing 2-hour postpartum experience designed to cocoon mothers in care during the tender transition into motherhood. Each session is tailored to the mother''s emotional, physical and nervous system needs on the day — blending warm water therapy, grounding scalp massage, reiki, baby-safe sound healing and finishing styling. Babies are warmly welcomed throughout.',
   120, 344.00, 3),

  ('20000000-0000-0000-0000-000000000016',
   '10000000-0000-0000-0000-000000000005',
   'Somatic Birth Debrief',
   'A 90-minute deeply held experience for mothers who feel like parts of their birth are still living within their body. Blends somatic birth debriefing with nurturing touch-based therapies — may include somatic birth processing, nervous system regulation, grounding touch therapy, scalp massage, reiki, sound healing, quiet rest and integration.',
   90, 252.00, 4);

-- Staff
insert into staff (id, location_id, first_name, last_name, role, email, phone, show_online, colour) values
  ('30000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'Bee', 'Macqueen',
   'Head Spa Therapist & Reiki Practitioner',
   'britt_macqueen@hotmail.com', '+61488014489', true, '#B8864A'),

  ('30000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Jesse', null,
   'Postpartum Specialist & Head Spa Therapist',
   null, null, true, '#904C21'),

  ('30000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'Sianne', 'Ritchie',
   'Owner & Head Spa Therapist',
   'viharaheadspa@gmail.com', null, true, '#5C3D25');

-- Staff Services — Bee (Head Spa + Reiki + Sensory Rituals)
insert into staff_services (staff_id, service_id) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000007'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000010'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011'),
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012');

-- Staff Services — Jesse (Pregnancy & Postpartum specialist)
insert into staff_services (staff_id, service_id) values
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000013'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000014'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000015'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000016'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003');

-- Staff Services — Sianne (all services)
insert into staff_services (staff_id, service_id) values
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000009'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000010'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000011'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000012'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000013'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000014');

-- Staff Hours — Vihara business hours (from Zenoti):
-- Wed 10am–6pm, Thu–Fri 10am–8pm, Sat 9am–3pm
-- (Sun/Mon/Tue closed)
-- Bee and Sianne working these hours (Jesse TBC)
insert into staff_hours (staff_id, day_of_week, start_time, end_time) values
  -- Bee
  ('30000000-0000-0000-0000-000000000001', 3, '10:00', '18:00'),  -- Wednesday
  ('30000000-0000-0000-0000-000000000001', 4, '10:00', '20:00'),  -- Thursday
  ('30000000-0000-0000-0000-000000000001', 5, '10:00', '20:00'),  -- Friday
  ('30000000-0000-0000-0000-000000000001', 6, '09:00', '15:00'),  -- Saturday
  -- Sianne
  ('30000000-0000-0000-0000-000000000003', 3, '10:00', '18:00'),
  ('30000000-0000-0000-0000-000000000003', 4, '10:00', '20:00'),
  ('30000000-0000-0000-0000-000000000003', 5, '10:00', '20:00'),
  ('30000000-0000-0000-0000-000000000003', 6, '09:00', '15:00'),
  -- Jesse
  ('30000000-0000-0000-0000-000000000002', 3, '10:00', '18:00'),
  ('30000000-0000-0000-0000-000000000002', 4, '10:00', '20:00'),
  ('30000000-0000-0000-0000-000000000002', 5, '10:00', '20:00'),
  ('30000000-0000-0000-0000-000000000002', 6, '09:00', '15:00');

-- ─────────────────────────────────────────────────────────────────────────────
-- USEFUL VIEWS
-- ─────────────────────────────────────────────────────────────────────────────

-- Today's appointments with client + staff + services
create or replace view v_appointments_today as
select
  a.id,
  a.start_time,
  a.end_time,
  a.status,
  a.total_price,
  a.deposit_paid,
  a.notes,
  c.first_name || ' ' || coalesce(c.last_name, '') as client_name,
  c.phone as client_phone,
  c.email as client_email,
  s.first_name as staff_first_name,
  array_agg(aps.service_name order by aps.sort_order) as service_names
from appointments a
left join clients c on c.id = a.client_id
left join staff s   on s.id = a.staff_id
left join appointment_services aps on aps.appointment_id = a.id
where a.start_time::date = current_date
  and a.status not in ('cancelled', 'no_show')
group by a.id, c.first_name, c.last_name, c.phone, c.email, s.first_name
order by a.start_time;

-- Revenue summary
create or replace view v_revenue_summary as
select
  date_trunc('day', a.start_time at time zone 'Australia/Melbourne')::date as day,
  count(*) filter (where a.status = 'completed') as completed_count,
  sum(a.total_price) filter (where a.status = 'completed') as revenue,
  avg(a.total_price) filter (where a.status = 'completed') as avg_sale
from appointments a
group by 1
order by 1 desc;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: get available slots for a staff member on a given date
-- Usage: select * from get_available_slots('staff-uuid', '2026-07-18', 60);
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function get_available_slots(
  p_staff_id   uuid,
  p_date       date,
  p_duration   int   -- treatment duration in minutes
)
returns table (slot_start timestamptz, slot_end timestamptz)
language plpgsql as $$
declare
  v_day_of_week int := extract(dow from p_date);
  v_start       time;
  v_end         time;
  v_tz          text := 'Australia/Melbourne';
  v_slot        timestamptz;
  v_interval    interval := '30 minutes';
begin
  -- Check if staff works this day
  select start_time, end_time
    into v_start, v_end
    from staff_hours
   where staff_id = p_staff_id
     and day_of_week = v_day_of_week;

  if not found then return; end if;

  -- Check roster override
  if exists (
    select 1 from roster_overrides
     where staff_id = p_staff_id
       and override_date = p_date
       and override_type = 'closed'
  ) then return; end if;

  -- Generate slots
  v_slot := (p_date || ' ' || v_start)::timestamptz at time zone v_tz;

  while v_slot + (p_duration || ' minutes')::interval
        <= (p_date || ' ' || v_end)::timestamptz at time zone v_tz
  loop
    -- Check no existing appointment overlaps this slot
    if not exists (
      select 1 from appointments
       where staff_id = p_staff_id
         and status not in ('cancelled', 'no_show')
         and start_time < v_slot + (p_duration || ' minutes')::interval
         and end_time   > v_slot
    ) then
      slot_start := v_slot;
      slot_end   := v_slot + (p_duration || ' minutes')::interval;
      return next;
    end if;

    v_slot := v_slot + v_interval;
  end loop;
end;
$$;
