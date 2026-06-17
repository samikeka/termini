import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { fetchAdminSummary } from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
import type { AdminSummaryDto } from '../types'

export function AdminDashboardPage() {
  const { isAuthenticated, user } = useSession()
  const [summary, setSummary] = useState<AdminSummaryDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return
    setLoading(true)
    setError(null)
    fetchAdminSummary()
      .then(setSummary)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'S’u lexua përmbledhja e platformës'),
      )
      .finally(() => setLoading(false))
  }, [isAuthenticated, isAdmin])

  if (!isAuthenticated) {
    return (
      <div className="page narrow">
        <p className="alert alert-info">
          <Link to="/login">Hyr</Link> si administrator.
        </p>
        <p className="muted small">Demo: admin@termini.demo / terminiadmin123</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="page narrow">
        <p className="alert alert-error">Kjo faqe është vetëm për llogari ADMIN.</p>
        <Link to="/">Kreu</Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Paneli platformës (admin)</h1>
      <p className="muted">Përmbledhje leximi — GET /api/v1/admin/summary</p>
      {error && <p className="alert alert-error">{error}</p>}
      {loading ? (
        <p className="muted">Duke ngarkuar…</p>
      ) : summary ? (
        <div className="card form-card" style={{ maxWidth: 480 }}>
          <ul className="admin-summary-list">
            <li>
              <span>Përdorues</span> <strong>{summary.users}</strong>
            </li>
            <li>
              <span>Shërbime / fusha</span> <strong>{summary.fields}</strong>
            </li>
            <li>
              <span>Termine</span> <strong>{summary.appointments}</strong>
            </li>
            <li>
              <span>Kompani (B2B)</span> <strong>{summary.companies}</strong>
            </li>
            <li>
              <span>Kërkesa lojërash</span> <strong>{summary.gameRequests}</strong>
            </li>
            <li>
              <span>Recurring (šablone)</span>{' '}
              <strong>{summary.recurringTemplates}</strong>
            </li>
          </ul>
        </div>
      ) : (
        <p className="muted">Pa të dhëna.</p>
      )}
    </div>
  )
}
