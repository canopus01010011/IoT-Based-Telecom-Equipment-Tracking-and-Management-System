import { useState, useEffect } from 'react'
import axios from 'axios'
import PageLayout  from '../components/PageLayout'
import StatCard    from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useT }    from '../context/LanguageContext'

const avatarColors = ['#1d4ed8','#0f6e56','#712b13','#534ab7','#854f0b','#0c447c','#5b2192','#0e5a5a']

const MOCK = [
  { id:1, nom:'Youcef Amrani',   telephone:'+213 550 11 22', specialite:'Fiber Optics',         missions:21, statut:'Available'   },
  { id:2, nom:'Nassim Boulifa',  telephone:'+213 661 33 44', specialite:'Antenna / Tower',       missions:17, statut:'On Mission'  },
  { id:3, nom:'Djamel Khelif',   telephone:'+213 770 55 66', specialite:'Network Cabling',       missions:28, statut:'On Mission'  },
  { id:4, nom:'Riad Ouali',      telephone:'+213 699 77 88', specialite:'Generator',             missions:14, statut:'Available'   },
  { id:5, nom:'Sofiane Tebbal',  telephone:'+213 555 99 00', specialite:'Site Air Conditioning', missions:9,  statut:'Unavailable' },
  { id:6, nom:'Amine Cherif',    telephone:'+213 770 12 34', specialite:'Multi-skilled',         missions:33, statut:'Available'   },
]

const specialtyColors = {
  'Fiber Optics':         { bg: 'rgba(59,130,246,.1)',  color: '#60a5fa'  },
  'Antenna / Tower':      { bg: 'rgba(168,85,247,.1)',  color: '#c084fc'  },
  'Network Cabling':      { bg: 'rgba(34,197,94,.08)',  color: '#4ade80'  },
  'Generator':            { bg: 'rgba(251,191,36,.1)',  color: '#fbbf24'  },
  'Site Air Conditioning':{ bg: 'rgba(20,184,166,.1)',  color: '#2dd4bf'  },
  'Multi-skilled':        { bg: 'rgba(239,68,68,.08)',  color: '#f87171'  },
}

const icons = {
  total:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  avail:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  mission: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
}

export default function Techniciens() {
  const t = useT()
  const [techs, setTechs]   = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    axios.get('/api/users?role=technician', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => setTechs((r.data.users || []).map(u => ({
        id: u.id, nom: u.full_name || u.nom, telephone: u.phone || u.telephone,
        specialite: u.specialite || '', statut: u.status || 'Available', missions: u.missions || 0
      })))).catch(() => setTechs(MOCK))
  }, [])

  const displayed = techs.filter(d =>
    d.nom?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialite?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total:  techs.length,
    dispo:  techs.filter(d => d.statut === 'Available').length,
    actifs: techs.filter(d => d.statut === 'On Mission').length,
  }

  return (
    <PageLayout title={t.techniciensTitle}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label={t.totalTechnicians} value={stats.total}  color="#e2e8f0" icon={icons.total}   />
        <StatCard label={t.availableStat}    value={stats.dispo}  color="#4ade80" icon={icons.avail}   />
        <StatCard label={t.onMissionStat}    value={stats.actifs} color="#60a5fa" icon={icons.mission} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.searchTechnician}
          style={{ background:'#0d1426', border:'1px solid rgba(59,130,246,.2)', borderRadius:8, padding:'9px 14px', fontSize:13, color:'#e2e8f0', outline:'none', width:300 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {displayed.map((d, i) => {
          const sp = specialtyColors[d.specialite] ?? { bg: 'rgba(59,130,246,.1)', color: '#60a5fa' }
          return (
            <div key={d.id} style={{ background:'#0d1426', border:'1px solid rgba(59,130,246,.12)', borderRadius:12, padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                <div style={{
                  width:46, height:46, borderRadius:'50%', flexShrink:0,
                  background: avatarColors[i % avatarColors.length],
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, fontWeight:600, color:'#fff',
                }}>
                  {d.nom?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:500, color:'#e2e8f0' }}>{d.nom}</p>
                  <p style={{ fontSize:11, color:'rgba(148,163,184,.5)', marginTop:2 }}>{d.telephone}</p>
                </div>
                <StatusBadge statut={d.statut} />
              </div>

              <div style={{ borderTop:'1px solid rgba(59,130,246,.08)', paddingTop:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:5 }}>{t.specialty}</p>
                  <span style={{
                    fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:20,
                    background: sp.bg, color: sp.color,
                    border: `1px solid ${sp.color}30`,
                  }}>
                    {d.specialite}
                  </span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:4 }}>{t.totalMissionsLabel}</p>
                  <p style={{ fontSize:20, fontWeight:700, color:'#60a5fa' }}>{d.missions}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </PageLayout>
  )
}
