import { Link } from 'react-router-dom'

const STEPS: { step: number; label: string }[] = [
  { step: 1, label: 'Kërko' },
  { step: 2, label: 'Zgjidh' },
  { step: 3, label: 'Rezervo' },
  { step: 4, label: 'Paguaj' },
  { step: 5, label: 'Gati' },
]

type Props = {
  /** Current step 1–5 */
  current: number
  /** Smaller padding for mobile rail */
  compact?: boolean
}

export function BookingWizardStepper({ current, compact }: Props) {
  const safe = Math.min(5, Math.max(1, current))
  return (
    <nav
      className={'tp-wizard' + (compact ? ' tp-wizard--compact' : '')}
      aria-label="Hapat e rezervimit"
    >
      <ol className="tp-wizard-list">
        {STEPS.map(({ step, label }, idx) => {
          const done = safe > step
          const active = safe === step
          const isLast = idx === STEPS.length - 1
          const content = (
            <>
              <span className="tp-wizard-num">{done ? '✓' : step}</span>
              <span className="tp-wizard-label">{label}</span>
            </>
          )
          return (
            <li key={step} className="tp-wizard-item">
              {step === 1 ? (
                <Link
                  to="/fields"
                  className={
                    'tp-wizard-pill' +
                    (active ? ' tp-wizard-pill--active' : '') +
                    (done ? ' tp-wizard-pill--done' : '')
                  }
                >
                  {content}
                </Link>
              ) : (
                <span
                  className={
                    'tp-wizard-pill' +
                    (active ? ' tp-wizard-pill--active' : '') +
                    (done ? ' tp-wizard-pill--done' : '')
                  }
                >
                  {content}
                </span>
              )}
              {!isLast && <span className="tp-wizard-connector" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
