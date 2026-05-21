import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { fetchLeaderboard, patchUserStats } from '../api/terminiApi'
import { useSession } from '../context/SessionContext'
import type { UserDto } from '../types'

export function LeaderboardPage() {
  const { user, isAuthenticated } = useSession()
  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const [g, setG] = useState(0)
  const [a, setA] = useState(0)
  const [mvp, setMvp] = useState(0)

  const load = () => {
    setLoading(true)
    setError(null)
    fetchLeaderboard(30)
      .then(setUsers)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : 'Gabim në leaderboard'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function saveStats(id: number) {
    setError(null)
    try {
      await patchUserStats(id, {
        goalsDelta: g,
        assistsDelta: a,
        mvpDelta: mvp,
      })
      setOpenId(null)
      setG(0)
      setA(0)
      setMvp(0)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'PATCH stats dështoi')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Leaderboard</h1>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Rifresko
        </button>
      </div>
      {!isAuthenticated && (
        <p className="muted">
          <Link to="/login">Hyr</Link> për të përditësuar vetëm statistikat e
          llogarisë sate.
        </p>
      )}
      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <p className="muted">Duke ngarkuar…</p>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Lojtari</th>
                <th>Qyteti</th>
                <th>Gola</th>
                <th>Asistime</th>
                <th>MVP</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{u.name}</strong>
                    <div className="muted small">{u.email}</div>
                  </td>
                  <td>{u.city}</td>
                  <td>{u.goals ?? 0}</td>
                  <td>{u.assists ?? 0}</td>
                  <td>{u.mvpCount ?? 0}</td>
                  <td>
                    {isAuthenticated &&
                    user &&
                    user.id === u.id &&
                    openId === u.id ? (
                      <div className="inline-stats">
                        <input
                          type="number"
                          title="Gola +"
                          value={g}
                          onChange={(e) => setG(Number(e.target.value))}
                        />
                        <input
                          type="number"
                          title="Asistime +"
                          value={a}
                          onChange={(e) => setA(Number(e.target.value))}
                        />
                        <input
                          type="number"
                          title="MVP +"
                          value={mvp}
                          onChange={(e) => setMvp(Number(e.target.value))}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => saveStats(u.id)}
                        >
                          Ruaj
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => setOpenId(null)}
                        >
                          ×
                        </button>
                      </div>
                    ) : isAuthenticated && user && user.id === u.id ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => setOpenId(u.id)}
                      >
                        + stats
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
