import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowDownTrayIcon, PencilIcon, EyeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date(dateStr));
};

const getShiftLabel = (shift) => {
  if (!shift) return '';
  return shift === 'I' ? 'Shift I' : 'Shift II';
};

const CurrentAssignmentsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const canEdit = ['CENTRAL_KYC_MANAGER', 'TEAM_LEADER'].includes(user.role);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'excel') => {
    try {
      const response = await fetch(`/api/assignments/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `central_kyc_assignments.${format === 'excel' ? 'xlsx' : 'csv'}`;
      a.click();
      a.remove();
    } catch (error) {
      alert(error.message);
    }
  };

  const openViewModal = (assignment) => {
    setViewingAssignment(assignment);
    setShowViewModal(true);
  };

  const openEditModal = (assignment) => {
  // Just go back to the main assignment page with the assignment data
  navigate('/daily-assignment', { 
    state: { 
      editAssignment: assignment 
    } 
  });
};

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const response = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      alert('Assignment deleted successfully!');
      fetchAssignments();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
  }
  
  const renderEditModal = () => showEditModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Edit Assignment</h3>
            <button onClick={() => { setShowEditModal(false); setEditingId(null); }} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {renderAssignmentForm()}
        </div>
      </div>
    );
const renderViewModal = () => showViewModal && viewingAssignment && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Assignment Details</h3>
        <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-7 w-7" />
        </button>
      </div>

      <div className="space-y-8">
        {/* DATE & ID */}
        <div className="text-center">
          <h3 className="text-3xl font-black text-fuchsia-800 mb-2">
            {formatDate(viewingAssignment.date)}
          </h3>
          <p className="text-lg text-gray-600">ID: {viewingAssignment.id.slice(0, 8)}...</p>
        </div>

        {/* BRANCHES & AO IDs — NOW SHOWING ALL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-2xl p-6 border-2 border-fuchsia-200">
            <h4 className="text-lg font-bold text-fuchsia-800 mb-4">Branches Assigned</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(viewingAssignment.branchNames)
                ? viewingAssignment.branchNames.map((name, i) => (
                    <span key={i} className="px-4 py-2 bg-fuchsia-200 text-fuchsia-900 rounded-full text-sm font-semibold">
                      {name.trim()}
                    </span>
                  ))
                : viewingAssignment.branchNames?.split(',').map((name, i) => (
                    <span key={i} className="px-4 py-2 bg-fuchsia-200 text-fuchsia-900 rounded-full text-sm font-semibold">
                      {name.trim()}
                    </span>
                  )) || <span className="text-gray-500">—</span>
              }
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border-2 border-rose-200">
            <h4 className="text-lg font-bold text-rose-800 mb-4">Account Officer IDs</h4>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(viewingAssignment.accountOfficerEmployeeIds)
                ? viewingAssignment.accountOfficerEmployeeIds.map((id, i) => (
                    <span key={i} className="px-4 py-2 bg-rose-200 text-rose-900 rounded-full text-sm font-semibold">
                      {id.trim()}
                    </span>
                  ))
                : viewingAssignment.accountOfficerEmployeeIds?.split(',').map((id, i) => (
                    <span key={i} className="px-4 py-2 bg-rose-200 text-rose-900 rounded-full text-sm font-semibold">
                      {id.trim()}
                    </span>
                  )) || <span className="text-gray-500">—</span>
              }
            </div>
          </div>
        </div>

        {/* OFFICERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-emerald-200">
            <h4 className="text-xl font-black text-emerald-800 mb-4">Officer 1</h4>
            <div className="space-y-3 text-lg">
              <p><span className="font-bold text-gray-700">Name:</span> {viewingAssignment.officer1?.name || '-'}</p>
              <p><span className="font-bold text-gray-700">Phone:</span> {viewingAssignment.officer1Phone || viewingAssignment.officer1?.phone || '-'}</p>
              <p><span className="font-bold text-gray-700">Shift:</span> {getShiftLabel(viewingAssignment.officer1Shift)}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-6 border-2 border-teal-200">
            <h4 className="text-xl font-black text-teal-800 mb-4">Officer 2</h4>
            <div className="space-y-3 text-lg">
              <p><span className="font-bold text-gray-700">Name:</span> {viewingAssignment.officer2?.name || '-'}</p>
              <p><span className="font-bold text-gray-700">Phone:</span> {viewingAssignment.officer2Phone || viewingAssignment.officer2?.phone || '-'}</p>
              <p><span className="font-bold text-gray-700">Shift:</span> {getShiftLabel(viewingAssignment.officer2Shift)}</p>
            </div>
          </div>
        </div>

        {/* TEAM LEADERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {viewingAssignment.tl1Id && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-200">
              <h4 className="text-xl font-black text-purple-800 mb-4">Team Leader 1</h4>
              <div className="space-y-3 text-lg">
                <p><span className="font-bold text-gray-700">Name:</span> {viewingAssignment.tl1?.name || '-'}</p>
                <p><span className="font-bold text-gray-700">Phone:</span> {viewingAssignment.tl1Phone || viewingAssignment.tl1?.phone || '-'}</p>
                <p><span className="font-bold text-gray-700">Shift:</span> {getShiftLabel(viewingAssignment.tl1Shift)}</p>
              </div>
            </div>
          )}

          {viewingAssignment.tl2Id && (
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-6 border-2 border-pink-200">
              <h4 className="text-xl font-black text-pink-800 mb-4">Team Leader 2</h4>
              <div className="space-y-3 text-lg">
                <p><span className="font-bold text-gray-700">Name:</span> {viewingAssignment.tl2?.name || '-'}</p>
                <p><span className="font-bold text-gray-700">Phone:</span> {viewingAssignment.tl2Phone || viewingAssignment.tl2?.phone || '-'}</p>
                <p><span className="font-bold text-gray-700">Shift:</span> {getShiftLabel(viewingAssignment.tl2Shift)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
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
        <div className="flex flex-col md:flex-row gap-48 mx-16 mt-8 mb-4">
        <h1 className="text-4xl font-black text-fuchsia-800 mb-8 text-center">Current Assignments</h1>
         <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => handleExport('excel')}
            className="px-6 py-3 bg-green-600 text-green-600 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export Excel
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-blue-700 rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export CSV
          </button>
        </div>
        </div>

       

        {assignments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No assignments found</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-16">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-fuchsia-200 text-xs">
                <thead className="bg-fuchsia-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Branch Name</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">AO IDs</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Officer 1</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Phone</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Shift</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Officer 2</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Phone</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Shift</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">TL 1</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Phone</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Shift</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">TL 2</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Shift</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Phone</th>
                    <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Date</th>
                    {canEdit && <th className="px-4 py-3 text-left font-bold text-fuchsia-900">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-fuchsia-100">
                  {assignments.map(a => (
                    <tr key={a.id} className="hover:bg-fuchsia-50/50">
                      {/* BRANCH NAMES */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {Array.isArray(a.branchNames)
                            ? a.branchNames.map((n, i) => (
                                <span key={i} className="px-2 py-1 bg-fuchsia-100 text-fuchsia-800 rounded-full text-xs font-medium">
                                  {n.trim()}
                                </span>
                              ))
                            : (a.branchNames || '').split(',').map((n, i) => (
                                <span key={i} className="px-2 py-1 bg-fuchsia-100 text-fuchsia-800 rounded-full text-xs font-medium">
                                  {n.trim()}
                                </span>
                              ))}
                        </div>
                      </td>

                      {/* AO IDs */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {Array.isArray(a.accountOfficerEmployeeIds)
                            ? a.accountOfficerEmployeeIds.map((id, i) => (
                                <span key={i} className="px-2 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                                  {id.trim()}
                                </span>
                              ))
                            : (a.accountOfficerEmployeeIds || '').split(',').map((id, i) => (
                                <span key={i} className="px-2 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                                  {id.trim()}
                                </span>
                              ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">{a.officer1?.name || '-'}</td>
                      <td className="px-4 py-3">{a.officer1Phone || a.officer1?.phone || '-'}</td>
                      <td className="px-4 py-3">{getShiftLabel(a.officer1Shift)}</td>
                      <td className="px-4 py-3">{a.officer2?.name || '-'}</td>
                      <td className="px-4 py-3">{a.officer2Phone || a.officer2?.phone || '-'}</td>
                      <td className="px-4 py-3">{getShiftLabel(a.officer2Shift)}</td>
                      <td className="px-4 py-3">{a.tl1?.name || '-'}</td>
                      <td className="px-4 py-3">{a.tl1Phone || a.tl1?.phone || '-'}</td>
                      <td className="px-4 py-3">{getShiftLabel(a.tl1Shift)}</td>
                      <td className="px-4 py-3">{a.tl2?.name || '-'}</td>
                      <td className="px-4 py-3">{getShiftLabel(a.tl2Shift)}</td>
                      <td className="px-4 py-3">{a.tl2Phone || a.tl2?.phone || '-'}</td>
                      <td className="px-4 py-3">{formatDate(a.date)}</td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openViewModal(a)} className="text-indigo-600 hover:text-indigo-800">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => openEditModal(a)} className="text-blue-600 hover:text-blue-800">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDeleteAssignment(a.id)} className="text-red-600 hover:text-red-800">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

     {renderEditModal()}
          {renderViewModal()}
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
    </div>
  );
};

export default CurrentAssignmentsPage;