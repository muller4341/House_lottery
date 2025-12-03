
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeftIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';   // ← Only new import

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
  const [user] = useState({
    employeeId: "070876",
    displayName: "Abebe Kebede",
    fullName: "Abebe Kebede",
    email: "abbebekebede@cbe.com.et",
    department: "Branch Operations",
    title: "Account Officer",
    role: "ACCOUNT_OFFICER",
    isAdmin: false
  });

  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [filterId, setFilterId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const filtered = assignments.filter(a => 
      !filterId || (a.accountOfficer?.employeeId || a.accountOfficerEmployeeId || '').includes(filterId)
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/15 to-pink-600/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/15 via-pink-700/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/10 to-fuchsia-800/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <header className="bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-sm z-20 w-full flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 lg:py-6">
              <button onClick={handleBack} className="flex items-center space-x-2 text-fuchsia-800 hover:text-fuchsia-600 font-semibold transition-all duration-300 hover:scale-105">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-gray-900 text-sm lg:text-base">{user.displayName}</p>
                  <p className="text-xs lg:text-sm text-gray-500">{user.title}</p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-fuchsia-800 to-rose-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/50">
                  <span className="text-white font-bold text-xs sm:text-sm lg:text-base">
                    {user.displayName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
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
                  <h2 className="text-2xl lg:text-3xl font-black text-gray-900">Daily Assignments</h2>
                  <p className="text-sm text-gray-600 mt-1">Today & Future Schedules</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by Account Officer"
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-64 pl-12 pr-5 py-3 bg-white/70 backdrop-blur-md border border-fuchsia-300/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:border-fuchsia-400 text-sm font-medium shadow-inner"
                    maxLength={4}
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-fuchsia-200">
                    <thead className="bg-gradient-to-r from-fuchsia-50 to-pink-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Branch</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Account Officer</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Officer 1</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Shift</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Officer 2</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Shift</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">TL 1</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Shift</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">TL 2</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Shift</th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-fuchsia-100">
                      {filteredAssignments.map((assignment, idx) => (
                        <tr key={assignment.id} className={`hover:bg-fuchsia-50/70 transition-all duration-300 ${idx % 2 === 0 ? 'bg-gray-50/30' : ''}`}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{assignment.branchName}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-fuchsia-700">{assignment.accountOfficer?.employeeId || assignment.accountOfficerEmployeeId || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{assignment.officer1?.name || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{assignment.officer1Phone || assignment.officer1?.phone || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-emerald-700">{getShiftLabel(assignment.officer1Shift)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{assignment.officer2?.name || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{assignment.officer2Phone || assignment.officer2?.phone || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-teal-700">{getShiftLabel(assignment.officer2Shift)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{assignment.tl1?.name || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{assignment.tl1Phone || assignment.tl1?.phone || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-purple-700">{getShiftLabel(assignment.tl1Shift)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{assignment.tl2?.name || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{assignment.tl2Phone || assignment.tl2?.phone || '-'}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-pink-700">{getShiftLabel(assignment.tl2Shift)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatDate(assignment.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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