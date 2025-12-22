
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CalendarIcon, ClockIcon, CalendarDaysIcon, ArchiveBoxIcon, ArrowLeftIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateStr));
};

const getShiftLabel = (shift) => shift === 'I' ? 'Shift I' : 'Shift II';

const MyAssignmentsPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  useEffect(() => {
    const fetchMyAssignments = async () => {
      try {
        const res = await fetch('/api/assignments/my-assignments');
        const data = await res.json();
        if (res.ok) setAssignments(data.assignments || []);
      } catch (err) {
        console.error("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyAssignments();
  }, [user]);

  const toDateOnly = (dateStr) => dateStr ? dateStr.split('T')[0] : '';

  const today = toDateOnly(new Date().toISOString());
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartStr = thisMonthStart.toISOString().split('T')[0];

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // Group assignments by date + shift + role
  const groupedAssignments = assignments
    .filter(a => [a.officer1Id, a.officer2Id, a.tl1Id, a.tl2Id].includes(user?.id))
    .reduce((acc, a) => {
      const date = toDateOnly(a.date);

      const { role, shift } = (() => {
        if (a.officer1Id === user.id) return { role: 'Officer 1', shift: a.officer1Shift };
        if (a.officer2Id === user.id) return { role: 'Officer 2', shift: a.officer2Shift };
        if (a.tl1Id === user.id) return { role: 'Team Leader 1', shift: a.tl1Shift || 'N/A' };
        if (a.tl2Id === user.id) return { role: 'Team Leader 2', shift: a.tl2Shift || 'N/A' };
        return { role: '', shift: '' };
      })();

      if (!role) return acc;

      const key = `${date}-${shift}-${role}`;
      if (!acc[key]) {
        acc[key] = { date, role, shift, branches: [], aoIds: [] };
      }

      // HANDLE branchNames — array or string
      const branchNames = Array.isArray(a.branchNames)
        ? a.branchNames
        : a.branchNames ? a.branchNames.split(',').map(n => n.trim()) : [a.branchName || '—'];

      // HANDLE accountOfficerEmployeeIds — array or string
      const aoIds = Array.isArray(a.accountOfficerEmployeeIds)
        ? a.accountOfficerEmployeeIds
        : a.accountOfficerEmployeeIds ? a.accountOfficerEmployeeIds.split(',').map(id => id.trim()) : [a.accountOfficerEmployeeId || '—'];

      acc[key].branches.push(...branchNames);
      acc[key].aoIds.push(...aoIds);

      return acc;
    }, {});

  const groupedList = Object.values(groupedAssignments).map(item => ({
    ...item,
    branches: [...new Set(item.branches.filter(Boolean))],
    aoIds: [...new Set(item.aoIds.filter(Boolean))]
  }));

  const filteredAssignments = groupedList
    .filter(a => {
      if (filter === 'today') return a.date === today;
      if (filter === 'week') return a.date >= weekStartStr && a.date <= today;
      if (filter === 'month') return a.date >= monthStartStr;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-fuchsia-800"></div>
          <p className="mt-6 text-xl font-bold text-fuchsia-800">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/dashboard');
  };
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm z-20 flex-shrink-0 sticky top-0">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.role !== 'USER' && (
                <button
                  onClick={handleBack}
                  className="group p-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all duration-300"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-slate-600 group-hover:text-fuchsia-700 transition-colors" />
                </button>
              )}
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-700 to-purple-800">
                My Assignments
              </h1>
            </div>

            <span className="hidden sm:inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-gray-700 bg-fuchsia-50 border border-fuchsia-200 rounded-md shadow-sm">
              Today: {groupedList.filter(a => a.date === today).length}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto h-full flex flex-col gap-6">

            {/* Toolbar / Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg shadow-purple-900/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-xl shadow-lg shadow-fuchsia-900/20 text-white">
                  <ClipboardDocumentCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Your Schedule</h2>
                  <p className="text-sm text-slate-500">View and track your assigned tasks</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { key: 'today', label: 'Today', icon: CalendarIcon, color: 'emerald' },
                  { key: 'week', label: 'This Week', icon: ClockIcon, color: 'blue' },
                  { key: 'month', label: 'This Month', icon: CalendarDaysIcon, color: 'violet' },
                  { key: 'all', label: 'All Time', icon: ArchiveBoxIcon, color: 'rose' },
                ].map(({ key, label, icon: Icon, color }) => {
                  const count = groupedList.filter(a => {
                    if (key === 'today') return a.date === today;
                    if (key === 'week') return a.date >= weekStartStr && a.date <= today;
                    if (key === 'month') return a.date >= monthStartStr;
                    return true;
                  }).length;

                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm focus:outline-none
                        ${filter === key
                          ? `bg-gradient-to-r from-${color}-600 to-${color}-700 text-white shadow-md scale-105`
                          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 border border-white/60'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-purple-900/5 overflow-hidden flex flex-col">
              {filteredAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center flex-1">
                  <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <ArchiveBoxIcon className="h-12 w-12 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-lg font-medium">No assignments found</p>
                  <p className="text-slate-400 text-sm">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full divide-y divide-slate-400/60">
                    <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">Branches</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">AO IDs</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">Your Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">Shift</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400/60 bg-transparent">
                      {filteredAssignments.map((a, i) => (
                        <tr key={i} className="group hover:bg-white/80 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{formatDate(a.date)}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {a.branches.map((b, idx) => (
                                <span key={idx} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-salte-100 text-salte-700 border border-fuchsia-100 group-hover:border-fuchsia-200 transition-colors">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {a.aoIds.map((id, idx) => (
                                <span key={idx} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-blue-50 text-blue-700 border border-rose-100 group-hover:border-rose-200 transition-colors">
                                  {id}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border
                              ${a.role.includes('Officer')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                              {a.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-600 bg-slate-100/50 px-2 py-1 rounded-lg">
                              {getShiftLabel(a.shift)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default MyAssignmentsPage;