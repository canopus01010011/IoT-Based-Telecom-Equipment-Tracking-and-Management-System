import { useState } from 'react'
import axios from 'axios'
import PageLayout from '../components/PageLayout'
import FormCard   from '../components/FormCard'
import { useT, useLang } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const t = useT()
  const { lang, setLang } = useLang()
  const { theme, setTheme } = useTheme()

  const [nom, setNom]             = useState('Administrator')
  const [email, setEmail]         = useState('admin@erctrac.dz')
  const [mdpActuel, setMdpA]      = useState('')
  const [mdpNouv, setMdpN]        = useState('')
  const [mdpConf, setMdpC]        = useState('')
  const [saved, setSaved]         = useState(false)
  const [saveError, setSaveError] = useState('')
  const [loading, setLoading]     = useState(false)

  const handleSave = async e => {
    e.preventDefault()
    setSaveError('')
    if (mdpNouv && mdpNouv !== mdpConf) { setSaveError(t.passwordMismatch); return }
    setLoading(true)
    try {
      const payload = { full_name: nom, email }
      if (mdpActuel && mdpNouv) { payload.currentPassword = mdpActuel; payload.newPassword = mdpNouv }
      await axios.patch('/api/auth/profile', payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      setMdpA(''); setMdpN(''); setMdpC('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err.response?.data?.message || t.errorUpdating)
    } finally {
      setLoading(false)
    }
  }

  const inp = { background:'var(--bg-input)', border:'0.5px solid rgba(59,130,246,.25)', color:'var(--text-primary)', borderRadius:7, padding:'9px 12px', fontSize:13, width:'100%', outline:'none' }
  const lbl = { display:'block', fontSize:11, color:'var(--text-secondary)', marginBottom:5 }

  return (
    <PageLayout title={t.settingsTitle} maxWidth="max-w-2xl">

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background:'rgba(34,197,94,.1)', color:'#4ade80', border:'0.5px solid rgba(34,197,94,.2)' }}>
          {t.changesSaved}
        </div>
      )}
      {saveError && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'0.5px solid rgba(239,68,68,.2)' }}>
          {saveError}
        </div>
      )}

      <form onSubmit={handleSave}>
        <FormCard title={t.adminProfile} padding={24} titleMargin={16}>
          <div className="flex items-center gap-4 mb-5">
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#1d4ed8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:500, color:'#e2e8f0' }}>A</div>
            <div>
              <p style={{ fontSize:15, fontWeight:500, color:'var(--text-primary)' }}>{nom}</p>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label style={lbl}>{t.fullName}</label><input value={nom} onChange={e => setNom(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>{t.emailAddress}</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} /></div>
          </div>
        </FormCard>

        <FormCard title={t.changePassword} padding={24} titleMargin={16}>
          <div className="flex flex-col gap-4">
            <div><label style={lbl}>{t.currentPassword}</label><input type="password" value={mdpActuel} onChange={e => setMdpA(e.target.value)} placeholder="••••••••" style={inp} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label style={lbl}>{t.newPassword}</label><input type="password" value={mdpNouv} onChange={e => setMdpN(e.target.value)} placeholder="••••••••" style={inp} /></div>
              <div><label style={lbl}>{t.confirm}</label><input type="password" value={mdpConf} onChange={e => setMdpC(e.target.value)} placeholder="••••••••" style={inp} /></div>
            </div>
            {mdpNouv && mdpConf && mdpNouv !== mdpConf && (
              <p style={{ fontSize:11, color:'#f87171' }}>{t.passwordMismatch}</p>
            )}
          </div>
        </FormCard>

        <div className="flex justify-end mb-6">
          <button type="submit" disabled={loading}
            style={{ background:'#1d4ed8', color:'#e2e8f0', border:'none', borderRadius:8, padding:'10px 28px', fontSize:13, fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
            {loading ? t.saving : t.saveChanges}
          </button>
        </div>
      </form>

      <FormCard title={t.languageSection} padding={24} titleMargin={4}>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>{t.languageSubtitle}</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { code:'en', flag:'🇬🇧', label:t.english, sub:'English'  },
            { code:'fr', flag:'🇫🇷', label:t.french,  sub:'Français' },
          ].map(({ code, flag, label, sub }) => (
            <div key={code} onClick={() => setLang(code)}
              style={{ border: lang === code ? '1.5px solid #3b82f6' : '0.5px solid var(--border-default)', background: lang === code ? 'rgba(59,130,246,.1)' : 'transparent', borderRadius:10, padding:'16px 18px', cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:26 }}>{flag}</span>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color: lang === code ? '#60a5fa' : 'var(--text-primary)' }}>{label}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{sub}</p>
              </div>
              {lang === code && <span style={{ marginLeft:'auto', fontSize:16, color:'#60a5fa' }}>✓</span>}
            </div>
          ))}
        </div>
      </FormCard>

      <FormCard title={t.themeSection} padding={24} titleMargin={4}>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>{t.themeSubtitle}</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { key:'dark',  icon:'🌙', label:t.darkTheme,  sub:'Dark mode'  },
            { key:'light', icon:'☀️', label:t.lightTheme, sub:'Light mode' },
          ].map(({ key, icon, label, sub }) => (
            <div key={key} onClick={() => setTheme(key)}
              style={{ border: theme === key ? '1.5px solid #3b82f6' : '0.5px solid var(--border-default)', background: theme === key ? 'rgba(59,130,246,.1)' : 'transparent', borderRadius:10, padding:'16px 18px', cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:26 }}>{icon}</span>
              <div>
                <p style={{ fontSize:14, fontWeight:500, color: theme === key ? '#60a5fa' : 'var(--text-primary)' }}>{label}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{sub}</p>
              </div>
              {theme === key && <span style={{ marginLeft:'auto', fontSize:16, color:'#60a5fa' }}>✓</span>}
            </div>
          ))}
        </div>
      </FormCard>

    </PageLayout>
  )
}
