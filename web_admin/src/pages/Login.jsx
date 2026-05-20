import { useState } from 'react'
import axios from 'axios'
import logo from '../assets/logo.js'
import { useNavigate, Link } from 'react-router-dom'
import { useT } from '../context/LanguageContext'

const highlights = [
  { icon: '📡', text: 'Live mission & GPS tracking' },
  { icon: '🔧', text: 'Telecom equipment management' },
  { icon: '📋', text: 'Field reports & admin validation' },
  { icon: '👥', text: 'Drivers & technicians oversight' },
]

export default function Login() {
  const t = useT()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.tokens.accessToken)
      navigate('/dashboard')
    } catch (err) {
      localStorage.removeItem('token')
      setError(err.response?.data?.error || err.response?.data?.message || t.invalidCredentials)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#070c18', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '-30%', left: '20%', width: 600, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(59,130,246,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── Left branding panel ── */}
      <div style={{
        width: 440, flexShrink: 0, position: 'relative',
        background: 'linear-gradient(170deg, #080f22 0%, #0a1530 50%, #0c1a3d 100%)',
        borderRight: '1px solid rgba(59,130,246,.12)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '44px 40px',
        overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(59,130,246,.08)' }} />
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', border: '1px solid rgba(59,130,246,.06)' }} />
        <div style={{ position: 'absolute', bottom: 80, left: -80, width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(59,130,246,.05)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.2)', flexShrink: 0 }}>
              <img src={`data:image/png;base64,${logo}`} alt="ErcTrac" style={{ width: 44, height: 44, objectFit: 'cover', display: 'block' }} />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.4px' }}>
                Erc<span style={{ color: '#3b82f6' }}>Trac</span>
              </p>
              <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>{t.telecomAdmin}</p>
            </div>
          </div>

          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#e2e8f0', lineHeight: 1.2, letterSpacing: '-0.8px', marginBottom: 14 }}>
            The admin platform<br />
            for <span style={{ color: '#3b82f6' }}>telecom missions</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,.45)', lineHeight: 1.75, marginBottom: 44 }}>
            Centralize mission creation, live tracking, equipment reports and team management in one place.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {highlights.map(h => (
              <div key={h.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {h.icon}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(148,163,184,.65)' }}>{h.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontSize: 11, color: 'rgba(148,163,184,.2)' }}>
          © ErcTrac — Telecom Platform
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px', marginBottom: 8 }}>
              {t.loginTitle}
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(148,163,184,.45)' }}>{t.loginSubtitle}</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(148,163,184,.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t.emailAddress}
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@erctrac.dz" required
                style={{ width: '100%', background: '#0d1426', border: '1px solid rgba(59,130,246,.2)', borderRadius: 9, padding: '12px 14px', fontSize: 13, color: '#e2e8f0', outline: 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(148,163,184,.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {t.password}
                </label>
                <span style={{ fontSize: 11, color: 'rgba(96,165,250,.5)', cursor: 'pointer' }}>{t.forgotPassword}</span>
              </div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width: '100%', background: '#0d1426', border: '1px solid rgba(59,130,246,.2)', borderRadius: 9, padding: '12px 14px', fontSize: 13, color: '#e2e8f0', outline: 'none' }}
              />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: '#1d4ed8', color: '#fff', border: 'none',
              borderRadius: 9, padding: '13px', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              letterSpacing: '-0.2px', marginTop: 4,
            }}>
              {loading ? t.signingIn : t.loginTitle}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
