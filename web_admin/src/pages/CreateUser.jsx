import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PageLayout from '../components/PageLayout'
import FormCard   from '../components/FormCard'
import { useT }   from '../context/LanguageContext'

export default function CreateUser() {
  const t        = useT()
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [form, setForm] = useState({
    full_name:'', email:'', phone:'',
    password:'', confirm:'', specialite:''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const ROLES = [
    { id:'driver',     label:t.driver,     desc:t.driverDesc,     icon:'🚛', color:'#3b82f6', bg:'rgba(59,130,246,.1)', border:'rgba(59,130,246,.3)'  },
    { id:'technician', label:t.technician, desc:t.technicianDesc, icon:'🔧', color:'#4ade80', bg:'rgba(34,197,94,.08)', border:'rgba(34,197,94,.25)'  },
  ]

  const set = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!role)                           { setError(t.selectRole);           return }
    if (form.password !== form.confirm)  { setError(t.passwordMismatchShort); return }
    if (form.password.length < 6)        { setError(t.passwordTooShortMin);   return }
    setLoading(true)
    try {
      await axios.post('/api/users', {
        full_name: form.full_name, email: form.email, phone: form.phone,
        password: form.password, role,
        ...(role === 'technician' && form.specialite ? { specialite: form.specialite } : {})
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/drivers'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || t.errorUpdating)
    } finally {
      setLoading(false)
    }
  }

  // ── Theme-aware styles ──────────────────────────────────────────────────────
  const inp = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '0.5px solid var(--border-strong)',
    borderRadius: 7,
    padding: '10px 12px',
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
  }
  const lbl = { display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5 }

  return (
    <PageLayout title={t.createUserTitle} maxWidth="max-w-2xl">

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background:'rgba(34,197,94,.1)', color:'#4ade80', border:'0.5px solid rgba(34,197,94,.2)' }}>
          {t.accountCreated}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'0.5px solid rgba(239,68,68,.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Role Selection ─────────────────────────────────────────────── */}
        <FormCard title={t.chooseRole}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {ROLES.map(r => (
              <div key={r.id} onClick={() => setRole(r.id)}
                style={{
                  border: role === r.id ? `1.5px solid ${r.color}` : '0.5px solid var(--border-default)',
                  background: role === r.id ? r.bg : 'var(--bg-item)',
                  borderRadius: 10, padding: 16, cursor: 'pointer', transition: 'all .15s'
                }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{r.icon}</div>
                <p style={{ fontSize:14, fontWeight:500, color: role === r.id ? r.color : 'var(--text-primary)', marginBottom:4 }}>{r.label}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5 }}>{r.desc}</p>
                {role === r.id && (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:8, background:r.bg, border:`0.5px solid ${r.border}`, color:r.color, fontSize:10, fontWeight:500, padding:'2px 8px', borderRadius:20 }}>
                    ✓ {t.selected}
                  </div>
                )}
              </div>
            ))}
          </div>
        </FormCard>

        {/* ── Personal Info ───────────────────────────────────────────────── */}
        <FormCard title={t.personalInfo}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={lbl}>{t.fullName}</label>
              <input name="full_name" value={form.full_name} onChange={set} placeholder="John Smith" required style={inp} />
            </div>
            <div>
              <label style={lbl}>{t.phoneNumber}</label>
              <input type="tel" name="phone" value={form.phone} onChange={set} placeholder="+213 5XX XX XX XX" required style={inp} />
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={lbl}>{t.emailAddress}</label>
              <input type="email" name="email" value={form.email} onChange={set} placeholder="john@erctrac.dz" required style={inp} />
            </div>
          </div>
        </FormCard>

        {/* ── Technician specialty ─────────────────────────────────────────── */}
        {role === 'technician' && (
          <FormCard title={t.technicianInfo}>
            <label style={lbl}>{t.specialty}</label>
            <select name="specialite" value={form.specialite} onChange={set} style={{ ...inp, cursor:'pointer' }}>
              <option value="">{t.chooseSpecialty}</option>
              <option value="Fiber Optics">{t.fiberOptics}</option>
              <option value="Antenna / Tower">{t.antennasTower}</option>
              <option value="Network Cabling">{t.networkCabling}</option>
              <option value="Generator">{t.generator}</option>
              <option value="Site Air Conditioning">{t.siteAC}</option>
              <option value="Multi-skilled">{t.multiskilled}</option>
            </select>
          </FormCard>
        )}

        {/* ── Password ────────────────────────────────────────────────────── */}
        <FormCard title={t.passwordSection}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={lbl}>{t.password}</label>
              <input type="password" name="password" value={form.password} onChange={set} placeholder="••••••••" required style={inp} />
            </div>
            <div>
              <label style={lbl}>{t.confirm}</label>
              <input type="password" name="confirm" value={form.confirm} onChange={set} placeholder="••••••••" required style={inp} />
            </div>
          </div>
          {form.password && form.confirm && form.password !== form.confirm && (
            <p style={{ fontSize:11, color:'#f87171', marginTop:8 }}>{t.passwordMismatchShort}</p>
          )}
        </FormCard>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" onClick={() => navigate('/dashboard')}
            style={{ background:'transparent', border:'0.5px solid var(--border-strong)', color:'var(--text-secondary)', borderRadius:8, padding:'10px 20px', fontSize:13, cursor:'pointer' }}>
            {t.cancel}
          </button>
          <button type="submit" disabled={loading || !role}
            style={{ background: !role ? 'rgba(29,78,216,.4)' : '#1d4ed8', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:500, cursor: !role ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
            {loading ? t.creating : `${ROLES.find(r=>r.id===role)?.label ?? ''} — ${t.createAccount}`}
          </button>
        </div>

      </form>
    </PageLayout>
  )
}
