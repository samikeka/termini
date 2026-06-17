import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { registerOwner } from '../api/terminiApi'
import { useSession } from '../context/SessionContext'

export function OwnerRegisterPage() {
  const { isAuthenticated, user, logout, applyAuthResponse } = useSession()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [iban, setIban] = useState('')
  const [holder, setHolder] = useState('')
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
      if (isAuthenticated && user?.role !== 'FIELD_OWNER') {
        logout()
      }
      const res = await registerOwner({
        name: name.trim(),
        city: city.trim(),
        email: email.trim(),
        password,
        ownerIban: iban.trim(),
        ownerAccountHolder: holder.trim(),
      })
      applyAuthResponse(res)
      navigate('/owner', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Regjistrimi dështoi')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="owner-auth-page">
      <div className="owner-auth-inner owner-auth-inner--wide">
        <Link to="/" className="owner-auth-back">
          ← Ballina
        </Link>

        <header className="owner-auth-intro">
          <p className="owner-auth-eyebrow">Paneli i host-it</p>
          <h1>Regjistrohu si pronar fushe</h1>
          <p className="muted">
            Krijon llogari me të drejtë të shtosh fusha dhe të marrësh pagesa (MVP: mock).{' '}
            <Link to="/owner/login">Ke tashmë llogari?</Link>
          </p>
        </header>

        <form className="card form-card owner-auth-form" onSubmit={onSubmit}>
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
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Fjalëkalimi (min. 8)
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          IBAN (pagesa te pronari — 15–34 karaktere)
          <input
            required
            minLength={15}
            maxLength={34}
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="p.sh. XK05…"
          />
        </label>
        <label>
          Titullari i llogarisë
          <input
            required
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
          />
        </label>
        {error ? (
          <p className="alert alert-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Duke u krijuar…' : 'Krijo llogari pronari'}
        </button>
      </form>

        <p className="owner-auth-foot muted small">
          Për rezervime si lojtar, <Link to="/login">hyr në llogarinë e klientit</Link>.
        </p>
      </div>
    </div>
  )
}
