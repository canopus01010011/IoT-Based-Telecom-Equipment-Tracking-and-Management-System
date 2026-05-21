import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PageLayout  from '../components/PageLayout'
import FormCard    from '../components/FormCard'
import { useT }    from '../context/LanguageContext'

const MOCK = {
  id:1, reference:'MSN-087', site:'BTS Bab Ezzouar', gps:'36.7372, 3.1897',
  date:'12 Apr 2024', heureDebut:'08:30', heureFin:'12:15', statut:'Pending',
  technicien:{ nom:'Karim Benali', telephone:'+213 550 12 34' },
  travaux:'Replacement of fiber optic cables in the North sector. Installation of new 4G antenna on tower P-12. Verification of network connections.',
  materiel:['Fiber optic 50m','SC/APC Connectors','4G Antenna','RJ45 Cables'],
  incidents:'Tower P-12 slightly corroded — flagged for preventive maintenance.',
  photos:[1,2,3],
}

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
    axios.get(`/api/missions/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => setRapport(d => {
        const raw = r.data.mission || r.data;
        if (raw.technicien) return raw; // already has mock-like format
        return {
          ...d, id: raw.id, reference: raw.id, site: raw.Site?.name || raw.site || '',
          gps: raw.gps_coordinates || '', date: raw.scheduled_start_date ? raw.scheduled_start_date.split('T')[0] : '',
          heureDebut: '', heureFin: '',
          statut: raw.status === 'completed' ? 'Approved' : raw.status === 'in-progress' ? 'Pending' : raw.status,
          technicien: { nom: raw.technician?.full_name || raw.driver?.full_name || '', telephone: raw.technician?.phone || raw.driver?.phone || '' },
          travaux: raw.description || raw.travaux || '', materiel: Array.isArray(raw.equipment_list) ? raw.equipment_list.map(e => e.equipment_id) : (raw.materiel || []),
          incidents: raw.incidents || ''
        };
      })).catch(() => setRapport(MOCK))
  }, [id])

  const handleAction = async (action) => {
    setLoading(true)
    setActionError('')
    try {
      await axios.patch(`/api/missions/${id}/status`, { status: action === 'Approved' ? 'completed' : 'in-progress' }, {
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
          <div><p style={lbl}>{t.gpsCoordinates}</p><p style={{ ...val, color:'#60a5fa' }}>📍 {rapport.gps}</p></div>
        </div>
      </FormCard>

      <FormCard title={t.interventionSchedule}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div><p style={lbl}>{t.date}</p><p style={val}>{rapport.date}</p></div>
          <div><p style={lbl}>{t.heureDebut}</p><p style={val}>{rapport.heureDebut}</p></div>
          <div><p style={lbl}>{t.heureFin}</p><p style={val}>{rapport.heureFin}</p></div>
        </div>
        <div className="mb-4">
          <p style={lbl}>{t.workPerformed}</p>
          <p style={{ ...val, lineHeight:1.7, marginTop:4 }}>{rapport.travaux}</p>
        </div>
        <div className="mb-4">
          <p style={lbl}>{t.materialsUsed}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {rapport.materiel?.map(m => (
              <span key={m} style={{ background:'rgba(59,130,246,.08)', border:'0.5px solid rgba(59,130,246,.2)', borderRadius:6, padding:'3px 10px', fontSize:11, color:'#93c5fd' }}>{m}</span>
            ))}
          </div>
        </div>
        <div>
          <p style={lbl}>{t.issuesIncidents}</p>
          <p style={{ ...val, color: rapport.incidents ? '#fbbf24' : 'rgba(148,163,184,.4)', marginTop:4 }}>
            {rapport.incidents || t.noIncidents}
          </p>
        </div>
      </FormCard>

      {rapport.photos?.length > 0 && (
        <FormCard title={t.sitePhotos}>
          <div className="grid grid-cols-3 gap-3">
            {rapport.photos.map((_, i) => (
              <div key={i} style={{ background:'#0d1426', border:'0.5px solid rgba(59,130,246,.15)', borderRadius:8, height:80, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'rgba(148,163,184,.4)' }}>
                📷 Photo {i + 1}
              </div>
            ))}
          </div>
        </FormCard>
      )}

      <FormCard title={t.adminValidation}>
        <textarea
          value={commentaire}
          onChange={e => setComment(e.target.value)}
          placeholder={t.commentPlaceholder}
          rows={3}
          style={{ width:'100%', background:'#0d1426', border:'0.5px solid rgba(59,130,246,.25)', borderRadius:7, padding:'10px 12px', fontSize:13, color:'#e2e8f0', outline:'none', resize:'vertical', marginBottom:14 }}
        />
        <div className="flex gap-3">
          <button onClick={() => handleAction('Approved')} disabled={loading}
            style={{ background:'rgba(34,197,94,.12)', border:'0.5px solid rgba(34,197,94,.3)', color:'#4ade80', borderRadius:8, padding:'9px 20px', fontSize:13, fontWeight:500, cursor:'pointer', opacity: loading ? .6 : 1 }}>
            {t.approveReport}
          </button>
          <button onClick={() => handleAction('Rejected')} disabled={loading}
            style={{ background:'rgba(239,68,68,.1)', border:'0.5px solid rgba(239,68,68,.25)', color:'#f87171', borderRadius:8, padding:'9px 20px', fontSize:13, cursor:'pointer', opacity: loading ? .6 : 1 }}>
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
