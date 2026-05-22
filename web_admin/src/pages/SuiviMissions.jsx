import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import PageLayout  from '../components/PageLayout'
import StatCard    from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import FilterBar   from '../components/FilterBar'
import { useT }    from '../context/LanguageContext'

// ─── Static depot / site coordinates per container ──────────────────────────
const ROUTES_BY_CONTAINER = {
  'CTR-001': { site: 'OS-Draria',      departLat: 36.706559, departLng: 3.167040, destLat: 36.720143, destLng: 2.994913 },
  'CTR-002': { site: 'OS-Meftah',      departLat: 36.706686, departLng: 3.167203, destLat: 36.620460, destLng: 3.222544 },
  'CTR-003': { site: 'OS-Cheraga',     departLat: 36.707079, departLng: 3.166759, destLat: 36.759147, destLng: 2.963507 },
  'CTR-004': { site: 'OS-BabaHassen',  departLat: 36.706533, departLng: 3.166932, destLat: 36.697948, destLng: 2.978671 },
  'CTR-005': { site: 'OS-Bouzareah',   departLat: 36.707094, departLng: 3.166948, destLat: 36.774056, destLng: 3.008713 },
  'CTR-006': { site: 'OS-Souakria',    departLat: 36.706985, departLng: 3.166603, destLat: 36.646844, destLng: 3.206364 },
  'CTR-007': { site: 'OS-APN',         departLat: 36.706682, departLng: 3.167200, destLat: 36.775801, destLng: 3.060468 },
  'CTR-008': { site: 'OS-HusseinDey',  departLat: 36.707028, departLng: 3.167120, destLat: 36.744683, destLng: 3.093389 },
  'CTR-009': { site: 'OS-Birtouta',    departLat: 36.707094, departLng: 3.166945, destLat: 36.648324, destLng: 3.007218 },
  'CTR-010': { site: 'OS-Sablettes',   departLat: 36.707071, departLng: 3.167038, destLat: 36.741059, destLng: 3.124791 },
}

const routeForContainer = (containerId) => ROUTES_BY_CONTAINER[containerId] || {}

// ─── Status helpers ───────────────────────────────────────────────────────────
const mapStatus = (s) => {
  if (s === 'in-progress') return 'En Route'
  if (s === 'pending')     return 'Pending'
  if (s === 'completed')   return 'Completed'
  if (s === 'incident')    return 'Incident'
  return s
}

const DOT_COLOR = {
  'En Route': '#3b82f6', 'On Site': '#22c55e', 'Pending': '#eab308',
  'Incident': '#ef4444', 'Completed': '#64748b', 'Cancelled': '#475569',
}
const CARD_BG = {
  'En Route': 'rgba(59,130,246,.12)', 'On Site': 'rgba(34,197,94,.1)',
  'Pending': 'rgba(234,179,8,.1)', 'Incident': 'rgba(239,68,68,.12)',
  'Completed': 'rgba(148,163,184,.1)', 'Cancelled': 'rgba(148,163,184,.08)',
}

// ─── Fix: include ALL real backend statuses in filters ────────────────────────
const STATUS_FILTERS = ['All', 'Pending', 'En Route', 'Completed']

const API_URL    = (import.meta.env.VITE_API_URL    || 'http://localhost:5000').replace(/\/$/, '')
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || API_URL).replace(/\/$/, '')

// ─── GPS helpers ──────────────────────────────────────────────────────────────
const latestTrackingPoint = (gpsDevice) => {
  const points = gpsDevice.TrackingData || gpsDevice.TrackingDataS || gpsDevice.tracking_data || []
  return Array.isArray(points) && points.length > 0 ? points[0] : null
}

const buildGpsMap = (gpsData) => {
  const gpsMap = {}
  ;(gpsData || []).forEach(g => {
    const point = latestTrackingPoint(g)
    gpsMap[g.container_id] = {
      gpsId:   g.id,
      lat:     point?.latitude  != null ? parseFloat(point.latitude)  : null,
      lng:     point?.longitude != null ? parseFloat(point.longitude) : null,
      battery: g.battery_level  != null ? g.battery_level : null,
    }
  })
  return gpsMap
}

