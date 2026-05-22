import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PageLayout  from '../components/PageLayout'
import StatCard    from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import FilterBar   from '../components/FilterBar'
import DataTable   from '../components/DataTable'
import { useT }    from '../context/LanguageContext'

const avatarColors = ['#1d4ed8','#0f6e56','#712b13','#534ab7','#854f0b']

const MOCK = [
  { id:1, reference:'MSN-087', site:'BTS Bab Ezzouar',  gps:'36.7372, 3.1897', date:'12 Apr 2024', heureDebut:'08:30', heureFin:'12:15', statut:'Approved', technicien:{ nom:'K. Benali',  telephone:'+213 550 12 34' }},
  { id:2, reference:'MSN-086', site:'Kouba North Site',  gps:'36.7218, 3.0847', date:'11 Apr 2024', heureDebut:'09:00', heureFin:'14:30', statut:'Pending',  technicien:{ nom:'A. Hamid',   telephone:'+213 661 98 76' }},
  { id:3, reference:'MSN-085', site:'Rouiba Tower',      gps:'36.7310, 3.2841', date:'10 Apr 2024', heureDebut:'07:45', heureFin:'11:00', statut:'Pending',  technicien:{ nom:'M. Saadi',   telephone:'+213 770 45 67' }},
  { id:4, reference:'MSN-084', site:'Dar El Beida',      gps:'36.6918, 3.2156', date:'09 Apr 2024', heureDebut:'10:00', heureFin:'15:45', statut:'Approved', technicien:{ nom:'K. Benali',  telephone:'+213 550 12 34' }},
  { id:5, reference:'MSN-083', site:'Hussein Dey',       gps:'36.7456, 3.0962', date:'08 Apr 2024', heureDebut:'06:30', heureFin:'10:00', statut:'Rejected', technicien:{ nom:'O. Meziane', telephone:'+213 699 23 45' }},
]

const STATUS_FILTERS = ['All', 'completed']
const COLS = '.7fr 1.3fr 1.1fr 1.4fr .9fr .8fr'

export default function Rapports() {
  const t = useT()
  const navigate = useNavigate()
  const [rapports, setRapports] = useState([])
  const [filtre, setFiltre]     = useState('All')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    axios.get('/api/reports/missions?limit=0', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => setRapports((r.data.missions || []).map(m => ({
        id: m.id, reference: m.id, site: m.Site?.name || '',
        gps: m.gps_coordinates || '', date: m.scheduled_start_date ? m.scheduled_start_date.split('T')[0] : '',
        heureDebut: '', heureFin: '',
        statut: m.status === 'completed' ? 'Approved' : m.status === 'in-progress' ? 'Pending' : m.status,
        technicien: { nom: m.technician?.full_name || m.driver?.full_name || '', telephone: m.technician?.phone || m.driver?.phone || '' }
      })))).catch(() => setRapports(MOCK))
  }, [])

  const displayed = rapports.filter(r => {
    const mF = filtre === 'All' || r.statut === filtre
    const mS = r.technicien?.nom?.toLowerCase().includes(search.toLowerCase()) ||
               r.reference?.toLowerCase().includes(search.toLowerCase())
    return mF && mS
  })

  const stats = {
    total: rapports.length,
    completed: rapports.filter(r => r.statut === 'completed').length,
  }

  return (
    <PageLayout title={t.reportsTitle}>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label={t.reportsSubmitted} value={stats.total}     color="#e2e8f0" />
        <StatCard label={t.completedStat}    value={stats.completed} color="#4ade80" />
      </div>

      <FilterBar
        filters={STATUS_FILTERS}
        active={filtre}
        onFilter={setFiltre}
        search={search}
        onSearch={setSearch}
      />

      <DataTable
        headers={[t.missionRef, t.technician, t.siteGps, t.intervention, t.status, t.action]}
        cols={COLS}
        isEmpty={displayed.length === 0}
        empty={t.noReports}
      >
        {displayed.map((r, i) => (
          <div key={r.id} style={{ display:'grid', gridTemplateColumns: COLS, padding:'11px 16px', fontSize:11, color:'var(--text-table)', borderBottom:'0.5px solid var(--border-row)', alignItems:'center' }}>
            <span style={{ color:'#60a5fa', fontWeight:500 }}>{r.reference}</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background: avatarColors[i % avatarColors.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:500, color:'#fff', flexShrink:0 }}>
                {r.technicien?.nom?.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div>
                <p style={{ fontSize:11, color:'var(--text-primary)' }}>{r.technicien?.nom}</p>
                <p style={{ fontSize:10, color:'var(--text-muted)' }}>{r.technicien?.telephone}</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize:11 }}>{r.site}</p>
              <p style={{ fontSize:10, color:'rgba(59,130,246,.55)' }}>📍 {r.gps}</p>
            </div>
            <div>
              <p style={{ fontSize:10, color:'var(--text-secondary)' }}>{r.heureDebut} → {r.heureFin}</p>
              <p style={{ fontSize:10, color:'var(--text-muted)' }}>{r.date}</p>
            </div>
            <StatusBadge statut={r.statut} />
            <button onClick={() => navigate(`/dashboard/rapports/${r.id}`)}
              style={{ background:'rgba(59,130,246,.1)', border:'0.5px solid rgba(59,130,246,.3)', borderRadius:6, padding:'4px 10px', fontSize:10, color:'#60a5fa', cursor:'pointer' }}>
              {t.viewDetails}
            </button>
          </div>
        ))}
      </DataTable>
    </PageLayout>
  )
}
