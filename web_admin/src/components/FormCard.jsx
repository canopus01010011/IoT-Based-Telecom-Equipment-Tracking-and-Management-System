export default function FormCard({ title, children, padding = 20, titleMargin = 14 }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border-strong)', borderRadius:10, padding, marginBottom:14 }}>
      {title && (
        <p style={{ fontSize:11, fontWeight:500, color:'#60a5fa', letterSpacing:'.05em', textTransform:'uppercase', marginBottom: titleMargin }}>
          {title}
        </p>
      )}
      {children}
    </div>
  )
}
