import { useT } from '../context/LanguageContext'

const BADGE_STYLES = {
  'pending':     { background: 'rgba(234,179,8,.1)',   color: '#fbbf24' },
  'in-progress': { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  'completed':   { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
  'In Progress': { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  'En Route':    { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  'On Site':     { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
  'Pending':     { background: 'rgba(234,179,8,.1)',   color: '#fbbf24' },
  'Incident':    { background: 'rgba(239,68,68,.12)',  color: '#f87171' },
  'Cancelled':   { background: 'rgba(148,163,184,.1)', color: '#94a3b8' },
  'Completed':   { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
  'Approved':    { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
  'Rejected':    { background: 'rgba(239,68,68,.12)',  color: '#f87171' },
  'Available':   { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
  'On Mission':  { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  'Unavailable': { background: 'rgba(148,163,184,.1)', color: '#94a3b8' },
}

export default function StatusBadge({ statut }) {
  const t = useT()
  const style = BADGE_STYLES[statut] || { background: 'rgba(148,163,184,.1)', color: '#94a3b8' }

  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:500, ...style }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor' }} />
      {t.statuses[statut] ?? statut}
    </span>
  )
}
