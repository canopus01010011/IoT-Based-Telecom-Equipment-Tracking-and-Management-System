import { useT } from '../context/LanguageContext'

const SearchIcon = () => (
  <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', opacity:.45 }}
    width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function FilterBar({ filters, active, onFilter, search, onSearch, placeholder }) {
  const t = useT()

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:16 }}>
      {/* Status filter chips */}
      {filters.map(f => (
        <button key={f} onClick={() => onFilter(f)}
          style={active === f
            ? { background:'rgba(59,130,246,.18)', border:'0.5px solid #3b82f6', color:'#60a5fa', padding:'4px 14px', borderRadius:20, fontSize:12, cursor:'pointer', fontWeight:500 }
            : { background:'var(--bg-item)', border:'0.5px solid var(--border-default)', color:'var(--text-secondary)', padding:'4px 14px', borderRadius:20, fontSize:12, cursor:'pointer' }
          }>
          {t.statuses?.[f] ?? f}
        </button>
      ))}

      {/* Search input (only when onSearch is provided) */}
      {onSearch !== undefined && (
        <div style={{ position:'relative', marginLeft:'auto' }}>
          <SearchIcon />
          <input
            value={search ?? ''}
            onChange={e => onSearch(e.target.value)}
            placeholder={placeholder || t.search}
            style={{
              background: 'var(--bg-input)',
              border: '0.5px solid var(--border-default)',
              borderRadius: 8,
              padding: '6px 12px 6px 30px',
              fontSize: 12,
              color: 'var(--text-primary)',
              outline: 'none',
              width: 220,
            }}
          />
        </div>
      )}
    </div>
  )
}
