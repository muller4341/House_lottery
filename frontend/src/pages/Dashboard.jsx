// // pages/Dashboard.jsx — FINAL EPIC VERSION
// import React, { useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { 
//   ChartBarIcon, 
//   UserGroupIcon, 
//   DocumentCheckIcon, 
//   ShieldCheckIcon,
//   ArrowTrendingUpIcon,
//   ClockIcon,
//   EyeIcon,
//   UserPlusIcon,
//   CalendarIcon,
//   DocumentTextIcon,
//   BuildingOfficeIcon,
//   UsersIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon as ClockIconSolid
// } from '@heroicons/react/24/outline';
// import { CheckCircleIcon as CheckCircleSolid, XCircleIcon as XCircleSolid } from '@heroicons/react/24/solid';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { user, loading: userLoading } = useSelector((state) => state.user);

//   // Real-time stats (you can replace with API later)
//   const stats = {
//     totalKyc: 12456,
//     pending: 2345,
//     approved: 9876,
//     rejected: 235,
//     todayKyc: 456 + Math.floor(Date.now() / 100000) % 200
//   };

//   const quickActions = [
//     { icon: UserPlusIcon, title: 'Add User', path: '/add-user', color: 'from-violet-600 to-purple-600' },
//     { icon: CalendarIcon, title: 'Daily Assignment', path: '/daily-assignment', color: 'from-emerald-600 to-teal-600' },
//     { icon: DocumentTextIcon, title: 'View Assignments', path: '/assignment-view', color: 'from-indigo-600 to-blue-600' },
//     { icon: BuildingOfficeIcon, title: 'Branch Management', path: '/branch-management', color: 'from-orange-600 to-red-600' },
//     { icon: ChartBarIcon, title: 'Analytics', path: '/analytics', color: 'from-pink-600 to-rose-600' },
//     { icon: UsersIcon, title: 'Customer List', path: '/customers', color: 'from-fuchsia-600 to-pink-600' },
//   ];

//   const recentActivity = [
//     { name: 'Abebe Kebede', action: 'Approved KYC', time: '2 min ago', status: 'success' },
//     { name: 'Helen Getachew', action: 'Submitted for Review', time: '5 min ago', status: 'pending' },
//     { name: 'Tilahun Alemu', action: 'Rejected KYC', time: '12 min ago', status: 'rejected' },
//     { name: 'Meron Yohannes', action: 'Approved KYC', time: '18 min ago', status: 'success' },
//     { name: 'Dawit Mengistu', action: 'Submitted for Review', time: '25 min ago', status: 'pending' },
//   ];

//   if (userLoading || !user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-20 w-20 border-b-4 border-fuchsia-800"></div>
//           <p className="mt-6 text-2xl font-bold text-fuchsia-800">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Animated Background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-fuchsia-800/20 to-pink-600/20 rounded-full blur-3xl animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/20 via-pink-700/20 to-fuchsia-800/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
//         <div className="absolute top-1/3 left-20 w-80 h-80 bg-gradient-to-br from-pink-800/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
//         {/* Welcome Hero */}
//         <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-8 lg:p-12">
//           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
//             <div className="flex-1">
//               <p className="text-fuchsia-700 font-bold uppercase tracking-wider text-sm">Welcome back, {user.role}</p>
//               <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
//                 {user.name}
//               </h1>
//               <div className="mt-4 flex flex-wrap items-center gap-4 text-gray-700">
//                 <span className="font-medium">{user.department || 'Digital Banking'}</span>
//                 <span className="hidden sm:inline">•</span>
//                 <span className="font-semibold text-fuchsia-800">ID: {user.employeeId}</span>
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-xl text-white">
//               <ArrowTrendingUpIcon className="w-12 h-12 animate-pulse" />
//               <p className="text-4xl font-black mt-2">{stats.todayKyc}</p>
//               <p className="text-sm opacity-90">KYC Today</p>
//             </div>
//           </div>
//         </div>

