export default function DataTable({ title, subtitle, headers, cols, isEmpty, empty, children, px = '16px' }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)' }}>
      {title && (
        <div style={{ padding:'14px 20px', borderBottom:'0.5px solid rgba(59,130,246,.1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:14, fontWeight:500, color:'#e2e8f0' }}>{title}</p>
          {subtitle && <span style={{ fontSize:11, color:'rgba(148,163,184,.4)' }}>{subtitle}</span>}
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns: cols, padding:`9px ${px}`, fontSize:10, color:'rgba(99,179,255,.45)', letterSpacing:'.05em', textTransform:'uppercase', borderBottom:'0.5px solid rgba(59,130,246,.1)' }}>
        {headers.map(h => <span key={h}>{h}</span>)}
      </div>
      {isEmpty
        ? <p className="text-center py-10 text-sm" style={{ color:'rgba(148,163,184,.4)' }}>{empty}</p>
        : children
      }
    </div>
  )
}
