import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      background: 'rgba(10, 22, 40, 0.95)',
      borderTop: '1px solid rgba(201, 162, 39, 0.15)',
      padding: '1.25rem 2rem',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🏆</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-400)' }}>
            House Lottery System
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
          © {year} House Lottery System. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['SECURE', 'FAIR', 'TRANSPARENT'].map((tag) => (
            <span key={tag} style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#475569',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;