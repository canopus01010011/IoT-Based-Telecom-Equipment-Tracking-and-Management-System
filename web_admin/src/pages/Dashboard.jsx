import { useState, useEffect } from 'react'
import axios from 'axios'
import PageLayout   from '../components/PageLayout'
import StatCard     from '../components/StatCard'
import StatusBadge  from '../components/StatusBadge'
import DataTable    from '../components/DataTable'
import { useT }     from '../context/LanguageContext'

const MOCK_STATS    = { totalMissions: 142, inProgressMissions: 38, completedMissions: 85, pendingMissions: 16, totalDrivers: 5 }
const MOCK_RECENTES = [
  { id:1, ref:'MSN-091', site:'BTS Bab Ezzouar', driver:'K. Benali',  equip:'Fiber + Antenna',  date:'04/12/2024', statut:'In Progress' },
  { id:2, ref:'MSN-090', site:'Kouba Tower',      driver:'A. Hamid',   equip:'Network Cabling',  date:'04/11/2024', statut:'In Progress' },
  { id:3, ref:'MSN-089', site:'Rouiba Site',      driver:'M. Saadi',   equip:'Generator',        date:'04/10/2024', statut:'Incident'    },
  { id:4, ref:'MSN-088', site:'Dar El Beida',     driver:'O. Meziane', equip:'Site A/C',         date:'04/09/2024', statut:'Pending'     },
  { id:5, ref:'MSN-087', site:'Hussein Dey',      driver:'K. Benali',  equip:'Fiber Optics',     date:'04/08/2024', statut:'Completed'   },
]

const COLS = '.7fr 1.3fr 1fr 1.4fr .8fr .9fr'

const icons = {
  total:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  progress:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
  completed: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  incident:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  reports:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  drivers:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
}

export default function Dashboard() {
  const t = useT()
  const [stats,    setStats]    = useState(MOCK_STATS)
  const [missions, setMissions] = useState([])
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    const h = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    axios.get('/api/reports/stats/dashboard', h)
      .then(r => setStats(r.data.data)).catch(() => setStats(MOCK_STATS))
    axios.get('/api/missions', h)
      .then(r => setMissions((r.data.missions || []).map(m => ({
        id: m.id, ref: m.id, site: m.Site?.name || '', driver: m.driver?.full_name || '',
        equip: Array.isArray(m.equipment_list) ? m.equipment_list.map(e => e.equipment_id).join(', ') : '',
        date: m.scheduled_start_date ? m.scheduled_start_date.split('T')[0] : '',
        statut: m.status
      })))).catch(() => setMissions(MOCK_RECENTES))
  }, [])

  const q = search.toLowerCase()
  const displayed = missions.filter(m =>
    !q ||
    m.ref?.toLowerCase().includes(q) ||
    m.site?.toLowerCase().includes(q) ||
    m.driver?.toLowerCase().includes(q) ||
    m.statut?.toLowerCase().includes(q)
  )

  const cards = [
    { label: t.totalMissions,   value: stats.totalMissions,      color: '#e2e8f0', icon: icons.total     },
    { label: t.inProgressStat,  value: stats.inProgressMissions, color: '#60a5fa', icon: icons.progress  },
    { label: t.completedStat,   value: stats.completedMissions,  color: '#4ade80', icon: icons.completed },
    { label: t.incidentsStat,   value: stats.pendingMissions,    color: '#f87171', icon: icons.incident  },
    { label: t.pendingReports,  value: stats.pendingMissions,    color: '#fbbf24', icon: icons.reports   },
    { label: t.activeDrivers,   value: stats.totalDrivers,       color: '#a78bfa', icon: icons.drivers   },
  ]

  return (
    <PageLayout title={t.overview}>
      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {cards.map(c => <StatCard key={c.label} label={c.label} value={c.value} color={c.color} icon={c.icon} />)}
      </div>

      {/* Search bar above table */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <div>
          <p style={{ fontSize:14, fontWeight:500, color:'var(--text-primary)' }}>{t.recentMissions}</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{displayed.length} mission{displayed.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ position:'relative' }}>
          <svg style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', opacity:.4, pointerEvents:'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.search}
            style={{ background:'var(--bg-input)', border:'1px solid var(--border-default)', borderRadius:8, padding:'7px 12px 7px 32px', fontSize:12, color:'var(--text-primary)', outline:'none', width:220 }}
          />
        </div>
      </div>

      <DataTable
        headers={[t.ref, t.site, t.driver, t.equipment, t.date, t.status]}
        cols={COLS}
        isEmpty={displayed.length === 0}
        empty={t.noMissions}
        px="20px"
      >
        {displayed.map(m => (
          <div key={m.id} style={{ display:'grid', gridTemplateColumns: COLS, padding:'12px 20px', fontSize:12, color:'var(--text-table)', borderBottom:'0.5px solid var(--border-row)', alignItems:'center' }}>
            <span style={{ color:'#60a5fa', fontWeight:500 }}>{m.ref}</span>
            <span>{m.site}</span>
            <span style={{ color:'var(--text-secondary)' }}>{m.driver}</span>
            <span style={{ color:'var(--text-muted)', fontSize:11 }}>{m.equip}</span>
            <span style={{ color:'var(--text-muted)', fontSize:11 }}>{m.date}</span>
            <StatusBadge statut={m.statut} />
          </div>
        ))}
      </DataTable>
    </PageLayout>
  )
}
