import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { OwnerLayout } from './components/OwnerLayout'
import { ClubCrmPage } from './pages/ClubCrmPage'
import { FieldDetailPage } from './pages/FieldDetailPage'
import { FieldsPage } from './pages/FieldsPage'
import { PublicOutdoorFieldsPage } from './pages/PublicOutdoorFieldsPage'
import { PublicOutdoorFieldDetailPage } from './pages/PublicOutdoorFieldDetailPage'
import { HomePage } from './pages/HomePage'
import { ManageBookingsPage } from './pages/ManageBookingsPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { LoginPage } from './pages/LoginPage'
import { OpenMatchesPage } from './pages/OpenMatchesPage'
import { PaymentCompletePage } from './pages/PaymentCompletePage'
import { OwnerFieldPage } from './pages/OwnerFieldPage'
import { OwnerInboxPage } from './pages/OwnerInboxPage'
import { OwnerLoginPage } from './pages/OwnerLoginPage'
import { OwnerRegisterPage } from './pages/OwnerRegisterPage'
import { OwnerBankPage } from './pages/owner/OwnerBankPage'
import { OwnerBookingDetailPage } from './pages/owner/OwnerBookingDetailPage'
import { OwnerBookingsPage } from './pages/owner/OwnerBookingsPage'
import { OwnerCalendarPage } from './pages/owner/OwnerCalendarPage'
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage'
import { OwnerFieldsPage } from './pages/owner/OwnerFieldsPage'
import { OwnerPlaceholderPage } from './pages/owner/OwnerPlaceholderPage'
import { OwnerPricesHubPage } from './pages/owner/OwnerPricesHubPage'
import { OwnerPricesSlotsPage } from './pages/owner/OwnerPricesSlotsPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="owner/login" element={<OwnerLoginPage />} />
      <Route path="owner/register" element={<OwnerRegisterPage />} />
      <Route path="owner" element={<OwnerLayout />}>
        <Route index element={<OwnerDashboardPage />} />
        <Route path="bookings/:appointmentId" element={<OwnerBookingDetailPage />} />
        <Route path="bookings" element={<OwnerBookingsPage />} />
        <Route path="calendar" element={<OwnerCalendarPage />} />
        <Route path="fields/:fieldId/prices" element={<OwnerPricesSlotsPage />} />
        <Route path="fields/:fieldId" element={<OwnerFieldPage />} />
        <Route path="fields" element={<OwnerFieldsPage />} />
        <Route path="notifications" element={<OwnerInboxPage />} />
        <Route path="bank" element={<OwnerBankPage />} />
        <Route path="prices" element={<OwnerPricesHubPage />} />
        <Route path="payments" element={<OwnerPlaceholderPage title="Payments" />} />
        <Route path="reviews" element={<OwnerPlaceholderPage title="Reviews" />} />
        <Route path="settings" element={<OwnerPlaceholderPage title="Settings" />} />
      </Route>

      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="bookings" element={<ManageBookingsPage />} />
        <Route path="club-crm" element={<ClubCrmPage />} />
        <Route path="fields" element={<FieldsPage />} />
        <Route path="fusha-publike" element={<PublicOutdoorFieldsPage />} />
        <Route path="fusha-publike/:fieldId" element={<PublicOutdoorFieldDetailPage />} />
        <Route path="fields/:fieldId" element={<FieldDetailPage />} />
        <Route path="matches" element={<OpenMatchesPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="payment/complete" element={<PaymentCompletePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
