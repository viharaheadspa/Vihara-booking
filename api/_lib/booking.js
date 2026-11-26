// Server-side booking logic for Vihara.
// The browser only says WHAT the client wants (services, time, details).
// Everything that matters for money and the calendar is worked out here:
// the price, the deposit, gift card balance, and whether the time is still free.

import { createClient } from '@supabase/supabase-js'
import { DEFAULT_CATEGORIES, DEFAULT_ADDONS, DEFAULT_STAFF, DEFAULT_SETTINGS, hoursFor, offeredAt, isRostered } from '../../src/catalogue.js'
import { melParts } from '../../src/time.js'
import { sendConfirmation } from './email.js'

const BUFFER_MS = (DEFAULT_SETTINGS.bufferMins || 0) * 60 * 1000

const LOCATION_IDS = [
  '00000000-0000-0000-0000-000000000001', // Parkdale
  '00000000-0000-0000-0000-000000000002', // Dromana
]

export class BookingError extends Error {
  constructor(message, status = 400) { super(message); this.status = status }
}

export function db() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new BookingError('Booking database is not configured.', 500)
  return createClient(url, key, { auth: { persistSession: false } })
}

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Clean up whatever the browser sent into a known shape.
export function normalise(raw) {
  if (!raw || typeof raw !== 'object') throw new BookingError('Missing booking details.')
  const c1 = raw.customer || {}
  const c2 = raw.customer2 || {}
  return {
    locationId: str(raw.locationId, 60),
    serviceIds: Array.isArray(raw.serviceIds) ? raw.serviceIds.map(x => str(x, 20)).filter(Boolean) : [],
    addonIds: Array.isArray(raw.addonIds) ? raw.addonIds.map(x => str(x, 20)).filter(Boolean) : [],
    isCouples: raw.isCouples === true || raw.isCouples === '1',
    payChoice: raw.payChoice === 'full' ? 'full' : 'deposit',
    giftCardCode: str(raw.giftCardCode, 40).toUpperCase(),
    startISO: str(raw.startISO, 40),
    staff1Id: str(raw.staff1Id, 60),
    staff2Id: str(raw.staff2Id, 60),
    customer: {
      firstName: str(c1.firstName, 80), lastName: str(c1.lastName, 80),
      email: str(c1.email, 120).toLowerCase(), mobile: str(c1.mobile, 40),
      notes: str(c1.notes, 450),
    },
    customer2: {
      firstName: str(c2.firstName, 80), lastName: str(c2.lastName, 80),
      email: str(c2.email, 120).toLowerCase(), mobile: str(c2.mobile, 40),
    },
  }
}

// Works out the price from the catalogue on the server. Throws if anything doesn't add up.
export async function quote(b, { checkGiftCard = true } = {}) {
  if (!LOCATION_IDS.includes(b.locationId)) throw new BookingError('Unknown location.')
  if (!b.serviceIds.length) throw new BookingError('Please choose a treatment.')

  const services = b.serviceIds.map(id => {
    for (const cat of DEFAULT_CATEGORIES) {
      const s = cat.services.find(x => x.id === id)
      if (s) return { ...s, couplesCategory: !!cat.couples }
    }
    throw new BookingError('That treatment is no longer available. Please refresh the page.')
  })
  if (services.some(s => !offeredAt(s, b.locationId))) {
    throw new BookingError('That treatment is not available at this location. Please choose another.')
  }
  if (services.some(s => s.couplesCategory !== b.isCouples)) {
    throw new BookingError('Treatment choice does not match the booking type. Please refresh the page.')
  }

  const allowedAddons = new Set(services.flatMap(s => s.addons || []))
  if (b.isCouples && b.addonIds.length) throw new BookingError('Add-ons are not available for couples bookings.')
  const addons = b.addonIds.map(id => {
    const a = DEFAULT_ADDONS.find(x => x.id === id)
    if (!a || !allowedAddons.has(id)) throw new BookingError('That add-on is not available. Please refresh the page.')
    return a
  })

  const total = services.reduce((t, s) => t + s.price, 0) + addons.reduce((t, a) => t + a.price, 0)
  const duration = services.reduce((t, s) => t + s.duration, 0) + addons.reduce((t, a) => t + a.duration, 0)

  let giftCard = null
  let discount = 0
  if (b.giftCardCode && checkGiftCard) {
    const { data, error } = await db().from('gift_cards')
      .select('id, code, remaining, expires_at, is_active')
      .eq('code', b.giftCardCode).maybeSingle()
    if (error || !data) throw new BookingError('Gift card code not found.')
    if (!data.is_active || Number(data.remaining) <= 0) throw new BookingError('This gift card has no balance left.')
    if (data.expires_at && new Date(data.expires_at) < new Date()) throw new BookingError('This gift card has expired.')
    giftCard = { id: data.id, code: data.code, remaining: Number(data.remaining) }
    discount = Math.min(giftCard.remaining, total)
  }

  const effective = Math.max(0, total - discount)
  const pct = b.isCouples ? DEFAULT_SETTINGS.couplesDepositPercent : DEFAULT_SETTINGS.depositPercent
  const amount = b.payChoice === 'full' ? effective : Math.round(effective * pct) / 100

  return { services, addons, total, duration, discount, giftCard, amount }
}

