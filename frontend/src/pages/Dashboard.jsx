
// import React from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { 
//   UserGroupIcon, 
//   ClockIcon as ClockIconSolid,
//   ArrowTrendingUpIcon,
//   UserPlusIcon,
//   CalendarIcon,
//   DocumentTextIcon,
//   BuildingOfficeIcon,
//   ChartBarIcon,
//   UsersIcon
// } from '@heroicons/react/24/outline';
// import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { user, loading: userLoading } = useSelector((state) => state.user);

//   const formatRole = (role) => {
//   if (!role) return '';
  
//   return role
//     .toLowerCase()                    // → central_kyc_manager
//     .split('_')                       // → ['central', 'kyc', 'manager']
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // → ['Central', 'Kyc', 'Manager']
//     .join(' ');                       // → 'Central Kyc Manager'
// };


//  const quickActions = [
//   // Everyone sees these

//   { icon: DocumentTextIcon, title: 'View Assignments', path: '/assignment-view', color: 'from-indigo-600 to-blue-600' },
//   { icon: ChartBarIcon, title: 'Analytics', path: '/analytics', color: 'from-pink-600 to-rose-600' },
//   { icon: UsersIcon, title: 'Customer List', path: '/customers', color: 'from-fuchsia-600 to-pink-600' },
  

//   // ONLY CENTRAL_KYC_MANAGER SEES THESE
//   ...(user?.role === 'CENTRAL_KYC_MANAGER' ? [
//     { icon: UserPlusIcon, title: 'Add User', path: '/add-user', color: 'from-violet-600 to-purple-600' },
//     { icon: UserPlusIcon, title: 'User List', path: '/user-list', color: 'from-violet-600 to-purple-600' },
//     { icon: BuildingOfficeIcon, title: 'Add New Branch', path: '/branch-management', color: 'from-orange-600 to-red-600' },
//     { icon: BuildingOfficeIcon, title: 'List of Branchs', path: '/branch-list', color: 'from-orange-600 to-red-600' },
//   ] : []),
//   // Daily Assignment → CENTRAL_KYC_MANAGER or TEAM_LEADER
//   ...(user?.role === 'CENTRAL_KYC_MANAGER' ||user?.role==='TEAM_LEADER' ? [
//       { icon: CalendarIcon, title: 'Daily Assignment', path: '/daily-assignment', color: 'from-emerald-600 to-teal-600' },
//       { icon: CalendarIcon, title: 'Current Assignments', path: '/current-assignments', color: 'from-emerald-600 to-teal-600' },

//   ] : []),

// ...(user?.role === 'OFFICER' ||user?.role==='TEAM_LEADER' ? [
//       { icon: UserGroupIcon, title: 'My Assignments', path: '/my-assignments', color: 'from-yellow-600 to-amber-600' },
//   ] : []),
  

//   // Optional: Add more role-specific actions later
// ];

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
//   <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex flex-col relative overflow-hidden">

//     {/* Animated Background Blobs */}
//     <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//       <div className="absolute top-0 -left-40 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl animate-blob"></div>
//       <div className="absolute top-40 right-0 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
//       <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
//     </div>

//     <div className="flex-1 p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-10">

//       {/* Welcome Hero Card */}
//       <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12 text-center transform hover:scale-[1.01] transition-all duration-500">
//         <span className="text-fuchsia-700 font-bold tracking-wider text-2xl lg:text-3xl">
//           Welcome back
//         </span>
//         <h1 className="mt-3 text-2xl lg:text-3xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent leading-tight">
//           {user.name}
//         </h1>
//         <p className="mt-4 text-lg sm:text-xl font-medium text-fuchsia-600/80">
//           {formatRole(user.role)}
//         </p>
//       </div>
//       {/* Quick Actions Section Title */}
// <div className=" mb-10 lg:mb-14 flex justify-center flex-col items-start">
//   <h2 className="text-2xl sm:text-5xl lg:text-3xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent leading-tight">
//     Your Quick Actions
//   </h2>
//   <p className="mt-4 text-lg sm:text-xl text-fuchsia-700/80 font-medium tracking-wide">
//     Everything you need — one tap away
//   </p>
// </div>

//       {/* Quick Actions Grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
//         {quickActions.map((action, i) => (
//           <button
//             key={i}
//             onClick={() => navigate(action.path)}
//             className="group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-xl border border-fuchsia-100 hover:border-fuchsia-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3"
//           >
//             {/* Gradient Hover Overlay */}
//             <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
//               style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
//               // Tailwind can't read dynamic classes, so we use inline style
//             >
//               <div className={`absolute inset-0 bg-gradient-to-br ${action.color} mix-blend-overlay`} />
//             </div>

//             <div className="relative p-8 flex flex-col items-center text-center space-y-5">
//               <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${action.color} p-4 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
//                 <action.icon className="w-full h-full text-white" />
//               </div>
//               <span className="font-bold text-gray-800 text-lg group-hover:text-fuchsia-900 transition-colors">
//                 {action.title}
//               </span>
//             </div>
//           </button>
//         ))}
//       </div>

      
//     </div>

