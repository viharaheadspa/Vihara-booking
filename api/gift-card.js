import { db, sendError, BookingError } from './_lib/booking.js'

// Checks a gift card code and returns its balance.
// POST { code } → { code, remaining }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const code = typeof req.body?.code === 'string' ? req.body.code.trim().toUpperCase().slice(0, 40) : ''
    if (!code) throw new BookingError('Please enter a gift card code.')
    const { data, error } = await db().from('gift_cards')
      .select('code, remaining, expires_at, is_active').eq('code', code).maybeSingle()
    if (error || !data) throw new BookingError('Code not found.', 404)
    if (!data.is_active || Number(data.remaining) <= 0) throw new BookingError('This gift card has already been used or voided.')
    if (data.expires_at && new Date(data.expires_at) < new Date()) throw new BookingError('This gift card has expired.')
    res.status(200).json({ code: data.code, remaining: Number(data.remaining) })
  } catch (err) {
    sendError(res, err)
  }
}
