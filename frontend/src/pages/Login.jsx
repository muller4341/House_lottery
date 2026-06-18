import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { signInSuccess } from '../redux/user/userSlice';

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
      /* Blends your navy base color with the background image seamlessly */
      background: `linear-gradient(rgba(5, 13, 26, 0.8), url('/home.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(192, 38, 211), transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(192, 38, 211), transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div className="fade-in-up" style={{
        width: '100%',
        maxWidth: 420,
        background: 'rgba(255, 255, 255)',
        border: '1px solid rgba(201, 162, 39, 0.2)',
        borderRadius: 20,
        padding: '2.5rem',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 60px rgba(201,162,39,0.08)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, var(--gold-500), var(--gold-300))',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 30px rgba(201, 162, 39, 0.35)',
          }}>🏆</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#080e14', marginBottom: 6 }}>
            House Lottery
          </h1>
          <p style={{ color: '#041225', fontSize: '0.875rem', margin: 0 }}>
            Admin Portal — Sign in to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="admin@lottery.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', padding: 0, fontSize: '1rem',
                }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn btn-gold btn-lg"
            style={{ marginTop: '0.5rem', justifyContent: 'center', width: '100%' }}
          >
            {loading ? (
              <>
                <span className="spin-fast" style={{
                  display: 'inline-block',
                  width: 16, height: 16,
                  border: '2px solid rgba(0,0,0,0.2)',
                  borderTopColor: 'var(--navy-900)',
                  borderRadius: '50%',
                }} />
                Signing in...
              </>
            ) : (
              <>🔐 Sign In</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#334155' }}>
          Secured with JWT Authentication
        </p>
      </div>
    </div>
  );
};

export default Login;