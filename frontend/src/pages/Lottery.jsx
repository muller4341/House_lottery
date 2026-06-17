import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const Lottery = () => {
  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [wheelDeg, setWheelDeg] = useState(0);
  const navigate = useNavigate();

  const fireConfetti = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: ['#c9a227', '#d4af37', '#f1f5f9', '#4ade80'] });
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5, x: 0.3 } }), 400);
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5, x: 0.7 } }), 600);
  };

  const handleStartLottery = async () => {
    setPhase('spinning');
    setErrorMsg('');
    setResult(null);
    const newDeg = wheelDeg + 3600 + Math.random() * 720;
    setWheelDeg(newDeg);

    try {
      const { data } = await axios.post('/api/admin/run-lottery', {}, { headers: authHeader() });
      setTimeout(() => {
        setResult(data);
        setPhase('done');
        if (data.totalWinners > 0) fireConfetti();
      }, 3200);
    } catch (err) {
      setTimeout(() => {
        setErrorMsg(err.response?.data?.error || 'Lottery execution failed');
        setPhase('error');
      }, 3200);
    }
  };

  const reset = () => { setPhase('idle'); setResult(null); setErrorMsg(''); };
  const isSpinning = phase === 'spinning';

  return (
    <div className="page-shell" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>🎡 Lottery Draw</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Randomly assigns houses to eligible applicants by Site &amp; Area</p>
      </div>

      <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 300, background: 'radial-gradient(circle, rgba(201,162,39,0.08), transparent 70%)', pointerEvents: 'none' }} />

        {/* Wheel */}
        <div style={{ width: 200, height: 200, margin: '0 auto 2.5rem', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `4px solid ${isSpinning ? 'var(--gold-400)' : 'var(--navy-600)'}`, transition: 'border-color 0.4s', boxShadow: isSpinning ? '0 0 30px rgba(201,162,39,0.4)' : 'none' }} />
          <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'conic-gradient(from 0deg, #0f2040, #1a3158, #c9a227, #1a3158, #0f2040, #1a3158, #c9a227, #0f2040)', transform: `rotate(${wheelDeg}deg)`, transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--navy-800), var(--navy-950))', border: '3px solid var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', zIndex: 2 }}>
            {phase === 'done' ? '🏆' : phase === 'error' ? '❌' : '🎡'}
          </div>
        </div>

        {/* Status */}
        <div style={{ marginBottom: '2rem' }}>
          {phase === 'idle' && <p style={{ color: '#64748b', margin: 0 }}>Ready to draw. Click below to start.</p>}
          {phase === 'confirm' && <p style={{ color: 'var(--gold-300)', fontWeight: 600, margin: 0 }}>⚠️ This action is irreversible. Proceed?</p>}
          {phase === 'spinning' && <p style={{ color: 'var(--gold-400)', fontWeight: 700, margin: 0 }}>🎰 Drawing winners... please wait</p>}
          {phase === 'done' && result && (
            <div className="fade-in-up">
              <p style={{ color: '#4ade80', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.75rem' }}>🎉 Lottery Complete!</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                <div><div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--gold-400)' }}>{result.totalWinners}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>Winners</div></div>
                <div><div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f97316' }}>{result.totalWaitlisted}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>Waitlisted</div></div>
              </div>
            </div>
          )}
          {phase === 'error' && <p style={{ color: '#f87171', margin: 0 }}>❌ {errorMsg}</p>}
        </div>

        {/* Buttons */}
        {phase === 'idle' && (
          <button id="start-lottery-btn" className="btn btn-danger btn-lg pulse-gold" onClick={() => setPhase('confirm')} style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}>
            🎯 START LOTTERY DRAW
          </button>
        )}
        {phase === 'confirm' && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-danger btn-lg" onClick={handleStartLottery}>✅ Yes, Run Lottery</button>
            <button className="btn btn-navy btn-lg" onClick={() => setPhase('idle')}>✕ Cancel</button>
          </div>
        )}
        {phase === 'spinning' && (
          <button className="btn btn-navy btn-lg" disabled>
            <span className="spin-fast" style={{ display:'inline-block', width:18, height:18, border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'var(--gold-400)', borderRadius:'50%' }} /> Drawing...
          </button>
        )}
        {(phase === 'done' || phase === 'error') && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {phase === 'done' && result && (
              <button className="btn btn-gold btn-lg" onClick={() => navigate(`/results?runId=${result.lotteryRunId}`)}>📋 View Full Results →</button>
            )}
            <button className="btn btn-navy btn-lg" onClick={reset}>🔄 Reset</button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ color: 'var(--gold-400)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>How the Lottery Works</h3>
        <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['Houses with status NONE are grouped by Site & Area', 'Eligible applicants (status NONE, matching Site & Area) enter each group', 'A cryptographically secure Fisher-Yates shuffle picks winners', 'Winners receive a house — status updates to WINNER & PROVIDED', 'Remaining eligible applicants become WAITLIST', 'Both winners and waitlisted are excluded from future draws'].map((step, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8' }}><span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>{i + 1}.</span> {step}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Lottery;