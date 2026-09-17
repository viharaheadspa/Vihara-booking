import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = import.meta.env.VITE_SUPABASE_URL
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null

// ── Local storage persistence ─────────────────────────────────────────────────
const STORAGE_KEY = 'spa-data-v3'
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed[key] !== undefined) return parsed[key]
    }
  } catch {}
  return fallback
}
function saveData(key, value) {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    raw[key] = value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw))
  } catch {}
}

// ── Default data ──────────────────────────────────────────────────────────────
const DEFAULT_ADDONS = [
  { id: 'ao1', name: 'Quiet Touch', duration: 30, price: 67 },
  { id: 'ao2', name: 'Blow Dry', duration: 30, price: 65 },
  { id: 'ao3', name: 'Sheet Face Mask', duration: 0, price: 30 },
  { id: 'ao4', name: 'Energy Realignment Ritual', duration: 15, price: 49 },
  { id: 'ao5', name: 'Facial Massage', duration: 15, price: 49 },
  { id: 'ao6', name: 'Hand and Arm Massage', duration: 15, price: 35 },
]

const DEFAULT_CATEGORIES = [
  {
    id: 'cat1',
    name: 'Japanese Head Spa',
    services: [
      {
        id: 's1', name: 'The Soul Spa', duration: 135, price: 360,
        description: 'Our most expansive head spa experience designed to nurture the body, calm the mind, and restore balance and wellbeing. Includes guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, hand and arm massage, chest exfoliation, third-eye oil ritual, herbal-infused water pours, aromatherapy, steam hair treatment, signature water therapy, sound healing, chakra crystal placement and energy work. Concludes with a personalised blow-dry finish.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: ['ao1','ao2','ao3','ao4','ao5'],
      },
      {
        id: 's2', name: 'The Vihara Signature Journey', duration: 90, price: 252,
        description: 'A 90-minute journey of deep relaxation designed to calm the nervous system, ease tension and support scalp and hair health. Includes guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, hand and arm massage, third-eye oil ritual, herbal-infused water pours, aromatherapy, signature water therapy and sound healing. Concludes with a personalised blow-dry finish.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: ['ao1','ao2','ao3','ao4','ao5'],
      },
      {
        id: 's3', name: 'Enlighten Ritual Head Spa', duration: 45, price: 159,
        description: 'A 45-minute introduction to the Vihara experience designed to calm the nervous system and restore balance. Includes guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, third-eye oil ritual, herbal-infused water pours, aromatherapy and signature water therapy. Concludes with nourishing hair products, towel drying and gentle detangling.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: ['ao1','ao2','ao3','ao4'],
      },
    ],
  },
  {
    id: 'cat2',
    name: 'For Him',
    services: [
      {
        id: 's4', name: 'His Grounded Journey', duration: 75, price: 220,
        description: 'A focused 75-minute head spa for men who are tired, tense and need proper time to switch off. Includes deep scalp and hair cleanse, gentle scalp exfoliation, warm water therapy, slow targeted massage through the head, neck and shoulders, grounding chest scrub, beard cleanse, and hand and arm massage. For the man who doesn\'t need another job to do — he just needs to stop for a while.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: ['ao2'],
      },
      {
        id: 's5', name: 'The Reset For Him', duration: 45, price: 156,
        description: 'A focused 45-minute head spa to clear the head, calm the body and give the scalp a proper reset. Includes deep scalp and hair cleanse, gentle scalp exfoliation, warm water therapy and slow targeted massage through the head, neck and shoulders. Simple, grounding and effective. For the man who doesn\'t need more to do — he just needs to stop for a while.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: ['ao2'],
      },
    ],
  },
  {
    id: 'cat3',
    name: 'Reiki',
    services: [
      {
        id: 's6', name: 'Initial Reiki Session', duration: 60, price: 159,
        description: 'A deeper journey into energetic restoration and nervous system support. This extended session moves through each energy centre with intention, releasing stored tension and emotional stagnation while gently guiding the body back into alignment. Through intuitive energy work, grounding rituals and intentional stillness, we create space for clarity, reconnection and inner steadiness. Ideal during periods of burnout, transition or emotional fatigue.',
        staff: ['30000000-0000-0000-0000-000000000001'], addons: [],
      },
      {
        id: 's7', name: 'Return Reiki Session', duration: 45, price: 110,
        description: 'A focused reset to bring your body and energy back into balance. Using gentle, intuitive energy work with light touch, this session supports the release of built-up stress, emotional tension and energetic heaviness. As your nervous system softens, space is created for clarity, grounding and calm. You\'ll leave feeling lighter, clearer and more centred.',
        staff: ['30000000-0000-0000-0000-000000000001'], addons: [],
      },
    ],
  },
  {
    id: 'cat4',
    name: 'Sensory Rituals',
    services: [
      {
        id: 's8', name: 'Quiet Touch', duration: 60, price: 159,
        description: 'A waterless ritual designed to provide deep emotional rest and nervous system support through gentle, intentional touch. Using soothing sensory tools, your practitioner creates soft tracing patterns across the back, arms, chest and scalp, encouraging the body to relax and the mind to slow. Inspired by the comforting feeling of having your hair played with as a child, this treatment evokes safety, calm and being deeply cared for.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: ['ao6'],
      },
      {
        id: 's9', name: 'Sound Alignment', duration: 60, price: 159,
        description: 'A calming, full-body experience designed to support deep relaxation and restore balance to the nervous system. Through therapeutic sound and subtle energetic support, the body is invited to release tension, settle the mind, and gently reset after periods of stress or mental fatigue. Each session is intuitive and responsive, meeting you where you are.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: [],
      },
      {
        id: 's10', name: 'Nervous System Reset', duration: 60, price: 159,
        description: 'A nurturing ritual designed to support deep rest, regulation and reconnection. Through gentle body rocking, rhythmic movement, supportive holding techniques and intentional touch, this treatment encourages the body to release tension and settle into safety and calm. Also includes sensory touch elements, chakra crystal placement and gentle energy work.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: ['ao6'],
      },
      {
        id: 's11', name: 'Cloud Ritual', duration: 45, price: 89,
        description: 'A gentle 45-minute escape into our sensory cloud chairs. Weighted blanket, eye mask and a soothing head massage blend with slow hair play to soften your mind and unravel tension. The perfect express ritual when your nervous system needs a moment.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: [],
      },
      {
        id: 's12', name: 'Cloud Ritual (30min)', duration: 30, price: 69,
        description: 'A gentle 30-minute escape into our sensory cloud chairs — weighted blanket, eye mask and soothing sound to help you soften and unwind.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: [],
      },
    ],
  },
  {
    id: 'cat5',
    name: 'Pregnancy & Postpartum',
    services: [
      {
        id: 's13', name: 'Sacred Mother To Be Retreat', duration: 135, price: 360,
        description: 'A 2-hour 15-minute deeply calming retreat created especially for mothers, available as a single or double treatment experience. Warm cascading water, slow rhythmic scalp massage and nourishing Oway treatments melt away tension through the scalp, neck and shoulders. Elevated with a soothing herbal foot bath, facial massage and a 30-minute Quiet Touch ritual. Concludes with a Vihara signature blow-dry.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003'], addons: ['ao3','ao4'],
      },
      {
        id: 's14', name: 'Expecting Mother to Be Ritual', duration: 75, price: 220,
        description: 'Created especially for mothers-to-be, this nurturing head spa ritual offers a moment of deep calm during pregnancy. Begins with our Enlighten Head Spa — warm cascading water, slow rhythmic scalp massage and nourishing Oway treatments. Gentle neck stretches, soothing massage techniques and carefully selected scalp tools encourage deep relaxation. Concludes with a Vihara signature blow-dry.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003'], addons: ['ao3'],
      },
      {
        id: 's15', name: 'Postpartum Cocoon', duration: 120, price: 344,
        description: 'A deeply nurturing 2-hour postpartum experience designed to cocoon mothers in care during the tender transition into motherhood. Each session is tailored to the mother\'s emotional, physical and nervous system needs on the day — blending warm water therapy, grounding scalp massage, hair and facial rituals, nervous system support, reiki, baby-safe sound healing and finishing styling. Babies are warmly welcomed throughout.',
        staff: ['30000000-0000-0000-0000-000000000002'], addons: ['ao3','ao4'],
      },
      {
        id: 's16', name: 'Somatic Birth Debrief', duration: 90, price: 252,
        description: 'A 90-minute deeply held experience for mothers who feel like parts of their birth are still living within their body. Blends somatic birth debriefing with nurturing touch-based therapies — may include somatic birth processing, nervous system regulation, grounding touch therapy, scalp massage, reiki, sound healing, quiet rest and integration. A space to soften, process and finally exhale after birth.',
        staff: ['30000000-0000-0000-0000-000000000002'], addons: [],
      },
    ],
  },
  {
    id: 'cat6',
    name: 'For Two',
    couples: true,
    services: [
      {
        id: 'cs1', name: 'The Soul Spa For Two', duration: 135, price: 720, couples: true,
        description: 'Our most expansive head spa experience, shared side by side with someone special. Each guest receives their own dedicated therapist and the full Soul Spa journey — guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, hand and arm massage, chest exfoliation, third-eye oil ritual, herbal-infused water pours, aromatherapy, steam hair treatment, signature water therapy, sound healing, chakra crystal placement and energy work. Concludes with a personalised blow-dry finish.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: [],
      },
      {
        id: 'cs2', name: 'The Vihara Signature Journey For Two', duration: 90, price: 504, couples: true,
        description: 'A 90-minute journey of deep relaxation, shared with someone you love. Each guest receives their own dedicated therapist and the full Signature Journey — guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, hand and arm massage, third-eye oil ritual, herbal-infused water pours, aromatherapy, signature water therapy and sound healing. Concludes with a personalised blow-dry finish.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: [],
      },
      {
        id: 'cs3', name: 'The Enlighten Ritual For Two', duration: 45, price: 318, couples: true,
        description: 'A 45-minute introduction to the Vihara experience, shared with someone special. Each guest receives their own dedicated therapist and the full Enlighten Ritual — guided meditation, scalp exfoliation and cleanse, therapeutic scalp and décolletage massage, third-eye oil ritual, herbal-infused water pours, aromatherapy and signature water therapy. Concludes with nourishing hair products, towel drying and gentle detangling.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: [],
      },
      {
        id: 'cs4', name: 'Quiet Touch For Two', duration: 60, price: 318, couples: true,
        description: 'A waterless ritual shared side by side — each guest receives their own dedicated therapist and the full Quiet Touch experience. Deep emotional rest and nervous system support through gentle, intentional touch. Using soothing sensory tools, your practitioner creates soft tracing patterns across the back, arms, chest and scalp, encouraging the body to relax and the mind to slow.',
        staff: ['30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003'], addons: [],
      },
    ],
  },
]

const DEFAULT_STAFF = [
  { id: '30000000-0000-0000-0000-000000000001', name: 'Bee', role: 'Head Spa Therapist & Reiki Practitioner' },
  { id: '30000000-0000-0000-0000-000000000002', name: 'Jesse', role: 'Postpartum Practitioner & Head Spa Therapist' },
  { id: '30000000-0000-0000-0000-000000000003', name: 'Sianne', role: 'Director & Head Spa Therapist' },
]

const DEFAULT_SETTINGS = {
  depositPercent: 50,
  couplesDepositPercent: 50,
  stripePublishableKey: '',
  cancellationPolicy: 'To secure your appointment, a deposit is required at the time of booking. Cancellations made within 48 hours of your appointment will forfeit the deposit. No-shows will be charged in full. Please contact us as soon as possible if you need to reschedule.',
  businessHoursStart: 9,
  businessHoursEnd: 18,
  slotInterval: 15,
  businessName: 'Vihara Head Spa & Blow Dry Lounge',
  businessAddress: '1 Chandler Street, Parkdale VIC 3195',
  adminPin: '1234',
}

// ── Locations ─────────────────────────────────────────────────────────────────
const LOCATIONS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    key: 'parkdale',
    name: 'Parkdale',
    address: '1 Chandler Street, Parkdale VIC 3195',
    detail: 'Parkdale',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    key: 'dromana',
    name: 'Dromana',
    address: '183 Point Nepean Rd, Dromana VIC 3936',
    detail: 'Inside HUM Yoga & Pilates, Dromana',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (mins) => {
  if (!mins) return '0 mins'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return [h && `${h} hr`, m && `${m} mins`].filter(Boolean).join(' ')
}

