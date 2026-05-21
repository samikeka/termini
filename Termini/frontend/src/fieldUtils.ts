import type { FieldDto } from './types'

/** Fushë pa tarifë orë — rezervim vetëm për orar, jo pagesë online. */
export function isFreePublicField(f: FieldDto): boolean {
  const h = f.hourlyPriceEur
  const n = typeof h === 'string' ? parseFloat(h) : Number(h ?? NaN)
  return h == null || !Number.isFinite(n) || n <= 0
}

/** Fusha publike outdoor në Kosovë (seed: "Fushë publike outdoor — …"). */
export function isPublicOutdoorField(f: FieldDto): boolean {
  if (!isFreePublicField(f)) return false
  if (f.country !== 'KOSOVO') return false
  const name = (f.name ?? '').toLowerCase()
  return name.includes('publike outdoor') || name.includes('fushë publike outdoor')
}

/** Fushë me tarifë orë — rezervim me pagesë në platformë. */
export function isPaidBookableField(f: FieldDto): boolean {
  return !isPublicOutdoorField(f)
}

/** Emri i zonës nga titulli seed, p.sh. "Germia" nga "Fushë publike outdoor — Germia (Prishtinë)". */
export function publicOutdoorAreaLabel(f: FieldDto): string | null {
  const name = f.name ?? ''
  const m = name.match(/Fushë publike outdoor — (.+?) \(/i)
  if (m?.[1]) return m[1]
  const m2 = name.match(/Fushë publike outdoor — (.+)/i)
  return m2?.[1]?.trim() ?? null
}
