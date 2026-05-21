import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { fetchOwnerFields } from '../../api/terminiApi'
import type { FieldDto } from '../../types'

/** Pick a field to edit prices; redirects when only one field. */
export function OwnerPricesHubPage() {
  const [fields, setFields] = useState<FieldDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOwnerFields()
      .then((r) => setFields(Array.isArray(r) ? r : []))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="owner-panel">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (fields.length === 1) {
    return <Navigate to={`/owner/fields/${fields[0]!.id}/prices`} replace />
  }

  return (
    <div className="owner-panel">
      <h1 className="owner-page-title">Prices &amp; slots</h1>
      <p className="owner-page-lede muted">Choose a field to manage hourly slots and pricing.</p>
      {error && <p className="alert alert-error">{error}</p>}
      {fields.length === 0 ? (
        <p className="muted">No fields yet.</p>
      ) : (
        <ul className="owner-prices-hub-list">
          {fields.map((f) => (
            <li key={f.id}>
              <Link to={`/owner/fields/${f.id}/prices`} className="owner-prices-hub-link">
                <strong>{f.name}</strong>
                <span className="muted">{f.city}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
