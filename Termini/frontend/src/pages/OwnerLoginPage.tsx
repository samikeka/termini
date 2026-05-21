import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, toAlbanianAuthError } from '../api/client'
import { useSession } from '../context/SessionContext'

export function OwnerLoginPage() {
  const { login, isAuthenticated, user, logout } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.role === 'FIELD_OWNER') {
      navigate('/owner', { replace: true })
    }
  }, [isAuthenticated, user?.role, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      const stored = localStorage.getItem('termini_user')
      const u = stored ? (JSON.parse(stored) as { role?: string }) : null
      if (u?.role !== 'FIELD_OWNER') {
        logout()
        setError('Kjo llogari nuk është pronar fushe. Përdor /login për lojtarë.')
        return
      }
      navigate('/owner', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? toAlbanianAuthError(err.message) : 'Hyrja dështoi')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="owner-auth-page">
      <div className="owner-auth-inner">
        <Link to="/" className="owner-auth-back">
          ← Ballina
        </Link>

        <header className="owner-auth-intro">
          <p className="owner-auth-eyebrow">Paneli i host-it</p>
          <h1>Hyr si pronar</h1>
          <p className="muted">
            Vetëm llogaritë me rol <strong>FIELD_OWNER</strong> hyjnë në panelin e pronarit.
          </p>
          <p className="owner-auth-actions muted small">
            <Link to="/owner/register">Regjistrohu si pronar</Link>
            <span className="owner-auth-sep" aria-hidden>
              ·
            </span>
            <Link to="/login">Hyr si lojtar</Link>
          </p>
        </header>

        <form className="card form-card owner-auth-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ju@shembull.com"
            />
          </label>
          <label>
            Fjalëkalimi
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
          {error ? (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Duke u hyrë…' : 'Hyr'}
          </button>
        </form>

        <div className="owner-auth-demo card" style={{ marginTop: '1.25rem' }}>
          <p>
            <strong>Llogari demo (pronar)</strong>
          </p>
          <p className="muted small" style={{ margin: '0 0 0.65rem' }}>
            Fjalëkalimi për të gjitha: <code>terminiowner123</code>
          </p>
          <ul className="owner-auth-demo-list muted small">
            <li>
              <code>owner@termini.demo</code> — Prishtinë / Pejë (Arena 5v5, Elite Indoor)
            </li>
            <li>
              <code>owner2@termini.demo</code> — Tiranë (Tirana Arena 5v5)
            </li>
            <li>
              <code>owner3@termini.demo</code> — Shkup (Skopje City Arena)
            </li>
          </ul>
          <p className="muted small" style={{ margin: '0.65rem 0 0' }}>
            Pas hyrjes shiko panelin, kalendarin dhe terminet. Nëse s’ka të dhëna, rinis backend-in.
          </p>
        </div>
      </div>
    </div>
  )
}
