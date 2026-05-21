import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  createBooking,
  fetchAppointmentsByField,
  fetchFieldById,
  fetchFieldOffers,
  fetchFieldMonthCalendar,
  paymentCheckout,
  seekPlayers,
} from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
import type {
  Appointment,
  DayCalendarDto,
  FieldDto,
  MonthCalendarDto,
  ServiceOfferDto,
  SlotDto,
} from '../types'
import { BookingWizardStepper } from '../components/BookingWizardStepper'
import {
  canStartBookingAt,
  filterBookingDisplaySlots,
  minutesFromTimeLabel,
  prepareDaySlots,
} from '../calendarSlots'
import { FieldDetailBookingRail } from './FieldDetailBookingRail'
import { isPublicOutdoorField } from '../fieldUtils'

const GUEST_CHECKOUT_EMAIL_KEY = 'termini_guest_checkout_email'

type TopSvcRow = { n: string; m: number; p: number }

function topPackagesForCategory(category: string): TopSvcRow[] {
  if (category === 'SPORTS') {
    return [
      { n: '5v5 Indoor', m: 60, p: 45 },
      { n: '7v7 Outdoor', m: 90, p: 65 },
      { n: '11v11 (Stadium)', m: 120, p: 90 },
      { n: 'Trainer Session', m: 60, p: 25 },
    ]
  }
  if (category === 'BEAUTY') {
    return [
      { n: 'Haircut', m: 20, p: 12 },
      { n: 'Beard Trim', m: 15, p: 7 },
      { n: 'Haircut + Beard', m: 35, p: 18 },
      { n: 'Shave', m: 20, p: 10 },
    ]
  }
  if (category === 'HEALTH') {
    return [
      { n: 'Consultation', m: 30, p: 20 },
      { n: 'Physio Session', m: 60, p: 25 },
      { n: 'Massage', m: 60, p: 30 },
      { n: 'Follow-up', m: 15, p: 10 },
    ]
  }
  if (category === 'AUTO') {
    return [
      { n: 'Car Wash', m: 30, p: 8 },
      { n: 'Interior Cleaning', m: 60, p: 18 },
      { n: 'Oil Change', m: 45, p: 22 },
      { n: 'Diagnostics', m: 30, p: 15 },
    ]
  }
  if (category === 'EDUCATION') {
    return [
      { n: 'Lesson (1:1)', m: 60, p: 12 },
      { n: 'Exam Prep', m: 90, p: 18 },
      { n: 'Group Class', m: 60, p: 8 },
      { n: 'Mentoring', m: 45, p: 10 },
    ]
  }
  if (category === 'PROFESSIONAL') {
    return [
      { n: 'Consultation', m: 45, p: 30 },
      { n: 'Document Review', m: 30, p: 20 },
      { n: 'Case Follow-up', m: 60, p: 35 },
      { n: 'Notary Service', m: 20, p: 18 },
    ]
  }
  return [
    { n: 'Standard booking', m: 30, p: 10 },
    { n: 'Premium booking', m: 60, p: 18 },
    { n: 'Express', m: 15, p: 6 },
    { n: 'Custom', m: 45, p: 14 },
  ]
}

