import type { FieldDto } from './types'

export type InferredSportCategory = 'futbol' | 'basket' | 'tenis' | 'volej' | 'hend' | 'padel'

/** Përafërim i llojit të sportit nga emri/lokacioni (pa fushë të veçantë në DB). */
export function inferSportCategory(f: FieldDto): InferredSportCategory {
  const t = `${f.name} ${f.location} ${f.city ?? ''}`.toLowerCase()
  if (/\bbasket|basketboll|nba\b/.test(t)) return 'basket'
  if (/tenis|tennis/.test(t)) return 'tenis'
  if (/volej|volley|voley/.test(t)) return 'volej'
  if (/hend|handball|hand ball/.test(t)) return 'hend'
  if (/padel|padle/.test(t)) return 'padel'
  return 'futbol'
}

/** Zgjidh deri në `limit` fusha me përpjekje për diversitet sipas kategorisë së deduktuar. */
export function pickDiverseSportFields(all: FieldDto[], limit: number): FieldDto[] {
  const byCat: Partial<Record<InferredSportCategory, FieldDto[]>> = {}
  for (const f of all) {
    const c = inferSportCategory(f)
    if (!byCat[c]) byCat[c] = []
    byCat[c]!.push(f)
  }
  const order: InferredSportCategory[] = [
    'futbol',
    'basket',
    'tenis',
    'volej',
    'hend',
    'padel',
  ]
  const out: FieldDto[] = []
  const seen = new Set<number>()
  for (let round = 0; round < 25 && out.length < limit; round++) {
    for (const cat of order) {
      const list = byCat[cat]
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

/** Filtrim i lehtë sipas emrit/lokacionit (pa fushë të re në DB). */
export function fieldMatchesSportFilter(f: FieldDto, sport: string | null): boolean {
  if (!sport) return true
  const t = `${f.name} ${f.location} ${f.city ?? ''}`.toLowerCase()
  switch (sport) {
    case 'basket':
      return /\bbasket|basketboll|nba\b/.test(t)
    case 'tenis':
      return /tenis|tennis/.test(t)
    case 'volej':
      return /volej|volley|voley/.test(t)
    case 'hend':
      return /hend|handball|hand ball/.test(t)
    case 'padel':
      return /padel|padle/.test(t)
    case 'futbol':
    default:
      return (
        !/\bbasket|basketboll\b/.test(t) &&
        !/tenis|tennis/.test(t) &&
        !/volej|volley/.test(t) &&
        !/hend|handball/.test(t) &&
        !/padel|padle/.test(t)
      )
  }
}
