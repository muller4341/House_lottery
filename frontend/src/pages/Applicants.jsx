import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const StatusBadge = ({ status }) => {
  if (status === 'WINNER') return <span className="badge badge-winner">🏆 Winner</span>;
  if (status === 'WAITLIST') return <span className="badge badge-waitlist">⏳ Waitlist</span>;
  return <span className="badge badge-none">Pending</span>;
};

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
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

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.site) params.site = filters.site;
      if (filters.area) params.area = filters.area;
      if (filters.status) params.status = filters.status;

      const { data } = await axios.get('/api/admin/applicants', {
        headers: authHeader(),
        params,
      });
      setApplicants(data);
      setPage(1);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch applicants', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await axios.post('/api/admin/upload-applicants', formData, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      showToast(data.message);
      fetchApplicants();
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const paginated = applicants.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(applicants.length / PER_PAGE);

  const stats = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === 'NONE').length,
    winners: applicants.filter((a) => a.status === 'WINNER').length,
    waitlist: applicants.filter((a) => a.status === 'WAITLIST').length,
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
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.3s ease',
        }}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', marginBottom: 4 }}>👥 Applicants</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Manage lottery applicant list</p>
        </div>
        <label id="upload-applicants-btn" style={{ cursor: 'pointer' }}>
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
          { label: 'Total', value: stats.total, color: '#a78bfa' },
          { label: 'Pending', value: stats.pending, color: '#94a3b8' },
          { label: 'Winners', value: stats.winners, color: 'var(--gold-400)' },
          { label: 'Waitlisted', value: stats.waitlist, color: '#f97316' },
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
          <option value="NONE">Pending</option>
          <option value="WINNER">Winner</option>
          <option value="WAITLIST">Waitlisted</option>
        </select>
        <button className="btn btn-navy" onClick={() => setFilters({ site: '', area: '', status: '' })}>🔄 Reset</button>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Site</th>
                <th>Area</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                  <div className="spin-fast" style={{ width:32, height:32, border:'2px solid var(--navy-700)', borderTopColor:'var(--gold-500)', borderRadius:'50%', margin:'0 auto 0.75rem' }} />
                  Loading applicants...
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                  {applicants.length === 0 ? '📭 No applicants uploaded yet. Upload an Excel file to get started.' : '🔍 No applicants match the current filters.'}
                </td></tr>
              ) : (
                paginated.map((app, i) => (
                  <tr key={app.id}>
                    <td style={{ color: '#475569' }}>{(page - 1) * PER_PAGE + i + 1}</td>
                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{app.username}</td>
                    <td>{app.site}</td>
                    <td>{app.area}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
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
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, applicants.length)} of {applicants.length}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-navy" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.375rem 0.75rem' }}>← Prev</button>
              <span style={{ padding: '0.375rem 0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>Page {page} / {totalPages}</span>
              <button className="btn btn-navy" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.375rem 0.75rem' }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)', borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          💡 <strong style={{ color: 'var(--gold-400)' }}>Excel format:</strong> Columns should be named{' '}
          <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: 4, color: '#e2e8f0' }}>username</code> (full name),{' '}
          <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: 4, color: '#e2e8f0' }}>site</code>,{' '}
          <code style={{ background: 'rgba(255,255,255,0.07)', padding: '0 4px', borderRadius: 4, color: '#e2e8f0' }}>area</code>
        </p>
      </div>
    </div>
  );
};

export default Applicants;