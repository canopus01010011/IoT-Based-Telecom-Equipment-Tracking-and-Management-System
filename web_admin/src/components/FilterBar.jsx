import { useT } from '../context/LanguageContext'

export default function FilterBar({ filters, active, onFilter, search, onSearch, placeholder }) {
  const t = useT()

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:16 }}>
      {filters.map(f => (
        <button key={f} onClick={() => onFilter(f)}
          style={active === f
            ? { background:'rgba(59,130,246,.18)', border:'0.5px solid #3b82f6', color:'#60a5fa', padding:'4px 12px', borderRadius:20, fontSize:12, cursor:'pointer' }
            : { background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.15)', color:'rgba(148,163,184,.6)', padding:'4px 12px', borderRadius:20, fontSize:12, cursor:'pointer' }
          }>
          {t.statuses[f] ?? f}
        </button>
      ))}
      {onSearch !== undefined && (
        <input
          value={search ?? ''}
          onChange={e => onSearch(e.target.value)}
          placeholder={placeholder || t.search}
          style={{ background:'#0d1426', border:'0.5px solid rgba(59,130,246,.2)', borderRadius:7, padding:'5px 12px', fontSize:12, color:'#e2e8f0', outline:'none', width:220, marginLeft:'auto' }}
        />
      )}
    </div>
  )
}
