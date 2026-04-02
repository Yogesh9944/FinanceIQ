import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import PageHeader from '../components/ui/PageHeader';
import { Plus, Trash2, X, AlertTriangle } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Food','Rent','Travel','Bills','Shopping','Healthcare','Entertainment','Education','Other'];
const CAT_ICONS = { Food:'🍔', Rent:'🏠', Travel:'✈️', Bills:'⚡', Shopping:'🛍️', Healthcare:'💊', Entertainment:'🎬', Education:'📚', Other:'📦' };

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Food', limit: '' });
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets', { params: { month, year } });
      setBudgets(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/budgets', { ...form, limit: Number(form.limit), month, year });
      setShowForm(false);
      setForm({ category: 'Food', limit: '' });
      fetchBudgets();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/budgets/${id}`);
    fetchBudgets();
  };

  const totalBudget = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const overBudget = budgets.filter(b => b.percentage >= 100).length;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <PageHeader
        title="Budget Planner"
        subtitle={`${now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} — set limits, stay on track`}
        action={
          <button className="btn-electric" onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Plus size={16} /> Set Budget
          </button>
        }
      />

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Budget', value: formatCurrency(totalBudget), color: '#3b82f6', icon: '🎯' },
          { label: 'Total Spent', value: formatCurrency(totalSpent), color: totalSpent > totalBudget ? '#ef4444' : '#f59e0b', icon: '💸' },
          { label: 'Remaining', value: formatCurrency(totalBudget - totalSpent), color: '#22c55e', icon: '✅', extra: overBudget > 0 ? `${overBudget} category exceeded` : null },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <div className="stat-number" style={{ fontSize: '24px', color: s.color }}>{s.value}</div>
            {s.extra && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px' }}>⚠️ {s.extra}</div>}
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {totalBudget > 0 && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Overall Budget Usage</span>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk', fontWeight: 600 }}>
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)} ({Math.round((totalSpent / totalBudget) * 100)}%)
            </span>
          </div>
          <div className="progress-bar" style={{ height: '10px' }}>
            <div className="progress-fill" style={{
              width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
              background: totalSpent > totalBudget ? '#ef4444' : totalSpent > totalBudget * 0.8 ? '#f59e0b' : 'linear-gradient(90deg, #2563eb, #06b6d4)',
            }} />
          </div>
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : budgets.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No budgets set yet. Create your first budget to start tracking!</p>
          <button className="btn-electric" onClick={() => setShowForm(true)}>Set First Budget</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {budgets.map((b) => {
            const isOver = b.percentage >= 100;
            const isWarn = b.percentage >= 80 && !isOver;
            const barColor = isOver ? '#ef4444' : isWarn ? '#f59e0b' : 'linear-gradient(90deg, #2563eb, #06b6d4)';
            return (
              <div key={b._id} className="glass-card" style={{
                padding: '20px',
                borderColor: isOver ? '#ef444433' : isWarn ? '#f59e0b33' : 'var(--border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{CAT_ICONS[b.category] || '📦'}</span>
                    <div>
                      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{b.category}</div>
                      {isOver && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>
                          <AlertTriangle size={11} /> Budget exceeded!
                        </div>
                      )}
                      {isWarn && (
                        <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px' }}>⚠️ Running low</div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(b._id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    padding: '4px', borderRadius: '6px', display: 'flex', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#ef444415'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <div className="progress-bar" style={{ height: '8px' }}>
                    <div className="progress-fill" style={{ width: `${Math.min(b.percentage, 100)}%`, background: barColor }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Spent: <span style={{ color: isOver ? '#ef4444' : 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(b.spent)}</span>
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Limit: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(b.limit)}</span>
                  </span>
                  <span style={{
                    fontFamily: 'Space Grotesk', fontWeight: 700,
                    color: isOver ? '#ef4444' : isWarn ? '#f59e0b' : '#22c55e',
                  }}>
                    {b.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '32px', animation: 'slideUp 0.3s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>Set Budget</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Category</label>
                <select className="input-dark" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Monthly Limit (₹)</label>
                <input className="input-dark" type="number" placeholder="e.g. 10000" min="1"
                  value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '14px',
                }}>
                  Cancel
                </button>
                <button className="btn-electric" type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '12px', fontSize: '14px', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
