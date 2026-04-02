export const CustomTooltip = ({ active, payload, label, currency = '₹' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: '0 10px 30px #00000066',
    }}>
      {label && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < payload.length - 1 ? '4px' : 0 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{entry.name}:</span>
          <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            {currency}{Number(entry.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
};