//     {/* Blob Animation CSS */}
//     <style jsx>{`
//       @keyframes blob {
//         0%, 100% { transform: translate(0px, 0px) scale(1); }
//         33% { transform: translate(40px, -60px) scale(1.1); }
//         66% { transform: translate(-30px, 40px) scale(0.95); }
//       }
//       .animate-blob { animation: blob 18s infinite; }
//       .animation-delay-2000 { animation-delay: 2s; }
//       .animation-delay-4000 { animation-delay: 4s; }
//     `}</style>
//   </div>
// );
// };

// export default Dashboard;
"use client"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  UserGroupIcon,
  UserPlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, loading: userLoading } = useSelector((state) => state.user)

  const formatRole = (role) => {
    if (!role) return ""

    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const quickActions = [
    {
      icon: ClipboardDocumentListIcon,
      title: "View Assignments",
      path: "/assignment-view",
      color: "from-blue-600 to-cyan-600",
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
      shadowColor: "shadow-blue-500/20",
    },
    {
      icon: ChartBarIcon,
      title: "Analytics",
      path: "/analytics",
      color: "from-purple-600 to-violet-600",
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-50",
      shadowColor: "shadow-purple-500/20",
    },
    {
      icon: UsersIcon,
      title: "Customer List",
      path: "/customers",
      color: "from-pink-600 to-rose-600",
      iconColor: "text-pink-600",
      iconBgColor: "bg-pink-50",
      shadowColor: "shadow-pink-500/20",
    },

    ...(user?.role === "CENTRAL_KYC_MANAGER"
      ? [
          {
            icon: UserPlusIcon,
            title: "Add User",
            path: "/add-user",
            color: "from-indigo-600 to-purple-600",
            iconColor: "text-indigo-600",
            iconBgColor: "bg-indigo-50",
            shadowColor: "shadow-indigo-500/20",
          },
          {
            icon: UserGroupIcon,
            title: "User List",
            path: "/user-list",
            color: "from-violet-600 to-fuchsia-600",
            iconColor: "text-violet-600",
            iconBgColor: "bg-violet-50",
            shadowColor: "shadow-violet-500/20",
          },
          {
            icon: BuildingOfficeIcon,
            title: "Add New Branch",
            path: "/branch-management",
            color: "from-orange-600 to-red-600",
            iconColor: "text-orange-600",
            iconBgColor: "bg-orange-50",
            shadowColor: "shadow-orange-500/20",
          },
          {
            icon: BuildingLibraryIcon,
            title: "List of Branchs",
            path: "/branch-list",
            color: "from-amber-600 to-orange-600",
            iconColor: "text-amber-600",
            iconBgColor: "bg-amber-50",
            shadowColor: "shadow-amber-500/20",
          },
        ]
      : []),

    ...(user?.role === "CENTRAL_KYC_MANAGER" || user?.role === "TEAM_LEADER"
      ? [
          {
            icon: CalendarIcon,
            title: "Daily Assignment",
            path: "/daily-assignment",
            color: "from-emerald-600 to-teal-600",
            iconColor: "text-emerald-600",
            iconBgColor: "bg-emerald-50",
            shadowColor: "shadow-emerald-500/20",
          },
          {
            icon: ClipboardDocumentCheckIcon,
            title: "Current Assignments",
            path: "/current-assignments",
            color: "from-teal-600 to-cyan-600",
            iconColor: "text-teal-600",
            iconBgColor: "bg-teal-50",
            shadowColor: "shadow-teal-500/20",
          },
        ]
      : []),

    ...(user?.role === "OFFICER" || user?.role === "TEAM_LEADER"
      ? [
          {
            icon: DocumentTextIcon,
            title: "My Assignments",
            path: "/my-assignments",
            color: "from-yellow-600 to-amber-600",
            iconColor: "text-yellow-600",
            iconBgColor: "bg-yellow-50",
            shadowColor: "shadow-yellow-500/20",
          },
        ]
      : []),
  ]

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 relative">
      {/* Subtle dot pattern overlay */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.08) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-12">
        <header className="mb-16">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Welcome back</p>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{user.name}</h1>
              </div>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <span className="text-sm font-bold text-white tracking-wide">{formatRole(user.role)}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Quick Actions</h2>
          <p className="mt-3 text-lg text-gray-600">Everything you need — one click away</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`group relative overflow-hidden rounded-3xl bg-white border border-gray-200 aspect-square flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-gray-300 hover:shadow-2xl ${action.shadowColor} hover:scale-105 hover:-translate-y-2`}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              />

              {/* Content */}
              <div className="relative z-10 space-y-6 p-6 flex flex-col items-center justify-center h-full">
                <div
                  className={`flex items-center justify-center rounded-2xl ${action.iconBgColor} border-2 border-gray-100 p-4 shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl group-hover:${action.shadowColor}`}
                >
                  <action.icon
                    className={`h-8 w-8 ${action.iconColor} transition-all duration-500 group-hover:scale-110`}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight px-2 group-hover:text-indigo-700 transition-colors duration-300">
                    {action.title}
                  </h3>
                </div>
              </div>

              {/* Shimmer effect */}
              <div
                className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-current to-transparent opacity-5`}
                style={{ color: action.iconColor.replace("text-", "") }}
              ></div>

              {/* Corner accent */}
              <div
                className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-ping`}
                style={{ color: action.iconColor.replace("text-", "") }}
              ></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

