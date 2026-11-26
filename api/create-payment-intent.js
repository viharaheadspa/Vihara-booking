import Stripe from 'stripe'
import { normalise, quote, checkTimeAndStaff, isSlotFree, toMetadata, sendError, BookingError } from './_lib/booking.js'

// Sets up a card payment for a booking.
// The amount is worked out HERE from the catalogue, never taken from the browser.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new BookingError('Online payment is not available right now.', 503)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const b = normalise(req.body?.booking)
    const q = await quote(b)
    const { startISO, endISO } = checkTimeAndStaff(b, q)
    b.startISO = startISO

    if (q.amount <= 0) throw new BookingError('Nothing to pay for this booking.')
    if (q.amount < 0.5) throw new BookingError('The amount to pay is too small to process by card. Please contact us.')

    const staffIds = [b.staff1Id, b.isCouples ? b.staff2Id : null].filter(Boolean)
    if (!(await isSlotFree(staffIds, startISO, endISO))) {
      throw new BookingError('Sorry, that time has just been booked. Please go back and choose another time.', 409)
    }

    const names = q.services.map(s => s.name).join(', ')
    const when = new Date(startISO).toLocaleString('en-AU', {
      timeZone: 'Australia/Melbourne', weekday: 'short', day: 'numeric', month: 'short',
      hour: 'numeric', minute: '2-digit',
    })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(q.amount * 100),
      currency: 'aud',
      description: `Vihara – ${names} – ${when} – ${b.customer.firstName} ${b.customer.lastName}`.slice(0, 1000),
      receipt_email: b.customer.email || undefined,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: toMetadata(b, q),
    })

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: q.amount,
    })
  } catch (err) {
    sendError(res, err)
  }
}