// Checks the time and therapists are valid. Returns { startISO, endISO }.
export function checkTimeAndStaff(b, q) {
  const start = new Date(b.startISO)
  if (isNaN(start)) throw new BookingError('Please choose a time.')
  if (start.getTime() < Date.now() - 5 * 60 * 1000) throw new BookingError('That time has already passed. Please choose another.')

  const { date, minutes } = melParts(start)
  const hours = hoursFor(b.locationId, new Date(`${date}T12:00:00Z`).getUTCDay())
  if (!hours) throw new BookingError('We are closed on that day. Please choose another.')
  const open = hours[0] * 60
  const close = hours[1] * 60
  const buffer = DEFAULT_SETTINGS.bufferMins || 0
  if (minutes < open || minutes + q.duration + buffer > close || minutes % DEFAULT_SETTINGS.slotInterval !== 0) {
    throw new BookingError('That time is outside our opening hours. Please choose another.')
  }

  const canDoAll = (staffId) => DEFAULT_STAFF.some(s => s.id === staffId) &&
    q.services.every(s => (s.staff || []).includes(staffId))
  if (!canDoAll(b.staff1Id)) throw new BookingError('That therapist is not available for this treatment.')
  const working = (id) => isRostered(id, b.locationId, date)
  if (!working(b.staff1Id) || (b.isCouples && !working(b.staff2Id))) {
    throw new BookingError('That therapist is not working at this location on that day. Please choose another time.')
  }
  if (b.isCouples) {
    if (!canDoAll(b.staff2Id) || b.staff2Id === b.staff1Id) {
      throw new BookingError('A couples booking needs two therapists. Please choose another time or contact us.')
    }
  }

  const endISO = new Date(start.getTime() + q.duration * 60 * 1000).toISOString()
  return { startISO: start.toISOString(), endISO }
}

// True if none of the given therapists already has a booking overlapping this time,
// and none of them has marked that day as a day off.
export async function isSlotFree(staffIds, startISO, endISO) {
  const { date } = melParts(startISO)
  const { data: off, error: offErr } = await db().from('staff_days_off')
    .select('staff_id').in('staff_id', staffIds).eq('off_date', date).limit(1)
  // If the days-off table doesn't exist yet, carry on rather than block all bookings
  if (!offErr && off && off.length) return false

  const { data, error } = await db().from('appointments')
    .select('id')
    .in('staff_id', staffIds)
    .not('status', 'in', '("cancelled","no_show")')
    // Every booking is followed by reset time, so widen the check by that much on both sides
    .lt('start_time', new Date(new Date(endISO).getTime() + BUFFER_MS).toISOString())
    .gt('end_time', new Date(new Date(startISO).getTime() - BUFFER_MS).toISOString())
    .limit(1)
  if (error) throw new BookingError('Could not check availability. Please try again.', 500)
  return !data || data.length === 0
}

