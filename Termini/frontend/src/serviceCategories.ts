import type { FieldDto, ServiceCategory } from './types'

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'SPORTS',
  'BEAUTY',
  'HEALTH',
  'AUTO',
  'EDUCATION',
  'PROFESSIONAL',
  'OTHER',
]

export type CategoryMeta = {
  id: ServiceCategory
  label: string
  labelSq: string
  hint: string
  hostPitch: string
  /** CSS modifier for card accent */
  accent: string
}

export const CATEGORY_META: Record<ServiceCategory, CategoryMeta> = {
  SPORTS: {
    id: 'SPORTS',
    label: 'Sports',
    labelSq: 'Sport',
    hint: 'Fields, courts, pitches',
    hostPitch: 'List your pitch or court',
    accent: 'sports',
  },
  BEAUTY: {
    id: 'BEAUTY',
    label: 'Beauty',
    labelSq: 'Bukuri',
    hint: 'Barber, salon, nails',
    hostPitch: 'Salon, barber, or studio',
    accent: 'beauty',
  },
  HEALTH: {
    id: 'HEALTH',
    label: 'Health',
    labelSq: 'Shëndet',
    hint: 'Clinic, physio, dental',
    hostPitch: 'Clinic or practice',
    accent: 'health',
  },
  AUTO: {
    id: 'AUTO',
    label: 'Auto',
    labelSq: 'Auto',
    hint: 'Car wash, service, tyres',
    hostPitch: 'Garage or car wash',
    accent: 'auto',
  },
  EDUCATION: {
    id: 'EDUCATION',
    label: 'Education',
    labelSq: 'Edukim',
    hint: 'Tutoring, courses, driving school',
    hostPitch: 'Course or tutoring space',
    accent: 'education',
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    label: 'Professional',
    labelSq: 'Profesionale',
    hint: 'Legal, accounting, consulting',
    hostPitch: 'Office or consultation',
    accent: 'professional',
  },
  OTHER: {
    id: 'OTHER',
    label: 'Other',
    labelSq: 'Tjetër',
    hint: 'Any bookable service',
    hostPitch: 'Your bookable location',
    accent: 'other',
  },
}

export function parseServiceCategory(raw: string | null | undefined): ServiceCategory | '' {
  const u = raw?.trim().toUpperCase()
  if (!u) return ''
  return SERVICE_CATEGORIES.includes(u as ServiceCategory) ? (u as ServiceCategory) : ''
}

export function categoryMeta(cat?: ServiceCategory | null): CategoryMeta {
  if (cat && CATEGORY_META[cat]) return CATEGORY_META[cat]
  return CATEGORY_META.OTHER
}

export function categoryLabelSq(cat?: ServiceCategory | null): string {
  return categoryMeta(cat).labelSq
}

export function isSportsCategory(cat?: ServiceCategory | '' | null): boolean {
  return cat === 'SPORTS'
}

export function priceUnitLabel(cat?: ServiceCategory | null): string {
  if (cat === 'SPORTS' || cat === 'AUTO') return '/orë'
  if (cat === 'BEAUTY' || cat === 'HEALTH') return '/seancë'
  return '/takim'
}

export function listVenuesLabel(cat?: ServiceCategory | null): string {
  if (cat === 'SPORTS') return 'Fushat'
  if (!cat) return 'Lokacionet'
  return categoryMeta(cat).labelSq
}

export function discoveryTitle(cat?: ServiceCategory | null): string {
  if (!cat) return 'Gjej dhe rezervo shërbimin'
  if (cat === 'SPORTS') return 'Gjej fushën perfekte'
  return `Rezervo — ${categoryMeta(cat).labelSq}`
}

export function discoverySubtitle(cat?: ServiceCategory | null): string {
  if (!cat) {
    return 'Sport, bukuri, shëndet, auto, edukim dhe shërbime profesionale — me orare të lira në kohë reale.'
  }
  return categoryMeta(cat).hint + ' — zgjidh datën dhe orën, pastaj rezervo online.'
}

export function fieldsSearchUrl(
  opts?: {
    category?: ServiceCategory | ''
    country?: string
    city?: string
    sport?: string
    date?: string
    time?: string
    q?: string
  },
): string {
  const p = new URLSearchParams()
  if (opts?.category) p.set('category', opts.category)
  if (opts?.country) p.set('country', opts.country)
  if (opts?.city?.trim()) p.set('city', opts.city.trim())
  if (opts?.sport) p.set('sport', opts.sport)
  if (opts?.date) p.set('date', opts.date)
  if (opts?.time) p.set('time', opts.time)
  if (opts?.q?.trim()) p.set('q', opts.q.trim())
  const qs = p.toString()
  return `/fields${qs ? `?${qs}` : ''}`
}

/** Një lokacion për kategori për “featured” në ballinë. */
export function pickFeaturedByCategory(all: FieldDto[], limit = 9): FieldDto[] {
  const byCat = new Map<ServiceCategory, FieldDto[]>()
  for (const f of all) {
    const c = f.category ?? 'OTHER'
    if (!byCat.has(c)) byCat.set(c, [])
    byCat.get(c)!.push(f)
  }
  const order: ServiceCategory[] = [
    'SPORTS',
    'BEAUTY',
    'HEALTH',
    'AUTO',
    'EDUCATION',
    'PROFESSIONAL',
    'OTHER',
  ]
  const out: FieldDto[] = []
  const seen = new Set<number>()
  for (let round = 0; round < 20 && out.length < limit; round++) {
    for (const cat of order) {
      const list = byCat.get(cat)
      const f = list?.[round]
      if (f && !seen.has(f.id)) {
        seen.add(f.id)
        out.push(f)
        if (out.length >= limit) return out
      }
    }
  }
  for (const f of all) {
    if (out.length >= limit) break
    if (!seen.has(f.id)) out.push(f)
  }
  return out
}
