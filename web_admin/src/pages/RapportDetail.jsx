import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PageLayout  from '../components/PageLayout'
import FormCard    from '../components/FormCard'
import StatusBadge from '../components/StatusBadge'
import { useT }    from '../context/LanguageContext'

const lbl = { fontSize:11, color:'rgba(148,163,184,.5)', marginBottom:3 }
const val = { fontSize:13, color:'#e2e8f0' }

export default function RapportDetail() {
  const t        = useT()
  const { id }   = useParams()
  const navigate = useNavigate()
  const [rapport, setRapport]         = useState(null)
  const [commentaire, setComment]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [actionDone, setActionDone]   = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    axios.get(`/api/missions/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      params: { include: 'report' }
    })
      .then(r => {
        const raw = r.data
        const site = raw.Site || {}
        const tech = raw.technician || raw.driver || {}
        const report = raw.Report || {}
        setRapport({
          id: raw.id, reference: raw.id, site: site.name || '',
          gps: site.latitude && site.longitude ? `${site.latitude}, ${site.longitude}` : '',
          date: raw.scheduled_start_date ? raw.scheduled_start_date.split('T')[0] : '',
          heureDebut: raw.start_date ? new Date(raw.start_date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '',
          heureFin: raw.end_date ? new Date(raw.end_date).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '',
          statut: raw.status,
          technicien: { nom: tech.full_name || '', telephone: tech.phone || '' },
          travaux: report.description || '',
          materiel: Array.isArray(raw.equipment_list) ? raw.equipment_list.map(e => e.equipment_id) : [],
          incidents: '',
          photos: report.delivery_photo_url || [],
        })
        if (report.notes) setComment(report.notes)
      })
      .catch(() => navigate('/dashboard/rapports'))
  }, [id, navigate])

  const handleAction = async (action) => {
    setLoading(true)
    setActionError('')
    try {
      await axios.patch(`/api/missions/${id}/status`, {
        status: action === 'Approved' ? 'completed' : 'pending',
        notes: commentaire || undefined,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setActionDone(action)
      setTimeout(() => navigate('/dashboard/rapports'), 1500)
    } catch (err) {
      setActionDone('')
      setActionError(err.response?.data?.message || t.errorUpdating)
    } finally {
      setLoading(false)
    }
  }

  if (!rapport) return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color:'rgba(148,163,184,.4)', fontSize:13 }}>{t.loading}</p>
      </div>
    </div>
  )

  return (
    <PageLayout title={`Report — ${rapport.reference}`} maxWidth="max-w-3xl">

      {actionDone && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
          style={actionDone === 'Approved'
            ? { background:'rgba(34,197,94,.1)', color:'#4ade80', border:'0.5px solid rgba(34,197,94,.2)' }
            : { background:'rgba(239,68,68,.1)', color:'#f87171', border:'0.5px solid rgba(239,68,68,.2)' }
          }>
          {t.statuses[actionDone] ?? actionDone} — redirecting…
        </div>
      )}
      {actionError && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'0.5px solid rgba(239,68,68,.2)' }}>
          {actionError}
        </div>
      )}

      <FormCard title={t.technician}>
        <div className="grid grid-cols-3 gap-4">
          <div><p style={lbl}>{t.name}</p><p style={val}>{rapport.technicien?.nom}</p></div>
          <div><p style={lbl}>{t.phone}</p><p style={val}>{rapport.technicien?.telephone}</p></div>
          <div><p style={lbl}>{t.missionRef}</p><p style={{ ...val, color:'#60a5fa' }}>{rapport.reference}</p></div>
        </div>
      </FormCard>

      <FormCard title={t.siteLocation}>
        <div className="grid grid-cols-2 gap-4">
          <div><p style={lbl}>{t.siteName}</p><p style={val}>{rapport.site}</p></div>
          <div><p style={lbl}>{t.gpsCoordinates}</p><p style={{ ...val, color:'#60a5fa' }}>📍 {rapport.gps || '—'}</p></div>
        </div>
      </FormCard>

      <FormCard title={t.interventionSchedule}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div><p style={lbl}>{t.date}</p><p style={val}>{rapport.date}</p></div>
          <div><p style={lbl}>{t.heureDebut}</p><p style={val}>{rapport.heureDebut || '—'}</p></div>
          <div><p style={lbl}>{t.heureFin}</p><p style={val}>{rapport.heureFin || '—'}</p></div>
        </div>
        <div className="mb-4">
          <p style={lbl}>{t.workPerformed}</p>
          <p style={{ ...val, lineHeight:1.7, marginTop:4 }}>{rapport.travaux || t.noIncidents}</p>
        </div>
        <div className="mb-4">
          <p style={lbl}>{t.materialsUsed}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {rapport.materiel?.length > 0
              ? rapport.materiel.map(m => (
                  <span key={m} style={{ background:'rgba(59,130,246,.08)', border:'0.5px solid rgba(59,130,246,.2)', borderRadius:6, padding:'3px 10px', fontSize:11, color:'#93c5fd' }}>{m}</span>
                ))
              : <span style={{ fontSize:11, color:'rgba(148,163,184,.4)' }}>—</span>}
          </div>
        </div>
      </FormCard>

      {rapport.photos?.length > 0 && (
        <FormCard title={t.sitePhotos}>
          <div className="grid grid-cols-3 gap-3">
            {rapport.photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ display:'block' }}>
                <div style={{ background:'#0d1426', border:'0.5px solid rgba(59,130,246,.15)', borderRadius:8, height:80, overflow:'hidden', cursor:'pointer' }}>
                  <img src={url} alt={`Photo ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.target.style.display='none'; e.target.parentElement.style.display='flex'; e.target.parentElement.style.alignItems='center'; e.target.parentElement.style.justifyContent='center'; e.target.parentElement.innerHTML='📷'; e.target.parentElement.style.fontSize='20px' }} />
                </div>
              </a>
            ))}
          </div>
        </FormCard>
      )}

      <FormCard title={t.adminValidation}>
        <div className="mb-4">
          <p style={lbl}>{t.status}</p>
          <StatusBadge statut={rapport.statut} />
        </div>
        <textarea
          value={commentaire}
          onChange={e => setComment(e.target.value)}
          placeholder={t.commentPlaceholder}
          rows={3}
          style={{ width:'100%', background:'#0d1426', border:'0.5px solid rgba(59,130,246,.25)', borderRadius:7, padding:'10px 12px', fontSize:13, color:'#e2e8f0', outline:'none', resize:'vertical', marginBottom:14 }}
        />
        <div className="flex gap-3">
          <button onClick={() => handleAction('Approved')} disabled={loading || rapport.statut === 'completed'}
            style={{ background:'rgba(34,197,94,.12)', border:'0.5px solid rgba(34,197,94,.3)', color:'#4ade80', borderRadius:8, padding:'9px 20px', fontSize:13, fontWeight:500, cursor:'pointer', opacity: loading || rapport.statut === 'completed' ? .6 : 1 }}>
            {t.approveReport}
          </button>
          <button onClick={() => handleAction('Rejected')} disabled={loading || rapport.statut === 'pending'}
            style={{ background:'rgba(239,68,68,.1)', border:'0.5px solid rgba(239,68,68,.25)', color:'#f87171', borderRadius:8, padding:'9px 20px', fontSize:13, cursor:'pointer', opacity: loading || rapport.statut === 'pending' ? .6 : 1 }}>
            {t.reject}
          </button>
          <button onClick={() => navigate('/dashboard/rapports')}
            style={{ background:'transparent', border:'0.5px solid rgba(148,163,184,.2)', color:'rgba(148,163,184,.6)', borderRadius:8, padding:'9px 20px', fontSize:13, cursor:'pointer' }}>
            {t.back}
          </button>
        </div>
      </FormCard>

    </PageLayout>
  )
}
