// import React from 'react';

// const Footer = () => {
//   const year = new Date().getFullYear();
//   return (
//     <footer style={{
//       background: 'rgb(112, 26, 117)',
//       borderTop: '1px solid rgba(201, 162, 39, 0.15)',
//       padding: '1.25rem 2rem',
//     }}>
//       <div style={{
//         maxWidth: 1400,
//         margin: '0 auto',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         flexWrap: 'wrap',
//         gap: '0.5rem',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//           <span style={{ fontSize: '1.1rem' }}>🏆</span>
//           <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-400)' }}>
//             House Lottery System
//           </span>
//         </div>
//         <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
//           © {year} House Lottery System. All rights reserved.
//         </p>
//         <div style={{ display: 'flex', gap: '1rem' }}>
//           {['SECURE', 'FAIR', 'TRANSPARENT'].map((tag) => (
//             <span key={tag} style={{
//               fontSize: '0.65rem',
//               fontWeight: 700,
//               letterSpacing: '0.08em',
//               color: '#475569',
//             }}>{tag}</span>
//           ))}
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from 'react';

// CBE Corporate Color Tokens
const CBE_FUCHSIA = '#86198f';
const CBE_GOLD = '#d4af37';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: `2px solid ${CBE_GOLD}30`,
      padding: '1.25rem max(1.5rem, 5vw)',
      boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.02)',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* CBE Branded Identity Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>🏛️</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: CBE_FUCHSIA, letterSpacing: '-0.01em' }}>
            Commercial Bank of Ethiopia <span style={{ color: CBE_GOLD, fontWeight: 900 }}>|</span> KYC Draw Portal
          </span>
        </div>
        
        {/* Clean Copyright Text */}
        <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, margin: 0 }}>
          © {year} Commercial Bank of Ethiopia. All rights reserved.
        </p>
        
        {/* High-Contrast Badges */}
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {['SECURE', 'FAIR', 'AUDITED'].map((tag) => (
            <span key={tag} style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: CBE_FUCHSIA,
              background: `${CBE_FUCHSIA}08`,
              padding: '2px 8px',
              borderRadius: '4px',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;