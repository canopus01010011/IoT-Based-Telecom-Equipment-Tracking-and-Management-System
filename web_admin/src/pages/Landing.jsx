import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.js'
import { useT } from '../context/LanguageContext'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
      </svg>
    ),
    color: '#3b82f6',
    bg: 'rgba(59,130,246,.1)',
    border: 'rgba(59,130,246,.2)',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    color: '#4ade80',
    bg: 'rgba(34,197,94,.08)',
    border: 'rgba(34,197,94,.2)',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    color: '#a78bfa',
    bg: 'rgba(167,139,250,.08)',
    border: 'rgba(167,139,250,.2)',
  },
]

const stats = [
  { value: '500+', label: 'Missions tracked' },
  { value: '98%',  label: 'Uptime' },
  { value: '12',   label: 'Site types covered' },
  { value: '24/7', label: 'Real-time monitoring' },
]

export default function Landing() {
  const navigate = useNavigate()
  const t = useT()

  const featureData = [
    { title: t.f1Title, desc: t.f1Desc },
    { title: t.f2Title, desc: t.f2Desc },
    { title: t.f3Title, desc: t.f3Desc },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#070c18', color: '#e2e8f0', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(59,130,246,.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 66, borderBottom: '1px solid rgba(59,130,246,.1)', background: 'rgba(7,12,24,.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', background: 'rgba(59,130,246,.15)', flexShrink: 0 }}>
            <img src={`data:image/png;base64,${logo}`} alt="ErcTrac" style={{ width: 38, height: 38, objectFit: 'cover', display: 'block' }} />
          </div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
              Erc<span style={{ color: '#3b82f6' }}>Trac</span>
            </p>
            <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>{t.telecomAdmin}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', color: 'rgba(148,163,184,.7)', border: '1px solid rgba(59,130,246,.2)', padding: '8px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
            {t.signInBtn}
          </button>
          <button onClick={() => navigate('/login')}
            style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {t.goDashboard} →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px 60px' }}>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 20, padding: '5px 16px', fontSize: 11, color: '#60a5fa', letterSpacing: '0.08em', marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
          {t.landingTagline}
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: 20, maxWidth: 680 }}>
          {t.landingTitle.split(' ').slice(0, 4).join(' ')}{' '}
          <span style={{ color: '#3b82f6' }}>{t.landingTitle.split(' ').slice(4).join(' ')}</span>
        </h1>

        <p style={{ fontSize: 15, color: 'rgba(148,163,184,.6)', maxWidth: 480, lineHeight: 1.8, marginBottom: 40 }}>
          {t.landingSubtitle}
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 72 }}>
          <button onClick={() => navigate('/login')}
            style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.2px' }}>
            {t.goDashboard}
          </button>
          <button style={{ background: 'transparent', color: '#60a5fa', border: '1px solid rgba(59,130,246,.3)', padding: '13px 28px', borderRadius: 9, fontSize: 14, cursor: 'pointer' }}>
            {t.learnMore}
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.15)', borderRadius: 14, overflow: 'hidden', width: '100%', maxWidth: 640, marginBottom: 72 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#0a0f1e', padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px', marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,.45)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, width: '100%', maxWidth: 740 }}>
          {featureData.map((f, i) => {
            const feat = features[i]
            return (
              <div key={i} style={{ background: '#0d1426', border: `1px solid ${feat.border}`, borderRadius: 14, padding: '24px 20px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 100%', background: feat.bg, opacity: 0.5 }} />
                <div style={{ width: 44, height: 44, borderRadius: 11, background: feat.bg, border: `1px solid ${feat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color, marginBottom: 16 }}>
                  {feat.icon}
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 8, letterSpacing: '-0.2px' }}>{f.title}</p>
                <p style={{ fontSize: 12, color: 'rgba(148,163,184,.5)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px', borderTop: '1px solid rgba(59,130,246,.08)', fontSize: 11, color: 'rgba(148,163,184,.25)' }}>
        © ErcTrac — Telecom Platform
      </div>
    </div>
  )
}
