// Simple checks for client details. Shared by the booking page and the server.

export function isEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
}

// Australian mobiles and landlines, with or without +61, spaces or dashes
export function isPhone(v) {
  if (typeof v !== 'string') return false
  const digits = v.replace(/[\s\-()]/g, '').replace(/^\+61/, '0').replace(/^61(?=\d{9}$)/, '0')
  return /^0\d{9}$/.test(digits) || /^\+?\d{8,15}$/.test(digits)
}
