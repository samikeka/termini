import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { fetchOwnerAppointments, fetchOwnerFields } from '../../api/terminiApi'
import type { FieldDto, OwnerAppointmentDto } from '../../types'
import { todayIsoLocal } from './dateUtils'

function formatTime(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

export function OwnerDashboardPage() {
  const [fields, setFields] = useState<FieldDto[]>([])
  const [appts, setAppts] = useState<OwnerAppointmentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchOwnerFields(), fetchOwnerAppointments()])
      .then(([f, a]) => {
        setFields(Array.isArray(f) ? f : [])
        setAppts(Array.isArray(a) ? a : [])
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const today = todayIsoLocal()
  const todayAppts = useMemo(
    () => appts.filter((a) => a.dateAppointment === today),
    [appts, today],
  )

  const monthAppts = useMemo(() => {
    const prefix = today.slice(0, 7)
    return appts.filter((a) => a.dateAppointment.startsWith(prefix))
  }, [appts, today])

  const estHourly = 40
  const todayRevenue = todayAppts.length * estHourly
  const monthRevenue = monthAppts.length * estHourly

  const sortedToday = useMemo(() => {
    return [...todayAppts].sort((a, b) =>
      (a.timeAppointment ?? '').localeCompare(b.timeAppointment ?? ''),
    )
  }, [todayAppts])

  /** Mini timeline: group by field for display */
  const byFieldToday = useMemo(() => {
    const m = new Map<string, OwnerAppointmentDto[]>()
    for (const a of todayAppts) {
      const k = a.fieldName ?? `Field #${a.fieldId}`
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(a)
    }
    return Array.from(m.entries())
  }, [todayAppts])

  return (
    <div className="owner-panel">
      <h1 className="owner-page-title">Dashboard</h1>
      <p className="owner-page-lede muted">
        Overview of bookings and revenue estimates (demo figures based on booking counts).
      </p>

      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <div className="owner-stat-grid">
            <div className="owner-stat-card">
              <span className="owner-stat-label">Today&apos;s bookings</span>
              <span className="owner-stat-num">{todayAppts.length}</span>
              <span className="owner-stat-delta muted small">vs yesterday (demo)</span>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-label">Today&apos;s revenue (est.)</span>
              <span className="owner-stat-num">€{todayRevenue}</span>
              <span className="owner-stat-delta muted small">€{estHourly}/slot demo rate</span>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-label">This month (est.)</span>
              <span className="owner-stat-num">€{monthRevenue}</span>
              <span className="owner-stat-delta muted small">{monthAppts.length} bookings</span>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-label">Total fields</span>
              <span className="owner-stat-num">{fields.length}</span>
              <span className="owner-stat-delta muted small">Active venues</span>
            </div>
          </div>

          <section className="owner-card-block">
            <div className="owner-card-head">
              <h2>Today&apos;s bookings</h2>
              <Link to="/owner/bookings" className="owner-link-all">
                View all →
              </Link>
            </div>
            {sortedToday.length === 0 ? (
              <p className="muted owner-empty">No bookings for today.</p>
            ) : (
              <div className="owner-table-wrap">
                <table className="owner-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Field</th>
                      <th>Customer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedToday.map((a) => (
                      <tr key={a.appointmentId}>
                        <td>
                          {formatTime(a.timeAppointment)}
                          {a.durationMinutes != null ? (
                            <span className="muted small">
                              {' '}
                              (+{a.durationMinutes} min)
                            </span>
                          ) : null}
                        </td>
                        <td>{a.fieldName ?? `Field #${a.fieldId}`}</td>
                        <td>
                          {a.bookerName ?? a.guestName ?? '—'}
                          <div className="muted small">{a.bookerEmail ?? a.guestEmail ?? ''}</div>
                        </td>
                        <td>
                          <span className="owner-badge owner-badge--ok">Confirmed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="owner-card-block">
            <div className="owner-card-head">
              <h2>Bookings calendar (today)</h2>
            </div>
            {byFieldToday.length === 0 ? (
              <p className="muted owner-empty">No slots to show.</p>
            ) : (
              <div className="owner-cal-grid">
                {byFieldToday.map(([fieldName, list]) => (
                  <div key={fieldName} className="owner-cal-row">
                    <div className="owner-cal-field">{fieldName}</div>
                    <div className="owner-cal-slots">
                      {list
                        .sort((a, b) =>
                          (a.timeAppointment ?? '').localeCompare(b.timeAppointment ?? ''),
                        )
                        .map((a) => (
                          <span key={a.appointmentId} className="owner-cal-block" title="Booked">
                            {formatTime(a.timeAppointment)}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
