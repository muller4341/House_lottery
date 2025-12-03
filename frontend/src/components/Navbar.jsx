// components/Navbar.jsx — FINAL WITH SIGN OUT (uses your existing signOutSuccess)
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOutSuccess } from '../redux/user/userSlice'; // ← your existing slice
import { useState } from 'react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.name || "User";
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      // Call backend to clear cookie
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Clear Redux state using your existing action
      dispatch(signOutSuccess());

      // Close dropdown & redirect
      setDropdownOpen(false);
      navigate('/signin');
    } catch (err) {
      console.error('Sign out failed:', err);
      // Still clear Redux & redirect (security first)
      dispatch(signOutSuccess());
      navigate('/signin');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-lg z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
        <div className="flex justify-between items-center py-5 lg:py-7 relative">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-4 hover:scale-105 transition-transform duration-300 z-10">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-fuchsia-800/30">
              <svg className="w-7 h-7 lg:w-9 lg:h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent leading-tight">
                CBE KYC Dashboard
              </h1>
              <p className="text-xs lg:text-sm text-fuchsia-800/70 font-bold tracking-widest">
                ENTERPRISE AUTHENTICATION PLATFORM
              </p>
            </div>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-4 hover:scale-105 transition-all duration-300"
            >
              <div className="hidden md:block text-right">
                <p className="text-lg font-bold text-gray-900 leading-tight">{displayName}</p>
                <p className="text-sm font-bold text-rose-700 bg-rose-100/80 px-4 py-1.5 rounded-full mt-1 shadow-sm">
                  {user?.role || "Officer"}
                </p>
              </div>

              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-fuchsia-800 via-rose-700 to-pink-700 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/60 border-3 border-white">
                <span className="text-white font-black text-lg lg:text-2xl tracking-wider">
                  {initials}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="absolute right-0 mt-4 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-fuchsia-800/20 overflow-hidden z-50">
                  <div className="p-5 border-b border-fuchsia-800/10">
                    <p className="font-bold text-gray-900 text-lg">{displayName}</p>
                    <p className="text-sm text-fuchsia-700">{user?.email || user?.employeeId}</p>
                    <p className="text-xs text-rose-700 mt-1 font-semibold">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-6 py-4 text-left hover:bg-rose-50 transition-all duration-200 flex items-center gap-3 text-rose-700 font-semibold hover:font-black"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>

                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
              </>
            )}
          </div>

          {/* Mobile Name */}
          <div className="md:hidden absolute left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm font-bold text-gray-900">{displayName}</p>
            <p className="text-xs font-medium text-rose-700">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;