export default function StatCard({ title, value, sub, icon, color = '#3b82f6', trend, delay = 0 }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        animationDelay: `${delay}s`,
        opacity: 0,
        animation: `slideUp 0.4s ease ${delay}s forwards`,
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: `${color}18`, filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
          {title}
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${color}18`, border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
        }}>
          {icon}
        </div>
      </div>

      <div className="stat-number" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '6px' }}>
        {value}
      </div>

      {sub && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {sub}
        </div>
      )}

      {trend !== undefined && (
        <div style={{
          marginTop: '12px', paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          fontSize: '12px',
          color: trend >= 0 ? '#22c55e' : '#ef4444',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend).toFixed(1)}% vs last month</span>
        </div>
      )}
    </div>
  );
}
