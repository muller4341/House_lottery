import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Modal from '../components/Modal';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  CheckIcon,
  DocumentArrowUpIcon,
  ClipboardDocumentCheckIcon,
  ChevronDownIcon
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

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

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

  // Refs for click outside
  const officer1Ref = useRef(null);
  const officer2Ref = useRef(null);
  const tl1Ref = useRef(null);
  const tl2Ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInside = [officer1Ref, officer2Ref, tl1Ref, tl2Ref].some(
        ref => ref.current && ref.current.contains(event.target)
      );
      if (!isInside) {
        setOpenDropdown(null);
      }
    };
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);


  useEffect(() => {
    fetchAssignments();
  }, []);




  const handleDateChange = async (e) => {
    const newDate = e.target.value;

    // Initial reset of specific fields to ensure clean state
    setAssignmentForm(prev => ({
      ...prev,
      date: newDate,
      selectedBranches: [],
      branchIds: [],
      branchNames: [],
      accountOfficerEmployeeIds: [],
      officer1Id: '', officer1Shift: '', officer1Phone: '',
      officer2Id: '', officer2Shift: '', officer2Phone: '',
      tl1Id: '', tl1Shift: '', tl1Phone: '',
      tl2Id: '', tl2Shift: '', tl2Phone: '',
      officer1Name: '', officer2Name: '', tl1Name: '', tl2Name: ''
    }));
    setDateSelected(!!newDate);
    setEditingId(null);

    if (!newDate) {
      setAssignmentsOnSelectedDate([]);
      return;
    }

    try {
      const response = await fetch(`/api/assignments?date=${newDate}`);
      if (response.ok) {
        const data = await response.json();
        const existingAssignments = data.assignments || [];
        setAssignmentsOnSelectedDate(existingAssignments);

        if (existingAssignments.length > 0) {
          const a = existingAssignments[0];
          const getArray = (value) =>
            Array.isArray(value) ? value : (value ? value.split(',').map(v => v.trim()) : []);

          setAssignmentForm({
            id: a.id,
            date: a.date.split('T')[0],
            selectedBranches: getArray(a.branchIds),
            branchIds: getArray(a.branchIds),
            branchNames: getArray(a.branchNames),
            accountOfficerEmployeeIds: getArray(a.accountOfficerEmployeeIds),
            officer1Id: a.officer1Id || '',
            officer1Shift: a.officer1Shift || '',
            officer1Phone: a.officer1Phone || (a.officer1?.phone || ''),
            officer2Id: a.officer2Id || '',
            officer2Shift: a.officer2Shift || '',
            officer2Phone: a.officer2Phone || (a.officer2?.phone || ''),
            tl1Id: a.tl1Id || '',
            tl1Shift: a.tl1Shift || '',
            tl1Phone: a.tl1Phone || (a.tl1?.phone || ''),
            tl2Id: a.tl2Id || '',
            tl2Shift: a.tl2Shift || '',
            tl2Phone: a.tl2Phone || (a.tl2?.phone || ''),
            officer1Name: a.officer1?.name || '',
            officer2Name: a.officer2?.name || '',
            tl1Name: a.tl1?.name || '',
            tl2Name: a.tl2?.name || '',
          });
          setEditingId(a.id);
        }
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
      const response = await fetch(`/api/users/active?role=${role}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched ${role}s: `, data);
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

    if (!selectedUser) return; // safety

    setAssignmentForm(prev => ({
      ...prev,
      [`${field}Id`]: value,
      [`${field}Phone`]: selectedUser.phone || '',
      // ADD THESE TWO LINES — store name directly
      [`${field}Name`]: selectedUser.name,
    }));
  };

  // FIXED: handleShiftChange — now works perfectly
  const handleShiftChange = (e) => {
    const field = e.target.name.replace('Shift', '');
    const shift = e.target.value;

    setAssignmentForm(prev => ({
      ...prev,
      [`${field}Shift`]: shift
    }));
  };

  // FIXED: handlePhoneChange
  const handlePhoneChange = (e) => {
    const field = e.target.name.replace('Phone', '');
    setAssignmentForm(prev => ({
      ...prev,
      [`${field}Phone`]: e.target.value
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
        const officerName = assignedOfficers.find(o => o.id === assignmentForm.officer1Id)?.name || 'This officer';
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Officer Already Assigned',
          message: `${officerName} is already assigned to ${getShiftLabel(assignmentForm.officer1Shift)} on this date.`
        });
        return;
      }

      if (isOfficerAlreadyAssignedOnDate(assignmentForm.officer2Id, assignmentForm.officer2Shift, currentDate)) {
        const officerName = assignedOfficers.find(o => o.id === assignmentForm.officer2Id)?.name || 'This officer';
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Officer Already Assigned',
          message: `${officerName} is already assigned to ${getShiftLabel(assignmentForm.officer2Shift)} on this date.`
        });
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

      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Missing Required Fields',
        message: 'Please fill in the following:\n• ' + missing.join('\n• ')
      });
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
    const url = editingId ? `/api/assignments/${editingId}` : '/api/assignments';
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

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success!',
        message: 'Assignment updated successfully!'
      });

      // Auto-close and navigate after 2 seconds
      setTimeout(() => {
        setModal(prev => ({ ...prev, isOpen: false }));
        navigate('/current-assignments');
        setAssignmentForm({ /* reset form */ });
        setEditingId(null);
        setShowEditModal(false);
        fetchAssignments();
      }, 5000);
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
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to save assignment'
      });
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
      tl2Phone: assignment.tl2Phone || '',
      officer1Name: assignment.officer1?.name || '',
      // same for officer2, tl1, tl2
      officer2Name: assignment.officer2?.name || '',
      tl1Name: assignment.tl1?.name || '',
      tl2Name: assignment.tl2?.name || '',
    });

    setDateSelected(true);
    setEditingId(assignment.id);  // ← ADD THIS LINE
    setShowEditModal(true);
  };

  const handleDeleteAssignment = async (id) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Assignment',
      message: 'Are you sure you want to delete this assignment? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete');

          setModal({
            isOpen: true,
            type: 'success',
            title: 'Deleted!',
            message: 'Assignment deleted successfully!'
          });
          fetchAssignments();
        } catch (error) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: error.message || 'Failed to delete assignment'
          });
        }
      }
    });

  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
  }

  const renderEditModal = () => showEditModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-700 to-purple-800">
              Edit Assignment
            </h3>
            <p className="text-gray-500 font-medium mt-1">Modify assignment details</p>
          </div>
          <button
            onClick={() => setShowEditModal(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-3 rounded-2xl transition-all duration-200"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {renderAssignmentFormForModal()}
        </div>
      </div>
    </div>
  );
  const renderViewModal = () => showViewModal && viewingAssignment && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-700 to-purple-800">
              Assignment Details
            </h3>
            <p className="text-gray-500 font-medium mt-1">Assignment for {formatDate(viewingAssignment.date)}</p>
          </div>
          <button
            onClick={() => setShowViewModal(false)}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-3 rounded-2xl transition-all duration-200"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Branches Section */}
            <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 border border-white/60 shadow-xl shadow-fuchsia-900/5">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-fuchsia-100/50 rounded-2xl">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-fuchsia-700" />
                </div>
                <h4 className="text-xl font-bold text-gray-800">Branches Assigned</h4>
              </div>
              <div className="flex flex-col gap-2">
                {(Array.isArray(viewingAssignment.branchNames)
                  ? viewingAssignment.branchNames
                  : viewingAssignment.branchNames?.split(',') || []
                ).map((name, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-fuchsia-50 to-purple-50 text-fuchsia-700 border border-fuchsia-100 rounded-xl text-sm font-bold shadow-sm"
                  >
                    {name.trim()}
                  </span>
                )) || <span className="text-gray-400 italic">No branches assigned</span>}
              </div>
            </div>

            {/* AO IDs Section */}
            <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 border border-white/60 shadow-xl shadow-rose-900/5">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-rose-100/50 rounded-2xl">
                  <CheckIcon className="h-6 w-6 text-rose-700" />
                </div>
                <h4 className="text-xl font-bold text-gray-800">Account Officer IDs</h4>
              </div>
              <div className="flex flex-col gap-2">
                {(Array.isArray(viewingAssignment.accountOfficerEmployeeIds)
                  ? viewingAssignment.accountOfficerEmployeeIds
                  : viewingAssignment.accountOfficerEmployeeIds?.split(',') || []
                ).map((id, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-bold shadow-sm"
                  >
                    {id.trim()}
                  </span>
                )) || <span className="text-gray-400 italic">No AO IDs assigned</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Officers Section */}
            <div className="space-y-6">
              <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 border border-white/60 shadow-xl shadow-emerald-900/5">
                <h4 className="text-xl font-black text-emerald-800 mb-6 flex items-center">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full mr-3" />
                  Officer 1
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">Name</span>
                    <span className="text-gray-900 font-bold">{viewingAssignment.officer1?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">Phone</span>
                    <span className="text-gray-900 font-bold">{viewingAssignment.officer1Phone || viewingAssignment.officer1?.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500 font-medium">Shift</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold">
                      {getShiftLabel(viewingAssignment.officer1Shift)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 border border-white/60 shadow-xl shadow-teal-900/5">
                <h4 className="text-xl font-black text-teal-800 mb-6 flex items-center">
                  <div className="w-2 h-8 bg-teal-500 rounded-full mr-3" />
                  Officer 2
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">Name</span>
                    <span className="text-gray-900 font-bold">{viewingAssignment.officer2?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">Phone</span>
                    <span className="text-gray-900 font-bold">{viewingAssignment.officer2Phone || viewingAssignment.officer2?.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500 font-medium">Shift</span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-sm font-bold">
                      {getShiftLabel(viewingAssignment.officer2Shift)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Leaders Section */}
            <div className="space-y-6">
              {viewingAssignment.tl1Id && (
                <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 border border-white/60 shadow-xl shadow-purple-900/5">
                  <h4 className="text-xl font-black text-purple-800 mb-6 flex items-center">
                    <div className="w-2 h-8 bg-purple-500 rounded-full mr-3" />
                    Team Leader 1
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 font-medium">Name</span>
                      <span className="text-gray-900 font-bold">{viewingAssignment.tl1?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 font-medium">Phone</span>
                      <span className="text-gray-900 font-bold">{viewingAssignment.tl1Phone || viewingAssignment.tl1?.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-500 font-medium">Shift</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                        {getShiftLabel(viewingAssignment.tl1Shift)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {viewingAssignment.tl2Id && (
                <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 border border-white/60 shadow-xl shadow-pink-900/5">
                  <h4 className="text-xl font-black text-pink-800 mb-6 flex items-center">
                    <div className="w-2 h-8 bg-pink-500 rounded-full mr-3" />
                    Team Leader 2
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 font-medium">Name</span>
                      <span className="text-gray-900 font-bold">{viewingAssignment.tl2?.name || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                      <span className="text-gray-500 font-medium">Phone</span>
                      <span className="text-gray-900 font-bold">{viewingAssignment.tl2Phone || viewingAssignment.tl2?.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-500 font-medium">Shift</span>
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-sm font-bold">
                        {getShiftLabel(viewingAssignment.tl2Shift)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const handleBack = () => {
    navigate('/dashboard');
  };

  const renderAssignmentFormForModal = () => (
    <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-1 lg:p-2 border border-white/60">
      <form onSubmit={handleAssignSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Date Picker */}
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-white/60 shadow-xl shadow-fuchsia-900/5 transition-all hover:shadow-fuchsia-900/10 relative z-40">
            <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-3 ml-1">
              Assignment Date *
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-fuchsia-500 " />
              <input
                type="date"
                name="date"
                value={assignmentForm.date}
                onChange={handleDateChange}
                className="w-full pl-12 pr-4 py-3 lg:py-4 border border-slate-200 bg-white/50 rounded-2xl focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-500/50 text-sm lg:text-base outline-none transition-all hover:bg-white/80 font-medium"
                required
              />
            </div>

            {(!assignmentForm.date || assignmentForm.date === '2025-12-02') ? (
              <div className="flex items-center mt-3 ml-1 space-x-2 text-rose-500 animate-pulse">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                <p className="text-xs font-bold">Please select a date first</p>
              </div>
            ) : assignmentsOnSelectedDate.length > 0 ? (
              <div className="flex items-center mt-3 ml-1 space-x-2 text-amber-500">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                <p className="text-xs font-bold">{assignmentsOnSelectedDate.length} assignment(s) exist on this date</p>
              </div>
            ) : (
              <div className="flex items-center mt-3 ml-1 space-x-2 text-emerald-500">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <p className="text-xs font-bold">No assignments yet — you can assign freely</p>
              </div>
            )}
          </div>

          {/* AO IDs Input */}
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-white/60 shadow-xl shadow-rose-900/5 transition-all hover:shadow-rose-900/10 flex flex-col justify-center relative z-40">
            <label className="block text-xs lg:text-sm font-bold text-gray-700 mb-3 ml-1">
              Account Officer IDs *
            </label>
            <div className="relative">
              <CheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500" />
              <input
                type="text"
                value={Array.isArray(assignmentForm.accountOfficerEmployeeIds)
                  ? assignmentForm.accountOfficerEmployeeIds.join(', ')
                  : ''}
                onChange={(e) => {
                  const input = e.target.value;
                  const newAoIds = input.split(',').map(id => id.trim()).filter(id => id);
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
                placeholder="e.g. 1234, 5678"
                className="w-full pl-12 pr-4 py-3 lg:py-4 border border-slate-200 bg-white/50 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500/50 text-sm lg:text-base outline-none transition-all hover:bg-white/80 font-medium"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">Enter AO IDs separated by commas to auto-select branches</p>
          </div>

          {/* Branches Section */}
          <div className="md:col-span-2 bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-purple-900/5 transition-all hover:shadow-purple-900/10 relative z-30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-100/50 rounded-2xl">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <label className="block text-sm lg:text-base font-black text-gray-800">Assign Branches *</label>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-fuchsia-100 text-fuchsia-700 text-[10px] font-black uppercase tracking-wider border border-fuchsia-200">
                      Selected: {assignmentForm.selectedBranches?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-72 overflow-y-auto p-2 custom-scrollbar">
              {branches
                .filter(branch => {
                  return !assignmentsOnSelectedDate.some(a => {
                    const usedIds = Array.isArray(a.branchIds)
                      ? a.branchIds
                      : (a.branchIds ? a.branchIds.split(',').map(id => id.trim()) : []);
                    return usedIds.includes(branch.id) && a.id !== editingId;
                  });
                })
                .map(branch => (
                  <label
                    key={branch.id}
                    className={`flex items-start gap-3 p-4 rounded-3xl cursor-pointer transition-all border-2 ${assignmentForm.selectedBranches?.includes(branch.id)
                      ? 'bg-fuchsia-50/50 border-fuchsia-200 shadow-md shadow-fuchsia-900/5'
                      : 'bg-white/50 border-transparent hover:border-gray-100 hover:bg-white/80'
                      }`}
                  >
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
                      className="mt-1 w-5 h-5 text-fuchsia-600 rounded-lg border-gray-300 focus:ring-fuchsia-500 transition-all cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-sm truncate">{branch.name}</div>
                      <div className="text-[10px] text-gray-500 font-bold mt-1 bg-gray-100/50 inline-block px-2 py-0.5 rounded-md uppercase">ID: {branch.accountOfficerId || '—'}</div>
                    </div>
                  </label>
                ))}
            </div>
          </div>

          {/* Officer Sections */}
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-emerald-900/5 transition-all hover:shadow-emerald-900/10 relative z-20">
            <h3 className="text-lg font-black text-emerald-800 mb-6 flex items-center">
              <div className="w-2 h-7 bg-emerald-500 rounded-full mr-3" />
              Officer 1
            </h3>
            <div className="space-y-4">
              <div className="relative" ref={officer1Ref}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'officer1' ? null : 'officer1')}
                  disabled={!dateSelected}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white/50 text-sm text-left disabled:bg-gray-50 disabled:text-gray-400 font-bold text-gray-700 flex justify-between items-center transition-all hover:bg-white hover:shadow-sm"
                >
                  <span className="truncate">
                    {assignmentForm.officer1Id
                      ? assignedOfficers.find(o => o.id === assignmentForm.officer1Id)?.name
                      : 'Select Officer 1'}
                  </span>
                  <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${openDropdown === 'officer1' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'officer1' && (
                  <div className="absolute z-[60] mt-2 w-full bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      placeholder="Search officer..."
                      value={search.officer1}
                      onChange={(e) => setSearch({ ...search, officer1: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50/50 border-b border-gray-100 focus:outline-none focus:bg-white text-sm font-medium"
                      autoFocus
                    />
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {assignedOfficers
                        .filter(o =>
                          o.id !== assignmentForm.officer2Id &&
                          !assignments.some(a =>
                            a.date.split('T')[0] === assignmentForm.date &&
                            (a.officer1Id === o.id || a.officer2Id === o.id) &&
                            a.id !== editingId
                          ) &&
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
                              setSearch(prev => ({ ...prev, officer1: '' }));
                            }}
                            className="w-full px-5 py-3.5 text-left flex justify-between items-center text-sm hover:bg-emerald-50 transition-all duration-150 border-b border-gray-50 last:border-0"
                          >
                            <span className="font-bold text-gray-700">{o.name}</span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider">{o.employeeId}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <input
                type="tel"
                name="officer1Phone"
                value={assignmentForm.officer1Phone}
                onChange={handlePhoneChange}
                placeholder="Phone (optional override)"
                className="w-full px-5 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm outline-none transition-all hover:bg-white focus:ring-4 focus:ring-emerald-500/10 font-medium"
              />

              <select
                name="officer1Shift"
                value={assignmentForm.officer1Shift}
                onChange={handleShiftChange}
                disabled={!dateSelected}
                className="w-full px-5 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm font-bold text-gray-700 outline-none transition-all hover:bg-white focus:ring-4 focus:ring-emerald-500/10"
                required
              >
                <option value="">Select Shift</option>
                <option value="I" disabled={assignmentForm.officer2Shift === 'I'}>Shift I (Morning)</option>
                <option value="II" disabled={assignmentForm.officer2Shift === 'II'}>Shift II (Afternoon)</option>
              </select>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-teal-900/5 transition-all hover:shadow-teal-900/10 relative z-20">
            <h3 className="text-lg font-black text-teal-800 mb-6 flex items-center">
              <div className="w-2 h-7 bg-teal-500 rounded-full mr-3" />
              Officer 2
            </h3>
            <div className="space-y-4">
              <div className="relative" ref={officer2Ref}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'officer2' ? null : 'officer2')}
                  disabled={!dateSelected}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white/50 text-sm text-left disabled:bg-gray-50 disabled:text-gray-400 font-bold text-gray-700 flex justify-between items-center transition-all hover:bg-white hover:shadow-sm"
                >
                  <span className="truncate">
                    {assignmentForm.officer2Id
                      ? assignedOfficers.find(o => o.id === assignmentForm.officer2Id)?.name
                      : 'Select Officer 2'}
                  </span>
                  <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${openDropdown === 'officer2' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'officer2' && (
                  <div className="absolute z-[60] mt-2 w-full bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      placeholder="Search officer..."
                      value={search.officer2}
                      onChange={(e) => setSearch({ ...search, officer2: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50/50 border-b border-gray-100 focus:outline-none focus:bg-white text-sm font-medium"
                      autoFocus
                    />
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {assignedOfficers
                        .filter(o =>
                          o.id !== assignmentForm.officer1Id &&
                          !assignments.some(a =>
                            a.date.split('T')[0] === assignmentForm.date &&
                            (a.officer1Id === o.id || a.officer2Id === o.id) &&
                            a.id !== editingId
                          ) &&
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
                              setSearch(prev => ({ ...prev, officer2: '' }));
                            }}
                            className="w-full px-5 py-3.5 text-left flex justify-between items-center text-sm hover:bg-teal-50 transition-all duration-150 border-b border-gray-50 last:border-0"
                          >
                            <span className="font-bold text-gray-700">{o.name}</span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider">{o.employeeId}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <input
                type="tel"
                name="officer2Phone"
                value={assignmentForm.officer2Phone}
                onChange={handlePhoneChange}
                placeholder="Phone (optional override)"
                className="w-full px-5 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm outline-none transition-all hover:bg-white focus:ring-4 focus:ring-teal-500/10 font-medium"
              />

              <select
                name="officer2Shift"
                value={assignmentForm.officer2Shift}
                onChange={handleShiftChange}
                disabled={!dateSelected}
                className="w-full px-5 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm font-bold text-gray-700 outline-none transition-all hover:bg-white focus:ring-4 focus:ring-teal-500/10"
                required
              >
                <option value="">Select Shift</option>
                <option value="I" disabled={assignmentForm.officer1Shift === 'I'}>Shift I (Morning)</option>
                <option value="II" disabled={assignmentForm.officer1Shift === 'II'}>Shift II (Afternoon)</option>
              </select>
            </div>
          </div>

          {/* Team Leader Sections */}
          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-purple-900/5 transition-all hover:shadow-purple-900/10 relative z-10">
            <h3 className="text-lg font-black text-purple-800 mb-6 flex items-center">
              <div className="w-2 h-7 bg-purple-500 rounded-full mr-3" />
              Team Leader 1
            </h3>
            <div className="space-y-4">
              <div className="relative" ref={tl1Ref}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'tl1' ? null : 'tl1')}
                  disabled={!dateSelected}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white/50 text-sm text-left disabled:bg-gray-50 disabled:text-gray-400 font-bold text-gray-700 flex justify-between items-center transition-all hover:bg-white hover:shadow-sm"
                >
                  <span className="truncate">
                    {assignmentForm.tl1Id
                      ? teamLeaders.find(tl => tl.id === assignmentForm.tl1Id)?.name
                      : 'Select Team Leader 1'}
                  </span>
                  <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${openDropdown === 'tl1' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'tl1' && (
                  <div className="absolute z-[60] mt-2 w-full bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      placeholder="Search team leader..."
                      value={search.tl1}
                      onChange={(e) => setSearch({ ...search, tl1: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50/50 border-b border-gray-100 focus:outline-none focus:bg-white text-sm font-medium"
                      autoFocus
                    />
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {teamLeaders
                        .filter(tl =>
                          tl.id !== assignmentForm.tl2Id &&
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
                            className="w-full px-5 py-3.5 text-left flex justify-between items-center text-sm hover:bg-purple-50 transition-all duration-150 border-b border-gray-50 last:border-0"
                          >
                            <span className="font-bold text-gray-700">{tl.name}</span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider">{tl.employeeId}</span>
                          </button>
                        ))}
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
                className="w-full px-5 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm outline-none transition-all hover:bg-white focus:ring-4 focus:ring-purple-500/10 font-medium"
              />

              <select
                name="tl1Shift"
                value={assignmentForm.tl1Shift}
                onChange={handleShiftChange}
                disabled={!dateSelected}
                className="w-full px-5 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm font-bold text-gray-700 outline-none transition-all hover:bg-white focus:ring-4 focus:ring-purple-500/10"
                required
              >
                <option value="">Select Shift</option>
                <option value="I" disabled={assignmentForm.tl2Shift === 'I'}>Shift I (Morning)</option>
                <option value="II" disabled={assignmentForm.tl2Shift === 'II'}>Shift II (Afternoon)</option>
              </select>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-pink-900/5 transition-all hover:shadow-pink-900/10 relative z-10">
            <h3 className="text-lg font-black text-pink-800 mb-6 flex items-center">
              <div className="w-2 h-7 bg-pink-500 rounded-full mr-3" />
              Team Leader 2
            </h3>
            <div className="space-y-4">
              <div className="relative" ref={tl2Ref}>
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'tl2' ? null : 'tl2')}
                  disabled={!dateSelected}
                  className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white/50 text-sm text-left disabled:bg-gray-50 disabled:text-gray-400 font-bold text-gray-700 flex justify-between items-center transition-all hover:bg-white hover:shadow-sm"
                >
                  <span className="truncate">
                    {assignmentForm.tl2Id
                      ? teamLeaders.find(tl => tl.id === assignmentForm.tl2Id)?.name
                      : 'Select Team Leader 2'}
                  </span>
                  <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${openDropdown === 'tl2' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'tl2' && (
                  <div className="absolute z-[60] mt-2 w-full bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      placeholder="Search team leader..."
                      value={search.tl2}
                      onChange={(e) => setSearch({ ...search, tl2: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50/50 border-b border-gray-100 focus:outline-none focus:bg-white text-sm font-medium"
                      autoFocus
                    />
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {teamLeaders
                        .filter(tl =>
                          tl.id !== assignmentForm.tl1Id &&
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
                            className="w-full px-5 py-3.5 text-left flex justify-between items-center text-sm hover:bg-pink-50 transition-all duration-150 border-b border-gray-50 last:border-0"
                          >
                            <span className="font-bold text-gray-700">{tl.name}</span>
                            <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-wider">{tl.employeeId}</span>
                          </button>
                        ))}
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
                className="w-full px-5 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm outline-none transition-all hover:bg-white focus:ring-4 focus:ring-pink-500/10 font-medium"
              />

              <select
                name="tl2Shift"
                value={assignmentForm.tl2Shift}
                onChange={handleShiftChange}
                disabled={!dateSelected}
                className="w-full px-5 py-3.5 border border-slate-200 bg-white/50 rounded-2xl text-sm font-bold text-gray-700 outline-none transition-all hover:bg-white focus:ring-4 focus:ring-pink-500/10"
                required
              >
                <option value="">Select Shift</option>
                <option value="I" disabled={assignmentForm.tl1Shift === 'I'}>Shift I (Morning)</option>
                <option value="II" disabled={assignmentForm.tl1Shift === 'II'}>Shift II (Afternoon)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white py-5 rounded-[2rem] font-black hover:from-fuchsia-700 hover:to-purple-700 transition-all duration-300 text-lg shadow-2xl shadow-purple-900/20 transform hover:-translate-y-1 active:scale-[0.98] mt-8 flex items-center justify-center space-x-3"
        >
          <DocumentArrowUpIcon className="h-6 w-6" />
          <span>{editingId ? 'Update Assignment' : 'Confirm Assignment'}</span>
        </button>
      </form>
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
                                  <span key={i} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-50 text-slate-700 border border-fuchsia-100 group-hover:border-fuchsia-200 transition-colors">
                                    {n.trim()}
                                  </span>
                                ))
                                : (a.branchNames || '').split(',').map((n, i) => (
                                  <span key={i} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-50 text-slate-700 border border-fuchsia-100 group-hover:border-fuchsia-200 transition-colors">
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
                                  <span key={i} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-rose-100 group-hover:border-rose-200 transition-colors">
                                    {id.trim()}
                                  </span>
                                ))
                                : (a.accountOfficerEmployeeIds || '').split(',').map((id, i) => (
                                  <span key={i} className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-fullbg-blue-50 text-blue-700 border border-rose-100 group-hover:border-rose-200 transition-colors">
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
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
`}</style>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />

    </div>
  );
};

export default CurrentAssignmentsPage;