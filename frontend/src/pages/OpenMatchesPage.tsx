import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { BookingWizardStepper } from '../components/BookingWizardStepper'
import { fetchMatchParticipants, fetchOpenMatches, joinMatch } from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
import type { MatchParticipantBriefDto, OpenMatchDto } from '../types'

function formatTime(t: string) {
  return t?.length >= 5 ? t.slice(0, 5) : t
}

function formatJoinedAt(iso: string | null | undefined) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('sq-AL', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function OpenMatchesPage() {
  const { isAuthenticated } = useSession()
  const [matches, setMatches] = useState<OpenMatchDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [participantsByAppt, setParticipantsByAppt] = useState<
    Record<number, MatchParticipantBriefDto[] | 'loading' | 'error'>
  >({})

  const load = () => {
    setLoading(true)
    setError(null)
    fetchOpenMatches()
      .then(setMatches)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'Gabim në ndeshjet e hapura'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function onJoin(m: OpenMatchDto) {
    if (!isAuthenticated) {
      setError('Hyr në llogari për t’u bashkuar.')
      return
    }
    setInfo(null)
    setError(null)
    try {
      const res = await joinMatch(m.appointmentId)
      const share =
        res.shareAmount != null ? ` Pjesa jote: ${res.shareAmount} €.` : ''
      setInfo(`U bashkove në ndeshjen #${m.appointmentId}.${share}`)
      setExpandedId(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Join dështoi')
    }
  }

  async function toggleParticipants(appointmentId: number) {
    if (!isAuthenticated) {
      setError('Hyr për të parë listën e lojtarëve.')
      return
    }
    if (expandedId === appointmentId) {
      setExpandedId(null)
      return
    }
    setExpandedId(appointmentId)
    const cached = participantsByAppt[appointmentId]
    if (Array.isArray(cached)) {
      return
    }
    setParticipantsByAppt((prev) => ({ ...prev, [appointmentId]: 'loading' }))
    try {
      const rows = await fetchMatchParticipants(appointmentId)
      setParticipantsByAppt((prev) => ({ ...prev, [appointmentId]: rows }))
    } catch {
      setParticipantsByAppt((prev) => ({ ...prev, [appointmentId]: 'error' }))
    }
  }

  return (
    <div className="page tp-open-matches">
      <BookingWizardStepper current={1} compact />
      <div className="tp-open-matches-hero page-head">
        <div>
          <h1>Open games near you</h1>
          <p>Join matches that need more players — same flow as booking, built for teams.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>
      {!isAuthenticated && (
        <p className="alert alert-error">
          <Link to="/login">Log in</Link> to use “Join game” and see the player list.
        </p>
      )}

      {info && <p className="alert alert-success">{info}</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : matches.length === 0 ? (
        <p className="muted">No open games right now. Check back later or book a field and publish an open match.</p>
      ) : (
        <ul className="match-list">
          {matches.map((m) => (
            <li key={m.appointmentId} className="card match-card match-card--stack tp-match-card-pro">
              <div className="match-card-row">
                <div>
                  <h3>
                    {m.fieldName}
                    <span className="badge">{m.fieldCity}</span>
                  </h3>
                  <p className="muted">
                    {m.dateAppointment} · {formatTime(m.timeAppointment)}
                  </p>
                  {m.gameRequestId != null && (
                    <p className="muted small">Game request #{m.gameRequestId}</p>
                  )}
                  <p>
                    Duhen <strong>{m.playersNeeded}</strong> lojtarë · bashkuar{' '}
                    <strong>{m.joinedCount}</strong> · mbeten{' '}
                    <strong>{m.spotsRemaining}</strong>
                  </p>
                  {m.splitPerPlayer != null && (
                    <p className="split-hint">
                      Split: <strong>{m.splitPerPlayer} €</strong> për lojtar
                    </p>
                  )}
                </div>
                <div className="match-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => toggleParticipants(m.appointmentId)}
                  >
                    {expandedId === m.appointmentId ? 'Fshih lojtarët' : 'Lojtarët'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!isAuthenticated || m.spotsRemaining <= 0}
                    onClick={() => onJoin(m)}
                  >
                    Join match
                  </button>
                </div>
              </div>
              {expandedId === m.appointmentId && (
                <div className="match-participants">
                  {!isAuthenticated ? (
                    <p className="muted small">
                      <Link to="/login">Hyr</Link> për listën e lojtarëve që janë bashkuar.
                    </p>
                  ) : participantsByAppt[m.appointmentId] === 'loading' ? (
                    <p className="muted small">Duke ngarkuar…</p>
                  ) : participantsByAppt[m.appointmentId] === 'error' ? (
                    <p className="alert alert-error small">Nuk u lexua lista.</p>
                  ) : Array.isArray(participantsByAppt[m.appointmentId]) &&
                    (participantsByAppt[m.appointmentId] as MatchParticipantBriefDto[]).length ===
                      0 ? (
                    <p className="muted small">Ende askush s’ është bashkuar si “filler”.</p>
                  ) : (
                    <ul className="match-participant-ul">
                      {(participantsByAppt[m.appointmentId] as MatchParticipantBriefDto[]).map(
                        (p) => (
                          <li key={`${p.userId}-${String(p.joinedAt)}`}>
                            <strong>{p.displayName ?? `User #${p.userId}`}</strong>
                            {p.shareAmount != null && (
                              <span className="muted small"> · {String(p.shareAmount)} €</span>
                            )}
                            {p.joinedAt != null && (
                              <div className="muted small">{formatJoinedAt(String(p.joinedAt))}</div>
                            )}
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
