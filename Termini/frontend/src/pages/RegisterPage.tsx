import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useSession } from '../context/SessionContext'

export function RegisterPage() {
  const { register, isAuthenticated } = useSession()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
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
      await register(name, city, email, password)
      navigate('/fields', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Regjistrimi dështoi')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>Krijo llogari</h1>
      <p className="muted">
        Pas regjistrimit hyr automatikisht dhe mund të rezervosh fusha në Kosovë
        dhe Shqipëri.
      </p>
      <form className="card form-card" onSubmit={onSubmit}>
        <label>
          Emri
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Qyteti
          <input required value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Fjalëkalimi (min. 8 karaktere)
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Regjistrohu
        </button>
      </form>
      {error && <p className="alert alert-error">{error}</p>}
      <p className="muted small">
        Ke tashmë llogari? <Link to="/login">Hyr</Link> — për të provuar shpejt pa u regjistruar,
        përdor llogarinë demo te faqja e hyrjes.
      </p>
    </div>
  )
}
