// Vihara service catalogue, staff and booking settings.
// Shared by the booking page (browser) and the payment API (server),
// so prices are always worked out from the same source.
//
// Menu updated 26 Nov 2026 to match the Parkdale menu in Zenoti.
// To change a price or description, edit it here and publish — it updates everywhere.
// `locations` on each treatment controls where it can be booked (PARKDALE, DROMANA or BOTH).

// ── Locations ─────────────────────────────────────────────────────────────────
export const PARKDALE = '00000000-0000-0000-0000-000000000001'
export const DROMANA = '00000000-0000-0000-0000-000000000002'
const BOTH = [PARKDALE, DROMANA]

// ── Therapists ────────────────────────────────────────────────────────────────
const BEE = '30000000-0000-0000-0000-000000000001'
const SIANNE = '30000000-0000-0000-0000-000000000003'
const ALEXIA = '30000000-0000-0000-0000-000000000004'
const ELISA = '30000000-0000-0000-0000-000000000005'

const ALL_HEAD_SPA = [ALEXIA, BEE, ELISA, SIANNE]

export const DEFAULT_STAFF = [
  { id: ALEXIA, name: 'Alexia', role: 'Massage & Head Spa Therapist' },
  { id: BEE, name: 'Bee', role: 'Head Spa Therapist & Reiki Practitioner' },
  { id: ELISA, name: 'Elisa', role: 'Holistic Wellness Practitioner' },
  { id: SIANNE, name: 'Sianne', role: 'Director, Clinical Hypnotherapist & Holistic Practitioner' },
]

// ── Add-ons ───────────────────────────────────────────────────────────────────
export const DEFAULT_ADDONS = [
  { id: 'ao1', name: '30min Quiet Touch', duration: 30, price: 80 },
  { id: 'ao2', name: 'Blow Dry', duration: 30, price: 60 },
  { id: 'ao3', name: 'Custom Sheet Face Mask', duration: 0, price: 31 },
  { id: 'ao4', name: 'Energy Realignment Ritual', duration: 15, price: 50 },
  { id: 'ao5', name: 'Face Massage', duration: 15, price: 50 },
  { id: 'ao7', name: '45min Massage', duration: 45, price: 120 },
  { id: 'ao8', name: '60min Massage', duration: 60, price: 162 },
  { id: 'ao9', name: 'Herbal Foot Bath', duration: 15, price: 40 },
  { id: 'ao10', name: 'Steam Hair Treatment', duration: 15, price: 40 },
  { id: 'ao11', name: 'Touch Therapy', duration: 30, price: 80 },
]

