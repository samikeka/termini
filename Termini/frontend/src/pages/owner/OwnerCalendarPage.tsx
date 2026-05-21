import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../api/client'
import { fetchOwnerAppointments } from '../../api/terminiApi'
import type { OwnerAppointmentDto } from '../../types'
import { pad2, todayIsoLocal } from './dateUtils'

function formatTime(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9) // 9–21

export function OwnerCalendarPage() {
  const [appts, setAppts] = useState<OwnerAppointmentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dayOffset, setDayOffset] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchOwnerAppointments()
      .then((r) => setAppts(Array.isArray(r) ? r : []))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const viewDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + dayOffset)
    const iso = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
    const label = d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    return { iso, label }
  }, [dayOffset])

  const forDay = useMemo(
    () => appts.filter((a) => a.dateAppointment === viewDate.iso),
    [appts, viewDate.iso],
  )

  const byField = useMemo(() => {
    const m = new Map<string, OwnerAppointmentDto[]>()
    for (const a of forDay) {
      const k = a.fieldName ?? `Field #${a.fieldId}`
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(a)
    }
    return Array.from(m.entries())
  }, [forDay])

  function slotForHour(fieldRows: OwnerAppointmentDto[], hour: number) {
    return fieldRows.filter((a) => {
      const t = formatTime(a.timeAppointment)
      const hh = Number(t.slice(0, 2))
      return hh === hour
    })
  }

  return (
    <div className="owner-panel">
      <h1 className="owner-page-title">Calendar</h1>
      <p className="owner-page-lede muted">Day view with hourly columns (booked slots).</p>

      <div className="owner-cal-toolbar">
        <button type="button" className="owner-btn-secondary" onClick={() => setDayOffset((d) => d - 1)}>
          ← Prev
        </button>
        <span className="owner-cal-current">
          {viewDate.label}
          {viewDate.iso === todayIsoLocal() ? ' · Today' : ''}
        </span>
        <button type="button" className="owner-btn-secondary" onClick={() => setDayOffset((d) => d + 1)}>
          Next →
        </button>
        <button type="button" className="owner-btn-ghost" onClick={() => setDayOffset(0)}>
          Today
        </button>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : byField.length === 0 ? (
        <p className="muted">No bookings on this day.</p>
      ) : (
        <div className="owner-cal-matrix">
          <div className="owner-cal-matrix-head">
            <div className="owner-cal-corner">Field</div>
            {HOURS.map((h) => (
              <div key={h} className="owner-cal-hour">
                {pad2(h)}:00
              </div>
            ))}
          </div>
          {byField.map(([name, list]) => (
            <div key={name} className="owner-cal-matrix-row">
              <div className="owner-cal-row-label">{name}</div>
              {HOURS.map((h) => {
                const hits = slotForHour(list, h)
                return (
                  <div key={h} className="owner-cal-cell">
                    {hits.map((x) => (
                      <span key={x.appointmentId} className="owner-cal-pill" title="Booked">
                        {formatTime(x.timeAppointment)}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
