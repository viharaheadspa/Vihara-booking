import { db, sendError, BookingError } from './_lib/booking.js'
import { melParts, melOffset } from '../src/time.js'

// Which therapists are busy on a date, so the booking page can show free times
// without being able to read client details from the database.
// POST { date: "YYYY-MM-DD", staffIds: [...] } → { busy: { staffId: [{start, end}] }, off: [staffId] }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { date, staffIds } = req.body || {}
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BookingError('Invalid date.')
    const ids = Array.isArray(staffIds) ? staffIds.filter(x => typeof x === 'string' && /^[0-9a-f-]{36}$/.test(x)).slice(0, 20) : []
    if (!ids.length) return res.status(200).json({ busy: {}, off: [] })

    const off = melOffset(date)
    const dayStart = new Date(`${date}T00:00:00${off}`).toISOString()
    const dayEnd = new Date(`${date}T23:59:59${off}`).toISOString()
    const sb = db()

    const [{ data: appts, error }, { data: daysOff }] = await Promise.all([
      sb.from('appointments').select('staff_id, start_time, end_time')
        .in('staff_id', ids).lt('start_time', dayEnd).gt('end_time', dayStart)
        .not('status', 'in', '("cancelled","no_show")'),
      sb.from('staff_days_off').select('staff_id').in('staff_id', ids).eq('off_date', date),
    ])
    if (error) throw new BookingError('Could not load availability.', 500)

    const busy = {}
    for (const a of appts || []) {
      const s = melParts(a.start_time), e = melParts(a.end_time)
      ;(busy[a.staff_id] = busy[a.staff_id] || []).push({
        start: s.date < date ? 0 : s.minutes,
        end: e.date > date ? 24 * 60 : e.minutes,
      })
    }
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ busy, off: (daysOff || []).map(d => d.staff_id) })
  } catch (err) {
    sendError(res, err)
  }
}