//         {/* Stats Grid - Fully Responsive */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
//           {[
//             { label: 'Total KYC', value: stats.totalKyc, icon: UserGroupIcon, color: 'from-fuchsia-600 to-rose-600' },
//             { label: 'Pending', value: stats.pending, icon: ClockIconSolid, color: 'from-amber-500 to-orange-600' },
//             { label: 'Approved', value: stats.approved, icon: CheckCircleSolid, color: 'from-emerald-500 to-teal-600' },
//             { label: 'Rejected', value: stats.rejected, icon: XCircleSolid, color: 'from-rose-600 to-pink-600' },
//             { label: 'Today', value: stats.todayKyc, icon: ArrowTrendingUpIcon, color: 'from-blue-600 to-indigo-600' },
//           ].map((stat, i) => (
//             <div key={i} className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-fuchsia-800/10 hover:shadow-2xl hover:border-fuchsia-800/30 transition-all duration-300 group">
//               <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
//                 <stat.icon className="w-7 h-7 text-white" />
//               </div>
//               <p className="mt-4 text-3xl font-black text-gray-900">{stat.value.toLocaleString()}</p>
//               <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
//             </div>
//           ))}
//         </div>

//         {/* Main Content: Quick Actions + Activity */}
//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Quick Actions */}
//           <div className="lg:col-span-2">
//             <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-8">
//               <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Quick Actions</h3>
//               <p className="text-fuchsia-700 mb-8">Jump to your most used features</p>

//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
//                 {quickActions.map((action, i) => (
//                   <button
//                     key={i}
//                     onClick={() => navigate(action.path)}
//                     className="group flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-fuchsia-50 hover:to-rose-50 border border-fuchsia-800/20 hover:border-fuchsia-800/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
//                   >
//                     <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all`}>
//                       <action.icon className="w-8 h-8 text-white" />
//                     </div>
//                     <span className="mt-4 font-bold text-gray-800 text-center">{action.title}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Recent Activity */}
//           <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-8 h-full">
//             <div className="flex justify-between items-center mb-6">
//               <div>
//                 <h3 className="text-2xl font-black text-gray-900">Recent Activity</h3>
//                 <p className="text-sm text-fuchsia-700">Latest team actions</p>
//               </div>
//             </div>

//             <div className="space-y-4">
//               {recentActivity.map((act, i) => (
//                 <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/70 hover:bg-fuchsia-50/70 transition-all border border-transparent hover:border-fuchsia-800/20">
//                   {act.status === 'success' && <CheckCircleIcon className="w-10 h-10 text-emerald-600" />}
//                   {act.status === 'pending' && <ClockIcon className="w-10 h-10 text-amber-600" />}
//                   {act.status === 'rejected' && <XCircleIcon className="w-10 h-10 text-rose-600" />}
                  
//                   <div className="flex-1">
//                     <p className="font-semibold text-gray-900">{act.name}</p>
//                     <p className="text-sm text-gray-600">{act.action}</p>
//                   </div>
//                   <span className="text-xs text-gray-500">{act.time}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Animations */}
//       <style jsx>{`
//         @keyframes blob {
//           0%, 100% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//         }
//         .animate-blob { animation: blob 12s infinite; }
//         .animation-delay-2000 { animation-delay: 2s; }
//         .animation-delay-4000 { animation-delay: 4s; }
//       `}</style>
//     </>
//   );
// };

// export default Dashboard;


// pages/Dashboard.jsx — FINAL CENTERED & RESPONSIVE VERSION
// pages/Dashboard.jsx — FINAL CENTERED & RESPONSIVE VERSION

