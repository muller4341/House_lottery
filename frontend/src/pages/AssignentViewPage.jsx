// AssignmentViewPage.jsx
// New view-only page for branch users to see current/future assignments (date >= today).
// Fetches all assignments and filters client-side for simplicity.
// Similar styling to DailyAssignmentPage.
// Updated: Added time columns for officers with AM/PM formatting.
// Fixed: Account Officer display prioritizes name or falls back to 4-digit ID.
// Updated: Phone display uses overrides if present.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const formatTimeToAMPM = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of today

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const data = await response.json();
        // Filter assignments where date >= today
        const filteredAssignments = data.assignments?.filter(assignment => {
          const assignmentDate = new Date(assignment.date);
          return assignmentDate >= today;
        }) || [];
        setAssignments(filteredAssignments);
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

  // Fetch on mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/15 to-pink-600/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/15 via-pink-700/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/10 to-fuchsia-800/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {/* Header */}
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

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-hidden min-h-0">
          <div className="w-full bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center space-x-3 mb-5 lg:mb-6 pb-2">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
                <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">Daily Assignments (Today & Future)</h2>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-2 text-sm text-gray-600">Loading assignments...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p className="mb-2">{error}</p>
                <button onClick={fetchAssignments} className="text-sm underline">Retry</button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-fuchsia-200">
                    <thead className="bg-fuchsia-50 sticky top-0">
                      <tr>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Branch Name</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Account Officer</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Assigned Officer 1</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Time</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Assigned Officer 2</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Time</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Team Leader 1</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Team Leader 2</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                        <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-fuchsia-200">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-fuchsia-50 transition-colors duration-200">
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{assignment.branchName}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.accountOfficer?.name || assignment.accountOfficerEmployeeId || 'N/A'}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer1?.name}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer1Phone || assignment.officer1?.phone || 'N/A'}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{formatTimeToAMPM(assignment.officer1StartTime)} - {formatTimeToAMPM(assignment.officer1EndTime)}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer2?.name}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer2Phone || assignment.officer2?.phone || 'N/A'}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{formatTimeToAMPM(assignment.officer2StartTime)} - {formatTimeToAMPM(assignment.officer2EndTime)}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl1?.name || ''}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl1Phone || assignment.tl1?.phone || 'N/A'}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl2?.name || ''}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl2Phone || assignment.tl2?.phone || 'N/A'}</td>
                          <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{new Date(assignment.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {assignments.length === 0 && (
                  <div className="text-center py-8 flex-1 flex items-center justify-center">
                    <div className="space-y-2">
                      <CheckIcon className="h-12 w-12 text-gray-300 mx-auto" />
                      <p className="text-sm text-gray-500">No assignments yet for today or future. Contact your administrator.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer - Compact */}
      <footer className="bg-white/95 backdrop-blur-2xl border-t border-fuchsia-800/20 w-full flex-shrink-0 py-3 lg:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs lg:text-sm text-gray-600">
              © 2025{' '}
              <span className="font-bold bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
                Commercial Bank of Ethiopia
              </span>
              . All rights reserved.
            </p>
            <p className="mt-1 text-xs text-fuchsia-800/60">
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AssignmentViewPage;