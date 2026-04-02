import { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatCurrency, formatDate, getCategoryIcon } from '../utils/helpers';
import PageHeader from '../components/ui/PageHeader';
import { Plus, Trash2, X, Filter } from 'lucide-react';

const CATEGORIES = ['Food','Rent','Travel','Bills','Shopping','Healthcare','Entertainment','Education','Salary','Freelance','Investment','Other'];

const initialForm = { title: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0], note: '', isRecurring: false };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState({ type: '', category: '' });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.category) params.category = filter.category;
      const { data } = await api.get('/transactions', { params });
      setTransactions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTransactions(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/transactions', { ...form, amount: Number(form.amount) });
      setShowForm(false);
      setForm(initialForm);
      fetchTransactions();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    fetchTransactions();
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      <PageHeader
        title="Transactions"
        subtitle="Track every rupee coming in and going out"
        action={
          <button className="btn-electric" onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Plus size={16} /> Add Transaction
          </button>
        }
      />

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome), color: '#22c55e', icon: '💵' },
          { label: 'Total Expenses', value: formatCurrency(totalExpense), color: '#ef4444', icon: '💸' },
          { label: 'Net Balance', value: formatCurrency(totalIncome - totalExpense), color: totalIncome - totalExpense >= 0 ? '#3b82f6' : '#ef4444', icon: '⚖️' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '28px' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
              <div className="stat-number" style={{ fontSize: '22px', color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <Filter size={14} /> Filters:
        </div>
        {['', 'income', 'expense'].map(t => (
          <button key={t} onClick={() => setFilter(f => ({ ...f, type: t }))}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              background: filter.type === t ? '#2563eb' : 'var(--bg-card)',
              color: filter.type === t ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filter.type === t ? '#2563eb' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}>
            {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
          className="input-dark" style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Transactions list */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No transactions found. Add your first one!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Transaction', 'Category', 'Date', 'Amount', ''].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={tx._id} style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: tx.type === 'income' ? '#22c55e15' : '#ef444415',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                      }}>
                        {getCategoryIcon(tx.category)}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{tx.title}</div>
                        {tx.note && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.note}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-blue" style={{ fontSize: '11px' }}>{tx.category}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {formatDate(tx.date)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="stat-number" style={{
                      fontSize: '15px', color: tx.type === 'income' ? '#22c55e' : '#ef4444'
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => handleDelete(tx._id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: '6px', borderRadius: '6px',
                      transition: 'all 0.2s', display: 'flex',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#ef444415'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: '#00000088', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px', animation: 'slideUp 0.3s ease forwards' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
                Add Transaction
              </h2>
              <button onClick={() => { setShowForm(false); setForm(initialForm); }} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', padding: '4px',
              }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Type toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['expense', 'income'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                    padding: '10px', borderRadius: '10px', cursor: 'pointer',
                    background: form.type === t ? (t === 'income' ? '#22c55e18' : '#ef444418') : 'var(--bg-secondary)',
                    border: `1px solid ${form.type === t ? (t === 'income' ? '#22c55e44' : '#ef444444') : 'var(--border)'}`,
                    color: form.type === t ? (t === 'income' ? '#22c55e' : '#ef4444') : 'var(--text-muted)',
                    fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                  }}>
                    {t === 'income' ? '💵 Income' : '💸 Expense'}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Title</label>
                <input className="input-dark" placeholder="e.g. Swiggy dinner" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Amount (₹)</label>
                  <input className="input-dark" type="number" placeholder="0" min="1" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Date</label>
                  <input className="input-dark" type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Category</label>
                <select className="input-dark" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryIcon(c)} {c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Note (optional)</label>
                <input className="input-dark" placeholder="Any notes..." value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => { setShowForm(false); setForm(initialForm); }} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'Space Grotesk', fontWeight: 600,
                }}>
                  Cancel
                </button>
                <button className="btn-electric" type="submit" disabled={submitting} style={{ flex: 1, padding: '12px', fontSize: '14px', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
