

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// CBE Corporate Color Tokens
const CBE_FUCHSIA = '#86198f'; // Authentic fuchsia-800
const CBE_GOLD = '#d4af37';    // Professional bank gold

const StatCard = ({ icon, label, value, color, sub }) => (
  <div 
    className="stat-card fade-in-up"
    style={{
      background: '#ffffff',
      border: `1px solid #e2e8f0`,
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: 12,
        background: `${color}15`, // Light tint background for high visibility
        border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem',
      }}>{icon}</div>
    </div>
    <div style={{ fontSize: '2.4rem', fontWeight: 900, color, lineHeight: 1, marginBottom: 6 }}>
      {value ?? '—'}
    </div>
    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: 4 }}>{sub}</div>}
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
      <div style={{ padding: '6rem 3rem', textAlign: 'center' }}>
        <div className="spin-fast" style={{
          width: 44, height: 44,
          border: `3px solid ${CBE_FUCHSIA}20`,
          borderTopColor: CBE_FUCHSIA,
          borderRadius: '50%',
          margin: '0 auto 1.25rem',
        }} />
        <p style={{ color: '#475569', fontWeight: 500 }}>Loading CBE Portal...</p>
      </div>
    );
  }

  const lastDate = stats?.lastLotteryDate
    ? new Date(stats.lastLotteryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No lottery run yet';

  return (
    <div className="page-shell" style={{ padding: '2rem max(1.5rem, 5vw)', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* CBE Branded Header */}
      <div style={{ 
        marginBottom: '2.5rem', 
        paddingBottom: '1rem', 
        borderBottom: `2px solid ${CBE_GOLD}30` 
      }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: CBE_FUCHSIA, marginBottom: 4, letterSpacing: '-0.02em' }}>
          Commercial Bank of Ethiopia
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
          Central KYC Portal — House Lottery Admin Management
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        <StatCard icon="🏠" label="Total Houses" value={stats?.totalHouses} color="#2563eb" />
        <StatCard icon="✅" label="Available Houses" value={stats?.availableHouses} color="#16a34a" sub="status = NONE" />
        <StatCard icon="👥" label="Total Applicants" value={stats?.totalApplicants} color={CBE_FUCHSIA} />
        <StatCard icon="🏆" label="Winners" value={stats?.winners} color={CBE_GOLD} />
        <StatCard icon="⏳" label="Waitlisted" value={stats?.waitlisted} color="#ea580c" />
        <StatCard icon="⚪" label="Pending" value={stats?.pendingApplicants} color="#64748b" sub="Not yet in lottery" />
      </div>

      {/* Last Lottery Info */}
      <div style={{ 
        padding: '1.5rem', 
        marginBottom: '2.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem',
        background: `linear-gradient(135deg, ${CBE_FUCHSIA}08, ${CBE_FUCHSIA}03)`,
        border: `1px dashed ${CBE_FUCHSIA}40`,
        borderRadius: '16px'
      }}>
        <div style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>📅</div>
        <div>
          <div style={{ fontSize: '0.8rem', color: CBE_FUCHSIA, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Lottery Draw</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{lastDate}</div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 4, height: 16, background: CBE_GOLD, borderRadius: 2 }}></span>
          Quick Actions Menu
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button 
            className="btn" 
            onClick={() => navigate('/lottery')}
            style={{
              background: `linear-gradient(135deg, ${CBE_FUCHSIA}, #6b1272)`,
              color: '#ffffff',
              padding: '0.875rem 1.75rem',
              borderRadius: '12px',
              fontWeight: 600,
              border: 'none',
              boxShadow: `0 4px 14px ${CBE_FUCHSIA}40`
            }}
          >
            🎡 Run New Lottery
          </button>
          
          {['/results', '/houses', '/applicants'].map((path, index) => {
            const labels = ['📋 View All Results', '🏠 Manage Houses', '👥 Manage Applicants'];
            return (
              <button 
                key={path}
                className="btn" 
                onClick={() => navigate(path)}
                style={{
                  background: '#ffffff',
                  color: CBE_FUCHSIA,
                  padding: '0.875rem 1.75rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  border: `2px solid ${CBE_FUCHSIA}25`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${CBE_FUCHSIA}05`;
                  e.currentTarget.style.borderColor = CBE_FUCHSIA;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = `${CBE_FUCHSIA}25`;
                }}
              >
                {labels[index]}
              </button>
            );
          })}
        </div>
      </div>

      {/* System Summary Information Box */}
      {stats && (
        <div style={{ 
          padding: '1.75rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 4, height: 16, background: CBE_FUCHSIA, borderRadius: 2 }}></span>
            System Analytics Summary
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            {[
              { label: 'Houses Provided', value: stats.totalHouses - stats.availableHouses, color: '#2563eb' },
              { label: 'Lottery Coverage', value: stats.totalApplicants > 0 ? `${Math.round(((stats.winners + stats.waitlisted) / stats.totalApplicants) * 100)}%` : '0%', color: CBE_GOLD },
              { label: 'House Utilization', value: stats.totalHouses > 0 ? `${Math.round(((stats.totalHouses - stats.availableHouses) / stats.totalHouses) * 100)}%` : '0%', color: '#16a34a' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                flex: '1 1 200px',
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid #edf2f7',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;