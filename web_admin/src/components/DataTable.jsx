export default function DataTable({ title, subtitle, headers, cols, isEmpty, empty, children, px = '16px' }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-card)' }}>
      {title && (
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border-label)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</p>
          {subtitle && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: `9px ${px}`, fontSize: 10, color: 'var(--text-label)', letterSpacing: '.05em', textTransform: 'uppercase', borderBottom: '0.5px solid var(--border-label)' }}>
        {headers.map(h => <span key={h}>{h}</span>)}
      </div>
      {isEmpty
        ? <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>{empty}</p>
        : children
      }
    </div>
  )
}
