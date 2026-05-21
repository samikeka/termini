import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { createField, fetchFieldMonthCalendar, fetchFields } from '../api/terminiApi'
import { fieldMatchesSportFilter } from '../sportFilter'
import { useSession } from '../context/SessionContext'
import type { CountryRegion, FieldDto, ServiceCategory } from '../types'
import {
  CATEGORY_META,
  SERVICE_CATEGORIES,
  categoryLabelSq,
  discoverySubtitle,
  discoveryTitle,
  fieldsSearchUrl,
  isSportsCategory,
  parseServiceCategory,
  priceUnitLabel,
} from '../serviceCategories'
import { BookingWizardStepper } from '../components/BookingWizardStepper'
import {
  countFreeSlots,
  firstFreeSlotLabel,
  prepareDaySlots,
} from '../calendarSlots'
import { isPublicOutdoorField, publicOutdoorAreaLabel } from '../fieldUtils'
import { publicOutdoorCoverUrl } from '../publicOutdoorMedia'

function countryLabel(c?: CountryRegion | null) {
  if (c === 'ALBANIA') return 'Shqipëri'
  if (c === 'NORTH_MACEDONIA') return 'Maqedoni'
  return 'Kosovë'
}

function thumbClass(id: number) {
  const v = id % 5
  return `thumb thumb--${v}`
}

const SPORT_CHIPS: { sport: string | null; label: string }[] = [
  { sport: null, label: 'All' },
  { sport: 'futbol', label: 'Football' },
  { sport: 'basket', label: 'Basketball' },
  { sport: 'tenis', label: 'Tennis' },
  { sport: 'volej', label: 'Volleyball' },
  { sport: 'hend', label: 'Handball' },
  { sport: 'padel', label: 'Padel' },
]

const MAX_AVAIL_FIELDS_DEFAULT = 20
const MAX_AVAIL_FIELDS_PUBLIC = 40

