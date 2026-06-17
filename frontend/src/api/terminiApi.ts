import { apiJson } from './client'
import type {
  AdminSummaryDto,
  Appointment,
  AuthResponse,
  ClubCrmDto,
  CountryRegion,
  CreateClubCrmRequest,
  FieldDto,
  JoinMatchResultDto,
  MatchParticipantBriefDto,
  MonthCalendarDto,
  OpenMatchDto,
  OwnerAppointmentDto,
  OwnerNotificationDto,
  PaymentCheckoutResponse,
  ServiceOfferDto,
  UserDto,
} from '../types'

const F = '/api/v1/fields'
const PUB = '/api/v1/public/fields'
const A = '/api/appointments'
const M = '/api/v1/matches'
const AUTH = '/api/v1/auth'
const PAY = '/api/v1/payments'
const U = '/api/v1/users'
const OWNER = '/api/v1/owner'
const GAMES = '/api/v1/games'
const ADMIN = '/api/v1/admin'
const CLUB_CRM = '/api/v1/club-crm'

export function register(body: {
  name: string
  city: string
  email: string
  password: string
}): Promise<AuthResponse> {
  return apiJson<AuthResponse>(`${AUTH}/register`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function registerOwner(body: {
  name: string
  city: string
  email: string
  password: string
  ownerIban: string
  ownerAccountHolder: string
}): Promise<AuthResponse> {
  return apiJson<AuthResponse>(`${AUTH}/owner/register`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function login(body: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return apiJson<AuthResponse>(`${AUTH}/login`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchFields(params?: {
  country?: CountryRegion
  category?: string
  city?: string
}): Promise<FieldDto[]> {
  const q = new URLSearchParams()
  if (params?.country) q.set('country', params.country)
  if (params?.category) q.set('category', params.category)
  if (params?.city?.trim()) q.set('city', params.city.trim())
  const suffix = q.toString() ? `?${q.toString()}` : ''
  return apiJson<FieldDto[]>(`${F}${suffix}`)
}

export function fetchFieldById(fieldId: number): Promise<FieldDto> {
  return apiJson<FieldDto>(`${F}/${fieldId}`)
}

export function fetchFieldMonthCalendar(
  fieldId: number,
  year: number,
  month: number,
): Promise<MonthCalendarDto> {
  return apiJson<MonthCalendarDto>(
    `${PUB}/${fieldId}/calendar/month?year=${year}&month=${month}`,
  )
}

export function createField(body: {
  name: string
  location: string
  city: string
  country?: CountryRegion
  hourlyPriceEur?: number
  category?: string
  defaultDurationMinutes?: number
  slotCalendarMinutes?: number
  fieldOwner: { id: number }
}): Promise<FieldDto> {
  return apiJson<FieldDto>(F, { method: 'POST', body: JSON.stringify(body) })
}

export function fetchLeaderboard(limit = 20): Promise<UserDto[]> {
  return apiJson<UserDto[]>(`${U}/leaderboard?limit=${limit}`)
}

export function fetchFieldOffers(fieldId: number): Promise<ServiceOfferDto[]> {
  return apiJson<ServiceOfferDto[]>(`${F}/${fieldId}/offers`)
}

export function patchUserStats(
  id: number,
  body: { goalsDelta: number; assistsDelta: number; mvpDelta: number },
): Promise<UserDto> {
  return apiJson<UserDto>(`${U}/${id}/stats`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function fetchAppointmentsByField(fieldId: number): Promise<Appointment[]> {
  return apiJson<Appointment[]>(`${A}/field/${fieldId}`)
}

export function createBooking(body: {
  fieldId: number
  dateAppointment: string
  timeAppointment: string
  timeReservedField?: number
  durationMinutes?: number
  guestName?: string
  guestEmail?: string
  openJoinSlots?: number
}): Promise<Appointment> {
  return apiJson<Appointment>(A, { method: 'POST', body: JSON.stringify(body) })
}

export function seekPlayers(
  appointmentId: number,
  body: {
    playersNeeded: number
    totalFieldPrice?: number | null
    splitPaymentEnabled: boolean
    splitAmongPlayerCount?: number | null
  },
): Promise<void> {
  return apiJson<void>(`${M}/appointments/${appointmentId}/seek-players`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchOpenMatches(): Promise<OpenMatchDto[]> {
  return apiJson<OpenMatchDto[]>(`${GAMES}/open`)
}

export function fetchMatchParticipants(
  appointmentId: number,
): Promise<MatchParticipantBriefDto[]> {
  return apiJson<MatchParticipantBriefDto[]>(
    `${M}/appointments/${appointmentId}/participants`,
  )
}

export function fetchAdminSummary(): Promise<AdminSummaryDto> {
  return apiJson<AdminSummaryDto>(`${ADMIN}/summary`)
}

export function joinMatch(appointmentId: number): Promise<JoinMatchResultDto> {
  return apiJson<JoinMatchResultDto>(`${M}/appointments/${appointmentId}/join`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function splitPreview(appointmentId: number): Promise<number | string | null> {
  return apiJson<number | string | null>(
    `${M}/appointments/${appointmentId}/split-preview`,
  )
}

export function paymentCheckout(
  appointmentId: number,
  guestEmail?: string,
): Promise<PaymentCheckoutResponse> {
  return apiJson<PaymentCheckoutResponse>(`${PAY}/checkout`, {
    method: 'POST',
    body: JSON.stringify({
      appointmentId,
      ...(guestEmail ? { guestEmail } : {}),
    }),
  })
}

export function paymentMockComplete(
  paymentId: number,
  guestEmail?: string,
): Promise<void> {
  return apiJson<void>(`${PAY}/mock/complete/${paymentId}`, {
    method: 'POST',
    body: JSON.stringify(guestEmail ? { guestEmail } : {}),
  })
}

export function fetchOwnerFields(): Promise<FieldDto[]> {
  return apiJson<FieldDto[]>(`${OWNER}/fields`)
}

export function fetchOwnerFieldAppointments(
  fieldId: number,
): Promise<OwnerAppointmentDto[]> {
  return apiJson<OwnerAppointmentDto[]>(
    `${OWNER}/fields/${fieldId}/appointments`,
  )
}

export function fetchOwnerFieldNotifications(
  fieldId: number,
  unreadOnly = false,
): Promise<OwnerNotificationDto[]> {
  const q = unreadOnly ? '?unreadOnly=true' : ''
  return apiJson<OwnerNotificationDto[]>(
    `${OWNER}/fields/${fieldId}/notifications${q}`,
  )
}

export function fetchOwnerAppointments(): Promise<OwnerAppointmentDto[]> {
  return apiJson<OwnerAppointmentDto[]>(`${OWNER}/appointments`)
}

export function cancelOwnerAppointment(appointmentId: number): Promise<void> {
  return apiJson<void>(`${OWNER}/appointments/${appointmentId}`, {
    method: 'DELETE',
  })
}

export function fetchOwnerNotifications(unreadOnly = false): Promise<OwnerNotificationDto[]> {
  const q = unreadOnly ? '?unreadOnly=true' : ''
  return apiJson<OwnerNotificationDto[]>(`${OWNER}/notifications${q}`)
}

export function fetchOwnerUnreadCount(): Promise<{ count: number }> {
  return apiJson<{ count: number }>(`${OWNER}/notifications/unread-count`)
}

export function markOwnerNotificationRead(id: number): Promise<void> {
  return apiJson<void>(`${OWNER}/notifications/${id}/read`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  })
}

export function markAllOwnerNotificationsRead(): Promise<{ updated: number }> {
  return apiJson<{ updated: number }>(`${OWNER}/notifications/read-all`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function fetchOwnerPayoutProfile(): Promise<{
  ownerIban: string | null
  ownerAccountHolder: string | null
}> {
  return apiJson(`${OWNER}/payout-profile`)
}

export function patchOwnerPayoutProfile(body: {
  ownerIban: string
  ownerAccountHolder: string
}): Promise<UserDto> {
  return apiJson<UserDto>(`${OWNER}/payout-profile`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/** Club Management CRM (authenticated) */
export function fetchMyClubsCrm(): Promise<ClubCrmDto[]> {
  return apiJson<ClubCrmDto[]>(`${CLUB_CRM}/clubs/mine`)
}

export function fetchClubCrm(clubId: number): Promise<ClubCrmDto> {
  return apiJson<ClubCrmDto>(`${CLUB_CRM}/clubs/${clubId}`)
}

export function createClubCrm(body: CreateClubCrmRequest): Promise<ClubCrmDto> {
  return apiJson<ClubCrmDto>(`${CLUB_CRM}/clubs`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
