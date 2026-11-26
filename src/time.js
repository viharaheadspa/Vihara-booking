// Melbourne time helpers. Shared by the booking page and the server.
// Melbourne is UTC+10 in winter and UTC+11 during daylight saving
// (early October to early April), so the offset must be worked out per date.

const TZ = 'Australia/Melbourne'

// Returns "+10:00" or "+11:00" for a date string like "2026-12-04".
export function melOffset(dateStr) {
  try {
    const d = new Date(`${dateStr}T12:00:00Z`)
    const part = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
      .formatToParts(d)
      .find(p => p.type === 'timeZoneName')
    const m = part && part.value.match(/GMT([+-]\d{2}:\d{2})/)
    if (m) return m[1]
  } catch {}
  // Fallback if the browser can't tell us: daylight saving runs roughly October to March
  const month = Number(String(dateStr).slice(5, 7))
  return month >= 10 || month <= 3 ? '+11:00' : '+10:00'
}

// ISO timestamp for a Melbourne wall-clock time on a given date.
export function melISO(dateStr, hour, minute = 0) {
  const h = String(hour).padStart(2, '0')
  const m = String(minute).padStart(2, '0')
  return new Date(`${dateStr}T${h}:${m}:00${melOffset(dateStr)}`).toISOString()
}

// Melbourne date ("YYYY-MM-DD") and minutes-past-midnight for an instant.
export function melParts(isoOrDate) {
  const d = new Date(isoOrDate)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map(p => [p.type, p.value])
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}
