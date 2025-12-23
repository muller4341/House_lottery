import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { signOutSuccess } from "../redux/user/userSlice";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      dispatch(signOutSuccess());
      navigate("/signin");
    } catch (err) {
      dispatch(signOutSuccess());
      navigate("/signin");
    } finally {
      setDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-fuchsia-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-purple-900/20 transition-all duration-300">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <Link
            to="/dashboard"
            className="group flex items-center space-x-3 transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center shadow-inner border border-white/20 group-hover:bg-white/20 transition-all">
              <BuildingLibraryIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-none drop-shadow-md">
                CBE Central KYC
              </h1>
              <span className="text-[10px] sm:text-xs font-bold text-yellow-600 tracking-widest  mt-0.5 group-hover:text-white transition-colors capitalize">
                Commercial Bank of Ethiopia
              </span>
            </div>
          </Link>

          {/* User Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`
                flex items-center gap-3 pl-1 pr-1 sm:pr-4 py-1 rounded-full border border-transparent 
                transition-all duration-300
                ${dropdownOpen
                  ? 'bg-white text-fuchsia-900 ring-2 ring-white/50'
                  : 'bg-white/10 text-white hover:bg-white/20 border-white/10'}
              `}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 border-2 border-white/20 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">{initials}</span>
              </div>

              <div className="hidden sm:flex flex-col items-start px-1">
                <span className={`text-sm font-bold leading-tight max-w-[120px] truncate ${dropdownOpen ? 'text-fuchsia-900' : 'text-fuchsia-900'}`}>
                  {displayName}
                </span>
                <span className={`text-[10px] font-semibold leading-none mt-0.5 ${dropdownOpen ? 'text-fuchsia-600' : 'text-fuchsia-400'}`}>
                  {user?.role ? user.role.replace(/_/g, ' ') : 'Officer'}
                </span>
              </div>

              <ChevronDownIcon
                className={`w-4 h-4 transition-transform duration-300 hidden sm:block ${dropdownOpen ? 'rotate-180 text-fuchsia-900' : 'text-fuchsia-200'}`}
              />
            </button>

            {/* Dropdown Menu */}
            <div
              className={`
                absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-purple-900/20 border border-slate-100 
                transform transition-all duration-200 origin-top-right overflow-hidden z-50
                ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
              `}
            >
              <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-fuchsia-50/50 to-purple-50/50">
                <p className="text-sm font-bold text-slate-800">Signed in as</p>
                <p className="text-sm font-medium text-fuchsia-700 truncate mt-0.5">{displayName}</p>
                <p className="text-xs text-slate-400 mt-2 font-mono bg-white inline-block px-2 py-1 rounded-md border border-slate-100">
                  {user?.username}
                </p>
              </div>

              <div className="p-2">

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors group mt-1"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
