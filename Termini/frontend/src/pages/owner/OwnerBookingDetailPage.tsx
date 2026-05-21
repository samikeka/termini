import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { cancelOwnerAppointment, fetchOwnerAppointments } from '../../api/terminiApi'
import type { OwnerAppointmentDto } from '../../types'

function formatTime(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

export function OwnerBookingDetailPage() {
  const { appointmentId: param } = useParams()
  const id = Number(param)
  const navigate = useNavigate()
  const [a, setA] = useState<OwnerAppointmentDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!Number.isFinite(id)) return Promise.resolve()
    setLoading(true)
    setError(null)
    return fetchOwnerAppointments()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : []
        const found = list.find((x) => x.appointmentId === id) ?? null
        setA(found)
        if (!found) setError('Booking not found.')
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function onCancel() {
    if (!a || !confirm('Cancel this booking?')) return
    try {
      await cancelOwnerAppointment(a.appointmentId)
      window.dispatchEvent(new Event('termini-owner-refresh'))
      navigate('/owner/bookings')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Cancel failed')
    }
  }

  if (!Number.isFinite(id)) {
    return <p className="alert alert-error">Invalid booking id.</p>
  }

  return (
    <div className="owner-panel">
      <p>
        <Link to="/owner/bookings" className="owner-back">
          ← Bookings
        </Link>
      </p>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : !a ? (
        <p className="muted">{error ?? 'Not found.'}</p>
      ) : (
        <>
          <div className="owner-booking-head">
            <h1 className="owner-page-title">Booking details</h1>
            <span className="owner-badge owner-badge--ok">Confirmed</span>
            <span className="muted small">ID #{a.appointmentId}</span>
          </div>

          {error && <p className="alert alert-error">{error}</p>}

          <div className="owner-booking-grid">
            <div className="owner-form-card">
              <h2>Customer</h2>
              <div className="owner-customer">
                <div className="owner-avatar owner-avatar--lg" aria-hidden>
                  {(a.bookerName ?? a.guestName ?? '?').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <strong>{a.bookerName ?? a.guestName ?? 'Guest'}</strong>
                  <p className="muted small">{a.bookerEmail ?? a.guestEmail ?? '—'}</p>
                </div>
              </div>
              <div className="owner-quick-actions">
                <button type="button" className="owner-btn-outline" disabled>
                  Call
                </button>
                <button type="button" className="owner-btn-outline" disabled>
                  Message
                </button>
                <button type="button" className="owner-btn-outline" disabled>
                  Email
                </button>
              </div>
            </div>

            <div className="owner-form-card">
              <h2>Booking</h2>
              <p>
                <strong>{a.fieldName ?? `Field #${a.fieldId}`}</strong>
              </p>
              <p className="muted">
                {a.dateAppointment} · {formatTime(a.timeAppointment)}
              </p>
              <p>
                Duration:{' '}
                <strong>{a.durationMinutes != null ? `${a.durationMinutes} min` : '—'}</strong>
              </p>
              <p>
                Price (demo): <strong>€80</strong>
              </p>
              <p>
                Payment: <span className="owner-badge owner-badge--ok">Paid</span>
              </p>
              {a.seekingPlayers && (
                <p className="muted small">Open join: {a.playersNeeded ?? '—'} players needed</p>
              )}
            </div>
          </div>

          <div className="owner-booking-actions">
            <button type="button" className="owner-btn-outline" onClick={onCancel}>
              Cancel booking
            </button>
            <button type="button" className="owner-btn-primary" disabled>
              Message player
            </button>
          </div>
        </>
      )}
    </div>
  )
}