// ── Stripe metadata: the full booking travels with the payment ──────────────
// so it can always be rebuilt from Stripe, even if the client's browser closes.
export function toMetadata(b, q) {
  return {
    vihara_booking: '1',
    loc: b.locationId,
    svc: b.serviceIds.join(','),
    add: b.addonIds.join(','),
    cpl: b.isCouples ? '1' : '0',
    pay: b.payChoice,
    gc: b.giftCardCode || '',
    gc_discount: String(q.discount),
    start: b.startISO,
    staff1: b.staff1Id,
    staff2: b.staff2Id || '',
    c1_first: b.customer.firstName, c1_last: b.customer.lastName,
    c1_email: b.customer.email, c1_mobile: b.customer.mobile,
    c1_notes: b.customer.notes,
    c2_first: b.customer2.firstName, c2_last: b.customer2.lastName,
    c2_email: b.customer2.email, c2_mobile: b.customer2.mobile,
  }
}

export function fromMetadata(md) {
  return normalise({
    locationId: md.loc,
    serviceIds: (md.svc || '').split(',').filter(Boolean),
    addonIds: (md.add || '').split(',').filter(Boolean),
    isCouples: md.cpl === '1',
    payChoice: md.pay,
    giftCardCode: md.gc,
    startISO: md.start,
    staff1Id: md.staff1,
    staff2Id: md.staff2,
    customer: { firstName: md.c1_first, lastName: md.c1_last, email: md.c1_email, mobile: md.c1_mobile, notes: md.c1_notes },
    customer2: { firstName: md.c2_first, lastName: md.c2_last, email: md.c2_email, mobile: md.c2_mobile },
  })
}

const refFor = (apptId) => `VH${String(apptId).slice(-6).toUpperCase()}`

