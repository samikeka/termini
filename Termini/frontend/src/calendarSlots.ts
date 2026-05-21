import type { FieldDto, ServiceOfferDto, SlotAvailability, SlotDto } from './types'

export function slotSortMinutes(s: SlotDto): number {
  return s.hour * 60 + (s.minute ?? 0)
}

/** Slot i bllokuar nga API (busy ose availability jo FREE). */
export function isSlotBlocked(s: SlotDto): boolean {
  if (s.busy) return true
  return s.availability != null && s.availability !== 'FREE'
}

export function slotLabel(s: { hour: number; minute?: number }): string {
  const h = s.hour
  const m = s.minute ?? 0
  return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}`
}

/** Rendit dhe bashko slotet e përsëritura; ruaj zënien nga busy + availability. */
export function normalizeDaySlots(slots: SlotDto[]): SlotDto[] {
  const byMin = new Map<number, SlotDto>()
  for (const s of slots) {
    const min = slotSortMinutes(s)
    const prev = byMin.get(min)
    if (!prev) {
      byMin.set(min, { ...s, busy: isSlotBlocked(s) })
      continue
    }
    const blocked = isSlotBlocked(prev) || isSlotBlocked(s)
    const av = mergeAvailability(prev.availability, s.availability)
    byMin.set(min, { ...prev, ...s, busy: blocked, availability: av })
  }
  return Array.from(byMin.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v)
}

function mergeAvailability(
  a?: SlotAvailability,
  b?: SlotAvailability,
): SlotAvailability | undefined {
  if (a === 'IN_PROGRESS' || b === 'IN_PROGRESS') return 'IN_PROGRESS'
  if (a === 'RESERVED' || b === 'RESERVED') return 'RESERVED'
  if (a === 'FREE' || b === 'FREE') return a ?? b
  return a ?? b
}

/** Për SPORTS: seanca minimale (oferta më e shkurtër ose default i fushës). */
export function sportsMinSessionMinutes(
  field: FieldDto | null | undefined,
  offers: ServiceOfferDto[],
): number | null {
  if (field?.category !== 'SPORTS') return null
  if (offers.length > 0) {
    const m = Math.min(...offers.map((o) => o.durationMinutes))
    return m >= 15 ? m : 60
  }
  const def = field?.defaultDurationMinutes
  return def != null && def >= 15 ? def : 60
}

/**
 * Zgjat zonat e zëna deri në seancën minimale sportive kur API/DB raporton vetëm
 * fillimin (p.sh. 20:00 i zënë por 20:30 ende “i lirë” për rezervim 60-min).
 */
export function applySportsSlotOccupancy(
  slots: SlotDto[],
  sportsMinMinutes: number | null,
  gridStepMinutes: number,
): SlotDto[] {
  const sorted = normalizeDaySlots(slots)
  if (!sportsMinMinutes || sportsMinMinutes <= 0 || sorted.length === 0) {
    return sorted
  }

  const step = gridStepMinutes >= 15 ? gridStepMinutes : 30
  const mins = sorted.map(slotSortMinutes)
  const blocked = sorted.map(isSlotBlocked)
  const forceBusy = new Set<number>()

  let i = 0
  while (i < sorted.length) {
    if (!blocked[i]) {
      i++
      continue
    }
    const start = mins[i]!
    let j = i
    while (
      j + 1 < sorted.length &&
      blocked[j + 1] &&
      mins[j + 1] === mins[j]! + step
    ) {
      j++
    }
    const regionEnd = mins[j]! + step
    const regionLen = regionEnd - start
    const effectiveLen = Math.max(regionLen, sportsMinMinutes)
    for (let t = start; t < start + effectiveLen; t += step) {
      forceBusy.add(t)
    }
    i = j + 1
  }

  return sorted.map((s, idx) => {
    const m = mins[idx]!
    if (!forceBusy.has(m)) return s
    if (isSlotBlocked(s)) return { ...s, busy: true }
    return {
      ...s,
      busy: true,
      availability: 'RESERVED' as const,
    }
  })
}

export function prepareDaySlots(
  rawSlots: SlotDto[] | undefined,
  field: FieldDto | null | undefined,
  offers: ServiceOfferDto[],
): SlotDto[] {
  if (!rawSlots?.length) return []
  const grid = field?.slotCalendarMinutes ?? 60
  const sportsMin = sportsMinSessionMinutes(field, offers)
  return applySportsSlotOccupancy(rawSlots, sportsMin, grid)
}

/**
 * Orët që shfaqen për zgjedhje: për seancë 60 min nuk listojmë 09:30, 10:30 —
 * vetëm 09:00, 10:00, … (fillime të rreshtuara me kohëzgjatjen).
 */
export function filterBookingDisplaySlots(
  slots: SlotDto[],
  durationMinutes: number,
  gridStepMinutes: number,
): SlotDto[] {
  const step = gridStepMinutes >= 15 ? gridStepMinutes : 30
  const candidates = slots.filter((s) =>
    canStartBookingAt(slots, slotSortMinutes(s), durationMinutes, step),
  )
  if (durationMinutes <= step) {
    return candidates
  }
  return candidates.filter((s) => slotSortMinutes(s) % durationMinutes === 0)
}

/** A mund të fillojë rezervim me kohëzgjatjen e dhënë nga ky slot? */
export function canStartBookingAt(
  slots: SlotDto[],
  startMinutes: number,
  durationMinutes: number,
  gridStepMinutes: number,
): boolean {
  const step = gridStepMinutes >= 15 ? gridStepMinutes : 30
  const needed = Math.max(1, Math.ceil(durationMinutes / step))
  const byMin = new Map(slots.map((s) => [slotSortMinutes(s), s]))
  for (let i = 0; i < needed; i++) {
    const m = startMinutes + i * step
    const s = byMin.get(m)
    if (!s || isSlotBlocked(s)) return false
  }
  return true
}

export function firstFreeSlotLabel(slots: SlotDto[]): string | undefined {
  for (const s of slots) {
    if (!isSlotBlocked(s)) return slotLabel(s)
  }
  return undefined
}

export function countFreeSlots(slots: SlotDto[]): number {
  return slots.filter((s) => !isSlotBlocked(s)).length
}

export function minutesFromTimeLabel(label: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(label.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null
  return h * 60 + min
}

/** Slot brenda dritares [start, start + duration) të rezervimit të zgjedhur. */
export function isSlotInsideBookingWindow(
  slotMinutes: number,
  startMinutes: number,
  durationMinutes: number,
): boolean {
  return (
    slotMinutes >= startMinutes &&
    slotMinutes < startMinutes + durationMinutes
  )
}

export type SlotPickState = 'blocked' | 'free' | 'picked' | 'covered'

export function resolveSlotPickState(
  s: SlotDto,
  slots: SlotDto[],
  durationMinutes: number,
  gridStepMinutes: number,
  selectedStartMinutes: number | null,
): SlotPickState {
  const min = slotSortMinutes(s)
  if (isSlotBlocked(s)) return 'blocked'

  if (
    selectedStartMinutes != null &&
    isSlotInsideBookingWindow(min, selectedStartMinutes, durationMinutes)
  ) {
    return min === selectedStartMinutes ? 'picked' : 'covered'
  }

  if (
    !canStartBookingAt(slots, min, durationMinutes, gridStepMinutes)
  ) {
    return 'blocked'
  }

  return 'free'
}
