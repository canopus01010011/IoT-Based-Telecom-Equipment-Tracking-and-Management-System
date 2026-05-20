import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.js'
import { useT } from '../context/LanguageContext'

const IC = {
  dashboard: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  mission:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  tracking:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>,
  history:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
  reports:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  createUser:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
  drivers:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  techniciens:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  settings:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

export default function Sidebar() {
  const navigate = useNavigate()
  const t = useT()

  const links = [
    { to: '/dashboard',             label: t.dashboard,      icon: IC.dashboard    },
    { to: '/dashboard/missions',    label: t.createMission,  icon: IC.mission      },
    { to: '/dashboard/suivi',       label: t.missionTracking,icon: IC.tracking     },
    { to: '/dashboard/historique',  label: t.history,        icon: IC.history      },
    { to: '/dashboard/rapports',    label: t.reports,        icon: IC.reports      },
    { to: '/dashboard/create-user', label: t.createUser,     icon: IC.createUser   },
    { to: '/dashboard/drivers',     label: t.drivers,        icon: IC.drivers      },
    { to: '/dashboard/techniciens', label: t.techniciensNav, icon: IC.techniciens  },
    { to: '/dashboard/settings',    label: t.settings,       icon: IC.settings     },
  ]

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  return (
    <aside style={{ width:240, minWidth:240, height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg-surface)', borderRight:'1px solid var(--border-subtle)', flexShrink:0 }}>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'20px 18px 18px', borderBottom:'1px solid rgba(59,130,246,.08)' }}>
        <div style={{ width:36, height:36, borderRadius:10, overflow:'hidden', background:'rgba(59,130,246,.15)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={`data:image/png;base64,${logo}`} alt="ErcTrac" style={{ width:36, height:36, objectFit:'cover', display:'block' }} />
        </div>
        <div>
          <p style={{ fontSize:15, fontWeight:600, color:'#e2e8f0', lineHeight:1.2, letterSpacing:'-0.3px' }}>
            Erc<span style={{ color:'#3b82f6' }}>Trac</span>
          </p>
          <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginTop:1 }}>{t.telecomAdmin}</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', padding:'12px 10px' }}>
        <p style={{ fontSize:10, fontWeight:600, color:'rgba(148,163,184,.3)', letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 8px 10px' }}>Menu</p>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
              borderRadius:8, marginBottom:2, fontSize:13,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? '#60a5fa' : 'rgba(148,163,184,.65)',
              background: isActive ? 'rgba(59,130,246,.12)' : 'transparent',
              textDecoration:'none', transition:'all .15s',
            })}>
            {({ isActive }) => (
              <><span style={{ opacity:isActive ? 1 : 0.6, flexShrink:0 }}>{link.icon}</span>{link.label}</>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding:'12px 10px 16px', borderTop:'1px solid rgba(59,130,246,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px', borderRadius:8, background:'rgba(255,255,255,.03)', marginBottom:6 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color:'#fff', flexShrink:0 }}>A</div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:500, color:'#e2e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Administrator</p>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>admin@erctrac.dz</p>
          </div>
        </div>
        <button onClick={logout}
          style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px', borderRadius:8, background:'none', border:'none', cursor:'pointer', fontSize:12, color:'rgba(148,163,184,.45)', transition:'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.color='#f87171'; e.currentTarget.style.background='rgba(239,68,68,.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color='rgba(148,163,184,.45)'; e.currentTarget.style.background='none' }}>
          {IC.logout}{t.logout}
        </button>
      </div>
    </aside>
  )
}
