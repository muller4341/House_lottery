import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,           // ← Add this
  DocumentArrowUpIcon,     // ← Also add this one (used in bulk upload button)
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

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
  const [editingId, setEditingId] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [error, setError] = useState(null);


  const [assignmentForm, setAssignmentForm] = useState({
    id: '',
    date: '',
    selectedBranches: [],
    branchIds: [],
    branchNames: [],
    accountOfficerEmployeeIds: [],
    officer1Id: '',
    officer1Shift: '',
    officer1Phone: '',
    officer2Id: '',
    officer2Shift: '',
    officer2Phone: '',
    tl1Id: '',
    tl1Shift: '',
    tl1Phone: '',
    tl2Id: '',
    tl2Shift: '',
    tl2Phone: ''
  });

  const [branches, setBranches] = useState([]);
  const [assignedOfficers, setAssignedOfficers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [assignmentsOnSelectedDate, setAssignmentsOnSelectedDate] = useState([]);
  const [dateSelected, setDateSelected] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [search, setSearch] = useState({ officer1: '', officer2: '', tl1: '', tl2: '' });


  useEffect(() => {
    fetchAssignments();
  }, []);




  const handleDateChange = async (e) => {

    const newDate = e.target.value;
    setAssignmentForm(prev => ({ ...prev, date: newDate }));
    setDateSelected(!!newDate);

    if (!newDate) {
      setAssignmentsOnSelectedDate([]);
      return;
    }

    try {
      const response = await fetch(`/ api / assignments ? date = ${newDate} `);
      if (response.ok) {
        const data = await response.json();
        setAssignmentsOnSelectedDate(data.assignments || []);
      } else {
        setAssignmentsOnSelectedDate([]);
      }
    } catch (err) {
      console.error('Error fetching assignments for date:', err);
      setAssignmentsOnSelectedDate([]);
    }
  };

  const showDateWarning = () => {
    if (!dateSelected) {
      alert("Please select a date first!");
      return true;
    }
    return false;
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchUsersByRole = async (role) => {
    try {
      const response = await fetch(`/ api / users ? role = ${role}& status=0`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`Failed to fetch ${role} `);
      }
    } catch (err) {
      console.error(`Error fetching ${role}: `, err);
      return [];
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aofficers, tleaders] = await Promise.all([
        fetchUsersByRole('OFFICER'),
        fetchUsersByRole('TEAM_LEADER')
      ]);
      setAssignedOfficers(aofficers);
      setTeamLeaders(tleaders);
      await fetchBranches();
    } catch (err) {
      setError('Failed to load users. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);


  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const data = await response.json();
        // Filter to show only today and future assignments
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureOnly = (data.assignments || []).filter(assignment => {
          const assignmentDate = new Date(assignment.date);
          return assignmentDate >= today;
        });

        setAssignments(futureOnly);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);



  // FIXED: handleSelectChange — now works for Officers AND Team Leaders
  const handleSelectChange = (field, value) => {
    const userList = field.includes('officer') ? assignedOfficers : teamLeaders;
    const selectedUser = userList.find(u => u.id === value);

    setAssignmentForm(prev => ({
      ...prev,
      [`${field} Id`]: value,
      [`${field} Phone`]: selectedUser?.phone || ''
    }));
  };

  // FIXED: handleShiftChange — now works perfectly
  const handleShiftChange = (e) => {
    const field = e.target.name.replace('Shift', '');
    const shift = e.target.value;

    setAssignmentForm(prev => ({
      ...prev,
      [`${field} Shift`]: shift
    }));
  };

  // FIXED: handlePhoneChange
  const handlePhoneChange = (e) => {
    const field = e.target.name.replace('Phone', '');
    setAssignmentForm(prev => ({
      ...prev,
      [`${field} Phone`]: e.target.value
    }));
  };
  const isOfficerAlreadyAssignedOnDate = (officerId, shift, currentDate) => {
    if (!officerId || !currentDate) return false;
    return assignments.some(a => {
      if (a.date.split('T')[0] !== currentDate) return false;
      if (a.officer1Id === officerId && a.officer1Shift === shift) return true;
      if (a.officer2Id === officerId && a.officer2Shift === shift) return true;
      return false;
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    const currentDate = assignmentForm.date;

    // Only check for duplicates when CREATING (not editing)
    if (!editingId) {
      if (isOfficerAlreadyAssignedOnDate(assignmentForm.officer1Id, assignmentForm.officer1Shift, currentDate)) {
        alert(`Officer ${assignedOfficers.find(o => o.id === assignmentForm.officer1Id)?.name || ''} is already assigned to ${getShiftLabel(assignmentForm.officer1Shift)} on this date.`);
        return;
      }

      if (isOfficerAlreadyAssignedOnDate(assignmentForm.officer2Id, assignmentForm.officer2Shift, currentDate)) {
        alert(`Officer ${assignedOfficers.find(o => o.id === assignmentForm.officer2Id)?.name || ''} is already assigned to ${getShiftLabel(assignmentForm.officer2Shift)} on this date.`);
        return;
      }
    }
    // Validate ALL required fields
    // FINAL VALIDATION — ONLY CHECKS WHAT YOU ACTUALLY FILLED
    if (
      !assignmentForm.date ||
      assignmentForm.branchIds.length === 0 ||
      assignmentForm.accountOfficerEmployeeIds.length === 0 ||
      assignmentForm.accountOfficerEmployeeIds.some(id => !/^\d{4}$/.test(id.trim())) ||
      !assignmentForm.officer1Id ||
      !assignmentForm.officer1Shift ||
      !assignmentForm.officer1Phone ||
      !assignmentForm.officer2Id ||
      !assignmentForm.officer2Shift ||
      !assignmentForm.officer2Phone ||
      !assignmentForm.tl1Id ||
      !assignmentForm.tl1Shift ||
      !assignmentForm.tl1Phone ||
      !assignmentForm.tl2Id ||
      !assignmentForm.tl2Shift ||
      !assignmentForm.tl2Phone
    ) {
      // SHOW WHAT'S MISSING
      let missing = [];
      if (!assignmentForm.date) missing.push('Date');
      if (assignmentForm.branchIds.length === 0) missing.push('Branches');
      if (assignmentForm.accountOfficerEmployeeIds.length === 0) missing.push('AO IDs');
      if (!assignmentForm.officer1Id) missing.push('Officer 1');
      if (!assignmentForm.officer1Shift) missing.push('Officer 1 Shift');
      if (!assignmentForm.officer1Phone) missing.push('Officer 1 Phone');
      if (!assignmentForm.officer2Id) missing.push('Officer 2');
      if (!assignmentForm.officer2Shift) missing.push('Officer 2 Shift');
      if (!assignmentForm.officer2Phone) missing.push('Officer 2 Phone');
      if (!assignmentForm.tl1Id) missing.push('Team Leader 1');
      if (!assignmentForm.tl1Shift) missing.push('TL1 Shift');
      if (!assignmentForm.tl1Phone) missing.push('TL1 Phone');
      if (!assignmentForm.tl2Id) missing.push('Team Leader 2');
      if (!assignmentForm.tl2Shift) missing.push('TL2 Shift');
      if (!assignmentForm.tl2Phone) missing.push('TL2 Phone');

      alert('Please fill:\n• ' + missing.join('\n• '));
      return;
    }

    // DEBUG: Remove after testing — shows ALL data being sent
    console.log("Sending to backend:", {
      date: assignmentForm.date,
      branchIds: assignmentForm.branchIds,
      branchNames: assignmentForm.branchNames,
      accountOfficerEmployeeIds: assignmentForm.accountOfficerEmployeeIds,

      // OFFICERS
      officer1Id: assignmentForm.officer1Id,
      officer1Shift: assignmentForm.officer1Shift,
      officer1Phone: assignmentForm.officer1Phone,

      officer2Id: assignmentForm.officer2Id,
      officer2Shift: assignmentForm.officer2Shift,
      officer2Phone: assignmentForm.officer2Phone,

      // TEAM LEADERS
      tl1Id: assignmentForm.tl1Id,
      tl1Shift: assignmentForm.tl1Shift,
      tl1Phone: assignmentForm.tl1Phone,

      tl2Id: assignmentForm.tl2Id,
      tl2Shift: assignmentForm.tl2Shift,
      tl2Phone: assignmentForm.tl2Phone
    });

    const url = editingId ? `/ api / assignments / ${editingId} ` : '/api/assignments';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: assignmentForm.date,
          branchIds: assignmentForm.branchIds,
          accountOfficerEmployeeIds: assignmentForm.accountOfficerEmployeeIds,
          officer1Id: assignmentForm.officer1Id,
          officer1Shift: assignmentForm.officer1Shift,
          officer1Phone: assignmentForm.officer1Phone,
          officer2Id: assignmentForm.officer2Id,
          officer2Shift: assignmentForm.officer2Shift,
          officer2Phone: assignmentForm.officer2Phone,
          tl1Id: assignmentForm.tl1Id,
          tl1Shift: assignmentForm.tl1Shift,
          tl1Phone: assignmentForm.tl1Phone,
          tl2Id: assignmentForm.tl2Id,
          tl2Shift: assignmentForm.tl2Shift,
          tl2Phone: assignmentForm.tl2Phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save assignment');
      }

      alert(editingId ? 'Assignment updated successfully!' : 'Assignment created successfully!');
      navigate('/current-assignments');
      setAssignmentForm({
        id: '',
        date: '2025-12-09',
        selectedBranches: [],
        branchIds: [],
        branchNames: [],
        accountOfficerEmployeeIds: [],
        officer1Id: '',
        officer1Shift: '',
        officer1Phone: '',
        officer2Id: '',
        officer2Shift: '',
        officer2Phone: '',
        tl1Id: '',
        tl1Shift: '',
        tl1Phone: '',
        tl2Id: '',
        tl2Shift: '',
        tl2Phone: ''
      });
      setEditingId(null);
      setShowEditModal(false);
      fetchAssignments();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const response = await fetch('/api/assignments/bulk', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk upload failed');
      }

      const result = await response.json();
      alert(result.message);
      if (result.errors.length > 0) {
        console.log('Bulk errors:', result.errors);
      }
      fetchAssignments();
      setBulkFile(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExport = async (format = 'excel') => {
    try {
      const response = await fetch(`/ api / assignments /export?format = ${format} `);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `central_kyc_assignments.${format === 'excel' ? 'xlsx' : 'csv'} `;
      document.body.appendChild(a);
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
    const getArray = (value) =>
      Array.isArray(value) ? value : (value ? value.split(',').map(v => v.trim()) : []);

    setAssignmentForm({
      id: assignment.id,
      date: assignment.date.split('T')[0],
      selectedBranches: getArray(assignment.branchIds),
      branchIds: getArray(assignment.branchIds),
      branchNames: getArray(assignment.branchNames),
      accountOfficerEmployeeIds: getArray(assignment.accountOfficerEmployeeIds),
      officer1Id: assignment.officer1Id || '',
      officer1Shift: assignment.officer1Shift || '',
      officer1Phone: assignment.officer1Phone || '',
      officer2Id: assignment.officer2Id || '',
      officer2Shift: assignment.officer2Shift || '',
      officer2Phone: assignment.officer2Phone || '',
      tl1Id: assignment.tl1Id || '',
      tl1Shift: assignment.tl1Shift || '',
      tl1Phone: assignment.tl1Phone || '',
      tl2Id: assignment.tl2Id || '',
      tl2Shift: assignment.tl2Shift || '',
      tl2Phone: assignment.tl2Phone || ''
    });
    setDateSelected(true);
    setEditingAssignment(assignment); // or use a separate editingId if you prefer
    setShowEditModal(true);
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const response = await fetch(`/ api / assignments / ${id} `, { method: 'DELETE' });
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
          <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {renderAssignmentForm()}  {/* Now this function exists */}
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

  const renderAssignmentForm = () => (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 overflow-y-auto border border-fuchsia-200/50 flex-1 min-h-0 mx-20">
      <h2 className="text-2xl lg:text-3xl font-black text-fuchsia-800 mb-6 flex items-center space-x-2">
        <CalendarIcon className="h-6 w-6 lg:h-8 lg:w-8" />
        <span>Daily Assignment</span>
      </h2>

      <form onSubmit={handleAssignSubmit} className="space-y-6">
        {/* Form remains 100% unchanged */}
        {/* REPLACE FROM <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"> */}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={assignmentForm.date}
              onChange={handleDateChange}
              className="w-full px-3 py-2 lg:py-3 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-sm lg:text-base"
              required
            />

            {(!assignmentForm.date || assignmentForm.date === '2025-12-02') ? (
              <p className="text-xs font-semibold text-red-600 mt-2 animate-pulse">
                Please select a date first
              </p>
            ) : assignmentsOnSelectedDate.length > 0 ? (
              <p className="text-xs text-gray-500 mt-1">
                {assignmentsOnSelectedDate.length} assignment(s) already exist on this date
              </p>
            ) : (
              <p className="text-xs text-green-600 font-medium mt-1">
                No assignments yet — you can assign freely
              </p>
            )}
          </div>


          {/* MULTIPLE BRANCHES + MANUAL AO ID */}
          <div className="md:col-span-2">
            <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-3">Branches * (Select multiple)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-fuchsia-300 rounded-lg p-4 bg-white/50">
              {branches
                .filter(branch => {
                  // SAFELY check if this branch is already used on selected date
                  return !assignmentsOnSelectedDate.some(a => {
                    const usedIds = Array.isArray(a.branchIds)
                      ? a.branchIds
                      : (a.branchIds ? a.branchIds.split(',').map(id => id.trim()) : []);
                    return usedIds.includes(branch.id);
                  });
                })
                .map(branch => (
                  <label key={branch.id} className="flex items-center gap-3 p-3 hover:bg-fuchsia-50/50 rounded-lg cursor-pointer transition-colors"
                    onClick={(e) => {
                      if (!dateSelected) {
                        e.preventDefault();
                        showDateWarning();
                      }
                    }}>
                    <input
                      type="checkbox"
                      checked={assignmentForm.selectedBranches?.includes(branch.id) || false}
                      disabled={!dateSelected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAssignmentForm(prev => {
                          const selected = prev.selectedBranches || [];
                          const newSelected = checked
                            ? [...selected, branch.id]
                            : selected.filter(id => id !== branch.id);

                          const selectedBranchesData = branches.filter(b => newSelected.includes(b.id));
                          const aoIds = selectedBranchesData.map(b => b.accountOfficerId).filter(Boolean);

                          return {
                            ...prev,
                            selectedBranches: newSelected,
                            branchIds: newSelected,
                            branchNames: selectedBranchesData.map(b => b.name),
                            accountOfficerEmployeeIds: aoIds.length > 0 ? aoIds : prev.accountOfficerEmployeeIds
                          };
                        });
                      }}
                      className="w-5 h-5 text-fuchsia-600 rounded focus:ring-fuchsia-500"
                    />
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{branch.name}</div>
                      <div className="text-xs text-gray-500">AO: {branch.accountOfficerId || '—'}</div>
                    </div>
                  </label>
                ))}

            </div>

            {/* Manual AO ID Input — NOW AUTO-CHECKS BRANCHES */}
            <label className="block text-xs lg:text-sm font-semibold text-gray-700 mt-4 mb-2">
              Account Officer IDs * (Auto-filled or edit manually)
            </label>
            <input
              type="text"
              value={Array.isArray(assignmentForm.accountOfficerEmployeeIds)
                ? assignmentForm.accountOfficerEmployeeIds.join(', ')
                : ''}
              onChange={(e) => {
                const input = e.target.value;
                const newAoIds = input.split(',').map(id => id.trim()).filter(id => id);

                // AUTO-CHECK BRANCHES THAT MATCH THESE AO IDs
                const matchingBranchIds = branches
                  .filter(b => newAoIds.includes(b.accountOfficerId))
                  .map(b => b.id);

                setAssignmentForm(prev => ({
                  ...prev,
                  accountOfficerEmployeeIds: newAoIds,
                  selectedBranches: matchingBranchIds,
                  branchIds: matchingBranchIds,
                  branchNames: branches.filter(b => matchingBranchIds.includes(b.id)).map(b => b.name)
                }));
              }}
              placeholder="1234, 5678, 9012"
              className="w-full px-3 py-2 lg:py-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm lg:text-base"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <h3 className="text-base lg:text-lg font-bold text-emerald-800 mb-3">Officer 1 *</h3>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'officer1' ? null : 'officer1')}
                disabled={!dateSelected}
                className="w-full px-3 py-2 border-1  border-emerald-300 rounded-lg bg-green-50 text-sm text-left mb-2
             disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 font-semibold text-gray-500
             flex justify-between items-center "
              >
                <span className="truncate">
                  {assignmentForm.officer1Id
                    ? assignedOfficers.find(o => o.id === assignmentForm.officer1Id)?.name
                    : 'Select Officer 1'}
                </span>
                <svg className="h-4 w-4 text-gray-900 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>


              {openDropdown === 'officer1' && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ">
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search.officer1}
                    onChange={(e) => setSearch({ ...search, officer1: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-b border-gray-200 focus:outline-none focus:bg-white text-sm placeholder-gray-500 font-medium"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {assignedOfficers
                      .filter(o =>
                        o.id !== assignmentForm.officer2Id &&
                        !assignmentsOnSelectedDate.some(a => a.officer1Id === o.id || a.officer2Id === o.id) &&
                        (o.name.toLowerCase().includes(search.officer1.toLowerCase()) ||
                          (o.employeeId && o.employeeId.toLowerCase().includes(search.officer1.toLowerCase())))
                      )
                      .map(o => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            handleSelectChange('officer1', o.id);
                            setOpenDropdown(null);
                            setSearch({ ...search, officer1: '' });
                          }}
                          className="w-full px-5 py-3 text-left flex justify-between items-center text-sm hover:bg-emerald-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium text-gray-500">{o.name}</span>
                          <span className="text-gray-500 text-xs">({o.employeeId || 'No ID'})</span>
                        </button>
                      ))}
                    {assignedOfficers
                      .filter(o =>
                        o.id !== assignmentForm.officer2Id &&
                        !assignmentsOnSelectedDate.some(a => a.officer1Id === o.id || a.officer2Id === o.id) &&
                        (o.name.toLowerCase().includes(search.officer1.toLowerCase()) ||
                          (o.employeeId && o.employeeId.toLowerCase().includes(search.officer1.toLowerCase())))
                      ).length === 0 && (
                        <div className="px-5 py-8 text-center text-gray-500 text-sm italic">
                          No officers found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
            <input type="tel" name="officer1Phone" value={assignmentForm.officer1Phone} onChange={handlePhoneChange} placeholder="Phone (optional override)" className="w-full px-3 py-2 border border-emerald-300 rounded-lg mb-2 text-sm" />
            {/* OFFICER 1 SHIFT — BIDIRECTIONAL */}
            <select
              name="officer1Shift"
              value={assignmentForm.officer1Shift}
              onChange={handleShiftChange}
              onMouseDown={(e) => {
                if (!dateSelected) {
                  e.preventDefault();
                  showDateWarning();
                }
              }}
              disabled={!dateSelected}
              className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm"
              required
            >
              <option value="">Select Shift</option>
              <option value="I" disabled={assignmentForm.officer2Shift === 'I'}>Shift I</option>
              <option value="II" disabled={assignmentForm.officer2Shift === 'II'}>Shift II</option>
            </select>
          </div>

          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200">
            <h3 className="text-base lg:text-lg font-bold text-teal-800 mb-3">Officer 2 *</h3>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'officer2' ? null : 'officer2')}
                disabled={!dateSelected}
                className="w-full px-3 py-2 border-1 border-emerald-300 rounded-lg bg-green-50 text-sm text-left mb-2
               disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 font-semibold text-gray-500
               flex justify-between items-center"
              >
                <span className="truncate">
                  {assignmentForm.officer2Id
                    ? assignedOfficers.find(o => o.id === assignmentForm.officer2Id)?.name
                    : 'Select Officer 2'}
                </span>
                <svg className="h-4 w-4 text-gray-900 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'officer2' && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search.officer2}
                    onChange={(e) => setSearch({ ...search, officer2: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-b border-gray-200 focus:outline-none focus:bg-white text-sm placeholder-gray-500 font-medium"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {assignedOfficers
                      .filter(o =>
                        o.id !== assignmentForm.officer1Id &&
                        !assignmentsOnSelectedDate.some(a => a.officer1Id === o.id || a.officer2Id === o.id) &&
                        (o.name.toLowerCase().includes(search.officer2.toLowerCase()) ||
                          (o.employeeId && o.employeeId.toLowerCase().includes(search.officer2.toLowerCase())))
                      )
                      .map(o => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            handleSelectChange('officer2', o.id);
                            setOpenDropdown(null);
                            setSearch({ ...search, officer2: '' });
                          }}
                          className="w-full px-5 py-3 text-left flex justify-between items-center text-sm hover:bg-emerald-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium text-gray-500">{o.name}</span>
                          <span className="text-gray-500 text-xs">({o.employeeId || 'No ID'})</span>
                        </button>
                      ))}
                    {assignedOfficers
                      .filter(o =>
                        o.id !== assignmentForm.officer1Id &&
                        !assignmentsOnSelectedDate.some(a => a.officer1Id === o.id || a.officer2Id === o.id) &&
                        (o.name.toLowerCase().includes(search.officer2.toLowerCase()) ||
                          (o.employeeId && o.employeeId.toLowerCase().includes(search.officer2.toLowerCase())))
                      ).length === 0 && (
                        <div className="px-5 py-8 text-center text-gray-500 text-sm italic">
                          No officers found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            <input type="tel" name="officer2Phone" value={assignmentForm.officer2Phone} onChange={handlePhoneChange} placeholder="Phone (optional override)" className="w-full px-3 py-2 border border-teal-300 rounded-lg mb-2 text-sm" />
            {/* OFFICER 2 SHIFT — BIDIRECTIONAL */}
            <select
              name="officer2Shift"
              value={assignmentForm.officer2Shift}
              onChange={handleShiftChange}
              onMouseDown={(e) => {
                if (!dateSelected) {
                  e.preventDefault();
                  showDateWarning();
                }
              }}
              disabled={!dateSelected}
              className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm"
              required
            >
              <option value="">Select Shift</option>
              <option value="I" disabled={assignmentForm.officer1Shift === 'I'}>Shift I</option>
              <option value="II" disabled={assignmentForm.officer1Shift === 'II'}>Shift II</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* TEAM LEADER 1 */}
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200">
            <h3 className="text-base lg:text-lg font-bold text-purple-800 mb-800 mb-3">Team Leader 1</h3>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'tl1' ? null : 'tl1')}
                disabled={!dateSelected}
                className="w-full px-3 py-2 border-1 border-purple-300 rounded-lg bg-purple-50 text-sm text-left mb-2
               disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 font-semibold text-gray-500
               flex justify-between items-center"
              >
                <span className="truncate">
                  {assignmentForm.tl1Id
                    ? teamLeaders.find(tl => tl.id === assignmentForm.tl1Id)?.name
                    : 'Select Team Leader 1'}
                </span>
                <svg className="h-4 w-4 text-gray-900 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'tl1' && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search.tl1}
                    onChange={(e) => setSearch({ ...search, tl1: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-b border-gray-200 focus:outline-none focus:bg-white text-sm placeholder-gray-500 font-medium"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {teamLeaders
                      .filter(tl =>
                        tl.id !== assignmentForm.tl2Id &&
                        !assignmentsOnSelectedDate.some(a => a.tl1Id === tl.id || a.tl2Id === tl.id) &&
                        (tl.name.toLowerCase().includes(search.tl1.toLowerCase()) ||
                          (tl.employeeId && tl.employeeId.toLowerCase().includes(search.tl1.toLowerCase())))
                      )
                      .map(tl => (
                        <button
                          key={tl.id}
                          type="button"
                          onClick={() => {
                            handleSelectChange('tl1', tl.id);
                            setOpenDropdown(null);
                            setSearch({ ...search, tl1: '' });
                          }}
                          className="w-full px-5 py-3 text-left flex justify-between items-center text-sm hover:bg-emerald-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium text-gray-500">{tl.name}</span>
                          <span className="text-gray-500 text-xs">({tl.employeeId || 'No ID'})</span>
                        </button>
                      ))}
                    {teamLeaders
                      .filter(tl =>
                        tl.id !== assignmentForm.tl2Id &&
                        !assignmentsOnSelectedDate.some(a => a.tl1Id === tl.id || a.tl2Id === tl.id) &&
                        (tl.name.toLowerCase().includes(search.tl1.toLowerCase()) ||
                          (tl.employeeId && tl.employeeId.toLowerCase().includes(search.tl1.toLowerCase())))
                      ).length === 0 && (
                        <div className="px-5 py-8 text-center text-gray-500 text-sm italic">
                          No team leaders found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            <input
              type="tel"
              name="tl1Phone"
              value={assignmentForm.tl1Phone}
              onChange={handlePhoneChange}
              placeholder="Phone (optional override)"
              className="w-full px-3 py-2 border border-purple-300 rounded-lg mb-2 text-sm"
            />

            {/* TL1 SHIFT — BIDIRECTIONAL */}
            <select
              name="tl1Shift"
              value={assignmentForm.tl1Shift}
              onChange={handleShiftChange}
              onMouseDown={(e) => {
                if (!dateSelected) {
                  e.preventDefault();
                  showDateWarning();
                }
              }}
              disabled={!dateSelected}
              className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm"
              required
            >
              <option value="">Select Shift</option>
              <option value="I" disabled={assignmentForm.tl2Shift === 'I'}>Shift I</option>
              <option value="II" disabled={assignmentForm.tl2Shift === 'II'}>Shift II</option>
            </select>
          </div>

          {/* TEAM LEADER 2 */}
          <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-200">
            <h3 className="text-base lg:text-lg font-bold text-pink-800 mb-3">Team Leader 2</h3>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'tl2' ? null : 'tl2')}
                disabled={!dateSelected}
                className="w-full px-3 py-2 border-1 border-pink-300 rounded-lg bg-pink-50 text-sm text-left mb-2
               disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-300 font-semibold text-gray-500
               flex justify-between items-center"
              >
                <span className="truncate">
                  {assignmentForm.tl2Id
                    ? teamLeaders.find(tl => tl.id === assignmentForm.tl2Id)?.name
                    : 'Select Team Leader 2'}
                </span>
                <svg className="h-4 w-4 text-gray-900 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openDropdown === 'tl2' && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={search.tl2}
                    onChange={(e) => setSearch({ ...search, tl2: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border-b border-gray-200 focus:outline-none focus:bg-white text-sm placeholder-gray-500 font-medium"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {teamLeaders
                      .filter(tl =>
                        tl.id !== assignmentForm.tl1Id &&
                        !assignmentsOnSelectedDate.some(a => a.tl1Id === tl.id || a.tl2Id === tl.id) &&
                        (tl.name.toLowerCase().includes(search.tl2.toLowerCase()) ||
                          (tl.employeeId && tl.employeeId.toLowerCase().includes(search.tl2.toLowerCase())))
                      )
                      .map(tl => (
                        <button
                          key={tl.id}
                          type="button"
                          onClick={() => {
                            handleSelectChange('tl2', tl.id);
                            setOpenDropdown(null);
                            setSearch({ ...search, tl2: '' });
                          }}
                          className="w-full px-5 py-3 text-left flex justify-between items-center text-sm hover:bg-emerald-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium text-gray-500">{tl.name}</span>
                          <span className="text-gray-500 text-xs">({tl.employeeId || 'No ID'})</span>
                        </button>
                      ))}
                    {teamLeaders
                      .filter(tl =>
                        tl.id !== assignmentForm.tl1Id &&
                        !assignmentsOnSelectedDate.some(a => a.tl1Id === tl.id || a.tl2Id === tl.id) &&
                        (tl.name.toLowerCase().includes(search.tl2.toLowerCase()) ||
                          (tl.employeeId && tl.employeeId.toLowerCase().includes(search.tl2.toLowerCase())))
                      ).length === 0 && (
                        <div className="px-5 py-8 text-center text-gray-500 text-sm italic">
                          No team leaders found
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            <input
              type="tel"
              name="tl2Phone"
              value={assignmentForm.tl2Phone}
              onChange={handlePhoneChange}
              placeholder="Phone (optional override)"
              className="w-full px-3 py-2 border border-pink-300 rounded-lg mb-2 text-sm"
            />

            {/* TL2 SHIFT — BIDIRECTIONAL */}
            <select
              name="tl2Shift"
              value={assignmentForm.tl2Shift}
              onChange={handleShiftChange}
              onMouseDown={(e) => {
                if (!dateSelected) {
                  e.preventDefault();
                  showDateWarning();
                }
              }}
              disabled={!dateSelected}
              className="w-full px-3 py-2 border border-pink-300 rounded-lg text-sm"
              required
            >
              <option value="">Select Shift</option>
              <option value="I" disabled={assignmentForm.tl1Shift === 'I'}>Shift I</option>
              <option value="II" disabled={assignmentForm.tl1Shift === 'II'}>Shift II</option>
            </select>
          </div>
        </div>



        <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white py-3 lg:py-4 rounded-xl font-bold hover:from-fuchsia-700 hover:to-rose-700 transition-all duration-300 text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          {editingId ? 'Update Assignment' : 'Create Assignment'}
        </button>
      </form>

      <div className="mt-6 border-t border-fuchsia-200 pt-6">
        <h3 className="text-xl font-bold text-fuchsia-800 mb-4">Bulk Upload (Excel)</h3>
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <input type="file" accept=".xlsx, .xls" onChange={(e) => setBulkFile(e.target.files[0])} className="w-full px-3 py-2 border border-fuchsia-300 rounded-lg text-sm" />
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
            <DocumentArrowUpIcon className="h-5 w-5" />
            <span>Upload Bulk Assignments</span>
          </button>
        </form>
      </div>
    </div>
  );

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
                Current Assignments
              </h1>
            </div>

            <span className="hidden sm:inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-gray-700 bg-fuchsia-50 border border-fuchsia-200 rounded-md shadow-sm">
              Total: {assignments.length}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto h-full flex flex-col gap-6">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg shadow-purple-900/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-xl shadow-lg shadow-fuchsia-900/20 text-white">
                  <ClipboardDocumentCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">All Assignments</h2>
                  <p className="text-sm text-slate-500">Manage daily assignments</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('excel')}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Excel
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  CSV
                </button>
              </div>
            </div>



            {/* Table Container */}
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/60 backdrop-blur-md rounded-2xl border border-white/60">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <ClipboardDocumentCheckIcon className="h-12 w-12 text-slate-300" />
                </div>
                <p className="text-slate-500 text-lg font-medium">No assignments found</p>
                <p className="text-slate-400 text-sm">Create your first assignment to get started</p>
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
                        {canEdit && <th rowSpan="2" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-400/60">Actions</th>}
                      </tr>
                      <tr>
                        {/* Shift I Subheaders */}
                        <th className="px-4 py-3 text-xs font-bold text-fuchsia-600 bg-fuchsia-50/30 border-b border-slate-400/60 border-l">Officer</th>
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
                      {assignments.map(a => (
                        <tr key={a.id} className="group hover:bg-white/80 transition-colors duration-200">
                          {/* BRANCH NAMES */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {Array.isArray(a.branchNames)
                                ? a.branchNames.map((n, i) => (
                                  <span key={i} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 group-hover:border-fuchsia-200 transition-colors">
                                    {n.trim()}
                                  </span>
                                ))
                                : (a.branchNames || '').split(',').map((n, i) => (
                                  <span key={i} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 group-hover:border-fuchsia-200 transition-colors">
                                    {n.trim()}
                                  </span>
                                ))}
                            </div>
                          </td>

                          {/* AO IDs */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {Array.isArray(a.accountOfficerEmployeeIds)
                                ? a.accountOfficerEmployeeIds.map((id, i) => (
                                  <span key={i} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-100 group-hover:border-rose-200 transition-colors">
                                    {id.trim()}
                                  </span>
                                ))
                                : (a.accountOfficerEmployeeIds || '').split(',').map((id, i) => (
                                  <span key={i} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-100 group-hover:border-rose-200 transition-colors">
                                    {id.trim()}
                                  </span>
                                ))}
                            </div>
                          </td>
                          {/* Shift I */}
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium border-l border-slate-100 bg-fuchsia-50/10 group-hover:bg-fuchsia-50/30 transition-colors">{a.officer1Shift === 'I' ? a.officer1?.name || '-' : (a.officer2Shift === 'I' ? a.officer2?.name || '-' : '-')}</td>
                          <td className="px-4 py-4 text-sm text-slate-500 bg-fuchsia-50/10 group-hover:bg-fuchsia-50/30 transition-colors border-l border-slate-200">{a.officer1Shift === 'I' ? (a.officer1Phone || a.officer1?.phone || '-') : (a.officer2Shift === 'I' ? (a.officer2Phone || a.officer2?.phone || '-') : '-')}</td>
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium bg-fuchsia-50/10 group-hover:bg-fuchsia-50/30 transition-colors border-l border-slate-200 border-r">{a.tl1Shift === 'I' ? a.tl1?.name || '-' : (a.tl2Shift === 'I' ? a.tl2?.name || '-' : '-')}</td>
                          <td className="px-4 py-4 text-sm text-slate-500 border-r border-slate-400/60 bg-fuchsia-50/10 group-hover:bg-fuchsia-50/30 transition-colors">{a.tl1Shift === 'I' ? (a.tl1Phone || a.tl1?.phone || '-') : (a.tl2Shift === 'I' ? (a.tl2Phone || a.tl2?.phone || '-') : '-')}</td>

                          {/* Shift II */}
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium bg-purple-50/10 group-hover:bg-purple-50/30 transition-colors border-l border-slate-200">{a.officer1Shift === 'II' ? a.officer1?.name || '-' : (a.officer2Shift === 'II' ? a.officer2?.name || '-' : '-')}</td>
                          <td className="px-4 py-4 text-sm text-slate-500 bg-purple-50/10 group-hover:bg-purple-50/30 transition-colors border-l border-slate-200">{a.officer1Shift === 'II' ? (a.officer1Phone || a.officer1?.phone || '-') : (a.officer2Shift === 'II' ? (a.officer2Phone || a.officer2?.phone || '-') : '-')}</td>
                          <td className="px-4 py-4 text-sm text-slate-800 font-medium bg-purple-50/10 group-hover:bg-purple-50/30 transition-colors border-l border-slate-200 border-r">{a.tl1Shift === 'II' ? a.tl1?.name || '-' : (a.tl2Shift === 'II' ? a.tl2?.name || '-' : '-')}</td>
                          <td className="px-4 py-4 text-sm text-slate-500 bg-purple-50/10 group-hover:bg-purple-50/30 transition-colors border-r border-slate-400/60">{a.tl1Shift === 'II' ? (a.tl1Phone || a.tl1?.phone || '-') : (a.tl2Shift === 'II' ? (a.tl2Phone || a.tl2?.phone || '-') : '-')}</td>

                          {/* Date */}
                          <td className="px-6 py-4 text-sm font-bold text-slate-700 bg-white/30 border-r border-slate-400/60">{formatDate(a.date)}</td>
                          {canEdit && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openViewModal(a)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => openEditModal(a)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDeleteAssignment(a.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
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
          </div>
        </main>
      </div>

      {renderEditModal()}
      {renderViewModal()}
      <style>{`
@keyframes blob {
  0 % { transform: translate(0px, 0px) scale(1); }
  33 % { transform: translate(30px, -50px) scale(1.1); }
  66 % { transform: translate(-20px, 20px) scale(0.9); }
  100 % { transform: translate(0px, 0px) scale(1); }
}
        .animate - blob { animation: blob 7s infinite; }
        .animation - delay - 2000 { animation - delay: 2s; }
        .animation - delay - 4000 { animation - delay: 4s; }
`}</style>

    </div>
  );
};

export default CurrentAssignmentsPage;