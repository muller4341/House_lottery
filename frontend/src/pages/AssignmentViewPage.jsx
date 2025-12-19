
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeftIcon, ArrowDownTrayIcon, MagnifyingGlassIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';   // ← Only new import
import { useSelector } from 'react-redux';

const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateStr));
};

const getShiftLabel = (shift) => {
  if (!shift) return '-';
  return shift === 'I' ? 'Shift I' : 'Shift II';
};

const AssignmentViewPage = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [filterId, setFilterId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: userLoading } = useSelector((state) => state.user);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const data = await response.json();
        const futureOnly = (data.assignments || []).filter(assignment => {
          const assignmentDate = new Date(assignment.date);
          return assignmentDate >= today;
        });
        setAssignments(futureOnly);
        setFilteredAssignments(futureOnly);
      } else {
        throw new Error('Failed to fetch assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!filterId.trim()) {
      setFilteredAssignments(assignments);
      return;
    }

    const term = filterId.toLowerCase().trim();

    const filtered = assignments.filter(a => {
      // AO IDs (array or string)
      const aoIds = Array.isArray(a.accountOfficerEmployeeIds)
        ? a.accountOfficerEmployeeIds.map(id => id.toLowerCase())
        : a.accountOfficerEmployeeIds
          ? a.accountOfficerEmployeeIds.split(',').map(id => id.trim().toLowerCase())
          : [];

      // Branch names (array or string)
      const branches = Array.isArray(a.branchNames)
        ? a.branchNames.map(b => b.toLowerCase())
        : a.branchNames
          ? a.branchNames.split(',').map(b => b.trim().toLowerCase())
          : [];

      // Date (formatted like "12 Dec 2025")
      const formattedDate = formatDate(a.date).toLowerCase();

      return (
        aoIds.some(id => id.includes(term)) ||
        branches.some(b => b.includes(term)) ||
        formattedDate.includes(term)
      );
    });

    setFilteredAssignments(filtered);
  }, [filterId, assignments]);
  // CLIENT-SIDE EXCEL EXPORT (NO BACKEND CALL → NO 500 ERROR)
  const handleExport = () => {
    if (filteredAssignments.length === 0) {
      alert('No assignments to export');
      return;
    }

    const rows = filteredAssignments.map(a => ({
      'Branch': a.branchName || '-',
      'AO ID': a.accountOfficer?.employeeId || a.accountOfficerEmployeeId || '-',
      'Officer 1': a.officer1?.name || '-',
      'Officer 1 Phone': a.officer1Phone || a.officer1?.phone || '-',
      'Officer 1 Shift': getShiftLabel(a.officer1Shift),
      'Officer 2': a.officer2?.name || '-',
      'Officer 2 Phone': a.officer2Phone || a.officer2?.phone || '-',
      'Officer 2 Shift': getShiftLabel(a.officer2Shift),
      'TL 1': a.tl1?.name || '-',
      'TL 1 Phone': a.tl1Phone || a.tl1?.phone || '-',
      'TL 1 Shift': getShiftLabel(a.tl1Shift),
      'TL 2': a.tl2?.name || '-',
      'TL 2 Phone': a.tl2Phone || a.tl2?.phone || '-',
      'TL 2 Shift': getShiftLabel(a.tl2Shift),
      'Date': formatDate(a.date),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "My Assignments");

    // Auto-size columns (optional but beautiful)
    const colWidths = [
      { wch: 20 }, // Branch
      { wch: 10 }, // AO ID
      { wch: 22 }, // Officer 1
      { wch: 15 }, // Phone
      { wch: 10 }, // Shift
      { wch: 22 }, // Officer 2
      { wch: 15 },
      { wch: 10 },
      { wch: 22 }, // TL 1
      { wch: 15 },
      { wch: 10 },
      { wch: 22 }, // TL 2
      { wch: 15 },
      { wch: 10 },
      { wch: 14 }, // Date
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, 'my_daily_assignments_today_forward.xlsx');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };
  if (userLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-fuchsia-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
      {/* Dynamic Background from BranchListPage */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm z-20 flex-shrink-0 sticky top-0">
          <div className=" mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
                Daily Assignments View
              </h1>

            </div>

            <span className="hidden sm:inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-gray-700 bg-fuchsia-50 border border-fuchsia-200 rounded-md shadow-sm">
              Total Assignments : {filteredAssignments.length}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className=" mx-auto h-full flex flex-col gap-6">

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg shadow-purple-900/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-xl shadow-lg shadow-fuchsia-900/20 text-white">
                  <ClipboardDocumentCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Assign & Verify</h2>
                  <p className="text-sm text-slate-500">Track daily authorizations</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group hidden sm:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-fuchsia-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search assignments by branch or AO ID..."
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                    className="block w-96 pl-10 pr-4 py-2 bg-white/50 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:bg-white shadow-sm transition-all hover:shadow-md"
                  />
                </div>

                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-900/20 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Export Excel</span>
                </button>
              </div>
            </div>

            {/* Cards Header NOT NEEDED as per BranchListPage style which is cleaner, but keeping Title/Search logic minimal */}

            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-fuchsia-600 animate-spin"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-600 bg-red-50/50 rounded-2xl border border-red-100 backdrop-blur-sm">
                <p className="mb-4 text-lg font-medium">{error}</p>
                <button onClick={fetchAssignments} className="text-sm underline hover:text-red-800 font-semibold">Retry</button>
              </div>
            ) : (
              <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-purple-900/5 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full divide-y divide-slate-400/60">
                    <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                      <tr>
                        <th rowSpan="2" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">Branch</th>
                        <th rowSpan="2" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">AO ID</th>
                        <th colSpan="4" className="px-6 py-4 text-center text-xs font-bold text-fuchsia-700 uppercase tracking-wider bg-fuchsia-50/50 border-b border-fuchsia-100 border-x border-slate-400/60">Shift I</th>
                        <th colSpan="4" className="px-6 py-4 text-center text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50/50 border-b border-purple-100 border-x border-slate-400/60">Shift II</th>
                        <th rowSpan="2" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">Date</th>
                      </tr>
                      <tr>
                        {/* Shift I Subheaders */}
                        <th className="px-4 py-3 text-xs font-bold text-fuchsia-600 bg-fuchsia-50/30 border-b border-slate-400/60 border-l ">Officer</th>
                        <th className="px-4 py-3 text-xs font-bold text-fuchsia-600 bg-fuchsia-50/30 border-b border-slate-400/60">Phone</th>
                        <th className="px-4 py-3 text-xs font-bold text-fuchsia-600 bg-fuchsia-50/30 border-b border-slate-400/60">TL</th>
                        <th className="px-4 py-3 text-xs font-bold text-fuchsia-600 bg-fuchsia-50/30 border-b border-slate-400/60 border-r border-slate-400/60">TL Phone</th>

                        {/* Shift II Subheaders */}
                        <th className="px-4 py-3 text-xs font-bold text-purple-600 bg-purple-50/30 border-b border-slate-400/60">Officer</th>
                        <th className="px-4 py-3 text-xs font-bold text-purple-600 bg-purple-50/30 border-b border-slate-400/60">Phone</th>
                        <th className="px-4 py-3 text-xs font-bold text-purple-600 bg-purple-50/30 border-b border-slate-400/60">TL</th>
                        <th className="px-4 py-3 text-xs font-bold text-purple-600 bg-purple-50/30 border-b border-slate-400/60 border-r">TL Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-400/60 bg-transparent">
                      {filteredAssignments.map((a, idx) => (
                        <tr key={a.id} className="group hover:bg-white/80 transition-colors duration-200">
                          {/* Branch & AO IDs */}
                          <td className="px-6 py-4 align-top border-r border-slate-100 ">
                            <div className="flex flex-col gap-2">
                              {(Array.isArray(a.branchNames) ? a.branchNames : a.branchNames?.split(',') || []).map((name, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-100  border border-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-sm ">
                                  {name.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top border-r border-slate-400/60">
                            <div className="flex flex-col gap-2">
                              {(Array.isArray(a.accountOfficerEmployeeIds) ? a.accountOfficerEmployeeIds : a.accountOfficerEmployeeIds?.split(',') || []).map((id, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold">
                                  {id.trim()}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Shift I */}
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium border-l border-slate-100 bg-fuchsia-50/10 group-hover:bg-fuchsia-50/30 transition-colors">{a.officer1Shift === 'I' ? a.officer1?.name || '-' : '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-500 bg-fuchsia-50/10 group-hover:bg-fuchsia-50/30 transition-colors border-l border-slate-200">{a.officer1Shift === 'I' ? (a.officer1Phone || a.officer1?.phone || '-') : '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium bg-fuchsia-50/10 group-hover:bg-fuchsia-50/30 transition-colors border-l border-slate-200 border-r">{a.tl1Shift === 'I' ? a.tl1?.name || '-' : (a.tl2Shift === 'I' ? a.tl2?.name || '-' : '-')}</td>
                          <td className="px-4 py-4 text-sm text-slate-500 border-r border-slate-400/60 bg-fuchsia-50/10 group-hover:bg-fuchsia-50/30 transition-colors ">{a.tl1Shift === 'I' ? (a.tl1Phone || a.tl1?.phone || '-') : (a.tl2Shift === 'I' ? (a.tl2Phone || a.tl2?.phone || '-') : '-')}</td>

                          {/* Shift II */}
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium bg-purple-50/10 group-hover:bg-purple-50/30 transition-colors border-l border-slate-200">{a.officer2Shift === 'II' ? a.officer2?.name || '-' : '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-500 bg-purple-50/10 group-hover:bg-purple-50/30 transition-colors border-l border-slate-200">{a.officer2Shift === 'II' ? (a.officer2Phone || a.officer2?.phone || '-') : '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium bg-purple-50/10 group-hover:bg-purple-50/30 transition-colors border-l border-slate-200 border-r">{a.tl1Shift === 'II' ? a.tl1?.name || '-' : (a.tl2Shift === 'II' ? a.tl2?.name || '-' : '-')}</td>
                          <td className="px-4 py-4 text-sm text-slate-500 bg-purple-50/10 group-hover:bg-purple-50/30 transition-colors border-r border-slate-400/60">{a.tl1Shift === 'II' ? (a.tl1Phone || a.tl1?.phone || '-') : (a.tl2Shift === 'II' ? (a.tl2Phone || a.tl2?.phone || '-') : '-')}</td>

                          {/* Date */}
                          <td className="px-6 py-4 text-sm font-bold text-slate-700 bg-white/30 border-r border-slate-400/60">{formatDate(a.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredAssignments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                      <MagnifyingGlassIcon className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No assignments found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
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
  );
};

export default AssignmentViewPage;