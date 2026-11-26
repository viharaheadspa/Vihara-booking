// Booking confirmation emails, sent through Resend (resend.com).
// Switched off until RESEND_API_KEY is added in Vercel. Until then, bookings still
// save normally — clients just don't get the confirmation email (they still get the Stripe receipt).
//
// Vercel settings needed to switch it on:
//   RESEND_API_KEY      — from resend.com → API Keys
//   EMAIL_FROM          — e.g. "Vihara Head Spa <bookings@viharaheadspa.com.au>" (domain verified in Resend)
//   EMAIL_STAFF_COPY    — optional, e.g. "hello@viharaheadspa.com.au" to get a copy of every booking


const LOCATIONS = {
  '00000000-0000-0000-0000-000000000001': {
    name: 'Parkdale', address: '1 Chandler Street, Parkdale VIC 3195',
    note: '',
  },
  '00000000-0000-0000-0000-000000000002': {
    name: 'Dromana', address: 'Inside HUM Yoga & Pilates (level 1), 183 Point Nepean Rd, Dromana VIC 3936',
    note: 'Our Dromana space is upstairs, reached by a large flight of stairs. Please let us know if this is a concern.',
  },
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const money = (n) => Number.isInteger(Number(n)) ? `$${n}` : `$${Number(n).toFixed(2)}`

function when(startISO) {
  return new Date(startISO).toLocaleString('en-AU', {
    timeZone: 'Australia/Melbourne', weekday: 'long', day: 'numeric', month: 'long',
    hour: 'numeric', minute: '2-digit',
  })
}

export async function sendConfirmation({ ref, b, q, amountPaid, staffName }) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!key || !from || !b.customer.email) return { sent: false, reason: 'not configured' }

  const loc = LOCATIONS[b.locationId] || LOCATIONS['00000000-0000-0000-0000-000000000001']
  const paid = Number(amountPaid || 0) + Number(q.discount || 0)
  const balance = Math.max(0, q.total - paid)
  const items = [
    ...q.services.map(s => `${esc(s.name)} — ${s.duration} min`),
    ...q.addons.map(a => `Add-on: ${esc(a.name)}`),
  ]

  const html = `
  <div style="background:#F5EFE6;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;color:#3C2A1E">
    <div style="max-width:520px;margin:0 auto;background:#FBF8F3;border:1px solid #E5D9C8;border-radius:10px;padding:32px">
      <div style="text-align:center;letter-spacing:3px;font-size:13px;color:#8A7060">VIHARA HEAD SPA</div>
      <h1 style="font-weight:normal;text-align:center;font-size:26px;margin:16px 0 8px">Your ritual is booked</h1>
      <p style="text-align:center;color:#8A7060;margin:0 0 24px">Booking reference ${esc(ref)}</p>
      <p>Dear ${esc(b.customer.firstName)},</p>
      <p>Thank you for booking with us. We look forward to welcoming you.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:15px">
        <tr><td style="padding:6px 0;color:#8A7060;width:110px">When</td><td>${esc(when(b.startISO))}</td></tr>
        <tr><td style="padding:6px 0;color:#8A7060">Where</td><td>Vihara ${esc(loc.name)}<br>${esc(loc.address)}</td></tr>
        ${staffName ? `<tr><td style="padding:6px 0;color:#8A7060">With</td><td>${esc(staffName)}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#8A7060;vertical-align:top">Treatment</td><td>${items.join('<br>')}</td></tr>
        ${b.isCouples ? `<tr><td style="padding:6px 0;color:#8A7060">Guests</td><td>${esc(b.customer.firstName)} &amp; ${esc(b.customer2.firstName)}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#8A7060">Total</td><td>${money(q.total)}</td></tr>
        <tr><td style="padding:6px 0;color:#8A7060">Paid</td><td>${money(paid)}</td></tr>
        ${balance > 0 ? `<tr><td style="padding:6px 0;color:#8A7060">To pay on the day</td><td>${money(balance)}</td></tr>` : ''}
      </table>
      ${loc.note ? `<p style="font-size:14px;color:#6B5444">${esc(loc.note)}</p>` : ''}
      <p style="font-size:14px;color:#6B5444">Cancellations made within 48 hours of your appointment will forfeit the deposit. No-shows will be charged in full. If you need to reschedule, please contact us as soon as possible.</p>
      <p style="font-size:14px;color:#6B5444">Questions? Call us on 03 9279 2895 or reply to hello@viharaheadspa.com.au.</p>
      <p style="margin-top:28px">With warmth,<br>The Vihara team</p>
    </div>
  </div>`

  const text = [
    `Your ritual is booked — reference ${ref}`,
    `When: ${when(b.startISO)}`,
    `Where: Vihara ${loc.name}, ${loc.address}`,
    staffName ? `With: ${staffName}` : '',
    `Treatment: ${q.services.map(s => s.name).concat(q.addons.map(a => 'Add-on: ' + a.name)).join(', ')}`,
    `Total: ${money(q.total)} · Paid: ${money(paid)}${balance > 0 ? ` · To pay on the day: ${money(balance)}` : ''}`,
    loc.note,
    'Cancellations within 48 hours forfeit the deposit. No-shows are charged in full.',
    'Questions? 03 9279 2895 · hello@viharaheadspa.com.au',
  ].filter(Boolean).join('\n')

  const payload = {
    from,
    to: [b.customer.email],
    reply_to: 'hello@viharaheadspa.com.au',
    subject: `Your Vihara booking — ${when(b.startISO)}`,
    html, text,
  }
  if (process.env.EMAIL_STAFF_COPY) payload.bcc = [process.env.EMAIL_STAFF_COPY]

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('Confirmation email failed:', res.status, await res.text())
      return { sent: false, reason: `status ${res.status}` }
    }
    return { sent: true }
  } catch (err) {
    // Never let an email problem stop a booking from being saved
    console.error('Confirmation email error:', err)
    return { sent: false, reason: 'error' }
  }
}
