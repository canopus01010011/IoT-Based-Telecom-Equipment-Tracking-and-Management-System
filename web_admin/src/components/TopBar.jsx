import { useState, useRef, useEffect } from 'react'
import { useT } from '../context/LanguageContext'
import { useNotifications, NOTIF_CONFIG } from '../context/NotificationContext'

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const ICONS = {
  truck:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  'map-pin': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  alert:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  check:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  file:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  wrench:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  'user-off':<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/></svg>,
  'user-ok': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
}

function NotifIcon({ type, read }) {
  const cfg = NOTIF_CONFIG[type]
  return (
    <div style={{ width:36, height:36, borderRadius:9, flexShrink:0, background: read ? 'rgba(148,163,184,.07)' : cfg.bg, border:`1px solid ${read ? 'rgba(148,163,184,.1)' : cfg.color+'40'}`, display:'flex', alignItems:'center', justifyContent:'center', color: read ? 'rgba(148,163,184,.4)' : cfg.color }}>
      {ICONS[cfg.icon]}
    </div>
  )
}

export default function TopBar({ title }) {
  const t = useT()
  const { notifs, unreadCount, markAllRead, markRead } = useNotifications()
  const [open, setOpen]     = useState(false)
  const [filter, setFilter] = useState('all')
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const displayed = filter === 'all' ? notifs : notifs.filter(n => n.role === filter)

  return (
    <header style={{ height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background:'var(--bg-topbar)', borderBottom:'1px solid var(--border-subtle)', flexShrink:0, position:'relative', zIndex:100 }}>
      <h1 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.2px' }}>{title}</h1>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div ref={ref} style={{ position:'relative' }}>
          <button onClick={() => setOpen(v => !v)} style={{ width:36, height:36, borderRadius:8, border: open ? '1px solid rgba(59,130,246,.4)' : '1px solid rgba(59,130,246,.15)', background: open ? 'rgba(59,130,246,.1)' : 'rgba(255,255,255,.03)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: open ? '#60a5fa' : 'rgba(148,163,184,.6)', position:'relative' }}>
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, borderRadius:8, padding:'0 4px', background:'#f87171', border:'2px solid var(--bg-topbar)', fontSize:9, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, width:360, background:'var(--bg-panel)', border:'1px solid var(--border-strong)', borderRadius:14, boxShadow:'0 24px 64px rgba(0,0,0,.4)', overflow:'hidden' }}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(59,130,246,.1)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>Notifications</span>
                    {unreadCount > 0 && <span style={{ fontSize:10, fontWeight:700, background:'#f87171', color:'#fff', borderRadius:20, padding:'1px 7px' }}>{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && <button onClick={markAllRead} style={{ fontSize:11, color:'#60a5fa', background:'none', border:'none', cursor:'pointer', padding:0 }}>Mark all read</button>}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {[{key:'all',label:'All'},{key:'driver',label:'🚛 Drivers'},{key:'technician',label:'🔧 Technicians'}].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{ fontSize:11, padding:'4px 10px', borderRadius:20, cursor:'pointer', background: filter===f.key ? 'rgba(59,130,246,.15)' : 'transparent', border: filter===f.key ? '1px solid rgba(59,130,246,.35)' : '1px solid rgba(59,130,246,.1)', color: filter===f.key ? '#60a5fa' : 'rgba(148,163,184,.5)', fontWeight: filter===f.key ? 600 : 400 }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ maxHeight:360, overflowY:'auto' }}>
                {displayed.length === 0
                  ? <p style={{ textAlign:'center', padding:'28px', fontSize:12, color:'rgba(148,163,184,.4)' }}>No notifications</p>
                  : displayed.map(n => {
                    const cfg = NOTIF_CONFIG[n.type]
                    return (
                      <div key={n.id} onClick={() => markRead(n.id)} style={{ display:'flex', gap:12, padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,.04)', background: n.read ? 'transparent' : 'rgba(59,130,246,.04)', cursor:'pointer' }}>
                        <NotifIcon type={n.type} read={n.read} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                            <span style={{ fontSize:12, fontWeight:600, color: n.read ? 'rgba(148,163,184,.7)' : '#e2e8f0' }}>{n.name}</span>
                            <span style={{ fontSize:10, color: n.read ? 'rgba(148,163,184,.3)' : cfg.color, background: n.read ? 'rgba(148,163,184,.08)' : cfg.bg, padding:'1px 7px', borderRadius:20 }}>{n.role === 'driver' ? 'Driver' : 'Tech.'}</span>
                            {!n.read && <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />}
                          </div>
                          <p style={{ fontSize:11, fontWeight:500, color: n.read ? 'rgba(148,163,184,.45)' : cfg.color, marginBottom:3 }}>{cfg.label}</p>
                          {n.site && <p style={{ fontSize:11, color:'rgba(148,163,184,.5)', marginBottom:3 }}>{n.site}{n.ref && <span style={{ color:'rgba(148,163,184,.3)' }}> · {n.ref}</span>}</p>}
                          <div style={{ display:'flex', gap:6 }}>
                            <span style={{ fontSize:10, color:'rgba(148,163,184,.3)' }}>{n.vehicule || n.specialite}</span>
                            <span style={{ fontSize:10, color:'rgba(148,163,184,.2)' }}>·</span>
                            <span style={{ fontSize:10, color:'rgba(148,163,184,.3)' }}>{n.time}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
              <div style={{ padding:'10px 16px', borderTop:'1px solid rgba(59,130,246,.08)', textAlign:'center' }}>
                <span style={{ fontSize:11, color:'rgba(96,165,250,.45)', cursor:'pointer' }}>View all activity</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ width:1, height:20, background:'rgba(59,130,246,.12)', margin:'0 4px' }} />

        <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'#fff' }}>A</div>
          <div>
            <p style={{ fontSize:12, fontWeight:500, color:'var(--text-primary)', lineHeight:1.2 }}>Admin</p>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', lineHeight:1.2 }}>{t.telecomAdmin}</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
    </header>
  )
}