// ── Treatments ────────────────────────────────────────────────────────────────
export const DEFAULT_CATEGORIES = [
  {
    id: 'cat1',
    name: 'Japanese Head Spa',
    services: [
      {
        id: 's1', name: 'The Soul Spa', duration: 135, price: 366, locations: [PARKDALE],
        description: 'Our most immersive and luxurious head spa ritual. A 135-minute journey of complete restoration, blending therapeutic massage, sensory water rituals, sound healing and gentle energy work to nurture your body and reconnect you with yourself. Includes guided meditation and aromatherapy, scalp exfoliation and deep cleansing, therapeutic scalp and décolletage massage, relaxing hand and arm massage, gentle chest exfoliation, third-eye oil ritual, herbal-infused water pours and signature water therapy, nourishing steam hair treatment, sound healing, chakra crystal placement and gentle energy realignment, nourishing hair products and a personalised blow-dry finish. Perfect for guests craving the ultimate self-care experience.',
        staff: ALL_HEAD_SPA, addons: ['ao1', 'ao7', 'ao8', 'ao3', 'ao5', 'ao9'],
      },
      {
        id: 's2', name: 'The Vihara Signature Journey', duration: 90, price: 257, locations: BOTH,
        description: 'Our signature head spa experience, created for those seeking deeper relaxation and restoration. Unwind with therapeutic massage, soothing water rituals and sound healing, before finishing with a personalised blow-dry. Includes guided meditation and aromatherapy, scalp exfoliation and deep cleansing, therapeutic scalp and décolletage massage, relaxing hand and arm massage, third-eye oil ritual, herbal-infused water pours, signature water therapy, sound healing, nourishing hair products and a personalised blow-dry finish. Perfect for guests wanting the complete Vihara experience.',
        staff: ALL_HEAD_SPA, addons: ['ao1', 'ao7', 'ao8', 'ao3', 'ao4', 'ao5', 'ao9', 'ao10', 'ao11'],
      },
      {
        id: 's3', name: 'Enlighten Ritual Head Spa', duration: 45, price: 162, locations: BOTH,
        description: 'Your introduction to the Vihara Head Spa experience. A beautiful 45-minute ritual designed to quiet the mind, soothe the scalp and gently restore balance. Includes guided meditation and aromatherapy, scalp exfoliation and cleansing, therapeutic scalp and décolletage massage, third-eye oil ritual, herbal-infused water pours, signature water therapy, nourishing hair products, towel drying and gentle detangling. Perfect for first-time guests, a mindful reset or a shorter moment of calm. Please note: this ritual does not include a blow-dry finish.',
        staff: ALL_HEAD_SPA, addons: ['ao1', 'ao2', 'ao3', 'ao4', 'ao5', 'ao9', 'ao10', 'ao11'],
      },
    ],
  },
  {
    id: 'cat7',
    name: 'Head Spa & Massage',
    services: [
      {
        id: 's17', name: 'The Immersion', duration: 135, price: 384, locations: [PARKDALE],
        description: 'Our complete head-to-toe experience, bringing together soothing scalp rituals, a full-body massage and a professional blow-dry. An indulgent escape designed to leave you feeling deeply nurtured and beautifully refreshed. Includes a 45-minute Enlighten Head Spa (scalp cleansing, exfoliation, massage and water therapy), a 60-minute intuitive relaxation massage with personalised pressure, and a professional blow-dry finish.',
        staff: [ALEXIA, ELISA], addons: [],
      },
      {
        id: 's18', name: 'The Flow', duration: 105, price: 324, locations: [PARKDALE],
        description: 'An extended head-to-toe experience combining our Enlighten Head Spa with a full hour of intuitive relaxation massage. Designed for guests who want more time to unwind and enjoy complete body relaxation. Includes a 45-minute Enlighten Head Spa (scalp cleansing, exfoliation, massage and water therapy), a 60-minute intuitive relaxation massage with personalised pressure, nourishing hair products and a towel-dry finish.',
        staff: [ALEXIA, ELISA], addons: ['ao2', 'ao3', 'ao5'],
      },
      {
        id: 's19', name: 'The Unwind', duration: 90, price: 283, locations: [PARKDALE],
        description: 'A restorative head-to-toe experience combining our Enlighten Head Spa with a relaxing body massage. The perfect balance of soothing scalp rituals and therapeutic touch. Includes a 45-minute Enlighten Head Spa (scalp cleansing, exfoliation, massage and water therapy), a 45-minute intuitive relaxation massage with personalised pressure, nourishing hair products and a towel-dry finish.',
        staff: [ALEXIA, ELISA], addons: [],
      },
    ],
  },
  {
    id: 'cat4',
    name: 'Sensory Rituals',
    services: [
      {
        id: 's8', name: 'Quiet Touch', duration: 60, price: 162, locations: [PARKDALE],
        description: 'A deeply nurturing, waterless sensory ritual inspired by the comforting sensation of having your hair gently played with. Using soft, intentional touch and soothing sensory tools, this treatment invites you to surrender into stillness and feel completely cared for. Includes gentle, intentional touch, soothing sensory tools, soft tracing movements across the back, arms and chest, delicate scalp and hair play, and slow, repetitive movements to encourage relaxation. Please note: this is a waterless treatment — no hair washing or water therapy is included.',
        staff: ALL_HEAD_SPA, addons: ['ao7', 'ao8', 'ao4', 'ao5', 'ao9', 'ao11'],
      },
      {
        id: 's9', name: 'Sound Bathing', duration: 60, price: 162, locations: [PARKDALE],
        description: 'An immersive sound healing experience designed to quiet the mind and invite deep relaxation. Rest comfortably as therapeutic sounds and gentle vibrations create a peaceful space for stillness, reflection and reconnection. Includes immersive therapeutic sound bathing, gentle vibrational sound experiences, subtle intuitive energetic support and uninterrupted time for rest and stillness.',
        staff: [BEE, SIANNE], addons: ['ao3', 'ao4', 'ao5', 'ao9', 'ao11'],
      },
      {
        id: 's10', name: 'Nervous System Reset', duration: 60, price: 162, locations: [PARKDALE],
        description: 'A deeply comforting body ritual designed to help you slow down and reconnect with yourself. Through gentle rocking, rhythmic movement and supportive touch, this experience creates space for profound rest and a sense of being held. Includes gentle body rocking and rhythmic movement, supportive holding techniques, slow intentional touch, soothing sensory touch elements, chakra crystal placement and gentle intuitive energy work.',
        staff: [BEE, ELISA], addons: ['ao4'],
      },
      {
        id: 's11', name: 'Cloud Ritual', duration: 45, price: 91, locations: [PARKDALE],
        description: 'Drift into relaxation in one of our sensory cloud chairs. This gentle, comforting ritual combines the warmth of a soft blanket, delicate scalp massage and soothing hair play to help you unwind. Includes relaxation in our sensory cloud chair, a cosy blanket, soothing eye mask, gentle head and scalp massage and slow, calming hair play.',
        staff: ALL_HEAD_SPA, addons: [],
      },
    ],
  },
  {
    id: 'cat2',
    name: 'For Him',
    services: [
      {
        id: 's4', name: 'His Grounded Journey', duration: 60, price: 199, locations: BOTH,
        description: 'An extended head spa ritual designed to ease built-up tension and restore a sense of calm. Combining therapeutic massage, warm water therapy and nurturing body rituals for a deeper, more grounding experience. Includes a deep scalp and hair cleanse, gentle scalp exfoliation, warm water therapy, slow targeted head, neck and shoulder massage, grounding chest exfoliation, beard cleanse, relaxing hand and arm massage and a towel-dry finish. Please note: this ritual does not include a blow-dry.',
        staff: ALL_HEAD_SPA, addons: ['ao1', 'ao7', 'ao8', 'ao3', 'ao4', 'ao5', 'ao9'],
      },
      {
        id: 's5', name: 'The Reset For Him', duration: 45, price: 162, locations: BOTH,
        description: 'A grounding head spa ritual designed to release tension, refresh the scalp and quiet a busy mind. The perfect escape for men needing time to switch off. Includes a deep scalp and hair cleanse, gentle scalp exfoliation, warm water therapy, slow targeted head, neck and shoulder massage and a towel-dry finish. Please note: this ritual does not include a blow-dry.',
        staff: ALL_HEAD_SPA, addons: ['ao1', 'ao7', 'ao8', 'ao3', 'ao4', 'ao5', 'ao9'],
      },
    ],
  },
  {
    id: 'cat8',
    name: 'Massage',
    services: [
      {
        id: 's20', name: 'The Body and Soul Ritual', duration: 105, price: 332, locations: [PARKDALE],
        description: 'Our most indulgent massage ritual, created to nurture you from head to toe. Begin with a soothing herbal foot bath before surrendering to an extended full-body massage and the comforting sensations of Quiet Touch. Includes a 15-minute soothing herbal foot bath, a 60-minute intuitive full-body massage with personalised pressure, and a 30-minute Quiet Touch sensory ritual with gentle tracing and calming touch.',
        staff: [ALEXIA, ELISA], addons: [],
      },
      {
        id: 's21', name: 'The Surrender Ritual', duration: 90, price: 292, locations: [PARKDALE],
        description: 'An immersive massage experience blending therapeutic touch, sensory relaxation and gentle energy work. A nurturing journey designed to help you release the demands of the day and surrender into stillness. Includes a 45-minute intuitive relaxation massage with personalised pressure, a 30-minute Quiet Touch sensory ritual and a 15-minute energy realignment.',
        staff: [ALEXIA, ELISA], addons: [],
      },
      {
        id: 's22', name: 'The Lymphatic Ritual', duration: 75, price: 243, locations: [PARKDALE],
        description: "A deeply restorative full-body ritual designed to support the body's natural lymphatic flow, combining gentle, intentional rhythmic massage with Vihara's signature approach to holistic relaxation. May help ease feelings of puffiness and heaviness. Includes 15 minutes of lymphatic and sensory stimulation to encourage deep relaxation, a 60-minute intentional rhythmic lymphatic drainage massage and soothing sound healing.",
        staff: [ELISA], addons: [],
      },
      {
        id: 's23', name: 'The Exhale', duration: 60, price: 212, locations: [PARKDALE],
        description: 'A grounding massage ritual combining flowing, intuitive touch with gentle energy work. Designed to soften tension, quiet the mind and invite you into a deeper state of rest. Includes a 45-minute intuitive relaxation massage with personalised pressure and a 15-minute energy realignment.',
        staff: [ALEXIA, ELISA], addons: [],
      },
    ],
  },
  {
    id: 'cat3',
    name: 'Reiki',
    services: [
      {
        id: 's6', name: 'Initial Reiki Session', duration: 60, price: 162, locations: [PARKDALE],
        description: "A gentle introduction to Reiki, offering a nurturing space to slow down, reconnect with yourself and experience deep stillness. This extended session explores your body's energy centres through intuitive energy work and grounding rituals. Includes gentle, intuitive Reiki energy work, focused attention on each energy centre (chakra), light touch where appropriate, grounding rituals and time for intentional stillness and relaxation.",
        staff: [BEE], addons: ['ao1'],
      },
      {
        id: 's7', name: 'Return Reiki Session', duration: 45, price: 112, locations: [PARKDALE],
        description: 'A gentle energetic reset for those continuing their Reiki journey. This focused session offers space to unwind, reconnect and find stillness through intuitive energy work and light touch. Includes gentle, intuitive Reiki energy work, light touch where appropriate, focused energy balancing and quiet time for grounding and relaxation.',
        staff: [BEE], addons: ['ao1'],
      },
    ],
  },
  {
    id: 'cat5',
    name: 'Pregnancy & Postpartum',
    services: [
      {
        id: 's13', name: 'Sacred Mother To Be Retreat', duration: 120, price: 366, locations: [PARKDALE],
        description: 'A deeply nurturing retreat created especially for expectant mothers. Combining soothing head spa rituals, a herbal foot bath and gentle sensory touch, this experience offers a beautiful opportunity to slow down and feel completely cared for. Includes warm cascading water therapy, slow rhythmic scalp massage, nourishing Oway hair treatments, a soothing herbal foot bath, face mask, a 30-minute Quiet Touch sensory ritual with gentle touch and hair play, and the Vihara signature blow-dry finish.',
        staff: [ELISA, SIANNE], addons: ['ao5'],
      },
      {
        id: 's15', name: 'Postpartum Cocoon', duration: 120, price: 350, locations: [PARKDALE],
        description: "A deeply nurturing postpartum experience designed to care for mothers during the transition into motherhood. Combining personalised head spa rituals, gentle energy work and restorative sound therapy. Includes a personalised herbal foot bath, gentle postpartum consultation, warm cascading water therapy, grounding scalp massage, nourishing hair and facial rituals, gentle Reiki energy work, soothing sound healing and professional hair styling in our lounge. Babies are warmly welcomed — your session can move gently around your baby's needs.",
        staff: [ELISA, SIANNE], addons: ['ao11'],
      },
      {
        id: 's14', name: 'Expecting Mother to Be Ritual', duration: 60, price: 223, locations: BOTH,
        description: 'A nurturing head spa experience thoughtfully created for mothers-to-be. Enjoy soothing scalp rituals, warm cascading water and a moment of peaceful relaxation, with additional pregnancy supports to keep you comfortable throughout. Includes the Enlighten Head Spa experience, gentle scalp exfoliation and cleansing, warm cascading water therapy, slow rhythmic scalp massage, gentle neck stretches and soothing massage, nourishing Oway hair treatments, a pregnancy pillow and additional comfort supports, and the Vihara signature blow-dry finish.',
        staff: ALL_HEAD_SPA, addons: ['ao1', 'ao3', 'ao5', 'ao9'],
      },
      {
        id: 's24', name: 'The Nurtured Mother Pregnancy Massage', duration: 60, price: 212, locations: [PARKDALE],
        description: 'A beautifully nurturing full-body massage created especially for the changing needs of pregnancy. Using gentle, flowing techniques and comfortable, supported positioning, this treatment offers a peaceful moment to rest, unwind and feel completely cared for. Includes a 60-minute full-body pregnancy relaxation massage with personalised pressure and comfortable, supported pregnancy positioning with cushions and bolsters.',
        staff: [ALEXIA], addons: [],
      },
    ],
  },
  {
    id: 'cat6',
    name: 'For Two',
    couples: true,
    // Prices here are the total for both guests ($ per person × 2)
    services: [
      {
        id: 'cs3', name: 'The Enlighten Ritual For Two', duration: 45, price: 324, couples: true, locations: [PARKDALE],
        description: 'Share a 45-minute introduction to the Vihara Head Spa experience, side by side. Designed to quiet the mind, soothe the scalp and gently restore balance, with guided meditation, scalp exfoliation and cleansing, therapeutic scalp and décolletage massage, third-eye oil ritual, herbal-infused water pours and signature water therapy. Finishes with towel drying and gentle detangling (no blow-dry). $162 per person.',
        staff: ALL_HEAD_SPA, addons: [],
      },
      {
        id: 'cs2', name: 'The Vihara Signature Journey For Two', duration: 90, price: 514, couples: true, locations: [PARKDALE],
        description: 'Our signature 90-minute head spa journey, shared side by side. Therapeutic massage, soothing water rituals and sound healing, finishing with a personalised blow-dry for you both. $257 per person.',
        staff: ALL_HEAD_SPA, addons: [],
      },
      {
        id: 'cs1', name: 'The Soul Spa For Two', duration: 135, price: 732, couples: true, locations: [PARKDALE],
        description: 'Our most immersive 135-minute head spa ritual, shared side by side. Therapeutic massage, sensory water rituals, steam hair treatment, sound healing and gentle energy work, finishing with a personalised blow-dry for you both. $366 per person.',
        staff: ALL_HEAD_SPA, addons: [],
      },
      {
        id: 'cs4', name: 'Quiet Touch For Two', duration: 60, price: 324, couples: true, locations: [PARKDALE],
        description: 'A waterless sensory ritual shared side by side, designed to provide deep emotional rest and nervous system support through soft, intentional touch and soothing hair play. $162 per person.',
        staff: ALL_HEAD_SPA, addons: [],
      },
      {
        id: 'cs5', name: 'Sound Bathing For Two', duration: 60, price: 324, couples: true, locations: [PARKDALE],
        description: 'An immersive sound healing experience shared side by side. Therapeutic sounds and gentle vibrations create a peaceful space for stillness, reflection and reconnection. $162 per person.',
        staff: [BEE, SIANNE], addons: [],
      },
    ],
  },
]

