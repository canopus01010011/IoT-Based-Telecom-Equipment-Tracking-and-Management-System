import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const NotificationContext = createContext(null)

// ── Notification types & display config ────────────────────────────────────────
export const NOTIF_CONFIG = {
  departure:      { label: 'Departed for route',        color: '#3b82f6',  bg: 'rgba(59,130,246,.12)',  icon: 'truck'    },
  arrival:        { label: 'Arrived on site',            color: '#4ade80',  bg: 'rgba(34,197,94,.1)',    icon: 'map-pin'  },
  incident:       { label: 'Incident reported',          color: '#f87171',  bg: 'rgba(239,68,68,.12)',   icon: 'alert'    },
  completed:      { label: 'Mission completed',          color: '#4ade80',  bg: 'rgba(34,197,94,.1)',    icon: 'check'    },
  report:         { label: 'Field report submitted',     color: '#a78bfa',  bg: 'rgba(167,139,250,.1)',  icon: 'file'     },
  report_rejected:{ label: 'Report rejected',            color: '#f87171',  bg: 'rgba(239,68,68,.12)',   icon: 'alert'    },
  work_start:     { label: 'Intervention started',       color: '#fbbf24',  bg: 'rgba(251,191,36,.1)',   icon: 'wrench'   },
  work_done:      { label: 'Intervention completed',     color: '#4ade80',  bg: 'rgba(34,197,94,.1)',    icon: 'wrench'   },
  unavailable:    { label: 'Marked unavailable',         color: '#94a3b8',  bg: 'rgba(148,163,184,.1)',  icon: 'user-off' },
  available:      { label: 'Now available',              color: '#4ade80',  bg: 'rgba(34,197,94,.1)',    icon: 'user-ok'  },
}

// ── Links by notification type ─────────────────────────────────────────────────
// report type uses the missionId: /dashboard/rapports/:id
// everything else → tracking or drivers page
const typeLink = (type, missionId) => {
  if (type === 'report')      return missionId ? `/dashboard/rapports/${missionId}` : '/dashboard/rapports'
  if (type === 'unavailable') return '/dashboard/drivers'
  if (type === 'available')   return '/dashboard/drivers'
  return '/dashboard/suivi'
}

// ── Seed mock notifications (with link field) ──────────────────────────────────
const SEED_NOTIFS = [
  {
    id: 1, read: false, type: 'departure', role: 'driver',
    name: 'Karim Benali', vehicule: 'Van — 16-DZ-142',
    site: 'BTS Bab Ezzouar', ref: 'MSN-091', time: '08:42',
    link: '/dashboard/suivi',
  },
  {
    id: 2, read: false, type: 'report', role: 'technician',
    name: 'Youcef Amrani', specialite: 'Fiber Optics',
    site: 'BTS Bab Ezzouar', ref: 'MSN-091', time: '08:30',
    link: '/dashboard/rapports',
  },
  {
    id: 3, read: false, type: 'arrival', role: 'driver',
    name: 'Ali Hamid', vehicule: 'Truck — 09-DZ-871',
    site: 'Kouba Tower', ref: 'MSN-090', time: '07:58',
    link: '/dashboard/suivi',
  },
  {
    id: 4, read: false, type: 'work_start', role: 'technician',
    name: 'Nassim Boulifa', specialite: 'Antenna / Tower',
    site: 'Kouba Tower', ref: 'MSN-090', time: '08:05',
    link: '/dashboard/suivi',
  },
  {
    id: 5, read: false, type: 'incident', role: 'driver',
    name: 'Mohamed Saadi', vehicule: 'Pick-up — 23-DZ-305',
    site: 'Rouiba Tower', ref: 'MSN-089', time: '07:20',
    link: '/dashboard/suivi',
  },
  {
    id: 6, read: false, type: 'incident', role: 'technician',
    name: 'Djamel Khelif', specialite: 'Network Cabling',
    site: 'Rouiba Tower', ref: 'MSN-089', time: '07:25',
    link: '/dashboard/suivi',
  },
  {
    id: 7, read: true, type: 'work_done', role: 'technician',
    name: 'Amine Cherif', specialite: 'Multi-skilled',
    site: 'Hussein Dey', ref: 'MSN-083', time: '06:10',
    link: '/dashboard/suivi',
  },
  {
    id: 8, read: true, type: 'completed', role: 'driver',
    name: 'Omar Meziane', vehicule: 'Van — 07-DZ-490',
    site: 'Hussein Dey', ref: 'MSN-083', time: '06:00',
    link: '/dashboard/suivi',
  },
  {
    id: 9, read: true, type: 'unavailable', role: 'driver',
    name: 'Yacine Brahim', vehicule: 'Truck — 14-DZ-228',
    site: null, ref: null, time: 'Yesterday',
    link: '/dashboard/drivers',
  },
  {
    id: 10, read: true, type: 'available', role: 'technician',
    name: 'Riad Ouali', specialite: 'Generator',
    site: null, ref: null, time: 'Yesterday',
    link: '/dashboard/drivers',
  },
  {
    id: 11, read: true, type: 'departure', role: 'driver',
    name: 'Karim Benali', vehicule: 'Van — 16-DZ-142',
    site: 'Hydra Site', ref: 'MSN-082', time: 'Yesterday',
    link: '/dashboard/suivi',
  },
  {
    id: 12, read: true, type: 'report', role: 'technician',
    name: 'Sofiane Tebbal', specialite: 'Site Air Conditioning',
    site: 'Dar El Beida', ref: 'MSN-088', time: 'Yesterday',
    link: '/dashboard/rapports',
  },
]

