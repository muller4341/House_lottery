// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentCheckIcon, 
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
  ClockIcon,
  EyeIcon,
  UserPlusIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKyc: 12456,
    pending: 2345,
    approved: 9876,
    rejected: 235,
    todayKyc: 456
  });

  // Simulate fetching user data from JWT/cookie
  useEffect(() => {
    const fetchUser = () => {
      // In real app: get from cookie or API
      const userData = {
        employeeId: "070875",
        displayName: "Muluken Walle Hibste",
        fullName: "Muluken Walle Hibste",
        email: "mulukenwalle@cbe.com.et",
        department: "System Development and Customization",
        title: "Senior Software Engineer",
        isAdmin: true
      };
      setUser(userData);
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Simulate real-time stats update
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayKyc: prev.todayKyc + Math.floor(Math.random() * 10),
        pending: prev.pending + Math.floor(Math.random() * 5) - Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleAddUserClick = () => {
    navigate('/add-user');
  };

  const handleDailyAssignmentClick = () => {
    navigate('/daily-assignment');
  };

  const handleAssignmentViewClick = () => {
    navigate('/assignment-view');
  };

  const handleBranchManagementClick = () => {
    navigate('/branch-management');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-fuchsia-800"></div>
          <p className="mt-6 text-xl font-semibold text-fuchsia-800">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/15 to-pink-600/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/15 via-pink-700/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/10 to-fuchsia-800/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6 lg:py-8">
              {/* CBE Logo */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
                    CBE KYC Dashboard
                  </h1>
                  <p className="text-sm text-fuchsia-800/70 font-medium">Enterprise Authentication Platform</p>
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-4">
                <div className="text-right hidden lg:block">
                  <p className="font-semibold text-gray-900">{user?.displayName}</p>
                  <p className="text-sm text-gray-500">{user?.title}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-800 to-rose-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm lg:text-base">
                    {user?.displayName?.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 lg:py-12 w-full">
          {/* Welcome Card */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-6 lg:p-8 xl:p-10 mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fuchsia-800 uppercase tracking-wide">Welcome back</p>
                <h2 className="mt-1 text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900">
                  {user?.fullName || 'CBE Employee'}
                </h2>
                <p className="mt-2 text-lg lg:text-xl text-gray-600">
                  {user?.department || 'System Development'} •{' '}
                  <span className="font-semibold text-fuchsia-800">Employee ID: {user?.employeeId || 'CBE-XXXX'}</span>
                </p>
              </div>
              <div className="mt-6 lg:mt-0">
                <div className="flex items-center justify-center lg:justify-end">
                  <ArrowTrendingUpIcon className="h-8 w-8 lg:h-10 lg:w-10 text-green-500 mr-3 animate-bounce" />
                  <div>
                    <p className="text-3xl lg:text-4xl font-bold text-green-600">{stats.todayKyc}</p>
                    <p className="text-sm font-medium text-green-700">KYC Processed Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8 mb-8 lg:mb-12">
            {[
              { icon: UserGroupIcon, label: 'Total KYC', value: stats.totalKyc, color: 'from-fuchsia-800', bg: 'to-rose-700' },
              { icon: ClockIcon, label: 'Pending', value: stats.pending, color: 'from-yellow-600', bg: 'to-amber-600' },
              { icon: ShieldCheckIcon, label: 'Approved', value: stats.approved, color: 'from-emerald-600', bg: 'to-teal-600' },
              { icon: DocumentCheckIcon, label: 'Rejected', value: stats.rejected, color: 'from-rose-600', bg: 'to-pink-600' },
              { icon: CreditCardIcon, label: 'Today', value: stats.todayKyc, color: 'from-blue-600', bg: 'to-indigo-600' }
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white/95 backdrop-blur-2xl rounded-2xl p-6 lg:p-8 border border-fuchsia-800/20 shadow-lg hover:shadow-xl hover:shadow-fuchsia-800/20 transition-all duration-500 hover:-translate-y-2 hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} ${stat.bg} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-fuchsia-800 to-rose-700 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-ping"></div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 w-full">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-6 lg:p-8 xl:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8">
                  <div>
                    <h3 className="text-xl lg:text-2xl xl:text-3xl font-black text-gray-900">Quick Actions</h3>
                    <p className="mt-1 text-sm lg:text-base text-fuchsia-800/70">Manage KYC requests instantly</p>
                  </div>
                  <button className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-fuchsia-800/40 hover:scale-105 transition-all duration-300">
                    + New KYC Request
                  </button>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { icon: EyeIcon, title: 'Review Pending', count: stats.pending, color: 'from-yellow-500' },
                    { icon: ShieldCheckIcon, title: 'Approve KYC', count: stats.approved, color: 'from-emerald-500' },
                    { icon: DocumentCheckIcon, title: 'Reject KYC', count: stats.rejected, color: 'from-rose-500' },
                    { icon: CreditCardIcon, title: 'View Reports', count: stats.totalKyc, color: 'from-blue-500' },
                    { icon: UserGroupIcon, title: 'Customer List', count: '12,456', color: 'from-fuchsia-500' },
                    { icon: ChartBarIcon, title: 'Analytics', count: 'Today', color: 'from-indigo-500' },
                    { 
                      icon: UserPlusIcon, 
                      title: 'Add User', 
                      count: '', 
                      color: 'from-violet-500',
                      onClick: handleAddUserClick
                    },
                    { 
                      icon: CalendarIcon, 
                      title: 'Daily Assignment', 
                      count: '', 
                      color: 'from-green-500',
                      onClick: handleDailyAssignmentClick
                    },
                    { 
                      icon: DocumentTextIcon, 
                      title: 'View Assignments', 
                      count: '', 
                      color: 'from-purple-500',
                      onClick: handleAssignmentViewClick
                    },
                    { 
                      icon: BuildingOfficeIcon, 
                      title: 'Branch Management', 
                      count: '', 
                      color: 'from-orange-500',
                      onClick: handleBranchManagementClick
                    }
                  ].map((action, index) => (
                    <button
                      key={index}
                      className="group relative flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-white/80 to-gray-50/80 border border-fuchsia-800/20 shadow-sm hover:shadow-xl hover:shadow-fuchsia-800/20 hover:bg-gradient-to-br hover:from-fuchsia-50 hover:to-rose-50 transition-all duration-500 hover:scale-105 hover:-translate-y-1"
                      onClick={action.onClick}
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} to-pink-600 shadow-lg mb-4 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 text-center mb-1">{action.title}</h4>
                      {action.count && <p className="text-sm text-fuchsia-700 font-medium">{action.count}</p>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-6 lg:p-8 xl:p-10 h-full">
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-black text-gray-900">Recent Activity</h3>
                    <p className="mt-1 text-sm text-fuchsia-800/70">Latest KYC actions</p>
                  </div>
                  <button className="text-sm font-semibold text-fuchsia-800 hover:text-fuchsia-700 transition-colors duration-200">
                    View All →
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { user: 'Abebe Kebede', action: 'Approved', time: '2 min ago', status: 'success' },
                    { user: 'Helen Getachew', action: 'Pending Review', time: '5 min ago', status: 'warning' },
                    { user: 'Tilahun Alemu', action: 'Rejected', time: '12 min ago', status: 'error' },
                    { user: 'Meron Yohannes', action: 'Approved', time: '18 min ago', status: 'success' },
                    { user: 'Dawit Mengistu', action: 'Pending Review', time: '25 min ago', status: 'warning' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-white/60 to-gray-50/60 hover:from-fuchsia-50 hover:to-rose-50 border border-fuchsia-800/10 hover:border-fuchsia-800/20 transition-all duration-300 group">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                        activity.status === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                        'bg-gradient-to-r from-rose-500 to-pink-600'
                      }`}>
                        <span className="text-white font-semibold text-xs">✓</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                        <p className="text-xs text-gray-500 capitalize">{activity.action}</p>
                      </div>
                      <div className="flex-shrink-0 text-xs font-medium text-gray-500">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-2xl border-t border-fuchsia-800/20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025{' '}
              <span className="font-bold bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
                Commercial Bank of Ethiopia
              </span>
              . All rights reserved.
            </p>
            <p className="mt-2 text-xs text-fuchsia-800/60">
              KYC Dashboard • Powered by LDAP Enterprise Authentication
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;