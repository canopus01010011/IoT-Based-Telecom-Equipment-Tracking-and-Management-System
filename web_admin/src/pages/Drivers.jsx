import { useState, useEffect } from 'react'
import axios from 'axios'
import PageLayout  from '../components/PageLayout'
import StatCard    from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useT }    from '../context/LanguageContext'

const avatarColors = ['#1d4ed8','#0f6e56','#712b13','#534ab7','#854f0b','#0c447c']

const MOCK = [
  { id:1, nom:'Karim Benali',  telephone:'+213 550 12 34', vehicule:'Van — 16-DZ-142',     missions:24, statut:'Available'   },
  { id:2, nom:'Ali Hamid',     telephone:'+213 661 98 76', vehicule:'Truck — 09-DZ-871',   missions:18, statut:'On Mission'  },
  { id:3, nom:'Mohamed Saadi', telephone:'+213 770 45 67', vehicule:'Pick-up — 23-DZ-305', missions:31, statut:'On Mission'  },
  { id:4, nom:'Omar Meziane',  telephone:'+213 699 23 45', vehicule:'Van — 07-DZ-490',     missions:12, statut:'Available'   },
  { id:5, nom:'Yacine Brahim', telephone:'+213 555 67 89', vehicule:'Truck — 14-DZ-228',   missions:9,  statut:'Unavailable' },
]

const icons = {
  total:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  avail:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  mission: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
}

export default function Drivers() {
  const t = useT()
  const [drivers, setDrivers] = useState([])
  const [search, setSearch]   = useState('')

  useEffect(() => {
    axios.get('/api/users?role=driver', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => setDrivers((r.data.users || []).map(u => ({
        id: u.id, nom: u.full_name || u.nom, telephone: u.phone || u.telephone,
        vehicule: u.vehicle || u.vehicule || '', missions: u.missions || 0, statut: u.status || 'Available'
      })))).catch(() => setDrivers(MOCK))
  }, [])

  const displayed = drivers.filter(d =>
    d.nom?.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicule?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total:  drivers.length,
    dispo:  drivers.filter(d => d.statut === 'Available').length,
    actifs: drivers.filter(d => d.statut === 'On Mission').length,
  }

  return (
    <PageLayout title={t.driversTitle}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label={t.totalDrivers}  value={stats.total}  color="#e2e8f0" icon={icons.total}   />
        <StatCard label={t.availableStat} value={stats.dispo}  color="#4ade80" icon={icons.avail}   />
        <StatCard label={t.onMissionStat} value={stats.actifs} color="#60a5fa" icon={icons.mission} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.searchDriverVehicle}
          style={{ background:'var(--bg-input)', border:'1px solid var(--border-default)', borderRadius:8, padding:'9px 14px', fontSize:13, color:'var(--text-primary)', outline:'none', width:300 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {displayed.map((d, i) => (
          <div key={d.id} style={{ background:'var(--bg-sub)', border:'1px solid var(--border-card)', borderRadius:12, padding:'20px' }}>
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
                <p style={{ fontSize:14, fontWeight:500, color:'var(--text-primary)' }}>{d.nom}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{d.telephone}</p>
              </div>
              <StatusBadge statut={d.statut} />
            </div>

            <div style={{ borderTop:'1px solid var(--border-subtle)', paddingTop:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:5 }}>{t.vehicle}</p>
                <span style={{
                  fontSize:11, fontWeight:500, padding:'3px 10px', borderRadius:20,
                  background:'rgba(59,130,246,.1)', color:'#60a5fa',
                  border:'1px solid rgba(59,130,246,.2)',
                }}>
                  {d.vehicule}
                </span>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4 }}>{t.totalMissionsLabel}</p>
                <p style={{ fontSize:20, fontWeight:700, color:'#60a5fa' }}>{d.missions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