function formatTime(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

function slotKey(s: { hour: number; minute?: number }) {
  const m = s.minute ?? 0
  return `${pad2(s.hour)}:${pad2(m)}`
}

function slotSortMinutes(s: SlotDto) {
  return s.hour * 60 + (s.minute ?? 0)
}

function toISODate(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function todayIsoLocal(): string {
  const d = new Date()
  return toISODate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function FieldDetailPage() {
  const { fieldId: param } = useParams()
  const [searchParams] = useSearchParams()
  const fieldId = Number(param)
  const { user, isAuthenticated } = useSession()
  const [field, setField] = useState<FieldDto | null>(null)
  const [rows, setRows] = useState<Appointment[]>([])
  const [apptLoading, setApptLoading] = useState(false)
  const [calendar, setCalendar] = useState<MonthCalendarDto | null>(null)
  const [offers, setOffers] = useState<ServiceOfferDto[]>([])
  const [selectedOfferId, setSelectedOfferId] = useState<number | ''>('')
  const [calLoading, setCalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payInfo, setPayInfo] = useState<string | null>(null)
  const [date, setDate] = useState(todayIsoLocal)
  const [calendarView, setCalendarView] = useState(() => {
    const n = new Date()
    return { y: n.getFullYear(), m: n.getMonth() + 1 }
  })
  const [time, setTime] = useState('18:00')
  const [durationMinutes, setDurationMinutes] = useState<number>(60)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [selectedSlotLabel, setSelectedSlotLabel] = useState<string | null>(null)
  const [seekFor, setSeekFor] = useState<number | null>(null)
  const [playersNeeded, setPlayersNeeded] = useState(2)
  const [totalPrice, setTotalPrice] = useState('60')
  const [split, setSplit] = useState(true)
  const [splitCount, setSplitCount] = useState(10)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  /** Player-completion: përshtatet me backend `openJoinSlots` (vetëm SPORTS + i kyçur). */
  const [openJoinEnabled, setOpenJoinEnabled] = useState(false)
  const [openJoinSlots, setOpenJoinSlots] = useState(4)
  const [detailTab, setDetailTab] = useState<
    'overview' | 'pricing' | 'reviews' | 'photos'
  >('overview')
  const bookingPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setSelectedSlotLabel(null)
  }, [date])

  useEffect(() => {
    if (detailTab === 'pricing') {
      bookingPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [detailTab])

  /** Email i fundit i përdorur për pagesë mysafir — e kursejmë hapin tjetër. */
  useEffect(() => {
    try {
      const prev = sessionStorage.getItem(GUEST_CHECKOUT_EMAIL_KEY)?.trim()
      if (prev) setGuestEmail(prev)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const d = searchParams.get('date')
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return
    if (d < todayIsoLocal()) return
    setDate(d)
    const y = Number(d.slice(0, 4))
    const m = Number(d.slice(5, 7))
    if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
      setCalendarView({ y, m })
    }
  }, [searchParams])

  /** Duke ndërruar muajin, mbaj një ditë në muajin e dukshëm (përndryshe lista e orëve mbetet jashtë fokusit). */
  useEffect(() => {
    const d = new Date(date + 'T12:00:00')
    if (Number.isNaN(d.getTime())) return
    if (d.getFullYear() === calendarView.y && d.getMonth() + 1 === calendarView.m) return

    const dim = daysInMonth(calendarView.y, calendarView.m)
    const t = todayIsoLocal()
    let pick = toISODate(calendarView.y, calendarView.m, Math.min(dim, 1))
    for (let day = 1; day <= dim; day++) {
      const iso = toISODate(calendarView.y, calendarView.m, day)
      if (iso >= t) {
        pick = iso
        break
      }
    }
    setDate(pick)
  }, [calendarView.y, calendarView.m])

  useEffect(() => {
    if (field?.category !== 'SPORTS') {
      setOpenJoinEnabled(false)
    }
  }, [field?.category])

  useEffect(() => {
    if (!Number.isFinite(fieldId)) return
    fetchFieldById(fieldId)
      .then(setField)
      .catch(() => setField(null))
  }, [fieldId])

  useEffect(() => {
    if (!Number.isFinite(fieldId)) return
    fetchFieldOffers(fieldId)
      .then((rows) => setOffers(Array.isArray(rows) ? rows : []))
      .catch(() => setOffers([]))
  }, [fieldId])

  const loadMyAppointments = useCallback(() => {
    if (!Number.isFinite(fieldId) || !isAuthenticated) {
      setRows([])
      return
    }
    setApptLoading(true)
    fetchAppointmentsByField(fieldId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setApptLoading(false))
  }, [fieldId, isAuthenticated])

  useEffect(() => {
    loadMyAppointments()
  }, [loadMyAppointments])

  useEffect(() => {
    if (!Number.isFinite(fieldId)) return
    setCalLoading(true)
    fetchFieldMonthCalendar(fieldId, calendarView.y, calendarView.m)
      .then(setCalendar)
      .catch(() => setCalendar(null))
      .finally(() => setCalLoading(false))
  }, [fieldId, calendarView.y, calendarView.m])

  const dayCalendar: DayCalendarDto | undefined = useMemo(() => {
    if (!calendar?.days) return undefined
    return calendar.days.find((d) => d.date === date)
  }, [calendar, date])

  const orderedSlots = useMemo(() => {
    return prepareDaySlots(dayCalendar?.slots, field, offers)
  }, [dayCalendar, field, offers])

  const monthDaysPrepared = useMemo(() => {
    return (calendar?.days ?? []).map((d) => ({
      ...d,
      slots: prepareDaySlots(d.slots, field, offers),
    }))
  }, [calendar?.days, field, offers])

  const isFreeField = useMemo(() => {
    const h = field?.hourlyPriceEur
    const n = typeof h === 'string' ? parseFloat(h) : Number(h ?? NaN)
    const hourlyZero = h == null || !Number.isFinite(n) || n <= 0
    const paidOffer = offers.some((o) => {
      const p = typeof o.priceEur === 'string' ? parseFloat(String(o.priceEur)) : Number(o.priceEur)
      return Number.isFinite(p) && p > 0
    })
    return hourlyZero && !paidOffer
  }, [field?.hourlyPriceEur, offers])

  const hourlyNum = useMemo(() => {
    if (isFreeField) return 0
    const h = field?.hourlyPriceEur
    if (h == null) return 35
    const n = typeof h === 'string' ? parseFloat(h) : Number(h)
    return Number.isFinite(n) && n > 0 ? n : 35
  }, [field, isFreeField])

  const durationOptions = useMemo(() => {
    // If backend offers exist, durations should come from offers (not a hardcoded list)
    if (offers.length > 0) {
      return Array.from(new Set(offers.map((o) => o.durationMinutes))).sort((a, b) => a - b)
    }
    const base =
      field?.category === 'BEAUTY'
        ? [15, 30, 45, 60]
        : field?.category === 'HEALTH'
          ? [30, 60, 90, 120]
          : field?.category === 'AUTO'
            ? [30, 60, 90, 120]
            : field?.category === 'EDUCATION'
              ? [45, 60, 90, 120]
              : field?.category === 'OTHER'
                ? [30, 60, 90, 120]
                : [60, 90, 120, 150, 180] // SPORTS default
    const def = field?.defaultDurationMinutes
    const merged = new Set<number>(base)
    if (def != null && Number.isFinite(def) && def > 0) merged.add(def)
    return Array.from(merged).sort((a, b) => a - b)
  }, [field?.category, field?.defaultDurationMinutes])

  const selectedOffer = useMemo(() => {
    if (!selectedOfferId) return undefined
    return offers.find((o) => o.id === selectedOfferId)
  }, [offers, selectedOfferId])

  useEffect(() => {
    // Default-select first offer when offers are loaded
    if (offers.length > 0 && !selectedOfferId) {
      setSelectedOfferId(offers[0]!.id)
    }
  }, [offers, selectedOfferId])

  useEffect(() => {
    if (selectedOffer?.durationMinutes != null) {
      setDurationMinutes(selectedOffer.durationMinutes)
    }
  }, [selectedOffer?.durationMinutes])

  useEffect(() => {
    const def = field?.defaultDurationMinutes
    if (offers.length > 0) return
    if (def != null && Number.isFinite(def) && def > 0) {
      setDurationMinutes(def)
    }
  }, [field?.defaultDurationMinutes, offers.length])

  /** Kur paketa është 60 min, mos mbaj të zgjedhur 09:30 — rreshto me 09:00, 10:00, … */
  useEffect(() => {
    if (!selectedSlotLabel || !orderedSlots.length) return
    const grid = field?.slotCalendarMinutes ?? 60
    const display = filterBookingDisplaySlots(
      orderedSlots,
      durationMinutes,
      grid,
    )
    const min = minutesFromTimeLabel(selectedSlotLabel)
    if (min == null) return
    if (display.some((s) => slotSortMinutes(s) === min)) return
    const snap =
      [...display].reverse().find((s) => slotSortMinutes(s) <= min) ?? display[0]
    if (!snap) {
      setSelectedSlotLabel(null)
      return
    }
    const k = slotKey(snap)
    setSelectedSlotLabel(k)
    setTime(k)
  }, [durationMinutes, orderedSlots, field?.slotCalendarMinutes, selectedSlotLabel])

  const estimatedTotal = useMemo(() => {
    if (isFreeField) return '0.00'
    if (selectedOffer?.priceEur != null) {
      const n = typeof selectedOffer.priceEur === 'string'
        ? parseFloat(selectedOffer.priceEur)
        : Number(selectedOffer.priceEur)
      if (Number.isFinite(n)) return n.toFixed(2)
    }
    return ((hourlyNum * durationMinutes) / 60).toFixed(2)
  }, [hourlyNum, durationMinutes, selectedOffer?.priceEur, isFreeField])

  function pickSlot(s: SlotDto) {
    const grid = field?.slotCalendarMinutes ?? 60
    if (
      !canStartBookingAt(
        orderedSlots,
        slotSortMinutes(s),
        durationMinutes,
        grid,
      )
    ) {
      return
    }
    const k = slotKey(s)
    setSelectedSlotLabel(k)
    setTime(k.length >= 5 ? k.slice(0, 5) : k)
  }

  function shiftCalendarMonth(delta: number) {
    setCalendarView((v) => {
      let m = v.m + delta
      let y = v.y
      while (m > 12) {
        m -= 12
        y += 1
      }
      while (m < 1) {
        m += 12
        y -= 1
      }
      return { y, m }
    })
  }

  const monthTitleLabel = useMemo(
    () =>
      new Date(calendarView.y, calendarView.m - 1, 1).toLocaleDateString('sq-AL', {
        month: 'long',
        year: 'numeric',
      }),
    [calendarView.y, calendarView.m],
  )

  const selectedDayHeading = useMemo(() => {
    const d = new Date(date + 'T12:00:00')
    if (Number.isNaN(d.getTime())) return date
    return d.toLocaleDateString('sq-AL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [date])

  async function book(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPayInfo(null)
    setCheckoutLoading(true)
    const timeAppointment =
      time.length === 5 ? `${time}:00` : time.length === 8 ? time : `${time}:00`
    try {
      const fallbackHours = Math.max(1, Math.ceil(durationMinutes / 60))
      const body: Parameters<typeof createBooking>[0] = {
        fieldId,
        dateAppointment: date,
        timeAppointment,
        durationMinutes,
        timeReservedField: fallbackHours,
      }
      if (!isAuthenticated) {
        if (!guestName.trim() || !guestEmail.trim()) {
          setError('Shkruaj emrin dhe email-in për rezervim pa llogari.')
          return
        }
        body.guestName = guestName.trim()
        body.guestEmail = guestEmail.trim()
      }
      if (
        isAuthenticated &&
        field?.category === 'SPORTS' &&
        openJoinEnabled &&
        openJoinSlots >= 1 &&
        openJoinSlots <= 64
      ) {
        body.openJoinSlots = openJoinSlots
      }
      const created = await createBooking(body)

      // Always refresh calendar
      setSelectedSlotLabel(null)
      const nc = await fetchFieldMonthCalendar(fieldId, calendarView.y, calendarView.m)
      setCalendar(nc)

      if (isFreeField) {
        setPayInfo(
          `Rezervimi #${created.appointmentId} u krijua. Fushë publike — pa pagesë online.`,
        )
        if (isAuthenticated) loadMyAppointments()
        return
      }

      // Auto-checkout after booking (me pagesë)
      if (!isAuthenticated) {
        const mail = body.guestEmail?.trim() ?? ''
        sessionStorage.setItem(GUEST_CHECKOUT_EMAIL_KEY, mail)
        const res = await paymentCheckout(created.appointmentId, mail)
        if (res.mockPayoutNote) setPayInfo(res.mockPayoutNote)
        window.location.href = res.redirectUrl
        return
      }
      const res = await paymentCheckout(created.appointmentId)
      if (res.mockPayoutNote) setPayInfo(res.mockPayoutNote)
      window.location.href = res.redirectUrl
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Rezervimi dështoi (mund të ketë konflikt ore).',
      )
    } finally {
      setCheckoutLoading(false)
    }
  }

  async function pay(
    appointmentId: number,
    appt?: Appointment,
    overrideGuestEmail?: string,
  ) {
    setError(null)
    setPayInfo(null)
    const guestMail =
      (overrideGuestEmail ?? appt?.guestEmail ?? guestEmail).trim()
    const useGuestCheckout =
      overrideGuestEmail != null ||
      (appt != null && appt.booker == null) ||
      (appt == null && !isAuthenticated)
    try {
      if (useGuestCheckout) {
        if (!guestMail) {
          setError('Për pagesë si mysafir duhet email-i i rezervimit.')
          return
        }
        sessionStorage.setItem(GUEST_CHECKOUT_EMAIL_KEY, guestMail)
        const res = await paymentCheckout(appointmentId, guestMail)
        if (res.mockPayoutNote) setPayInfo(res.mockPayoutNote)
        window.location.href = res.redirectUrl
        return
      }
      if (!isAuthenticated) {
        setError('Hyr për të paguar rezervimin tënd.')
        return
      }
      const res = await paymentCheckout(appointmentId)
      if (res.mockPayoutNote) setPayInfo(res.mockPayoutNote)
      window.location.href = res.redirectUrl
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Checkout dështoi')
    }
  }

  async function submitSeek(appointmentId: number) {
    if (!isAuthenticated) {
      setError('Hyr për të publikuar kërkimin e lojtarëve.')
      return
    }
    setError(null)
    try {
      await seekPlayers(appointmentId, {
        playersNeeded,
        splitPaymentEnabled: split,
        totalFieldPrice: split ? Number(totalPrice) : undefined,
        splitAmongPlayerCount: split ? splitCount : undefined,
      })
      setSeekFor(null)
      loadMyAppointments()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'seek-players dështoi')
    }
  }

  const validFieldId = Number.isFinite(fieldId)
  const category = field?.category ?? 'OTHER'
  const topServices =
    offers.length > 0
      ? offers.map((o) => ({
          n: o.name,
          m: o.durationMinutes,
          p: typeof o.priceEur === 'string' ? Number(o.priceEur) : Number(o.priceEur),
        }))
      : topPackagesForCategory(category)
  const myUserId = user?.id
  const isMine = (a: Appointment) =>
    myUserId != null && a.booker?.id === myUserId

  const bookingWizardStep = useMemo(() => {
    if (isFreeField && payInfo) return 5
    if (checkoutLoading) return 4
    if (selectedSlotLabel) return 3
    return 2
  }, [checkoutLoading, isFreeField, payInfo, selectedSlotLabel])

  if (!validFieldId) {
    return <p className="alert alert-error">ID e pavlefshme e fushës.</p>
  }

  if (field && isPublicOutdoorField(field)) {
    return <Navigate to={`/fusha-publike/${fieldId}`} replace />
  }

  return (
    <div className="page svc-detail">
      <nav className="svc-bc">
        <Link to="/">Ballina</Link>
        <span className="svc-sep">›</span>
        <Link to="/fields">{category === 'SPORTS' ? 'Fushat' : 'Lokacionet'}</Link>
        <span className="svc-sep">›</span>
        <span className="svc-bc-current">{field?.name ?? `Fusha #${fieldId}`}</span>
      </nav>

      <BookingWizardStepper current={bookingWizardStep} />

      <div className="svc-layout svc-layout--detail">
        <section className="svc-left">
          <div className="svc-field-hero">
            <h1>{field?.name ?? `Fusha #${fieldId}`}</h1>
            <div className="svc-field-hero-meta">
              <span className="svc-field-rating">★ 4.9</span>
              <span className="muted">(128 vlerësime)</span>
              <span className="svc-field-dot" aria-hidden>
                ·
              </span>
              <span className="muted">
                {[field?.city, field?.location].filter(Boolean).join(' · ') ||
                  (category === 'SPORTS' ? 'Fushë sportive' : 'Lokacion')}
              </span>
            </div>
          </div>

          {detailTab !== 'photos' && <div className="svc-hero-photo" aria-hidden />}

          <div className="svc-amenities" aria-label="Karakteristika">
            {(category === 'SPORTS'
              ? ['Fushë sintetike', 'Ndriçim', 'Parking', 'Zhveshtore']
              : ['Artificial grass', 'Floodlights', 'Parking', 'Locker room']
            ).map((label) => (
              <div key={label} className="svc-amenity">
                <span className="svc-amenity-ico" aria-hidden />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="svc-tabs svc-tabs--bar" role="tablist" aria-label="Detaje lokacioni">
            {(
              [
                ['overview', 'Përmbledhje'],
                ['pricing', 'Çmime'],
                ['reviews', 'Vlerësime'],
                ['photos', 'Foto'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={detailTab === id}
                className={'svc-tab' + (detailTab === id ? ' svc-tab--active' : '')}
                onClick={() => setDetailTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="svc-tab-panels">
          <div className="svc-card">
            <h3>{category === 'SPORTS' ? 'Rreth fushës' : 'Rreth shërbimit'}</h3>
            <p className="muted">
              {category === 'SPORTS'
                ? 'Zgjidh një ditë dhe një orë të lirë për të rezervuar fushën. Terminet e zëna bllokohen automatikisht. Oraret e lira shfaqen në kalendar pasi të zgjedhësh datën.'
                : 'Zgjidh një ditë dhe një orë të lirë për të rezervuar shërbimin. Terminet e zëna bllokohen automatikisht.'}
            </p>
            <div className="svc-features">
              {category === 'SPORTS' ? (
                <>
                  <div className="svc-feature">Brenda / jashtë</div>
                  <div className="svc-feature">Konfirmim i shpejtë</div>
                  <div className="svc-feature">Sipërfaqe cilësore</div>
                  <div className="svc-feature">Rezervim online</div>
                </>
              ) : (
                <>
                  <div className="svc-feature">Experienced staff</div>
                  <div className="svc-feature">Premium products</div>
                  <div className="svc-feature">Clean & safe</div>
                  <div className="svc-feature">Online booking</div>
                </>
              )}
            </div>
          </div>

          <div className="svc-card">
            <div className="svc-card-head">
              <h3>Lokacioni</h3>
              <button type="button" className="svc-link-btn">
                Hap në hartë
              </button>
            </div>
            <p className="muted">
              {field?.location}
              {field?.city ? `, ${field.city}` : ''}
            </p>
            <div className="svc-map" aria-hidden />
          </div>

          {isAuthenticated && (
            <div className="svc-card">
              <h3>Rezervimet e mia këtu</h3>
              {apptLoading ? (
                <p className="muted">Duke ngarkuar…</p>
              ) : rows.filter(isMine).length === 0 ? (
                <p className="muted">Nuk ke rezervime në këtë lokacion.</p>
              ) : (
                <ul className="svc-my-list">
                  {rows.filter(isMine).map((a) => (
                    <li key={a.appointmentId} className="svc-my-row">
                      <div>
                        <strong>
                          {a.dateAppointment} · {formatTime(a.timeAppointment)}
                        </strong>
                        <div className="muted small">
                          ID: {a.appointmentId}
                          {a.seekingPlayers ? ' · kërkon lojtarë' : ''}
                        </div>
                      </div>
                      <div className="svc-my-actions">
                        <button
                          type="button"
                          className="svc-mini-btn svc-mini-btn--primary"
                          onClick={() => pay(a.appointmentId, a)}
                        >
                          Paguaj
                        </button>
                        {category === 'SPORTS' &&
                          (seekFor === a.appointmentId ? (
                            <div className="svc-seek">
                              <label className="svc-inline">
                                Mungojnë
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={playersNeeded}
                                  onChange={(e) => setPlayersNeeded(Number(e.target.value))}
                                />
                              </label>
                              <label className="svc-inline">
                                <input
                                  type="checkbox"
                                  checked={split}
                                  onChange={(e) => setSplit(e.target.checked)}
                                />
                                Ndarje
                              </label>
                              {split && (
                                <>
                                  <label className="svc-inline">
                                    Total €
                                    <input
                                      value={totalPrice}
                                      onChange={(e) => setTotalPrice(e.target.value)}
                                    />
                                  </label>
                                  <label className="svc-inline">
                                    Për
                                    <input
                                      type="number"
                                      min={1}
                                      value={splitCount}
                                      onChange={(e) => setSplitCount(Number(e.target.value))}
                                    />
                                  </label>
                                </>
                              )}
                              <button
                                type="button"
                                className="svc-mini-btn svc-mini-btn--primary"
                                onClick={() => submitSeek(a.appointmentId)}
                              >
                                Publiko
                              </button>
                              <button
                                type="button"
                                className="svc-mini-btn"
                                onClick={() => setSeekFor(null)}
                              >
                                Anulo
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="svc-mini-btn"
                              onClick={() => setSeekFor(a.appointmentId)}
                            >
                              Gjej lojtarë
                            </button>
                          ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          </div>
        </section>

        <aside className="svc-right">
          <FieldDetailBookingRail
            ref={bookingPanelRef}
            className="tp-rail-pro"
            railTitle={selectedSlotLabel ? 'Konfirmo rezervimin' : 'Data dhe ora'}
            field={field}
            isFreeField={isFreeField}
            selectedDayHeading={selectedDayHeading}
            date={date}
            setDate={setDate}
            setCalendarView={setCalendarView}
            todayIso={todayIsoLocal()}
            calendarView={calendarView}
            shiftCalendarMonth={shiftCalendarMonth}
            monthTitleLabel={monthTitleLabel}
            calLoading={calLoading}
            dayCalendar={dayCalendar}
            orderedSlots={orderedSlots}
            selectedSlotLabel={selectedSlotLabel}
            pickSlot={pickSlot}
            slotKey={slotKey}
            slotSortMinutes={slotSortMinutes}
            offers={offers}
            selectedOfferId={selectedOfferId}
            setSelectedOfferId={setSelectedOfferId}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            durationOptions={durationOptions}
            isAuthenticated={isAuthenticated}
            openJoinEnabled={openJoinEnabled}
            setOpenJoinEnabled={setOpenJoinEnabled}
            openJoinSlots={openJoinSlots}
            setOpenJoinSlots={setOpenJoinSlots}
            guestName={guestName}
            setGuestName={setGuestName}
            guestEmail={guestEmail}
            setGuestEmail={setGuestEmail}
            book={book}
            checkoutLoading={checkoutLoading}
            estimatedTotal={estimatedTotal}
            formatTime={formatTime}
            time={time}
            monthDays={monthDaysPrepared}
          />

          <div className="svc-actions svc-actions--rail">
            <button type="button" className="svc-action">
              Telefon
            </button>
            <button type="button" className="svc-action">
              Mesazh
            </button>
            <button type="button" className="svc-action">
              Ruaj
            </button>
            <button type="button" className="svc-action">
              Ndaj
            </button>
          </div>

          <div className="svc-top-card svc-top-card--rail">
            <h3>{category === 'SPORTS' ? 'Paketat kryesore' : 'Shërbimet kryesore'}</h3>
            <div className="svc-top-list">
              {topServices.map((x) => (
                <div key={x.n} className="svc-top-item">
                  <span className="svc-top-name">{x.n}</span>
                  <span className="svc-top-meta muted">{x.m} min</span>
                  <span className="svc-top-price">€{x.p}</span>
                </div>
              ))}
            </div>
            <Link to="/fields" className="svc-view-all">
              {category === 'SPORTS' ? 'Të gjitha fushat' : 'Të gjitha lokacionet'}
            </Link>
          </div>
        </aside>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {payInfo && <p className="alert alert-success">{payInfo}</p>}
    </div>
  )
}
