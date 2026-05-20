export default function StatCard({ label, value, color = '#e2e8f0', icon }) {
  return (
    <div style={{
      background: '#0d1426',
      border: '1px solid rgba(59,130,246,.12)',
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      {icon && (
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: `${color}14`,
          border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
      )}
      <div>
        <p style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</p>
        <p style={{ fontSize: 11, color: 'rgba(148,163,184,.5)', marginTop: 4 }}>{label}</p>
      </div>
    </div>
  )
}
