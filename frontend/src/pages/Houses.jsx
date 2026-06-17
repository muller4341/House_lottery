import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const token = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${token()}` });

const StatusBadge = ({ status }) => {
  if (status === 'NONE') return <span className="badge badge-none">None</span>;
  if (status === 'PROVIDED') return <span className="badge badge-provided">Provided</span>;
  return <span className="badge badge-none">{status}</span>;
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
    <div className="page-shell">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 999,
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          borderRadius: 10, padding: '0.75rem 1.25rem',
          fontWeight: 600, fontSize: '0.875rem',
          boxShadow: 'var(--shadow-lg)', maxWidth: 360,
          animation: 'fadeInUp 0.3s ease',
        }}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', marginBottom: 4 }}>🏠 Houses</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Manage available housing inventory</p>
        </div>
        <label id="upload-houses-btn" style={{ cursor: 'pointer' }}>
          <span className={`btn btn-gold ${uploading ? 'disabled' : ''}`}>
            {uploading ? (
              <><span className="spin-fast" style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(0,0,0,0.2)', borderTopColor:'var(--navy-900)', borderRadius:'50%' }} /> Uploading...</>
            ) : (
              <>📤 Upload Excel</>
            )}
          </span>
          <input type="file" accept=".xlsx,.xls" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: stats.total, color: '#60a5fa' },
          { label: 'Available', value: stats.available, color: '#4ade80' },
          { label: 'Provided', value: stats.provided, color: '#f97316' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card" style={{ flex: '1 1 120px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" placeholder="Filter by Site..." style={{ flex: '1 1 150px', maxWidth: 200 }}
          value={filters.site} onChange={(e) => setFilters(f => ({ ...f, site: e.target.value }))} />
        <input className="form-input" placeholder="Filter by Area..." style={{ flex: '1 1 150px', maxWidth: 200 }}
          value={filters.area} onChange={(e) => setFilters(f => ({ ...f, area: e.target.value }))} />
        <select className="form-input" style={{ flex: '1 1 140px', maxWidth: 180 }}
          value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="NONE">Available</option>
          <option value="PROVIDED">Provided</option>
        </select>
        <button className="btn btn-navy" onClick={() => setFilters({ site: '', area: '', status: '' })}>
          🔄 Reset
        </button>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>House Number</th>
                <th>Site</th>
                <th>Area</th>
                <th>Floor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                  <div className="spin-fast" style={{ width:32, height:32, border:'2px solid var(--navy-700)', borderTopColor:'var(--gold-500)', borderRadius:'50%', margin:'0 auto 0.75rem' }} />
                  Loading houses...
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                  {houses.length === 0 ? '📭 No houses uploaded yet. Upload an Excel file to get started.' : '🔍 No houses match the current filters.'}
                </td></tr>
              ) : (
                paginated.map((house, i) => (
                  <tr key={house.id}>
                    <td style={{ color: '#475569' }}>{(page - 1) * PER_PAGE + i + 1}</td>
                    <td style={{ fontWeight: 700, color: '#e2e8f0' }}>{house.houseNumber}</td>
                    <td>{house.site}</td>
                    <td>{house.area}</td>
                    <td style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{house.floor}</td>
                    <td><StatusBadge status={house.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, houses.length)} of {houses.length}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-navy" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.375rem 0.75rem' }}>← Prev</button>
              <span style={{ padding: '0.375rem 0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                Page {page} / {totalPages}
              </span>
              <button className="btn btn-navy" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.375rem 0.75rem' }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Excel format hint */}
      <div style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          💡 <strong style={{ color: 'var(--gold-400)' }}>Excel format:</strong> Columns should be named{' '}
          <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: 4, color: '#e2e8f0' }}>houseNumber</code>,{' '}
          <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: 4, color: '#e2e8f0' }}>site</code>,{' '}
          <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: 4, color: '#e2e8f0' }}>area</code>,{' '}
          <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: 4, color: '#e2e8f0' }}>floor</code>
        </p>
      </div>
    </div>
  );
};

export default Houses;