// ── Convert a backend mission status change into a notification object ─────────
let _idCounter = 1000
const buildMissionNotif = (mission, newStatus) => {
  const now   = new Date()
  const time  = now.toTimeString().slice(0, 5)
  const site  = mission.Site?.name || ''
  const ref   = String(mission.id)
  const missionId = mission.id

  let type, role, name, vehicule, specialite

  if (newStatus === 'in-progress') {
    type = 'departure'; role = 'driver'
    name = mission.driver?.full_name || 'Driver'
    vehicule = mission.container_id || ''
    specialite = ''
  } else if (newStatus === 'completed') {
    type = 'completed'; role = 'driver'
    name = mission.driver?.full_name || 'Driver'
    vehicule = mission.container_id || ''
    specialite = ''
  } else {
    type = 'work_start'; role = 'technician'
    name = mission.technician?.full_name || 'Technician'
    vehicule = ''
    specialite = mission.technician?.specialite || ''
  }

  return {
    id: ++_idCounter,
    read: false,
    type, role, name, vehicule, specialite,
    site, ref, time,
    missionId,
    link: typeLink(type, missionId),
  }
}

// ── Guess notification type from title string ────────────────────────────────
function guessType(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('rejected')) return 'report_rejected'
  if (t.includes('depart') || t.includes('route'))  return 'departure'
  if (t.includes('arriv'))   return 'arrival'
  if (t.includes('incident')) return 'incident'
  if (t.includes('complet') || t.includes('done'))  return 'completed'
  if (t.includes('report') || t.includes('rapport')) return 'report'
  if (t.includes('start'))   return 'work_start'
  if (t.includes('work') || t.includes('interv'))   return 'work_done'
  if (t.includes('unavail')) return 'unavailable'
  if (t.includes('avail'))   return 'available'
  return 'departure'
}

// ══════════════════════════════════════════════════════════════════════════════
export function NotificationProvider({ children }) {
  const [notifs, setNotifs] = useState(SEED_NOTIFS)
  const prevMissions = useRef(null) // Map<id, status>

  // ── Add a new notification (prepend) ──────────────────────────────────────
  const addNotif = useCallback((n) => {
    setNotifs(prev => [n, ...prev])
  }, [])

  // ── Mark one notification as read ─────────────────────────────────────────
  const markRead = useCallback((id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  // ── Poll missions to detect status changes ────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const fetchAndDiff = async () => {
      try {
        const res = await axios.get('/api/missions', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const missions = res.data.missions || []

        if (prevMissions.current === null) {
          // First load — build baseline, do NOT generate notifications
          const map = new Map()
          missions.forEach(m => map.set(m.id, m.status))
          prevMissions.current = map
          return
        }

        // Diff with previous state
        const newNotifs = []
        missions.forEach(m => {
          const prevStatus = prevMissions.current.get(m.id)
          if (prevStatus === undefined) {
            // New mission appeared
            if (m.status === 'in-progress') {
              newNotifs.push(buildMissionNotif(m, 'in-progress'))
            }
          } else if (prevStatus !== m.status) {
            // Status changed
            newNotifs.push(buildMissionNotif(m, m.status))
          }
          prevMissions.current.set(m.id, m.status)
        })

        if (newNotifs.length > 0) {
          setNotifs(prev => [...newNotifs, ...prev])
        }
      } catch (_) {
        // backend unavailable — keep existing notifications
      }
    }

    fetchAndDiff() // immediate
    const interval = setInterval(fetchAndDiff, 30_000) // every 30 s
    return () => clearInterval(interval)
  }, [])

  // ── Socket.IO listener for real-time notifications ────────────────────────────
  useEffect(() => {
    const socketUrl = 'https://iot-based-telecom-equipment-tracking-and-managem-production.up.railway.app'
    const socket = io(socketUrl, {
      transports: ['websocket'],
      query: { role: 'admin', token: localStorage.getItem('token') },
    })
    socket.on('notification', (notif) => {
      addNotif({
        id: notif.id || Date.now(),
        read: false,
        type: guessType(notif.title),
        role: 'technician',
        name: notif.body?.split(' · ')[0] || notif.title || '',
        site: notif.body?.split(' · ')[2] || '',
        ref: notif.body?.split(' · ')[3] || '',
        time: notif.sent_at
          ? new Date(notif.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        missionId: notif.body?.split(' · ')[3] || null,
        link: ['report', 'report_rejected'].includes(guessType(notif.title))
          ? `/dashboard/rapports/${notif.body?.split(' · ')[3] || ''}`
          : '/dashboard/suivi',
      })
    })
    return () => { socket.disconnect() }
  }, [addNotif])

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifs, unreadCount, markAllRead, markRead, addNotif }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
