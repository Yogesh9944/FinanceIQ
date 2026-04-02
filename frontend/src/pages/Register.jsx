import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} className="mesh-bg">
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 20px', animation: 'slideUp 0.4s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)' }}>
              FinanceIQ
            </span>
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '36px' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Create your account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
            Start your financial journey today — free forever
          </p>

          {error && (
            <div style={{
              background: '#ef444418', border: '1px solid #ef444433', borderRadius: '10px',
              padding: '12px 16px', fontSize: '13px', color: '#ef4444', marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Full Name</label>
              <input className="input-dark" type="text" placeholder="Yogesh Sanjay"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Email</label>
              <input className="input-dark" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-dark" type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password strength bar */}
            <div className="progress-bar" style={{ marginTop: '-8px' }}>
              <div className="progress-fill" style={{
                width: form.password.length === 0 ? '0%' : form.password.length < 6 ? '33%' : form.password.length < 10 ? '66%' : '100%',
                background: form.password.length < 6 ? '#ef4444' : form.password.length < 10 ? '#f59e0b' : '#22c55e',
              }} />
            </div>

            <button className="btn-electric" type="submit" disabled={loading}
              style={{ marginTop: '8px', padding: '12px', fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
