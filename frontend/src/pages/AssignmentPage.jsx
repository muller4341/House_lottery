
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, CheckIcon, ArrowLeftIcon, ArrowDownTrayIcon, DocumentArrowUpIcon, PencilIcon, EyeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import Modal from '../components/Modal';



const getShiftLabel = (shift) => {
  if (!shift) return '';
  return shift === 'I' ? 'Shift I' : 'Shift II';
};

const DailyAssignmentPage = () => {
  const navigate = useNavigate();
  const [assignmentForm, setAssignmentForm] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    selectedBranches: [],           // ← NEW
    branchIds: [],                  // ← NEW
    branchNames: [],                // ← NEW
    accountOfficerEmployeeIds: [],  // ← NEW (replaces single string)
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
  const [assignments, setAssignments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [assignedOfficers, setAssignedOfficers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [assignmentsOnSelectedDate, setAssignmentsOnSelectedDate] = useState([]);
  const [dateSelected, setDateSelected] = useState(true); // Default date is set, so this is TRUE
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [search, setSearch] = useState({
    officer1: '',
    officer2: '',
    tl1: '',
    tl2: ''
  });
  const [branchSearch, setBranchSearch] = useState(''); // NEW Branch Search State
const [modal, setModal] = useState({
  isOpen: false,
  type: 'info', // 'info', 'confirm', 'success', 'error'
  title: '',
  message: '',
  onConfirm: null,
  confirmText: 'Confirm',
  cancelText: 'Cancel'
});
  // Refs for click outside detection
  const officer1Ref = useRef(null);
  const officer2Ref = useRef(null);
  const tl1Ref = useRef(null);
  const tl2Ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown === 'officer1' && officer1Ref.current && !officer1Ref.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (openDropdown === 'officer2' && officer2Ref.current && !officer2Ref.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (openDropdown === 'tl1' && tl1Ref.current && !tl1Ref.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (openDropdown === 'tl2' && tl2Ref.current && !tl2Ref.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);
  // Auto-load assignment if coming from Current Assignments
  useEffect(() => {
    if (location.state?.editAssignment) {
      const a = location.state.editAssignment;

      // SAFELY HANDLE branchIds & accountOfficerEmployeeIds (array or string)
      const getArray = (value) =>
        Array.isArray(value)
          ? value.map(id => id.trim())
          : (value ? value.split(',').map(id => id.trim()) : []);

      setAssignmentForm({
        id: a.id,
        date: a.date.split('T')[0],
        selectedBranches: getArray(a.branchIds),
        branchIds: getArray(a.branchIds),
        branchNames: a.branchNames ? a.branchNames.split(',').map(n => n.trim()) : [],
        accountOfficerEmployeeIds: getArray(a.accountOfficerEmployeeIds),
        officer1Id: a.officer1Id || '',
        officer1Shift: a.officer1Shift || '',
        officer1Phone: a.officer1Phone || '',
        officer2Id: a.officer2Id || '',
        officer2Shift: a.officer2Shift || '',
        officer2Phone: a.officer2Phone || '',
        tl1Id: a.tl1Id || '',
        tl1Shift: a.tl1Shift || '',
        tl1Phone: a.tl1Phone || '',
        tl2Id: a.tl2Id || '',
        tl2Shift: a.tl2Shift || '',
        tl2Phone: a.tl2Phone || ''
      });

      setEditingId(a.id);
      setDateSelected(true);
      // Clear state so it doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state]);
  const handleDateChange = async (e) => {

    const newDate = e.target.value;
    setAssignmentForm(prev => ({
      ...prev,
      date: newDate,
      // Reset selections on date change
      selectedBranches: [],
      branchIds: [],
      branchNames: [],
      accountOfficerEmployeeIds: []
    }));
    setDateSelected(!!newDate);

    if (!newDate) {
      setAssignmentsOnSelectedDate([]);
      return;
    }

    try {
      const response = await fetch(`/api/assignments?date=${newDate}`);
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
  setModal({
    isOpen: true,
    type: 'error',
    title: 'Select Date First',
    message: 'Please select a date before proceeding.'
  });
  return true;
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
        return data;
      } else {
        throw new Error(`Failed to fetch ${role}`);
      }
    } catch (err) {
      console.error(`Error fetching ${role}:`, err);
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
    // Fetch assignments for the default date on load
    const loadDefaultDateAssignments = async () => {
      if (assignmentForm.date) {
        try {
          const response = await fetch(`/api/assignments?date=${assignmentForm.date}`);
          if (response.ok) {
            const data = await response.json();
            setAssignmentsOnSelectedDate(data.assignments || []);
          }
        } catch (e) { console.error(e); }
      }
    };
    loadDefaultDateAssignments();
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
      [`${field}Id`]: value,
      [`${field}Phone`]: selectedUser?.phone || ''
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

    // STRICT UNIQUENESS VALIDATION
    // 1. Check if ANY selected branch is already assigned today (Double-safe)
    const duplicateBranch = assignmentForm.selectedBranches.find(branchId => {
      // Check if this branch ID exists in any existing assignment's branchIds array/string
      return assignmentsOnSelectedDate.some(a => {
        const usedIds = Array.isArray(a.branchIds)
          ? a.branchIds
          : (a.branchIds ? a.branchIds.split(',').map(id => id.trim()) : []);
        return usedIds.includes(branchId) && a.id !== (editingId || -1); // Exclude self if editing
      });
    });

   if (duplicateBranch) {
  const branchName = branches.find(b => b.id === duplicateBranch)?.name || 'Unknown Branch';
  setModal({
    isOpen: true,
    type: 'error',
    title: 'Branch Already Assigned',
    message: `Branch '${branchName}' is already assigned on this date.`
  });
  return;
}

    // 2. Check Officer Uniqueness (Officer 1 & Officer 2 cannot be repeated today)
    // We check against ALL existing assignments for this date
    const isOfficer1Used = assignmentsOnSelectedDate.some(a =>
      (a.officer1Id === assignmentForm.officer1Id || a.officer2Id === assignmentForm.officer1Id) && a.id !== (editingId || -1)
    );
    const isOfficer2Used = assignmentsOnSelectedDate.some(a =>
      (a.officer1Id === assignmentForm.officer2Id || a.officer2Id === assignmentForm.officer2Id) && a.id !== (editingId || -1)
    );

    if (isOfficer1Used) {
      alert('Officer 1 is already assigned to another task on this date.');
      return;
    }
    if (isOfficer2Used) {
      alert('Officer 2 is already assigned to another task on this date.');
      return;
    }

    // 3. Officer 1 cannot be Officer 2
    if (assignmentForm.officer1Id === assignmentForm.officer2Id) {
  setModal({
    isOpen: true,
    type: 'error',
    title: 'Invalid Selection',
    message: 'Officer 1 and Officer 2 cannot be the same person.'
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
  message: editingId ? 'Assignment updated successfully!' : 'Assignment created successfully!'
});

// Auto-close modal and navigate after 2 seconds
setTimeout(() => {
  setModal({ ...modal, isOpen: false }); // Close modal
  navigate('/current-assignments');
}, 2000);
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

  const handleBulkUpload = async (e) => {
  e.preventDefault();

  if (!bulkFile) {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'No File Selected',
      message: 'Please select an Excel file to upload.'
    });
    return;
  }

  if (!assignmentForm.date) {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Date Required',
      message: 'Please select a date first before uploading bulk assignments.'
    });
    return;
  }

  const formData = new FormData();
  formData.append('file', bulkFile);
  formData.append('date', assignmentForm.date); // Important: send the selected date

  try {
    setModal({
      isOpen: true,
      type: 'info',
      title: 'Uploading...',
      message: 'Processing bulk assignments, please wait...'
    });

    const response = await fetch('/api/assignments/bulk', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Bulk upload failed');
    }

    // Success
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Bulk Upload Successful!',
      message: result.message || `Successfully created ${result.created || 0} assignments.`
    });

    if (result.errors && result.errors.length > 0) {
      console.warn('Partial errors in bulk upload:', result.errors);
      // Optional: show partial errors in console or future modal
    }

    // Refresh data
    await fetchAssignments();
    await handleDateChange({ target: { value: assignmentForm.date } }); // Refresh assignments on date

    setBulkFile(null);
    document.querySelector('input[type="file"]').value = ''; // Clear file input

  } catch (error) {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Bulk Upload Failed',
      message: error.message || 'An unexpected error occurred.'
    });
  }
};



  const handleBack = () => {
    navigate('/dashboard');
  };

  const renderAssignmentForm = () => (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/5 p-6 lg:p-8 overflow-y-auto border border-white/60 flex-1 min-h-0 mx-4 lg:mx-20 animate-slide-up">
      <h2 className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-700 to-purple-800 mb-6 flex items-center space-x-3">
        <div className="p-2 bg-fuchsia-100/50 rounded-lg">
          <CalendarIcon className="h-6 w-6 lg:h-8 lg:w-8 text-fuchsia-700" />
        </div>
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
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 lg:py-3 border border-slate-200  bg-white/50 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent text-sm lg:text-base outline-none transition-all hover:bg-white/80"
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
            <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center mb-3 space-y-2 lg:space-y-0">
              <div className="flex items-center space-x-3">
                <label className="block text-xs lg:text-sm font-semibold text-slate-700">Branches * (Select multiple)</label>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 rounded-md bg-fuchsia-100 text-fuchsia-700 text-xs font-bold border border-fuchsia-200">
                    Selected: {assignmentForm.selectedBranches?.length || 0}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                    Available: {Math.max(0, branches.filter(branch =>
                      !assignmentsOnSelectedDate.some(a => {
                        const usedIds = Array.isArray(a.branchIds)
                          ? a.branchIds
                          : (a.branchIds ? a.branchIds.split(',').map(id => id.trim()) : []);
                        return usedIds.includes(branch.id);
                      })
                    ).length - (assignmentForm.selectedBranches?.length || 0))}
                  </span>
                </div>
              </div>
              <input
                type="text"
                placeholder="Search branches by name or AO ID..."
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="text-xs px-2 py-2 border border-fuchsia-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-fuchsia-500 bg-white/50 w-full lg:w-64"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-slate-100  rounded-xl p-4 bg-white/30 backdrop-blur-sm scrollbar-thin scrollbar-thumb-fuchsia-200">
              {branches
                .filter(branch => {
                  // FILTER BY SEARCH
                  const matchesSearch = branch.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
                    (branch.accountOfficerId && branch.accountOfficerId.toLowerCase().includes(branchSearch.toLowerCase()));
                  if (!matchesSearch) return false;

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

              className="w-full px-3 py-2 lg:py-3 border border-white/50 bg-white/50 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent text-sm lg:text-base outline-none transition-all hover:bg-white/80"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm relative z-40">
            <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-3">Officer 1 *</h3>
            <div className="relative" ref={officer1Ref}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'officer1' ? null : 'officer1')}
                disabled={!dateSelected}
                className="w-full px-3 py-2 border border-slate-200  rounded-xl bg-white/50 text-sm text-left mb-2
             disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 font-semibold text-slate-600
             flex justify-between items-center hover:bg-white/80 hover:shadow-sm transition-all shadow-purple-900/5 shadow-sm"
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
                <div className="absolute z-50 mt-1 w-full bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
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
            <input type="tel" name="officer1Phone" value={assignmentForm.officer1Phone} onChange={handlePhoneChange} placeholder="Phone (optional override)" className="w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg mb-2 text-sm outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-fuchsia-500/50" />
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
              className="w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg text-sm outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-fuchsia-500/50"
              required
            >
              <option value="">Select Shift</option>
              <option value="I" disabled={assignmentForm.officer2Shift === 'I'}>Shift I</option>
              <option value="II" disabled={assignmentForm.officer2Shift === 'II'}>Shift II</option>
            </select>
          </div>

          <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm relative z-30">
            <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-3">Officer 2 *</h3>
            <div className="relative" ref={officer2Ref}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'officer2' ? null : 'officer2')}
                disabled={!dateSelected}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white/50 text-sm text-left mb-2
               disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 font-semibold text-slate-600
               flex justify-between items-center hover:bg-white/80 hover:shadow-sm transition-all shadow-purple-900/5 shadow-sm"
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
                <div className="absolute z-50 mt-1 w-full bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
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

            <input type="tel" name="officer2Phone" value={assignmentForm.officer2Phone} onChange={handlePhoneChange} placeholder="Phone (optional override)" className="w-full px-3 py-2 border border-slate-200  bg-white/50 rounded-lg mb-2 text-sm outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-fuchsia-500/50" />
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
              className="w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg text-sm outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-fuchsia-500/50"
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
          <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm relative z-20">
            <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-3">Team Leader 1</h3>

            <div className="relative" ref={tl1Ref}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'tl1' ? null : 'tl1')}
                disabled={!dateSelected}
                className="w-full px-3 py-2 border border-slate-200  rounded-xl bg-white/50 text-sm text-left mb-2
               disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 font-semibold text-slate-600
               flex justify-between items-center hover:bg-white/80 hover:shadow-sm transition-all shadow-purple-900/5 shadow-sm"
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
                <div className="absolute z-50 mt-1 w-full bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
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
              className="w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg mb-2 text-sm outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-fuchsia-500/50"
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
              className="w-full px-3 py-2 border border-slate-200 bg-white/50 rounded-lg text-sm outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-fuchsia-500/50"
              required
            >
              <option value="">Select Shift</option>
              <option value="I" disabled={assignmentForm.tl2Shift === 'I'}>Shift I</option>
              <option value="II" disabled={assignmentForm.tl2Shift === 'II'}>Shift II</option>
            </select>
          </div>

          {/* TEAM LEADER 2 */}
          <div className="bg-white/30 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm relative z-10">
            <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-3">Team Leader 2</h3>

            <div className="relative" ref={tl2Ref}>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'tl2' ? null : 'tl2')}
                disabled={!dateSelected}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white/50 text-sm text-left mb-2
               disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 font-semibold text-slate-600
               flex justify-between items-center hover:bg-white/80 hover:shadow-sm transition-all shadow-purple-900/5 shadow-sm"
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
                <div className="absolute z-50 mt-1 w-full bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-2xl shadow-purple-900/20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
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
              className="w-full px-3 py-2 border border-slate-200  bg-white/50 rounded-lg mb-2 text-sm outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-fuchsia-500/50"
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
              className="w-full px-3 py-2 border border-slate-200  bg-white/50 rounded-lg text-sm outline-none transition-all hover:bg-white/80 focus:ring-2 focus:ring-fuchsia-500/50"
              required
            >
              <option value="">Select Shift</option>
              <option value="I" disabled={assignmentForm.tl1Shift === 'I'}>Shift I</option>
              <option value="II" disabled={assignmentForm.tl1Shift === 'II'}>Shift II</option>
            </select>
          </div>
        </div>



        <button type="submit" className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white py-3 lg:py-4 rounded-xl font-bold hover:from-fuchsia-700 hover:to-purple-700 transition-all duration-300 text-sm lg:text-base shadow-lg hover:shadow-xl shadow-fuchsia-900/20 transform hover:-translate-y-0.5">
          {editingId ? 'Update Assignment' : 'Create Assignment'}
        </button>
      </form>

      <div className="mt-6 border-t border-fuchsia-200 pt-6">
        <h3 className="text-xl font-bold text-fuchsia-800 mb-4">Bulk Upload (Excel)</h3>
        <form onSubmit={handleBulkUpload} className="space-y-4">
          <input type="file" accept=".xlsx, .xls" onChange={(e) => setBulkFile(e.target.files[0])} className="w-full px-3 py-2 border border-white/50 bg-gray-200 rounded-xl text-sm cursor-pointer" />
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
            <DocumentArrowUpIcon className="h-5 w-5" />
            <span>Upload Bulk Assignments</span>
          </button>
        </form>
      </div>
    </div>
  );





  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans text-slate-800">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm z-20 w-full flex-shrink-0 sticky top-0">
          <div className=" mx-auto px-4 sm:px-6 lg:px-8 flex justify-start">
            <div className="flex justify-start py-4">
              <button
                onClick={handleBack}
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <ArrowLeftIcon className="h-5 w-5 text-slate-600 group-hover:text-fuchsia-700 transition-colors" />
                <span className="font-semibold text-slate-700 group-hover:text-fuchsia-900 transition-colors">Back to Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-hidden min-h-0">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center space-x-2 animate-shake">
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 max-w-9xl mx-auto">
            {renderAssignmentForm()}
          </div>

        </main>
      </div>
      {/* Reusable Modal for alerts & confirmations */}
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


      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
//         }
//         .animate-blob { animation: blob 7s infinite; }
//         .animation-delay-2000 { animation-delay: 2s; }
//         .animation-delay-4000 { animation-delay: 4s; }
//       `}</style>


    </div>
  );
};

export default DailyAssignmentPage;