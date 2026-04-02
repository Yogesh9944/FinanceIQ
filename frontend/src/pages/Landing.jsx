import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, Brain, Shield, ArrowRight, BarChart3, Target, PieChart } from 'lucide-react';

const features = [
  { icon: '💸', title: 'Expense Tracking', desc: 'Categorize every rupee automatically. Know exactly where your money goes.' },
  { icon: '🎯', title: 'Budget Planner', desc: 'Set monthly limits per category. Get alerts before you overspend.' },
  { icon: '📈', title: 'Investment Tracker', desc: 'Track stocks, mutual funds, crypto. See real P&L at a glance.' },
  { icon: '🧠', title: 'Health Score', desc: 'A single score (0-100) that reflects your overall financial wellness.' },
  { icon: '💎', title: 'Net Worth', desc: 'Assets minus liabilities. Watch your wealth grow over time.' },
  { icon: '⚡', title: 'Smart Insights', desc: 'AI-style observations that flag spending spikes and savings drops.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 60px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
            FinanceIQ
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '9px 20px', borderRadius: '10px',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 500, fontSize: '14px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--electric)'; e.currentTarget.style.color = '#60a5fa'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Sign In
          </button>
          <button className="btn-electric" onClick={() => navigate('/register')} style={{ fontSize: '14px' }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mesh-bg" style={{ padding: '100px 60px 80px', textAlign: 'center', position: 'relative' }}>
        {/* Glowing orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '10%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, #2563eb22 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, #06b6d422 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div className="animate-slide-up" style={{ position: 'relative' }}>
          <div className="badge badge-blue" style={{ marginBottom: '20px', fontSize: '12px', display: 'inline-flex' }}>
            ⚡ Full-Stack MERN Project
          </div>
          <h1 style={{
            fontFamily: 'Space Grotesk', fontWeight: 700,
            fontSize: 'clamp(42px, 6vw, 72px)', lineHeight: 1.1,
            color: 'var(--text-primary)', marginBottom: '24px',
          }}>
            Your entire financial life
            <br />
            <span className="gradient-text">in one dashboard</span>
          </h1>
          <p style={{
            fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '560px',
            margin: '0 auto 40px', lineHeight: 1.6,
          }}>
            Track expenses, budgets, investments, and net worth — powered by a real-time
            financial health score that tells you exactly where you stand.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-electric animate-pulse-glow"
              onClick={() => navigate('/register')}
              style={{ fontSize: '16px', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Start Tracking Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 32px', borderRadius: '10px', fontSize: '16px',
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                fontFamily: 'Space Grotesk', fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#60a5fa55'; e.currentTarget.style.color = '#60a5fa'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div style={{ marginTop: '70px', position: 'relative', maxWidth: '900px', margin: '70px auto 0' }}>
          <div className="glass-card animate-pulse-glow" style={{ padding: '32px', borderColor: '#2563eb33' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Balance', value: '₹2,84,500', icon: '💰', color: '#3b82f6' },
                { label: 'Monthly Income', value: '₹75,000', icon: '💵', color: '#22c55e' },
                { label: 'Expenses', value: '₹32,400', icon: '💸', color: '#ef4444' },
                { label: 'Health Score', value: '78/100', icon: '🧠', color: '#06b6d4' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'var(--bg-secondary)', borderRadius: '12px',
                  padding: '16px', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '20px', color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{item.label}</div>
                </div>
              ))}
            </div>
            {/* Fake chart bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', padding: '0 8px' }}>
              {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{
                    height: `${h * 0.7}%`, borderRadius: '4px 4px 0 0',
                    background: i % 2 === 0
                      ? `linear-gradient(to top, #2563eb, #3b82f6)`
                      : `linear-gradient(to top, #06b6d444, #06b6d488)`,
                    minHeight: '4px',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              MONTHLY INCOME VS EXPENSES — LAST 12 MONTHS
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 60px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '36px', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Everything you need to master money
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            Six powerful modules. One cohesive system.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="stagger">
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 60px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '36px', color: 'var(--text-primary)', marginBottom: '16px' }}>
          Ready to take control?
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '16px' }}>
          Join thousands who manage money smarter with FinanceIQ
        </p>
        <button className="btn-electric animate-pulse-glow" onClick={() => navigate('/register')}
          style={{ fontSize: '16px', padding: '14px 40px' }}>
          Create Free Account →
        </button>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="#3b82f6" fill="#3b82f6" />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'var(--text-muted)', fontSize: '14px' }}>FinanceIQ</span>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Built with MERN Stack · MongoDB Atlas · JWT Auth</span>
      </footer>
    </div>
  );
}
