import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const StatusBadge = ({ status }) => {
  if (status === 'WINNER') return <span className="badge badge-winner">🏆 Winner</span>;
  return <span className="badge badge-waitlist">⏳ Waitlist</span>;
};

const Results = () => {
  const [history, setHistory] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await axios.get('/api/admin/lottery-history', { headers: authHeader() });
        setHistory(data);
        // Auto-select from URL query param (e.g., coming from Lottery page)
        const runId = searchParams.get('runId');
        if (runId) {
          loadResults(runId);
        } else if (data.length > 0) {
          loadResults(data[0].lotteryRunId);
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const loadResults = async (runId) => {
    setSelectedRun(runId);
    setLoadingResults(true);
    try {
      const { data } = await axios.get(`/api/admin/results/${runId}`, { headers: authHeader() });
      setResults(data);
    } catch (err) {
      console.error('Results fetch error:', err);
    } finally {
      setLoadingResults(false);
    }
  };

  const downloadExcel = (runId) => {
    const token = localStorage.getItem('token');
    // Use fetch to download with auth header
    fetch(`/api/admin/results/download/${runId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Lottery_Results_${runId.slice(0, 8)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const winners = results.filter((r) => r.status === 'WINNER');
  const waitlisted = results.filter((r) => r.status === 'WAITLIST');

  return (
    <div className="page-shell">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', marginBottom: 4 }}>📋 Lottery Results</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>History of all lottery draws and their outcomes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* History Sidebar */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Previous Draws</h3>
            <span style={{ fontSize: '0.75rem', color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 9999 }}>{history.length}</span>
          </div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {loadingHistory ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spin-fast" style={{ width:24, height:24, border:'2px solid var(--navy-700)', borderTopColor:'var(--gold-500)', borderRadius:'50%', margin:'0 auto' }} />
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.85rem' }}>No lottery draws yet</div>
            ) : (
              history.map((item) => {
                const active = selectedRun === item.lotteryRunId;
                return (
                  <div
                    key={item.lotteryRunId}
                    onClick={() => loadResults(item.lotteryRunId)}
                    style={{
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      borderLeft: active ? '3px solid var(--gold-500)' : '3px solid transparent',
                      background: active ? 'rgba(201,162,39,0.08)' : 'transparent',
                      borderBottom: '1px solid var(--glass-border)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: active ? 'var(--gold-300)' : '#e2e8f0', marginBottom: 4 }}>
                      {new Date(item.drawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>
                      {new Date(item.drawDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#4ade80' }}>🏆 {item.winners} winners</span>
                      <span style={{ fontSize: '0.72rem', color: '#f97316' }}>⏳ {item.waitlisted} wait</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {!selectedRun ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>Select a draw from the left to view results</p>
            </div>
          ) : (
            <div className="glass-card fade-in-up">
              {/* Panel Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                    Run ID: <span style={{ color: 'var(--gold-400)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{selectedRun.slice(0, 16)}…</span>
                  </h2>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: 6 }}>
                    <span style={{ fontSize: '0.78rem', color: '#4ade80' }}>🏆 {winners.length} Winners</span>
                    <span style={{ fontSize: '0.78rem', color: '#f97316' }}>⏳ {waitlisted.length} Waitlisted</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Total: {results.length}</span>
                  </div>
                </div>
                <button className="btn btn-success" onClick={() => downloadExcel(selectedRun)}>
                  📥 Download Excel
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto', maxHeight: 520, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--navy-800)', zIndex: 1 }}>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Site</th>
                      <th>Area</th>
                      <th>House No.</th>
                      <th>Floor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingResults ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                        <div className="spin-fast" style={{ width:28, height:28, border:'2px solid var(--navy-700)', borderTopColor:'var(--gold-500)', borderRadius:'50%', margin:'0 auto 0.5rem' }} />
                        Loading results...
                      </td></tr>
                    ) : results.map((r, i) => (
                      <tr key={r.id} style={{ background: r.status === 'WINNER' ? 'rgba(34,197,94,0.03)' : 'transparent' }}>
                        <td style={{ color: '#475569' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{r.username}</td>
                        <td>{r.site}</td>
                        <td>{r.area}</td>
                        <td style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{r.houseNumber || '—'}</td>
                        <td>{r.floor ?? '—'}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;