// ─── OSRM real-road routing ───────────────────────────────────────────────────
async function fetchOsrmRoute(fromLat, fromLng, toLat, toLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${toLng},${toLat}` +
      `?overview=full&geometries=geojson`
    const res  = await fetch(url)
    const json = await res.json()
    if (json.routes && json.routes[0]) {
      // coords = [[lng,lat], ...] → convert to [[lat,lng], ...]
      return json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
    }
  } catch (_) { /* fallback to straight line */ }
  return null
}

// ─── Map modal ────────────────────────────────────────────────────────────────
function MapModal({ mission, onClose }) {
  const t = useT()
  const mapRef     = useRef(null)
  const mapObj     = useRef(null)
  const truckRef   = useRef(null)
  const travelLine = useRef(null)
  const [elapsed, setElapsed] = useState(0)
  const [routeReady, setRouteReady] = useState(false)

  // Elapsed counter
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Build map once
  useEffect(() => {
    if (!window.L || !mapRef.current) return
    const L = window.L

    const lat = mission.lat ?? mission.destLat ?? 36.75
    const lng = mission.lng ?? mission.destLng ?? 3.05
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      .setView([lat, lng], 13)
    mapObj.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

    // Icons
    const truckIcon = L.divIcon({
      className: '',
      html: `<div style="width:44px;height:44px;background:#1d4ed8;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #60a5fa;font-size:22px;box-shadow:0 0 0 6px rgba(59,130,246,.2);">🚛</div>`,
      iconSize: [44,44], iconAnchor: [22,22],
    })
    const depotIcon = L.divIcon({
      className: '',
      html: `<div style="width:32px;height:32px;background:#7c3aed;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #c4b5fd;font-size:17px;">🏭</div>`,
      iconSize: [32,32], iconAnchor: [16,16],
    })
    const siteIcon = L.divIcon({
      className: '',
      html: `<div style="width:38px;height:38px;background:#0f6e56;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #4ade80;font-size:20px;">📡</div>`,
      iconSize: [38,38], iconAnchor: [19,19],
    })

    const dLat = mission.departLat ?? lat
    const dLng = mission.departLng ?? lng
    const tLat = mission.destLat   ?? lat + 0.02
    const tLng = mission.destLng   ?? lng + 0.02

    // Markers
    L.marker([dLat, dLng], { icon: depotIcon }).addTo(map)
      .bindPopup(`<b>${t.departurePoint}</b>`)
    L.marker([tLat, tLng], { icon: siteIcon }).addTo(map)
      .bindPopup(`<b>${mission.site}</b><br/>${t.destination}`)

    truckRef.current = L.marker([lat, lng], { icon: truckIcon }).addTo(map)
      .bindPopup(`<b>${mission.driver}</b><br/>${t.currentPosition}`)

    // ── Draw real road routes ──────────────────────────────────────────────
    const drawRoutes = async () => {
      // Full planned route: depot → destination (dashed, light blue)
      const fullCoords = await fetchOsrmRoute(dLat, dLng, tLat, tLng)
      if (fullCoords) {
        L.polyline(fullCoords, {
          color: '#93c5fd', weight: 4, dashArray: '10 7', opacity: 0.7,
        }).addTo(map)
      }

      // Traveled route: depot → current truck position (solid blue)
      if (mission.lat != null && mission.lng != null) {
        fetchOsrmRoute(dLat, dLng, mission.lat, mission.lng).then(travelCoords => {
          if (travelCoords && mapObj.current) {
            travelLine.current = L.polyline(travelCoords, {
              color: '#3b82f6', weight: 5, opacity: 0.9,
            }).addTo(mapObj.current)
          }
        })
      }

      // Fit bounds to full route
      map.fitBounds([[dLat, dLng], [tLat, tLng]], { padding: [60, 60] })
      setRouteReady(true)
    }

    drawRoutes()

    return () => {
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null }
      truckRef.current  = null
      travelLine.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.id])

  // Update truck position in real-time (socket/GPS poll updates mission.lat/lng)
  useEffect(() => {
    if (!truckRef.current || mission.lat == null || mission.lng == null) return
    truckRef.current.setLatLng([mission.lat, mission.lng])
    if (mapObj.current) mapObj.current.panTo([mission.lat, mission.lng])

    // Redraw traveled line
    if (travelLine.current && mapObj.current) {
      const dLat = mission.departLat
      const dLng = mission.departLng
      if (dLat != null && dLng != null) {
        fetchOsrmRoute(dLat, dLng, mission.lat, mission.lng).then(coords => {
          if (!mapObj.current) return
          if (travelLine.current) {
            travelLine.current.remove()
            travelLine.current = null
          }
          const L = window.L
          if (!L || !coords) return
          travelLine.current = L.polyline(coords, {
            color: '#3b82f6', weight: 5, opacity: 0.9,
          }).addTo(mapObj.current)
        })
      }
    }
  }, [mission.lat, mission.lng])

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
      onClick={onClose}
    >
      <div
        style={{ width:'100%', maxWidth:980, background:'var(--bg-card)', border:'0.5px solid rgba(59,130,246,.3)', borderRadius:14, overflow:'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', background:'var(--bg-modal)', borderBottom:'0.5px solid rgba(59,130,246,.15)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:14, fontWeight:500, color:'#60a5fa' }}>{mission.ref}</span>
            <span style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>{mission.site}</span>
            <StatusBadge statut={mission.statut} />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {mission.statut === 'En Route' && (
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 1.5s infinite' }}></span>
                <span style={{ fontSize:11, color:'#4ade80' }}>Live • {fmt(elapsed)}</span>
              </div>
            )}
            {!routeReady && (
              <span style={{ fontSize:11, color:'var(--text-secondary)' }}>⏳ Chargement itinéraire...</span>
            )}
            <button onClick={onClose} style={{ background:'rgba(239,68,68,.1)', border:'0.5px solid rgba(239,68,68,.2)', color:'#f87171', borderRadius:6, padding:'5px 14px', fontSize:12, cursor:'pointer' }}>
              ✕ {t.close}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display:'flex', gap:16, padding:'6px 18px', background:'var(--bg-sub)', borderBottom:'0.5px solid rgba(59,130,246,.08)', fontSize:11, color:'var(--text-secondary)' }}>
          <span>🏭 Dépôt départ</span>
          <span style={{ color:'#93c5fd' }}>━ ╌ Itinéraire planifié</span>
          <span style={{ color:'#3b82f6' }}>━━ Trajet parcouru</span>
          <span>🚛 Position actuelle</span>
          <span>📡 Site destination</span>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ width:'100%', height:420 }} />

        {/* Info bar */}
        <div style={{ padding:'12px 18px', background:'var(--bg-sub)', borderTop:'0.5px solid rgba(59,130,246,.1)', display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
          {[
            { label: t.driver,        value: `🚛 ${mission.driver}` },
            { label: t.departureTime, value: `⏰ ${mission.depart || '—'}` },
            { label: t.duration,      value: `⏱ ${mission.duree  || '—'}` },
            { label: t.gpsPosition,   value: mission.lat != null ? `📍 ${Number(mission.lat).toFixed(4)}, ${Number(mission.lng).toFixed(4)}` : '📍 —' },
            { label: t.battery,       value: mission.battery != null ? `🔋 ${mission.battery}%` : '—', battery: mission.battery },
          ].map(({ label, value, battery }) => {
            const isBattery = label === t.battery
            const batteryColor = battery == null ? '#94a3b8' : battery < 20 ? '#ef4444' : battery < 60 ? '#eab308' : '#4ade80'
            return (
              <div key={label}>
                <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:3 }}>{label}</p>
                <p style={{ fontSize:13, color: isBattery ? batteryColor : label === t.gpsPosition ? '#60a5fa' : 'var(--text-primary)', fontWeight:500 }}>{value}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function SuiviMissions() {
  const t = useT()
  const [missions, setMissions] = useState([])
  const [selected, setSelected] = useState(null)
  const [filtre,   setFiltre]   = useState('All')
  const [search,   setSearch]   = useState('')
  const [leaflet,  setLeaflet]  = useState(false)

  // ── Load Leaflet ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const l = document.createElement('link')
      l.id = 'leaflet-css'; l.rel = 'stylesheet'
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(l)
    }
    if (!window.L) {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.onload = () => setLeaflet(true)
      document.head.appendChild(s)
    } else {
      setLeaflet(true)
    }
  }, [])

  // ── Parse a raw API mission into our internal shape ─────────────────────────
  const parseMission = useCallback((m, gpsMap, prevMap) => {
    const existing = prevMap ? prevMap.get(m.id) : null
    const gps      = gpsMap ? (gpsMap[m.container_id] || {}) : {}
    const route    = routeForContainer(m.container_id)
    const siteLat  = m.Site?.latitude  ? parseFloat(m.Site.latitude)  : null
    const siteLng  = m.Site?.longitude ? parseFloat(m.Site.longitude) : null

    return {
      id:          m.id,
      ref:         m.id,
      site:        route.site || m.Site?.name || '',
      driver:      m.driver?.full_name || '',
      technicien:  m.technician?.full_name || '',
      depart:      existing?.depart ?? '',
      duree:       existing?.duree  ?? '',
      statut:      mapStatus(m.status),
      // GPS position: prefer fresh gpsMap data, then existing, then null
      lat:         gps.lat     ?? existing?.lat     ?? null,
      lng:         gps.lng     ?? existing?.lng     ?? null,
      battery:     gps.battery ?? existing?.battery ?? null,
      gpsId:       gps.gpsId   ?? existing?.gpsId   ?? null,
      // Route waypoints
      departLat:   route.departLat ?? existing?.departLat ?? null,
      departLng:   route.departLng ?? existing?.departLng ?? null,
      destLat:     route.destLat   ?? siteLat,
      destLng:     route.destLng   ?? siteLng,
      container_id: m.container_id,
    }
  }, [])

  // ── Data fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    const token   = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    // ① Initial full load: missions + GPS live together
    const initialLoad = async () => {
      let gpsMap = {}
      try {
        const gpsRes = await axios.get('/api/gps/live', { headers })
        gpsMap = buildGpsMap(gpsRes.data?.data || [])
      } catch (_) {}

      try {
        const mRes = await axios.get('/api/missions?limit=0', { headers })
        setMissions(
          (mRes.data.missions || []).map(m => parseMission(m, gpsMap, null))
        )
      } catch (_) {
        // no fallback mock — show real data or nothing
      }
    }
    initialLoad()

    // ② Poll missions every 5 s (preserve GPS positions from state)
    const missionPoll = setInterval(() => {
      axios.get('/api/missions?limit=0', { headers }).then(mRes => {
        setMissions(prev => {
          const prevMap = new Map(prev.map(m => [m.id, m]))
          return (mRes.data.missions || []).map(m => parseMission(m, null, prevMap))
        })
      }).catch(() => {})
    }, 5000)

    // ③ Poll GPS live every 5 s to refresh positions independently
    const gpsPoll = setInterval(() => {
      axios.get('/api/gps/live', { headers }).then(gpsRes => {
        const gpsMap = buildGpsMap(gpsRes.data?.data || [])
        setMissions(prev => prev.map(m => {
          const gps = gpsMap[m.container_id]
          if (!gps) return m
          return {
            ...m,
            gpsId:   gps.gpsId   ?? m.gpsId,
            lat:     gps.lat     ?? m.lat,
            lng:     gps.lng     ?? m.lng,
            battery: gps.battery ?? m.battery,
          }
        }))
      }).catch(() => {})
    }, 5000)

    // ④ Socket for instant real-time position (matching by gpsId)
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    socket.emit('join-tracking')
    socket.on('gps-update', (data) => {
      setMissions(prev => prev.map(m => {
        // match by GPS device ID
        if (m.gpsId !== data.equipmentId) return m
        return {
          ...m,
          lat:     data.latitude,
          lng:     data.longitude,
          battery: data.battery ?? m.battery,
        }
      }))
    })

    return () => {
      clearInterval(missionPoll)
      clearInterval(gpsPoll)
      socket.disconnect()
    }
  }, [parseMission])

  // ── Filtering + Search ───────────────────────────────────────────────────────
  const q = search.toLowerCase()
  const displayed = missions.filter(m => {
    const matchStatus = filtre === 'All' || m.statut === filtre
    const matchSearch = !q ||
      m.ref?.toLowerCase().includes(q) ||
      m.site?.toLowerCase().includes(q) ||
      m.driver?.toLowerCase().includes(q) ||
      m.technicien?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const stats = {
    enRoute:   missions.filter(m => m.statut === 'En Route').length,
    surPlace:  missions.filter(m => m.statut === 'On Site').length,
    incidents: missions.filter(m => m.statut === 'Incident').length,
  }

  // Keep selected mission fresh when GPS updates arrive
  const liveMission = selected
    ? (missions.find(m => m.id === selected.id) || selected)
    : null

  return (
    <PageLayout title={t.missionTrackingTitle}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <StatCard label={t.statuses?.['En Route'] ?? 'En Route'} value={stats.enRoute}   color="#60a5fa" />
        <StatCard label={t.statuses?.['On Site']  ?? 'On Site'}  value={stats.surPlace}  color="#4ade80" />
        <StatCard label={t.incidentsStat ?? 'Incidents'}          value={stats.incidents} color="#f87171" />
      </div>

      <FilterBar
        filters={STATUS_FILTERS}
        active={filtre}
        onFilter={setFiltre}
        search={search}
        onSearch={setSearch}
        placeholder="Réf, site, driver…"
      />

      {displayed.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 0', color:'var(--text-muted)', fontSize:14 }}>
          Aucune mission {filtre !== 'All' ? `"${filtre}"` : ''} trouvée.
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {displayed.map(m => (
          <div
            key={m.id}
            onClick={() => leaflet && setSelected(m)}
            style={{ background:'var(--bg-card)', border:'0.5px solid rgba(59,130,246,.15)', borderRadius:12, padding:16, cursor: leaflet ? 'pointer' : 'default', transition:'all .15s' }}
            onMouseEnter={e => { if (leaflet) { e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.background='rgba(59,130,246,.06)' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(59,130,246,.15)'; e.currentTarget.style.background='var(--bg-card)' }}
          >
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:13, fontWeight:500, color:'#60a5fa' }}>{m.ref}</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:500, background: CARD_BG[m.statut] ?? 'rgba(148,163,184,.08)', color: DOT_COLOR[m.statut] ?? '#94a3b8' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background: DOT_COLOR[m.statut] ?? '#64748b' }}></span>
                {t.statuses?.[m.statut] ?? m.statut}
              </span>
            </div>
            <p style={{ fontSize:14, fontWeight:500, color:'var(--text-primary)', marginBottom:6 }}>{m.site}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
              <p style={{ fontSize:11, color:'var(--text-muted)' }}>🚛 {m.driver}</p>
              <p style={{ fontSize:11, color:'var(--text-muted)' }}>🔧 {m.technicien}</p>
            </div>
            {m.lat != null && m.lng != null ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.12)', borderRadius:7 }}>
                <p style={{ fontSize:10, color:'rgba(59,130,246,.7)' }}>📍 {Number(m.lat).toFixed(4)}, {Number(m.lng).toFixed(4)}</p>
                <p style={{ fontSize:10, color:'#60a5fa' }}>🗺 {t.viewMap ?? 'Voir carte'}</p>
              </div>
            ) : (
              <div style={{ padding:'7px 10px', background:'rgba(148,163,184,.04)', border:'0.5px solid rgba(148,163,184,.1)', borderRadius:7 }}>
                <p style={{ fontSize:10, color:'var(--text-subtle)' }}>📍 GPS non disponible</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && leaflet && liveMission && (
        <MapModal mission={liveMission} onClose={() => setSelected(null)} />
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </PageLayout>
  )
}
