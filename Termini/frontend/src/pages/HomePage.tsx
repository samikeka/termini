import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import heroBg from '../assets/hero.png'
import { ApiError } from '../api/client'
import { fetchFields } from '../api/terminiApi'
import { isPublicOutdoorField } from '../fieldUtils'
import {
  CATEGORY_META,
  SERVICE_CATEGORIES,
  categoryLabelSq,
  fieldsSearchUrl,
  isSportsCategory,
  parseServiceCategory,
  pickFeaturedByCategory,
} from '../serviceCategories'
import type { CountryRegion, FieldDto, ServiceCategory } from '../types'

const HERO_SPORTS: { value: string; label: string }[] = [
  { value: '', label: 'Të gjitha' },
  { value: 'futbol', label: 'Futboll' },
  { value: 'basket', label: 'Basketboll' },
  { value: 'tenis', label: 'Tenis' },
  { value: 'volej', label: 'Volejboll' },
  { value: 'hend', label: 'Hendboll' },
  { value: 'padel', label: 'Padel' },
]

const TIME_PRESETS = [
  { value: '', label: 'Çdo kohë' },
  { value: 'morning', label: 'Mëngjes' },
  { value: 'afternoon', label: 'Pasdite' },
  { value: 'evening', label: 'Mbrëmje' },
]

function countryLabelSq(c?: CountryRegion | null) {
  if (c === 'ALBANIA') return 'Shqipëri'
  if (c === 'NORTH_MACEDONIA') return 'Maqedoni e Veriut'
  return 'Kosovë'
}

