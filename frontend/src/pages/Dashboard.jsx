
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  ClockIcon as ClockIconSolid,
  ArrowTrendingUpIcon,
  UserPlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useSelector((state) => state.user);

  const formatRole = (role) => {
  if (!role) return '';
  
  return role
    .toLowerCase()                    // → central_kyc_manager
    .split('_')                       // → ['central', 'kyc', 'manager']
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // → ['Central', 'Kyc', 'Manager']
    .join(' ');                       // → 'Central Kyc Manager'
};


 const quickActions = [
  // Everyone sees these

  { icon: DocumentTextIcon, title: 'View Assignments', path: '/assignment-view', color: 'from-indigo-600 to-blue-600' },
  { icon: ChartBarIcon, title: 'Analytics', path: '/analytics', color: 'from-pink-600 to-rose-600' },
  { icon: UsersIcon, title: 'Customer List', path: '/customers', color: 'from-fuchsia-600 to-pink-600' },
  

  // ONLY CENTRAL_KYC_MANAGER SEES THESE
  ...(user?.role === 'CENTRAL_KYC_MANAGER' ? [
    { icon: UserPlusIcon, title: 'Add User', path: '/add-user', color: 'from-violet-600 to-purple-600' },
    { icon: BuildingOfficeIcon, title: 'Branch Management', path: '/branch-management', color: 'from-orange-600 to-red-600' },
  ] : []),
  // Daily Assignment → CENTRAL_KYC_MANAGER or TEAM_LEADER
  ...(user?.role === 'CENTRAL_KYC_MANAGER' ||user?.role==='TEAM_LEADER' ? [
      { icon: CalendarIcon, title: 'Daily Assignment', path: '/daily-assignment', color: 'from-emerald-600 to-teal-600' },
      { icon: CalendarIcon, title: 'Current Assignments', path: '/current-assignments', color: 'from-emerald-600 to-teal-600' },

  ] : []),

...(user?.role === 'OFFICER' ||user?.role==='TEAM_LEADER' ? [
      { icon: UserGroupIcon, title: 'My Assignments', path: '/my-assignments', color: 'from-yellow-600 to-amber-600' },
  ] : []),
  

  // Optional: Add more role-specific actions later
];

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-b-4 border-fuchsia-800"></div>
          <p className="mt-6 text-2xl font-bold text-fuchsia-800">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex flex-col relative overflow-hidden">

    {/* Animated Background Blobs */}
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute top-40 right-0 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <div className="flex-1 p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">

      {/* Welcome Hero Card */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12 text-center transform hover:scale-[1.01] transition-all duration-500">
        <span className="text-fuchsia-700 font-bold tracking-wider text-2xl lg:text-3xl">
          Welcome back
        </span>
        <h1 className="mt-3 text-2xl lg:text-3xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent leading-tight">
          {user.name}
        </h1>
        <p className="mt-4 text-lg sm:text-xl font-medium text-fuchsia-600/80">
          {formatRole(user.role)}
        </p>
      </div>
      {/* Quick Actions Section Title */}
<div className=" mb-10 lg:mb-14 flex justify-center flex-col items-start">
  <h2 className="text-2xl sm:text-5xl lg:text-3xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent leading-tight">
    Your Quick Actions
  </h2>
  <p className="mt-4 text-lg sm:text-xl text-fuchsia-700/80 font-medium tracking-wide">
    Everything you need — one tap away
  </p>
</div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-xl border border-fuchsia-100 hover:border-fuchsia-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3"
          >
            {/* Gradient Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
              // Tailwind can't read dynamic classes, so we use inline style
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} mix-blend-overlay`} />
            </div>

            <div className="relative p-8 flex flex-col items-center text-center space-y-5">
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${action.color} p-4 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-full h-full text-white" />
              </div>
              <span className="font-bold text-gray-800 text-lg group-hover:text-fuchsia-900 transition-colors">
                {action.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      
    </div>

    {/* Blob Animation CSS */}
    <style jsx>{`
      @keyframes blob {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(40px, -60px) scale(1.1); }
        66% { transform: translate(-30px, 40px) scale(0.95); }
      }
      .animate-blob { animation: blob 18s infinite; }
      .animation-delay-2000 { animation-delay: 2s; }
      .animation-delay-4000 { animation-delay: 4s; }
    `}</style>
  </div>
);
};

export default Dashboard;