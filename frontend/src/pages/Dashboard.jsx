
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
      title: "Assignment History",
      path: "/assignment-history",
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-fuchsia-200 border-t-fuchsia-600"></div>
          <p className="text-lg font-semibold text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-12 flex flex-col gap-10">

        {/* Hero Section */}
        <header className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 shadow-xl shadow-purple-900/5 transition-all hover:bg-white/70">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Welcome back</p>
              <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-700 to-purple-800 tracking-tight">
                {user.name}
              </h1>
              <p className="text-slate-600 font-medium">Here's what's happening today</p>
            </div>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-bold text-slate-700 tracking-wide">{formatRole(user.role)}</span>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div>
          <div className="mb-8 pl-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quick Actions</h2>
            <p className="text-slate-500 mt-1">Access your frequent tasks</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 aspect-square flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/80 hover:shadow-xl hover:shadow-purple-900/10 hover:scale-[1.02] hover:-translate-y-1"
              >
                {/* Content */}
                <div className="relative z-10 space-y-5 p-6 flex flex-col items-center justify-center h-full w-full">
                  <div className={`
                    flex items-center justify-center rounded-2xl p-4 shadow-sm transition-all duration-300 
                    bg-gradient-to-br ${action.color.replace('from-', 'from-white to-slate-50 border border-slate-100')}
                    group-hover:scale-110 group-hover:shadow-md
                  `}>
                    <action.icon
                      className={`h-8 w-8 transition-colors duration-300 ${action.iconColor}`}
                    />
                  </div>
                  <h3 className="font-bold text-slate-700 text-sm leading-tight px-2 group-hover:text-fuchsia-700 transition-colors">
                    {action.title}
                  </h3>
                </div>

                {/* Hover Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob { 
          0% { transform: translate(0px, 0px) scale(1); } 
          33% { transform: translate(30px, -50px) scale(1.1); } 
          66% { transform: translate(-20px, 20px) scale(0.9); } 
          100% { transform: translate(0px, 0px) scale(1); } 
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}

export default Dashboard