function thumbClass(id: number) {
  return `thumb thumb--${id % 5}`
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

function todayIsoLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function HomePage() {
  const navigate = useNavigate()
  const [popular, setPopular] = useState<FieldDto[]>([])
  const [popularErr, setPopularErr] = useState<string | null>(null)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [heroCity, setHeroCity] = useState('Prishtinë')
  const [heroCategory, setHeroCategory] = useState<ServiceCategory | ''>('')
  const [heroSport, setHeroSport] = useState('')
  const [heroDate, setHeroDate] = useState('')
  const [heroTime, setHeroTime] = useState('')

  useEffect(() => {
    setPopularErr(null)
    setFeaturedLoading(true)
    fetchFields()
      .then((rows) => {
        const bookable = (Array.isArray(rows) ? rows : []).filter(
          (f) => !isPublicOutdoorField(f),
        )
        setPopular(pickFeaturedByCategory(bookable, 9))
      })
      .catch((e) => setPopularErr(e instanceof ApiError ? e.message : 'Gabim'))
      .finally(() => setFeaturedLoading(false))
  }, [])

  const cities = useMemo(
    () => ['Prishtinë', 'Tiranë', 'Shkup', 'Prizren', 'Durrës'],
    [],
  )

  function onHeroSearch(e: FormEvent) {
    e.preventDefault()
    navigate(
      fieldsSearchUrl({
        category: heroCategory || undefined,
        city: heroCity.trim() || undefined,
        sport:
          (isSportsCategory(heroCategory) || !heroCategory) && heroSport
            ? heroSport
            : undefined,
        date: heroDate || undefined,
        time: heroTime || undefined,
      }),
    )
  }

  const today = todayIsoLocal()
  const showSportInHero = isSportsCategory(heroCategory) || !heroCategory

  return (
    <div className="pf-home tp-home-pro">
      <section className="tp-hero-pro" aria-label="Book a service">
        <div
          className="tp-hero-pro-media"
          style={{ backgroundImage: `url(${heroBg})` }}
          role="presentation"
        />
        <div className="tp-hero-pro-scrim" />
        <div className="tp-hero-pro-inner">
          <p className="tp-hero-pro-kicker">TERMINI PRO · Rezervime online</p>
          <h1 className="tp-hero-pro-title">Rezervo orën. Shërbim çdo ditë.</h1>
          <p className="tp-hero-pro-sub">
            Sport, bukuri, shëndet, auto, edukim dhe shërbime profesionale — një platformë për
            Kosovën, Shqipërinë dhe Maqedoninë.
          </p>

          <form className="tp-hero-pro-search" onSubmit={onHeroSearch}>
            <div className="tp-hero-pro-field tp-hero-pro-field--cat">
              <label htmlFor="tp-home-cat">Kategoria</label>
              <select
                id="tp-home-cat"
                value={heroCategory}
                onChange={(ev) =>
                  setHeroCategory(parseServiceCategory(ev.target.value) || '')
                }
              >
                <option value="">Të gjitha shërbimet</option>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c].labelSq}
                  </option>
                ))}
              </select>
            </div>
            <div className="tp-hero-pro-field tp-hero-pro-field--loc">
              <label htmlFor="tp-home-loc">Qyteti</label>
              <select
                id="tp-home-loc"
                value={heroCity}
                onChange={(ev) => setHeroCity(ev.target.value)}
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {showSportInHero && (
              <div className="tp-hero-pro-field tp-hero-pro-field--sport">
                <label htmlFor="tp-home-sport">Sport</label>
                <select
                  id="tp-home-sport"
                  value={heroSport}
                  onChange={(ev) => setHeroSport(ev.target.value)}
                >
                  {HERO_SPORTS.map((s) => (
                    <option key={s.value || 'all'} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="tp-hero-pro-field tp-hero-pro-field--date">
              <label htmlFor="tp-home-date">Data</label>
              <input
                id="tp-home-date"
                type="date"
                min={today}
                value={heroDate}
                onChange={(ev) => setHeroDate(ev.target.value)}
              />
            </div>
            <div className="tp-hero-pro-field tp-hero-pro-field--time">
              <label htmlFor="tp-home-time">Koha</label>
              <select
                id="tp-home-time"
                value={heroTime}
                onChange={(ev) => setHeroTime(ev.target.value)}
              >
                {TIME_PRESETS.map((t) => (
                  <option key={t.value || 'any'} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="tp-hero-pro-submit">
              Kërko
            </button>
          </form>

          <div className="tp-hero-pro-values" aria-label="Why book with us">
            <div className="tp-hero-pro-value">
              <div className="tp-hero-pro-value-ico tp-hero-pro-value-ico--bolt" aria-hidden />
              <div>
                <strong>Rezervim i shpejtë</strong>
                <p>Orë të lira dhe çmime të qarta.</p>
              </div>
            </div>
            <div className="tp-hero-pro-value">
              <div className="tp-hero-pro-value-ico tp-hero-pro-value-ico--clock" aria-hidden />
              <div>
                <strong>Disponueshmëri live</strong>
                <p>Shiko kalendarin para se të konfirmosh.</p>
              </div>
            </div>
            <div className="tp-hero-pro-value">
              <div className="tp-hero-pro-value-ico tp-hero-pro-value-ico--users" aria-hidden />
              <div>
                <strong>Shumë kategori</strong>
                <p>Nga berberi te klinika — një aplikacion.</p>
              </div>
            </div>
          </div>

          <div className="tp-hero-pro-cta">
            <Link className="tp-hero-pro-cta--solid" to="/fields">
              Kërko shërbime
            </Link>
            <Link to="/matches">Lojëra të hapura</Link>
          </div>
        </div>
      </section>

      <section className="pf-section">
        <h2 className="pf-section-title">Kërko sipas kategorisë</h2>
        <p className="pf-section-lede">
          Zgjidh llojin e shërbimit — pastaj qytetin dhe orën që të përshtatet.
        </p>
        <div className="pf-category-grid">
          {SERVICE_CATEGORIES.map((c) => (
            <Link
              key={c}
              to={fieldsSearchUrl({ category: c })}
              className={'pf-category-card pf-category-card--' + CATEGORY_META[c].accent}
            >
              <span className="pf-category-card-name">{CATEGORY_META[c].labelSq}</span>
              <span className="pf-category-card-hint">{CATEGORY_META[c].hint}</span>
            </Link>
          ))}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          <Link to="/fields" className="pf-city-cta">
            Të gjitha lokacionet me rezervim →
          </Link>
        </p>
      </section>

      <section className="pf-section pf-public-outdoor-promo">
        <div className="pf-public-outdoor-promo-card">
          <div>
            <p className="pf-public-outdoor-kicker">Kosovë · falas</p>
            <h2 className="pf-section-title" style={{ marginBottom: '0.35rem' }}>
              Fusha publike sportive
            </h2>
            <p className="pf-section-lede" style={{ marginBottom: '1rem' }}>
              Outdoor në të gjithë vendin — vetëm lokacion dhe foto, pa rezervim.
            </p>
            <Link to="/fusha-publike" className="pf-btn pf-btn--primary">
              Shiko fushat publike
            </Link>
          </div>
        </div>
      </section>

      <section className="pf-section">
        <h2 className="pf-section-title">Të rekomanduara</h2>
        <p className="pf-section-lede">
          Një përzgjedhje nga sporti, bukuria, shëndeti dhe më shumë — hap për kalendar dhe rezervim.
        </p>
        {popularErr && <p className="alert alert-error">{popularErr}</p>}
        {featuredLoading && <p className="muted">Duke ngarkuar…</p>}
        {!featuredLoading && !popularErr && popular.length === 0 && (
          <p className="muted">Nuk ka lokacione ende. Shiko të gjitha shërbimet.</p>
        )}
        {!featuredLoading && popular.length > 0 && (
          <>
            <div className="pf-home-field-grid">
              {popular.map((s) => {
                const paid = s.hourlyPriceEur != null && Number(s.hourlyPriceEur) > 0
                return (
                  <Link key={s.id} to={`/fields/${s.id}`} className="pf-home-field-card">
                    <div className={thumbClass(s.id)} aria-hidden />
                    <div className="pf-home-field-body">
                      <span className="pf-home-field-sport">{categoryLabelSq(s.category)}</span>
                      <div className="pf-home-field-name">{s.name}</div>
                      <div className="pf-home-field-meta muted">
                        {s.city}
                        {s.country ? ` · ${countryLabelSq(s.country)}` : ''}
                      </div>
                      <div className="pf-home-field-foot">
                        {paid ? (
                          <span className="pf-home-field-price">
                            {String(s.hourlyPriceEur)} €<small>/orë</small>
                          </span>
                        ) : (
                          <span className="pf-home-field-price pf-home-field-price--free">
                            Falas
                          </span>
                        )}
                        <span className="pf-home-field-cta">Shiko oraret →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <p className="pf-home-field-more">
              <Link to="/fields" className="pf-btn pf-btn--outline pf-btn--sm">
                Të gjitha shërbimet
              </Link>
            </p>
          </>
        )}
      </section>

      <section className="pf-stats" aria-label="Highlights">
        <div className="pf-stats-inner">
          <div>
            <span className="pf-stat-num">7+</span>
            <span className="pf-stat-label">Kategori shërbimesh</span>
          </div>
          <div>
            <span className="pf-stat-num">3</span>
            <span className="pf-stat-label">Shtete / rajone</span>
          </div>
          <div>
            <span className="pf-stat-num">24/7</span>
            <span className="pf-stat-label">Rezervim online</span>
          </div>
        </div>
      </section>

      <div className="pf-cta-bottom">
        <h2>Listo lokacionin tënd</h2>
        <p>
          Berber, klinikë, garazh, kurs apo zyrë — ofro orare online me Termini Pro.
        </p>
        <div className="pf-cta-actions">
          <Link to="/owner/register" className="pf-btn pf-btn--primary">
            Bëhu host
          </Link>
          <Link to="/fields" className="pf-btn pf-btn--outline">
            Kërko shërbime
          </Link>
        </div>
      </div>
    </div>
  )
}
