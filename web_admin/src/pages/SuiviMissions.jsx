import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import PageLayout  from '../components/PageLayout'
import StatCard    from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import FilterBar   from '../components/FilterBar'
import { useT }    from '../context/LanguageContext'

const MOCK = [
  { id:1, ref:'MSN-091', site:'BTS Bab Ezzouar',  driver:'K. Benali',  technicien:'A. Hamid',   depart:'08:30', duree:'3h 45min', statut:'En Route',  lat:36.7201, lng:3.1634, destLat:36.7372, destLng:3.1897 },
  { id:2, ref:'MSN-090', site:'Kouba Tower',       driver:'M. Saadi',   technicien:'Y. Brahim',  depart:'09:00', duree:'2h 10min', statut:'On Site',   lat:36.7218, lng:3.0847, destLat:36.7218, destLng:3.0847 },
  { id:3, ref:'MSN-089', site:'Rouiba Site',       driver:'O. Meziane', technicien:'N. Oukil',   depart:'07:45', duree:'1h 20min', statut:'Incident',  lat:36.7310, lng:3.2841, destLat:36.7310, destLng:3.2841 },
  { id:4, ref:'MSN-088', site:'Dar El Beida',      driver:'K. Benali',  technicien:'R. Ferhat',  depart:'10:00', duree:'—',        statut:'Pending',   lat:36.6918, lng:3.2156, destLat:36.6918, destLng:3.2156 },
  { id:5, ref:'MSN-087', site:'Hussein Dey',       driver:'A. Hamid',   technicien:'A. Hamid',   depart:'06:30', duree:'4h 00min', statut:'Completed', lat:36.7456, lng:3.0962, destLat:36.7456, destLng:3.0962 },
  { id:6, ref:'MSN-086', site:'BTS Hydra',         driver:'M. Saadi',   technicien:'Y. Brahim',  depart:'11:00', duree:'—',        statut:'Cancelled', lat:36.7500, lng:3.0500, destLat:36.7500, destLng:3.0500 },
]

const DOT_COLOR = {
  'En Route': '#3b82f6', 'On Site': '#22c55e', 'Pending': '#eab308',
  'Incident': '#ef4444', 'Completed': '#64748b', 'Cancelled': '#475569',
}
const CARD_BG = {
  'En Route': 'rgba(59,130,246,.12)', 'On Site': 'rgba(34,197,94,.1)',
  'Pending': 'rgba(234,179,8,.1)', 'Incident': 'rgba(239,68,68,.12)',
  'Completed': 'rgba(148,163,184,.1)', 'Cancelled': 'rgba(148,163,184,.08)',
}

const STATUS_FILTERS = ['All', 'En Route', 'On Site', 'Pending', 'Incident', 'Completed', 'Cancelled']

