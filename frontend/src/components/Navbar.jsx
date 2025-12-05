import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { signOutSuccess } from "../redux/user/userSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      dispatch(signOutSuccess());
      setDropdownOpen(false);
      navigate("/signin");
    } catch (err) {
      dispatch(signOutSuccess());
      navigate("/signin");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-fuchsia-900 backdrop-blur-md border-b border-gray-200 shadow-md z-50">
      <div className="px-4 sm:px-8">
        <div className="flex justify-between items-center py-3 relative">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 hover:opacity-80 transition-all"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-700 to-rose-600 rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <div className="hidden sm:block leading-tight">
              <h1 className="text-[32px] font-black bg-gradient-to-r from-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
                CBE KYC
              </h1>
              <p className="text-[10px] font-semibold tracking-wide text-amber-500">
                
                commercial bank of ethiopia
              </p>
            </div>
          </Link>

          {/* Profile */}
          <div className="  bg-red-900 rounded-lg"
          >
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-white"
            >
              <p className="hidden md:block text-sm font-bold text-gray-900 truncate max-w-[120px] bg-white">
                {displayName}
              </p>

              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-700 to-rose-600 rounded-full flex items-center justify-center shadow-lg border border-white/60">
                <span className="text-white font-bold text-sm">
                  {initials}
                </span>
              </div>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <>
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-900 text-sm">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role || "Officer"}
                    </p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-rose-600 font-semibold bg-red-900"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>

                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
