// import React from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useState, useRef, useEffect } from 'react';
// import { signOutSuccess } from '../redux/user/userSlice';

// const NAV_LINKS = [
//   { to: '/dashboard', label: 'Dashboard', icon: '📊' },
//   { to: '/houses', label: 'Houses', icon: '🏠' },
//   { to: '/applicants', label: 'Applicants', icon: '👥' },
//   { to: '/lottery', label: 'Lottery', icon: '🎡' },
//   { to: '/results', label: 'Results', icon: '📋' },
// ];

// const Navbar = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useSelector((state) => state.user);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   const displayName = user?.fullName || user?.username || 'Admin';
//   const initials = displayName
//     .split(' ')
//     .map((n) => n[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleSignOut = () => {
//     localStorage.removeItem('token');
//     dispatch(signOutSuccess());
//     navigate('/login');
//     setDropdownOpen(false);
//   };

//   return (
//     <header style={{
//       position: 'sticky',
//       top: 0,
//       zIndex: 100,
//       background: 'rgb(112, 26, 117)',
//       backdropFilter: 'blur(20px)',
//       borderBottom: '1px solid rgba(201, 162, 39, 0.2)',
//       boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
//     }}>
//       <div style={{
//         maxWidth: 1400,
//         margin: '0 auto',
//         padding: '0 2rem',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         height: 68,
//       }}>

//         {/* Logo */}
//         <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
//           <div style={{
//             width: 40, height: 40,
//             background: 'linear-gradient(135deg, var(--gold-500), var(--gold-300))',
//             borderRadius: 10,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: '1.4rem',
//             boxShadow: '0 4px 15px rgba(201, 162, 39, 0.3)',
//           }}>🏆</div>
//           <div>
//             <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1 }}>
//               House Lottery
//             </div>
//             <div style={{ fontSize: '0.65rem', color: 'var(--gold-400)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
//               Admin Portal
//             </div>
//           </div>
//         </Link>

//         {/* Navigation Links */}
//         <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//           {NAV_LINKS.map(({ to, label, icon }) => {
//             const active = location.pathname === to || location.pathname.startsWith(to + '/');
//             return (
//               <Link
//                 key={to}
//                 to={to}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '0.4rem',
//                   padding: '0.5rem 0.875rem',
//                   borderRadius: 8,
//                   fontSize: '0.85rem',
//                   fontWeight: active ? 700 : 500,
//                   color: active ? 'var(--gold-300)' : '#94a3b8',
//                   background: active ? 'rgba(201, 162, 39, 0.12)' : 'transparent',
//                   border: active ? '1px solid rgba(201, 162, 39, 0.25)' : '1px solid transparent',
//                   transition: 'all 0.2s',
//                   textDecoration: 'none',
//                 }}
//                 onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
//                 onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}}
//               >
//                 <span>{icon}</span>
//                 <span>{label}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         {/* User Dropdown */}
//         <div ref={dropdownRef} style={{ position: 'relative' }}>
//           <button
//             onClick={() => setDropdownOpen(!dropdownOpen)}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.625rem',
//               padding: '0.375rem 0.75rem 0.375rem 0.375rem',
//               borderRadius: 9999,
//               border: dropdownOpen ? '1px solid var(--gold-500)' : '1px solid rgba(255,255,255,0.1)',
//               background: dropdownOpen ? 'rgba(201, 162, 39, 0.1)' : 'rgba(255,255,255,0.05)',
//               cursor: 'pointer',
//               transition: 'all 0.2s',
//             }}
//           >
//             <div style={{
//               width: 34, height: 34,
//               borderRadius: '50%',
//               background: 'linear-gradient(135deg, var(--navy-500), var(--gold-500))',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: '0.8rem', fontWeight: 700, color: 'white',
//               flexShrink: 0,
//             }}>{initials}</div>
//             <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//               {displayName}
//             </span>
//             <span style={{ color: '#94a3b8', fontSize: '0.7rem', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
//           </button>

//           {/* Dropdown */}
//           {dropdownOpen && (
//             <div style={{
//               position: 'absolute',
//               right: 0,
//               top: 'calc(100% + 8px)',
//               width: 220,
//               background: 'var(--navy-800)',
//               border: '1px solid var(--glass-border)',
//               borderRadius: 12,
//               boxShadow: 'var(--shadow-lg)',
//               overflow: 'hidden',
//               animation: 'fadeInUp 0.15s ease',
//             }}>
//               <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(201,162,39,0.05)' }}>
//                 <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>Signed in as</div>
//                 <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{displayName}</div>
//                 <div style={{ fontSize: '0.75rem', color: 'var(--gold-400)', marginTop: 2 }}>{user?.email}</div>
//               </div>
//               <div style={{ padding: '0.5rem' }}>
//                 <button
//                   onClick={handleSignOut}
//                   style={{
//                     width: '100%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '0.625rem',
//                     padding: '0.625rem 0.75rem',
//                     borderRadius: 8,
//                     border: 'none',
//                     background: 'transparent',
//                     color: '#f87171',
//                     fontSize: '0.875rem',
//                     fontWeight: 600,
//                     cursor: 'pointer',
//                     transition: 'background 0.15s',
//                   }}
//                   onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
//                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//                 >
//                   <span>🚪</span> Sign Out
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOutSuccess } from '../redux/user/userSlice';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/houses', label: 'Houses', icon: '🏠' },
  { to: '/applicants', label: 'Applicants', icon: '👥' },
  { to: '/lottery', label: 'Lottery', icon: '🎡' },
  { to: '/results', label: 'Results', icon: '📋' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.fullName || user?.username || 'Admin';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    dispatch(signOutSuccess());
    navigate('/login');
    setDropdownOpen(false);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgb(112, 26, 117)', // Fuchsia-900
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(217, 70, 239, 0.3)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #D946EF, #F472B6)', // Fuchsia to Pink
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 15px rgba(217, 70, 239, 0.4)',
            }}
          >
            🏠
          </div>
          <div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#f1f5f9',
                lineHeight: 1.1,
              }}
            >
              House Lottery
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: '#FACC15', // Gold
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Admin Portal
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {NAV_LINKS.map(({ to, label, icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#FDE047' : '#cbd5e1',
                  background: active ? 'rgba(253, 224, 71, 0.15)' : 'transparent',
                  border: active ? '1px solid rgba(253, 224, 71, 0.4)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.4rem 0.5rem 0.4rem 0.4rem',
              borderRadius: '9999px',
              border: dropdownOpen ? '1px solid #FACC15' : '1px solid rgba(255,255,255,0.15)',
              background: dropdownOpen ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255,255,255,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #D946EF, #C026D3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'white',
              }}
            >
              {initials}
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>
                {displayName}
              </div>
            </div>

            <span
              style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
                transition: 'transform 0.2s',
                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              }}
            >
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: 240,
                background: 'rgb(30, 41, 59)', // Slate-800
                border: '1px solid rgba(217, 70, 239, 0.3)',
                borderRadius: 12,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Signed in as</div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', marginTop: 4 }}>{displayName}</div>
                {user?.email && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>{user.email}</div>
                )}
              </div>

              <div style={{ padding: '0.5rem' }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: '#F87171',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;