// ── Settings ──────────────────────────────────────────────────────────────────
// Opening hours by location and day (0 = Sunday … 6 = Saturday). null = closed.
// Hours are [open, close] in 24-hour time; 9.5 = 9:30am.
export const OPENING_HOURS = {
  [PARKDALE]: {
    0: null, 1: null, 2: null,
    3: [10, 18], 4: [10, 20], 5: [10, 20], 6: [9.5, 16], // Sat 9:30am–4pm
  },
  [DROMANA]: { // Wed, Fri, Sat 10am–4pm
    0: null, 1: null, 2: null,
    3: [10, 16], 4: null, 5: [10, 16], 6: [10, 16],
  },
}

// ── Roster: who works where, and on which days ───────────────────────────────
// days: 0 = Sunday … 6 = Saturday.
// fortnightlyFrom: works that day every second week, starting on this date.
// Clients can only book a therapist on a day they're rostered at that location.
export const ROSTER = [
  // Sianne — Parkdale Thursdays; Dromana Wednesdays & Saturdays; Dromana Fridays rotating with Bee
  { staff: SIANNE, location: PARKDALE, days: [4] },
  { staff: SIANNE, location: DROMANA, days: [3, 6] },
  { staff: SIANNE, location: DROMANA, days: [5], fortnightlyFrom: '2026-12-04' }, // TO CONFIRM which Friday is whose
  // Bee — Parkdale Wednesdays & Saturdays; Fridays alternate between Parkdale and Dromana
  { staff: BEE, location: PARKDALE, days: [3, 6] },
  { staff: BEE, location: PARKDALE, days: [5], fortnightlyFrom: '2026-12-04' },
  { staff: BEE, location: DROMANA, days: [5], fortnightlyFrom: '2026-12-11' },
  // Alexia — Parkdale Saturdays and every second Friday (TO CONFIRM which Fridays)
  { staff: ALEXIA, location: PARKDALE, days: [6] },
  { staff: ALEXIA, location: PARKDALE, days: [5], fortnightlyFrom: '2026-12-11' },
  // Elisa — Parkdale Wednesday to Saturday
  { staff: ELISA, location: PARKDALE, days: [3, 4, 5, 6] },
]

