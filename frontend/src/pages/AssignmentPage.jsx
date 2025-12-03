// DailyAssignmentPage.jsx
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
      const response = await fetch(`/api/users?role=${role}&status=0`);
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

    if (isOfficerAlreadyAssignedOnDate(assignmentForm.officer1Id, assignmentForm.officer1Shift, currentDate)) {
      alert(`Officer ${assignedOfficers.find(o => o.id === assignmentForm.officer1Id)?.name || ''} is already assigned to ${getShiftLabel(assignmentForm.officer1Shift)} on this date.`);
      return;
    }

    if (isOfficerAlreadyAssignedOnDate(assignmentForm.officer2Id, assignmentForm.officer2Shift, currentDate)) {
      alert(`Officer ${assignedOfficers.find(o => o.id === assignmentForm.officer2Id)?.name || ''} is already assigned to ${getShiftLabel(assignmentForm.officer2Shift)} on this date.`);
      return;
    }

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
      const response = await fetch(`/api/assignments/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `central_kyc_assignments.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert(error.message);
    }
  };

  const openEditModal = (assignment) => {
    setAssignmentForm({
      id: assignment.id || '',
      date: assignment.date.split('T')[0],
      branchId: assignment.branchId || '',
      branchName: assignment.branchName || '',
      accountOfficerEmployeeId: assignment.accountOfficerEmployeeId || '',
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

  const openViewModal = (assignment) => {
    setViewingAssignment(assignment);
    setShowViewModal(true);
  };

  const handleDeleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete assignment');
      }

      alert('Assignment deleted successfully!');
      fetchAssignments();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const renderAssignmentForm = () => (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 overflow-y-auto border border-fuchsia-200/50 flex-1 min-h-0">
      <h2 className="text-2xl lg:text-3xl font-black text-fuchsia-800 mb-6 flex items-center space-x-2">
        <CalendarIcon className="h-6 w-6 lg:h-8 lg:w-8" />
        <span>Daily Assignment</span>
      </h2>

      <form onSubmit={handleAssignSubmit} className="space-y-6">
        {/* Form remains 100% unchanged */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">Date *</label>
            <input type="date" name="date" value={assignmentForm.date} onChange={handleFormChange} className="w-full px-3 py-2 lg:py-3 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-sm lg:text-base" required />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">Branch *</label>
            <select name="branchId" value={assignmentForm.branchId} onChange={handleBranchSelect} className="w-full px-3 py-2 lg:py-3 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-sm lg:text-base" required>
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">Account Officer ID *</label>
            <input type="text" name="accountOfficerEmployeeId" value={assignmentForm.accountOfficerEmployeeId} onChange={handleFormChange} className="w-full px-3 py-2 lg:py-3 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-sm lg:text-base" maxLength={4} pattern="\d{4}" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <h3 className="text-base lg:text-lg font-bold text-emerald-800 mb-3">Officer 1 *</h3>
            <select name="officer1Id" value={assignmentForm.officer1Id} onChange={(e) => handleSelectChange('officer1', e.target.value)} className="w-full px-3 py-2 border border-emerald-300 rounded-lg mb-2 text-sm" required>
              <option value="">Select Officer</option>
              {assignedOfficers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input type="tel" name="officer1Phone" value={assignmentForm.officer1Phone} onChange={handlePhoneChange} placeholder="Phone (optional override)" className="w-full px-3 py-2 border border-emerald-300 rounded-lg mb-2 text-sm" />
            <select name="officer1Shift" value={assignmentForm.officer1Shift} onChange={handleShiftChange} className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm" required>
              <option value="">Select Shift</option>
              <option value="I">Shift I</option>
              <option value="II">Shift II</option>
            </select>
          </div>

          <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200">
            <h3 className="text-base lg:text-lg font-bold text-teal-800 mb-3">Officer 2 *</h3>
            <select name="officer2Id" value={assignmentForm.officer2Id} onChange={(e) => handleSelectChange('officer2', e.target.value)} className="w-full px-3 py-2 border border-teal-300 rounded-lg mb-2 text-sm" required>
              <option value="">Select Officer</option>
              {assignedOfficers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input type="tel" name="officer2Phone" value={assignmentForm.officer2Phone} onChange={handlePhoneChange} placeholder="Phone (optional override)" className="w-full px-3 py-2 border border-teal-300 rounded-lg mb-2 text-sm" />
            <select name="officer2Shift" value={assignmentForm.officer2Shift} onChange={handleShiftChange} className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm" required>
              <option value="">Select Shift</option>
              <option value="I">Shift I</option>
              <option value="II">Shift II</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200">
            <h3 className="text-base lg:text-lg font-bold text-purple-800 mb-3">Team Leader 1</h3>
            <select name="tl1Id" value={assignmentForm.tl1Id} onChange={(e) => handleSelectChange('tl1', e.target.value)} className="w-full px-3 py-2 border border-purple-300 rounded-lg mb-2 text-sm">
              <option value="">Select TL (optional)</option>
              {teamLeaders.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="tel" name="tl1Phone" value={assignmentForm.tl1Phone} onChange={handlePhoneChange} placeholder="Phone (optional override)" className="w-full px-3 py-2 border border-purple-300 rounded-lg mb-2 text-sm" />
            <select name="tl1Shift" value={assignmentForm.tl1Shift} onChange={handleShiftChange} className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm" disabled={!assignmentForm.tl1Id}>
              <option value="">Select Shift</option>
              <option value="I">Shift I</option>
              <option value="II">Shift II</option>
            </select>
          </div>

          <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-200">
            <h3 className="text-base lg:text-lg font-bold text-pink-800 mb-3">Team Leader 2</h3>
            <select name="tl2Id" value={assignmentForm.tl2Id} onChange={(e) => handleSelectChange('tl2', e.target.value)} className="w-full px-3 py-2 border border-pink-300 rounded-lg mb-2 text-sm">
              <option value="">Select TL (optional)</option>
              {teamLeaders.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="tel" name="tl2Phone" value={assignmentForm.tl2Phone} onChange={handlePhoneChange} placeholder="Phone (optional override)" className="w-full px-3 py-2 border border-pink-300 rounded-lg mb-2 text-sm" />
            <select name="tl2Shift" value={assignmentForm.tl2Shift} onChange={handleShiftChange} className="w-full px-3 py-2 border border-pink-300 rounded-lg text-sm" disabled={!assignmentForm.tl2Id}>
              <option value="">Select Shift</option>
              <option value="I">Shift I</option>
              <option value="II">Shift II</option>
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

  const renderAssignmentsTable = () => (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 overflow-y-auto border border-fuchsia-200/50 flex-1 min-h-0">
      <h2 className="text-2xl lg:text-3xl font-black text-fuchsia-800 mb-6">Current Assignments</h2>
      <div className="mt-6 mb-4 flex space-x-4">
        <button onClick={() => handleExport('excel')} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Export to Excel</span>
        </button>
        <button onClick={() => handleExport('csv')} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Export to CSV</span>
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-8 flex-1 flex items-center justify-center">
          <div className="space-y-2">
            <CheckIcon className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500">No assignments yet. Create one!</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-fuchsia-200 text-xs">
            <thead className="bg-fuchsia-100">
              <tr>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Branch Name</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Account Officer</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Assigned Officer 1</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Phone Number</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Shift</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Assigned Officer 2</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Phone Number</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Shift</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Assigned Team Leader 1</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Phone Number</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Shift</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Assigned Team Leader 2</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Shift</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Phone Number</th>
                <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Date</th>
                {canEdit && <th className="px-2 py-3 text-left font-bold text-fuchsia-900">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-fuchsia-100">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-fuchsia-50/50 transition-colors">
                  <td className="px-2 py-3 whitespace-nowrap">{a.branchName}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.accountOfficerEmployeeId}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.officer1?.name || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.officer1Phone || a.officer1?.phone || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{getShiftLabel(a.officer1Shift)}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.officer2?.name || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.officer2Phone || a.officer2?.phone || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{getShiftLabel(a.officer2Shift)}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.tl1?.name || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.tl1Phone || a.tl1?.phone || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{getShiftLabel(a.tl1Shift)}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.tl2?.name || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{getShiftLabel(a.tl2Shift)}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{a.tl2Phone || a.tl2?.phone || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap">{formatDate(a.date)}</td>
                  {canEdit && (
                    <td className="px-2 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <button onClick={() => openViewModal(a)} className="text-indigo-600 hover:text-indigo-900 p-1" title="View">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEditModal(a)} className="text-blue-600 hover:text-blue-900 p-1" title="Edit">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteAssignment(a.id)} className="text-red-600 hover:text-red-900 p-1" title="Delete">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

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
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Assignment Details</h3>
          <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-fuchsia-800 mb-2">{formatDate(viewingAssignment.date)}</h3>
            <p className="text-lg text-gray-600">Assignment ID: {viewingAssignment.id.slice(0, 8)}...</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
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