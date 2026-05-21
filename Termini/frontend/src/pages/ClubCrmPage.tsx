import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { createClubCrm, fetchMyClubsCrm } from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
import type { ClubCrmDto } from '../types'

const SPORTS = [
  { value: 'FOOTBALL', label: 'Football' },
  { value: 'BASKETBALL', label: 'Basketball' },
  { value: 'TENNIS', label: 'Tennis' },
  { value: 'VOLLEYBALL', label: 'Volleyball' },
  { value: 'HANDBALL', label: 'Handball' },
  { value: 'PADEL', label: 'Padel' },
  { value: 'OTHER', label: 'Other' },
]

export function ClubCrmPage() {
  const { isAuthenticated } = useSession()
  const [clubs, setClubs] = useState<ClubCrmDto[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [sportType, setSportType] = useState('FOOTBALL')
  const [location, setLocation] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      setClubs([])
      return
    }
    setErr(null)
    setLoading(true)
    fetchMyClubsCrm()
      .then(setClubs)
      .catch((e) => setErr(e instanceof ApiError ? e.message : 'Failed to load clubs'))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !location.trim()) return
    setBusy(true)
    setErr(null)
    try {
      const created = await createClubCrm({
        name: name.trim(),
        sportType,
        location: location.trim(),
      })
      setClubs((prev) => {
        const next = prev.filter((c) => c.id !== created.id)
        return [created, ...next]
      })
      setName('')
      setLocation('')
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not create club')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page pf-page tp-club-crm-page">
      <p className="tp-club-crm-kicker">Club Management CRM</p>
      <h1 className="tp-club-crm-title">Your club workspaces</h1>
      <p className="muted tp-club-crm-lede">
        Separate from public venue booking: manage squads, fees, attendance, and sessions here as
        we extend this module. Phase 1 — create a club and become owner.
      </p>

      {!isAuthenticated && (
        <p className="alert alert-info">
          <Link to="/login">Log in</Link> to create or view clubs.
        </p>
      )}

      {isAuthenticated && (
        <>
          {err && <p className="alert alert-error">{err}</p>}
          {loading && <p className="muted">Loading…</p>}

          <section className="tp-club-crm-panel" aria-labelledby="club-create-h">
            <h2 id="club-create-h">Create club</h2>
            <form className="tp-club-crm-form" onSubmit={onCreate}>
              <label>
                Club name
                <input
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  placeholder="e.g. Prishtina Veterans FC"
                  required
                  maxLength={180}
                />
              </label>
              <label>
                Sport
                <select value={sportType} onChange={(ev) => setSportType(ev.target.value)}>
                  {SPORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Location / home base
                <input
                  value={location}
                  onChange={(ev) => setLocation(ev.target.value)}
                  placeholder="City or venue area"
                  required
                  maxLength={255}
                />
              </label>
              <button type="submit" className="pf-btn pf-btn--primary" disabled={busy}>
                {busy ? 'Creating…' : 'Create club'}
              </button>
            </form>
          </section>

          <section className="tp-club-crm-panel" aria-labelledby="club-list-h">
            <h2 id="club-list-h">My clubs</h2>
            {!loading && clubs.length === 0 && (
              <p className="muted">No clubs yet — create one above.</p>
            )}
            <ul className="tp-club-crm-list">
              {clubs.map((c) => (
                <li key={c.id} className="tp-club-crm-card">
                  <div>
                    <strong>{c.name}</strong>
                    <div className="muted small">
                      {c.sportType} · {c.location}
                    </div>
                    <div className="muted small">
                      Plan: {c.subscriptionPlan} · You: {c.myRole}
                    </div>
                  </div>
                  <span className="tp-club-crm-id">#{c.id}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="muted small">
            API: <code>/api/v1/club-crm/clubs</code> — booking and open matches stay on their own
            routes.
          </p>
        </>
      )}
    </div>
  )
}
