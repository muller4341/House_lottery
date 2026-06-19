




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { signInSuccess } from '../redux/user/userSlice';

// CBE Corporate Color Tokens
const CBE_FUCHSIA = '#86198f';
const CBE_GOLD = '#d4af37';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email: email.trim(), password: password.trim() });
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      dispatch(signInSuccess(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url('/home.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background overlay to give the container professional depth */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, rgba(134, 25, 143, 0.1), rgba(212, 175, 55, 0.05))`,
        zIndex: 0
      }} />

      {/* Branded Card Container */}
      <div className="fade-in-up" style={{
        width: '100%',
        maxWidth: 420,
        background: '#ffffff',
        border: `1px solid ${CBE_GOLD}40`,
        borderRadius: 24,
        padding: '2.5rem',
        boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1), 0 10px 20px -5px rgba(134, 25, 143, 0.05)',
        position: 'relative',
        zIndex: 1,
      }}>
        
        {/* CBE Branded Header & Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64,
            background: `linear-gradient(135deg, ${CBE_FUCHSIA}, #6b1272)`,
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1.25rem',
            boxShadow: `0 8px 20px ${CBE_FUCHSIA}30`,
          }}>🏛️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: CBE_FUCHSIA, marginBottom: 4, letterSpacing: '-0.02em' }}>
            Commercial Bank of Ethiopia
          </h1>
          <p style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
            Central KYC Portal — House Lottery Admin Panel
          </p>
        </div>

        {/* Error Alert Display Box */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#991b1b',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Input Form Elements */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Corporate Email Address
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="admin@lottery.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px',
                fontSize: '0.9rem', color: '#0f172a', background: '#f8fafc', outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Secure Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px',
                  fontSize: '0.9rem', color: '#0f172a', background: '#f8fafc', outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', padding: 0, fontSize: '1.1rem',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* CBE Core Action Authenticate Action Trigger */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.875rem 1.5rem',
              background: `linear-gradient(135deg, ${CBE_FUCHSIA}, #6b1272)`,
              color: '#ffffff',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: `0 4px 14px ${CBE_FUCHSIA}30`,
              transition: 'transform 0.15s, opacity 0.15s'
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.95'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? (
              <>
                <span className="spin-fast" style={{
                  display: 'inline-block',
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                }} />
                Authenticating...
              </>
            ) : (
              <>🔐 Sign In To Portal</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
          Secured with JWT Verification &amp; Commercial Bank Protocol Encryption
        </p>
      </div>
    </div>
  );
};

export default Login;