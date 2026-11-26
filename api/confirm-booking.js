import Stripe from 'stripe'
import {
  normalise, quote, checkTimeAndStaff, isSlotFree, saveBooking, saveFromPaymentIntent,
  sendError, BookingError,
} from './_lib/booking.js'

// Saves a booking.
//  • Paid bookings: { paymentIntentId } — we ask Stripe whether the payment really went
//    through, then save the booking from the details stored with the payment.
//  • Nothing to pay (e.g. gift card covers it all): { booking } — we re-check the price is $0.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { paymentIntentId, booking } = req.body || {}

    if (paymentIntentId) {
      if (!process.env.STRIPE_SECRET_KEY) throw new BookingError('Online payment is not available right now.', 503)
      if (typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
        throw new BookingError('Invalid payment reference.')
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
      const result = await saveFromPaymentIntent(pi)
      return res.status(200).json({ ref: result.ref })
    }

    const b = normalise(booking)
    const q = await quote(b)
    if (q.amount > 0) throw new BookingError('Payment is required for this booking.', 402)
    const { startISO, endISO } = checkTimeAndStaff(b, q)
    b.startISO = startISO
    const staffIds = [b.staff1Id, b.isCouples ? b.staff2Id : null].filter(Boolean)
    if (!(await isSlotFree(staffIds, startISO, endISO))) {
      throw new BookingError('Sorry, that time has just been booked. Please go back and choose another time.', 409)
    }
    const result = await saveBooking(b, q, { amountPaid: 0 })
    res.status(200).json({ ref: result.ref })
  } catch (err) {
    sendError(res, err)
  }
}
