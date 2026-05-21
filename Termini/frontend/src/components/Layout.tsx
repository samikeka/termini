import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { fetchOwnerUnreadCount } from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
function sideNavCls({ isActive }: { isActive: boolean }) {
  return 'pf-side-nav-link' + (isActive ? ' pf-side-nav-link--active' : '')
}

export function Layout() {
  const { user, isAuthenticated, logout } = useSession()
  const [ownerUnread, setOwnerUnread] = useState(0)
  const isFieldOwner = user?.role === 'FIELD_OWNER'
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !isFieldOwner) {
      setOwnerUnread(0)
      return
    }
    const load = () => {
      fetchOwnerUnreadCount()
        .then((r) => setOwnerUnread(r.count))
        .catch(() => setOwnerUnread(0))
    }
    load()
    const t = setInterval(load, 45000)
    const onRefresh = () => load()
    window.addEventListener('termini-owner-refresh', onRefresh)
    return () => {
      clearInterval(t)
      window.removeEventListener('termini-owner-refresh', onRefresh)
    }
  }, [isAuthenticated, isFieldOwner])

  const initials = useMemo(() => {
    const n = user?.name?.trim()
    if (!n) return 'U'
    return n
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('')
  }, [user?.name])

  return (
    <div className="pf-app pf-app--shell">
      <aside className="pf-sidebar" aria-label="Primary">
        <Link to="/" className="pf-sidebar-brand">
          <span className="pf-sidebar-brand-mark" aria-hidden />
          <span className="pf-sidebar-brand-text">
            <span className="pf-sidebar-brand-name">TERMINI</span>
            <span className="pf-sidebar-brand-pro">PRO</span>
          </span>
        </Link>

        <nav className="pf-side-nav" aria-label="Main">
          <NavLink to="/" className={sideNavCls} end>
            <span className="pf-side-ico pf-side-ico--home" aria-hidden />
            Home
          </NavLink>
          <NavLink to="/fields" className={sideNavCls}>
            <span className="pf-side-ico pf-side-ico--search" aria-hidden />
            Search
          </NavLink>
          <NavLink to="/fusha-publike" className={sideNavCls}>
            <span className="pf-side-ico pf-side-ico--ball" aria-hidden />
            Fusha publike
          </NavLink>
          <NavLink to="/bookings" className={sideNavCls}>
            <span className="pf-side-ico pf-side-ico--calendar" aria-hidden />
            My Bookings
          </NavLink>
          <NavLink to="/club-crm" className={sideNavCls}>
            <span className="pf-side-ico pf-side-ico--building" aria-hidden />
            Club CRM
          </NavLink>
          <NavLink to="/matches" className={sideNavCls}>
            <span className="pf-side-ico pf-side-ico--users" aria-hidden />
            My Games
          </NavLink>
          <span className="pf-side-nav-muted" title="Coming soon">
            <span className="pf-side-ico pf-side-ico--msg" aria-hidden />
            Messages
          </span>
          <span className="pf-side-nav-muted" title="Coming soon">
            <span className="pf-side-ico pf-side-ico--heart" aria-hidden />
            Favorites
          </span>
          <NavLink to={isAuthenticated ? '/bookings' : '/login'} className={sideNavCls}>
            <span className="pf-side-ico pf-side-ico--user" aria-hidden />
            Profile
          </NavLink>
          <span className="pf-side-nav-muted" title="Coming soon">
            <span className="pf-side-ico pf-side-ico--gear" aria-hidden />
            Settings
          </span>
          {isAuthenticated && isAdmin && (
            <NavLink to="/admin" className={sideNavCls}>
              <span className="pf-side-ico pf-side-ico--shield" aria-hidden />
              Admin
            </NavLink>
          )}
          {isAuthenticated && isFieldOwner && (
            <NavLink to="/owner" className={sideNavCls}>
              <span className="pf-side-ico pf-side-ico--building" aria-hidden />
              Host inbox
              {ownerUnread > 0 ? (
                <span className="pf-side-badge" aria-label={`Unread: ${ownerUnread}`}>
                  {ownerUnread > 9 ? '9+' : ownerUnread}
                </span>
              ) : null}
            </NavLink>
          )}
        </nav>

        <div className="pf-sidebar-bottom">
          {isAuthenticated ? (
            <button type="button" className="pf-sidebar-logout" onClick={logout}>
              Log out
            </button>
          ) : (
            <div className="pf-sidebar-auth">
              <Link to="/login" className="pf-sidebar-auth-link">
                Log in
              </Link>
              <Link to="/register" className="pf-btn pf-btn--primary pf-btn--sm pf-sidebar-signup">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </aside>

      <div className="pf-shell-main">
        <header className="pf-topbar">
          <form
            className="pf-topbar-search"
            onSubmit={(e) => {
              e.preventDefault()
              if (q.trim()) {
                navigate(`/fields?q=${encodeURIComponent(q.trim())}`)
              } else {
                navigate('/fields')
              }
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kërko shërbime, qytet…"
              aria-label="Quick search"
              type="search"
            />
          </form>
          <div className="pf-topbar-actions">
            <Link to="/" className="pf-topbar-link">
              How it works
            </Link>
            <Link to="/owner/register" className="pf-topbar-link pf-topbar-link--emph">
              Become a host
            </Link>
            <button type="button" className="pf-topbar-bell" aria-label="Notifications">
              <span className="pf-bell-glyph" aria-hidden />
            </button>
            {isAuthenticated && user ? (
              <button
                type="button"
                className="pf-topbar-avatar"
                title={`${user.email} — click to sign out`}
                onClick={logout}
              >
                {initials}
              </button>
            ) : (
              <Link to="/login" className="pf-topbar-avatar pf-topbar-avatar--placeholder">
                ?
              </Link>
            )}
          </div>
        </header>

        <main className="main-content main-content--shell">
          <Outlet />
        </main>

        <section className="pf-value-strip" aria-label="Why Termini Pro">
          <div className="pf-value-strip-inner">
            <div className="pf-value-item">
              <span className="pf-value-ico pf-value-ico--bolt" aria-hidden />
              <div>
                <strong>Easy booking</strong>
                <span>Book in seconds</span>
              </div>
            </div>
            <div className="pf-value-item">
              <span className="pf-value-ico pf-value-ico--clock" aria-hidden />
              <div>
                <strong>Real-time availability</strong>
                <span>See free slots instantly</span>
              </div>
            </div>
            <div className="pf-value-item">
              <span className="pf-value-ico pf-value-ico--users" aria-hidden />
              <div>
                <strong>Find players</strong>
                <span>Fill your team easily</span>
              </div>
            </div>
            <div className="pf-value-item">
              <span className="pf-value-ico pf-value-ico--lock" aria-hidden />
              <div>
                <strong>Secure payments</strong>
                <span>Safe &amp; secure</span>
              </div>
            </div>
            <div className="pf-value-item">
              <span className="pf-value-ico pf-value-ico--ball" aria-hidden />
              <div>
                <strong>Play more</strong>
                <span>Enjoy the game!</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="pf-footer">
          <div className="pf-footer-inner">
            <div className="pf-footer-grid">
              <div className="pf-footer-col">
                <h4>TERMINI PRO</h4>
                <p className="pf-footer-text">
                  Book football, basketball, tennis courts and more — with live availability and
                  simple checkout.
                </p>
              </div>
              <div className="pf-footer-col">
                <h4>Browse</h4>
                <ul className="pf-footer-links">
                  <li>
                    <Link to="/fields">Kërko shërbime</Link>
                  </li>
                  <li>
                    <Link to="/fields?category=BEAUTY">Bukuri</Link>
                  </li>
                  <li>
                    <Link to="/fields?category=HEALTH">Shëndet</Link>
                  </li>
                  <li>
                    <Link to="/fusha-publike">Fusha publike (KS)</Link>
                  </li>
                  <li>
                    <Link to="/matches">Open games</Link>
                  </li>
                  <li>
                    <Link to="/bookings">My bookings</Link>
                  </li>
                </ul>
              </div>
              <div className="pf-footer-col">
                <h4>For hosts</h4>
                <ul className="pf-footer-links">
                  <li>
                    <Link to="/owner/register">List your venue</Link>
                  </li>
                  <li>
                    <Link to="/owner/login">Owner login</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pf-footer-bottom">
              <span>Termini Pro · demo</span>
              <span>React &amp; Spring Boot</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