const fmtTime = (h, m = 0) => {
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${m.toString().padStart(2, '0')}${suffix}`
}

const fmtDate = (date) =>
  date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function generateSlots(settings, totalDuration, existingBookings = []) {
  const { businessHoursStart: start, businessHoursEnd: end, slotInterval: interval } = settings
  const slots = []
  let cur = start * 60
  while (cur + totalDuration <= end * 60) {
    const slotEnd = cur + totalDuration
    const conflict = existingBookings.some(b => cur < b.end && slotEnd > b.start)
    if (!conflict) {
      slots.push({ hour: Math.floor(cur / 60), minute: cur % 60 })
    }
    cur += interval
  }
  return slots
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SpaBookingSystem() {
  const isAdmin = window.location.pathname.startsWith('/admin')
  const payRef  = window.location.pathname.startsWith('/pay/') ? window.location.pathname.replace('/pay/', '').trim().toUpperCase() : null

  // Persisted data
  const [categories, setCategories] = useState(() => loadData('categories', DEFAULT_CATEGORIES))
  const [allAddons, setAllAddons] = useState(() => loadData('addons', DEFAULT_ADDONS))
  const [staff, setStaff] = useState(() => loadData('staff', DEFAULT_STAFF))
  const [settings, setSettings] = useState(() => loadData('settings', DEFAULT_SETTINGS))

  // Location selection (pre-booking)
  const [selectedLocation, setSelectedLocation] = useState(null) // null | LOCATIONS[n]

  // Booking state
  const [step, setStep] = useState(0)
  const [bookingFor, setBookingFor] = useState(null) // null | 'solo' | 'couple'
  const [expandedCats, setExpandedCats] = useState(new Set(['cat1']))
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedAddons, setSelectedAddons] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', mobile: '', notes: '' })
  const [customer2, setCustomer2] = useState({ firstName: '', lastName: '', email: '', mobile: '' })
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const [payChoice, setPayChoice] = useState('deposit') // 'deposit' | 'full'
  const [loading, setLoading] = useState(false)
  const [bookingRef, setBookingRef] = useState(null)

  // Admin tab + auth
  const [adminTab, setAdminTab] = useState('dashboard')
  const [adminAuthed, setAdminAuthed] = useState(false)

  // Persist changes
  useEffect(() => { saveData('categories', categories) }, [categories])
  useEffect(() => { saveData('addons', allAddons) }, [allAddons])
  useEffect(() => { saveData('staff', staff) }, [staff])
  useEffect(() => { saveData('settings', settings) }, [settings])

  // Derived values
  const allServices = useMemo(() => categories.flatMap(c => c.services), [categories])

  const chosenServices = useMemo(
    () => selectedServices.map(id => allServices.find(s => s.id === id)).filter(Boolean),
    [selectedServices, allServices]
  )

  const chosenAddons = useMemo(
    () => selectedAddons.map(id => allAddons.find(a => a.id === id)).filter(Boolean),
    [selectedAddons, allAddons]
  )

  const isCouples = bookingFor === 'couple'

  const visibleCategories = useMemo(() => {
    if (bookingFor === 'couple') return categories.filter(c => c.couples)
    if (bookingFor === 'solo') return categories.filter(c => !c.couples)
    return categories
  }, [categories, bookingFor])

  const totalDuration = useMemo(
    () => chosenServices.reduce((acc, s) => acc + s.duration, 0) +
          chosenAddons.reduce((acc, a) => acc + a.duration, 0),
    [chosenServices, chosenAddons]
  )

  const totalPrice = useMemo(
    () => chosenServices.reduce((acc, s) => acc + s.price, 0) +
          chosenAddons.reduce((acc, a) => acc + a.price, 0),
    [chosenServices, chosenAddons]
  )

  const depositAmount = useMemo(() => {
    const effectiveTotal = Math.max(0, totalPrice - giftCardDiscount)
    if (payChoice === 'full') return effectiveTotal
    const pct = isCouples ? settings.couplesDepositPercent : settings.depositPercent
    return Math.round(effectiveTotal * pct / 100)
  }, [totalPrice, isCouples, settings, payChoice, giftCardDiscount])

  // Eligible staff = staff who can perform ALL selected services
  const eligibleStaff = useMemo(() => {
    if (chosenServices.length === 0) return staff
    const eligible = new Set(chosenServices[0].staff || [])
    chosenServices.slice(1).forEach(s => {
      const sSet = new Set(s.staff || [])
      for (const id of [...eligible]) { if (!sSet.has(id)) eligible.delete(id) }
    })
    return staff.filter(s => eligible.has(s.id))
  }, [chosenServices, staff])

  // Add-ons relevant to selected services (union)
  const relevantAddons = useMemo(() => {
    if (chosenServices.length === 0) return []
    const ids = new Set(chosenServices.flatMap(s => s.addons || []))
    return allAddons.filter(a => ids.has(a.id))
  }, [chosenServices, allAddons])

  // Load time slots when date or staff changes
  useEffect(() => {
    if (!selectedDate) { setTimeSlots([]); return }
    let cancelled = false
    setLoading(true)
    const fetchSlots = async () => {
      let existingBookings = []
      if (supabase) {
        // Query appointments table using timestamptz range for the selected date (AEST)
        const dateStr = selectedDate.toLocaleDateString('en-CA') // YYYY-MM-DD in local time
        const dayStart = new Date(`${dateStr}T00:00:00+10:00`).toISOString()
        const dayEnd   = new Date(`${dateStr}T23:59:59+10:00`).toISOString()
        let q = supabase
          .from('appointments')
          .select('start_time, end_time')
          .gte('start_time', dayStart)
          .lte('start_time', dayEnd)
          .not('status', 'in', '("cancelled","no_show")')
        if (selectedStaff && selectedStaff !== 'no-preference') {
          q = q.eq('staff_id', selectedStaff)
        }
        const { data } = await q
        if (data) {
          existingBookings = data.map(b => {
            const s = new Date(b.start_time), e = new Date(b.end_time)
            return {
              start: s.getHours() * 60 + s.getMinutes(),
              end:   e.getHours() * 60 + e.getMinutes(),
            }
          })
        }
      }
      if (!cancelled) {
        setTimeSlots(generateSlots(settings, totalDuration, existingBookings))
        setLoading(false)
      }
    }
    fetchSlots()
    return () => { cancelled = true }
  }, [selectedDate, selectedStaff, totalDuration, settings])

  const groupedSlots = useMemo(() => ({
    morning: timeSlots.filter(s => s.hour < 12),
    afternoon: timeSlots.filter(s => s.hour >= 12),
  }), [timeSlots])

  // Actions
  const toggleService = (id) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setSelectedAddons([])
    setSelectedStaff(null)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const toggleCat = (id) => {
    setExpandedCats(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const goFromStep1 = () => {
    if (!selectedServices.length) return
    // Couples skip add-ons
    setStep(relevantAddons.length > 0 && !isCouples ? 2 : 3)
  }

  const goBackFromStep3 = () => setStep(relevantAddons.length > 0 && !isCouples ? 2 : 1)

  const submitBooking = async () => {
    setLoading(true)
    try {
      const dateStr  = selectedDate.toLocaleDateString('en-CA')
      const startMin = selectedTime.hour * 60 + selectedTime.minute
      const endMin   = startMin + totalDuration
      const startISO = new Date(`${dateStr}T${String(selectedTime.hour).padStart(2,'0')}:${String(selectedTime.minute).padStart(2,'0')}:00+10:00`).toISOString()
      const endISO   = new Date(`${dateStr}T${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}:00+10:00`).toISOString()

      // Staff assignment
      const staff1Id = (!selectedStaff || selectedStaff === 'no-preference')
        ? eligibleStaff[0]?.id ?? null
        : selectedStaff
      const staff2Id = eligibleStaff.find(s => s.id !== staff1Id)?.id ?? eligibleStaff[0]?.id ?? null

      let ref = `VH${Date.now().toString().slice(-6)}`

      const upsertClient = async (c) => {
        if (!c.email) return null
        const { data: existing } = await supabase.from('clients').select('id').eq('email', c.email).maybeSingle()
        if (existing) return existing.id
        const { data: newC, error } = await supabase.from('clients').insert({
          first_name: c.firstName, last_name: c.lastName || null,
          email: c.email || null, phone: c.mobile || null,
        }).select('id').single()
        if (error) throw error
        return newC.id
      }

      const createAppointmentRecord = async (clientId, staffId, price, paid, notes) => {
        const { data: appt, error } = await supabase.from('appointments').insert({
          location_id: selectedLocation?.id ?? '00000000-0000-0000-0000-000000000001',
          client_id: clientId, staff_id: staffId,
          start_time: startISO, end_time: endISO,
          duration_mins: totalDuration, total_price: price,
          deposit_paid: paid, status: 'confirmed',
          notes: notes || null, booked_online: true,
        }).select('id').single()
        if (error) throw error
        const svcRows = chosenServices.map((s, i) => ({
          appointment_id: appt.id, service_name: s.name,
          duration_mins: s.duration, price: isCouples ? s.price / 2 : s.price, sort_order: i,
        }))
        const { error: svcErr } = await supabase.from('appointment_services').insert(svcRows)
        if (svcErr) throw svcErr
        const { error: invErr } = await supabase.from('invoices').insert({
          appointment_id: appt.id, client_id: clientId,
          subtotal: price, total: price, amount_paid: paid,
          status: paid >= price ? 'paid' : 'unpaid',
        })
        if (invErr) throw invErr
        return appt.id
      }

      if (supabase) {
        if (isCouples) {
          // Each person pays half the total price
          const priceEach = totalPrice / 2
          const depositEach = depositAmount / 2
          const client1Id = await upsertClient(customer)
          const client2Id = await upsertClient(customer2)
          const appt1Id = await createAppointmentRecord(client1Id, staff1Id, priceEach, depositEach, customer.notes)
          await createAppointmentRecord(client2Id, staff2Id, priceEach, 0, `Couples partner of booking ${appt1Id.slice(-6).toUpperCase()}`)
          ref = `VH${appt1Id.slice(-6).toUpperCase()}`
        } else {
          const clientId = await upsertClient(customer)
          const apptId = await createAppointmentRecord(clientId, staff1Id, totalPrice, depositAmount, customer.notes)
          ref = `VH${apptId.slice(-6).toUpperCase()}`
        }
      }

      setBookingRef(ref)

      // Reduce gift card balance if one was applied
      if (appliedGiftCard && giftCardDiscount > 0 && supabase) {
        const newRemaining = Math.max(0, appliedGiftCard.remaining - giftCardDiscount)
        await supabase.from('gift_cards').update({
          remaining: newRemaining,
          is_active: newRemaining > 0,
        }).eq('id', appliedGiftCard.id)
      }

      setStep(7)
    } catch (err) {
      console.error('Booking error:', err)
      alert(`Something went wrong: ${err?.message || err?.code || JSON.stringify(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const resetBooking = () => {
    setSelectedLocation(null)
    setStep(0)
    setBookingFor(null)
    setSelectedServices([])
    setSelectedAddons([])
    setSelectedStaff(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setCustomer({ firstName: '', lastName: '', email: '', mobile: '', notes: '' })
    setCustomer2({ firstName: '', lastName: '', email: '', mobile: '' })
    setAgreedToPolicy(false)
    setPayChoice('deposit')
    setBookingRef(null)
  }

  if (payRef) {
    return <PaymentPage payRef={payRef} />
  }

  if (isAdmin) {
    if (!adminAuthed) {
      return <AdminPinEntry correctPin={settings.adminPin || '1234'} onSuccess={() => setAdminAuthed(true)} />
    }
    return (
      <AdminPanel
        categories={categories} setCategories={setCategories}
        allAddons={allAddons} setAllAddons={setAllAddons}
        staff={staff} setStaff={setStaff}
        settings={settings} setSettings={setSettings}
        adminTab={adminTab} setAdminTab={setAdminTab}
        onLogout={() => setAdminAuthed(false)}
      />
    )
  }

  // ── Booking UI ──────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <h1 style={S.logo}>{settings.businessName}</h1>
        <p style={S.logoSub}>
          {selectedLocation ? selectedLocation.detail : 'Japanese Head Spa & Blow Dry Lounge'}
        </p>
        {step > 0 && step < 7 && (
          <div style={S.progressBar}>
            {[1,2,3,4,5,6].filter(n => isCouples || n !== 5).map((n) => (
              <div key={n} style={{...S.progressDot, ...(step >= n ? S.progressActive : {})}} />
            ))}
          </div>
        )}
      </header>

      <main style={S.main}>
        {!selectedLocation && (
          <StepLocation onSelect={setSelectedLocation} />
        )}
        {selectedLocation && step === 0 && (
          <StepWhoIsThis
            onSelect={(v) => { setBookingFor(v); setStep(v === 'group' ? 'group' : 1) }}
            onBack={() => setSelectedLocation(null)}
            selectedLocation={selectedLocation}
          />
        )}
        {selectedLocation && step === 'group' && (
          <GroupBookingFlow
            soloCategories={categories.filter(c => !c.couples)}
            staff={staff}
            settings={settings}
            onBack={() => { setBookingFor(null); setStep(0) }}
            onDone={resetBooking}
          />
        )}
        {step === 1 && (
          <StepServices
            categories={visibleCategories}
            selectedServices={selectedServices}
            toggleService={toggleService}
            expandedCats={expandedCats}
            toggleCat={toggleCat}
            onContinue={goFromStep1}
            onBack={() => { setBookingFor(null); setSelectedServices([]); setStep(0) }}
          />
        )}
        {step === 2 && (
          <StepAddons
            relevantAddons={relevantAddons}
            selectedAddons={selectedAddons}
            setSelectedAddons={setSelectedAddons}
            onSkip={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepStaffTime
            eligibleStaff={eligibleStaff}
            selectedStaff={selectedStaff}
            isCouples={isCouples}
            setSelectedStaff={(v) => { setSelectedStaff(v); setSelectedDate(null); setSelectedTime(null) }}
            calMonth={calMonth}
            setCalMonth={setCalMonth}
            selectedDate={selectedDate}
            setSelectedDate={(d) => { setSelectedDate(d); setSelectedTime(null) }}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            groupedSlots={groupedSlots}
            loading={loading}
            onContinue={() => { if (selectedDate && selectedTime) setStep(4) }}
            onBack={goBackFromStep3}
          />
        )}
        {step === 4 && (
          <StepDetails
            title={isCouples ? 'Your details' : 'Your details'}
            customer={customer}
            setCustomer={setCustomer}
            agreedToPolicy={agreedToPolicy}
            setAgreedToPolicy={setAgreedToPolicy}
            cancellationPolicy={settings.cancellationPolicy}
            onContinue={() => {
              const ok = customer.firstName && customer.lastName && customer.email && customer.mobile && agreedToPolicy
              if (ok) setStep(isCouples ? 5 : 6)
            }}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && isCouples && (
          <StepPartnerDetails
            customer2={customer2}
            setCustomer2={setCustomer2}
            onContinue={() => {
              const ok = customer2.firstName && customer2.lastName && customer2.email && customer2.mobile
              if (ok) setStep(6)
            }}
            onBack={() => setStep(4)}
          />
        )}
        {step === 6 && (
          <StepPayment
            chosenServices={chosenServices}
            chosenAddons={chosenAddons}
            selectedStaff={selectedStaff}
            staff={staff}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            totalDuration={totalDuration}
            totalPrice={totalPrice}
            depositAmount={depositAmount}
            isCouples={isCouples}
            settings={settings}
            customer={customer}
            customer2={customer2}
            payChoice={payChoice}
            setPayChoice={setPayChoice}
            appliedGiftCard={appliedGiftCard}
            setAppliedGiftCard={setAppliedGiftCard}
            giftCardDiscount={giftCardDiscount}
            setGiftCardDiscount={setGiftCardDiscount}
            loading={loading}
            onConfirm={submitBooking}
            onBack={() => setStep(isCouples ? 5 : 4)}
          />
        )}
        {step === 7 && (
          <StepConfirmation
            bookingRef={bookingRef}
            chosenServices={chosenServices}
            chosenAddons={chosenAddons}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            customer={customer}
            customer2={isCouples ? customer2 : null}
            totalDuration={totalDuration}
            totalPrice={totalPrice}
            depositAmount={depositAmount}
            isCouples={isCouples}
            settings={settings}
            selectedLocation={selectedLocation}
            onNewBooking={resetBooking}
          />
        )}
      </main>

      {/* Floating booking summary */}
      {selectedLocation && step > 1 && step < 7 && chosenServices.length > 0 && (
        <div style={S.floatingSummary}>
          <div style={S.floatServices}>
            {chosenServices.map(s => s.name).join(' + ')}
            {chosenAddons.length > 0 && ` + ${chosenAddons.map(a => a.name).join(', ')}`}
          </div>
          <div style={S.floatPrice}>${totalPrice} · {fmt(totalDuration)}</div>
        </div>
      )}
    </div>
  )
}

// ── Step 0: Who Is This For ───────────────────────────────────────────────────
function StepWhoIsThis({ onSelect, onBack, selectedLocation }) {
  const isDromana = selectedLocation?.key === 'dromana'
  return (
    <div style={{...S.stepWrap, textAlign: 'center'}}>
      <h2 style={S.stepTitle}>Who is joining us?</h2>
      <p style={S.stepSub}>Let us know so we can tailor your booking</p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
        <button style={S.whoCard} onClick={() => onSelect('solo')}>
          <div style={S.whoIcon}>✦</div>
          <div style={S.whoTitle}>Just me</div>
          <div style={S.whoSub}>A solo treatment for one guest</div>
        </button>
        {!isDromana && (
          <button style={S.whoCard} onClick={() => onSelect('couple')}>
            <div style={S.whoIcon}>✦ ✦</div>
            <div style={S.whoTitle}>A couple</div>
            <div style={S.whoSub}>Two guests, side by side</div>
          </button>
        )}
        {!isDromana && (
          <button style={S.whoCard} onClick={() => onSelect('group')}>
            <div style={S.whoIcon}>✦ ✦ ✦</div>
            <div style={S.whoTitle}>2–3 Guests</div>
            <div style={S.whoSub}>A group of friends, each choosing their own treatment</div>
          </button>
        )}
      </div>
      {isDromana && (
        <p style={{...S.stepSub, marginTop: 20, fontStyle: 'italic'}}>Dromana is a single treatment room — solo bookings only.</p>
      )}
      <div style={{ marginTop: 32 }}>
        <button style={S.ghostBtn} onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}

// ── Step –1: Location Selection ───────────────────────────────────────────────
function StepLocation({ onSelect }) {
  return (
    <div style={{...S.stepWrap, textAlign: 'center'}}>
      <h2 style={S.stepTitle}>Choose your location</h2>
      <p style={S.stepSub}>Select the Vihara location you'd like to visit</p>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
        {LOCATIONS.map(loc => (
          <button key={loc.key} style={S.locationCard} onClick={() => onSelect(loc)}>
            <div style={S.locationIcon}>✦</div>
            <div style={S.locationName}>{loc.name}</div>
            <div style={S.locationAddress}>{loc.address}</div>
            {loc.key === 'dromana' && (
              <div style={S.locationTag}>Inside HUM Yoga & Pilates</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 1: Service Selection ─────────────────────────────────────────────────
function StepServices({ categories, selectedServices, toggleService, expandedCats, toggleCat, onContinue, onBack }) {
  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Select a service</h2>
      <p style={S.stepSub}>Choose one or more services for your visit</p>

      <div style={S.catList}>
        {categories.map(cat => (
          <div key={cat.id} style={S.catBlock}>
            <button style={S.catHeader} onClick={() => toggleCat(cat.id)}>
              <span>{cat.name}</span>
              <span style={{...S.chevron, ...(expandedCats.has(cat.id) ? S.chevronOpen : {})}}>›</span>
            </button>
            {expandedCats.has(cat.id) && (
              <div>
                {cat.services.map(svc => {
                  const sel = selectedServices.includes(svc.id)
                  return (
                    <label key={svc.id} style={{...S.svcRow, ...(sel ? S.svcRowSel : {})}}>
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => toggleService(svc.id)}
                        style={S.checkbox}
                      />
                      <div style={S.svcInfo}>
                        <div style={S.svcName}>{svc.name}</div>
                        <div style={S.svcMeta}>{fmt(svc.duration)} · ${svc.price}</div>
                        {svc.couples && <div style={S.couplesBadge}>For two guests</div>}
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{...S.btnRow, marginTop: 24}}>
        <button style={S.ghostBtn} onClick={onBack}>Back</button>
        {selectedServices.length > 0 && (
          <button style={S.primaryBtn} onClick={onContinue}>Continue</button>
        )}
      </div>
    </div>
  )
}

// ── Step 2: Add-ons ───────────────────────────────────────────────────────────
function StepAddons({ relevantAddons, selectedAddons, setSelectedAddons, onSkip, onBack }) {
  const toggle = (id) =>
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Clients also like…</h2>
      <p style={S.stepSub}>Would you like to add anything to your experience?</p>

      <div style={S.addonList}>
        {relevantAddons.map(addon => {
          const sel = selectedAddons.includes(addon.id)
          return (
            <label key={addon.id} style={{...S.addonRow, ...(sel ? S.addonRowSel : {})}}>
              <input
                type="checkbox"
                checked={sel}
                onChange={() => toggle(addon.id)}
                style={S.checkbox}
              />
              <div style={S.addonInfo}>
                <div style={S.addonName}>{addon.name}</div>
                <div style={S.addonMeta}>
                  {addon.duration > 0 ? `+${fmt(addon.duration)} · ` : ''}${addon.price}
                </div>
              </div>
            </label>
          )
        })}
      </div>

      <div style={S.btnRow}>
        <button style={S.ghostBtn} onClick={onBack}>Back</button>
        <button style={S.primaryBtn} onClick={onSkip}>
          {selectedAddons.length > 0 ? 'Continue' : 'Skip'}
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Staff + Date/Time ─────────────────────────────────────────────────
function StepStaffTime({
  eligibleStaff, selectedStaff, setSelectedStaff, isCouples,
  calMonth, setCalMonth,
  selectedDate, setSelectedDate,
  selectedTime, setSelectedTime,
  groupedSlots, loading,
  onContinue, onBack,
}) {
  const today = new Date(); today.setHours(0,0,0,0)
  const { year, month } = calMonth
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)

  const prevMonth = () => setCalMonth(prev => {
    const d = new Date(prev.year, prev.month - 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const nextMonth = () => setCalMonth(prev => {
    const d = new Date(prev.year, prev.month + 1, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const isDateSelected = (day) =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year

  const canContinue = selectedDate && selectedTime

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Choose your time</h2>
      {isCouples && (
        <p style={{...S.stepSub, marginBottom: 16}}>
          Two therapists will be assigned — one for each guest. Select a preferred therapist below, or choose first available.
        </p>
      )}

      {/* Staff selection */}
      <div style={S.staffGrid}>
        <button
          style={{...S.staffCard, ...(selectedStaff === 'no-preference' ? S.staffCardActive : {})}}
          onClick={() => setSelectedStaff('no-preference')}
        >
          <div style={S.staffInitial}>✦</div>
          <div style={S.staffName}>No preference</div>
          <div style={S.staffRole}>{isCouples ? 'First available pair' : 'First available'}</div>
        </button>
        {eligibleStaff.map(s => (
          <button
            key={s.id}
            style={{...S.staffCard, ...(selectedStaff === s.id ? S.staffCardActive : {})}}
            onClick={() => setSelectedStaff(s.id)}
          >
            <div style={S.staffInitial}>{s.name[0]}</div>
            <div style={S.staffName}>{s.name}</div>
            <div style={S.staffRole}>{s.role}</div>
          </button>
        ))}
      </div>

      {selectedStaff && (
        <>
          {/* Calendar */}
          <div style={S.calendar}>
            <div style={S.calHeader}>
              <button style={S.calNav} onClick={prevMonth}>‹</button>
              <span style={S.calMonthLabel}>{MONTHS[month]} {year}</span>
              <button style={S.calNav} onClick={nextMonth}>›</button>
            </div>
            <div style={S.calGrid}>
              {DAYS.map(d => <div key={d} style={S.calDayLbl}>{d}</div>)}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(year, month, day)
                const past = date < today
                return (
                  <button
                    key={day}
                    disabled={past}
                    onClick={() => !past && setSelectedDate(date)}
                    style={{
                      ...S.calDay,
                      ...(past ? S.calDayPast : {}),
                      ...(isDateSelected(day) ? S.calDaySelected : {}),
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div style={S.timeSection}>
              <h3 style={S.timeSectionTitle}>{fmtDate(selectedDate)}</h3>
              {loading ? (
                <p style={S.loadingText}>Finding available times…</p>
              ) : (
                <>
                  {groupedSlots.morning.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={S.timeGroupLabel}>Morning</div>
                      <div style={S.timeGrid}>
                        {groupedSlots.morning.map(slot => {
                          const sel = selectedTime?.hour === slot.hour && selectedTime?.minute === slot.minute
                          return (
                            <button
                              key={`${slot.hour}:${slot.minute}`}
                              style={{...S.timeSlot, ...(sel ? S.timeSlotSel : {})}}
                              onClick={() => setSelectedTime(slot)}
                            >
                              {fmtTime(slot.hour, slot.minute)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {groupedSlots.afternoon.length > 0 && (
                    <div>
                      <div style={S.timeGroupLabel}>Afternoon</div>
                      <div style={S.timeGrid}>
                        {groupedSlots.afternoon.map(slot => {
                          const sel = selectedTime?.hour === slot.hour && selectedTime?.minute === slot.minute
                          return (
                            <button
                              key={`${slot.hour}:${slot.minute}`}
                              style={{...S.timeSlot, ...(sel ? S.timeSlotSel : {})}}
                              onClick={() => setSelectedTime(slot)}
                            >
                              {fmtTime(slot.hour, slot.minute)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {!loading && groupedSlots.morning.length === 0 && groupedSlots.afternoon.length === 0 && (
                    <p style={S.noSlots}>No availability on this day — please try another date.</p>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      <div style={S.btnRow}>
        <button style={S.ghostBtn} onClick={onBack}>Back</button>
        <button
          style={{...S.primaryBtn, ...(!canContinue ? S.btnDisabled : {})}}
          onClick={onContinue}
          disabled={!canContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// ── Step 4: Customer Details ───────────────────────────────────────────────────
function StepDetails({ customer, setCustomer, agreedToPolicy, setAgreedToPolicy, cancellationPolicy, onContinue, onBack }) {
  const update = (field) => (e) => setCustomer(p => ({...p, [field]: e.target.value}))
  const canContinue = customer.firstName && customer.lastName && customer.email && customer.mobile && agreedToPolicy

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Your details</h2>

      <div style={S.formRow}>
        <div style={S.formField}>
          <label style={S.fieldLabel}>First name *</label>
          <input style={S.input} value={customer.firstName} onChange={update('firstName')} placeholder="First name" />
        </div>
        <div style={S.formField}>
          <label style={S.fieldLabel}>Last name *</label>
          <input style={S.input} value={customer.lastName} onChange={update('lastName')} placeholder="Last name" />
        </div>
      </div>

      <div style={S.formField}>
        <label style={S.fieldLabel}>Email *</label>
        <input style={S.input} type="email" value={customer.email} onChange={update('email')} placeholder="your@email.com" />
      </div>

      <div style={S.formField}>
        <label style={S.fieldLabel}>Mobile *</label>
        <input style={S.input} type="tel" value={customer.mobile} onChange={update('mobile')} placeholder="04XX XXX XXX" />
      </div>

      <div style={S.formField}>
        <label style={S.fieldLabel}>Notes (optional)</label>
        <textarea style={{...S.input, ...S.textarea}} value={customer.notes} onChange={update('notes')} placeholder="Anything we should know for your visit…" rows={3} />
      </div>

      {/* Cancellation policy */}
      <div style={S.policyBox}>
        <h3 style={S.policyTitle}>Cancellation Policy</h3>
        <p style={S.policyText}>{cancellationPolicy}</p>
        <label style={S.policyAgree}>
          <input
            type="checkbox"
            checked={agreedToPolicy}
            onChange={e => setAgreedToPolicy(e.target.checked)}
            style={{ marginRight: 10, accentColor: GOLD, width: 16, height: 16 }}
          />
          I have read and agree to the cancellation policy
        </label>
      </div>

      <div style={S.btnRow}>
        <button style={S.ghostBtn} onClick={onBack}>Back</button>
        <button
          style={{...S.primaryBtn, ...(!canContinue ? S.btnDisabled : {})}}
          onClick={onContinue}
          disabled={!canContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// ── Step 5: Partner Details (couples only) ────────────────────────────────────
function StepPartnerDetails({ customer2, setCustomer2, onContinue, onBack }) {
  const update = (field) => (e) => setCustomer2(p => ({...p, [field]: e.target.value}))
  const canContinue = customer2.firstName && customer2.lastName && customer2.email && customer2.mobile

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Your guest's details</h2>
      <p style={S.stepSub}>Please enter the details of the person joining you</p>

      <div style={S.formRow}>
        <div style={S.formField}>
          <label style={S.fieldLabel}>First name *</label>
          <input style={S.input} value={customer2.firstName} onChange={update('firstName')} placeholder="First name" />
        </div>
        <div style={S.formField}>
          <label style={S.fieldLabel}>Last name *</label>
          <input style={S.input} value={customer2.lastName} onChange={update('lastName')} placeholder="Last name" />
        </div>
      </div>
      <div style={S.formField}>
        <label style={S.fieldLabel}>Email *</label>
        <input style={S.input} type="email" value={customer2.email} onChange={update('email')} placeholder="their@email.com" />
      </div>
      <div style={S.formField}>
        <label style={S.fieldLabel}>Mobile *</label>
        <input style={S.input} type="tel" value={customer2.mobile} onChange={update('mobile')} placeholder="04XX XXX XXX" />
      </div>

      <div style={S.btnRow}>
        <button style={S.ghostBtn} onClick={onBack}>Back</button>
        <button
          style={{...S.primaryBtn, ...(!canContinue ? S.btnDisabled : {})}}
          onClick={onContinue}
          disabled={!canContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// ── Step 6: Payment ───────────────────────────────────────────────────────────
function StepPayment({
  chosenServices, chosenAddons, selectedStaff, staff,
  selectedDate, selectedTime, totalDuration, totalPrice,
  depositAmount, isCouples, settings, customer, customer2,
  payChoice, setPayChoice,
  appliedGiftCard, setAppliedGiftCard, giftCardDiscount, setGiftCardDiscount,
  loading, onConfirm, onBack,
}) {
  const staffMember = staff.find(s => s.id === selectedStaff)
  const endMin = selectedTime.hour * 60 + selectedTime.minute + totalDuration
  const effectiveTotal = Math.max(0, totalPrice - giftCardDiscount)
  const minDeposit = Math.round(effectiveTotal * (isCouples ? settings.couplesDepositPercent : settings.depositPercent) / 100)
  const [gcInput, setGcInput] = React.useState('')
  const [gcError, setGcError] = React.useState('')
  const [gcLoading, setGcLoading] = React.useState(false)

  async function applyGiftCard() {
    const code = gcInput.trim().toUpperCase()
    if (!code) return
    setGcLoading(true)
    setGcError('')
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = import.meta.env.VITE_SUPABASE_URL
        ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
        : null
      if (!sb) { setGcError('Gift cards not available offline.'); setGcLoading(false); return }
      const { data, error } = await sb.from('gift_cards')
        .select('id, code, remaining, expires_at, is_active')
        .eq('code', code)
        .maybeSingle()
      if (error || !data) { setGcError('Code not found.'); setGcLoading(false); return }
      if (!data.is_active) { setGcError('This gift card has already been used or voided.'); setGcLoading(false); return }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setGcError('This gift card has expired.'); setGcLoading(false); return }
      if (data.remaining <= 0) { setGcError('No remaining balance on this gift card.'); setGcLoading(false); return }
      const discount = Math.min(data.remaining, totalPrice)
      setAppliedGiftCard({ id: data.id, code: data.code, remaining: data.remaining })
      setGiftCardDiscount(discount)
      setGcInput('')
      setGcError('')
    } catch(e) { setGcError('Could not validate code. Please try again.') }
    setGcLoading(false)
  }

  function removeGiftCard() {
    setAppliedGiftCard(null)
    setGiftCardDiscount(0)
    setGcError('')
  }

  // ── Stripe ────────────────────────────────────────────────────────────────
  const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  const stripeRef = React.useRef(null)
  const cardMountRef = React.useRef(null)
  const cardElementRef = React.useRef(null)
  const [payLoading, setPayLoading] = React.useState(false)
  const [cardError, setCardError] = React.useState('')
  const [stripeLoaded, setStripeLoaded] = React.useState(false)

  React.useEffect(() => {
    if (!PUBLISHABLE_KEY) return
    let mounted = true
    import('@stripe/stripe-js').then(({ loadStripe }) => {
      loadStripe(PUBLISHABLE_KEY).then(stripe => {
        if (!mounted || !stripe || !cardMountRef.current) return
        stripeRef.current = stripe
        const elements = stripe.elements()
        const card = elements.create('card', {
          style: {
            base: {
              fontFamily: 'Lato, sans-serif',
              fontSize: '16px',
              color: '#3C2A1E',
              '::placeholder': { color: '#B8A898' },
            }
          }
        })
        card.mount(cardMountRef.current)
        cardElementRef.current = card
        card.on('change', e => setCardError(e.error?.message || ''))
        setStripeLoaded(true)
      })
    })
    return () => {
      mounted = false
      if (cardElementRef.current) {
        try { cardElementRef.current.destroy() } catch(e) {}
      }
    }
  }, [PUBLISHABLE_KEY])

  async function handleConfirm() {
    const amountToPay = depositAmount

    // Gift card covered everything — skip Stripe
    if (amountToPay <= 0) {
      onConfirm()
      return
    }

    if (!PUBLISHABLE_KEY || !stripeRef.current || !cardElementRef.current) {
      onConfirm()
      return
    }

    setPayLoading(true)
    setCardError('')

    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToPay,
          description: `Vihara Head Spa – ${customer.firstName} ${customer.lastName}`,
        })
      })
      const { clientSecret, error: piError } = await res.json()
      if (piError) throw new Error(piError)

      const { error: stripeError } = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElementRef.current,
          billing_details: {
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            phone: customer.mobile || undefined,
          }
        }
      })

      if (stripeError) {
        setCardError(stripeError.message)
        setPayLoading(false)
        return
      }

      // Payment succeeded — save the booking
      onConfirm()
    } catch(e) {
      setCardError(e.message || 'Payment failed. Please try again.')
      setPayLoading(false)
    }
  }

  return (
    <div style={S.stepWrap}>
      <h2 style={S.stepTitle}>Review & confirm</h2>

      {/* Booking summary card */}
      <div style={S.summaryCard}>
        <div style={S.summarySection}>
          <div style={S.summaryLabel}>Services</div>
          {chosenServices.map(s => (
            <div key={s.id} style={S.summaryRow}>
              <span>{s.name}</span><span>${s.price}</span>
            </div>
          ))}
          {chosenAddons.map(a => (
            <div key={a.id} style={S.summaryRow}>
              <span>{a.name}</span><span>${a.price}</span>
            </div>
          ))}
          <div style={{...S.summaryRow, ...S.summaryTotal}}>
            <span>Total</span><span>${totalPrice}</span>
          </div>
        </div>

        <div style={S.summarySection}>
          <div style={S.summaryLabel}>Appointment</div>
          <div style={S.summaryRow}><span>Date</span><span>{fmtDate(selectedDate)}</span></div>
          <div style={S.summaryRow}>
            <span>Time</span>
            <span>{fmtTime(selectedTime.hour, selectedTime.minute)} – {fmtTime(Math.floor(endMin/60), endMin%60)}</span>
          </div>
          <div style={S.summaryRow}><span>Duration</span><span>{fmt(totalDuration)}</span></div>
          <div style={S.summaryRow}><span>Specialist</span><span>{staffMember?.name || 'First available'}</span></div>
        </div>

        <div style={S.summarySection}>
          <div style={S.summaryLabel}>{isCouples ? 'Guest 1' : 'Guest'}</div>
          <div style={S.summaryRow}><span>Name</span><span>{customer.firstName} {customer.lastName}</span></div>
          <div style={S.summaryRow}><span>Email</span><span>{customer.email}</span></div>
          <div style={S.summaryRow}><span>Mobile</span><span>{customer.mobile}</span></div>
        </div>
        {isCouples && (
          <div style={S.summarySection}>
            <div style={S.summaryLabel}>Guest 2</div>
            <div style={S.summaryRow}><span>Name</span><span>{customer2.firstName} {customer2.lastName}</span></div>
            <div style={S.summaryRow}><span>Email</span><span>{customer2.email}</span></div>
            <div style={S.summaryRow}><span>Mobile</span><span>{customer2.mobile}</span></div>
          </div>
        )}
      </div>

      {/* Deposit/full pay choice */}
      <div style={S.depositBox}>
        <div style={S.depositTitle}>Payment required to confirm</div>
        <div style={S.payChoiceRow}>
          <label style={S.payChoice}>
            <input type="radio" name="pay" value="deposit" checked={payChoice === 'deposit'} onChange={() => setPayChoice('deposit')} style={{ marginRight: 8 }} />
            Pay 50% deposit — ${minDeposit}
            {isCouples && <span style={{ display: 'block', fontSize: 12, color: '#8A7060', marginTop: 2 }}>Each guest pays the remaining 50% on the day</span>}
          </label>
          <label style={S.payChoice}>
            <input type="radio" name="pay" value="full" checked={payChoice === 'full'} onChange={() => setPayChoice('full')} style={{ marginRight: 8 }} />
            Pay in full — ${totalPrice}
          </label>
        </div>
        <div style={S.depositNote}>
          A 50% deposit is required to secure your booking. The remaining balance is payable on the day.
        </div>
      </div>

      {/* Gift card redemption */}
      <div style={S.depositBox}>
        <div style={S.depositTitle}>Have a gift card?</div>
        {appliedGiftCard ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div style={{ flex: 1, background: '#f0ece6', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#3C2A1E' }}>
              <strong>{appliedGiftCard.code}</strong> — ${giftCardDiscount} credit applied
              {giftCardDiscount < appliedGiftCard.remaining && (
                <span style={{ fontSize: 12, color: '#8A7060', display: 'block' }}>
                  ${appliedGiftCard.remaining - giftCardDiscount} remaining on card after this booking
                </span>
              )}
            </div>
            <button style={S.ghostBtn} onClick={removeGiftCard}>Remove</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <input
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #D4C5B0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#FAF6F0', color: '#3C2A1E' }}
              placeholder="Enter gift card code"
              value={gcInput}
              onChange={e => setGcInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && applyGiftCard()}
            />
            <button style={S.primaryBtn} onClick={applyGiftCard} disabled={gcLoading || !gcInput.trim()}>
              {gcLoading ? '…' : 'Apply'}
            </button>
          </div>
        )}
        {gcError && <div style={{ color: '#b44', fontSize: 13, marginTop: 6 }}>{gcError}</div>}
        {giftCardDiscount > 0 && (
          <div style={{ marginTop: 10, fontSize: 14, color: '#3C2A1E' }}>
            Original total: <s>${totalPrice}</s> → <strong>${effectiveTotal} after gift card</strong>
          </div>
        )}
      </div>

      {/* Stripe card input */}
      {depositAmount > 0 && (
        <div style={S.stripeBox}>
          {PUBLISHABLE_KEY ? (
            <>
              <div style={S.stripeLabel}>Secure card payment</div>
              <div ref={cardMountRef} style={{ padding: '12px 4px', minHeight: 44 }} />
              {!stripeLoaded && (
                <div style={{ fontSize: 13, color: '#9A8878', textAlign: 'center', padding: '8px 0' }}>Loading payment form…</div>
              )}
              {cardError && (
                <div style={{ color: '#c0392b', fontSize: 13, marginTop: 8 }}>{cardError}</div>
              )}
              <div style={{ fontSize: 12, color: '#9A8878', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🔒</span> Payments secured by Stripe
              </div>
            </>
          ) : (
            <p style={S.stripeNote}>
              ⚠️ Online payment not yet configured. Your booking will be confirmed and we'll collect payment at your appointment.
            </p>
          )}
        </div>
      )}

      <div style={S.btnRow}>
        <button style={S.ghostBtn} onClick={onBack} disabled={loading || payLoading}>Back</button>
        <button
          style={S.primaryBtn}
          onClick={handleConfirm}
          disabled={loading || payLoading || (depositAmount > 0 && PUBLISHABLE_KEY && !stripeLoaded)}
        >
          {(loading || payLoading) ? 'Processing…' : depositAmount > 0 ? `Pay $${depositAmount}` : 'Confirm booking'}
        </button>
      </div>
    </div>
  )
}

// ── Step 7: Confirmation ──────────────────────────────────────────────────────
function StepConfirmation({
  bookingRef, chosenServices, chosenAddons,
  selectedDate, selectedTime, customer, customer2,
  totalDuration, totalPrice, depositAmount,
  isCouples, settings, selectedLocation, onNewBooking,
}) {
  const endMin = selectedTime.hour * 60 + selectedTime.minute + totalDuration
  return (
    <div style={{...S.stepWrap, textAlign: 'center'}}>
      <div style={S.confirmIcon}>✓</div>
      <h2 style={S.stepTitle}>You're booked in!</h2>
      <p style={S.stepSub}>
        {isCouples
          ? `Confirmations have been sent to ${customer.email} and ${customer2?.email}`
          : `A confirmation has been sent to ${customer.email}`}
      </p>

      <div style={S.confirmCard}>
        <div style={S.confirmRef}>Booking ref: {bookingRef}</div>
        <div style={S.confirmService}>{chosenServices.map(s => s.name).join(' + ')}</div>
        {chosenAddons.length > 0 && (
          <div style={S.confirmMeta}>{chosenAddons.map(a => a.name).join(' · ')}</div>
        )}
        <div style={S.confirmMeta}>{fmtDate(selectedDate)}</div>
        <div style={S.confirmMeta}>
          {fmtTime(selectedTime.hour, selectedTime.minute)} – {fmtTime(Math.floor(endMin/60), endMin%60)} ({fmt(totalDuration)})
        </div>
        <div style={{...S.confirmMeta, marginTop: 12, fontWeight: 600}}>
          Deposit: ${depositAmount} / Total: ${totalPrice}
        </div>
      </div>

      <p style={S.confirmAddress}>
        {settings.businessName}<br />
        {selectedLocation ? selectedLocation.address : settings.businessAddress}
        {selectedLocation?.key === 'dromana' && <><br /><span style={{ fontStyle: 'italic' }}>Inside HUM Yoga & Pilates</span></>}
      </p>
      <button style={S.ghostBtn} onClick={onNewBooking}>Make another booking</button>
    </div>
  )
}

// ── Group Booking Flow (2–3 Guests) ──────────────────────────────────────────
function GroupBookingFlow({ soloCategories, staff, settings, onBack, onDone }) {
  const allSoloServices = soloCategories.flatMap(c => c.services)
  const [gStep, setGStep] = useState('size') // size → services → datetime → details → payment → confirmed
  const [groupSize, setGroupSize] = useState(2)
  const [guestServices, setGuestServices] = useState([null, null, null])
  const [expandedCats, setExpandedCats] = useState(new Set([soloCategories[0]?.id]))
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() } })
  const [currentGuest, setCurrentGuest] = useState(0)
  const [guestDetails, setGuestDetails] = useState([
    { firstName: '', lastName: '', email: '', mobile: '' },
    { firstName: '', lastName: '', email: '', mobile: '' },
    { firstName: '', lastName: '', email: '', mobile: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [bookingRef, setBookingRef] = useState(null)

  const guests = Array.from({ length: groupSize }, (_, i) => i)
  const longestDuration = Math.max(...guestServices.slice(0, groupSize).map(id => allSoloServices.find(s => s.id === id)?.duration || 0))
  const totalPrice = guestServices.slice(0, groupSize).reduce((acc, id) => acc + (allSoloServices.find(s => s.id === id)?.price || 0), 0)

  // Load time slots
  useEffect(() => {
    if (!selectedDate || longestDuration === 0) { setTimeSlots([]); return }
    let cancelled = false
    setLoadingSlots(true)
    const fetchSlots = async () => {
      let existing = []
      if (supabase) {
        const dateStr = selectedDate.toLocaleDateString('en-CA')
        const dayStart = new Date(`${dateStr}T00:00:00+10:00`).toISOString()
        const dayEnd = new Date(`${dateStr}T23:59:59+10:00`).toISOString()
        const { data } = await supabase.from('appointments').select('start_time, end_time, staff_id')
          .gte('start_time', dayStart).lte('start_time', dayEnd).not('status', 'in', '("cancelled","no_show")')
        if (data) existing = data.map(a => ({
          start: new Date(a.start_time).getHours() * 60 + new Date(a.start_time).getMinutes(),
          end: new Date(a.end_time).getHours() * 60 + new Date(a.end_time).getMinutes(),
        }))
      }
      if (!cancelled) {
        setTimeSlots(generateSlots(settings, longestDuration, existing))
        setLoadingSlots(false)
      }
    }
    fetchSlots().catch(() => { if (!cancelled) setLoadingSlots(false) })
    return () => { cancelled = true }
  }, [selectedDate, longestDuration])

  const groupedSlots = {
    morning: timeSlots.filter(s => s.hour < 12),
    afternoon: timeSlots.filter(s => s.hour >= 12),
  }

  const submitGroupBooking = async () => {
    setLoading(true)
    try {
      const dateStr = selectedDate.toLocaleDateString('en-CA')
      const startMin = selectedTime.hour * 60 + selectedTime.minute
      const startISO = new Date(`${dateStr}T${String(selectedTime.hour).padStart(2,'0')}:${String(selectedTime.minute).padStart(2,'0')}:00+10:00`).toISOString()
      let refs = []

      const upsertClient = async (c) => {
        if (!supabase || !c.email) return null
        const { data: ex } = await supabase.from('clients').select('id').eq('email', c.email).maybeSingle()
        if (ex) return ex.id
        const { data: nc, error } = await supabase.from('clients').insert({ first_name: c.firstName, last_name: c.lastName || null, email: c.email || null, phone: c.mobile || null }).select('id').single()
        if (error) throw error
        return nc.id
      }

      for (let i = 0; i < groupSize; i++) {
        const svc = allSoloServices.find(s => s.id === guestServices[i])
        if (!svc) continue
        const endMin = startMin + svc.duration
        const endISO = new Date(`${dateStr}T${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}:00+10:00`).toISOString()
        const staffId = staff[i % staff.length]?.id ?? null

        if (supabase) {
          const clientId = await upsertClient(guestDetails[i])
          const { data: appt, error: aErr } = await supabase.from('appointments').insert({
            location_id: selectedLocation?.id ?? '00000000-0000-0000-0000-000000000001',
            client_id: clientId, staff_id: staffId,
            start_time: startISO, end_time: endISO,
            duration_mins: svc.duration, total_price: svc.price,
            deposit_paid: svc.price, status: 'confirmed',
            notes: `Group booking — ${groupSize} guests`, booked_online: true,
          }).select('id').single()
          if (aErr) throw aErr
          await supabase.from('appointment_services').insert([{ appointment_id: appt.id, service_name: svc.name, duration_mins: svc.duration, price: svc.price, sort_order: 0 }])
          await supabase.from('invoices').insert({ appointment_id: appt.id, client_id: clientId, subtotal: svc.price, total: svc.price, amount_paid: svc.price, status: 'paid' })
          refs.push(`VH${appt.id.slice(-6).toUpperCase()}`)
        } else {
          refs.push(`VH${Date.now().toString().slice(-6)}`)
        }
      }
      setBookingRef(refs[0])
      setGStep('confirmed')
    } catch (err) {
      console.error(err)
      alert(`Something went wrong: ${err?.message || JSON.stringify(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date(); today.setHours(0,0,0,0)
  const { year, month } = calMonth
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)

  if (gStep === 'confirmed') {
    const endMin = selectedTime.hour * 60 + selectedTime.minute + longestDuration
    return (
      <div style={{...S.stepWrap, textAlign: 'center'}}>
        <div style={S.confirmIcon}>✓</div>
        <h2 style={S.stepTitle}>You're all booked in!</h2>
        <p style={S.stepSub}>Confirmations have been sent to each guest</p>
        <div style={S.confirmCard}>
          <div style={S.confirmRef}>Booking ref: {bookingRef}</div>
          <div style={S.confirmService}>{groupSize} guests · {fmtDate(selectedDate)}</div>
          <div style={S.confirmMeta}>{fmtTime(selectedTime.hour, selectedTime.minute)} – {fmtTime(Math.floor(endMin/60), endMin%60)}</div>
          <div style={{...S.confirmMeta, marginTop: 12, fontWeight: 600}}>Total: ${totalPrice} (paid in full)</div>
        </div>
        <p style={S.confirmAddress}>{settings.businessName}<br />{settings.businessAddress}</p>
        <button style={S.ghostBtn} onClick={onDone}>Make another booking</button>
      </div>
    )
  }

  if (gStep === 'size') {
    return (
      <div style={{...S.stepWrap, textAlign: 'center'}}>
        <h2 style={S.stepTitle}>How many guests?</h2>
        <p style={S.stepSub}>We have three treatment rooms — up to 3 friends can be seen at the same time</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32 }}>
          {[2, 3].map(n => (
            <button key={n} style={{...S.whoCard, maxWidth: 160, ...(groupSize === n ? { borderColor: '#904C21', background: '#FBF5EA' } : {})}}
              onClick={() => setGroupSize(n)}>
              <div style={S.whoTitle}>{n} guests</div>
            </button>
          ))}
        </div>
        <div style={{...S.btnRow, marginTop: 32, justifyContent: 'center'}}>
          <button style={S.ghostBtn} onClick={onBack}>Back</button>
          <button style={S.primaryBtn} onClick={() => setGStep('services')}>Continue</button>
        </div>
      </div>
    )
  }

  if (gStep === 'services') {
    const allSelected = guests.every(i => guestServices[i])
    return (
      <div style={S.stepWrap}>
        <h2 style={S.stepTitle}>Select a service for each guest</h2>
        <p style={S.stepSub}>Each guest can choose any treatment they like</p>
        {guests.map(i => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#904C21', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Guest {i + 1}</div>
            <select
              style={{...S.input, cursor: 'pointer'}}
              value={guestServices[i] || ''}
              onChange={e => { const next = [...guestServices]; next[i] = e.target.value || null; setGuestServices(next) }}
            >
              <option value="">— Select a service —</option>
              {soloCategories.map(cat => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.services.map(svc => (
                    <option key={svc.id} value={svc.id}>{svc.name} · {fmt(svc.duration)} · ${svc.price}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        ))}
        <div style={S.btnRow}>
          <button style={S.ghostBtn} onClick={() => setGStep('size')}>Back</button>
          <button style={{...S.primaryBtn, ...(!allSelected ? S.btnDisabled : {})}} disabled={!allSelected} onClick={() => setGStep('datetime')}>Continue</button>
        </div>
      </div>
    )
  }

  if (gStep === 'datetime') {
    return (
      <div style={S.stepWrap}>
        <h2 style={S.stepTitle}>Choose a date & time</h2>
        <p style={S.stepSub}>All guests will be seen at the same time</p>
        <div style={S.calendar}>
          <div style={S.calHeader}>
            <button style={S.calNav} onClick={() => setCalMonth(p => { const d = new Date(p.year, p.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })}>‹</button>
            <span style={S.calMonthLabel}>{MONTHS[month]} {year}</span>
            <button style={S.calNav} onClick={() => setCalMonth(p => { const d = new Date(p.year, p.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })}>›</button>
          </div>
          <div style={S.calGrid}>
            {DAYS.map(d => <div key={d} style={S.calDayLbl}>{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1; const date = new Date(year, month, day); const past = date < today
              return (
                <button key={day} disabled={past} onClick={() => { if (!past) { setSelectedDate(date); setSelectedTime(null) } }}
                  style={{ ...S.calDay, ...(past ? S.calDayPast : {}), ...(selectedDate?.getDate() === day && selectedDate?.getMonth() === month ? S.calDaySelected : {}) }}>
                  {day}
                </button>
              )
            })}
          </div>
        </div>
        {selectedDate && (
          <div style={S.timeSection}>
            <h3 style={S.timeSectionTitle}>{fmtDate(selectedDate)}</h3>
            {loadingSlots ? <p style={S.loadingText}>Finding available times…</p> : (
              <>
                {groupedSlots.morning.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={S.timeGroupLabel}>Morning</div>
                    <div style={S.timeGrid}>
                      {groupedSlots.morning.map(slot => {
                        const sel = selectedTime?.hour === slot.hour && selectedTime?.minute === slot.minute
                        return <button key={`${slot.hour}:${slot.minute}`} style={{...S.timeSlot, ...(sel ? S.timeSlotSel : {})}} onClick={() => setSelectedTime(slot)}>{fmtTime(slot.hour, slot.minute)}</button>
                      })}
                    </div>
                  </div>
                )}
                {groupedSlots.afternoon.length > 0 && (
                  <div>
                    <div style={S.timeGroupLabel}>Afternoon</div>
                    <div style={S.timeGrid}>
                      {groupedSlots.afternoon.map(slot => {
                        const sel = selectedTime?.hour === slot.hour && selectedTime?.minute === slot.minute
                        return <button key={`${slot.hour}:${slot.minute}`} style={{...S.timeSlot, ...(sel ? S.timeSlotSel : {})}} onClick={() => setSelectedTime(slot)}>{fmtTime(slot.hour, slot.minute)}</button>
                      })}
                    </div>
                  </div>
                )}
                {!loadingSlots && groupedSlots.morning.length === 0 && groupedSlots.afternoon.length === 0 && (
                  <p style={S.noSlots}>No availability on this day — please try another date.</p>
                )}
              </>
            )}
          </div>
        )}
        <div style={S.btnRow}>
          <button style={S.ghostBtn} onClick={() => setGStep('services')}>Back</button>
          <button style={{...S.primaryBtn, ...(!selectedDate || !selectedTime ? S.btnDisabled : {})}} disabled={!selectedDate || !selectedTime} onClick={() => { setCurrentGuest(0); setGStep('details') }}>Continue</button>
        </div>
      </div>
    )
  }

  if (gStep === 'details') {
    const det = guestDetails[currentGuest]
    const setDet = (field) => (e) => {
      const next = [...guestDetails]; next[currentGuest] = { ...next[currentGuest], [field]: e.target.value }; setGuestDetails(next)
    }
    const canContinue = det.firstName && det.lastName && det.email && det.mobile
    const isLast = currentGuest === groupSize - 1
    return (
      <div style={S.stepWrap}>
        <h2 style={S.stepTitle}>Guest {currentGuest + 1} details</h2>
        <p style={S.stepSub}>{allSoloServices.find(s => s.id === guestServices[currentGuest])?.name}</p>
        <div style={S.formRow}>
          <div style={S.formField}><label style={S.fieldLabel}>First name *</label><input style={S.input} value={det.firstName} onChange={setDet('firstName')} placeholder="First name" /></div>
          <div style={S.formField}><label style={S.fieldLabel}>Last name *</label><input style={S.input} value={det.lastName} onChange={setDet('lastName')} placeholder="Last name" /></div>
        </div>
        <div style={S.formField}><label style={S.fieldLabel}>Email *</label><input style={S.input} type="email" value={det.email} onChange={setDet('email')} placeholder="their@email.com" /></div>
        <div style={S.formField}><label style={S.fieldLabel}>Mobile *</label><input style={S.input} type="tel" value={det.mobile} onChange={setDet('mobile')} placeholder="04XX XXX XXX" /></div>
        <div style={S.btnRow}>
          <button style={S.ghostBtn} onClick={() => currentGuest === 0 ? setGStep('datetime') : setCurrentGuest(g => g - 1)}>Back</button>
          <button style={{...S.primaryBtn, ...(!canContinue ? S.btnDisabled : {})}} disabled={!canContinue}
            onClick={() => isLast ? setGStep('payment') : setCurrentGuest(g => g + 1)}>
            {isLast ? 'Review booking' : `Next — Guest ${currentGuest + 2}`}
          </button>
        </div>
      </div>
    )
  }

  if (gStep === 'payment') {
    const endMin = selectedTime.hour * 60 + selectedTime.minute + longestDuration
    return (
      <div style={S.stepWrap}>
        <h2 style={S.stepTitle}>Review & confirm</h2>
        <div style={S.summaryCard}>
          <div style={S.summarySection}>
            <div style={S.summaryLabel}>Services</div>
            {guests.map(i => {
              const svc = allSoloServices.find(s => s.id === guestServices[i])
              return <div key={i} style={S.summaryRow}><span>Guest {i+1} — {svc?.name}</span><span>${svc?.price}</span></div>
            })}
            <div style={{...S.summaryRow, ...S.summaryTotal}}><span>Total</span><span>${totalPrice}</span></div>
          </div>
          <div style={S.summarySection}>
            <div style={S.summaryLabel}>Appointment</div>
            <div style={S.summaryRow}><span>Date</span><span>{fmtDate(selectedDate)}</span></div>
            <div style={S.summaryRow}><span>Time</span><span>{fmtTime(selectedTime.hour, selectedTime.minute)} – {fmtTime(Math.floor(endMin/60), endMin%60)}</span></div>
            <div style={S.summaryRow}><span>Guests</span><span>{groupSize}</span></div>
          </div>
          {guests.map(i => (
            <div key={i} style={S.summarySection}>
              <div style={S.summaryLabel}>Guest {i + 1}</div>
              <div style={S.summaryRow}><span>Name</span><span>{guestDetails[i].firstName} {guestDetails[i].lastName}</span></div>
              <div style={S.summaryRow}><span>Email</span><span>{guestDetails[i].email}</span></div>
            </div>
          ))}
        </div>
        <div style={S.depositBox}>
          <div style={S.depositTitle}>Payment required to confirm</div>
          <div style={S.depositAmount}>${totalPrice} due now</div>
          <div style={S.depositNote}>Full payment required for group bookings.</div>
        </div>
        <div style={S.stripeBox}>
          <p style={S.stripeNote}>⚠️ Online payment not yet configured. Your booking will be confirmed and we'll collect payment at your appointment.</p>
        </div>
        <div style={S.btnRow}>
          <button style={S.ghostBtn} onClick={() => { setCurrentGuest(groupSize - 1); setGStep('details') }} disabled={loading}>Back</button>
          <button style={S.primaryBtn} onClick={submitGroupBooking} disabled={loading}>{loading ? 'Confirming…' : 'Confirm booking'}</button>
        </div>
      </div>
    )
  }

  return null
}

// ── Payment Page (/pay/VHXXXXXX) ──────────────────────────────────────────────
function PaymentPage({ payRef }) {
  const [appt, setAppt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [svcs, setSvcs] = useState([])

  useEffect(() => {
    if (!supabase || !payRef) { setLoading(false); return }
    const shortId = payRef.replace('VH', '').toLowerCase()
    supabase.from('appointments')
      .select('id, start_time, end_time, total_price, status, clients(first_name, last_name)')
      .ilike('id', `%${shortId}`)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          setAppt(data)
          const { data: svcData } = await supabase.from('appointment_services').select('service_name, duration_mins, price').eq('appointment_id', data.id)
          setSvcs(svcData || [])
        }
        setLoading(false)
      })
  }, [payRef])

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cormorant Garamond', Georgia, serif", fontSize:18, color:'#8A7060' }}>Loading…</div>

  const start = appt ? new Date(appt.start_time) : null

  return (
    <div style={{ minHeight:'100vh', background:'#FAF6F0', fontFamily:"'Cormorant Garamond', Georgia, serif", display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#FFF', borderRadius:16, padding:'40px 36px', maxWidth:480, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid #E8DDD0' }}>
        <div style={{ fontSize:22, fontWeight:700, color:'#3C2A1E', marginBottom:4 }}>Vihara Head Spa</div>
        <div style={{ fontSize:14, color:'#7A9278', marginBottom:28 }}>& Blow Dry Lounge · Parkdale VIC</div>

        {!appt ? (
          <div style={{ color:'#c0392b', fontSize:15 }}>Booking not found. Please check the link and try again.</div>
        ) : (
          <>
            <div style={{ fontSize:18, fontWeight:600, color:'#3C2A1E', marginBottom:20 }}>Invoice — {payRef}</div>
            <div style={{ background:'#FAF6F0', borderRadius:10, padding:'16px 20px', marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:8, color:'#3C2A1E' }}>
                <span style={{ color:'#7A9278' }}>Client</span>
                <span>{appt.clients?.first_name} {appt.clients?.last_name}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:8, color:'#3C2A1E' }}>
                <span style={{ color:'#7A9278' }}>Date</span>
                <span>{start?.toLocaleDateString('en-AU', { weekday:'long', day:'numeric', month:'long' })}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:8, color:'#3C2A1E' }}>
                <span style={{ color:'#7A9278' }}>Time</span>
                <span>{start ? fmtTime(start.getHours(), start.getMinutes()) : '—'}</span>
              </div>
              {svcs.map((s, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:4, color:'#3C2A1E' }}>
                  <span style={{ color:'#7A9278' }}>{i === 0 ? 'Service' : 'Add-on'}</span>
                  <span>{s.service_name} — ${s.price}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, marginTop:12, paddingTop:12, borderTop:'1px solid #E8DDD0', color:'#3C2A1E' }}>
                <span>Total due</span>
                <span style={{ color:'#C4A35A' }}>${appt.total_price}</span>
              </div>
            </div>
            <div style={{ background:'#FBF5EA', border:'1px solid #E8DDD0', borderRadius:10, padding:'16px 20px', fontSize:13, color:'#5C3D25', lineHeight:1.7 }}>
              <div style={{ fontWeight:600, marginBottom:6 }}>How to pay</div>
              Online card payment is coming soon. In the meantime, please transfer <strong>${appt.total_price}</strong> using your booking reference <strong>{payRef}</strong> as the description, and we'll confirm your booking via email or SMS.
              <div style={{ marginTop:12, fontSize:12, color:'#8A7060' }}>Questions? Email us at hello@viharaheadspa.com.au or call 0439 279 285.</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Admin PIN Entry ───────────────────────────────────────────────────────────
function AdminPinEntry({ correctPin, onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const check = () => {
    if (pin === correctPin) { onSuccess() }
    else { setError(true); setPin(''); setTimeout(() => setError(false), 1500) }
  }
  return (
    <div style={{ minHeight: '100vh', background: WALNUT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <div style={{ background: WHITE, borderRadius: 16, padding: '48px 40px', width: 320, textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: WALNUT, marginBottom: 6 }}>Vihara Admin</div>
        <div style={{ fontSize: 14, color: SAGE, marginBottom: 32 }}>Enter your PIN to continue</div>
        <input
          type="password" inputMode="numeric" maxLength={8}
          value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          placeholder="PIN"
          style={{ ...S.input, textAlign: 'center', fontSize: 22, letterSpacing: 8, marginBottom: 16, border: error ? '1.5px solid #c0392b' : `1.5px solid ${BORDER}` }}
          autoFocus
        />
        {error && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>Incorrect PIN</div>}
        <button style={{ ...S.primaryBtn, width: '100%' }} onClick={check}>Unlock</button>
      </div>
    </div>
  )
}

// ── Admin Panel ───────────────────────────────────────────────────────────────

// ── Admin: Gift Cards ─────────────────────────────────────────────────────────
function AdminGiftCards() {
  const [cards, setCards] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({ recipient_name: '', recipient_email: '', purchaser_name: '', amount: '', notes: '', expires_at: '' })

  async function getSupabase() {
    const { createClient } = await import('@supabase/supabase-js')
    return import.meta.env.VITE_SUPABASE_URL
      ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
      : null
  }

  async function loadCards() {
    setLoading(true)
    const sb = await getSupabase()
    if (!sb) { setLoading(false); return }
    const { data } = await sb.from('gift_cards').select('*').order('created_at', { ascending: false })
    setCards(data || [])
    setLoading(false)
  }

  React.useEffect(() => { loadCards() }, [])

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const seg = () => Array.from({length:4}, () => chars[Math.floor(Math.random()*chars.length)]).join('')
    return `VIHARA-${seg()}-${seg()}`
  }

  async function createCard() {
    if (!form.amount || !form.recipient_name) return
    setSaving(true)
    const sb = await getSupabase()
    if (!sb) { setSaving(false); return }
    const code = generateCode()
    const amt = parseFloat(form.amount)
    await sb.from('gift_cards').insert({
      code,
      amount: amt,
      remaining: amt,
      recipient_name: form.recipient_name,
      recipient_email: form.recipient_email || null,
      purchaser_name: form.purchaser_name || null,
      notes: form.notes || null,
      expires_at: form.expires_at || null,
      is_active: true,
    })
    setForm({ recipient_name: '', recipient_email: '', purchaser_name: '', amount: '', notes: '', expires_at: '' })
    setShowForm(false)
    setSaving(false)
    loadCards()
  }

  async function voidCard(id) {
    const sb = await getSupabase()
    if (!sb) return
    await sb.from('gift_cards').update({ is_active: false }).eq('id', id)
    loadCards()
  }

  const inp = (field, placeholder, type='text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
      style={{ padding: '8px 12px', border: '1.5px solid #D4C5B0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#FAF6F0', color: '#3C2A1E', width: '100%' }}
    />
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, color: '#3C2A1E', fontWeight: 600 }}>Gift Cards</h2>
        <button style={{ background: '#3C2A1E', color: '#FAF6F0', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
          onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Issue gift card'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#FAF6F0', border: '1px solid #D4C5B0', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, color: '#3C2A1E', marginBottom: 16 }}>Issue New Gift Card</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 12, color: '#8A7060', display: 'block', marginBottom: 4 }}>Recipient name *</label>{inp('recipient_name', 'e.g. Sarah Chen')}</div>
            <div><label style={{ fontSize: 12, color: '#8A7060', display: 'block', marginBottom: 4 }}>Recipient email</label>{inp('recipient_email', 'sarah@example.com', 'email')}</div>
            <div><label style={{ fontSize: 12, color: '#8A7060', display: 'block', marginBottom: 4 }}>Purchased by</label>{inp('purchaser_name', 'e.g. Michael Chen')}</div>
            <div><label style={{ fontSize: 12, color: '#8A7060', display: 'block', marginBottom: 4 }}>Amount (AUD) *</label>{inp('amount', 'e.g. 252', 'number')}</div>
            <div><label style={{ fontSize: 12, color: '#8A7060', display: 'block', marginBottom: 4 }}>Expiry date</label>{inp('expires_at', '', 'date')}</div>
            <div><label style={{ fontSize: 12, color: '#8A7060', display: 'block', marginBottom: 4 }}>Notes</label>{inp('notes', 'e.g. Christmas gift')}</div>
          </div>
          <button
            style={{ marginTop: 16, background: '#C4A35A', color: '#FAF6F0', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}
            onClick={createCard} disabled={saving}>
            {saving ? 'Creating…' : 'Generate & save gift card'}
          </button>
          <p style={{ fontSize: 12, color: '#8A7060', marginTop: 10 }}>A unique code will be generated. Share it with the recipient manually or via email.</p>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#8A7060' }}>Loading…</p>
      ) : cards.length === 0 ? (
        <p style={{ color: '#8A7060' }}>No gift cards issued yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #D4C5B0' }}>
                {['Code','Recipient','Amount','Remaining','Expires','Status',''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#8A7060', fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #EDE5D8' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#3C2A1E' }}>{c.code}</td>
                  <td style={{ padding: '10px 12px', color: '#3C2A1E' }}>{c.recipient_name}<br/><span style={{ fontSize: 11, color: '#8A7060' }}>{c.recipient_email || ''}</span></td>
                  <td style={{ padding: '10px 12px', color: '#3C2A1E' }}>${c.amount}</td>
                  <td style={{ padding: '10px 12px', color: c.remaining < c.amount ? '#C4A35A' : '#3C2A1E', fontWeight: 600 }}>${c.remaining}</td>
                  <td style={{ padding: '10px 12px', color: '#8A7060' }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-AU') : '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, background: c.is_active ? '#e8f0e8' : '#f0e8e8', color: c.is_active ? '#4a7a4a' : '#8a4a4a' }}>
                      {c.is_active ? 'Active' : 'Voided'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {c.is_active && (
                      <button style={{ background: 'none', border: '1px solid #D4C5B0', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#8A7060' }}
                        onClick={() => voidCard(c.id)}>Void</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AdminPanel({ categories, setCategories, allAddons, setAllAddons, staff, setStaff, settings, setSettings, adminTab, setAdminTab, onLogout }) {
  const navItems = [
    ['dashboard', '⌂  Dashboard'],
    ['calendar', '◫  Calendar'],
    ['appointments', '◷  Appointments'],
    ['clients', '◯  Clients'],
    ['invoices', '⊘  Invoices'],
    ['services', '✦  Services'],
    ['addons', '+  Add-ons'],
    ['staff', '◈  Staff'],
    ['settings', '⚙  Settings'],
  ]
  return (
    <div style={S.adminPage}>
      <aside style={S.adminSidebar}>
        <div style={S.adminLogo}>Vihara<br /><span style={{ fontWeight: 400, fontSize: 13 }}>Admin</span></div>
        {navItems.map(([key, label]) => (
          <button key={key} style={{...S.adminNavBtn, ...(adminTab === key ? S.adminNavActive : {})}} onClick={() => setAdminTab(key)}>
            {label}
          </button>
        ))}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <a href="/" style={S.adminBack}>← Back to booking</a>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', textAlign: 'left', padding: '4px 0' }} onClick={onLogout}>Lock</button>
        </div>
      </aside>
      <main style={S.adminMain}>
        {adminTab === 'dashboard'     && <AdminDashboard staff={staff} />}
        {adminTab === 'calendar'      && <AdminCalendar staff={staff} categories={categories} allAddons={allAddons} />}
        {adminTab === 'appointments'  && <AdminAppointments staff={staff} />}
        {adminTab === 'clients'       && <AdminClients />}
        {adminTab === 'invoices'      && <AdminInvoices />}
        {adminTab === 'services'      && <AdminServices categories={categories} setCategories={setCategories} allAddons={allAddons} staff={staff} />}
        {adminTab === 'addons'        && <AdminAddons allAddons={allAddons} setAllAddons={setAllAddons} />}
        {adminTab === 'staff'         && <AdminStaff staff={staff} setStaff={setStaff} />}
        {adminTab === 'settings'      && <AdminSettings settings={settings} setSettings={setSettings} />}
      </main>
    </div>
  )
}

// ── Admin Calendar (Timely-style) ─────────────────────────────────────────────
function AdminCalendar({ staff, categories, allAddons }) {
  const allServices = categories?.flatMap(c => c.services.filter(s => !s.couples)) || []
  const [viewDate, setViewDate] = useState(new Date())
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)       // { date, hour, minute, staffId }
  const [selectedAppt, setSelectedAppt] = useState(null)

  const SLOT_H = 48   // px per 15-min block
  const HOUR_H = SLOT_H * 4
  const START_H = 8
  const END_H = 20
  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i)

  const dateStr = viewDate.toLocaleDateString('en-CA')

  const fetchAppts = () => {
    if (!supabase) return
    setLoading(true)
    const dayStart = new Date(`${dateStr}T00:00:00+10:00`).toISOString()
    const dayEnd   = new Date(`${dateStr}T23:59:59+10:00`).toISOString()
    supabase.from('appointments')
      .select('id, staff_id, start_time, end_time, duration_mins, total_price, deposit_paid, status, notes, client_id, clients(first_name, last_name, email, phone), appointment_services(service_name, duration_mins, price)')
      .gte('start_time', dayStart).lte('start_time', dayEnd)
      .then(({ data }) => { setAppts(data || []); setLoading(false) })
  }

  useEffect(() => { fetchAppts() }, [dateStr])

  const apptTop = (a) => {
    const s = new Date(a.start_time)
    return Math.max(0, ((s.getHours() - START_H) * 60 + s.getMinutes()) / 15 * SLOT_H)
  }
  const apptHeight = (a) => Math.max((a.duration_mins || 60) / 15 * SLOT_H - 3, 24)

  const STAFF_COLORS = ['#E8D5F5', '#D5E8F5', '#D5F5E8', '#F5F5D5']
  const STAFF_BORDER = ['#C9A8E8', '#A8C9E8', '#A8E8C9', '#E8E8A8']

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={S.calNavBtn} onClick={() => setViewDate(d => { const n=new Date(d); n.setDate(d.getDate()-1); return n })}>‹</button>
        <button style={{ ...S.calNavBtn, padding: '6px 14px', fontSize: 12 }} onClick={() => setViewDate(new Date())}>Today</button>
        <button style={S.calNavBtn} onClick={() => setViewDate(d => { const n=new Date(d); n.setDate(d.getDate()+1); return n })}>›</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: WALNUT }}>
          {viewDate.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        {loading && <span style={{ fontSize: 12, color: SAGE }}>Loading…</span>}
        <button style={{ ...S.primaryBtn, marginLeft: 'auto', padding: '8px 18px', fontSize: 13 }}
          onClick={() => setModal({ date: viewDate, hour: 10, minute: 0, staffId: staff[0]?.id })}>
          + New appointment
        </button>
      </div>

      {/* Calendar */}
      <div style={{ background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, overflowX: 'auto' }}>
        {/* Staff header */}
        <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(${staff.length}, minmax(160px, 1fr))`, borderBottom: `2px solid ${BORDER}`, position: 'sticky', top: 0, background: WHITE, zIndex: 10 }}>
          <div style={{ borderRight: `1px solid ${BORDER}` }} />
          {staff.map((s, i) => (
            <div key={s.id} style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: WALNUT, borderLeft: `1px solid ${BORDER}`, textAlign: 'center', background: STAFF_COLORS[i % STAFF_COLORS.length] + '88' }}>
              {s.name}
              <div style={{ fontSize: 11, fontWeight: 400, color: SAGE, marginTop: 2 }}>{s.role?.split('&')[0]?.trim()}</div>
            </div>
          ))}
        </div>

        {/* Time + columns */}
        <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(${staff.length}, minmax(160px, 1fr))`, maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Time gutter */}
          <div style={{ borderRight: `1px solid ${BORDER}` }}>
            {hours.map(h => (
              <div key={h} style={{ height: HOUR_H, borderBottom: `1px solid ${BORDER}`, paddingTop: 4, paddingRight: 8, textAlign: 'right', fontSize: 11, color: SAGE, boxSizing: 'border-box' }}>
                {h === 12 ? '12pm' : h > 12 ? `${h-12}pm` : `${h}am`}
              </div>
            ))}
          </div>

          {/* Staff columns */}
          {staff.map((s, colIdx) => (
            <div key={s.id} style={{ borderLeft: `1px solid ${BORDER}`, position: 'relative' }}>
              {/* Hour rows with click zones */}
              {hours.map(h => (
                <div key={h} style={{ height: HOUR_H, borderBottom: `1px solid ${BORDER}`, position: 'relative' }}>
                  {[0, 15, 30, 45].map(m => (
                    <div key={m}
                      onClick={() => setModal({ date: viewDate, hour: h, minute: m, staffId: s.id })}
                      style={{ position: 'absolute', top: (m/15)*SLOT_H, left: 0, right: 0, height: SLOT_H, borderTop: m > 0 ? `1px dashed #EEE` : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F0E8'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    />
                  ))}
                </div>
              ))}
              {/* Appointment blocks */}
              {appts.filter(a => a.staff_id === s.id).map(a => {
                const top = apptTop(a)
                const height = apptHeight(a)
                const svc = a.appointment_services?.[0]
                const client = a.clients
                const isCancelled = a.status === 'cancelled' || a.status === 'no_show'
                return (
                  <div key={a.id} onClick={() => setSelectedAppt(a)}
                    style={{ position: 'absolute', top, left: 4, right: 4, height, background: isCancelled ? '#F5F5F5' : STAFF_COLORS[colIdx % STAFF_COLORS.length], borderRadius: 7, padding: '5px 8px', cursor: 'pointer', overflow: 'hidden', border: `1.5px solid ${isCancelled ? BORDER : STAFF_BORDER[colIdx % STAFF_BORDER.length]}`, zIndex: 2, boxSizing: 'border-box', opacity: isCancelled ? 0.5 : 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: WALNUT, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client?.first_name} {client?.last_name}</div>
                    {height > 38 && <div style={{ fontSize: 11, color: '#555', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc?.service_name}</div>}
                    {height > 58 && <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, marginTop: 2 }}>${a.total_price}</div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <AddAppointmentModal
          date={modal.date} hour={modal.hour} minute={modal.minute}
          preStaffId={modal.staffId} staff={staff} allServices={allServices} allAddons={allAddons || []}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAppts() }}
        />
      )}
      {selectedAppt && (
        <ApptDetailModal appt={selectedAppt} staff={staff} allServices={allServices}
          onClose={() => setSelectedAppt(null)}
          onStatusChange={() => { setSelectedAppt(null); fetchAppts() }}
        />
      )}
    </div>
  )
}

// ── Add Appointment Modal ─────────────────────────────────────────────────────
function AddAppointmentModal({ date, hour, minute, preStaffId, staff, allServices, allAddons, onClose, onSaved }) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [mobile,    setMobile]    = useState('')
  // Line items: array of { key, type:'service'|'addon', id:'' }
  const [lineItems, setLineItems] = useState([{ key: 1, type: 'service', id: '' }])
  const [staffId,   setStaffId]   = useState(preStaffId || staff[0]?.id || '')
  const [startH,    setStartH]    = useState(hour)
  const [startM,    setStartM]    = useState(minute)
  const [status,    setStatus]    = useState('confirmed')
  const [notes,     setNotes]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [saved,     setSaved]     = useState(null)
  const [copied,    setCopied]    = useState(false)
  const keyRef = useRef(2)

  const resolveItem = (li) => {
    if (li.type === 'service') return allServices.find(s => s.id === li.id)
    return allAddons?.find(a => a.id === li.id)
  }

  const totalPrice    = lineItems.reduce((s, li) => s + (resolveItem(li)?.price    || 0), 0)
  const totalDuration = lineItems.reduce((s, li) => s + (resolveItem(li)?.duration || 0), 0)

  const addLine = (type) => { setLineItems(p => [...p, { key: keyRef.current++, type, id: '' }]) }
  const removeLine = (key) => setLineItems(p => p.filter(li => li.key !== key))
  const setLineId = (key, id) => setLineItems(p => p.map(li => li.key === key ? { ...li, id } : li))

  const timeOptions = []
  for (let h = 8; h <= 20; h++) {
    for (const m of [0, 15, 30, 45]) {
      timeOptions.push({ h, m, label: `${h > 12 ? h-12 : h === 0 ? 12 : h}:${String(m).padStart(2,'0')}${h >= 12 ? 'pm' : 'am'}` })
    }
  }

  const save = async () => {
    setError('')
    if (!firstName.trim()) { setError('Please enter the client\'s first name.'); return }
    const hasService = lineItems.some(li => li.type === 'service' && li.id)
    if (!hasService) { setError('Please select at least one service.'); return }
    setLoading(true)
    try {
      const dateStr = date.toLocaleDateString('en-CA')
      const endMin = startH * 60 + startM + totalDuration
      const startISO = new Date(`${dateStr}T${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')}:00+10:00`).toISOString()
      const endISO   = new Date(`${dateStr}T${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}:00+10:00`).toISOString()

      let clientId = null
      if (supabase) {
        if (email.trim()) {
          const { data: ex } = await supabase.from('clients').select('id').eq('email', email.trim()).maybeSingle()
          if (ex) clientId = ex.id
        }
        if (!clientId) {
          const { data: nc, error: cErr } = await supabase.from('clients').insert({ first_name: firstName.trim(), last_name: lastName.trim() || null, email: email.trim() || null, phone: mobile.trim() || null }).select('id').single()
          if (cErr) throw cErr
          clientId = nc.id
        }

        const { data: appt, error: aErr } = await supabase.from('appointments').insert({
          location_id: selectedLocation?.id ?? '00000000-0000-0000-0000-000000000001',
          client_id: clientId, staff_id: staffId || null,
          start_time: startISO, end_time: endISO,
          duration_mins: totalDuration, total_price: totalPrice,
          deposit_paid: 0, status, notes: notes.trim() || 'Booked via admin', booked_online: false,
        }).select('id').single()
        if (aErr) throw aErr

        const svcRows = lineItems.filter(li => li.id).map((li, idx) => {
          const item = resolveItem(li)
          return { appointment_id: appt.id, service_name: item.name, duration_mins: item.duration || 0, price: item.price, sort_order: idx }
        })
        if (svcRows.length) await supabase.from('appointment_services').insert(svcRows)
        await supabase.from('invoices').insert({ appointment_id: appt.id, client_id: clientId, subtotal: totalPrice, total: totalPrice, amount_paid: 0, status: 'unpaid' })

        const primarySvc = resolveItem(lineItems.find(li => li.type === 'service' && li.id))
        const ref = `VH${appt.id.slice(-6).toUpperCase()}`
        setSaved({
          apptId: appt.id, ref,
          price: totalPrice,
          serviceName: lineItems.filter(li => li.id).map(li => resolveItem(li)?.name).join(', '),
          dateLabel: date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }),
          timeLabel: fmtTime(startH, startM),
          clientName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          clientEmail: email.trim(), clientMobile: mobile.trim(),
          payUrl: `https://vihara-booking.vercel.app/pay/${ref}`,
        })
        onSaved()
      } else {
        setSaved({ apptId: 'test', ref: 'VHTEST1', price: totalPrice, serviceName: 'Test service', dateLabel: date.toLocaleDateString('en-AU'), timeLabel: fmtTime(startH, startM), clientName: firstName, clientEmail: email, clientMobile: mobile, payUrl: `https://vihara-booking.vercel.app/pay/VHTEST1` })
      }
    } catch(e) { setError(`Something went wrong: ${e?.message || 'Unknown error'}`) }
    finally { setLoading(false) }
  }

  const buildMailto = () => {
    if (!saved) return '#'
    const subject = encodeURIComponent(`Payment request — ${saved.serviceName} at Vihara Head Spa & Blow Dry Lounge`)
    const body = encodeURIComponent(
      `Hi ${saved.clientName.split(' ')[0]},\n\nThank you for booking with us — we look forward to seeing you!\n\nYour appointment details:\n` +
      `Service: ${saved.serviceName}\nDate: ${saved.dateLabel}\nTime: ${saved.timeLabel}\nTotal: $${saved.price}\n\n` +
      `To complete your booking, please pay securely online:\n${saved.payUrl}\n\n` +
      `Booking reference: ${saved.ref}\n\n` +
      `If you have any questions, don't hesitate to get in touch.\n\nWarm regards,\nVihara Head Spa & Blow Dry Lounge\n1 Chandler Street, Parkdale VIC 3195`
    )
    return `mailto:${saved.clientEmail}?subject=${subject}&body=${body}`
  }
  const buildSMS = () => !saved ? '' : `Hi ${saved.clientName.split(' ')[0]}, your booking at Vihara Head Spa is confirmed for ${saved.dateLabel} at ${saved.timeLabel} (${saved.serviceName}). Pay securely here: ${saved.payUrl} — ref ${saved.ref}. See you soon!`

  if (saved) {
    const sms = buildSMS()
    return (
      <div style={S.modalOverlay}>
        <div style={S.modal}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: WALNUT, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Appointment saved!</h3>
            <div style={{ fontSize: 13, color: SAGE, marginTop: 6 }}>Ref: <strong>{saved.ref}</strong> · {saved.clientName}</div>
            <div style={{ fontSize: 13, color: SAGE }}>{saved.serviceName} · ${saved.price}</div>
          </div>
          <div style={{ background: CREAM, borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: WALNUT, marginBottom: 12 }}>Send payment request — ${saved.price} due</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {saved.clientEmail ? (
                <a href={buildMailto()} style={{ ...S.primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', padding: '11px 16px', fontSize: 14 }}>✉ Send payment email</a>
              ) : <div style={{ fontSize: 12, color: SAGE }}>No email on file.</div>}
              {saved.clientMobile ? (
                <button style={{ ...S.ghostBtn, width: '100%', fontSize: 13 }} onClick={() => { navigator.clipboard?.writeText(sms); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                  {copied ? '✓ Copied!' : '📱 Copy SMS payment request'}
                </button>
              ) : <div style={{ fontSize: 12, color: SAGE }}>No mobile on file.</div>}
              <div style={{ fontSize: 11, color: SAGE, wordBreak: 'break-all' }}>Pay link: <a href={saved.payUrl} target="_blank" style={{ color: GOLD }}>{saved.payUrl}</a></div>
            </div>
          </div>
          <button style={{ ...S.ghostBtn, width: '100%' }} onClick={onClose}>Done</button>
        </div>
      </div>
    )
  }

  return (
    <div style={S.modalOverlay}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: WALNUT, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Add appointment</h3>
          <button style={S.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: SAGE, marginBottom: 20 }}>
          {date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        <div style={S.formRow}>
          <div style={S.formField}><label style={S.fieldLabel}>First name *</label><input style={S.input} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" autoFocus /></div>
          <div style={S.formField}><label style={S.fieldLabel}>Last name</label><input style={S.input} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" /></div>
        </div>
        <div style={S.formRow}>
          <div style={S.formField}><label style={S.fieldLabel}>Mobile</label><input style={S.input} type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="04XX XXX XXX" /></div>
          <div style={S.formField}><label style={S.fieldLabel}>Email</label><input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" /></div>
        </div>

        {/* Services + add-ons */}
        <div style={S.formField}>
          <label style={S.fieldLabel}>Services & add-ons *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lineItems.map((li, idx) => {
              const options = li.type === 'service' ? allServices : (allAddons || [])
              return (
                <div key={li.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select style={{ ...S.input, flex: 1, fontSize: 13 }} value={li.id} onChange={e => setLineId(li.key, e.target.value)}>
                    <option value="">— {li.type === 'service' ? 'Select service' : 'Select add-on'} —</option>
                    {options.map(s => <option key={s.id} value={s.id}>{s.name}{s.duration ? ` · ${fmt(s.duration)}` : ''} · ${s.price}</option>)}
                  </select>
                  {lineItems.length > 1 && (
                    <button style={{ ...S.modalClose, fontSize: 14, flexShrink: 0 }} onClick={() => removeLine(li.key)}>✕</button>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={{ ...S.adminSmBtn, fontSize: 12 }} onClick={() => addLine('service')}>+ Add service</button>
            {allAddons?.length > 0 && <button style={{ ...S.adminSmBtn, fontSize: 12 }} onClick={() => addLine('addon')}>+ Add add-on</button>}
          </div>
          {totalPrice > 0 && (
            <div style={{ fontSize: 13, color: SAGE, marginTop: 10, padding: '8px 12px', background: CREAM, borderRadius: 8 }}>
              Total: <strong style={{ color: GOLD }}>${totalPrice}</strong>
              {totalDuration > 0 && <> · Duration: <strong style={{ color: WALNUT }}>{fmt(totalDuration)}</strong></>}
            </div>
          )}
        </div>

        <div style={S.formRow}>
          <div style={S.formField}>
            <label style={S.fieldLabel}>Staff</label>
            <select style={S.input} value={staffId} onChange={e => setStaffId(e.target.value)}>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={S.formField}>
            <label style={S.fieldLabel}>Start time</label>
            <select style={S.input} value={`${startH}:${startM}`} onChange={e => { const [h,m] = e.target.value.split(':').map(Number); setStartH(h); setStartM(m) }}>
              {timeOptions.map(t => <option key={`${t.h}:${t.m}`} value={`${t.h}:${t.m}`}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div style={S.formField}><label style={S.fieldLabel}>Notes</label><input style={S.input} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes…" /></div>

        <div style={S.formField}>
          <label style={S.fieldLabel}>Status</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['pencilled_in','Pencilled-in'],['confirmed','Confirmed']].map(([val,lbl]) => (
              <button key={val} onClick={() => setStatus(val)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${status === val ? GOLD : BORDER}`, background: status === val ? GOLD : WHITE, color: status === val ? WHITE : WALNUT, cursor: 'pointer', fontSize: 13, fontFamily: 'system-ui, sans-serif' }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ color: '#c0392b', fontSize: 13, marginTop: 10, padding: '10px 14px', background: '#fdf0ee', borderRadius: 8 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button style={{ ...S.ghostBtn, flex: 1 }} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={{ ...S.primaryBtn, flex: 2, opacity: loading ? 0.7 : 1 }} onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save appointment'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Appointment Detail Modal ──────────────────────────────────────────────────
function ApptDetailModal({ appt, staff, allServices, onClose, onStatusChange }) {
  const [mode, setMode] = useState('view')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [apptData, setApptData] = useState(appt)
  const [fetchedSvc, setFetchedSvc] = useState(appt.appointment_services?.[0] || null)

  // Fetch appointment_services directly in case the join didn't return them
  useEffect(() => {
    if (!fetchedSvc && supabase && apptData.id) {
      supabase.from('appointment_services').select('service_name, duration_mins, price').eq('appointment_id', apptData.id)
        .then(({ data }) => { if (data?.[0]) setFetchedSvc(data[0]) })
    }
  }, [apptData.id])

  const client = apptData.clients
  const svc = fetchedSvc
  const staffMember = staff.find(s => s.id === apptData.staff_id)
  const start = new Date(apptData.start_time)
  const end   = new Date(apptData.end_time)

  const [firstName, setFirstName] = useState(client?.first_name || '')
  const [lastName,  setLastName]  = useState(client?.last_name  || '')
  const [email,     setEmail]     = useState(client?.email      || '')
  const [mobile,    setMobile]    = useState(client?.phone      || '')
  const [serviceId, setServiceId] = useState(svc ? allServices?.find(s => s.name === svc.service_name)?.id || '' : '')
  const [staffId,   setStaffId]   = useState(apptData.staff_id || '')
  const [startH,    setStartH]    = useState(start.getHours())
  const [startM,    setStartM]    = useState(start.getMinutes())
  const [status,    setStatus]    = useState(apptData.status || 'confirmed')
  const [notes,     setNotes]     = useState(apptData.notes || '')
  const [error,     setError]     = useState('')

  const editSvc = allServices?.find(s => s.id === serviceId)

  const timeOptions = []
  for (let h = 8; h <= 20; h++) {
    for (const m of [0, 15, 30, 45]) {
      timeOptions.push({ h, m, label: `${h > 12 ? h-12 : h === 0 ? 12 : h}:${String(m).padStart(2,'0')}${h >= 12 ? 'pm' : 'am'}` })
    }
  }

  const updateStatus = async (newStatus) => {
    if (!supabase) return
    await supabase.from('appointments').update({ status: newStatus }).eq('id', apptData.id)
    onStatusChange()
  }

  const saveEdit = async () => {
    if (!firstName.trim()) { setError('First name is required.'); return }
    setSaving(true); setError('')
    try {
      const dateStr = start.toLocaleDateString('en-CA')
      const endMin = startH * 60 + startM + (editSvc?.duration || apptData.duration_mins || 60)
      const startISO = new Date(`${dateStr}T${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')}:00+10:00`).toISOString()
      const endISO   = new Date(`${dateStr}T${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}:00+10:00`).toISOString()

      if (supabase) {
        // Update client
        if (apptData.client_id) {
          await supabase.from('clients').update({ first_name: firstName.trim(), last_name: lastName.trim() || null, email: email.trim() || null, phone: mobile.trim() || null }).eq('id', apptData.client_id)
        }
        // Update appointment
        await supabase.from('appointments').update({
          staff_id: staffId || null, start_time: startISO, end_time: endISO,
          duration_mins: editSvc?.duration || apptData.duration_mins,
          total_price: editSvc?.price || apptData.total_price,
          status, notes: notes.trim() || null,
        }).eq('id', apptData.id)
        // Update service record if changed
        if (editSvc && editSvc.name !== svc?.service_name) {
          await supabase.from('appointment_services').update({ service_name: editSvc.name, duration_mins: editSvc.duration, price: editSvc.price }).eq('appointment_id', apptData.id)
        }
      }
      onStatusChange() // refresh calendar
    } catch(e) { setError(`Error: ${e?.message}`) }
    finally { setSaving(false) }
  }

  // Payment request helpers
  const serviceName = svc?.service_name || editSvc?.name || '—'
  const price = apptData.total_price
  const ref = `VH${apptData.id.slice(-6).toUpperCase()}`
  const dateLabel = start.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeLabel = fmtTime(start.getHours(), start.getMinutes())
  const clientName = `${client?.first_name || ''} ${client?.last_name || ''}`.trim() || 'Guest'

  const payUrl = `https://vihara-booking.vercel.app/pay/${ref}`
  const buildMailto = () => {
    const subject = encodeURIComponent(`Payment request — ${serviceName} at Vihara Head Spa & Blow Dry Lounge`)
    const body = encodeURIComponent(
      `Hi ${clientName.split(' ')[0]},\n\nThank you for booking with us — we look forward to seeing you!\n\nYour appointment details:\n` +
      `Service: ${serviceName}\nDate: ${dateLabel}\nTime: ${timeLabel}\nTotal: $${price}\n\n` +
      `To complete your booking, please pay securely online:\n${payUrl}\n\n` +
      `Booking reference: ${ref}\n\n` +
      `If you have any questions, don't hesitate to get in touch.\n\nWarm regards,\nVihara Head Spa & Blow Dry Lounge\n1 Chandler Street, Parkdale VIC 3195`
    )
    return `mailto:${client?.email || ''}?subject=${subject}&body=${body}`
  }
  const smsBody = `Hi ${clientName.split(' ')[0]}, your ${serviceName} at Vihara Head Spa is confirmed for ${dateLabel} at ${timeLabel}. Pay securely here: ${payUrl} — ref ${ref}. See you soon!`

  if (mode === 'edit') {
    return (
      <div style={S.modalOverlay}>
        <div style={S.modal}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: WALNUT, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Edit appointment</h3>
            <button style={S.modalClose} onClick={() => setMode('view')}>✕</button>
          </div>
          <div style={S.formRow}>
            <div style={S.formField}><label style={S.fieldLabel}>First name *</label><input style={S.input} value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div style={S.formField}><label style={S.fieldLabel}>Last name</label><input style={S.input} value={lastName} onChange={e => setLastName(e.target.value)} /></div>
          </div>
          <div style={S.formRow}>
            <div style={S.formField}><label style={S.fieldLabel}>Mobile</label><input style={S.input} value={mobile} onChange={e => setMobile(e.target.value)} /></div>
            <div style={S.formField}><label style={S.fieldLabel}>Email</label><input style={S.input} value={email} onChange={e => setEmail(e.target.value)} /></div>
          </div>
          <div style={S.formField}>
            <label style={S.fieldLabel}>Service</label>
            <select style={S.input} value={serviceId} onChange={e => setServiceId(e.target.value)}>
              <option value="">— {svc?.service_name || 'Keep existing'} —</option>
              {allServices?.map(s => <option key={s.id} value={s.id}>{s.name} · {fmt(s.duration)} · ${s.price}</option>)}
            </select>
          </div>
          <div style={S.formRow}>
            <div style={S.formField}>
              <label style={S.fieldLabel}>Staff</label>
              <select style={S.input} value={staffId} onChange={e => setStaffId(e.target.value)}>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={S.formField}>
              <label style={S.fieldLabel}>Start time</label>
              <select style={S.input} value={`${startH}:${startM}`} onChange={e => { const [h,m] = e.target.value.split(':').map(Number); setStartH(h); setStartM(m) }}>
                {timeOptions.map(t => <option key={`${t.h}:${t.m}`} value={`${t.h}:${t.m}`}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div style={S.formField}>
            <label style={S.fieldLabel}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['pencilled_in','Pencilled-in'],['confirmed','Confirmed'],['completed','Completed'],['cancelled','Cancelled']].map(([val,lbl]) => (
                <button key={val} onClick={() => setStatus(val)}
                  style={{ flex: 1, padding: '7px 6px', borderRadius: 8, border: `1.5px solid ${status === val ? GOLD : BORDER}`, background: status === val ? GOLD : WHITE, color: status === val ? WHITE : WALNUT, cursor: 'pointer', fontSize: 11, fontFamily: 'system-ui, sans-serif' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div style={S.formField}><label style={S.fieldLabel}>Notes</label><input style={S.input} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes…" /></div>
          {error && <div style={{ color: '#c0392b', fontSize: 13, marginTop: 8, padding: '8px 12px', background: '#fdf0ee', borderRadius: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button style={{ ...S.ghostBtn, flex: 1 }} onClick={() => setMode('view')} disabled={saving}>Back</button>
            <button style={{ ...S.primaryBtn, flex: 2, opacity: saving ? 0.7 : 1 }} onClick={saveEdit} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.modalOverlay}>
      <div style={{ ...S.modal, maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: WALNUT, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Appointment</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={{ ...S.adminSmBtn, fontSize: 12, padding: '5px 12px' }} onClick={() => setMode('edit')}>Edit</button>
            <button style={S.modalClose} onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={S.adminCard}>
          {[
            ['Client',  clientName || '—'],
            ['Email',   client?.email || '—'],
            ['Mobile',  client?.phone || '—'],
            ['Service', serviceName],
            ['Staff',   staffMember?.name || '—'],
            ['Date',    start.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })],
            ['Time',    `${fmtTime(start.getHours(), start.getMinutes())} – ${fmtTime(end.getHours(), end.getMinutes())}`],
            ['Price',   `$${price}`],
          ].map(([label, value]) => (
            <div key={label} style={S.adminRow}>
              <span style={{ color: SAGE, minWidth: 70 }}>{label}</span>
              <span style={{ fontWeight: label === 'Price' ? 700 : 400, color: label === 'Price' ? GOLD : WALNUT }}>{value}</span>
            </div>
          ))}
          <div style={S.adminRow}><span style={{ color: SAGE }}>Status</span><ApptStatusBadge status={apptData.status} /></div>
        </div>

        {/* Payment request */}
        <div style={{ background: CREAM, borderRadius: 10, padding: '14px 16px', margin: '14px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: WALNUT, marginBottom: 10 }}>Request payment — ${price} due</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {client?.email ? (
              <a href={buildMailto()} style={{ ...S.primaryBtn, display: 'block', textAlign: 'center', textDecoration: 'none', padding: '10px 16px', fontSize: 13 }}>
                ✉ Send payment request email
              </a>
            ) : (
              <div style={{ fontSize: 12, color: SAGE }}>Add client email to send payment request.</div>
            )}
            {client?.phone ? (
              <button style={{ ...S.ghostBtn, width: '100%', fontSize: 12 }} onClick={() => { navigator.clipboard?.writeText(smsBody); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                {copied ? '✓ Copied!' : '📱 Copy SMS payment request'}
              </button>
            ) : (
              <div style={{ fontSize: 12, color: SAGE }}>Add client mobile to send payment request via SMS.</div>
            )}
          </div>
        </div>

        {/* Status actions */}
        {(apptData.status === 'confirmed' || apptData.status === 'pencilled_in') && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button style={{ ...S.adminSmBtn, flex: 1 }} onClick={() => updateStatus('completed')}>✓ Complete</button>
            <button style={{ ...S.adminSmBtn, flex: 1, color: '#c0392b', borderColor: '#c0392b' }} onClick={() => updateStatus('no_show')}>✗ No show</button>
            <button style={{ ...S.adminSmBtn, flex: 1, color: '#999', borderColor: '#999' }} onClick={() => updateStatus('cancelled')}>Cancel</button>
          </div>
        )}
        <button style={{ ...S.ghostBtn, width: '100%' }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ staff }) {
  const [appts, setAppts] = useState([])
  const [weekAppts, setWeekAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)

  const getWeekBounds = (offset = 0) => {
    const now = new Date()
    const day = now.getDay()
    const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7) + offset * 7); mon.setHours(0,0,0,0)
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999)
    return { mon, sun }
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const today = new Date()
    const todayStr = today.toLocaleDateString('en-CA')
    const dayStart = new Date(`${todayStr}T00:00:00+10:00`).toISOString()
    const dayEnd   = new Date(`${todayStr}T23:59:59+10:00`).toISOString()
    supabase.from('appointments')
      .select('*, clients(first_name, last_name, email, phone), appointment_services(service_name, duration_mins, price)')
      .gte('start_time', dayStart).lte('start_time', dayEnd)
      .not('status', 'in', '("cancelled","no_show")')
      .order('start_time')
      .then(({ data }) => { setAppts(data || []); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!supabase) return
    const { mon, sun } = getWeekBounds(weekOffset)
    supabase.from('appointments')
      .select('*, clients(first_name, last_name), appointment_services(service_name, duration_mins)')
      .gte('start_time', mon.toISOString()).lte('start_time', sun.toISOString())
      .not('status', 'in', '("cancelled","no_show")')
      .then(({ data }) => setWeekAppts(data || []))
  }, [weekOffset])

  const staffName = (id) => staff.find(s => s.id === id)?.name || '—'
  const { mon, sun } = getWeekBounds(weekOffset)
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d })
  const totalRevToday = appts.reduce((s, a) => s + (a.total_price || 0), 0)

  return (
    <div>
      <h2 style={S.adminPageTitle}>Dashboard</h2>

      {/* KPI tiles */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { label: "Today's bookings", value: loading ? '—' : appts.length },
          { label: "Revenue today", value: loading ? '—' : `$${totalRevToday}` },
          { label: "Week commencing", value: mon.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) },
        ].map(t => (
          <div key={t.label} style={S.kpiTile}>
            <div style={S.kpiValue}>{t.value}</div>
            <div style={S.kpiLabel}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div style={S.adminCard}>
        <div style={S.adminCardTitle}>Today — {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        {loading ? (
          <div style={{ padding: 24, color: SAGE, fontSize: 14 }}>Loading…</div>
        ) : appts.length === 0 ? (
          <div style={{ padding: 24, color: SAGE, fontSize: 14 }}>No appointments today.</div>
        ) : appts.map(a => {
          const start = new Date(a.start_time)
          const end = new Date(a.end_time)
          const client = a.clients
          const svc = a.appointment_services?.[0]
          return (
            <div key={a.id} style={S.adminApptRow}>
              <div style={S.adminApptTime}>
                {fmtTime(start.getHours(), start.getMinutes())}<br />
                <span style={{ fontSize: 11, color: SAGE }}>–{fmtTime(end.getHours(), end.getMinutes())}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{client?.first_name} {client?.last_name}</div>
                <div style={{ fontSize: 13, color: SAGE }}>{svc?.service_name || '—'}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13 }}>
                <div style={{ color: WALNUT }}>{staffName(a.staff_id)}</div>
                <div style={{ color: GOLD, fontWeight: 600 }}>${a.total_price}</div>
              </div>
              <ApptStatusBadge status={a.status} />
            </div>
          )
        })}
      </div>

      {/* Weekly calendar */}
      <div style={S.adminCard}>
        <div style={{ ...S.adminCardTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Week of {mon.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – {sun.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.calNav} onClick={() => setWeekOffset(w => w - 1)}>‹</button>
            <button style={S.calNav} onClick={() => setWeekOffset(0)}>Today</button>
            <button style={S.calNav} onClick={() => setWeekOffset(w => w + 1)}>›</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minWidth: 560 }}>
            {weekDays.map((d, i) => {
              const isToday = d.toDateString() === new Date().toDateString()
              const dayAppts = weekAppts.filter(a => new Date(a.start_time).toDateString() === d.toDateString())
              return (
                <div key={i} style={{ borderRight: i < 6 ? `1px solid ${BORDER}` : 'none', minHeight: 120 }}>
                  <div style={{ padding: '8px 10px', borderBottom: `1px solid ${BORDER}`, fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? GOLD : SAGE, background: isToday ? '#FBF5EA' : 'transparent' }}>
                    {d.toLocaleDateString('en-AU', { weekday: 'short' })} {d.getDate()}
                  </div>
                  <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {dayAppts.map(a => {
                      const start = new Date(a.start_time)
                      const svc = a.appointment_services?.[0]
                      return (
                        <div key={a.id} style={S.calApptChip}>
                          <div style={{ fontWeight: 600, fontSize: 11 }}>{fmtTime(start.getHours(), start.getMinutes())}</div>
                          <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.clients?.first_name} {a.clients?.last_name?.[0]}.</div>
                          <div style={{ fontSize: 10, color: SAGE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{svc?.service_name}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Admin Appointments ────────────────────────────────────────────────────────
function AdminAppointments({ staff }) {
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let q = supabase.from('appointments')
      .select('*, clients(first_name, last_name, email, phone), appointment_services(service_name, duration_mins, price)')
      .order('start_time', { ascending: false })
      .limit(200)
    if (dateFrom) q = q.gte('start_time', new Date(`${dateFrom}T00:00:00+10:00`).toISOString())
    if (dateTo)   q = q.lte('start_time', new Date(`${dateTo}T23:59:59+10:00`).toISOString())
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    q.then(({ data }) => { setAppts(data || []); setLoading(false) })
  }, [statusFilter, dateFrom, dateTo])

  const updateStatus = async (id, status) => {
    if (!supabase) return
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const staffName = (id) => staff.find(s => s.id === id)?.name || '—'

  const filtered = appts.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    const c = a.clients
    return (c?.first_name + ' ' + c?.last_name).toLowerCase().includes(q) || c?.email?.toLowerCase().includes(q)
  })

  return (
    <div>
      <h2 style={S.adminPageTitle}>Appointments</h2>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input style={{ ...S.input, flex: 1, minWidth: 180 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        <input style={{ ...S.input, width: 140 }} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input style={{ ...S.input, width: 140 }} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <select style={{ ...S.input, width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No show</option>
        </select>
      </div>
      <div style={S.adminCard}>
        {loading ? (
          <div style={{ padding: 24, color: SAGE, fontSize: 14 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, color: SAGE, fontSize: 14 }}>No appointments found.</div>
        ) : filtered.map(a => {
          const start = new Date(a.start_time)
          const end = new Date(a.end_time)
          const c = a.clients
          const svc = a.appointment_services?.[0]
          return (
            <div key={a.id} style={S.adminApptRow}>
              <div style={S.adminApptTime}>
                <div style={{ fontSize: 12, color: SAGE }}>{start.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</div>
                <div style={{ fontWeight: 600 }}>{fmtTime(start.getHours(), start.getMinutes())}</div>
                <div style={{ fontSize: 11, color: SAGE }}>–{fmtTime(end.getHours(), end.getMinutes())}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c?.first_name} {c?.last_name}</div>
                <div style={{ fontSize: 13, color: SAGE }}>{svc?.service_name || '—'} · {staffName(a.staff_id)}</div>
                {c?.email && <div style={{ fontSize: 12, color: SAGE }}>{c.email}</div>}
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ color: GOLD, fontWeight: 600 }}>${a.total_price}</div>
                <ApptStatusBadge status={a.status} />
                {a.status === 'confirmed' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={S.adminSmBtn} onClick={() => updateStatus(a.id, 'completed')}>✓ Done</button>
                    <button style={{ ...S.adminSmBtn, color: '#c0392b', borderColor: '#c0392b' }} onClick={() => updateStatus(a.id, 'cancelled')}>✕ Cancel</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Admin Clients ─────────────────────────────────────────────────────────────
function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.from('clients')
      .select('*, appointments(count)')
      .order('created_at', { ascending: false })
      .limit(300)
      .then(({ data }) => { setClients(data || []); setLoading(false) })
  }, [])

  const filtered = clients.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (c.first_name + ' ' + (c.last_name || '')).toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q)
  })

  return (
    <div>
      <h2 style={S.adminPageTitle}>Clients</h2>
      <input style={{ ...S.input, marginBottom: 20 }} placeholder="Search by name, email or phone…" value={search} onChange={e => setSearch(e.target.value)} />
      <div style={S.adminCard}>
        {loading ? (
          <div style={{ padding: 24, color: SAGE, fontSize: 14 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, color: SAGE, fontSize: 14 }}>No clients found.</div>
        ) : filtered.map(c => (
          <div key={c.id} style={S.adminRow}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.first_name} {c.last_name}</div>
              <div style={{ fontSize: 13, color: SAGE }}>{c.email}{c.phone ? ` · ${c.phone}` : ''}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, color: SAGE }}>
              <div>{c.appointments?.[0]?.count ?? 0} booking{c.appointments?.[0]?.count !== 1 ? 's' : ''}</div>
              <div>{new Date(c.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Admin Invoices ────────────────────────────────────────────────────────────
function AdminInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let q = supabase.from('invoices')
      .select('*, clients(first_name, last_name, email), appointments(start_time, appointment_services(service_name))')
      .order('created_at', { ascending: false })
      .limit(200)
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => { setInvoices(data || []); setLoading(false) })
  }, [filter])

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount_paid || 0), 0)
  const totalOutstanding = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + ((i.total || 0) - (i.amount_paid || 0)), 0)

  return (
    <div>
      <h2 style={S.adminPageTitle}>Invoices</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={S.kpiTile}><div style={S.kpiValue}>${totalRevenue}</div><div style={S.kpiLabel}>Total collected</div></div>
        <div style={S.kpiTile}><div style={S.kpiValue}>${totalOutstanding}</div><div style={S.kpiLabel}>Outstanding</div></div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <select style={{ ...S.input, width: 160 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All invoices</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      <div style={S.adminCard}>
        {loading ? (
          <div style={{ padding: 24, color: SAGE, fontSize: 14 }}>Loading…</div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: 24, color: SAGE, fontSize: 14 }}>No invoices found.</div>
        ) : invoices.map(inv => {
          const c = inv.clients
          const appt = inv.appointments
          const svc = appt?.appointment_services?.[0]
          const apptDate = appt?.start_time ? new Date(appt.start_time) : null
          const statusColors = { paid: '#2ecc71', partial: '#f39c12', unpaid: '#c0392b' }
          return (
            <div key={inv.id} style={S.adminRow}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c?.first_name} {c?.last_name}</div>
                <div style={{ fontSize: 13, color: SAGE }}>{svc?.service_name || '—'}{apptDate ? ` · ${apptDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` : ''}</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <div style={{ fontWeight: 600, color: WALNUT }}>${inv.total}</div>
                <div style={{ fontSize: 12, color: SAGE }}>Paid: ${inv.amount_paid || 0}</div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: statusColors[inv.status] + '22', color: statusColors[inv.status], fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{inv.status}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Appointment status badge ──────────────────────────────────────────────────
function ApptStatusBadge({ status }) {
  const colors = { confirmed: GOLD, completed: '#2ecc71', cancelled: '#c0392b', no_show: '#999' }
  return (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: (colors[status] || SAGE) + '22', color: colors[status] || SAGE, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {status?.replace('_', ' ')}
    </span>
  )
}

function AdminServices({ categories, setCategories, allAddons, staff }) {
  return (
    <div>
      <h2 style={S.adminPageTitle}>Services</h2>
      {categories.map(cat => (
        <div key={cat.id} style={S.adminCard}>
          <h3 style={S.adminCardTitle}>{cat.name}</h3>
          {cat.services.map(svc => (
            <div key={svc.id} style={S.adminRow}>
              <div>
                <span style={{ fontWeight: 600 }}>{svc.name}</span>
                {svc.couples && <span style={S.adminBadge}>Couples</span>}
              </div>
              <span style={S.adminMeta}>{fmt(svc.duration)} · ${svc.price}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function AdminAddons({ allAddons, setAllAddons }) {
  return (
    <div>
      <h2 style={S.adminPageTitle}>Add-ons</h2>
      <div style={S.adminCard}>
        {allAddons.map(a => (
          <div key={a.id} style={S.adminRow}>
            <span style={{ fontWeight: 600 }}>{a.name}</span>
            <span style={S.adminMeta}>{a.duration > 0 ? `+${fmt(a.duration)} · ` : ''}${a.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminStaff({ staff, setStaff }) {
  return (
    <div>
      <h2 style={S.adminPageTitle}>Staff</h2>
      <div style={S.adminCard}>
        {staff.map(s => (
          <div key={s.id} style={S.adminRow}>
            <div>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={S.adminMeta}>{s.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminSettings({ settings, setSettings }) {
  const upd = (field) => (e) => setSettings(p => ({...p, [field]: e.target.value}))
  return (
    <div>
      <h2 style={S.adminPageTitle}>Settings</h2>
      <div style={S.adminCard}>
        {[
          ['businessName','Business Name','text'],
          ['businessAddress','Address','text'],
          ['depositPercent','Deposit % (single)','number'],
          ['couplesDepositPercent','Deposit % (couples)','number'],
          ['businessHoursStart','Opening hour (24h)','number'],
          ['businessHoursEnd','Closing hour (24h)','number'],
          ['slotInterval','Slot interval (mins)','number'],
          ['stripePublishableKey','Stripe Publishable Key','text'],
          ['adminPin','Admin PIN','text'],
        ].map(([field, label, type]) => (
          <div key={field} style={{...S.formField, marginBottom: 16}}>
            <label style={S.fieldLabel}>{label}</label>
            <input style={S.input} type={type} value={settings[field] ?? ''} onChange={upd(field)} />
          </div>
        ))}
        <div style={{...S.formField, marginBottom: 16}}>
          <label style={S.fieldLabel}>Cancellation Policy</label>
          <textarea style={{...S.input, ...S.textarea}} value={settings.cancellationPolicy ?? ''} onChange={upd('cancellationPolicy')} rows={5} />
        </div>
      </div>
    </div>
  )
}

// ── Colours ───────────────────────────────────────────────────────────────────
const CREAM  = '#FAF6F0'
const SAND   = '#F0E8D8'
const WALNUT = '#3C2A1E'
const SAGE   = '#7A9278'
const GOLD   = '#C4A35A'
const WHITE  = '#FFFFFF'
const BORDER = '#E8DDD0'

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  // Layout
  page: { minHeight: '100vh', background: CREAM, fontFamily: "'Cormorant Garamond', Georgia, serif", color: WALNUT },
  header: { background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '28px 40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 },
  logoWrap: {},
  logo: { margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: 3, color: WALNUT, textTransform: 'uppercase', fontFamily: "'Cormorant Garamond', Georgia, serif" },
  logoSub: { margin: 0, fontSize: 12, color: SAGE, letterSpacing: 1.5, fontStyle: 'italic' },
  progressBar: { display: 'flex', gap: 7, marginTop: 4 },
  progressDot: { width: 7, height: 7, borderRadius: '50%', background: BORDER },
  progressActive: { background: GOLD },
  main: { maxWidth: 680, margin: '0 auto', padding: '48px 24px 120px' },
  stepWrap: {},
  stepTitle: { fontSize: 34, fontWeight: 600, margin: '0 0 10px', color: WALNUT, lineHeight: 1.2 },
  stepSub: { fontSize: 16, color: SAGE, margin: '0 0 32px', lineHeight: 1.6 },

  // Location selection
  locationCard: { flex: '1 1 220px', maxWidth: 260, padding: '40px 28px', border: `1px solid ${BORDER}`, borderRadius: 16, background: WHITE, cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: "'Cormorant Garamond', Georgia, serif" },
  locationIcon: { fontSize: 20, color: GOLD, marginBottom: 14, letterSpacing: 2 },
  locationName: { fontSize: 22, fontWeight: 600, color: WALNUT, marginBottom: 10 },
  locationAddress: { fontSize: 13, color: SAGE, lineHeight: 1.6, marginBottom: 8 },
  locationTag: { fontSize: 11, color: GOLD, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 4, fontStyle: 'italic' },

  // Service categories
  catList: { display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 32 },
  catBlock: { border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' },
  catHeader: { width: '100%', background: WHITE, border: 'none', padding: '15px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: 17, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: WALNUT },
  chevron: { fontSize: 22, display: 'inline-block', transition: 'transform 0.2s', transformOrigin: 'center' },
  chevronOpen: { transform: 'rotate(90deg)' },
  svcRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderTop: `1px solid ${BORDER}`, cursor: 'pointer', background: WHITE, transition: 'background 0.15s' },
  svcRowSel: { background: '#FBF5EA' },
  checkbox: { width: 18, height: 18, accentColor: GOLD, flexShrink: 0, cursor: 'pointer' },
  svcInfo: { flex: 1 },
  svcName: { fontSize: 15, fontWeight: 500, color: WALNUT },
  svcMeta: { fontSize: 13, color: SAGE, marginTop: 3 },
  couplesBadge: { fontSize: 11, color: GOLD, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Who is this for
  whoCard: { flex: '1 1 200px', maxWidth: 240, padding: '36px 24px', border: `1px solid ${BORDER}`, borderRadius: 16, background: WHITE, cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: "'Cormorant Garamond', Georgia, serif" },
  whoIcon: { fontSize: 20, color: GOLD, marginBottom: 14, letterSpacing: 4 },
  whoTitle: { fontSize: 20, fontWeight: 600, color: WALNUT, marginBottom: 8 },
  whoSub: { fontSize: 13, color: SAGE, lineHeight: 1.6 },

  // Add-ons
  addonList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 },
  addonRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: `1px solid ${BORDER}`, borderRadius: 10, cursor: 'pointer', background: WHITE },
  addonRowSel: { border: `1px solid ${GOLD}`, background: '#FBF5EA' },
  addonInfo: { flex: 1 },
  addonName: { fontSize: 15, fontWeight: 500, color: WALNUT },
  addonMeta: { fontSize: 13, color: SAGE, marginTop: 3 },

  // Staff
  staffGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 },
  staffCard: { padding: '18px 10px', border: `1px solid ${BORDER}`, borderRadius: 10, background: WHITE, cursor: 'pointer', textAlign: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif", transition: 'border-color 0.15s' },
  staffCardActive: { border: `2px solid ${GOLD}`, background: '#FBF5EA' },
  staffInitial: { width: 44, height: 44, borderRadius: '50%', background: SAND, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: WALNUT },
  staffName: { fontSize: 15, fontWeight: 600, color: WALNUT },
  staffRole: { fontSize: 11, color: SAGE, marginTop: 4, lineHeight: 1.4 },

  // Calendar
  calendar: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 24 },
  calHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calNav: { background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: WALNUT, padding: '2px 8px', lineHeight: 1 },
  calMonthLabel: { fontSize: 16, fontWeight: 600, color: WALNUT },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 },
  calDayLbl: { textAlign: 'center', fontSize: 11, color: SAGE, padding: '4px 0', fontWeight: 600, textTransform: 'uppercase' },
  calDay: { textAlign: 'center', padding: '7px 4px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, background: 'none', fontFamily: "'Cormorant Garamond', Georgia, serif", color: WALNUT },
  calDayPast: { color: '#C8BFB6', cursor: 'not-allowed' },
  calDaySelected: { background: GOLD, color: WHITE, fontWeight: 700 },

  // Time slots
  timeSection: { marginBottom: 28 },
  timeSectionTitle: { fontSize: 16, fontWeight: 600, color: WALNUT, margin: '0 0 16px' },
  timeGroupLabel: { fontSize: 11, fontWeight: 700, color: SAGE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  timeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: 8 },
  timeSlot: { padding: '9px 6px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, cursor: 'pointer', fontSize: 14, fontFamily: "'Cormorant Garamond', Georgia, serif", color: WALNUT, textAlign: 'center' },
  timeSlotSel: { background: GOLD, borderColor: GOLD, color: WHITE, fontWeight: 700 },
  loadingText: { color: SAGE, fontStyle: 'italic', margin: '16px 0' },
  noSlots: { color: SAGE, fontStyle: 'italic', margin: '16px 0' },

  // Details form
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  formField: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: WALNUT },
  input: { padding: '12px 14px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 15, fontFamily: "'Cormorant Garamond', Georgia, serif", color: WALNUT, background: WHITE, outline: 'none', width: '100%', boxSizing: 'border-box' },
  textarea: { resize: 'vertical', minHeight: 80 },

  // Cancellation policy
  policyBox: { background: SAND, borderRadius: 10, padding: '18px 20px', marginBottom: 24 },
  policyTitle: { fontSize: 15, fontWeight: 700, color: WALNUT, margin: '0 0 10px' },
  policyText: { fontSize: 14, color: WALNUT, lineHeight: 1.7, margin: '0 0 14px' },
  policyAgree: { display: 'flex', alignItems: 'center', fontSize: 14, color: WALNUT, cursor: 'pointer', fontWeight: 500 },

  // Buttons
  primaryBtn: { background: WALNUT, color: WHITE, border: 'none', padding: '13px 30px', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, letterSpacing: 0.5 },
  ghostBtn: { background: 'transparent', color: WALNUT, border: `1px solid ${BORDER}`, padding: '13px 24px', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontFamily: "'Cormorant Garamond', Georgia, serif" },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  btnRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 },

  // Payment / summary
  summaryCard: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  summarySection: { padding: '14px 18px', borderBottom: `1px solid ${BORDER}` },
  summaryLabel: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: SAGE, marginBottom: 10 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '3px 0', color: WALNUT },
  summaryTotal: { fontWeight: 700, borderTop: `1px solid ${BORDER}`, paddingTop: 10, marginTop: 6, fontSize: 15 },

  depositBox: { background: SAND, borderRadius: 10, padding: '18px 20px', marginBottom: 20, textAlign: 'center' },
  depositTitle: { fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: WALNUT, marginBottom: 10 },
  depositAmount: { fontSize: 28, fontWeight: 700, color: WALNUT, marginBottom: 6 },
  depositNote: { fontSize: 13, color: SAGE, lineHeight: 1.5 },
  payChoiceRow: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10, textAlign: 'left' },
  payChoice: { display: 'flex', alignItems: 'center', fontSize: 15, color: WALNUT, cursor: 'pointer' },

  stripeBox: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 18, marginBottom: 24 },
  stripeLabel: { fontSize: 12, fontWeight: 600, color: SAGE, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  stripePlaceholder: { padding: 16, background: CREAM, borderRadius: 6, fontSize: 14, color: SAGE, textAlign: 'center' },
  stripeNote: { fontSize: 14, color: SAGE, margin: 0, lineHeight: 1.5 },

  // Confirmation
  confirmIcon: { width: 60, height: 60, borderRadius: '50%', background: SAGE, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, margin: '0 auto 20px' },
  confirmCard: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 22, textAlign: 'left', marginBottom: 20 },
  confirmRef: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: SAGE, marginBottom: 10 },
  confirmService: { fontSize: 18, fontWeight: 600, color: WALNUT, marginBottom: 6 },
  confirmMeta: { fontSize: 14, color: SAGE, marginBottom: 4 },
  confirmAddress: { fontSize: 14, color: SAGE, lineHeight: 1.6, marginBottom: 24 },

  // Floating summary bar
  floatingSummary: { position: 'fixed', bottom: 0, left: 0, right: 0, background: WALNUT, color: WHITE, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, borderTop: `2px solid ${GOLD}` },
  floatServices: { fontSize: 13, opacity: 0.85 },
  floatPrice: { fontSize: 15, fontWeight: 700 },

  // Admin
  adminPage: { display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' },
  adminSidebar: { width: 210, background: WALNUT, padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 },
  adminLogo: { color: WHITE, fontSize: 18, fontWeight: 700, fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: 20, lineHeight: 1.3 },
  adminNavBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '9px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 6, fontSize: 13, fontFamily: 'system-ui, sans-serif', letterSpacing: 0.3 },
  adminNavActive: { background: 'rgba(255,255,255,0.15)', color: WHITE },
  adminTab: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '9px 12px', textAlign: 'left', cursor: 'pointer', borderRadius: 6, fontSize: 13, fontFamily: 'system-ui, sans-serif' },
  adminTabActive: { background: 'rgba(255,255,255,0.15)', color: WHITE },
  adminBack: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none' },
  adminMain: { flex: 1, padding: 40, background: '#F5F4F1', overflowY: 'auto' },
  adminPageTitle: { fontSize: 22, fontWeight: 700, marginBottom: 24, color: WALNUT },
  adminCard: { background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, marginBottom: 20, overflow: 'hidden' },
  adminCardTitle: { fontSize: 15, fontWeight: 700, color: WALNUT, padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, margin: 0, background: CREAM },
  adminRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 18px', borderBottom: `1px solid ${BORDER}`, fontSize: 14, color: WALNUT },
  adminMeta: { color: SAGE, fontSize: 13 },
  adminBadge: { display: 'inline-block', fontSize: 10, color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 4, padding: '1px 6px', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  adminApptRow: { display: 'flex', alignItems: 'flex-start', gap: 16, padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, fontSize: 14, color: WALNUT },
  adminApptTime: { width: 60, flexShrink: 0, fontSize: 13, fontWeight: 600, color: WALNUT, lineHeight: 1.4 },
  adminSmBtn: { background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: WALNUT },
  kpiTile: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '20px 24px', minWidth: 140 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: WALNUT, lineHeight: 1 },
  kpiLabel: { fontSize: 12, color: SAGE, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  calApptChip: { background: '#FBF5EA', border: `1px solid ${BORDER}`, borderRadius: 5, padding: '4px 6px', cursor: 'default' },
  calNavBtn: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 16, color: WALNUT, fontFamily: 'system-ui, sans-serif' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: WHITE, borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 60px rgba(0,0,0,0.2)' },
  modalClose: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: SAGE, padding: 4, lineHeight: 1 },
}
