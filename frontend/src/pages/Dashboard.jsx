import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatCurrency, formatDate, getCategoryIcon, getScoreLabel } from '../utils/helpers';
import StatCard from '../components/ui/StatCard';
import { CustomTooltip } from '../components/charts/CustomTooltip';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { Bell, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#ec4899'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [insights, setInsights] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, monthlyRes, catRes, insightRes, scoreRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/transactions/monthly-breakdown'),
        api.get('/transactions/category-breakdown'),
        api.get('/dashboard/insights'),
        api.get('/dashboard/financial-score'),
      ]);
      setData(dashRes.data);
      setInsights(insightRes.data);
      setScore(scoreRes.data);

      // Format monthly data for recharts
      const map = {};
      monthlyRes.data.forEach(({ _id, total }) => {
        const key = `${MONTHS[_id.month - 1]} ${_id.year}`;
        if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
        map[key][_id.type] = total;
      });
      setMonthly(Object.values(map).slice(-6));
      setCategories(catRes.data.map(c => ({ name: c._id, value: c.total })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your dashboard...</p>
    </div>
  );

  const scoreInfo = score ? getScoreLabel(score.score) : null;
  const circumference = 2 * Math.PI * 54;
  const scoreOffset = score ? circumference - (score.score / 100) * circumference : circumference;

  return (
    <div style={{ padding: '32px', maxWidth: '1300px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={fetchAll} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 16px', borderRadius: '10px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px',
          transition: 'all 0.2s',
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Alerts */}
      {data?.alerts?.length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.alerts.map((alert, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px',
              background: alert.type === 'danger' ? '#ef444410' : '#f59e0b10',
              border: `1px solid ${alert.type === 'danger' ? '#ef444430' : '#f59e0b30'}`,
              color: alert.type === 'danger' ? '#ef4444' : '#f59e0b',
              fontSize: '13px',
            }}>
              <Bell size={14} />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Monthly Income" value={formatCurrency(data?.monthlyIncome)} icon="💵" color="#22c55e" delay={0} />
        <StatCard title="Monthly Expenses" value={formatCurrency(data?.monthlyExpense)} icon="💸" color="#ef4444" delay={0.05} />
        <StatCard title="Savings This Month" value={formatCurrency(data?.savings)} icon="🏦"
          color={data?.savings >= 0 ? '#3b82f6' : '#ef4444'} sub={`${data?.savingsRate}% savings rate`} delay={0.1} />
        <StatCard title="Investments Value" value={formatCurrency(data?.totalCurrentValue)} icon="📈"
          color="#8b5cf6" sub={`P&L: ${formatCurrency(data?.investmentPnL)}`} delay={0.15} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '20px', marginBottom: '24px' }}>
        {/* Bar chart — income vs expense */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
              Income vs Expenses
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — category breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
              Expense Categories
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>This month</p>
          </div>
          {categories.length > 0 ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <PieChart width={130} height={130}>
                <Pie data={categories} cx={60} cy={60} innerRadius={36} outerRadius={60}
                  dataKey="value" strokeWidth={0}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {categories.slice(0, 5).map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '130px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No expenses this month
            </div>
          )}
        </div>

        {/* Financial Score */}
        <div className="glass-card animate-pulse-glow" style={{ padding: '24px', borderColor: score ? `${scoreInfo?.color}33` : 'var(--border)' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Financial Health Score
          </h3>
          {score ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle cx="64" cy="64" r="54" fill="none" stroke={scoreInfo.color}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={scoreOffset}
                    transform="rotate(-90 64 64)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  <text x="64" y="60" textAnchor="middle" fill={scoreInfo.color}
                    style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '26px' }}>
                    {score.score}
                  </text>
                  <text x="64" y="78" textAnchor="middle" fill="#475569" style={{ fontSize: '11px' }}>
                    / 100
                  </text>
                </svg>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span className="badge" style={{
                  background: `${scoreInfo.color}18`, color: scoreInfo.color,
                  border: `1px solid ${scoreInfo.color}33`, fontSize: '12px',
                }}>
                  {scoreInfo.label}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Savings', val: score.breakdown.savingsScore, max: 30 },
                  { label: 'Expenses', val: score.breakdown.expenseScore, max: 25 },
                  { label: 'Debt', val: score.breakdown.debtScore, max: 20 },
                  { label: 'Investment', val: score.breakdown.investmentScore, max: 25 },
                ].map(({ label, val, max }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>{label}</span><span>{val}/{max}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(val / max) * 100}%`, background: 'linear-gradient(90deg, #2563eb, #06b6d4)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Add transactions to get your score</div>
          )}
        </div>
      </div>

      {/* Bottom row — insights + recent transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Smart Insights */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            ⚡ Smart Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {insights.length > 0 ? insights.map((ins, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '12px', borderRadius: '10px',
                background: ins.type === 'good' ? '#22c55e0a' : ins.type === 'warning' ? '#f59e0b0a' : '#3b82f60a',
                border: `1px solid ${ins.type === 'good' ? '#22c55e20' : ins.type === 'warning' ? '#f59e0b20' : '#3b82f620'}`,
              }}>
                <span style={{ fontSize: '18px' }}>{ins.icon}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins.text}</span>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                Add more transactions to unlock insights
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Recent Transactions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data?.recentTransactions?.length > 0 ? data.recentTransactions.map((tx) => (
              <div key={tx._id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: tx.type === 'income' ? '#22c55e15' : '#ef444415',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', flexShrink: 0,
                }}>
                  {getCategoryIcon(tx.category)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.category} · {formatDate(tx.date)}</div>
                </div>
                <div style={{
                  fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '14px',
                  color: tx.type === 'income' ? '#22c55e' : '#ef4444',
                  flexShrink: 0,
                }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                No transactions yet — add your first one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
