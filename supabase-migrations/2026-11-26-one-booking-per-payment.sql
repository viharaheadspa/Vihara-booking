-- Makes sure one Stripe payment can only ever create one booking,
-- even if the client's browser and Stripe's webhook save it at the same moment.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
create unique index if not exists appointments_one_per_payment
  on appointments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
