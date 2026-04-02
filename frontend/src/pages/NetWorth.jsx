import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import PageHeader from '../components/ui/PageHeader';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CustomTooltip } from '../components/charts/CustomTooltip';
import { Plus, X } from 'lucide-react';

const initialForm = { cashInHand: '', bankBalance: '', loans: '', creditCardDues: '', otherLiabilities: '' };

export default function NetWorth() {
  const [history, setHistory] = useState([]);
  const [investments, setInvestments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, invRes] = await Promise.all([
        api.get('/dashboard/networth'),
        api.get('/investments'),
      ]);
      setHistory(histRes.data);
      setInvestments(invRes.data.summary?.totalCurrentValue || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/dashboard/networth', {
        cashInHand: Number(form.cashInHand) || 0,
        bankBalance: Number(form.bankBalance) || 0,
        loans: Number(form.loans) || 0,
        creditCardDues: Number(form.creditCardDues) || 0,
        otherLiabilities: Number(form.otherLiabilities) || 0,
      });
      setShowForm(false);
      setForm(initialForm);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const latest = history[history.length - 1];
  const totalAssets = latest ? latest.cashInHand + latest.bankBalance + investments : 0;
  const totalLiabilities = latest ? latest.loans + latest.creditCardDues + latest.otherLiabilities : 0;
  const netWorthVal = totalAssets - totalLiabilities;

  const chartData = history.map((h, i) => ({
    label: `Entry ${i + 1}`,
    netWorth: h.netWorthValue || (h.cashInHand + h.bankBalance + investments - h.loans - h.creditCardDues - h.otherLiabilities),
    assets: h.cashInHand + h.bankBalance + investments,
    liabilities: h.loans + h.creditCardDues + h.otherLiabilities,
  }));

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <PageHeader
        title="Net Worth"
        subtitle="Assets − Liabilities = Your true financial picture"
        action={
          <button className="btn-electric" onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Plus size={16} /> Update Snapshot
          </button>
        }
      />

      {/* Net worth hero */}
      <div className="glass-card animate-pulse-glow" style={{
        padding: '36px', marginBottom: '24px', textAlign: 'center',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, #0a1f40 100%)',
        borderColor: netWorthVal >= 0 ? '#3b82f633' : '#ef444433',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>TOTAL NET WORTH</p>
        <div className="stat-number gradient-text" style={{ fontSize: 'clamp(36px, 6vw, 56px)', marginBottom: '8px' }}>
          {formatCurrency(netWorthVal)}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Assets {formatCurrency(totalAssets)} − Liabilities {formatCurrency(totalLiabilities)}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.04em' }}>💰 TOTAL ASSETS</div>
          <div className="stat-number" style={{ fontSize: '24px', color: '#22c55e', marginBottom: '12px' }}>{formatCurrency(totalAssets)}</div>
          {latest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Cash in Hand', value: latest.cashInHand },
                { label: 'Bank Balance', value: latest.bankBalance },
                { label: 'Investments', value: investments },
              ].map(a => (
                <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{a.label}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{formatCurrency(a.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.04em' }}>💳 TOTAL LIABILITIES</div>
          <div className="stat-number" style={{ fontSize: '24px', color: '#ef4444', marginBottom: '12px' }}>{formatCurrency(totalLiabilities)}</div>
          {latest && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'Loans', value: latest.loans },
                { label: 'Credit Card Dues', value: latest.creditCardDues },
                { label: 'Other Liabilities', value: latest.otherLiabilities },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{formatCurrency(l.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.04em' }}>📊 ASSET HEALTH</div>
          {totalAssets > 0 ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Debt-to-Asset Ratio</span>
                  <span style={{ color: totalLiabilities / totalAssets > 0.5 ? '#ef4444' : '#22c55e' }}>
                    {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min((totalLiabilities / totalAssets) * 100, 100)}%`,
                    background: totalLiabilities / totalAssets > 0.5 ? '#ef4444' : 'linear-gradient(90deg, #22c55e, #16a34a)',
                  }} />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <div>Goal: Keep debt below 30% of assets</div>
                {totalLiabilities / totalAssets < 0.3
                  ? <div style={{ color: '#22c55e', marginTop: '6px' }}>✅ Excellent debt ratio!</div>
                  : <div style={{ color: '#f59e0b', marginTop: '6px' }}>⚠️ Consider paying down debt</div>}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Add your first snapshot to see health metrics</div>
          )}
        </div>
      </div>

      {/* Net worth chart */}
      {chartData.length > 1 && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Net Worth Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={2} fill="url(#nwGrad)" name="Net Worth" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {history.length === 0 && !loading && (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💎</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Add your first net worth snapshot to start tracking your wealth growth!</p>
          <button className="btn-electric" onClick={() => setShowForm(true)}>Add First Snapshot</button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px', animation: 'slideUp 0.3s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>Update Net Worth Snapshot</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: '#22c55e', background: '#22c55e0a', border: '1px solid #22c55e25', borderRadius: '10px', padding: '10px 14px' }}>
                💰 Assets
              </div>
              {[
                { field: 'cashInHand', label: 'Cash in Hand (₹)' },
                { field: 'bankBalance', label: 'Bank Balance (₹)' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>{label}</label>
                  <input className="input-dark" type="number" placeholder="0" min="0"
                    value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
              <div style={{ fontSize: '12px', color: '#ef4444', background: '#ef44440a', border: '1px solid #ef444425', borderRadius: '10px', padding: '10px 14px' }}>
                💳 Liabilities
              </div>
              {[
                { field: 'loans', label: 'Loans (₹)' },
                { field: 'creditCardDues', label: 'Credit Card Dues (₹)' },
                { field: 'otherLiabilities', label: 'Other Liabilities (₹)' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>{label}</label>
                  <input className="input-dark" type="number" placeholder="0" min="0"
                    value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
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
                  {submitting ? 'Saving...' : 'Save Snapshot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
