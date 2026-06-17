import { forwardRef, useMemo, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  countFreeSlots,
  filterBookingDisplaySlots,
  isSlotBlocked,
  minutesFromTimeLabel,
  resolveSlotPickState,
} from '../calendarSlots'
import type { DayCalendarDto, FieldDto, ServiceOfferDto, SlotDto } from '../types'

const WEEKDAYS_MON_FIRST_SQ = ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die']

function pad2cal(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

function isoFromYmd(y: number, m: number, d: number) {
  return `${y}-${pad2cal(m)}-${pad2cal(d)}`
}

function summarizeDaySlots(slots: SlotDto[] | undefined) {
  if (!slots?.length) return 'empty' as const
  const free = countFreeSlots(slots)
  if (free === 0) return 'full' as const
  if (free === slots.length) return 'open' as const
  return 'mixed' as const
}

function dayRailCellClass(
  iso: string,
  selected: string,
  todayIso: string,
  slots: SlotDto[] | undefined,
) {
  if (iso < todayIso) return 'svc-rail-day svc-rail-day--past'
  const bits: string[] = ['svc-rail-day']
  if (iso === selected) {
    bits.push('svc-rail-day--selected')
    return bits.join(' ')
  }
  if (iso === todayIso) bits.push('svc-rail-day--today')
  const sum = summarizeDaySlots(slots)
  if (sum === 'open') bits.push('svc-rail-day--open')
  else if (sum === 'mixed') bits.push('svc-rail-day--mixed')
  else if (sum === 'full') bits.push('svc-rail-day--full')
  else bits.push('svc-rail-day--na')
  return bits.join(' ')
}

const SLOT_PERIOD_LABEL: Record<'morning' | 'afternoon' | 'evening', string> = {
  morning: 'Para 12:00',
  afternoon: '12:00 – 17:00',
  evening: 'Pas 17:00',
}

function slotPeriod(s: SlotDto): 'morning' | 'afternoon' | 'evening' {
  const mins = (s.hour ?? 0) * 60 + (s.minute ?? 0)
  if (mins < 12 * 60) return 'morning'
  if (mins < 17 * 60) return 'afternoon'
  return 'evening'
}

export type FieldDetailBookingRailProps = {
  field: FieldDto | null
  isFreeField: boolean
  selectedDayHeading: string
  date: string
  setDate: (v: string) => void
  setCalendarView: (v: { y: number; m: number }) => void
  todayIso: string
  calendarView: { y: number; m: number }
  shiftCalendarMonth: (d: number) => void
  monthTitleLabel: string
  calLoading: boolean
  dayCalendar: DayCalendarDto | undefined
  orderedSlots: SlotDto[]
  selectedSlotLabel: string | null
  pickSlot: (s: SlotDto) => void
  slotKey: (s: { hour: number; minute?: number }) => string
  slotSortMinutes: (s: SlotDto) => number
  offers: ServiceOfferDto[]
  selectedOfferId: number | ''
  setSelectedOfferId: (v: number | '') => void
  durationMinutes: number
  setDurationMinutes: (v: number) => void
  durationOptions: number[]
  isAuthenticated: boolean
  openJoinEnabled: boolean
  setOpenJoinEnabled: (v: boolean) => void
  openJoinSlots: number
  setOpenJoinSlots: (v: number) => void
  guestName: string
  setGuestName: (v: string) => void
  guestEmail: string
  setGuestEmail: (v: string) => void
  book: (e: FormEvent) => void | Promise<void>
  checkoutLoading: boolean
  estimatedTotal: string
  formatTime: (t: string) => string
  time: string
  /** Ditët e muajit nga API (orët për çdo ditë). */
  monthDays: DayCalendarDto[]
  /** Extra classes on the rail card (e.g. wizard styling). */
  className?: string
  /** Main heading — reflects wizard step. */
  railTitle?: string
}

export const FieldDetailBookingRail = forwardRef<HTMLDivElement, FieldDetailBookingRailProps>(
  function FieldDetailBookingRail(p, ref) {
    const title = p.railTitle ?? 'Rezervo'

    const dayByIso = useMemo(() => {
      const m = new Map<string, DayCalendarDto>()
      for (const d of p.monthDays) m.set(d.date, d)
      return m
    }, [p.monthDays])

    const monthCells = useMemo(() => {
      const y = p.calendarView.y
      const mo = p.calendarView.m
      const first = new Date(y, mo - 1, 1)
      const dim = new Date(y, mo, 0).getDate()
      const startPad = (first.getDay() + 6) % 7
      const out: ({ kind: 'pad' } | { kind: 'day'; iso: string; n: number })[] = []
      for (let i = 0; i < startPad; i++) out.push({ kind: 'pad' })
      for (let d = 1; d <= dim; d++) out.push({ kind: 'day', iso: isoFromYmd(y, mo, d), n: d })
      return out
    }, [p.calendarView.y, p.calendarView.m])

    function pickCalendarDay(iso: string) {
      if (iso < p.todayIso) return
      p.setDate(iso)
      const y = Number(iso.slice(0, 4))
      const m = Number(iso.slice(5, 7))
      if (Number.isFinite(y) && Number.isFinite(m)) p.setCalendarView({ y, m })
    }

    function goToday() {
      const t = p.todayIso
      const y = Number(t.slice(0, 4))
      const m = Number(t.slice(5, 7))
      if (Number.isFinite(y) && Number.isFinite(m)) p.setCalendarView({ y, m })
      p.setDate(t)
    }

    const gridStep = p.field?.slotCalendarMinutes ?? 60

    const displaySlots = useMemo(
      () =>
        filterBookingDisplaySlots(
          p.orderedSlots,
          p.durationMinutes,
          gridStep,
        ),
      [p.orderedSlots, p.durationMinutes, gridStep],
    )

    const slotsByPeriod = useMemo(() => {
      const buckets: { id: 'morning' | 'afternoon' | 'evening'; slots: SlotDto[] }[] = [
        { id: 'morning', slots: [] },
        { id: 'afternoon', slots: [] },
        { id: 'evening', slots: [] },
      ]
      const ix = { morning: 0, afternoon: 1, evening: 2 } as const
      for (const s of displaySlots) {
        buckets[ix[slotPeriod(s)]].slots.push(s)
      }
      return buckets.filter((b) => b.slots.length > 0)
    }, [displaySlots])

    const selectedStartMin = useMemo(() => {
      if (!p.selectedSlotLabel) return null
      return minutesFromTimeLabel(p.selectedSlotLabel)
    }, [p.selectedSlotLabel])

    const freeSlotsCount = useMemo(() => {
      let n = 0
      for (const s of displaySlots) {
        if (
          resolveSlotPickState(
            s,
            p.orderedSlots,
            p.durationMinutes,
            gridStep,
            selectedStartMin,
          ) === 'free'
        ) {
          n++
        }
      }
      return n
    }, [displaySlots, p.orderedSlots, p.durationMinutes, gridStep, selectedStartMin])

    const firstFreeSlot = useMemo(() => {
      for (const s of displaySlots) {
        if (
          resolveSlotPickState(
            s,
            p.orderedSlots,
            p.durationMinutes,
            gridStep,
            selectedStartMin,
          ) === 'free'
        ) {
          return s
        }
      }
      return undefined
    }, [displaySlots, p.orderedSlots, p.durationMinutes, gridStep, selectedStartMin])

    function slotPickState(s: SlotDto) {
      return resolveSlotPickState(
        s,
        p.orderedSlots,
        p.durationMinutes,
        gridStep,
        selectedStartMin,
      )
    }

    return (
      <div
        ref={ref}
        id="svc-booking"
        className={['svc-book-card', 'pf-playfinder-book', 'svc-book-card--rail', p.className]
          .filter(Boolean)
          .join(' ')}
      >
        <h3 className="svc-book-h3">{title}</h3>
        <p className="svc-rail-pricing muted small">
          {p.isFreeField ? (
            <strong>Falas (publik)</strong>
          ) : (
            <>
              ≈ <strong>€{p.estimatedTotal}</strong> · {p.durationMinutes} min
            </>
          )}
        </p>

        {p.isFreeField && (
          <div className="svc-free-banner">
            <strong>Fushë publike — falas</strong>
            <p className="muted small" style={{ margin: '0.35rem 0 0' }}>
              Pa pagesë online. Rezervimi vetëm ruan orarin që të mos përplasen dy përdorues.
            </p>
          </div>
        )}

        <p className="muted small svc-book-sub">
          {p.selectedDayHeading} — ditët me ngjyrë tregojnë nëse ka orë të lira; më poshtë zgjidh orën.
        </p>

        <div className="svc-rail-cal-head">
          <button type="button" className="sport-cal-nav-btn" onClick={() => p.shiftCalendarMonth(-1)}>
            ‹
          </button>
          <span className="svc-rail-month-title">{p.monthTitleLabel}</span>
          <button type="button" className="sport-cal-nav-btn" onClick={() => p.shiftCalendarMonth(1)}>
            ›
          </button>
        </div>

        <div className="svc-rail-cal-tools">
          <span className="muted small svc-rail-cal-hint">Kliko një ditë për oraret</span>
          <button type="button" className="svc-rail-today-chip" onClick={goToday}>
            Sot
          </button>
        </div>

        <div
          className={
            'svc-rail-month-mini' + (p.calLoading ? ' svc-rail-month-mini--loading' : '')
          }
          aria-label="Kalendari i muajit"
        >
          <div className="svc-rail-month-mini-wd">
            {WEEKDAYS_MON_FIRST_SQ.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
          <div className="svc-rail-month-mini-cells" role="grid">
            {monthCells.map((cell, idx) =>
              cell.kind === 'pad' ? (
                <div key={`pad-${idx}`} className="svc-rail-month-mini-pad" aria-hidden />
              ) : (
                <button
                  key={cell.iso}
                  type="button"
                  role="gridcell"
                  disabled={cell.iso < p.todayIso}
                  aria-current={cell.iso === p.date ? 'date' : undefined}
                  aria-label={`Dita ${cell.n}`}
                  onClick={() => pickCalendarDay(cell.iso)}
                  className={dayRailCellClass(cell.iso, p.date, p.todayIso, dayByIso.get(cell.iso)?.slots)}
                >
                  <span className="svc-rail-day-n">{cell.n}</span>
                  {cell.iso >= p.todayIso && cell.iso !== p.date ? (
                    <span className="svc-rail-day-dot" aria-hidden />
                  ) : null}
                </button>
              ),
            )}
          </div>
        </div>

        <label className="svc-book-native-date svc-book-native-date--compact svc-rail-date-fallback">
          <span className="pf-pf-slot-heading">Ose zgjidh datën (kalendar sistemi)</span>
          <input
            type="date"
            min={p.todayIso}
            value={p.date}
            onChange={(e) => {
              const v = e.target.value
              if (!v || v < p.todayIso) return
              const d = new Date(`${v}T12:00:00`)
              if (Number.isNaN(d.getTime())) return
              p.setDate(v)
              p.setCalendarView({ y: d.getFullYear(), m: d.getMonth() + 1 })
            }}
          />
        </label>

        <div className="svc-book-form svc-book-form--inline-top">
          {p.offers.length > 0 ? (
            <label>
              Paketa
              <select
                value={p.selectedOfferId}
                onChange={(e) => p.setSelectedOfferId(Number(e.target.value))}
              >
                {p.offers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} · {o.durationMinutes} min · €{String(o.priceEur)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Kohëzgjatja
              <select
                value={p.durationMinutes}
                onChange={(e) => p.setDurationMinutes(Number(e.target.value))}
              >
                {p.durationOptions.map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="svc-slots-block">
          <div className="svc-slots-head">
            <div className="svc-slots-head-text">
              <p className="svc-slot-col-title">Oraret</p>
              {!p.calLoading && p.dayCalendar && displaySlots.length > 0 ? (
                <p className="muted small svc-slots-meta">
                  <strong>{freeSlotsCount}</strong> të lira nga {displaySlots.length}
                </p>
              ) : null}
            </div>
            {firstFreeSlot && !p.calLoading && p.dayCalendar ? (
              <button
                type="button"
                className="svc-slot-jump-btn"
                onClick={() => p.pickSlot(firstFreeSlot)}
              >
                Hapi i parë i lirë · {p.slotKey(firstFreeSlot)}
              </button>
            ) : null}
          </div>

          <div className="svc-slots-scroll" role="listbox" aria-label="Oraret e ditës së zgjedhur">
            {p.calLoading || !p.dayCalendar ? (
              <div className="svc-slot-skel-grid" aria-busy="true" aria-label="Duke ngarkuar oraret">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="svc-slot-skel" />
                ))}
              </div>
            ) : displaySlots.length === 0 ? (
              <p className="muted svc-slots-empty">
                Nuk ka orare të hapura për këtë ditë — zgjidh një datë tjetër ose muajin tjetër.
              </p>
            ) : (
              slotsByPeriod.map((bucket) => (
                <div key={bucket.id} className="svc-slot-chunk">
                  <p className="svc-slot-chunk-label">{SLOT_PERIOD_LABEL[bucket.id]}</p>
                  <div className="svc-slot-chunk-grid">
                    {bucket.slots.map((s, idx) => {
                      const label = p.slotKey(s)
                      const state = slotPickState(s)
                      const disabled = state !== 'free'
                      const picked = state === 'picked'
                      const covered = state === 'covered'
                      const busyClass =
                        state === 'blocked'
                          ? s.availability === 'IN_PROGRESS'
                            ? ' pf-pf-slot-pill--progress'
                            : ' pf-pf-slot-pill--busy'
                          : covered
                            ? ' pf-pf-slot-pill--covered'
                            : ''
                      const titleBusy = isSlotBlocked(s)
                        ? s.availability === 'IN_PROGRESS'
                          ? 'Në lojë (jo i disponueshëm)'
                          : 'E zënë'
                        : covered
                          ? `Pjesë e rezervimit (${p.durationMinutes} min nga ${p.selectedSlotLabel ?? label})`
                          : 'Nuk ka kohë të mjaftueshme të lirë për kohëzgjatjen e zgjedhur'
                      return (
                        <button
                          key={`slot-${p.slotSortMinutes(s)}-${bucket.id}-${idx}`}
                          type="button"
                          role="option"
                          aria-selected={picked || covered}
                          disabled={disabled}
                          title={disabled ? titleBusy : `Zgjidh orën ${label}`}
                          onClick={() => p.pickSlot(s)}
                          className={
                            'pf-pf-slot-cell svc-slot-cell' +
                            (state === 'free' ? ' pf-pf-slot-pill--free' : busyClass) +
                            (picked ? ' pf-pf-slot-pill--picked' : '')
                          }
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {p.durationMinutes > 0 && (
          <p className="muted small svc-slot-hint" style={{ marginTop: '0.35rem' }}>
            {p.durationMinutes > gridStep ? (
              <>
                Orët e fillimit: çdo <strong>{p.durationMinutes}</strong> min (p.sh. 09:00, 10:00, 11:00).
              </>
            ) : (
              <>
                Hapi i rrjetës: çdo <strong>{gridStep}</strong> min.
              </>
            )}
          </p>
        )}
        <div className="svc-cal-legend svc-cal-legend--inline" aria-label="Legjenda e orareve">
          <span>
            <i className="svc-leg-dot svc-leg-dot--free" aria-hidden /> Lirë
          </span>
          <span>
            <i className="svc-leg-dot svc-leg-dot--busy" aria-hidden /> Zënë
          </span>
          <span>
            <i className="svc-leg-dot svc-leg-dot--progress" aria-hidden /> Në lojë
          </span>
        </div>

        {!p.isAuthenticated && p.selectedSlotLabel == null && (
          <p className="muted small svc-pick-slot-hint" style={{ marginTop: '0.45rem' }}>
            Zgjidh një orë më sipër; pastaj një hap i shkurtër me emrin dhe email-in për konfirmim.
          </p>
        )}

        <div className="svc-book-form">
          {p.isAuthenticated && p.field?.category === 'SPORTS' && (
            <div className="svc-openjoin card" style={{ padding: '0.65rem', marginBottom: '0.45rem' }}>
              <label className="svc-inline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={p.openJoinEnabled}
                  onChange={(e) => p.setOpenJoinEnabled(e.target.checked)}
                />
                <span>
                  <strong>Hap lojtarë</strong> —{' '}
                  <Link to="/matches">Ndeshje të hapura</Link>.
                </span>
              </label>
              {p.openJoinEnabled && (
                <label style={{ marginTop: '0.45rem', display: 'block' }}>
                  Vende bashkimi (1–64)
                  <input
                    type="number"
                    min={1}
                    max={64}
                    value={p.openJoinSlots}
                    onChange={(e) => p.setOpenJoinSlots(Number(e.target.value))}
                  />
                </label>
              )}
            </div>
          )}

          {!p.isAuthenticated && p.selectedSlotLabel != null && (
            <div className="svc-guest">
              <p className="muted small svc-guest-lead">
                Hapi i fundit — vetëm për njoftim dhe link pagese.{' '}
                <Link to="/login">Hyr</Link> nëse ke llogari (jo i detyrueshëm).
              </p>
              <div className="svc-guest-grid">
                <label>
                  Emri në rezervim
                  <input
                    name="guest-name"
                    autoComplete="name"
                    enterKeyHint="next"
                    placeholder="p.sh. Arbeni"
                    value={p.guestName}
                    onChange={(e) => p.setGuestName(e.target.value)}
                  />
                </label>
                <label>
                  Email (shkruaj një herë)
                  <input
                    type="email"
                    name="guest-email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="done"
                    placeholder="ju@email.com"
                    value={p.guestEmail}
                    onChange={(e) => p.setGuestEmail(e.target.value)}
                  />
                </label>
              </div>
              <p className="muted small svc-guest-hint">
                Ruajmë email-in vetëm në këtë shfletues pas pagesës së parë, që ta kesh gati herën tjetër.
              </p>
            </div>
          )}

          <button
            type="button"
            className="svc-continue"
            onClick={(e) => p.book(e as unknown as FormEvent)}
            disabled={
              p.checkoutLoading ||
              p.selectedSlotLabel == null ||
              (p.offers.length > 0 && !p.selectedOfferId) ||
              (!p.isAuthenticated && (!p.guestName.trim() || !p.guestEmail.trim()))
            }
          >
            {p.checkoutLoading
              ? 'Duke përpunuar…'
              : p.isFreeField
                ? 'Rezervo falas'
                : 'Rezervo & pague'}
          </button>
          <p className="muted small svc-note">
            Zgjedhja: {p.date} · {p.formatTime(p.time)} · {p.durationMinutes} min
            {p.isFreeField ? ' · falas' : ` · ~${p.estimatedTotal} €`}
          </p>
        </div>
      </div>
    )
  },
)