function pad2fields(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

function todayIsoFields() {
  const d = new Date()
  return `${d.getFullYear()}-${pad2fields(d.getMonth() + 1)}-${pad2fields(d.getDate())}`
}

function formatFieldsDateLabel(iso: string) {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('sq-AL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return iso
  }
}

const TIME_PRESETS = [
  { value: '', label: 'Any time' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
]

export type FieldsPageVariant = 'default' | 'public-outdoor'

type FieldsPageProps = {
  variant?: FieldsPageVariant
}

export function FieldsPage({ variant = 'default' }: FieldsPageProps) {
  const isPublicOutdoorPage = variant === 'public-outdoor'
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSession()
  const [fields, setFields] = useState<FieldDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [country, setCountry] = useState<CountryRegion | ''>('')
  const [cityFilter, setCityFilter] = useState('')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [cityNew, setCityNew] = useState('')
  const [countryNew, setCountryNew] = useState<CountryRegion>('KOSOVO')
  const [categoryNew, setCategoryNew] = useState<ServiceCategory>('SPORTS')
  const [hourly, setHourly] = useState('')
  const [busy, setBusy] = useState(false)
  const [heroLocation, setHeroLocation] = useState('')
  const [heroSport, setHeroSport] = useState<string>('')
  const [heroDate, setHeroDate] = useState('')
  const [heroTime, setHeroTime] = useState('')

  const [availByField, setAvailByField] = useState<
    Record<
      number,
      | { status: 'loading' }
      | { status: 'ok'; free: number; total: number; firstFree?: string }
      | { status: 'err' }
    >
  >({})

  const activeCategory = isPublicOutdoorPage
    ? ''
    : parseServiceCategory(searchParams.get('category'))
  const sportParam = searchParams.get('sport')?.toLowerCase() ?? null
  const sportFilterActive =
    !isPublicOutdoorPage &&
    (isSportsCategory(activeCategory) || (!activeCategory && !!sportParam))
  const effectiveSport = sportFilterActive ? sportParam : null
  const qFromUrl = searchParams.get('q')?.trim().toLowerCase() ?? ''
  const publikeOnly = isPublicOutdoorPage || searchParams.get('publike') === '1'
  const [heroCategory, setHeroCategory] = useState<ServiceCategory | ''>('')

  useEffect(() => {
    setHeroSport(sportParam ?? '')
  }, [sportParam])

  useEffect(() => {
    if (!isPublicOutdoorPage) setHeroCategory(activeCategory)
  }, [activeCategory, isPublicOutdoorPage])

  function sportListHref(sport: string | null) {
    return fieldsSearchUrl({
      category: activeCategory || 'SPORTS',
      country: country || undefined,
      city: cityFilter.trim() || undefined,
      sport: sport ?? undefined,
      q: searchParams.get('q')?.trim() || undefined,
    })
  }

  function categoryListHref(cat: ServiceCategory | '') {
    return fieldsSearchUrl({
      category: cat || undefined,
      country: country || undefined,
      city: cityFilter.trim() || undefined,
      q: searchParams.get('q')?.trim() || undefined,
    })
  }

  const maxAvailFields = isPublicOutdoorPage
    ? MAX_AVAIL_FIELDS_PUBLIC
    : MAX_AVAIL_FIELDS_DEFAULT

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchFields({
      country: isPublicOutdoorPage ? 'KOSOVO' : country || undefined,
      category: isPublicOutdoorPage ? 'SPORTS' : activeCategory || undefined,
      city: cityFilter || undefined,
    })
      .then(setFields)
      .catch((e) => {
        setFields([])
        if (e instanceof ApiError) {
          setError(e.message)
        } else {
          setError('Gabim në leximin e fushave')
        }
      })
      .finally(() => setLoading(false))
  }, [country, cityFilter, isPublicOutdoorPage, activeCategory])

  useEffect(() => {
    const c = searchParams.get('city')
    if (c) {
      const decoded = decodeURIComponent(c)
      setCityFilter(decoded)
      setHeroLocation(decoded)
    }
    const co = searchParams.get('country')?.toUpperCase()
    if (co === 'KOSOVO' || co === 'ALBANIA' || co === 'NORTH_MACEDONIA') {
      setCountry(co as CountryRegion)
    }
    const d = searchParams.get('date')
    if (d) setHeroDate(d)
    const ti = searchParams.get('time')
    if (ti) setHeroTime(ti)
  }, [searchParams])

  useEffect(() => {
    load()
  }, [load])

  function onDiscoverySearch(e: FormEvent) {
    e.preventDefault()
    const cat = isPublicOutdoorPage ? '' : heroCategory || activeCategory
    navigate(
      fieldsSearchUrl({
        category: cat || undefined,
        country: country || undefined,
        city: heroLocation.trim() || undefined,
        sport:
          !isPublicOutdoorPage && (isSportsCategory(cat) || !cat) && heroSport
            ? heroSport
            : undefined,
        date: !isPublicOutdoorPage && heroDate ? heroDate : undefined,
        time: !isPublicOutdoorPage && heroTime ? heroTime : undefined,
      }),
    )
  }

  useEffect(() => {
    if (isPublicOutdoorPage) setCountry('KOSOVO')
  }, [isPublicOutdoorPage])

  useEffect(() => {
    if (isPublicOutdoorPage || searchParams.get('publike') !== '1') return
    const p = new URLSearchParams(searchParams)
    p.delete('publike')
    const qs = p.toString()
    navigate(`/fusha-publike${qs ? `?${qs}` : ''}`, { replace: true })
  }, [isPublicOutdoorPage, searchParams, navigate])

  function cardRating(id: number) {
    const base = 4.6 + (id % 5) * 0.06
    return base.toFixed(1)
  }

  const filtered = useMemo(() => {
    let list = fields.filter((f) => fieldMatchesSportFilter(f, effectiveSport))
    if (publikeOnly) {
      list = list.filter(isPublicOutdoorField)
    } else if (!isPublicOutdoorPage) {
      // Fushat publike outdoor vetëm në /fusha-publike — këtu mbeten me pagesë / rezervim
      list = list.filter((f) => !isPublicOutdoorField(f))
      list = [...list].sort((a, b) => {
        const pa = Number(a.hourlyPriceEur ?? 0)
        const pb = Number(b.hourlyPriceEur ?? 0)
        return pb - pa
      })
    }
    if (!qFromUrl) return list
    return list.filter((f) => {
      const nameL = (f.name ?? '').toLowerCase()
      const loc = (f.location ?? '').toLowerCase()
      const city = (f.city ?? '').toLowerCase()
      return nameL.includes(qFromUrl) || loc.includes(qFromUrl) || city.includes(qFromUrl)
    })
  }, [fields, qFromUrl, effectiveSport, publikeOnly, isPublicOutdoorPage])

  const effectiveDate = useMemo(() => {
    const raw = (searchParams.get('date') ?? heroDate).trim()
    const t = todayIsoFields()
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return t
    return raw < t ? t : raw
  }, [searchParams, heroDate])

  const availFetchKey = useMemo(
    () =>
      `${effectiveDate}:${filtered
        .slice(0, maxAvailFields)
        .map((f) => f.id)
        .join(',')}`,
    [effectiveDate, filtered, maxAvailFields],
  )

  useEffect(() => {
    if (isPublicOutdoorPage) {
      setAvailByField({})
      return
    }
    if (loading) return
    const slice = filtered.slice(0, maxAvailFields)
    if (slice.length === 0) {
      setAvailByField({})
      return
    }
    const eff = effectiveDate
    const y = Number(eff.slice(0, 4))
    const m = Number(eff.slice(5, 7))
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return

    const ids = slice.map((f) => f.id)
    setAvailByField((prev) => {
      const next = { ...prev }
      for (const id of ids) next[id] = { status: 'loading' }
      return next
    })

    let cancelled = false
    const fieldById = new Map(slice.map((f) => [f.id, f]))
    Promise.allSettled(ids.map((id) => fetchFieldMonthCalendar(id, y, m))).then((results) => {
      if (cancelled) return
      setAvailByField((prev) => {
        const next = { ...prev }
        results.forEach((res, i) => {
          const id = ids[i]!
          if (res.status === 'fulfilled') {
            const day = res.value.days?.find((d) => d.date === eff)
            const field = fieldById.get(id)
            const slots = prepareDaySlots(day?.slots, field, [])
            const free = countFreeSlots(slots)
            const firstFree = firstFreeSlotLabel(slots)
            next[id] = { status: 'ok', free, total: slots.length, firstFree }
          } else {
            next[id] = { status: 'err' }
          }
        })
        return next
      })
    })
    return () => {
      cancelled = true
    }
  }, [loading, effectiveDate, availFetchKey, isPublicOutdoorPage])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!isAuthenticated || !user) {
      setError('Duhet të jesh i kyçur për të shtuar fushë.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const h = hourly.trim()
      await createField({
        name,
        location,
        city: cityNew,
        country: countryNew,
        category: categoryNew,
        hourlyPriceEur:
          h === '' || Number(hourly) <= 0 ? undefined : Number(hourly),
        fieldOwner: { id: user.id },
      })
      setName('')
      setLocation('')
      setCityNew('')
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Nuk u krijua fusha. A je i kyçur?',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={
        'page pf-fields-page pf-fields-page--discovery' +
        (isPublicOutdoorPage ? ' pf-fields-page--public-outdoor' : '')
      }
    >
      {!isPublicOutdoorPage && <BookingWizardStepper current={1} />}
      <div className="pf-discovery-hero">
        {isPublicOutdoorPage ? (
          <>
            <p className="pf-public-outdoor-kicker">Kosovë · falas · pa rezervim</p>
            <h1 className="pf-discovery-title">Fusha publike sportive</h1>
            <p className="pf-discovery-sub">
              Zbulo ku gjenden fushat outdoor publike në Kosovë — me foto dhe adresë. Nuk ka
              pronar në platformë dhe nuk rezervohen këtu; shko në vend kur të duash.
            </p>
            <p className="pf-public-outdoor-aside muted small">
              Kërkon fushë me pagesë?{' '}
              <Link to="/fields" className="pf-link-em">
                Shiko fushat me rezervim të paguar
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="pf-discovery-title">{discoveryTitle(activeCategory || undefined)}</h1>
            <p className="pf-discovery-sub">{discoverySubtitle(activeCategory || undefined)}</p>
          </>
        )}

        <form
          className={
            'pf-discovery-search' +
            (isPublicOutdoorPage ? ' pf-discovery-search--public-outdoor' : '')
          }
          onSubmit={onDiscoverySearch}
        >
          <label className="pf-discovery-field">
            <span className="pf-discovery-label">
              {isPublicOutdoorPage ? 'Qyteti ose zona' : 'Location'}
            </span>
            <input
              value={heroLocation}
              onChange={(e) => setHeroLocation(e.target.value)}
              placeholder={isPublicOutdoorPage ? 'p.sh. Prishtinë, Prizren…' : 'e.g. Prishtina, Kosovo'}
              autoComplete="off"
            />
          </label>
          {!isPublicOutdoorPage && (
            <>
              <label className="pf-discovery-field">
                <span className="pf-discovery-label">Kategoria</span>
                <select
                  value={heroCategory}
                  onChange={(e) =>
                    setHeroCategory(parseServiceCategory(e.target.value) || '')
                  }
                  aria-label="Service category"
                >
                  <option value="">Të gjitha shërbimet</option>
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_META[c].labelSq}
                    </option>
                  ))}
                </select>
              </label>
              {(isSportsCategory(heroCategory) || (!heroCategory && !activeCategory)) && (
              <label className="pf-discovery-field">
                <span className="pf-discovery-label">Sport</span>
                <select
                  value={heroSport}
                  onChange={(e) => setHeroSport(e.target.value)}
                  aria-label="Sport"
                >
                  <option value="">Të gjitha</option>
                  {SPORT_CHIPS.filter((x) => x.sport != null).map(({ sport, label }) => (
                    <option key={sport!} value={sport!}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              )}
              <label className="pf-discovery-field">
                <span className="pf-discovery-label">Date</span>
                <input
                  type="date"
                  min={todayIsoFields()}
                  value={heroDate}
                  onChange={(e) => setHeroDate(e.target.value)}
                />
              </label>
              <label className="pf-discovery-field">
                <span className="pf-discovery-label">Time</span>
                <select
                  value={heroTime}
                  onChange={(e) => setHeroTime(e.target.value)}
                  aria-label="Time of day"
                >
                  {TIME_PRESETS.map((t) => (
                    <option key={t.value || 'any'} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <button type="submit" className="pf-btn pf-btn--primary pf-discovery-submit">
            {isPublicOutdoorPage ? 'Kërko' : 'Search'}
          </button>
        </form>

        {!isPublicOutdoorPage && (
        <div className="pf-chip-row pf-chip-row--category" role="tablist" aria-label="Kategoria">
          <Link
            to={categoryListHref('')}
            className={'pf-chip' + (!activeCategory ? ' pf-chip--active' : '')}
            role="tab"
          >
            Të gjitha
          </Link>
          {SERVICE_CATEGORIES.map((c) => (
            <Link
              key={c}
              to={categoryListHref(c)}
              className={
                'pf-chip pf-chip--cat-' +
                CATEGORY_META[c].accent +
                (activeCategory === c ? ' pf-chip--active' : '')
              }
              role="tab"
            >
              {CATEGORY_META[c].labelSq}
            </Link>
          ))}
        </div>
        )}

        {!isPublicOutdoorPage && (
        <div className="pf-discovery-toolbar">
          <div className="pf-chip-row" role="tablist" aria-label="Region">
            <button
              type="button"
              className={'pf-chip' + (country === '' ? ' pf-chip--active' : '')}
              onClick={() => setCountry('')}
            >
              All regions
            </button>
            <button
              type="button"
              className={'pf-chip' + (country === 'KOSOVO' ? ' pf-chip--active' : '')}
              onClick={() => setCountry('KOSOVO')}
            >
              Kosovë
            </button>
            <Link
              to="/fusha-publike"
              className={'pf-chip' + (searchParams.get('publike') === '1' ? ' pf-chip--active' : '')}
              role="tab"
            >
              Fusha publike (KS)
            </Link>
            <button
              type="button"
              className={'pf-chip' + (country === 'ALBANIA' ? ' pf-chip--active' : '')}
              onClick={() => setCountry('ALBANIA')}
            >
              Albania
            </button>
            <button
              type="button"
              className={
                'pf-chip' + (country === 'NORTH_MACEDONIA' ? ' pf-chip--active' : '')
              }
              onClick={() => setCountry('NORTH_MACEDONIA')}
            >
              N. Macedonia
            </button>
          </div>
          <button type="button" className="pf-btn pf-btn--outline pf-btn--sm pf-filters-btn">
            Filters
          </button>
        </div>
        )}

        {!isPublicOutdoorPage && sportFilterActive && (
        <div className="pf-chip-row pf-chip-row--sport" role="tablist" aria-label="Sport">
          {SPORT_CHIPS.map(({ sport, label }) => {
            const active = (sport == null && !sportParam) || sportParam === sport
            const href = sportListHref(sport)
            return (
              <Link
                key={label}
                to={href}
                className={'pf-chip' + (active ? ' pf-chip--active' : '')}
                role="tab"
                aria-selected={active}
              >
                {label}
              </Link>
            )
          })}
        </div>
        )}
      </div>

      {isAuthenticated && user?.role === 'FIELD_OWNER' && !isPublicOutdoorPage && (
        <details className="owner-inline pf-panel">
          <summary>Pronar: shto fushë sportive</summary>
          <form className="form-grid form-grid--3" onSubmit={onCreate}>
            <label>
              Emri
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Lokacioni
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
            <label>
              Qyteti
              <input
                required
                value={cityNew}
                onChange={(e) => setCityNew(e.target.value)}
              />
            </label>
            <label>
              Vendi
              <select
                value={countryNew}
                onChange={(e) =>
                  setCountryNew(e.target.value as CountryRegion)
                }
              >
                <option value="KOSOVO">Kosovë</option>
                <option value="ALBANIA">Shqipëri</option>
                <option value="NORTH_MACEDONIA">Maqedoni</option>
              </select>
            </label>
            <label>
              Kategoria
              <select
                value={categoryNew}
                onChange={(e) =>
                  setCategoryNew(e.target.value as ServiceCategory)
                }
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c].labelSq}
                  </option>
                ))}
              </select>
            </label>
            <label>
              € / orë (bosh = falas)
              <input
                type="number"
                min={0}
                step={1}
                value={hourly}
                onChange={(e) => setHourly(e.target.value)}
                placeholder="p.sh. 35 ose bosh"
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={busy}>
                Ruaj fushën
              </button>
            </div>
          </form>
        </details>
      )}

      {error && <p className="alert alert-error">{error}</p>}

      {qFromUrl && !loading && fields.length > 0 && (
        <p className="muted small">
          Filtrim teksti: “{searchParams.get('q')?.trim()}”
        </p>
      )}
      {sportParam && !loading && fields.length > 0 && (
        <p className="muted small">Sporti: {sportParam}</p>
      )}

      {loading ? (
        <p className="muted">Duke ngarkuar fushat…</p>
      ) : filtered.length === 0 ? (
        <p className="muted">
          {isPublicOutdoorPage
            ? qFromUrl || sportParam
              ? 'Asnjë fushë publike nuk përputhet me këto filtra.'
              : 'Nuk u gjetën fusha publike outdoor. Rinisni backend-in me seed Kosovë.'
            : fields.length > 0 && (qFromUrl || sportParam)
              ? 'Asnjë fushë me rezervim nuk përputhet me këto filtra.'
              : 'Nuk u gjetën fusha me rezervim. Për fusha publike falas shiko /fusha-publike.'}
        </p>
      ) : (
        <>
          {!isPublicOutdoorPage && filtered.length > maxAvailFields && (
            <p className="muted small pf-fields-avail-cap">
              Orët e lira krahasohen automatikisht për <strong>{maxAvailFields}</strong> fusha të
              para; për të tjerat hap kartën.
            </p>
          )}
          <ul className="pf-fields-venue-grid">
          {filtered.map((f) => {
            const outdoor = isPublicOutdoorField(f)
            const paid = f.hourlyPriceEur != null && Number(f.hourlyPriceEur) > 0
            const extraQs = new URLSearchParams()
            extraQs.set('date', effectiveDate)
            const tu = (searchParams.get('time') ?? heroTime).trim()
            if (tu) extraQs.set('time', tu)
            const detailPath = isPublicOutdoorPage
              ? `/fusha-publike/${f.id}`
              : `/fields/${f.id}`
            const qs = isPublicOutdoorPage ? '' : `?${extraQs}`
            const area = publicOutdoorAreaLabel(f)
            return (
              <li
                key={f.id}
                className={
                  'pf-venue-card pf-venue-card--grid' +
                  (isPublicOutdoorPage ? ' pf-venue-card--public-outdoor' : '')
                }
              >
                {isPublicOutdoorPage ? (
                  <div
                    className="pf-venue-thumb-photo"
                    style={{ backgroundImage: `url(${publicOutdoorCoverUrl(f)})` }}
                    aria-hidden
                  />
                ) : (
                  <div className={thumbClass(f.id)} aria-hidden />
                )}
                <div className="pf-venue-body">
                  <div className="pf-venue-top">
                    <div>
                      <div className="pf-venue-title">
                        {isPublicOutdoorPage && area ? area : f.name}
                      </div>
                      <div className="pf-venue-sub">
                        <span className="pf-venue-cat">{categoryLabelSq(f.category)}</span>
                        <span> · </span>
                        {f.city}, {countryLabel(f.country)}
                      </div>
                      {!isPublicOutdoorPage && (
                      <div className="pf-venue-rating">
                        <span className="pf-stars" aria-hidden>
                          ★
                        </span>
                        <span className="pf-rating-num">{cardRating(f.id)}</span>
                        <span className="muted small">(128)</span>
                      </div>
                      )}
                    </div>
                    {isPublicOutdoorPage ? (
                      <div className="pf-price-pill pf-price-pill--free">
                        Falas
                        <span> · publike</span>
                      </div>
                    ) : outdoor ? (
                      <div className="pf-price-pill pf-price-pill--free">
                        Falas
                        <span> · publike</span>
                      </div>
                    ) : paid ? (
                      <div className="pf-price-pill">
                        €{String(f.hourlyPriceEur)}
                        <span>{priceUnitLabel(f.category)}</span>
                      </div>
                    ) : (
                      <div className="pf-price-pill pf-price-pill--free">Falas</div>
                    )}
                  </div>
                  <div className="pf-venue-meta">
                    <span>
                      {isPublicOutdoorPage || outdoor
                        ? 'Outdoor · vetëm lokacion'
                        : categoryLabelSq(f.category)}
                    </span>
                    <span>·</span>
                    <span>
                      {isPublicOutdoorPage || outdoor
                        ? f.location
                        : 'Orët sipas datës së kërkimit'}
                    </span>
                  </div>
                  {!isPublicOutdoorPage && (
                  <div className="pf-venue-avail-line" aria-live="polite">
                    {(() => {
                      const idx = filtered.findIndex((x) => x.id === f.id)
                      if (idx >= maxAvailFields) {
                        return (
                          <span className="pf-venue-avail pf-venue-avail--muted">
                            Hap për të parë oraret e kësaj dite.
                          </span>
                        )
                      }
                      const a = availByField[f.id]
                      if (!a || a.status === 'loading') {
                        return (
                          <span className="pf-venue-avail pf-venue-avail--loading">
                            Orët: duke u kontrolluar…
                          </span>
                        )
                      }
                      if (a.status === 'err') {
                        return (
                          <span className="pf-venue-avail pf-venue-avail--warn">
                            Orët: nuk u lexuan nga serveri
                          </span>
                        )
                      }
                      const dLbl = formatFieldsDateLabel(effectiveDate)
                      if (a.total === 0) {
                        return (
                          <span className="pf-venue-avail pf-venue-avail--none">
                            Nuk ka orare të hapura për {dLbl}
                          </span>
                        )
                      }
                      if (a.free === 0) {
                        return (
                          <span className="pf-venue-avail pf-venue-avail--none">
                            Të gjitha të zëna më {dLbl} ({a.total} intervale)
                          </span>
                        )
                      }
                      return (
                        <span className="pf-venue-avail pf-venue-avail--free">
                          <strong>{a.free}</strong> orë të lira më {dLbl}
                          {a.firstFree ? (
                            <>
                              {' '}
                              · nga <strong>{a.firstFree}</strong>
                            </>
                          ) : null}
                        </span>
                      )
                    })()}
                  </div>
                  )}
                  <div className="pf-venue-actions">
                    <Link className="pf-btn pf-btn--primary pf-btn--block" to={`${detailPath}${qs}`}>
                      {isPublicOutdoorPage
                        ? 'Shiko lokacionin & foto'
                        : outdoor
                          ? 'Shiko lokacionin'
                          : paid
                            ? 'Book now'
                            : 'View & book'}
                    </Link>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        </>
      )}
    </div>
  )
}
