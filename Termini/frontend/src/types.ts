export type CountryRegion = 'KOSOVO' | 'ALBANIA' | 'NORTH_MACEDONIA'

export type ServiceCategory =
  | 'SPORTS'
  | 'BEAUTY'
  | 'HEALTH'
  | 'AUTO'
  | 'EDUCATION'
  | 'PROFESSIONAL'
  | 'OTHER'

export type UserRef = { id?: number; name?: string; city?: string; email?: string }

export type FieldDto = {
  id: number
  name: string
  location: string
  city: string
  coverImageUrl?: string | null
  country?: CountryRegion
  hourlyPriceEur?: number | string | null
  category?: ServiceCategory | null
  defaultDurationMinutes?: number | null
  slotCalendarMinutes?: number | null
  fieldOwner?: UserRef | null
}

export type Appointment = {
  appointmentId: number
  fieldLocation?: { id: number; name?: string } | null
  dateAppointment: string
  timeAppointment: string
  timeReservedField?: number
  durationMinutes?: number | null
  booker?: { id: number } | null
  guestName?: string | null
  guestEmail?: string | null
  seekingPlayers?: boolean
  playersNeeded?: number | null
  totalFieldPrice?: string | null
  splitPaymentEnabled?: boolean
  splitAmongPlayerCount?: number | null
  organizer?: UserRef | null
}

export type OpenMatchDto = {
  appointmentId: number
  gameRequestId?: number | null
  fieldId: number
  fieldName: string
  fieldCity: string
  dateAppointment: string
  timeAppointment: string
  timeReservedField?: number
  playersNeeded: number
  joinedCount: number
  spotsRemaining: number
  splitPerPlayer: string | number | null
}

export type JoinMatchResultDto = {
  appointmentId: number
  userId: number
  shareAmount: string | number | null
  joinedCount: number
  spotsRemaining: number
}

export type UserRole = 'USER' | 'FIELD_OWNER' | 'ADMIN'

export type UserDto = {
  id: number
  name: string
  city: string
  email: string
  role?: UserRole | string | null
  ownerIban?: string | null
  ownerAccountHolder?: string | null
  goals?: number
  assists?: number
  mvpCount?: number
}

export type AuthResponse = {
  token: string
  user: UserDto
}

export type PaymentCheckoutResponse = {
  paymentId: number
  redirectUrl: string
  amount: number | string
  currency: string
  provider: string
  mockPayoutNote?: string | null
}

export type ServiceOfferDto = {
  id: number
  name: string
  durationMinutes: number
  priceEur: number | string
}

export type SlotAvailability = 'FREE' | 'RESERVED' | 'IN_PROGRESS'

export type SlotDto = {
  hour: number
  minute?: number
  busy: boolean
  availability?: SlotAvailability
}

export type DayCalendarDto = { date: string; slots: SlotDto[] }

export type MonthCalendarDto = {
  fieldId: number
  year: number
  month: number
  days: DayCalendarDto[]
}

/** Termin siç kthehet për panelin e pronarit (AppointmentDto nga API) */
export type OwnerAppointmentDto = {
  appointmentId: number
  fieldId: number
  fieldName?: string | null
  bookerUserId?: number | null
  bookerName?: string | null
  bookerEmail?: string | null
  guestName?: string | null
  guestEmail?: string | null
  dateAppointment: string
  timeAppointment: string
  timeReservedField?: number
  durationMinutes?: number | null
  seekingPlayers?: boolean
  playersNeeded?: number | null
}

export type MatchParticipantBriefDto = {
  userId: number
  displayName?: string | null
  shareAmount?: string | number | null
  joinedAt?: string | null
}

/** GET /api/v1/admin/summary */
export type AdminSummaryDto = {
  users: number
  fields: number
  appointments: number
  companies: number
  gameRequests: number
  recurringTemplates: number
}

export type OwnerNotificationDto = {
  id: number
  appointmentId: number | null
  type: string
  message: string
  read: boolean
  createdAt: string
}

/** Club CRM — separate from public booking (Phase 1) */
export type ClubMemberRole = 'OWNER' | 'MANAGER' | 'COACH' | 'PLAYER'
export type ClubMemberStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'LEFT'

export type ClubCrmDto = {
  id: number
  name: string
  logoUrl?: string | null
  sportType: string
  ownerUserId: number
  location: string
  subscriptionPlan: string
  createdAt: string
  myRole: ClubMemberRole
  myStatus: ClubMemberStatus
}

export type CreateClubCrmRequest = {
  name: string
  logoUrl?: string
  sportType: string
  location: string
  subscriptionPlan?: string
}
