import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingWizardStepper } from '../components/BookingWizardStepper'
import { useSession } from '../context/SessionContext'

export function ManageBookingsPage() {
  const { isAuthenticated } = useSession()
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')

  return (
    <div className="page pf-page pf-bookings-pro">
      <BookingWizardStepper current={1} compact />
      <h1 className="pf-bookings-title">My bookings</h1>
      <p className="pf-lede">
        Bookings are tied to each venue. Open a venue to pay, change slots, or publish an open game.
      </p>

      <div className="pf-bookings-tabs" role="tablist" aria-label="Booking period">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'upcoming'}
          className={'pf-bookings-tab' + (tab === 'upcoming' ? ' pf-bookings-tab--active' : '')}
          onClick={() => setTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'past'}
          className={'pf-bookings-tab' + (tab === 'past' ? ' pf-bookings-tab--active' : '')}
          onClick={() => setTab('past')}
        >
          Past
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'cancelled'}
          className={'pf-bookings-tab' + (tab === 'cancelled' ? ' pf-bookings-tab--active' : '')}
          onClick={() => setTab('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {!isAuthenticated && (
        <p className="alert alert-info">
          <Link to="/login">Log in</Link> to see your bookings, or browse{' '}
          <Link to="/fields">venues</Link> first.
        </p>
      )}

      {isAuthenticated && (
        <p className="muted small pf-bookings-hint">
          {tab === 'upcoming' && 'Upcoming games appear on each venue page after you book.'}
          {tab === 'past' && 'Past sessions history will be linked here in a future update.'}
          {tab === 'cancelled' && 'Cancelled bookings will be listed here in a future update.'}
        </p>
      )}

      <div className="pf-card-row">
        <Link className="pf-tile" to="/fields">
          <strong>Search fields</strong>
          <span className="muted">Browse availability</span>
        </Link>
        <Link className="pf-tile" to="/matches">
          <strong>Open games</strong>
          <span className="muted">Join other players</span>
        </Link>
      </div>
    </div>
  )
}
