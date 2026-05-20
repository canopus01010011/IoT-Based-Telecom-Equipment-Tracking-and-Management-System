import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

// type: 'departure' | 'arrival' | 'incident' | 'completed' | 'report' | 'work_start' | 'work_done' | 'unavailable' | 'available'
const MOCK_NOTIFS = [
  {
    id: 1, read: false, type: 'departure', role: 'driver',
    name: 'Karim Benali', vehicule: 'Van — 16-DZ-142',
    site: 'BTS Bab Ezzouar', ref: 'MSN-091', time: '08:42',
  },
  {
    id: 2, read: false, type: 'report', role: 'technician',
    name: 'Youcef Amrani', specialite: 'Fiber Optics',
    site: 'BTS Bab Ezzouar', ref: 'MSN-091', time: '08:30',
  },
  {
    id: 3, read: false, type: 'arrival', role: 'driver',
    name: 'Ali Hamid', vehicule: 'Truck — 09-DZ-871',
    site: 'Kouba Tower', ref: 'MSN-090', time: '07:58',
  },
  {
    id: 4, read: false, type: 'work_start', role: 'technician',
    name: 'Nassim Boulifa', specialite: 'Antenna / Tower',
    site: 'Kouba Tower', ref: 'MSN-090', time: '08:05',
  },
  {
    id: 5, read: false, type: 'incident', role: 'driver',
    name: 'Mohamed Saadi', vehicule: 'Pick-up — 23-DZ-305',
    site: 'Rouiba Tower', ref: 'MSN-089', time: '07:20',
  },
  {
    id: 6, read: false, type: 'incident', role: 'technician',
    name: 'Djamel Khelif', specialite: 'Network Cabling',
    site: 'Rouiba Tower', ref: 'MSN-089', time: '07:25',
  },
  {
    id: 7, read: true, type: 'work_done', role: 'technician',
    name: 'Amine Cherif', specialite: 'Multi-skilled',
    site: 'Hussein Dey', ref: 'MSN-083', time: '06:10',
  },
  {
    id: 8, read: true, type: 'completed', role: 'driver',
    name: 'Omar Meziane', vehicule: 'Van — 07-DZ-490',
    site: 'Hussein Dey', ref: 'MSN-083', time: '06:00',
  },
  {
    id: 9, read: true, type: 'unavailable', role: 'driver',
    name: 'Yacine Brahim', vehicule: 'Truck — 14-DZ-228',
    site: null, ref: null, time: 'Yesterday',
  },
  {
    id: 10, read: true, type: 'available', role: 'technician',
    name: 'Riad Ouali', specialite: 'Generator',
    site: null, ref: null, time: 'Yesterday',
  },
  {
    id: 11, read: true, type: 'departure', role: 'driver',
    name: 'Karim Benali', vehicule: 'Van — 16-DZ-142',
    site: 'Hydra Site', ref: 'MSN-082', time: 'Yesterday',
  },
  {
    id: 12, read: true, type: 'report', role: 'technician',
    name: 'Sofiane Tebbal', specialite: 'Site Air Conditioning',
    site: 'Dar El Beida', ref: 'MSN-088', time: 'Yesterday',
  },
]

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

export function NotificationProvider({ children }) {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)

  const markAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{ notifs, unreadCount, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
