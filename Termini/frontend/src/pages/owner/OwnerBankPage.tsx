import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import { fetchOwnerPayoutProfile, patchOwnerPayoutProfile } from '../../api/terminiApi'

export function OwnerBankPage() {
  const [holder, setHolder] = useState('')
  const [bankName, setBankName] = useState('')
  const [iban, setIban] = useState('')
  const [swift, setSwift] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchOwnerPayoutProfile()
      .then((p) => {
        setIban(p.ownerIban ?? '')
        setHolder(p.ownerAccountHolder ?? '')
      })
      .catch(() => {
        setIban('')
        setHolder('')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setMsg(null)
    try {
      await patchOwnerPayoutProfile({
        ownerIban: iban.trim(),
        ownerAccountHolder: holder.trim(),
      })
      setMsg('Payout profile saved.')
      load()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="owner-panel owner-panel--split">
      <div>
        <h1 className="owner-page-title">Bank details</h1>
        <p className="owner-page-lede muted">
          Payout information for transfers to your account (demo: IBAN + holder stored on
          profile).
        </p>

        {error && <p className="alert alert-error">{error}</p>}
        {msg && <p className="alert alert-success">{msg}</p>}

        <form className="owner-form-card" onSubmit={onSave}>
          <label className="owner-label">
            Account holder name
            <input value={holder} onChange={(e) => setHolder(e.target.value)} required />
          </label>
          <label className="owner-label">
            Bank name
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Raiffeisen Bank"
            />
          </label>
          <label className="owner-label">
            IBAN
            <input
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              required
              minLength={15}
              maxLength={34}
            />
          </label>
          <label className="owner-label">
            SWIFT / BIC
            <input value={swift} onChange={(e) => setSwift(e.target.value)} placeholder="Optional" />
          </label>
          <button type="submit" className="owner-btn-primary owner-btn-wide" disabled={busy}>
            Save changes
          </button>
        </form>
      </div>

      <aside className="owner-aside-cards">
        <div className="owner-aside-card">
          <h3>Payout method</h3>
          <p className="muted">Bank transfer to the IBAN you provide.</p>
        </div>
        <div className="owner-aside-card">
          <h3>Payout schedule</h3>
          <p className="muted">In production, payouts would follow your PSP schedule (e.g. weekly).</p>
        </div>
      </aside>
    </div>
  )
}
