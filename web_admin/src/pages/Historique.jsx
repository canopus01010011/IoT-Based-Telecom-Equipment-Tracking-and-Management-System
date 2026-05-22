import { useState, useEffect } from 'react'
import axios from 'axios'
import PageLayout  from '../components/PageLayout'
import StatCard    from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import FilterBar   from '../components/FilterBar'
import DataTable   from '../components/DataTable'
import { useT }    from '../context/LanguageContext'

const MOCK = [
  { id:1, ref:'MSN-087', site:'BTS Bab Ezzouar',  driver:'K. Benali',  equip:'Fiber + Antenna', date:'04/12/2024', statut:'completed'   },
  { id:2, ref:'MSN-086', site:'Kouba North Site',  driver:'A. Hamid',   equip:'Network Cabling', date:'04/11/2024', statut:'in-progress' },
  { id:3, ref:'MSN-085', site:'Rouiba Tower',      driver:'M. Saadi',   equip:'Antenna / Tower', date:'04/10/2024', statut:'incident'    },
  { id:4, ref:'MSN-084', site:'Dar El Beida',      driver:'K. Benali',  equip:'Generator',       date:'04/09/2024', statut:'cancelled'   },
  { id:5, ref:'MSN-083', site:'Hussein Dey',       driver:'O. Meziane', equip:'Site A/C',        date:'04/08/2024', statut:'completed'   },
  { id:6, ref:'MSN-082', site:'Hydra Site',        driver:'A. Hamid',   equip:'Fiber Optics',    date:'04/07/2024', statut:'completed'   },
  { id:7, ref:'MSN-081', site:'BTS Bordj',         driver:'M. Saadi',   equip:'Network Cabling', date:'04/06/2024', statut:'pending'     },
  { id:8, ref:'MSN-080', site:'Baraki Tower',      driver:'K. Benali',  equip:'4G Antenna',      date:'04/05/2024', statut:'completed'   },
]

const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Completed']
const FILTER_TO_API = { 'Pending': 'pending', 'In Progress': 'in-progress', 'Completed': 'completed' }
const COLS = '.7fr 1.3fr 1fr 1.3fr .8fr .9fr'
const PER_PAGE = 6

const icons = {
  total:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  done:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  incident: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  cancel:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
}

export default function Historique() {
  const t = useT()
  const [missions, setMissions] = useState([])
  const [filtre, setFiltre]     = useState('All')
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)

  useEffect(() => {
    axios.get('/api/missions?limit=0', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => setMissions((r.data.missions || []).map(m => ({
        id: m.id, ref: m.id, site: m.Site?.name || '', driver: m.driver?.full_name || '',
        equip: Array.isArray(m.equipment_list) ? m.equipment_list.map(e => e.equipment_id).join(', ') : '',
        date: m.scheduled_start_date ? m.scheduled_start_date.split('T')[0] : '', statut: m.status
      })))).catch(() => setMissions(MOCK))
  }, [])

  const filtered = missions.filter(m => {
    const apiStatus = FILTER_TO_API[filtre]
    const matchF = filtre === 'All' || m.statut === apiStatus
    const matchS = m.site?.toLowerCase().includes(search.toLowerCase()) ||
                   m.driver?.toLowerCase().includes(search.toLowerCase()) ||
                   m.ref?.toLowerCase().includes(search.toLowerCase())
    return matchF && matchS
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const displayed  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = {
    total:    missions.length,
    termines: missions.filter(m => m.statut === 'completed').length,
    incidents:missions.filter(m => m.statut === 'incident' || m.statut === 'Incident').length,
    annules:  missions.filter(m => m.statut === 'cancelled' || m.statut === 'Cancelled').length,
  }

  return (
    <PageLayout title={t.historyTitle}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label={t.totalMissions}         value={stats.total}     color="#e2e8f0" icon={icons.total}    />
        <StatCard label={t.completedStat}         value={stats.termines}  color="#4ade80" icon={icons.done}     />
        <StatCard label={t.incidentsStat}         value={stats.incidents} color="#f87171" icon={icons.incident} />
        <StatCard label={t.statuses['Cancelled']} value={stats.annules}   color="#94a3b8" icon={icons.cancel}   />
      </div>

      <FilterBar
        filters={STATUS_FILTERS}
        active={filtre}
        onFilter={f => { setFiltre(f); setPage(1) }}
        search={search}
        onSearch={v => { setSearch(v); setPage(1) }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <DataTable
          headers={[t.ref, t.site, t.driver, t.equipment, t.date, t.status]}
          cols={COLS}
          isEmpty={displayed.length === 0}
          empty={t.noMissionsFound}
          flex
        >
          {displayed.map(m => (
            <div key={m.id} style={{ display:'grid', gridTemplateColumns: COLS, padding:'12px 16px', fontSize:12, color:'#cbd5e1', borderBottom:'0.5px solid rgba(255,255,255,.04)', alignItems:'center' }}>
              <span style={{ color:'#60a5fa', fontWeight:500 }}>{m.ref}</span>
              <span>{m.site}</span>
              <span style={{ color:'rgba(148,163,184,.7)' }}>{m.driver}</span>
              <span style={{ color:'rgba(148,163,184,.5)', fontSize:11 }}>{m.equip}</span>
              <span style={{ color:'rgba(148,163,184,.5)', fontSize:11 }}>{m.date}</span>
              <StatusBadge statut={m.statut} />
            </div>
          ))}
        </DataTable>
      </div>

      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:16 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width:32, height:32, borderRadius:7, fontSize:12, background: p === page ? '#1d4ed8' : 'rgba(59,130,246,.08)', border: p === page ? 'none' : '1px solid rgba(59,130,246,.15)', color: p === page ? '#fff' : 'rgba(148,163,184,.6)', cursor:'pointer' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
