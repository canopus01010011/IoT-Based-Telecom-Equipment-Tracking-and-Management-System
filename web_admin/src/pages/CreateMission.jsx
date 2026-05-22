import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PageLayout from '../components/PageLayout'
import FormCard   from '../components/FormCard'
import { useT }   from '../context/LanguageContext'

const JSON_EXEMPLE = `{
  "status": "pending",
  "scheduled_start_date": "2024-04-15T08:30:00Z",
  "scheduled_end_date": "2024-04-15T17:00:00Z",
  "driver_id": 1,
  "technician_id": 2,
  "site_id": 3,
  "container_id": "CTN-2024-001",
  "equipment_list": [
    { "equipment_id": "FIB-001", "quantity": 2 },
    { "equipment_id": "CAB-003", "quantity": 1 }
  ]
}`

export default function CreateMission() {
  const t        = useT()
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const [mission,    setMission]    = useState(null)
  const [fileName,   setFileName]   = useState('')
  const [jsonError,  setJsonError]  = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)

  const parseJSON = (text, name) => {
    setJsonError('')
    try {
      setMission(JSON.parse(text))
      setFileName(name)
    } catch {
      setJsonError(t.invalidJson)
      setMission(null)
    }
  }

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.json')) { setJsonError(t.selectJsonFile); return }
    const reader = new FileReader()
    reader.onload = ev => parseJSON(ev.target.result, file.name)
    reader.readAsText(file)
  }

  const handleDrop = e => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => parseJSON(ev.target.result, file.name)
    reader.readAsText(file)
  }

  const handleLancer = async () => {
    setLoading(true)
    try {
      await axios.post('/api/missions/from-json', { mission }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/historique'), 1500)
    } catch {
      setJsonError(t.missionError)
    } finally {
      setLoading(false)
    }
  }

  const downloadExample = () => {
    const blob = new Blob([JSON_EXEMPLE], { type:'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'mission-example.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => { setMission(null); setFileName(''); setJsonError('') }

  // ── Theme-aware styles ──────────────────────────────────────────────────────
  const rowL = { fontSize: 10, color: 'var(--text-muted)' }
  const rowV = { fontSize: 13, color: 'var(--text-primary)' }

  return (
    <PageLayout title={t.createMissionPageTitle} maxWidth="max-w-2xl">

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background:'rgba(34,197,94,.1)', color:'#4ade80', border:'0.5px solid rgba(34,197,94,.2)' }}>
          {t.missionLaunched}
        </div>
      )}

      {/* ── Step 1: Import JSON ─────────────────────────────────────────────── */}
      {!mission && (
        <FormCard title={t.importJsonFile}>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:-34, marginBottom:14 }}>
            <button onClick={downloadExample} type="button"
              style={{ background:'rgba(59,130,246,.08)', border:'0.5px solid rgba(59,130,246,.2)', color:'#60a5fa', borderRadius:6, padding:'4px 12px', fontSize:11, cursor:'pointer' }}>
              {t.downloadExample}
            </button>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: isDragging ? '1.5px dashed #3b82f6' : '1px dashed var(--border-strong)',
              borderRadius: 10, padding: '36px 20px', textAlign: 'center',
              background: isDragging ? 'rgba(59,130,246,.06)' : 'var(--bg-accent)',
              cursor: 'pointer', transition: 'all .15s'
            }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
            <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:4 }}>{t.dropFileHere}</p>
            <p style={{ fontSize:11, color:'var(--text-muted)' }}>{t.orClickBrowse}</p>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display:'none' }} />
          </div>

          {jsonError && <p style={{ fontSize:11, color:'#f87171', marginTop:10 }}>{jsonError}</p>}

          {/* JSON preview */}
          <div style={{ marginTop:14, background:'var(--bg-sub)', border:'0.5px solid var(--border-label)', borderRadius:8, padding:12 }}>
            <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:6 }}>{t.expectedFormat}</p>
            <pre style={{ fontSize:10, color:'var(--text-secondary)', lineHeight:1.7, margin:0, overflowX:'auto' }}>{JSON_EXEMPLE}</pre>
          </div>
        </FormCard>
      )}

      {/* ── Step 2: Review & Launch ─────────────────────────────────────────── */}
      {mission && (
        <>
          {/* File imported banner */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, background:'var(--bg-card)', border:'0.5px solid rgba(34,197,94,.2)', borderRadius:10, padding:'12px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>✅</span>
              <div>
                <p style={{ fontSize:13, fontWeight:500, color:'#4ade80' }}>{t.fileImported}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)' }}>{fileName}</p>
              </div>
            </div>
            <button onClick={reset} type="button"
              style={{ background:'rgba(239,68,68,.08)', border:'0.5px solid rgba(239,68,68,.2)', color:'#f87171', borderRadius:6, padding:'4px 12px', fontSize:11, cursor:'pointer' }}>
              {t.changeFile}
            </button>
          </div>

          {/* Mission details */}
          <FormCard title={t.missionDetails}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
              {[
                { label: t.date,             value: mission.scheduled_start_date ? mission.scheduled_start_date.split('T')[0] : mission.date, span:1 },
                { label: t.timeLabel,        value: mission.scheduled_start_date ? mission.scheduled_start_date.split('T')[1]?.split('Z')[0] : mission.heure, span:1 },
                { label: t.departureAddress, value: mission.adresseDepart, span:1 },
                { label: t.siteAddress,      value: `Site #${mission.site_id}` + (mission.adresseArrivee ? ` — ${mission.adresseArrivee}` : ''), span:2 },
              ].filter(f => f.value).map(({ label, value, span }) => (
                <div key={label} style={{ display:'flex', flexDirection:'column', gap:3, gridColumn: span === 2 ? 'span 2' : undefined }}>
                  <span style={rowL}>{label}</span>
                  <span style={rowV}>{value || '—'}</span>
                </div>
              ))}
            </div>
          </FormCard>

          {/* Driver & Container */}
          <FormCard title={t.driverVehicle}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                <span style={rowL}>{t.assignedDriver}</span>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'#1d4ed8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:'#fff', flexShrink:0 }}>
                    {mission.driver ? mission.driver.split(' ').map(n=>n[0]).join('').slice(0,2) : mission.driver_id ? `D${mission.driver_id}` : '?'}
                  </div>
                  <span style={rowV}>{mission.driver || `Driver #${mission.driver_id}` || '—'}</span>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                <span style={rowL}>{t.container}</span>
                <span style={rowV}>{mission.container_id || mission.conteneur || '—'}</span>
              </div>
            </div>
          </FormCard>

          {/* Technician */}
          <FormCard title={t.technicians}>
            {mission.technician_id ? (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'var(--bg-sub)', border:'0.5px solid var(--border-default)', borderRadius:8 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'#0f6e56', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:'#fff', flexShrink:0 }}>
                  T{mission.technician_id}
                </div>
                <p style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>Technician #{mission.technician_id}</p>
              </div>
            ) : (
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{t.noTechnicians}</p>
            )}
          </FormCard>

          {/* Equipment */}
          <FormCard title={t.telecomEquipSection}>
            {Array.isArray(mission.equipment_list) && mission.equipment_list.length > 0 ? (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {mission.equipment_list.map((eq, i) => (
                  <span key={i} style={{ background:'rgba(59,130,246,.12)', border:'0.5px solid rgba(59,130,246,.25)', color:'#93c5fd', fontSize:12, padding:'5px 12px', borderRadius:7 }}>
                    {eq.equipment_id || eq}{eq.quantity ? ` ×${eq.quantity}` : ''}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{t.noEquipment}</p>
            )}
          </FormCard>

          {/* Description */}
          {(mission.description || mission.status) && (
            <FormCard title={t.descriptionLabel}>
              <p style={{ fontSize:13, color:'var(--text-table)', lineHeight:1.7 }}>{mission.description || mission.status}</p>
            </FormCard>
          )}

          {jsonError && <p style={{ fontSize:12, color:'#f87171', marginBottom:10 }}>{jsonError}</p>}

          {/* Actions */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button onClick={() => navigate('/dashboard')} type="button"
              style={{ background:'transparent', border:'0.5px solid var(--border-strong)', color:'var(--text-secondary)', borderRadius:8, padding:'11px 20px', fontSize:13, cursor:'pointer' }}>
              {t.cancel}
            </button>
            <button onClick={handleLancer} disabled={loading}
              style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:8, padding:'11px 28px', fontSize:13, fontWeight:500, cursor:'pointer', opacity: loading ? .6 : 1 }}>
              {loading ? t.launching : t.launchMission}
            </button>
          </div>
        </>
      )}

    </PageLayout>
  )
}
