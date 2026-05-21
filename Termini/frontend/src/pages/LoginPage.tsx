import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError, toAlbanianAuthError } from '../api/client'
import { useSession } from '../context/SessionContext'

export function LoginPage() {
  const { login, isAuthenticated } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/fields', { replace: true })
  }, [isAuthenticated, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/fields', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? toAlbanianAuthError(err.message) : 'Hyrja dështoi')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>Hyr</h1>
      <p className="muted">
        Përdor email-in dhe fjalëkalimin për të rezervuar dhe për të paguar.
      </p>
      <form className="card form-card" onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Hyr
        </button>
      </form>
      {error && <p className="alert alert-error">{error}</p>}
      <p className="muted small">
        Nuk ke llogari? <Link to="/register">Regjistrohu</Link>
      </p>
      <p className="muted small" style={{ marginTop: '0.85rem' }}>
        <strong>Demo (klient):</strong> fjalëkalimi për të gjitha llogaritë demo të lojtarit është{' '}
        <code>terminiplayer123</code>. Shembuj email-i: <code>player@termini.demo</code>,{' '}
        <code>client2@termini.demo</code>, <code>client3@termini.demo</code>. Për panel pronari:{' '}
        <Link to="/owner/login">/owner/login</Link>.
      </p>
    </div>
  )
}
