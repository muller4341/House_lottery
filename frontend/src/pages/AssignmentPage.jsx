// DailyAssignmentPage.jsx
// Export Excel button is already fully implemented and working (server-side export via API).
// No changes needed for export - it was already there and perfect.
// Only fixed: function order + one tiny className typo.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, CheckIcon, ArrowLeftIcon, ArrowDownTrayIcon, DocumentArrowUpIcon, PencilIcon, EyeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

const DailyAssignmentPage = () => {
  const navigate = useNavigate();
  const [user] = useState({
    employeeId: "070875",
    displayName: "Muluken Walle Hibste",
    fullName: "Muluken Walle Hibste",
    email: "mulukenwalle@cbe.com.et",
    department: "KYC Department",
    title: "Central KYC Manager",
    role: "CENTRAL_KYC_MANAGER",
    isAdmin: true
  });
  const canEdit = ['CENTRAL_KYC_MANAGER', 'TEAM_LEADER'].includes(user.role);
  const [assignmentForm, setAssignmentForm] = useState({
    id: '',
    date: '2025-12-02',
    branchId: '',
    branchName: '',
    accountOfficerEmployeeId: '',
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [editingId, setEditingId] = useState(null);

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
      const response = await fetch(`/api/users?role=${role}`);
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

  const handleFormChange = (e) => {
    setAssignmentForm({
      ...assignmentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleBranchSelect = (e) => {
    const branchId = e.target.value;
    const selected = branches.find(b => b.id === branchId);
    setAssignmentForm(prev => ({
      ...prev,
      branchId,
      branchName: selected?.name || '',
      accountOfficerEmployeeId: selected?.accountOfficerId || ''
    }));
  };

  const handleSelectChange = (field, value) => {
    const selectedUser = assignedOfficers.find(u => u.id === value) ||
                         teamLeaders.find(u => u.id === value);
    setAssignmentForm(prev => ({
      ...prev,
      [`${field}Id`]: value,
      [`${field}Phone`]: selectedUser?.phone || ''
    }));
  };

  const handlePhoneChange = (e) => {
    const field = e.target.name.replace('Phone', '');
    setAssignmentForm(prev => ({
      ...prev,
      [`${field}Phone`]: e.target.value
    }));
  };

  const handleShiftChange = (e) => {
    const field = e.target.name.replace('Shift', '');
    setAssignmentForm(prev => ({
      ...prev,
      [`${field}Shift`]: e.target.value
    }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (
      !assignmentForm.date ||
      !assignmentForm.branchId ||
      !assignmentForm.accountOfficerEmployeeId.trim() ||
      !/^\d{4}$/.test(assignmentForm.accountOfficerEmployeeId.trim()) ||
      !assignmentForm.officer1Id ||
      !assignmentForm.officer1Shift ||
      !assignmentForm.officer2Id ||
      !assignmentForm.officer2Shift ||
      (!assignmentForm.tl1Id && !assignmentForm.tl2Id) ||
      (assignmentForm.tl1Id && !assignmentForm.tl1Shift) ||
      (assignmentForm.tl2Id && !assignmentForm.tl2Shift)
    ) {
      alert('Please fill all required fields. Account Officer ID must be exactly 4 digits. At least one Team Leader with shift is required.');
      return;
    }

    const url = editingId ? `/api/assignments/${editingId}` : '/api/assignments';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: assignmentForm.date,
          branchId: assignmentForm.branchId,
          officer1Id: assignmentForm.officer1Id,
          officer1Shift: assignmentForm.officer1Shift,
          officer1Phone: assignmentForm.officer1Phone || null,
          officer2Id: assignmentForm.officer2Id,
          officer2Shift: assignmentForm.officer2Shift,
          officer2Phone: assignmentForm.officer2Phone || null,
          tl1Id: assignmentForm.tl1Id || null,
          tl1Shift: assignmentForm.tl1Id ? assignmentForm.tl1Shift : null,
          tl1Phone: assignmentForm.tl1Id ? (assignmentForm.tl1Phone || null) : null,
          tl2Id: assignmentForm.tl2Id || null,
          tl2Shift: assignmentForm.tl2Id ? assignmentForm.tl2Shift : null,
          tl2Phone: assignmentForm.tl2Id ? (assignmentForm.tl2Phone || null) : null
        })

      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save assignment');
      }

      alert(editingId ? 'Assignment updated successfully!' : 'Assignment created successfully!');
      setAssignmentForm({
        id: '',
        date: '2025-12-02',
        branchId: '',
        branchName: '',
        accountOfficerEmployeeId: '',
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

  const handleEdit = (assignment) => {
    setAssignmentForm({
      id: assignment.id,
      date: assignment.date.split('T')[0],
      branchId: assignment.branchId,
      branchName: assignment.branchName,
      accountOfficerEmployeeId: assignment.accountOfficerEmployeeId,
      officer1Id: assignment.officer1Id || '',
      officer1Shift: assignment.officer1Shift || '',
      officer1Phone: assignment.officer1Phone || assignment.officer1?.phone || '',
      officer2Id: assignment.officer2Id || '',
      officer2Shift: assignment.officer2Shift || '',
      officer2Phone: assignment.officer2Phone || assignment.officer2?.phone || '',
      tl1Id: assignment.tl1Id || '',
      tl1Shift: assignment.tl1Shift || '',
      tl1Phone: assignment.tl1Phone || assignment.tl1?.phone || '',
      tl2Id: assignment.tl2Id || '',
      tl2Shift: assignment.tl2Shift || '',
      tl2Phone: assignment.tl2Phone || assignment.tl2?.phone || ''
    });
    setEditingId(assignment.id);
    setShowEditModal(true);
  };

  const handleView = (assignment) => {
    setViewingAssignment(assignment);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const response = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }
      alert('Assignment deleted successfully!');
      fetchAssignments();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert('Please select an Excel file');
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
        throw new Error('Bulk upload failed');
      }
      alert('Bulk assignments uploaded successfully!');
      setBulkFile(null);
      fetchAssignments();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/assignments/export?format=excel');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'central_kyc_assignments.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  // All render functions moved ABOVE return() to fix ReferenceError
  const renderAssignmentForm = () => (
    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-y-auto max-h-[80vh]">
      <div className="flex items-center space-x-3 mb-5 lg:mb-6 pb-2">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
          <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">Create Daily Assignment</h2>
      </div>
      <form onSubmit={handleAssignSubmit} className="space-y-4 lg:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Date *</label>
          <input type="date" name="date" value={assignmentForm.date} onChange={handleFormChange} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" required />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Branch *</label>
          <select 
            value={assignmentForm.branchId} 
            onChange={handleBranchSelect}
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
            required
          >
            <option value="">Select Branch</option>
            {branches
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Account Officer ID (4 digits) *</label>
          <input type="text" name="accountOfficerEmployeeId" value={assignmentForm.accountOfficerEmployeeId} onChange={handleFormChange} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" placeholder="e.g., 1234" required />
        </div>

        <div className="space-y-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700">Assigned Officer 1 *</label>
          <select value={assignmentForm.officer1Id} onChange={(e) => handleSelectChange('officer1', e.target.value)} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" required>
            <option value="">Select Officer</option>
            {assignedOfficers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {assignmentForm.officer1Id && (
            <>
              <input type="tel" name="officer1Phone" value={assignmentForm.officer1Phone} onChange={handlePhoneChange} placeholder="Phone (override)" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" />
              <select name="officer1Shift" value={assignmentForm.officer1Shift} onChange={handleShiftChange} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" required>
                <option value="">Select Shift</option>
                <option value="I">Shift I</option>
                <option value="II">Shift II</option>
              </select>
            </>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700">Assigned Officer 2 *</label>
          <select value={assignmentForm.officer2Id} onChange={(e) => handleSelectChange('officer2', e.target.value)} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" required>
            <option value="">Select Officer</option>
            {assignedOfficers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {assignmentForm.officer2Id && (
            <>
              <input type="tel" name="officer2Phone" value={assignmentForm.officer2Phone} onChange={handlePhoneChange} placeholder="Phone (override)" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" />
              <select name="officer2Shift" value={assignmentForm.officer2Shift} onChange={handleShiftChange} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" required>
                <option value="">Select Shift</option>
                <option value="I">Shift I</option>
                <option value="II">Shift II</option>
              </select>
            </>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700">Team Leader 1</label>
          <select value={assignmentForm.tl1Id} onChange={(e) => handleSelectChange('tl1', e.target.value)} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm">
            <option value="">Select Team Leader</option>
            {teamLeaders.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {assignmentForm.tl1Id && (
            <>
              <input type="tel" name="tl1Phone" value={assignmentForm.tl1Phone} onChange={handlePhoneChange} placeholder="Phone (override)" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" />
              <select name="tl1Shift" value={assignmentForm.tl1Shift} onChange={handleShiftChange} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" required>
                <option value="">Select Shift</option>
                <option value="I">Shift I</option>
                <option value="II">Shift II</option>
              </select>
            </>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700">Team Leader 2</label>
          <select value={assignmentForm.tl2Id} onChange={(e) => handleSelectChange('tl2', e.target.value)} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm">
            <option value="">Select Team Leader</option>
            {teamLeaders.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {assignmentForm.tl2Id && (
            <>
              <input type="tel" name="tl2Phone" value={assignmentForm.tl2Phone} onChange={handlePhoneChange} placeholder="Phone (override)" className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" />
              <select name="tl2Shift" value={assignmentForm.tl2Shift} onChange={handleShiftChange} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" required>
                <option value="">Select Shift</option>
                <option value="I">Shift I</option>
                <option value="II">Shift II</option>
              </select>
            </>
          )}
        </div>

        <button type="submit" className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          {editingId ? 'Update Assignment' : 'Create Assignment'}
        </button>
      </form>

      {canEdit && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-fuchsia-300/30">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
            Bulk Upload (Excel)
          </h3>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={(e) => setBulkFile(e.target.files[0])} 
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-100 mb-2"
          />
          <button 
            onClick={handleBulkUpload} 
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 transition-all duration-300 text-sm font-semibold"
          >
            Upload Excel (Single/Bulk)
          </button>
        </div>
      )}
    </div>
  );

  const renderAssignmentsTable = () => (
    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-hidden flex flex-col min-h-0 max-h-[80vh]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 lg:mb-6 pb-2 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
            <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">Daily Assignments</h2>
        </div>
        <button onClick={handleExport} className="flex items-center space-x-2 px-3 py-2 !bg-fuchsia-600 !text-white rounded-lg !hover:bg-fuchsia-700 transition-colors text-sm self-start sm:self-auto">
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>Export Excel</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-fuchsia-200">
            <thead className="bg-fuchsia-50 sticky top-0">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Branch Name</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Account Officer</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Officer 1</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Shift</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Officer 2</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Shift</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Team Leader 1</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Shift</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Team Leader 2</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Shift</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Date</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-fuchsia-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-fuchsia-50 transition-colors duration-200">
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{assignment.branchName}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.accountOfficerEmployeeId}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer1?.name}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer1Phone || assignment.officer1?.phone || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{getShiftLabel(assignment.officer1Shift)}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer2?.name}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer2Phone || assignment.officer2?.phone || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{getShiftLabel(assignment.officer2Shift)}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl1?.name || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl1Phone || assignment.tl1?.phone || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{getShiftLabel(assignment.tl153Shift)}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl2?.name || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl2Phone || assignment.tl2?.phone || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{getShiftLabel(assignment.tl2Shift)}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{formatDate(assignment.date)}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleView(assignment)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button onClick={() => handleEdit(assignment)} className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(assignment.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {assignments.length === 0 && !loading && (
          <div className="text-center py-8 flex-1 flex items-center justify-center">
            <div className="space-y-2">
              <CheckIcon className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="text-sm text-gray-500">No assignments yet. {canEdit ? 'Add one above!' : 'Contact your administrator.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEditModal = () => showEditModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/98 rounded-3xl shadow-2xl border border-fuchsia-800/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <PencilIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Edit Daily Assignment</h3>
            </div>
            <button onClick={() => { setShowEditModal(false); setEditingId(null); }} className="p-3 hover:bg-gray-100 rounded-full transition-all">
              <XMarkIcon className="h-7 w-7 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleAssignSubmit} className="space-y-6">
            {/* Edit modal form - unchanged */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input type="date" name="date" value={assignmentForm.date} onChange={handleFormChange} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch *</label>
              <select value={assignmentForm.branchId} onChange={handleBranchSelect} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" required>
                <option value="">Select Branch</option>
                {branches
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Officer ID (4 digits) *</label>
              <input type="text" name="accountOfficerEmployeeId" value={assignmentForm.accountOfficerEmployeeId} onChange={handleFormChange} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" placeholder="e.g., 1234" required />
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200">
                <label className="block text-lg font-bold text-emerald-800 mb-3">Assigned Officer 1 *</label>
                <div className="space-y-3">
                  <select value={assignmentForm.officer1Id} onChange={(e) => handleSelectChange('officer1', e.target.value)} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" required>
                    <option value="">Select Officer</option>
                    {assignedOfficers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  {assignmentForm.officer1Id && (
                    <>
                      <input type="tel" name="officer1Phone" value={assignmentForm.officer1Phone} onChange={handlePhoneChange} placeholder="Phone (override)" className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" />
                      <select name="officer1Shift" value={assignmentForm.officer1Shift} onChange={handleShiftChange} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" required>
                        <option value="">Select Shift</option>
                        <option value="I">Shift I</option>
                        <option value="II">Shift II</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-teal-50/70 rounded-2xl p-5 border border-teal-200">
                <label className="block text-lg font-bold text-teal-800 mb-3">Assigned Officer 2 *</label>
                <div className="space-y-3">
                  <select value={assignmentForm.officer2Id} onChange={(e) => handleSelectChange('officer2', e.target.value)} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" required>
                    <option value="">Select Officer</option>
                    {assignedOfficers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  {assignmentForm.officer2Id && (
                    <>
                      <input type="tel" name="officer2Phone" value={assignmentForm.officer2Phone} onChange={handlePhoneChange} placeholder="Phone (override)" className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" />
                      <select name="officer2Shift" value={assignmentForm.officer2Shift} onChange={handleShiftChange} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" required>
                        <option value="">Select Shift</option>
                        <option value="I">Shift I</option>
                        <option value="II">Shift II</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-purple-50/70 rounded-2xl p-5 border border-purple-200">
                <label className="block text-lg font-bold text-purple-800 mb-3">Team Leader 1</label>
                <div className="space-y-3">
                  <select value={assignmentForm.tl1Id} onChange={(e) => handleSelectChange('tl1', e.target.value)} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400">
                    <option value="">Select Team Leader</option>
                    {teamLeaders.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  {assignmentForm.tl1Id && (
                    <>
                      <input type="tel" name="tl1Phone" value={assignmentForm.tl1Phone} onChange={handlePhoneChange} placeholder="Phone (override)" className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" />
                      <select name="tl1Shift" value={assignmentForm.tl1Shift} onChange={handleShiftChange} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" required>
                        <option value="">Select Shift</option>
                        <option value="I">Shift I</option>
                        <option value="II">Shift II</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-pink-50/70 rounded-2xl p-5 border border-pink-200">
                <label className="block text-lg font-bold text-pink-800 mb-3">Team Leader 2</label>
                <div className="space-y-3">
                  <select value={assignmentForm.tl2Id} onChange={(e) => handleSelectChange('tl2', e.target.value)} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400">
                    <option value="">Select Team Leader</option>
                    {teamLeaders.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  {assignmentForm.tl2Id && (
                    <>
                      <input type="tel" name="tl2Phone" value={assignmentForm.tl2Phone} onChange={handlePhoneChange} placeholder="Phone (override)" className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" />
                      <select name="tl2Shift" value={assignmentForm.tl2Shift} onChange={handleShiftChange} className="w-full px-4 py-3 border border-fuchsia-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400" required>
                        <option value="">Select Shift</option>
                        <option value="I">Shift I</option>
                        <option value="II">Shift II</option>
                      </select>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                Update Assignment
              </button>
              <button type="button" onClick={() => { setShowEditModal(false); setEditingId(null); }} className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all duration-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderViewModal = () => showViewModal && viewingAssignment && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-fuchsia-800/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <EyeIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Assignment Details</h3>
            </div>
            <button onClick={() => setShowViewModal(false)} className="p-3 hover:bg-gray-100 rounded-full transition-all">
              <XMarkIcon className="h-7 w-7 text-gray-500" />
            </button>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-3xl p-8 border border-fuchsia-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 font-semibold">Date</p>
                <p className="text-2xl font-bold text-fuchsia-800">{formatDate(viewingAssignment.date)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 font-semibold">Branch</p>
                <p className="text-xl font-bold text-fuchsia-800">{viewingAssignment.branchName}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 font-semibold">AO ID</p>
                <p className="text-xl font-bold text-fuchsia-800">{viewingAssignment.accountOfficerEmployeeId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-emerald-200">
                <h4 className="text-xl font-black text-emerald-800 mb-4">Officer 1</h4>
                <div className="space-y-3 text-lg">
                  <p><span className="font-semibold text-gray-700">Name:</span> {viewingAssignment.officer1?.name || '-'}</p>
                  <p><span className="font-semibold text-gray-700">Phone:</span> {viewingAssignment.officer1Phone || viewingAssignment.officer1?.phone || '-'}</p>
                  <p><span className="font-semibold text-gray-700">Shift:</span> {getShiftLabel(viewingAssignment.officer1Shift)}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-6 border-2 border-teal-200">
                <h4 className="text-xl font-black text-teal-800 mb-4">Officer 2</h4>
                <div className="space-y-3 text-lg">
                  <p><span className="font-semibold text-gray-700">Name:</span> {viewingAssignment.officer2?.name || '-'}</p>
                  <p><span className="font-semibold text-gray-700">Phone:</span> {viewingAssignment.officer2Phone || viewingAssignment.officer2?.phone || '-'}</p>
                  <p><span className="font-semibold text-gray-700">Shift:</span> {getShiftLabel(viewingAssignment.officer2Shift)}</p>
                </div>
              </div>

              {viewingAssignment.tl1Id && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-200">
                  <h4 className="text-xl font-black text-purple-800 mb-4">Team Leader 1</h4>
                  <div className="space-y-3 text-lg">
                    <p><span className="font-semibold text-gray-700">Name:</span> {viewingAssignment.tl1?.name || '-'}</p>
                    <p><span className="font-semibold text-gray-700">Phone:</span> {viewingAssignment.tl1Phone || viewingAssignment.tl1?.phone || '-'}</p>
                    <p><span className="font-semibold text-gray-700">Shift:</span> {getShiftLabel(viewingAssignment.tl1Shift)}</p>
                  </div>
                </div>
              )}

              {viewingAssignment.tl2Id && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-6 border-2 border-pink-200">
                  <h4 className="text-xl font-black text-pink-800 mb-4">Team Leader 2</h4>
                  <div className="space-y-3 text-lg">
                    <p><span className="font-semibold text-gray-700">Name:</span> {viewingAssignment.tl2?.name || '-'}</p>
                    <p><span className="font-semibold text-gray-700">Phone:</span> {viewingAssignment.tl2Phone || viewingAssignment.tl2?.phone || '-'}</p>
                    <p><span className="font-semibold text-gray-700">Shift:</span> {getShiftLabel(viewingAssignment.tl2Shift)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>;
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
          {error && <div className="text-red-600 text-center mb-4 p-4 bg-red-50 rounded-lg">{error}</div>}
          {canEdit ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {renderAssignmentForm()}
              {renderAssignmentsTable()}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:gap-6">
              {renderAssignmentsTable()}
            </div>
          )}
          {renderEditModal()}
          {renderViewModal()}
        </main>
      </div>

      <footer className="bg-white/95 backdrop-blur-2xl border-t border-fuchsia-800/20 w-full flex-shrink-0 py-3 lg:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs lg:text-sm text-gray-600">
              © 2025 <span className="font-bold bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
                Commercial Bank of Ethiopia - የኢትዮጵያ ንግድ ባንክ
              </span>. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-fuchsia-800/60">
              Central KYC Portal • Powered by LDAP Enterprise Authentication
            </p>
          </div>
        </div>
      </footer>

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

export default DailyAssignmentPage;