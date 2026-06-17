import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { fetchFieldById } from '../api/terminiApi'
import {
  isPublicOutdoorField,
  publicOutdoorAreaLabel,
} from '../fieldUtils'
import {
  publicOutdoorGallery,
  publicOutdoorMapUrl,
} from '../publicOutdoorMedia'
import type { FieldDto } from '../types'

function countryLabel() {
  return 'Kosovë'
}

export function PublicOutdoorFieldDetailPage() {
  const { fieldId: param } = useParams()
  const fieldId = Number(param)
  const [field, setField] = useState<FieldDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    if (!Number.isFinite(fieldId)) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetchFieldById(fieldId)
      .then((f) => {
        setField(f)
        setActivePhoto(0)
      })
      .catch((e) => {
        setField(null)
        setError(e instanceof ApiError ? e.message : 'Nuk u lexua fusha.')
      })
      .finally(() => setLoading(false))
  }, [fieldId])

  if (!Number.isFinite(fieldId)) {
    return <p className="alert alert-error">ID e pavlefshme.</p>
  }

  if (!loading && field && !isPublicOutdoorField(field)) {
    return <Navigate to={`/fields/${fieldId}`} replace />
  }

  const photos = field ? publicOutdoorGallery(field) : []
  const mapUrl = field ? publicOutdoorMapUrl(field) : '#'
  const area = field ? publicOutdoorAreaLabel(field) : null

  return (
    <div className="page pf-outdoor-detail">
      <nav className="svc-bc">
        <Link to="/">Ballina</Link>
        <span className="svc-sep">›</span>
        <Link to="/fusha-publike">Fusha publike</Link>
        <span className="svc-sep">›</span>
        <span className="svc-bc-current">{field?.name ?? '…'}</span>
      </nav>

      {loading && <p className="muted">Duke ngarkuar…</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && field && (
        <>
          <header className="pf-outdoor-detail-head">
            <p className="pf-public-outdoor-kicker">Falas · publike · pa rezervim</p>
            <h1>{field.name}</h1>
            {area && <p className="pf-outdoor-detail-area">{area}</p>}
            <p className="muted pf-outdoor-detail-loc">
              {[field.location, field.city, countryLabel()].filter(Boolean).join(' · ')}
            </p>
          </header>

          <section className="pf-outdoor-gallery" aria-label="Foto">
            <div className="pf-outdoor-gallery-main">
              <img
                src={photos[activePhoto]}
                alt={area ? `Fushë publike ${area}` : 'Fushë publike outdoor'}
                className="pf-outdoor-gallery-img"
                loading="lazy"
              />
            </div>
            {photos.length > 1 && (
              <div className="pf-outdoor-gallery-thumbs" role="list">
                {photos.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    role="listitem"
                    className={
                      'pf-outdoor-gallery-thumb' +
                      (i === activePhoto ? ' pf-outdoor-gallery-thumb--active' : '')
                    }
                    onClick={() => setActivePhoto(i)}
                    aria-label={`Foto ${i + 1}`}
                    aria-current={i === activePhoto}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="svc-card pf-outdoor-loc-card">
            <div className="svc-card-head">
              <h2>Lokacioni</h2>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-btn pf-btn--primary pf-btn--sm"
              >
                Hap në Google Maps
              </a>
            </div>
            <p>
              <strong>{field.location}</strong>
              {field.city ? `, ${field.city}` : ''}
            </p>
            <p className="muted small pf-outdoor-loc-note">
              Kjo është fushë publike / komunitare — nuk ka pronar në platformë dhe nuk rezervohet
              këtu. Shko në vend me ekipin tënd kur të duash.
            </p>
            <div className="pf-outdoor-map-embed" aria-hidden>
              <span className="pf-outdoor-map-pin" />
              <span className="muted small">{field.city}</span>
            </div>
          </section>

          <p className="pf-outdoor-back">
            <Link to="/fusha-publike" className="pf-btn pf-btn--outline">
              ← Të gjitha fushat publike
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
