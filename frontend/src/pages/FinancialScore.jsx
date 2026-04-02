import { useEffect, useState } from 'react';
import api from '../utils/api';
import { getScoreLabel } from '../utils/helpers';
import PageHeader from '../components/ui/PageHeader';
import { RefreshCw } from 'lucide-react';

const SCORE_FACTORS = [
  { key: 'savingsScore', label: 'Savings Rate', max: 30, icon: '🏦', desc: 'How much of your income you save each month' },
  { key: 'expenseScore', label: 'Expense Control', max: 25, icon: '💸', desc: 'Staying below your income each month' },
  { key: 'debtScore', label: 'Debt Ratio', max: 20, icon: '🏋️', desc: 'Your liabilities vs total assets' },
  { key: 'investmentScore', label: 'Investment Rate', max: 25, icon: '📈', desc: 'How much you invest relative to income' },
];

export default function FinancialScore() {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/financial-score');
      setScore(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchScore(); }, []);

  const scoreInfo = score ? getScoreLabel(score.score) : null;
  const circumference = 2 * Math.PI * 80;
  const scoreOffset = score ? circumference - (score.score / 100) * circumference : circumference;

  const feedbackStyle = (type) => ({
    good: { bg: '#22c55e0a', border: '#22c55e25', color: '#22c55e', icon: '✅' },
    ok: { bg: '#3b82f60a', border: '#3b82f625', color: '#3b82f6', icon: '💡' },
    bad: { bg: '#ef44440a', border: '#ef444425', color: '#ef4444', icon: '⚠️' },
    info: { bg: '#8b5cf60a', border: '#8b5cf625', color: '#8b5cf6', icon: '📊' },
  }[type] || {});

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <PageHeader
        title="Financial Health Score"
        subtitle="Your personalized money wellness indicator — updated in real time"
        action={
          <button onClick={fetchScore} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 16px', borderRadius: '10px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px',
          }}>
            <RefreshCw size={14} /> Recalculate
          </button>
        }
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Calculating your score...</div>
      ) : !score ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Add transactions to generate your score</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
          {/* Score circle */}
          <div className="glass-card animate-pulse-glow" style={{
            padding: '36px', textAlign: 'center',
            borderColor: `${scoreInfo.color}44`,
          }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: '0 auto', display: 'block' }}>
              {/* Background ring */}
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border)" strokeWidth="14" />
              {/* Score arc */}
              <circle cx="100" cy="100" r="80" fill="none"
                stroke={scoreInfo.color} strokeWidth="14" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={scoreOffset}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 8px ${scoreInfo.color}88)` }} />
              {/* Score text */}
              <text x="100" y="90" textAnchor="middle" fill={scoreInfo.color}
                style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '44px' }}>
                {score.score}
              </text>
              <text x="100" y="115" textAnchor="middle" fill="#475569"
                style={{ fontFamily: 'Space Grotesk', fontSize: '16px', fontWeight: 500 }}>
                / 100
              </text>
              <text x="100" y="140" textAnchor="middle" fill={scoreInfo.color}
                style={{ fontFamily: 'Space Grotesk', fontSize: '14px', fontWeight: 600 }}>
                {scoreInfo.label}
              </text>
            </svg>

            {/* Score scale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', padding: '0 8px' }}>
              {[
                { range: '0-39', label: 'Poor', color: '#ef4444' },
                { range: '40-59', label: 'Fair', color: '#f59e0b' },
                { range: '60-79', label: 'Good', color: '#3b82f6' },
                { range: '80+', label: 'Excellent', color: '#22c55e' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: s.color, fontWeight: 700 }}>{s.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.range}</div>
                </div>
              ))}
            </div>

            {/* Key metrics */}
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>KEY METRICS</div>
              {[
                { label: 'Savings Rate', value: `${score.metrics.savingsRate}%` },
                { label: 'Debt Ratio', value: `${score.metrics.debtRatio}%` },
                { label: 'Investment Rate', value: `${score.metrics.investmentRatio}%` },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Score breakdown */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '20px' }}>
                Score Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {SCORE_FACTORS.map(({ key, label, max, icon, desc }) => {
                  const val = score.breakdown[key];
                  const pct = (val / max) * 100;
                  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#3b82f6' : pct >= 30 ? '#f59e0b' : '#ef4444';
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px' }}>{icon}</span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="stat-number" style={{ fontSize: '20px', color }}>{val}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{max}</span>
                        </div>
                      </div>
                      <div className="progress-bar" style={{ height: '8px' }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: color, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Feedback */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                🤖 Personalised Feedback
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {score.feedback.map((fb, i) => {
                  const style = feedbackStyle(fb.type);
                  return (
                    <div key={i} style={{
                      padding: '14px 16px', borderRadius: '12px',
                      background: style.bg, border: `1px solid ${style.border}`,
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                    }}>
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{style.icon}</span>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{fb.msg}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How score is calculated */}
            <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                HOW YOUR SCORE IS CALCULATED
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Savings Rate', weight: '30%', color: '#3b82f6' },
                  { label: 'Expense Control', weight: '25%', color: '#8b5cf6' },
                  { label: 'Debt Ratio', weight: '20%', color: '#f59e0b' },
                  { label: 'Investment Rate', weight: '25%', color: '#22c55e' },
                ].map(f => (
                  <div key={f.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <div className="stat-number" style={{ fontSize: '20px', color: f.color, marginBottom: '4px' }}>{f.weight}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
