import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import PageHeader from '../components/ui/PageHeader';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, Edit3, X, TrendingUp, TrendingDown } from 'lucide-react';

const TYPES = ['Stocks','Mutual Funds','Crypto','Gold','Real Estate','FD','PPF','Other'];
const TYPE_COLORS = { Stocks:'#3b82f6', 'Mutual Funds':'#8b5cf6', Crypto:'#f59e0b', Gold:'#fbbf24', 'Real Estate':'#22c55e', FD:'#06b6d4', PPF:'#ec4899', Other:'#64748b' };
const TYPE_ICONS = { Stocks:'📊', 'Mutual Funds':'📈', Crypto:'₿', Gold:'🥇', 'Real Estate':'🏢', FD:'🏦', PPF:'🏛️', Other:'💰' };

const initialForm = { name: '', type: 'Stocks', investedAmount: '', currentValue: '', purchaseDate: new Date().toISOString().split('T')[0] };

export default function Investments() {
  const [data, setData] = useState({ investments: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get('/investments');
      setData(d);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvestments(); }, []);

  const openEdit = (inv) => {
    setEditItem(inv);
    setForm({ name: inv.name, type: inv.type, investedAmount: inv.investedAmount, currentValue: inv.currentValue, purchaseDate: inv.purchaseDate?.split('T')[0] || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, investedAmount: Number(form.investedAmount), currentValue: Number(form.currentValue) };
      if (editItem) await api.put(`/investments/${editItem._id}`, payload);
      else await api.post('/investments', payload);
      setShowForm(false);
      setEditItem(null);
      setForm(initialForm);
      fetchInvestments();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this investment?')) return;
    await api.delete(`/investments/${id}`);
    fetchInvestments();
  };

  // Group by type for pie chart
  const pieData = TYPES.map(type => ({
    name: type,
    value: data.investments.filter(i => i.type === type).reduce((a, i) => a + i.currentValue, 0),
  })).filter(d => d.value > 0);

  const { totalInvested = 0, totalCurrentValue = 0, totalPnL = 0, pnlPercentage = 0 } = data.summary;
  const isProfit = totalPnL >= 0;

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      <PageHeader
        title="Investment Tracker"
        subtitle="Monitor your portfolio across all asset classes"
        action={
          <button className="btn-electric" onClick={() => { setEditItem(null); setForm(initialForm); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Plus size={16} /> Add Investment
          </button>
        }
      />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Invested', value: formatCurrency(totalInvested), color: '#3b82f6', icon: '💼' },
          { label: 'Current Value', value: formatCurrency(totalCurrentValue), color: '#06b6d4', icon: '📊' },
          { label: 'Total P&L', value: `${isProfit ? '+' : ''}${formatCurrency(totalPnL)}`, color: isProfit ? '#22c55e' : '#ef4444', icon: isProfit ? '🚀' : '📉' },
          { label: 'Return %', value: `${isProfit ? '+' : ''}${pnlPercentage}%`, color: isProfit ? '#22c55e' : '#ef4444', icon: '📈' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</span>
              <span style={{ fontSize: '20px' }}>{s.icon}</span>
            </div>
            <div className="stat-number" style={{ fontSize: '22px', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        {/* Investments list */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading...</div>
          ) : data.investments.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No investments yet. Start tracking your portfolio!</p>
              <button className="btn-electric" onClick={() => setShowForm(true)}>Add First Investment</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.investments.map((inv) => {
                const pnl = inv.currentValue - inv.investedAmount;
                const pnlPct = inv.investedAmount > 0 ? ((pnl / inv.investedAmount) * 100).toFixed(1) : 0;
                const profit = pnl >= 0;
                return (
                  <div key={inv._id} className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: `${TYPE_COLORS[inv.type]}18`,
                        border: `1px solid ${TYPE_COLORS[inv.type]}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                      }}>
                        {TYPE_ICONS[inv.type]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{inv.name}</span>
                          <span className="badge" style={{ background: `${TYPE_COLORS[inv.type]}18`, color: TYPE_COLORS[inv.type], border: `1px solid ${TYPE_COLORS[inv.type]}33`, fontSize: '10px' }}>
                            {inv.type}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Invested: {formatCurrency(inv.investedAmount)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="stat-number" style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{formatCurrency(inv.currentValue)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', fontSize: '12px', color: profit ? '#22c55e' : '#ef4444' }}>
                          {profit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {profit ? '+' : ''}{formatCurrency(pnl)} ({profit ? '+' : ''}{pnlPct}%)
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openEdit(inv)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                          padding: '6px', borderRadius: '6px', display: 'flex', transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.background = '#3b82f615'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(inv._id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                          padding: '6px', borderRadius: '6px', display: 'flex', transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#ef444415'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div style={{ marginTop: '14px' }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${Math.min((inv.currentValue / (inv.investedAmount * 1.5)) * 100, 100)}%`,
                          background: profit ? 'linear-gradient(90deg, #22c55e, #16a34a)' : '#ef4444',
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="glass-card" style={{ padding: '24px', alignSelf: 'flex-start' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Portfolio Distribution
          </h3>
          {pieData.length > 0 ? (
            <>
              <PieChart width={240} height={200}>
                <Pie data={pieData} cx={115} cy={95} innerRadius={50} outerRadius={85}
                  dataKey="value" strokeWidth={0}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={TYPE_COLORS[entry.name] || '#3b82f6'} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {pieData.map((d) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: TYPE_COLORS[d.name], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Space Grotesk' }}>{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0' }}>
              Add investments to see distribution
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px', animation: 'slideUp 0.3s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
                {editItem ? 'Update Investment' : 'Add Investment'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditItem(null); setForm(initialForm); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Name</label>
                <input className="input-dark" placeholder="e.g. Infosys, Nifty 50 Fund" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Type</label>
                <select className="input-dark" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Invested Amount (₹)</label>
                  <input className="input-dark" type="number" placeholder="0" min="0" value={form.investedAmount}
                    onChange={e => setForm(f => ({ ...f, investedAmount: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Current Value (₹)</label>
                  <input className="input-dark" type="number" placeholder="0" min="0" value={form.currentValue}
                    onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Purchase Date</label>
                <input className="input-dark" type="date" value={form.purchaseDate}
                  onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => { setShowForm(false); setEditItem(null); setForm(initialForm); }} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '14px',
                }}>
                  Cancel
                </button>
                <button className="btn-electric" type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '12px', fontSize: '14px', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : editItem ? 'Update' : 'Add Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
