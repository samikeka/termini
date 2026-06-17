import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { fetchOwnerAppointments } from '../../api/terminiApi'
import type { OwnerAppointmentDto } from '../../types'

function formatTime(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

export function OwnerBookingsPage() {
  const [rows, setRows] = useState<OwnerAppointmentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchOwnerAppointments()
      .then((r) =>
        setRows(
          (Array.isArray(r) ? r : []).sort((a, b) => {
            const da = `${a.dateAppointment}T${formatTime(a.timeAppointment)}`
            const db = `${b.dateAppointment}T${formatTime(b.timeAppointment)}`
            return db.localeCompare(da)
          }),
        ),
      )
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="owner-panel">
      <h1 className="owner-page-title">Bookings</h1>
      <p className="owner-page-lede muted">All appointments across your fields.</p>
      <p>
        <button type="button" className="owner-btn-secondary" onClick={load}>
          Refresh
        </button>
      </p>

      {error && <p className="alert alert-error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No bookings yet.</p>
      ) : (
        <div className="owner-table-wrap">
          <table className="owner-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Field</th>
                <th>Customer</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.appointmentId}>
                  <td>{a.dateAppointment}</td>
                  <td>{formatTime(a.timeAppointment)}</td>
                  <td>{a.fieldName ?? `#${a.fieldId}`}</td>
                  <td>
                    {a.bookerName ?? a.guestName ?? '—'}
                    <div className="muted small">{a.bookerEmail ?? a.guestEmail ?? ''}</div>
                  </td>
                  <td>
                    <Link
                      to={`/owner/bookings/${a.appointmentId}`}
                      className="owner-link-all"
                    >
                      Details →
                    </Link>
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
