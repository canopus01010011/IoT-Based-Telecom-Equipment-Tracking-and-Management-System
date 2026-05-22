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

const STATUS_FILTERS = ['All', 'pending', 'in-progress', 'completed']
const COLS = '.7fr 1.3fr 1.1fr 1.4fr .9fr .8fr'

export default function Rapports() {
  const t = useT()
  const navigate = useNavigate()
  const [rapports, setRapports] = useState([])
  const [filtre, setFiltre]     = useState('All')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    axios.get('/api/reports/missions?limit=0', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => setRapports((r.data.missions || []).map(m => {
        const site = m.Site || {}
        const tech = m.technician || m.driver || {}
        return {
          id: m.id, reference: m.id, site: site.name || '',
          gps: site.latitude && site.longitude ? `${site.latitude}, ${site.longitude}` : '',
          date: m.scheduled_start_date ? m.scheduled_start_date.split('T')[0] : '',
          heureDebut: m.start_date ? new Date(m.start_date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '',
          heureFin: m.end_date ? new Date(m.end_date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '',
          statut: m.status,
          technicien: { nom: tech.full_name || '', telephone: tech.phone || '' }
        }
      }))).catch(() => setRapports([]))
  }, [])

  const displayed = rapports.filter(r => {
    const mF = filtre === 'All' || r.statut === filtre
    const mS = r.technicien?.nom?.toLowerCase().includes(search.toLowerCase()) ||
               r.reference?.toLowerCase().includes(search.toLowerCase())
    return mF && mS
  })

  const stats = {
    total:  rapports.length,
    valide: rapports.filter(r => r.statut === 'completed').length,
    attend: rapports.filter(r => r.statut === 'in-progress' || r.statut === 'pending').length,
  }

  return (
    <PageLayout title={t.reportsTitle}>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label={t.reportsSubmitted}  value={stats.total}  color="#e2e8f0" />
        <StatCard label={t.approvedStat}      value={stats.valide} color="#4ade80" />
        <StatCard label={t.pendingValidation} value={stats.attend} color="#fbbf24" />
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
          <div key={r.id} style={{ display:'grid', gridTemplateColumns: COLS, padding:'11px 16px', fontSize:11, color:'#cbd5e1', borderBottom:'0.5px solid rgba(255,255,255,.03)', alignItems:'center' }}>
            <span style={{ color:'#60a5fa', fontWeight:500 }}>{r.reference}</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background: avatarColors[i % avatarColors.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:500, color:'#e2e8f0', flexShrink:0 }}>
                {r.technicien?.nom?.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div>
                <p style={{ fontSize:11, color:'#e2e8f0' }}>{r.technicien?.nom}</p>
                <p style={{ fontSize:10, color:'rgba(148,163,184,.4)' }}>{r.technicien?.telephone}</p>
              </div>
            </div>
            <div>
              <p style={{ fontSize:11 }}>{r.site}</p>
              {r.gps && <p style={{ fontSize:10, color:'rgba(59,130,246,.55)' }}>📍 {r.gps}</p>}
            </div>
            <div>
              <p style={{ fontSize:10, color:'rgba(148,163,184,.5)' }}>{r.heureDebut && r.heureFin ? `${r.heureDebut} → ${r.heureFin}` : ''}</p>
              <p style={{ fontSize:10, color:'rgba(148,163,184,.4)' }}>{r.date}</p>
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