const dayNumber = (dateStr) => Math.round(new Date(`${dateStr}T12:00:00Z`).getTime() / 86400000)

// Is this therapist working at this location on this date ("YYYY-MM-DD")?
export function isRostered(staffId, locationId, dateStr) {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
  return ROSTER.some(r =>
    r.staff === staffId && r.location === locationId && r.days.includes(dow) &&
    (!r.fortnightlyFrom || (((dayNumber(dateStr) - dayNumber(r.fortnightlyFrom)) / 7) % 2 + 2) % 2 === 0)
  )
}

// Does this therapist ever work at this location?
export function worksAt(staffId, locationId) {
  return ROSTER.some(r => r.staff === staffId && r.location === locationId)
}

// Can this treatment be booked at this location?
export function offeredAt(service, locationId) {
  return !service.locations || service.locations.includes(locationId)
}

export function hoursFor(locationId, dayOfWeek) {
  const loc = OPENING_HOURS[locationId] || OPENING_HOURS[PARKDALE]
  return loc[dayOfWeek] || null
}

export const DEFAULT_SETTINGS = {
  depositPercent: 50,
  couplesDepositPercent: 50,
  stripePublishableKey: '',
  cancellationPolicy: 'To secure your appointment, a deposit is required at the time of booking. No-shows will be charged in full. Please contact us as soon as possible if you need to reschedule.',
  businessHoursStart: 9,
  businessHoursEnd: 20,
  slotInterval: 15,
  bufferMins: 15, // reset time after every treatment; never bookable
  businessName: 'Vihara Head Spa & Blow Dry Lounge',
  businessAddress: '1 Chandler Street, Parkdale VIC 3195',
  adminPin: '1234',
}
