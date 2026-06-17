import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { fetchFieldById } from '../../api/terminiApi'
import type { FieldDto } from '../../types'
import { pad2 } from './dateUtils'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

type SlotRow = { time: string; price: string; booked: boolean; enabled: boolean }

export function OwnerPricesSlotsPage() {
  const { fieldId: param } = useParams()
  const fieldId = Number(param)
  const [field, setField] = useState<FieldDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dayIx, setDayIx] = useState(0)
  const [globalPrice, setGlobalPrice] = useState('')
  const [slotDuration, setSlotDuration] = useState(60)
  const [buffer, setBuffer] = useState(15)
  const [rows, setRows] = useState<SlotRow[]>([])

  const basePrice = useMemo(() => {
    const h = field?.hourlyPriceEur
    if (h == null || Number(h) <= 0) return '0'
    return String(h)
  }, [field])

  const buildRows = useCallback(
    (hourly: string) => {
      const out: SlotRow[] = []
      for (let hour = 9; hour <= 20; hour++) {
        const t = `${pad2(hour)}:00`
        const t2 = `${pad2(hour + 1)}:00`
        out.push({
          time: `${t} – ${t2}`,
          price: hourly,
          booked: hour % 7 === 0,
          enabled: true,
        })
      }
      setRows(out)
    },
    [],
  )

  useEffect(() => {
    if (!Number.isFinite(fieldId)) return
    setLoading(true)
    setError(null)
    fetchFieldById(fieldId)
      .then((f) => {
        setField(f)
        const p =
          f.hourlyPriceEur != null && Number(f.hourlyPriceEur) > 0
            ? String(f.hourlyPriceEur)
            : '35'
        setGlobalPrice(p)
        buildRows(p)
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [fieldId, buildRows])

  function applyGlobalPrice() {
    const p = globalPrice.trim() || basePrice
    setRows((prev) => prev.map((r) => (r.booked ? r : { ...r, price: p })))
  }

  function toggleRow(i: number) {
    setRows((prev) =>
      prev.map((r, j) => (j === i && !r.booked ? { ...r, enabled: !r.enabled } : r)),
    )
  }

  if (!Number.isFinite(fieldId)) {
    return <p className="alert alert-error">Invalid field.</p>
  }

  return (
    <div className="owner-panel owner-panel--split">
      <div>
        <p>
          <Link to="/owner/fields" className="owner-back">
            ← My fields
          </Link>
        </p>
        <h1 className="owner-page-title">Prices &amp; slots</h1>
        <p className="muted">{field?.name ?? `Field #${fieldId}`}</p>

        {error && <p className="alert alert-error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <div className="owner-day-strip" role="tablist" aria-label="Weekday">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  aria-selected={dayIx === i}
                  className={'owner-day-pill' + (dayIx === i ? ' owner-day-pill--active' : '')}
                  onClick={() => setDayIx(i)}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="owner-table-wrap owner-table-wrap--tight">
              <table className="owner-table">
                <thead>
                  <tr>
                    <th>Time slot</th>
                    <th>Price / hour</th>
                    <th>Status</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.time}>
                      <td>{r.time}</td>
                      <td>€{r.price}</td>
                      <td>
                        {r.booked ? (
                          <span className="owner-badge owner-badge--busy">Booked</span>
                        ) : (
                          <span className="owner-badge owner-badge--ok">Available</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={'owner-toggle' + (r.enabled ? ' owner-toggle--on' : '')}
                          disabled={r.booked}
                          aria-pressed={r.enabled}
                          onClick={() => toggleRow(i)}
                        >
                          {r.enabled ? 'On' : 'Off'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted small">
              Demo: toggles are local only. Connect to backend rules when slot inventory is
              exposed.
            </p>
          </>
        )}
      </div>

      <aside className="owner-aside-cards">
        <div className="owner-aside-card">
          <h3>Quick settings</h3>
          <label className="owner-label">
            Default price (€/h)
            <input
              type="number"
              min={0}
              value={globalPrice}
              onChange={(e) => setGlobalPrice(e.target.value)}
            />
          </label>
          <button type="button" className="owner-btn-secondary owner-btn-wide" onClick={applyGlobalPrice}>
            Apply to available slots
          </button>
          <label className="owner-label">
            Slot duration (minutes)
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
            >
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </label>
          <label className="owner-label">
            Buffer (minutes)
            <select value={buffer} onChange={(e) => setBuffer(Number(e.target.value))}>
              <option value={0}>0</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </label>
          <button type="button" className="owner-btn-primary owner-btn-wide">
            Save changes
          </button>
        </div>
      </aside>
    </div>
  )
}
