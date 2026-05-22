import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const NotificationContext = createContext(null)

export const NOTIF_CONFIG = {
  departure:   { label: 'Departed for route',        color: '#3b82f6',  bg: 'rgba(59,130,246,.12)',  icon: 'truck'    },
  arrival:     { label: 'Arrived on site',            color: '#4ade80',  bg: 'rgba(34,197,94,.1)',    icon: 'map-pin'  },
  incident:    { label: 'Incident reported',          color: '#f87171',  bg: 'rgba(239,68,68,.12)',   icon: 'alert'    },
  completed:   { label: 'Mission completed',          color: '#4ade80',  bg: 'rgba(34,197,94,.1)',    icon: 'check'    },
  report:      { label: 'Field report submitted',     color: '#a78bfa',  bg: 'rgba(167,139,250,.1)',  icon: 'file'     },
  work_start:  { label: 'Intervention started',       color: '#fbbf24',  bg: 'rgba(251,191,36,.1)',   icon: 'wrench'   },
  work_done:   { label: 'Intervention completed',     color: '#4ade80',  bg: 'rgba(34,197,94,.1)',    icon: 'wrench'   },
  unavailable: { label: 'Marked unavailable',         color: '#94a3b8',  bg: 'rgba(148,163,184,.1)',  icon: 'user-off' },
  available:   { label: 'Now available',              color: '#4ade80',  bg: 'rgba(34,197,94,.1)',    icon: 'user-ok'  },
}

const DEFAULT_CFG = { label: 'Notification', color: '#60a5fa', bg: 'rgba(59,130,246,.08)', icon: 'bell' }

function parseNotifBody(body) {
  if (!body) return { name: '', detail: '', site: '', ref: '' }
  const parts = body.split(' · ').map(s => s.trim())
  return {
    name: parts[0] || '',
    detail: parts[1] || '',
    site: parts[2] || '',
    ref: parts[3] || '',
  }
}

function guessType(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('depart') || t.includes('route')) return 'departure'
  if (t.includes('arriv')) return 'arrival'
  if (t.includes('incident')) return 'incident'
  if (t.includes('complet') || t.includes('done')) return 'completed'
  if (t.includes('report')) return 'report'
  if (t.includes('work') || t.includes('interv')) return t.includes('start') ? 'work_start' : 'work_done'
  if (t.includes('unavail')) return 'unavailable'
  if (t.includes('avail')) return 'available'
  return null
}

export function NotificationProvider({ children }) {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)

  const fetchNotifs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await axios.get('/api/notifications?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data?.data) {
        setNotifs(res.data.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)

    const apiUrl = import.meta.env.VITE_API_URL || ''
    const socketUrl = apiUrl.replace(/\/api$/, '')
    const socket = io(socketUrl, { transports: ['websocket'], reconnection: true, reconnectionDelay: 5000 })
    socketRef.current = socket

    socket.on('notification', (notif) => {
      setNotifs(prev => [notif, ...prev])
    })

    return () => {
      clearInterval(interval)
      socket.disconnect()
      socketRef.current = null
    }
  }, [fetchNotifs])

  return (
    <NotificationContext.Provider value={{ notifs, loading }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
