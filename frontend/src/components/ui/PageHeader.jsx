export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '26px',
          color: 'var(--text-primary)', marginBottom: '4px',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
