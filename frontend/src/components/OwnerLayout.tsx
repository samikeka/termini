import { useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { fetchOwnerUnreadCount } from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
function navCls({ isActive }: { isActive: boolean }) {
  return 'owner-nav-link' + (isActive ? ' owner-nav-link--active' : '')
}

export function OwnerLayout() {
  const { user, isAuthenticated, logout } = useSession()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const isFieldOwner = user?.role === 'FIELD_OWNER'

  useEffect(() => {
    if (!isAuthenticated || !isFieldOwner) {
      setUnread(0)
      return
    }
    const load = () => {
      fetchOwnerUnreadCount()
        .then((r) => setUnread(r.count))
        .catch(() => setUnread(0))
    }
    load()
    const t = setInterval(load, 40000)
    const ev = () => load()
    window.addEventListener('termini-owner-refresh', ev)
    return () => {
      clearInterval(t)
      window.removeEventListener('termini-owner-refresh', ev)
    }
  }, [isAuthenticated, isFieldOwner])

  const firstName = useMemo(() => {
    const n = user?.name?.trim()
    if (!n) return 'Owner'
    return n.split(/\s+/)[0] ?? 'Owner'
  }, [user?.name])

  if (!isAuthenticated) {
    return <Navigate to="/owner/login" replace state={{ from: location }} />
  }

  if (!isFieldOwner) {
    return (
      <div className="owner-gate">
        <h1>Field owner area</h1>
        <p className="muted">
          This account is not a field owner. Please log in with an owner account or register as
          host.
        </p>
        <p>
          <NavLink to="/owner/login" className="pf-btn pf-btn--primary pf-btn--sm">
            Owner login
          </NavLink>{' '}
          <NavLink to="/owner/register" className="pf-btn pf-btn--outline pf-btn--sm">
            Register as host
          </NavLink>
        </p>
      </div>
    )
  }

  return (
    <div className="owner-shell">
      <aside className="owner-sidebar" aria-label="Owner navigation">
        <NavLink to="/owner" className="owner-brand" end>
          <span className="owner-brand-mark" aria-hidden />
          <span className="owner-brand-text">
            <span className="owner-brand-name">TERMINI</span>
            <span className="owner-brand-pro">PRO</span>
          </span>
        </NavLink>

        <nav className="owner-nav">
          <NavLink to="/owner" className={navCls} end>
            Dashboard
          </NavLink>
          <NavLink to="/owner/bookings" className={navCls}>
            Bookings
          </NavLink>
          <NavLink to="/owner/calendar" className={navCls}>
            Calendar
          </NavLink>
          <NavLink to="/owner/fields" className={navCls}>
            My Fields
          </NavLink>
          <NavLink to="/owner/prices" className={navCls}>
            Prices &amp; Slots
          </NavLink>
          <NavLink to="/owner/payments" className={navCls}>
            Payments
          </NavLink>
          <NavLink to="/owner/notifications" className={navCls}>
            Notifications
            {unread > 0 ? (
              <span className="owner-nav-badge">{unread > 99 ? '99+' : unread}</span>
            ) : null}
          </NavLink>
          <NavLink to="/owner/reviews" className={navCls}>
            Reviews
          </NavLink>
          <NavLink to="/owner/bank" className={navCls}>
            Bank Details
          </NavLink>
          <NavLink to="/owner/settings" className={navCls}>
            Settings
          </NavLink>
        </nav>

        <div className="owner-sidebar-foot">
          <button type="button" className="owner-logout" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="owner-main-wrap">
        <header className="owner-topbar">
          <div className="owner-topbar-welcome">
            Welcome back, <strong>{firstName}</strong>
          </div>
          <div className="owner-topbar-actions">
            <NavLink to="/fields" className="owner-btn-add">
              + Add New Field
            </NavLink>
            <div className="owner-avatar" title={user?.email ?? ''} aria-hidden>
              {firstName.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="owner-main">
          <Outlet />
        </main>

        <footer className="owner-value-strip" aria-label="Host benefits">
          <div className="owner-value-strip-inner">
            <div className="owner-value-item">
              <span className="owner-value-dot" />
              <div>
                <strong>Real-time notifications</strong>
                <span>Stay on top of every booking</span>
              </div>
            </div>
            <div className="owner-value-item">
              <span className="owner-value-dot owner-value-dot--2" />
              <div>
                <strong>Secure payouts</strong>
                <span>Bank-ready profile</span>
              </div>
            </div>
            <div className="owner-value-item">
              <span className="owner-value-dot owner-value-dot--3" />
              <div>
                <strong>Easy management</strong>
                <span>Fields, slots &amp; calendar</span>
              </div>
            </div>
            <div className="owner-value-item">
              <span className="owner-value-dot owner-value-dot--4" />
              <div>
                <strong>Detailed analytics</strong>
                <span>Dashboard overview</span>
              </div>
            </div>
            <div className="owner-value-item">
              <span className="owner-value-dot owner-value-dot--5" />
              <div>
                <strong>Grow your business</strong>
                <span>Reach more players</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
