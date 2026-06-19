import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// CBE Corporate Color Palette
const CBE_FUCHSIA = '#86198f';
const CBE_GOLD = '#d4af37';

const StatusBadge = ({ status }) => {
  if (status === 'WINNER') {
    return (
      <span style={{ 
        background: '#e6f4ea', 
        color: '#137333', 
        padding: '0.25rem 0.75rem', 
        borderRadius: '9999px', 
        fontSize: '0.75rem', 
        fontWeight: 700,
        textTransform: 'uppercase'
      }}>
        🏆 Winner
      </span>
    );
  }
  return (
    <span style={{ 
      background: '#fff3cd', 
      color: '#856404', 
      padding: '0.25rem 0.75rem', 
      borderRadius: '9999px', 
      fontSize: '0.75rem', 
      fontWeight: 700,
      textTransform: 'uppercase'
    }}>
      ⏳ Waitlist
    </span>
  );
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
  }, [searchParams]);

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

  const activeDownloadTracker = {};

const downloadExcel = (runId) => {
  const token = localStorage.getItem('token');
  
  fetch(`/api/admin/results/download/${runId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => {
      // Pull down the clean content disposition headers sent back by our Express controller
      const disposition = res.headers.get('content-disposition');
      let filename = `Lottery_Results_${runId.slice(0, 8)}.xlsx`;
      
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = decodeURIComponent(disposition.split('filename=')[1]);
      }
      
      return res.blob().then(blob => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
      // Split extension to cleanly insert sequential counters before '.xlsx'
      const extensionIndex = filename.lastIndexOf('.');
      const baseName = extensionIndex !== -1 ? filename.slice(0, extensionIndex) : filename;
      const extension = extensionIndex !== -1 ? filename.slice(extensionIndex) : '.xlsx';

      // Track how many times this specific structural file combination name was queried
      if (!activeDownloadTracker[baseName]) {
        activeDownloadTracker[baseName] = 0;
      }
      activeDownloadTracker[baseName] += 1;

      // Determine final output string
      let finalizedFileName = filename;
      if (activeDownloadTracker[baseName] > 1) {
        // Produces: Site_Area_BR_Results(1).xlsx, Site_Area_BR_Results(2).xlsx...
        finalizedFileName = `${baseName}(${activeDownloadTracker[baseName] - 1})${extension}`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalizedFileName; // Downloads using sequentially tracked index name strings
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch(err => console.error("Document download parsing error:", err));
};

  const winners = results.filter((r) => r.status === 'WINNER');
  const waitlisted = results.filter((r) => r.status === 'WAITLIST');

  return (
    <div className="page-shell" style={{ padding: '2rem max(1.5rem, 5vw)', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Block */}
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: `2px solid ${CBE_GOLD}30` }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: CBE_FUCHSIA, marginBottom: 4, letterSpacing: '-0.02em' }}>
          📋 Lottery Audit Records
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
          Historical overview of all cryptographically generated draw sequences and distribution outcomes
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.75rem', alignItems: 'start' }}>
        
        {/* Left Side History Panel */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `${CBE_FUCHSIA}04` }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Previous Batches</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', background: CBE_FUCHSIA, padding: '2px 8px', borderRadius: 9999 }}>{history.length}</span>
          </div>
          <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {loadingHistory ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                {/* ENLARGED SIDEBAR SPINNER */}
                <div className="spin-fast" style={{ width: 36, height: 36, border: `3px solid ${CBE_FUCHSIA}15`, borderTopColor: CBE_FUCHSIA, borderRadius: '50%', margin: '0 auto' }} />
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>No lottery historical items tracked yet</div>
            ) : (
              history.map((item) => {
                const active = selectedRun === item.lotteryRunId;
                return (
                  <div
                    key={item.lotteryRunId}
                    onClick={() => loadResults(item.lotteryRunId)}
                    style={{
                      padding: '1.1rem 1.25rem',
                      cursor: 'pointer',
                      borderLeft: active ? `4px solid ${CBE_FUCHSIA}` : '4px solid transparent',
                      background: active ? `${CBE_FUCHSIA}08` : 'transparent',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: active ? CBE_FUCHSIA : '#0f172a', marginBottom: 4 }}>
                      {new Date(item.drawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 6 }}>
                      {new Date(item.drawDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>🏆 {item.winners} allocated</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ea580c' }}>⏳ {item.waitlisted} wait</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Main Results Content Grid */}
        <div>
          {!selectedRun ? (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '5rem 4rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>📋</div>
              <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Select an operational batch run item from the left panel to review logs.</p>
            </div>
          ) : (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }} className="fade-in-up">
              
              {/* Detailed Panel Sub Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: '#f8fafc' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Run Identifier: <span style={{ color: CBE_FUCHSIA, fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700 }}>{selectedRun.slice(0, 16)}…</span>
                  </h2>
                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: 6 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>🏆 {winners.length} Confirmed Winners</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>⏳ {waitlisted.length} Waitlisted Queue</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Total Actions: {results.length}</span>
                  </div>
                </div>
                <button 
                  className="btn" 
                  onClick={() => downloadExcel(selectedRun)}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(22,163,74,0.25)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                  onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
                >
                  📥 Export Document
                </button>
              </div>

              {/* Core Presentation Table */}
              <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#ffffff', borderBottom: `2px solid ${CBE_FUCHSIA}20`, zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>#</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Applicant ID</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Name</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Site</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Area Size</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Bed room</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Block</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>House No.</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Floor</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Outcome Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#334155', fontSize: '0.9rem' }}>
                    {loadingResults ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '5rem' }}>
                          {/* FIXED: SIGNIFICANTLY ENLARGED MAIN LOADER ELEMENTS */}
                          <div className="spin-fast" style={{ width: 52, height: 56, border: `4px solid ${CBE_FUCHSIA}15`, borderTopColor: CBE_FUCHSIA, borderRadius: '50%', margin: '0 auto 1.25rem' }} />
                          <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>Compiling transaction result ledger records...</p>
                        </td>
                      </tr>
                    ) : (
                      results.map((r, i) => (
                        <tr 
                          key={r.id} 
                          style={{ 
                            borderBottom: '1px solid #f1f5f9', 
                            background: r.status === 'WINNER' ? '#16a34a03' : 'transparent',
                            transition: 'background 0.15s' 
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = r.status === 'WINNER' ? '#16a34a06' : '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = r.status === 'WINNER' ? '#16a34a03' : 'transparent'}
                        >
                          <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 600, color: '#475569' }}>{r.applicantIdCode}</td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>{r.username}</td>
                          <td style={{ padding: '1rem 1.25rem', color: '#0f172a', fontWeight: 500 }}>{r.site}</td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{r.area} m²</td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: CBE_FUCHSIA, textAlign: 'center' }}>{r.bedroom} BR</td>
                          <td style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 500 }}>{r.block}</td>
                          <td style={{ padding: '1rem 1.25rem', color: CBE_GOLD, fontWeight: 800 }}>{r.houseNumber || '—'}</td>
                          <td style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 600 }}>{r.floor !== null ? `Level ${r.floor}` : '—'}</td>
                          <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={r.status} /></td>
                        </tr>
                      ))
                    )}
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