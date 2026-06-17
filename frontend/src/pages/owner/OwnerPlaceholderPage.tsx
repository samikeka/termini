export function OwnerPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="owner-panel">
      <h1 className="owner-page-title">{title}</h1>
      <p className="owner-page-lede muted">
        This section is a placeholder for the next iteration (payments ledger, reviews, host
        settings).
      </p>
    </div>
  )
}
