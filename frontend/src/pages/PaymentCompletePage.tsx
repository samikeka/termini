import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { paymentMockComplete } from '../api/terminiApi'
import { BookingWizardStepper } from '../components/BookingWizardStepper'
import { useSession } from '../context/SessionContext'

const GUEST_CHECKOUT_EMAIL_KEY = 'termini_guest_checkout_email'

export function PaymentCompletePage() {
  const [params] = useSearchParams()
  const paymentId = Number(params.get('paymentId'))
  const { isAuthenticated } = useSession()
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!Number.isFinite(paymentId)) {
      setStatus('err')
      setMessage('Missing or invalid payment reference.')
      return
    }
    const guestEmail = sessionStorage.getItem(GUEST_CHECKOUT_EMAIL_KEY)?.trim()
    if (!isAuthenticated && !guestEmail) {
      setStatus('err')
      setMessage('For guest checkout, use the same email as on the booking (or log in).')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        await paymentMockComplete(
          paymentId,
          !isAuthenticated && guestEmail ? guestEmail : undefined,
        )
        if (!cancelled) {
          sessionStorage.removeItem(GUEST_CHECKOUT_EMAIL_KEY)
          setStatus('ok')
          setMessage('Payment recorded successfully (demo). Your booking is confirmed.')
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof ApiError && e.status === 409) {
            sessionStorage.removeItem(GUEST_CHECKOUT_EMAIL_KEY)
            setStatus('ok')
            setMessage('Booking was already confirmed or did not require payment.')
            return
          }
          setStatus('err')
          setMessage(e instanceof ApiError ? e.message : 'Confirmation failed')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, paymentId])

  return (
    <div className="page narrow tp-payment-page">
      <BookingWizardStepper current={status === 'ok' ? 5 : 4} />

      {status === 'idle' && (
        <div className="tp-payment-done">
          <p className="muted">Processing your payment…</p>
        </div>
      )}

      {status === 'ok' && (
        <div className="tp-payment-done">
          <div className="tp-payment-done-icon" aria-hidden>
            ✓
          </div>
          <h1>Booking confirmed!</h1>
          <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
            {message}
          </p>
          <div className="tp-payment-done-actions">
            <Link to="/bookings" className="tp-btn-primary">
              View my booking
            </Link>
            <Link to="/" className="tp-btn-ghost">
              Back to home
            </Link>
          </div>
        </div>
      )}

      {status === 'err' && (
        <div className="tp-payment-done">
          <div
            className="tp-payment-done-icon"
            style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              boxShadow: '0 8px 28px rgba(220, 38, 38, 0.2)',
              color: '#b91c1c',
            }}
            aria-hidden
          >
            !
          </div>
          <h1>Something went wrong</h1>
          <p className="alert alert-error" style={{ textAlign: 'left' }}>
            {message}
          </p>
          <div className="tp-payment-done-actions">
            <Link to="/fields" className="tp-btn-primary">
              Browse venues
            </Link>
            <Link to="/" className="tp-btn-ghost">
              Home
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
