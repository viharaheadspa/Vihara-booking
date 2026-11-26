import Stripe from 'stripe'
import { saveFromPaymentIntent } from './_lib/booking.js'

// Stripe calls this after every successful payment, separately from the client's browser.
// It's the safety net: if the client's phone drops out straight after paying,
// the booking still gets saved here.
//
// Needs STRIPE_WEBHOOK_SECRET in Vercel (from the webhook you create in the Stripe dashboard).

export const config = { api: { bodyParser: false } }

async function rawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Webhook not configured' })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let event
  try {
    event = stripe.webhooks.constructEvent(await rawBody(req), req.headers['stripe-signature'], secret)
  } catch (err) {
    console.error('Webhook signature check failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    if (pi.metadata?.vihara_booking === '1') {
      try {
        // Give the client's browser a few seconds to save it first, to avoid saving twice
        await new Promise(r => setTimeout(r, 5000))
        const result = await saveFromPaymentIntent(pi)
        console.log(`Webhook: booking ${result.ref} ${result.alreadySaved ? 'already saved' : 'saved'} for ${pi.id}`)
      } catch (err) {
        console.error('Webhook: could not save booking for', pi.id, err)
        // Tell Stripe to try again later
        return res.status(500).json({ error: 'Could not save booking' })
      }
    }
  }

  res.status(200).json({ received: true })
}
