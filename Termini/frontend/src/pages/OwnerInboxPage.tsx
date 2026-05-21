import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import {
  fetchOwnerNotifications,
  markAllOwnerNotificationsRead,
  markOwnerNotificationRead,
} from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
import type { OwnerNotificationDto } from '../types'

function formatInstant(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function timeAgo(iso: string) {
  try {
    const t = new Date(iso).getTime()
    const s = Math.floor((Date.now() - t) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  } catch {
    return ''
  }
}

function notifIconClass(type: string) {
  const u = type.toUpperCase()
  if (u.includes('CANCEL')) return 'owner-notif-ico--bad'
  if (u.includes('BOOK') || u.includes('NEW')) return 'owner-notif-ico--ok'
  return 'owner-notif-ico--info'
}

export function OwnerInboxPage() {
  const { isAuthenticated } = useSession()
  const [rows, setRows] = useState<OwnerNotificationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return fetchOwnerNotifications(false)
      .then(setRows)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'Failed to load notifications'),
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    load()
  }, [isAuthenticated, load])

  async function onMarkRead(id: number) {
    try {
      await markOwnerNotificationRead(id)
      await load()
      window.dispatchEvent(new Event('termini-owner-refresh'))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error')
    }
  }

  async function onMarkAll() {
    try {
      await markAllOwnerNotificationsRead()
      await load()
      window.dispatchEvent(new Event('termini-owner-refresh'))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error')
    }
  }

  return (
    <div className="owner-panel">
      <h1 className="owner-page-title">Notifications</h1>
      <p className="owner-page-lede muted">Recent activity across your venues.</p>
      <p className="owner-toolbar">
        <button type="button" className="owner-btn-secondary" onClick={onMarkAll}>
          Mark all as read
        </button>
        <button type="button" className="owner-btn-ghost" onClick={load}>
          Refresh
        </button>
      </p>
      {error && <p className="alert alert-error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No notifications.</p>
      ) : (
        <ul className="owner-notif-feed">
          {rows.map((n) => (
            <li
              key={n.id}
              className={
                'owner-notif-feed-item' + (n.read ? '' : ' owner-notif-feed-item--unread')
              }
            >
              <span className={`owner-notif-ico ${notifIconClass(n.type)}`} aria-hidden />
              <div className="owner-notif-feed-main">
                <div className="owner-notif-feed-title">{n.type?.replace(/_/g, ' ') ?? 'Update'}</div>
                <p className="owner-notif-feed-msg">{n.message}</p>
                <div className="owner-notif-feed-meta muted small">
                  {formatInstant(n.createdAt)} · {timeAgo(n.createdAt)}
                </div>
              </div>
              {!n.read && (
                <button
                  type="button"
                  className="owner-btn-primary owner-btn-sm"
                  onClick={() => onMarkRead(n.id)}
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
