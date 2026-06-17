import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="stat-card fade-in-up">
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: 12,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem',
      }}>{icon}</div>
    </div>
    <div style={{ fontSize: '2.4rem', fontWeight: 900, color, lineHeight: 1, marginBottom: 6 }}>
      {value ?? '—'}
    </div>
    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4 }}>{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div className="spin-fast" style={{
          width: 40, height: 40,
          border: '3px solid var(--navy-700)',
          borderTopColor: 'var(--gold-500)',
          borderRadius: '50%',
          margin: '0 auto 1rem',
        }} />
        <p style={{ color: '#64748b' }}>Loading dashboard...</p>
      </div>
    );
  }

  const lastDate = stats?.lastLotteryDate
    ? new Date(stats.lastLotteryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No lottery run yet';

  return (
    <div className="page-shell">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#f1f5f9', marginBottom: 6 }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
          Overview of the House Lottery System
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        <StatCard icon="🏠" label="Total Houses" value={stats?.totalHouses} color="#60a5fa" />
        <StatCard icon="✅" label="Available Houses" value={stats?.availableHouses} color="#4ade80" sub="status = NONE" />
        <StatCard icon="👥" label="Total Applicants" value={stats?.totalApplicants} color="#a78bfa" />
        <StatCard icon="🏆" label="Winners" value={stats?.winners} color="var(--gold-400)" />
        <StatCard icon="⏳" label="Waitlisted" value={stats?.waitlisted} color="#f97316" />
        <StatCard icon="⚪" label="Pending" value={stats?.pendingApplicants} color="#94a3b8" sub="Not yet in lottery" />
      </div>

      {/* Last Lottery Info */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>📅</div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Lottery Draw</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginTop: 2 }}>{lastDate}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button className="btn btn-gold btn-lg" onClick={() => navigate('/lottery')}>
            🎡 Run New Lottery
          </button>
          <button className="btn btn-navy btn-lg" onClick={() => navigate('/results')}>
            📋 View All Results
          </button>
          <button className="btn btn-navy btn-lg" onClick={() => navigate('/houses')}>
            🏠 Manage Houses
          </button>
          <button className="btn btn-navy btn-lg" onClick={() => navigate('/applicants')}>
            👥 Manage Applicants
          </button>
        </div>
      </div>

      {/* Status Summary */}
      {stats && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            System Summary
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {[
              { label: 'Houses Provided', value: stats.totalHouses - stats.availableHouses, color: '#60a5fa' },
              { label: 'Lottery Coverage', value: stats.totalApplicants > 0 ? `${Math.round(((stats.winners + stats.waitlisted) / stats.totalApplicants) * 100)}%` : '0%', color: 'var(--gold-400)' },
              { label: 'House Utilization', value: stats.totalHouses > 0 ? `${Math.round(((stats.totalHouses - stats.availableHouses) / stats.totalHouses) * 100)}%` : '0%', color: '#4ade80' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                flex: '1 1 160px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 10,
                padding: '1rem',
                border: '1px solid var(--glass-border)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color, marginBottom: 6 }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;