import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  cancelOwnerAppointment,
  fetchFieldById,
  fetchOwnerFieldAppointments,
  fetchOwnerFieldNotifications,
  markAllOwnerNotificationsRead,
  markOwnerNotificationRead,
} from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
import type { FieldDto, OwnerAppointmentDto, OwnerNotificationDto } from '../types'

function formatTime(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

function formatInstant(iso: string) {
  try {
    return new Date(iso).toLocaleString('sq-AL')
  } catch {
    return iso
  }
}

export function OwnerFieldPage() {
  const { fieldId: param } = useParams()
  const fieldId = Number(param)
  const { isAuthenticated } = useSession()
  const [field, setField] = useState<FieldDto | null>(null)
  const [tab, setTab] = useState<'appointments' | 'notifications'>('appointments')
  const [appointments, setAppointments] = useState<OwnerAppointmentDto[]>([])
  const [notifications, setNotifications] = useState<OwnerNotificationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadField = useCallback(() => {
    if (!Number.isFinite(fieldId)) return Promise.resolve()
    return fetchFieldById(fieldId)
      .then(setField)
      .catch(() => setField(null))
  }, [fieldId])

  const loadAppointments = useCallback(() => {
    if (!Number.isFinite(fieldId)) return Promise.resolve()
    return fetchOwnerFieldAppointments(fieldId)
      .then(setAppointments)
      .catch((e) => {
        if (e instanceof ApiError) setError(e.message)
      })
  }, [fieldId])

  const loadNotifications = useCallback(() => {
    if (!Number.isFinite(fieldId)) return Promise.resolve()
    return fetchOwnerFieldNotifications(fieldId, false)
      .then(setNotifications)
      .catch((e) => {
        if (e instanceof ApiError) setError(e.message)
      })
  }, [fieldId])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    await loadField()
    await Promise.all([loadAppointments(), loadNotifications()])
    setLoading(false)
  }, [loadField, loadAppointments, loadNotifications])

  useEffect(() => {
    if (!isAuthenticated || !Number.isFinite(fieldId)) return
    loadAll()
  }, [isAuthenticated, fieldId, loadAll])

  async function onCancel(id: number) {
    if (!confirm('Cancel this booking?')) return
    setError(null)
    try {
      await cancelOwnerAppointment(id)
      await loadAll()
      window.dispatchEvent(new Event('termini-owner-refresh'))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Anulimi dështoi')
    }
  }

  async function onMarkRead(id: number) {
    setError(null)
    try {
      await markOwnerNotificationRead(id)
      await loadNotifications()
      window.dispatchEvent(new Event('termini-owner-refresh'))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gabim')
    }
  }

  async function onMarkAllRead() {
    setError(null)
    try {
      await markAllOwnerNotificationsRead()
      await loadNotifications()
      window.dispatchEvent(new Event('termini-owner-refresh'))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gabim')
    }
  }

  if (!Number.isFinite(fieldId)) {
    return <p className="alert alert-error">ID e pavlefshme.</p>
  }

  if (!isAuthenticated) {
    return (
      <div className="page narrow">
        <p className="alert alert-error">
          <Link to="/login">Hyr</Link> për të menaxhuar këtë fushë.
        </p>
      </div>
    )
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="owner-panel">
      <p>
        <Link to="/owner/fields" className="owner-back">
          ← My fields
        </Link>
      </p>
      <h1 className="owner-page-title">{field?.name ?? `Field #${fieldId}`}</h1>
      {field && (
        <p className="owner-page-lede muted">
          {field.city} · {field.location} ·{' '}
          {field.hourlyPriceEur != null ? `${field.hourlyPriceEur} €/hour` : ''}
        </p>
      )}

      <p className="owner-toolbar">
        <Link to={`/owner/fields/${fieldId}/prices`} className="owner-btn-primary">
          Prices &amp; slots
        </Link>
      </p>

      <div className="owner-tabs">
        <button
          type="button"
          className={'owner-tab' + (tab === 'appointments' ? ' owner-tab--active' : '')}
          onClick={() => setTab('appointments')}
        >
          Appointments
        </button>
        <button
          type="button"
          className={'owner-tab' + (tab === 'notifications' ? ' owner-tab--active' : '')}
          onClick={() => setTab('notifications')}
        >
          Notifications
          {unread > 0 && <span className="owner-tab-badge">{unread}</span>}
        </button>
        <button type="button" className="owner-btn-secondary" onClick={loadAll}>
          Refresh
        </button>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <p className="muted">Duke ngarkuar…</p>
      ) : tab === 'appointments' ? (
        appointments.length === 0 ? (
          <p className="muted">No appointments for this field.</p>
        ) : (
          <div className="owner-table-wrap">
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Date / time</th>
                  <th>Customer</th>
                  <th>Duration</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.appointmentId}>
                    <td>
                      {a.dateAppointment} · {formatTime(a.timeAppointment)}
                    </td>
                    <td>
                      {a.bookerName ?? '—'}
                      <div className="muted small">{a.bookerEmail ?? ''}</div>
                    </td>
                    <td>
                      {a.durationMinutes != null ? (
                        <>{a.durationMinutes} min</>
                      ) : (
                        <span className="muted">{(a.timeReservedField ?? 1) * 60} min (fallback)</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="owner-btn-ghost owner-btn-danger"
                        onClick={() => onCancel(a.appointmentId)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : notifications.length === 0 ? (
        <p className="muted">No notifications for this field.</p>
      ) : (
        <>
          <p>
            <button type="button" className="owner-btn-secondary" onClick={onMarkAllRead}>
              Mark all read (global)
            </button>
          </p>
          <ul className="owner-notif-list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={
                  'owner-notif-item' + (n.read ? '' : ' owner-notif-item--unread')
                }
              >
                <span
                  className={
                    'owner-notif-ico' +
                    (n.type?.includes('CANCEL')
                      ? ' owner-notif-ico--bad'
                      : n.type?.includes('BOOK')
                        ? ' owner-notif-ico--ok'
                        : ' owner-notif-ico--info')
                  }
                  aria-hidden
                />
                <div className="owner-notif-body">
                  <div className="muted small">{formatInstant(n.createdAt)}</div>
                  <p className="owner-notif-msg">{n.message}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    className="owner-btn-primary owner-btn-sm"
                    onClick={() => onMarkRead(n.id)}
                  >
                    Done
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