function MapModal({ mission, onClose }) {
  const t = useT()
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!window.L || !mapRef.current) return
    const L = window.L
    const map = L.map(mapRef.current, { zoomControl:true, attributionControl:false })
      .setView([mission.lat, mission.lng], 14)
    mapObj.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map)

    const truckIcon = L.divIcon({ className:'', html:`<div style="width:44px;height:44px;background:#1d4ed8;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #60a5fa;font-size:22px;box-shadow:0 0 0 6px rgba(59,130,246,.2);">🚛</div>`, iconSize:[44,44], iconAnchor:[22,22] })
    const siteIcon  = L.divIcon({ className:'', html:`<div style="width:38px;height:38px;background:#0f6e56;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #4ade80;font-size:20px;">📡</div>`,  iconSize:[38,38], iconAnchor:[19,19] })
    const deptIcon  = L.divIcon({ className:'', html:`<div style="width:30px;height:30px;background:#854f0b;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fbbf24;font-size:16px;">🏭</div>`,    iconSize:[30,30], iconAnchor:[15,15] })

    L.marker([mission.lat, mission.lng], { icon: truckIcon }).addTo(map).bindPopup(`<b>${mission.driver}</b><br/>${t.currentPosition}`)
    L.marker([mission.destLat, mission.destLng], { icon: siteIcon }).addTo(map).bindPopup(`<b>${mission.site}</b><br/>${t.destination}`)

    if (mission.statut === 'En Route') {
      const dLat = mission.destLat - 0.05
      const dLng = mission.destLng - 0.05
      L.marker([dLat, dLng], { icon: deptIcon }).addTo(map).bindPopup(t.departurePoint)
      L.polyline([[dLat, dLng],[mission.lat, mission.lng],[mission.destLat, mission.destLng]], { color:'#3b82f6', weight:3, dashArray:'8 6', opacity:.8 }).addTo(map)
      map.fitBounds([[dLat,dLng],[mission.destLat,mission.destLng]], { padding:[60,60] })
    } else {
      map.setView([mission.lat, mission.lng], 15)
    }

    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null } }
  }, [mission.id])

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }} onClick={onClose}>
      <div style={{ width:'100%', maxWidth:960, background:'#111827', border:'0.5px solid rgba(59,130,246,.3)', borderRadius:14, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', background:'#080d1a', borderBottom:'0.5px solid rgba(59,130,246,.15)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:14, fontWeight:500, color:'#60a5fa' }}>{mission.ref}</span>
            <span style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>{mission.site}</span>
            <StatusBadge statut={mission.statut} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {mission.statut === 'En Route' && (
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 1.5s infinite' }}></span>
                <span style={{ fontSize:11, color:'#4ade80' }}>Live • {fmt(elapsed)}</span>
              </div>
            )}
            <button onClick={onClose} style={{ background:'rgba(239,68,68,.1)', border:'0.5px solid rgba(239,68,68,.2)', color:'#f87171', borderRadius:6, padding:'5px 14px', fontSize:12, cursor:'pointer' }}>
              ✕ {t.close}
            </button>
          </div>
        </div>
        <div ref={mapRef} style={{ width:'100%', height:440 }} />
        <div style={{ padding:'12px 18px', background:'#0d1426', borderTop:'0.5px solid rgba(59,130,246,.1)', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {[
            { label: t.driver,        value: `🚛 ${mission.driver}` },
            { label: t.departureTime, value: `⏰ ${mission.depart}` },
            { label: t.duration,      value: `⏱ ${mission.duree}`  },
            { label: t.gpsPosition,   value: `📍 ${mission.lat != null ? Number(mission.lat).toFixed(4) : '—'}, ${mission.lng != null ? Number(mission.lng).toFixed(4) : '—'}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>{label}</p>
              <p style={{ fontSize:13, color: label === t.gpsPosition ? '#60a5fa' : '#e2e8f0', fontWeight:500 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SuiviMissions() {
  const t = useT()
  const [missions,  setMissions]  = useState([])
  const [selected,  setSelected]  = useState(null)
  const [filtre,    setFiltre]    = useState('All')
  const [leaflet,   setLeaflet]   = useState(false)

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const l = document.createElement('link')
      l.id='leaflet-css'; l.rel='stylesheet'
      l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(l)
    }
    if (!window.L) {
      const s = document.createElement('script')
      s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.onload = () => setLeaflet(true)
      document.head.appendChild(s)
    } else setLeaflet(true)
  }, [])

  useEffect(() => {
    axios.get('/api/missions/actives', { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }})
      .then(r => setMissions(r.data)).catch(() => setMissions(MOCK))
  }, [])

  const displayed = filtre === 'All' ? missions : missions.filter(m => m.statut === filtre)

  const stats = {
    enRoute:  missions.filter(m => m.statut === 'En Route').length,
    surPlace: missions.filter(m => m.statut === 'On Site').length,
    incidents:missions.filter(m => m.statut === 'Incident').length,
  }

  return (
    <PageLayout title={t.missionTrackingTitle}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <StatCard label={t.statuses['En Route']} value={stats.enRoute}   color="#60a5fa" />
        <StatCard label={t.statuses['On Site']}  value={stats.surPlace}  color="#4ade80" />
        <StatCard label={t.incidentsStat}        value={stats.incidents} color="#f87171" />
      </div>

      <FilterBar filters={STATUS_FILTERS} active={filtre} onFilter={setFiltre} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {displayed.map(m => (
          <div key={m.id}
            onClick={() => leaflet && setSelected(m)}
            style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)', borderRadius:12, padding:16, cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.background='rgba(59,130,246,.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(59,130,246,.15)'; e.currentTarget.style.background='#111827' }}
          >
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:13, fontWeight:500, color:'#60a5fa' }}>{m.ref}</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:500, background: CARD_BG[m.statut], color: DOT_COLOR[m.statut] ?? '#94a3b8' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background: DOT_COLOR[m.statut] ?? '#64748b' }}></span>
                {t.statuses[m.statut] ?? m.statut}
              </span>
            </div>
            <p style={{ fontSize:14, fontWeight:500, color:'#e2e8f0', marginBottom:6 }}>{m.site}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
              <p style={{ fontSize:11, color:'rgba(148,163,184,.55)' }}>🚛 {m.driver}</p>
              <p style={{ fontSize:11, color:'rgba(148,163,184,.55)' }}>🔧 {m.technicien}</p>
              <p style={{ fontSize:11, color:'rgba(148,163,184,.45)' }}>⏰ {t.departureTime} {m.depart} · ⏱ {m.duree}</p>
            </div>
            {(m.statut === 'En Route' || m.statut === 'On Site') && m.lat != null && m.lng != null && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.12)', borderRadius:7 }}>
                <p style={{ fontSize:10, color:'rgba(59,130,246,.7)' }}>📍 {Number(m.lat).toFixed(4)}, {Number(m.lng).toFixed(4)}</p>
                <p style={{ fontSize:10, color:'#60a5fa' }}>{t.viewMap}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && leaflet && <MapModal mission={selected} onClose={() => setSelected(null)} />}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  )
}
