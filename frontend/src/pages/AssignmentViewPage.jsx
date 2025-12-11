
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeftIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-b-4 border-fuchsia-800"></div>
          <p className="mt-6 text-2xl font-bold text-fuchsia-800">Loading ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/15 to-pink-600/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/15 via-pink-700/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/10 to-fuchsia-800/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <header className="bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-sm z-20 w-full flex-shrink-0">
          <div className="max-w-7xl  px-4 sm:px-6 lg:px-8 flex justify-start">
            
  <div className="flex justify-start py-4 lg:py-6">
    {user?.role !== 'USER' && (
    <button 
      onClick={handleBack} 
      className="flex items-center space-x-2 text-fuchsia-800 hover:text-fuchsia-600 font-semibold transition-all duration-300 hover:scale-105"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      <span>Back to Dashboard</span>
    </button>
    )}
  </div>

          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-hidden min-h-0">
          <div className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-6 sm:p-8 lg:p-10 overflow-hidden flex flex-col min-h-0">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                  <CheckIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900">Daily Assigned Officers and Team Leaders</h2>
                  <p className="text-sm text-gray-600 mt-1">Today & Future Schedules</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
               <div className="relative">
  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
  <input
    type="text"
    placeholder="Search by AO ID, Branch, or Date (e.g. 12 Dec)"
    value={filterId}
    onChange={(e) => setFilterId(e.target.value)}
    className="w-80 pl-12 pr-5 py-3 bg-white/70 backdrop-blur-md border border-fuchsia-300/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-fuchsia-400 text-sm font-medium shadow-inner"
  />
</div>
                <button 
                  onClick={handleExport} 
                  className="flex items-center space-x-2 px-5 py-3 !bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold rounded-2xl hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <span className="ml-4 text-lg text-gray-600">Loading your assignments...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-600 bg-red-50/70 rounded-2xl">
                <p className="mb-4 text-lg">{error}</p>
                <button onClick={fetchAssignments} className="text-sm underline hover:text-red-800">Retry</button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="overflow-x-autoh-96 lg:h-[600px]  overflow-y-auto border border-gray-200 rounded-lg">
  <div className="sticky top-0 z-10 bg-gradient-to-r from-fuchsia-100 to-rose-100">
                  <table className="min-w-full divide-y divide-fuchsia-200">
  <thead className="bg-gradient-to-r from-fuchsia-100 to-rose-100 sticky top-0">
    <tr>
      <th rowSpan="2" className="px-6 py-4 text-left text-xs font-bold text-fuchsia-900 uppercase tracking-wider">Branch</th>
      <th rowSpan="2" className="px-6 py-4 text-left text-xs font-bold text-fuchsia-900 uppercase tracking-wider">Account Officer</th>
      <th colSpan="4" className="px-6 py-4 text-center text-sm font-extrabold text-emerald-800 bg-emerald-50/70 border-x-2 border-emerald-300">Shift I</th>
      <th colSpan="4" className="px-6 py-4 text-center text-sm font-extrabold text-teal-800 bg-teal-50/70">Shift II</th>
      <th rowSpan="2" className="px-6 py-4 text-left text-xs font-bold text-fuchsia-900 uppercase tracking-wider">Date</th>
    </tr>
    <tr>
      {/* Shift I Subheaders */}
      <th className="px-4 py-3 text-xs font-bold text-emerald-700">Officer</th>
      <th className="px-4 py-3 text-xs font-bold text-emerald-700">Phone</th>
      <th className="px-4 py-3 text-xs font-bold text-emerald-700">TL</th>
      <th className="px-4 py-3 text-xs font-bold text-emerald-700">TL Phone</th>

      {/* Shift II Subheaders */}
      <th className="px-4 py-3 text-xs font-bold text-teal-700">Officer</th>
      <th className="px-4 py-3 text-xs font-bold text-teal-700">Phone</th>
      <th className="px-4 py-3 text-xs font-bold text-teal-700">TL</th>
      <th className="px-4 py-3 text-xs font-bold text-teal-700">TL Phone</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {filteredAssignments.map((a, idx) => (
      <tr key={a.id} className={`hover:bg-fuchsia-50/50 transition-all ${idx % 2 === 0 ? 'bg-gray-50/30' : ''}`}>
        {/* Branch & AO IDs */}
        <td className="px-6 py-5 align-top">
          <div className="flex flex-col gap-2">
            {(Array.isArray(a.branchNames) ? a.branchNames : a.branchNames?.split(',') || []).map((name, i) => (
              <span key={i} className="px-3 py-1 bg-fuchsia-100 text-fuchsia-800 rounded-full text-xs font-medium">
                {name.trim()}
              </span>
            ))}
          </div>
        </td>
        <td className="px-6 py-5 align-top">
          <div className="flex flex-col gap-2">
            {(Array.isArray(a.accountOfficerEmployeeIds) ? a.accountOfficerEmployeeIds : a.accountOfficerEmployeeIds?.split(',') || []).map((id, i) => (
              <span key={i} className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                {id.trim()}
              </span>
            ))}
          </div>
        </td>

        {/* Shift I */}
        <td className="px-4 py-5 text-sm text-gray-800 font-semibold">{a.officer1Shift === 'I' ? a.officer1?.name || '-' : '-'}</td>
        <td className="px-4 py-5 text-sm text-gray-700">{a.officer1Shift === 'I' ? (a.officer1Phone || a.officer1?.phone || '-') : '-'}</td>
        <td className="px-4 py-5 text-sm text-gray-800 font-semibold">{a.tl1Shift === 'I' ? a.tl1?.name || '-' : (a.tl2Shift === 'I' ? a.tl2?.name || '-' : '-')}</td>
        <td className="px-4 py-5 text-sm text-gray-700">{a.tl1Shift === 'I' ? (a.tl1Phone || a.tl1?.phone || '-') : (a.tl2Shift === 'I' ? (a.tl2Phone || a.tl2?.phone || '-') : '-')}</td>

        {/* Shift II */}
        <td className="px-4 py-5 text-sm text-gray-800 font-semibold">{a.officer2Shift === 'II' ? a.officer2?.name || '-' : '-'}</td>
        <td className="px-4 py-5 text-sm text-gray-700">{a.officer2Shift === 'II' ? (a.officer2Phone || a.officer2?.phone || '-') : '-'}</td>
        <td className="px-4 py-5 text-sm text-gray-800 font-semibold">{a.tl1Shift === 'II' ? a.tl1?.name || '-' : (a.tl2Shift === 'II' ? a.tl2?.name || '-' : '-')}</td>
        <td className="px-4 py-5 text-sm text-gray-700">{a.tl1Shift === 'II' ? (a.tl1Phone || a.tl1?.phone || '-') : (a.tl2Shift === 'II' ? (a.tl2Phone || a.tl2?.phone || '-') : '-')}</td>

        {/* Date */}
        <td className="px-6 py-5 text-sm font-bold text-gray-900">{formatDate(a.date)}</td>
      </tr>
    ))}
  </tbody>
</table>
                </div>
                </div>

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-fuchsia-100 to-pink-100 rounded-full mb-6">
                      <CheckIcon className="h-12 w-12 text-fuchsia-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700">No assignments found</p>
                    <p className="text-sm text-gray-500 mt-2">Try adjusting the AO ID filter or contact your administrator.</p>
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
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default AssignmentViewPage;