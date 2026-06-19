


import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const token = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

// CBE Brand Colors
const CBE_FUCHSIA = '#86198f';
const CBE_GOLD = '#d4af37';

const StatusBadge = ({ status }) => {
  if (status === 'NONE') {
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
        Available
      </span>
    );
  }
  return (
    <span style={{ 
      background: '#feeee7', 
      color: '#c2410c', 
      padding: '0.25rem 0.75rem', 
      borderRadius: '9999px', 
      fontSize: '0.75rem', 
      fontWeight: 700,
      textTransform: 'uppercase'
    }}>
      Assigned
    </span>
  );
};

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({ site: '', area: '', status: '' });
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchHouses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.site) params.site = filters.site;
      if (filters.area) params.area = filters.area;
      if (filters.status) params.status = filters.status;

      const { data } = await axios.get('/api/admin/houses', {
        headers: authHeader(),
        params,
      });
      setHouses(data);
      setPage(1);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch houses', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchHouses(); }, [fetchHouses]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await axios.post('/api/admin/upload-houses', formData, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      showToast(data.message);
      fetchHouses();
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const paginated = houses.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(houses.length / PER_PAGE);

  const stats = {
    total: houses.length,
    available: houses.filter((h) => h.status === 'NONE').length,
    provided: houses.filter((h) => h.status === 'PROVIDED').length,
  };

  return (
    <div className="page-shell" style={{ padding: '2rem max(1.5rem, 5vw)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Alert Banner */}
      {toast && (
        <div style={{
          position: 'fixed', top: 30, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? '#edf7ed' : '#fdeded',
          border: `1px solid ${toast.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          color: toast.type === 'success' ? '#1e4620' : '#721c24',
          borderRadius: '12px', padding: '1rem 1.5rem',
          fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', maxWidth: 360,
        }}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      {/* Header Block with Corporate Upload Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: `2px solid ${CBE_GOLD}30`, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: CBE_FUCHSIA, marginBottom: 4, letterSpacing: '-0.02em' }}>
            🏠 Housing Inventory
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Manage allocation properties and structural registration records</p>
        </div>
        <label id="upload-houses-btn" style={{ cursor: 'pointer' }}>
          <span className={`btn ${uploading ? 'disabled' : ''}`} style={{
            background: `linear-gradient(135deg, ${CBE_FUCHSIA}, #6b1272)`,
            color: '#ffffff',
            padding: '0.875rem 1.75rem',
            borderRadius: '12px',
            fontWeight: 600,
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `0 4px 14px ${CBE_FUCHSIA}40`
          }}>
            {uploading ? (
              <><span className="spin-fast" style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#ffffff', borderRadius:'50%' }} /> Processing File...</>
            ) : (
              <>📤 Import Spreadsheet</>
            )}
          </span>
          <input type="file" accept=".xlsx,.xls" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      {/* Corporate Mini KPI Cards */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Managed Units', value: stats.total, color: '#2563eb' },
          { label: 'Available Inventory', value: stats.available, color: '#16a34a' },
          { label: 'Assigned Properties', value: stats.provided, color: '#ea580c' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ 
            flex: '1 1 240px', 
            background: '#ffffff', 
            padding: '1.25rem 1.5rem', 
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: '#475569', color: '#475569', fontWeight: 700, fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Advanced Filter Layout Card */}
      <div style={{ 
        background: '#ffffff', 
        padding: '1.25rem', 
        marginBottom: '2rem', 
        borderRadius: '16px', 
        border: '1px solid #e2e8f0',
        display: 'flex', 
        gap: '0.75rem', 
        flexWrap: 'wrap', 
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <input className="form-input" placeholder="Search Site..." style={{ flex: '1 1 200px', maxWidth: 260, padding: '0.625rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px' }}
          value={filters.site} onChange={(e) => setFilters(f => ({ ...f, site: e.target.value }))} />
        <input className="form-input" placeholder="Search Area Size..." style={{ flex: '1 1 200px', maxWidth: 260, padding: '0.625rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px' }}
          value={filters.area} onChange={(e) => setFilters(f => ({ ...f, area: e.target.value }))} />
        <select className="form-input" style={{ flex: '1 1 160px', maxWidth: 220, padding: '0.625rem 1rem', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff' }}
          value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Verification Status</option>
          <option value="NONE">Available</option>
          <option value="PROVIDED">Provided / Drawn</option>
        </select>
        <button className="btn" onClick={() => setFilters({ site: '', area: '', status: '' })} style={{
          background: '#f1f5f9',
          color: '#334155',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '0.625rem 1.25rem',
          fontWeight: 600,
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
        >
          🔄 Clear Filters
        </button>
      </div>

      {/* Main Table Presentation Container */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: `${CBE_FUCHSIA}08`, borderBottom: `2px solid ${CBE_FUCHSIA}20` }}>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>#</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>House Number</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Block</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Site</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Area Size</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Bed room</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Floor</th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', fontWeight: 700, color: CBE_FUCHSIA, textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody style={{ color: '#334155', fontSize: '0.9rem' }}>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spin-fast" style={{ width:36, height:36, border:`3px solid ${CBE_FUCHSIA}15`, borderTopColor:CBE_FUCHSIA, borderRadius:'50%', margin:'0 auto 1rem' }} />
                    <p style={{ color: '#475569', fontWeight: 500, margin: 0 }}>Querying database engine records...</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontWeight: 500 }}>
                    {houses.length === 0 ? '📭 Database index empty. Import a verified layout tracking sheet to initialize.' : '🔍 No property items match current target criteria configuration.'}
                  </td>
                </tr>
              ) : (
                paginated.map((house, i) => (
                  <tr key={house.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>{(page - 1) * PER_PAGE + i + 1}</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>{house.houseNumber}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 500 }}>{house.block || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#0f172a', fontWeight: 500 }}>{house.site}</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>{house.area} m²</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: CBE_FUCHSIA }}>{house.bedroom ?? '—'} BR</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569', fontWeight: 600 }}>Level {house.floor}</td>
                    <td style={{ padding: '1rem 1.25rem' }}><StatusBadge status={house.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Footer Control */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderTop: '1px solid #edf2f7', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
              Showing Row {(page - 1) * PER_PAGE + 1} – {Math.min(page * PER_PAGE, houses.length)} of {houses.length} Items
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{
                background: page === 1 ? '#e2e8f0' : '#ffffff',
                color: page === 1 ? '#94a3b8' : '#334155',
                border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600
              }}>← Previous</button>
              <span style={{ padding: '0.5rem 0.75rem', color: '#0f172a', fontWeight: 700, fontSize: '0.875rem' }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{
                background: page === totalPages ? '#e2e8f0' : '#ffffff',
                color: page === totalPages ? '#94a3b8' : '#334155',
                border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600
              }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* CBE Standard Format Reference Guide Box */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem 1.25rem', 
        background: `linear-gradient(135deg, ${CBE_FUCHSIA}08, ${CBE_FUCHSIA}03)`, 
        border: `1px dashed ${CBE_FUCHSIA}30`, 
        borderRadius: '12px' 
      }}>
        <p style={{ margin: 0, fontSize: '0.825rem', color: '#475569', fontWeight: 500, lineHeight: 1.5 }}>
          💡 <strong style={{ color: CBE_FUCHSIA, fontWeight: 700 }}>System Batch Import Guidelines:</strong> Imported spreadsheets must preserve exact case structure properties matching these explicit string markers:{' '}
          <code style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 6, color: CBE_FUCHSIA, fontFamily: 'monospace', fontWeight: 700 }}>Block</code>,{' '}
          <code style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 6, color: CBE_FUCHSIA, fontFamily: 'monospace', fontWeight: 700 }}>House number</code>,{' '}
          <code style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 6, color: CBE_FUCHSIA, fontFamily: 'monospace', fontWeight: 700 }}>Floor</code>,__{' '}
          <code style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 6, color: CBE_FUCHSIA, fontFamily: 'monospace', fontWeight: 700 }}>Bed room</code>,{' '}
          <code style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 6, color: CBE_FUCHSIA, fontFamily: 'monospace', fontWeight: 700 }}>Area</code>,{' '}
          <code style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 6, color: CBE_FUCHSIA, fontFamily: 'monospace', fontWeight: 700 }}>Site</code>
        </p>
      </div>
    </div>
  );
};

export default Houses;