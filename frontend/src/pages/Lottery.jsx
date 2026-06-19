


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const CBE_FUCHSIA = '#86198f';
const CBE_GOLD = '#d4af37';

const Lottery = () => {
  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [wheelDeg, setWheelDeg] = useState(0);
  
  // Real dynamic options pulled from backend
  const [options, setOptions] = useState({ sites: [], areas: [], bedrooms: [] });
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Filter selection target state
  const [filters, setFilters] = useState({ site: '', area: '', bedroom: '' });
  const navigate = useNavigate();

  // Fetch real dropdown selections on load
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data } = await axios.get('/api/admin/lottery-filters', { headers: authHeader() });
        setOptions(data);
      } catch (err) {
        console.error('Error fetching filter variables:', err);
        setErrorMsg('Failed to fetch real-time query configurations.');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const fireConfetti = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, colors: [CBE_FUCHSIA, CBE_GOLD, '#3b82f6', '#10b981'] });
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5, x: 0.3 } }), 400);
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5, x: 0.7 } }), 600);
  };

  const handleStartLottery = async () => {
    if (!filters.site || !filters.area || !filters.bedroom) {
      setErrorMsg('Please select a valid Site, Area size, and Bedroom option before running.');
      setPhase('error');
      return;
    }

    setPhase('spinning');
    setErrorMsg('');
    setResult(null);
    const newDeg = wheelDeg + 3600 + Math.random() * 720;
    setWheelDeg(newDeg);

    try {
      const { data } = await axios.post('/api/admin/run-lottery', {
        site: filters.site,
        area: filters.area,
        bedroom: parseInt(filters.bedroom)
      }, { headers: authHeader() });
      
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
    <div className="page-shell" style={{ padding: '2rem max(1.5rem, 5vw)', maxWidth: 760, margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: `2px solid ${CBE_GOLD}30` }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: CBE_FUCHSIA, marginBottom: 4, letterSpacing: '-0.02em' }}>
          🎡 Automated Lottery Engine
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
          Execute localized parameter draws isolated by live backend property pools
        </p>
      </div>

      {/* FIXED: Dropdown Selections Utilizing Live Database Records */}
      <div style={{ 
        background: '#ffffff', padding: '1.25rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0',
        display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <select 
          className="form-input" 
          style={{ flex: '1 1 180px', padding: '0.625rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff' }}
          disabled={isSpinning || loadingOptions}
          value={filters.site}
          onChange={(e) => setFilters(f => ({ ...f, site: e.target.value }))}
        >
          <option value="">— Select Site —</option>
          {options.sites.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        
        <select 
          className="form-input" 
          style={{ flex: '1 1 150px', padding: '0.625rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff' }}
          disabled={isSpinning || loadingOptions}
          value={filters.area}
          onChange={(e) => setFilters(f => ({ ...f, area: e.target.value }))}
        >
          <option value="">— Select Area Size —</option>
          {options.areas.map(a => <option key={a} value={a}>{a} m²</option>)}
        </select>
        
        <select 
          className="form-input" 
          style={{ flex: '1 1 140px', padding: '0.625rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff' }}
          disabled={isSpinning || loadingOptions}
          value={filters.bedroom}
          onChange={(e) => setFilters(f => ({ ...f, bedroom: e.target.value }))}
        >
          <option value="">— Select Bedrooms —</option>
          {options.bedrooms.map(b => <option key={b} value={b}>{b} BR</option>)}
        </select>
      </div>

      <div style={{ 
        background: '#ffffff', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 340, height: 340, background: `radial-gradient(circle, ${CBE_FUCHSIA}06, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Wheel Layout */}
        <div style={{ width: 220, height: 220, margin: '0 auto 2.5rem', position: 'relative' }}>
          <div style={{ 
            position: 'absolute', inset: 0, borderRadius: '50%', 
            border: `5px solid ${isSpinning ? CBE_GOLD : '#edf2f7'}`, 
            transition: 'border-color 0.4s', 
            boxShadow: isSpinning ? `0 0 35px ${CBE_GOLD}60` : 'none', zIndex: 1
          }} />
          <div style={{ 
            position: 'absolute', inset: 8, borderRadius: '50%', 
            background: `conic-gradient(from 0deg, ${CBE_FUCHSIA}, #58105e, ${CBE_GOLD}, #58105e, ${CBE_FUCHSIA}, #58105e, ${CBE_GOLD}, ${CBE_FUCHSIA})`, 
            transform: `rotate(${wheelDeg}deg)`, 
            transition: isSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.75, 0.1, 1)' : 'none', 
            boxShadow: 'inset 0 0 25px rgba(0,0,0,0.4)' 
          }} />
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
            width: 64, height: 64, borderRadius: '50%', background: '#ffffff', border: `3px solid ${CBE_FUCHSIA}`, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', zIndex: 2 
          }}>
            {phase === 'done' ? '🏆' : phase === 'error' ? '❌' : '🎡'}
          </div>
        </div>

        {/* Dynamic Status Reporting Section */}
        <div style={{ marginBottom: '2.5rem', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {phase === 'idle' && <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>Configure parameters. Click execute to calculate live draws.</p>}
          {phase === 'confirm' && <p style={{ color: '#b45309', fontWeight: 700, margin: 0 }}>⚠️ Run isolation draw pool for {filters.site} ({filters.area} m², {filters.bedroom} BR)?</p>}
          {phase === 'spinning' && <p style={{ color: CBE_FUCHSIA, fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>🎰 Randomizing local data queues... please wait</p>}
          {phase === 'done' && result && (
            <div className="fade-in-up">
              <p style={{ color: '#16a34a', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 1rem' }}>🎉 Draw Complete for {filters.site}!</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem' }}>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: CBE_FUCHSIA, lineHeight: 1 }}>{result.totalWinners}</div>
                  <div style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>Winners</div>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0' }} />
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ea580c', lineHeight: 1 }}>{result.totalWaitlisted}</div>
                  <div style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>Waitlist</div>
                </div>
              </div>
            </div>
          )}
          {phase === 'error' && <p style={{ color: '#dc2626', fontWeight: 700, margin: 0 }}>❌ {errorMsg}</p>}
        </div>

        {/* Buttons Controls */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {phase === 'idle' && (
            <button className="btn" disabled={loadingOptions} onClick={() => setPhase('confirm')} style={{ 
              fontSize: '1.1rem', padding: '1rem 3.5rem', background: loadingOptions ? '#cbd5e1' : `linear-gradient(135deg, ${CBE_FUCHSIA}, #6b1272)`,
              color: '#ffffff', borderRadius: '14px', fontWeight: 700, border: 'none', boxShadow: loadingOptions ? 'none' : `0 6px 20px ${CBE_FUCHSIA}40`
            }}>
              {loadingOptions ? 'Syncing Dropdowns...' : '🎯 INITIALIZE TARGET DRAW'}
            </button>
          )}
          {phase === 'confirm' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" onClick={handleStartLottery} style={{ background: '#16a34a', color: '#ffffff', fontWeight: 700, padding: '0.875rem 2rem', borderRadius: '12px', border: 'none' }}>
                Confirm Execution
              </button>
              <button className="btn" onClick={() => setPhase('idle')} style={{ background: '#f1f5f9', color: '#334155', fontWeight: 600, padding: '0.875rem 2rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                Abort
              </button>
            </div>
          )}
          {phase === 'spinning' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {/* FIXED: SIGNIFICANTLY ENLARGED SPINNER ELEMENT */}
              <span className="spin-fast" style={{ 
                display: 'inline-block', 
                width: 56, 
                height: 56, 
                border: '5px solid #edf2f7', 
                borderTopColor: CBE_FUCHSIA, 
                borderRadius: '50%' 
              }} />
              <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>Drawing items...</p>
            </div>
          )}
          {(phase === 'done' || phase === 'error') && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {phase === 'done' && result && (
                <button className="btn" onClick={() => navigate(`/results?runId=${result.lotteryRunId}`)} style={{ background: `linear-gradient(135deg, ${CBE_GOLD}, #b59124)`, color: '#ffffff', fontWeight: 700, padding: '0.875rem 2rem', borderRadius: '12px', border: 'none' }}>
                  📋 View Full Results
                </button>
              )}
              <button className="btn" onClick={reset} style={{ background: '#ffffff', color: CBE_FUCHSIA, fontWeight: 600, padding: '0.875rem 2rem', borderRadius: '12px', border: `2px solid ${CBE_FUCHSIA}30` }}>
                🔄 Reset Engine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lottery;