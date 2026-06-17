import type { FieldDto } from './types'

const GALLERY_OFFSETS = [0, 11, 23, 37]

export function publicOutdoorMapUrl(f: FieldDto): string {
  const q = [f.location, f.city, 'Kosovë'].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

function picsum(seed: string, w = 1200, h = 800) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

export function publicOutdoorCoverUrl(f: FieldDto): string {
  const url = f.coverImageUrl?.trim()
  if (url) return url
  return picsum(`ks-outdoor-${f.id}-${f.city}`)
}

export function publicOutdoorGallery(f: FieldDto): string[] {
  const cover = publicOutdoorCoverUrl(f)
  const extras = GALLERY_OFFSETS.map((n) =>
    picsum(`ks-outdoor-${f.id}-${f.city}-${n}`),
  ).filter((u) => u !== cover)
  return [cover, ...extras].slice(0, 4)
}