// pages/Dashboard.jsx — FINAL FULL-SCREEN MASTERPIECE
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

  const stats = {
    totalKyc: 12456,
    pending: 2345,
    approved: 9876,
    rejected: 235,
    todayKyc: 456 + Math.floor(Date.now() / 100000) % 200
  };

 const quickActions = [
  // Everyone sees these
  { icon: CalendarIcon, title: 'Daily Assignment', path: '/daily-assignment', color: 'from-emerald-600 to-teal-600' },
  { icon: DocumentTextIcon, title: 'View Assignments', path: '/assignment-view', color: 'from-indigo-600 to-blue-600' },
  { icon: ChartBarIcon, title: 'Analytics', path: '/analytics', color: 'from-pink-600 to-rose-600' },
  { icon: UsersIcon, title: 'Customer List', path: '/customers', color: 'from-fuchsia-600 to-pink-600' },

  // ONLY CENTRAL_KYC_MANAGER SEES THESE
  ...(user?.role === 'CENTRAL_KYC_MANAGER' ? [
    { icon: UserPlusIcon, title: 'Add User', path: '/add-user', color: 'from-violet-600 to-purple-600' },
    { icon: BuildingOfficeIcon, title: 'Branch Management', path: '/branch-management', color: 'from-orange-600 to-red-600' },
  ] : []),

  // Optional: Add more role-specific actions later
];

  const recentActivity = [
    { name: 'Abebe Kebede', action: 'Approved KYC', time: '2 min ago', status: 'success' },
    { name: 'Helen Getachew', action: 'Submitted for Review', time: '5 min ago', status: 'pending' },
    { name: 'Tilahun Alemu', action: 'Rejected KYC', time: '12 min ago', status: 'rejected' },
    { name: 'Meron Yohannes', action: 'Approved KYC', time: '18 min ago', status: 'success' },
    { name: 'Dawit Mengistu', action: 'Submitted for Review', time: '25 min ago', status: 'pending' },
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
    <>
      {/* Animated Full-Screen Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-fuchsia-800/20 to-pink-600/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/20 via-pink-700/20 to-fuchsia-800/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-800/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* FULL-SCREEN CONTAINER — NO EMPTY SPACE EVER */}
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50">
        
        {/* Main Content Area — Full Width with Smart Padding */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 py-8 lg:py-12">
          
          {/* Perfectly Centered Content (max width for huge screens) */}
          <div className="w-full max-w-screen-2xl mx-auto space-y-12">

            {/* Welcome Hero Card */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="flex-1">
                  <p className="text-fuchsia-700 font-bold uppercase tracking-wider text-sm">Welcome back, {user.role}</p>
                  <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent leading-tight">
                    {user.name}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-gray-700">
                    <span className="font-medium">{user.department || 'Digital Banking'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-semibold text-fuchsia-800">ID: {user.employeeId}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-7 rounded-3xl shadow-2xl text-white text-center">
                  <ArrowTrendingUpIcon className="w-14 h-14 mx-auto animate-pulse" />
                  <p className="text-5xl font-black mt-3">{stats.todayKyc}</p>
                  <p className="text-lg font-medium opacity-90">KYC Today</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-8">
              {[
                { label: 'Total KYC', value: stats.totalKyc, icon: UserGroupIcon, color: 'from-fuchsia-600 to-rose-600' },
                { label: 'Pending', value: stats.pending, icon: ClockIconSolid, color: 'from-amber-500 to-orange-600' },
                { label: 'Approved', value: stats.approved, icon: CheckCircleIcon, color: 'from-emerald-500 to-teal-600' },
                { label: 'Rejected', value: stats.rejected, icon: XCircleIcon, color: 'from-rose-600 to-pink-600' },
                { label: 'Today', value: stats.todayKyc, icon: ArrowTrendingUpIcon, color: 'from-blue-600 to-indigo-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 shadow-2xl border border-fuchsia-800/15 hover:shadow-3xl hover:border-fuchsia-800/40 transition-all duration-500 group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="mt-5 text-4xl font-black text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions + Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-8 lg:p-10">
                  <h3 className="text-2xl lg:text-3xl font-black text-gray-900 mb-3">Quick Actions</h3>
                  <p className="text-fuchsia-700 mb-8 text-lg">Jump to your most used features</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(action.path)}
                        className="group flex flex-col items-center p-7 rounded-3xl bg-gradient-to-br from-gray-50/90 to-gray-100/90 hover:from-fuchsia-50 hover:to-rose-50 border border-fuchsia-800/20 hover:border-fuchsia-800/50 shadow-xl hover:shadow-2xl transition-all duration-400 hover:scale-105"
                      >
                        <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all`}>
                          <action.icon className="w-9 h-9 text-white" />
                        </div>
                        <span className="mt-5 font-bold text-gray-800 text-center text-lg">{action.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-8 lg:p-10">
                <h3 className="text-2xl font-black text-gray-900 mb-2">Recent Activity</h3>
                <p className="text-fuchsia-700 mb-6">Latest team actions</p>
                
                <div className="space-y-4">
                  {recentActivity.map((act, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50/80 hover:bg-fuchsia-50/70 transition-all border border-transparent hover:border-fuchsia-800/25">
                      {act.status === 'success' && <CheckCircleIcon className="w-12 h-12 text-emerald-600 flex-shrink-0" />}
                      {act.status === 'pending' && <ClockIconSolid className="w-12 h-12 text-amber-600 flex-shrink-0" />}
                      {act.status === 'rejected' && <XCircleIcon className="w-12 h-12 text-rose-600 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{act.name}</p>
                        <p className="text-sm text-gray-600">{act.action}</p>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Blob Animation */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.15); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-blob { animation: blob 14s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </>
  );
};

export default Dashboard;