// Saves the booking. Safe to call more than once for the same payment:
// if a booking already exists for this payment, it returns that one.
export async function saveBooking(b, q, { paymentIntentId = null, amountPaid = 0 } = {}) {
  const sb = db()

  if (paymentIntentId) {
    const { data: existing } = await sb.from('appointments')
      .select('id').eq('stripe_payment_intent_id', paymentIntentId).limit(1)
    if (existing && existing.length) return { ref: refFor(existing[0].id), alreadySaved: true }
  }

  const { startISO, endISO } = { startISO: new Date(b.startISO).toISOString(),
    endISO: new Date(new Date(b.startISO).getTime() + q.duration * 60000).toISOString() }

  // If the time was taken while the client was paying, keep the booking (they've paid)
  // but mark it so staff can sort it out.
  const staffIds = [b.staff1Id, b.isCouples ? b.staff2Id : null].filter(Boolean)
  const free = await isSlotFree(staffIds, startISO, endISO)
  const status = free ? 'confirmed' : 'pending'
  const clashNote = free ? null : 'CHECK: this time overlapped another booking when it was paid for. Please contact the client.'

  const upsertClient = async (c) => {
    if (!c.firstName) return null
    if (c.email) {
      const { data: found } = await sb.from('clients').select('id').eq('email', c.email).maybeSingle()
      if (found) return found.id
    }
    const { data, error } = await sb.from('clients').insert({
      first_name: c.firstName, last_name: c.lastName || null,
      email: c.email || null, phone: c.mobile || null,
    }).select('id').single()
    if (error) throw error
    return data.id
  }

  const createAppointment = async ({ clientId, staffId, price, paid, notes, piId }) => {
    const { data: appt, error } = await sb.from('appointments').insert({
      location_id: b.locationId,
      client_id: clientId, staff_id: staffId,
      start_time: startISO, end_time: endISO,
      duration_mins: q.duration, total_price: price,
      deposit_paid: paid, status,
      notes: notes || null, staff_notes: clashNote,
      stripe_payment_intent_id: piId,
      booked_online: true,
    }).select('id').single()
    if (error) {
      // Another request already saved this payment's booking (needs the unique index)
      if (error.code === '23505' && piId) throw Object.assign(new Error('duplicate'), { duplicate: true })
      throw error
    }

    const rows = [
      ...q.services.map((s, i) => ({
        appointment_id: appt.id, service_name: s.name, duration_mins: s.duration,
        price: b.isCouples ? s.price / 2 : s.price, sort_order: i,
      })),
      ...q.addons.map((a, i) => ({
        appointment_id: appt.id, service_name: `Add-on: ${a.name}`, duration_mins: a.duration,
        price: a.price, sort_order: q.services.length + i,
      })),
    ]
    const { error: svcErr } = await sb.from('appointment_services').insert(rows)
    if (svcErr) throw svcErr

    const { error: invErr } = await sb.from('invoices').insert({
      appointment_id: appt.id, client_id: clientId,
      subtotal: price, total: price, amount_paid: paid,
      status: paid >= price ? 'paid' : 'unpaid',
    })
    if (invErr) throw invErr
    return appt.id
  }

  // Money already received toward this booking (card payment + gift card)
  const credited = amountPaid + q.discount
  let ref
  try {
  if (b.isCouples) {
    const priceEach = q.total / 2
    const c1 = await upsertClient(b.customer)
    const c2 = await upsertClient(b.customer2)
    const appt1 = await createAppointment({
      clientId: c1, staffId: b.staff1Id, price: priceEach, paid: credited / 2,
      notes: b.customer.notes, piId: paymentIntentId,
    })
    await createAppointment({
      clientId: c2, staffId: b.staff2Id, price: priceEach, paid: credited / 2,
      notes: `Couples partner of booking ${refFor(appt1)}`, piId: null,
    })
    ref = refFor(appt1)
  } else {
    const c1 = await upsertClient(b.customer)
    const appt = await createAppointment({
      clientId: c1, staffId: b.staff1Id, price: q.total, paid: credited,
      notes: b.customer.notes, piId: paymentIntentId,
    })
    ref = refFor(appt)
  }
  } catch (err) {
    if (!err.duplicate) throw err
    const { data: existing } = await sb.from('appointments')
      .select('id').eq('stripe_payment_intent_id', paymentIntentId).limit(1)
    return { ref: existing?.length ? refFor(existing[0].id) : null, alreadySaved: true }
  }

  // Take the gift card amount off the card's balance
  if (b.giftCardCode && q.discount > 0) {
    const { data: gc } = await sb.from('gift_cards').select('id, remaining').eq('code', b.giftCardCode).maybeSingle()
    if (gc) {
      const remaining = Math.max(0, Number(gc.remaining) - q.discount)
      await sb.from('gift_cards').update({ remaining, is_active: remaining > 0 }).eq('id', gc.id)
    }
  }

  // Confirmation email (does nothing until an email service is connected)
  const staffName = DEFAULT_STAFF.find(s => s.id === b.staff1Id)?.name
  const email = await sendConfirmation({ ref, b, q, amountPaid, staffName })

  return { ref, alreadySaved: false, status, emailSent: !!email.sent }
}

// Saves the booking that belongs to a successful Stripe payment.
export async function saveFromPaymentIntent(pi) {
  if (!pi || pi.metadata?.vihara_booking !== '1') throw new BookingError('Not a Vihara booking payment.')
  if (pi.status !== 'succeeded') throw new BookingError('Payment has not gone through yet.', 402)
  const b = fromMetadata(pi.metadata)
  // Gift card was checked when the payment was set up; use that discount rather than re-checking
  const q = await quote(b, { checkGiftCard: false })
  q.discount = Number(pi.metadata.gc_discount || 0)
  return saveBooking(b, q, { paymentIntentId: pi.id, amountPaid: pi.amount_received / 100 })
}

export function sendError(res, err) {
  const status = err instanceof BookingError ? err.status : 500
  if (status >= 500) console.error('Booking API error:', err)
  const message = err instanceof BookingError ? err.message : 'Something went wrong. Please try again.'
  res.status(status).json({ error: message })
}
