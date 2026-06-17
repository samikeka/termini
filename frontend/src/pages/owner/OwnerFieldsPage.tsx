import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { fetchOwnerFields } from '../../api/terminiApi'
import type { CountryRegion, FieldDto } from '../../types'

function thumbClass(id: number) {
  return `thumb thumb--${id % 5}`
}

function countryLabel(c?: CountryRegion | null) {
  if (c === 'ALBANIA') return 'Albania'
  if (c === 'NORTH_MACEDONIA') return 'N. Macedonia'
  return 'Kosovo'
}

export function OwnerFieldsPage() {
  const [fields, setFields] = useState<FieldDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchOwnerFields()
      .then((r) => setFields(Array.isArray(r) ? r : []))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="owner-panel">
      <h1 className="owner-page-title">My fields</h1>
      <p className="owner-page-lede muted">
        Manage each venue, appointments, and slot pricing.
      </p>
      <p className="owner-toolbar">
        <button type="button" className="owner-btn-secondary" onClick={load}>
          Refresh
        </button>
        <Link to="/fields" className="owner-btn-primary">
          + Add field (public list)
        </Link>
      </p>

      {error && <p className="alert alert-error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : fields.length === 0 ? (
        <p className="muted">No fields yet. Add one from the public fields page (owner form).</p>
      ) : (
        <ul className="owner-field-list-pro">
          {fields.map((f) => {
            const paid = f.hourlyPriceEur != null && Number(f.hourlyPriceEur) > 0
            return (
              <li key={f.id} className="owner-field-card-pro">
                <div className={thumbClass(f.id)} aria-hidden />
                <div className="owner-field-card-pro-body">
                  <div className="owner-field-card-pro-top">
                    <div>
                      <span className="owner-badge owner-badge--ok">Active</span>
                      <h2>{f.name}</h2>
                      <p className="muted">
                        {f.city}, {countryLabel(f.country)} · {f.location}
                      </p>
                      <p className="owner-field-meta">
                        Sports venue · {paid ? `€${String(f.hourlyPriceEur)}/hour` : 'Free / public'}
                      </p>
                    </div>
                  </div>
                  <div className="owner-field-card-pro-actions">
                    <Link to={`/owner/fields/${f.id}`} className="owner-btn-outline">
                      Edit
                    </Link>
                    <Link to={`/owner/fields/${f.id}/prices`} className="owner-btn-primary">
                      Manage slots
                    </Link>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
