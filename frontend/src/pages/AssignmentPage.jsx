// DailyAssignmentPage.jsx
// Updated: Dynamically fetch users by role from API instead of hardcoded.
// Fetches on mount, and selects now use real data.
// Added loading states for better UX.
// Modified: Account Officer changed to 4-digit number input with validation.
// Added start and end time fields for Assigned Officer 1 and 2.
// Fixed: Table display accesses flat time fields from Assignment.
// Fixed: Account Officer always shows name if found, else raw 4-digit ID.
// Added: Time format conversion to 12-hour AM/PM.
// Updated: Team Leaders optional (at least one required).
// Fixed: Send null for tl1/tl2 if not selected to avoid empty string issues.
// Fixed: Prevent selecting the same person twice for officers and team leaders (UX + backend safety).
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, CheckIcon, ArrowLeftIcon, PhoneIcon } from '@heroicons/react/24/outline';

const formatTimeToAMPM = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
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
    date: '2025-12-01',
    branchName: '',
    accountOfficerEmployeeId: '',
    officer1: { id: '', name: '', phone: '', startTime: '', endTime: '' },
    officer2: { id: '', name: '', phone: '', startTime: '', endTime: '' },
    tl1: { id: '', name: '', phone: '' },
    tl2: { id: '', name: '', phone: '' }
  });
  const [assignments, setAssignments] = useState([]);
  const [assignedOfficers, setAssignedOfficers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSelectChange = (field, value) => {
    const selectedUser = assignedOfficers.find(u => u.id === value) ||
                         teamLeaders.find(u => u.id === value);
    setAssignmentForm(prev => ({
      ...prev,
      [field]: { 
        id: value, 
        name: selectedUser?.name || '', 
        phone: selectedUser?.phone || '',
        ...(field === 'officer1' || field === 'officer2' ? { startTime: '', endTime: '' } : {})
      }
    }));
  };

  const handlePhoneChange = (e) => {
    const field = e.target.name.replace('Phone', '');
    setAssignmentForm(prev => ({
      ...prev,
      [field]: { ...prev[field], phone: e.target.value }
    }));
  };

  const handleTimeChange = (e) => {
    const field = e.target.name.replace(/StartTime|EndTime/, '');
    const subfield = e.target.name.includes('StartTime') ? 'startTime' : 'endTime';
    setAssignmentForm(prev => ({
      ...prev,
      [field]: { ...prev[field], [subfield]: e.target.value }
    }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (
      !assignmentForm.date ||
      !assignmentForm.branchName ||
      !assignmentForm.accountOfficerEmployeeId.trim() ||
      !/^\d{4}$/.test(assignmentForm.accountOfficerEmployeeId.trim()) ||
      !assignmentForm.officer1.id ||
      !assignmentForm.officer1.startTime ||
      !assignmentForm.officer1.endTime ||
      !assignmentForm.officer2.id ||
      !assignmentForm.officer2.startTime ||
      !assignmentForm.officer2.endTime ||
      (!assignmentForm.tl1.id && !assignmentForm.tl2.id)
    ) {
      alert('Please fill all required fields. Account Officer ID must be exactly 4 digits. At least one Team Leader is required.');
      return;
    }

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: assignmentForm.date,
          branchName: assignmentForm.branchName,
          accountOfficerId: assignmentForm.accountOfficerEmployeeId.trim(),
          officer1Id: assignmentForm.officer1.id,
          officer1StartTime: assignmentForm.officer1.startTime,
          officer1EndTime: assignmentForm.officer1.endTime,
          officer1Phone: assignmentForm.officer1.phone || null,
          officer2Id: assignmentForm.officer2.id,
          officer2StartTime: assignmentForm.officer2.startTime,
          officer2EndTime: assignmentForm.officer2.endTime,
          officer2Phone: assignmentForm.officer2.phone || null,
          tl1Id: assignmentForm.tl1.id || null,
          tl1Phone: assignmentForm.tl1.id ? (assignmentForm.tl1.phone || null) : null,
          tl2Id: assignmentForm.tl2.id || null,
          tl2Phone: assignmentForm.tl2.id ? (assignmentForm.tl2.phone || null) : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assignment');
      }

      const newAssignment = await response.json();
      setAssignments([newAssignment, ...assignments]);
      alert(`Assignment for ${assignmentForm.date} added successfully!`);

      // Reset form
      setAssignmentForm({
        date: '2025-12-01',
        branchName: '',
        accountOfficerEmployeeId: '',
        officer1: { id: '', name: '', phone: '', startTime: '', endTime: '' },
        officer2: { id: '', name: '', phone: '', startTime: '', endTime: '' },
        tl1: { id: '', name: '', phone: '' },
        tl2: { id: '', name: '', phone: '' }
      });
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert(error.message);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const renderAssignmentForm = () => (
    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="flex items-center space-x-3 mb-5 lg:mb-6">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
          <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">New Daily Assignment</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-2 text-sm text-gray-600">Loading users...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p className="mb-2">{error}</p>
          <button onClick={fetchAllUsers} className="text-sm underline">Retry</button>
        </div>
      ) : (
        <form onSubmit={handleAssignSubmit} className="space-y-4 lg:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Date *</label>
            <input
              type="date"
              name="date"
              value={assignmentForm.date}
              onChange={handleFormChange}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Branch Name *</label>
            <input
              type="text"
              name="branchName"
              value={assignmentForm.branchName}
              onChange={handleFormChange}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
              placeholder="e.g., Addis Ababa Main"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Account Officer ID (4 digits) *</label>
            <input
              type="text"
              name="accountOfficerEmployeeId"
              value={assignmentForm.accountOfficerEmployeeId}
              onChange={handleFormChange}
              pattern="[0-9]{4}"
              maxLength="4"
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
              placeholder="e.g., 1234"
              required
            />
          </div>

          {/* Assigned Officer 1 */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Assigned Officer 1 *</label>
            <select
              value={assignmentForm.officer1.id}
              onChange={(e) => handleSelectChange('officer1', e.target.value)}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
              required
            >
              <option value="">Select Officer 1 *</option>
              {assignedOfficers.map(u => (
                <option 
                  key={u.id} 
                  value={u.id}
                  disabled={assignmentForm.officer2.id === u.id}
                >
                  {u.name} ({u.employeeId})
                </option>
              ))}
            </select>

            {assignmentForm.officer1.id && (
              <div className="mt-2 space-y-3">
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Phone Number for Officer 1 (optional override)
                  </label>
                  <input
                    type="tel"
                    name="officer1Phone"
                    value={assignmentForm.officer1.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
                    placeholder="e.g., 0912345680"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Start Time *</label>
                  <input type="time" name="officer1StartTime" value={assignmentForm.officer1.startTime} onChange={handleTimeChange} required className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">End Time *</label>
                  <input type="time" name="officer1EndTime" value={assignmentForm.officer1.endTime} onChange={handleTimeChange} required className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Assigned Officer 2 */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Assigned Officer 2 *</label>
            <select
              value={assignmentForm.officer2.id}
              onChange={(e) => handleSelectChange('officer2', e.target.value)}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
              required
            >
              <option value="">Select Officer 2 *</option>
              {assignedOfficers.map(u => (
                <option 
                  key={u.id} 
                  value={u.id}
                  disabled={assignmentForm.officer1.id === u.id}
                >
                  {u.name} ({u.employeeId})
                </option>
              ))}
            </select>

            {assignmentForm.officer2.id && (
              <div className="mt-2 space-y-3">
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">
                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Phone Number for Officer 2 (optional override)
                  </label>
                  <input
                    type="tel"
                    name="officer2Phone"
                    value={assignmentForm.officer2.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
                    placeholder="e.g., 0912345681"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Start Time *</label>
                  <input type="time" name="officer2StartTime" value={assignmentForm.officer2.startTime} onChange={handleTimeChange} required className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">End Time *</label>
                  <input type="time" name="officer2EndTime" value={assignmentForm.officer2.endTime} onChange={handleTimeChange} required className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Team Leader 1 */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Team Leader 1 (at least one required)</label>
            <select
              value={assignmentForm.tl1.id}
              onChange={(e) => handleSelectChange('tl1', e.target.value)}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
            >
              <option value="">Select Team Leader 1</option>
              {teamLeaders.map(u => (
                <option 
                  key={u.id} 
                  value={u.id}
                  disabled={assignmentForm.tl2.id === u.id}
                >
                  {u.name} ({u.employeeId})
                </option>
              ))}
            </select>

            {assignmentForm.tl1.id && (
              <div className="mt-2">
                <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">
                  <PhoneIcon className="h-4 w-4 mr-1 text-gray-500" />
                  Phone Number for Team Leader 1 (optional override)
                </label>
                <input
                  type="tel"
                  name="tl1Phone"
                  value={assignmentForm.tl1.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
                  placeholder="e.g., 0912345682"
                />
              </div>
            )}
          </div>

          {/* Team Leader 2 */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Team Leader 2 (optional)</label>
            <select
              value={assignmentForm.tl2.id}
              onChange={(e) => handleSelectChange('tl2', e.target.value)}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
            >
              <option value="">Select Team Leader 2</option>
              {teamLeaders.map(u => (
                <option 
                  key={u.id} 
                  value={u.id}
                  disabled={assignmentForm.tl1.id === u.id}
                >
                  {u.name} ({u.employeeId})
                </option>
              ))}
            </select>

            {assignmentForm.tl2.id && (
              <div className="mt-2">
                <label className="flex items-center text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">
                  <PhoneIcon className="h-4 w-4 mr-1 text-gray-500" />
                  Phone Number for Team Leader 2 (optional override)
                </label>
                <input
                  type="tel"
                  name="tl2Phone"
                  value={assignmentForm.tl2.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
                  placeholder="e.g., 0912345683"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 transform mt-2 lg:mt-4"
          >
            <span className="flex items-center justify-center space-x-2 text-sm sm:text-base">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Assign for Day</span>
            </span>
          </button>
        </form>
      )}
    </div>
  );

  const renderAssignmentsTable = () => (
    <div className={`bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-hidden flex flex-col min-h-0 ${!canEdit ? 'w-full' : ''}`}>
      <div className="flex items-center space-x-3 mb-5 lg:mb-6 pb-2">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
          <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">
          {canEdit ? 'Daily Assignments' : 'Daily Assignment View'}
        </h2>
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
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Time</th>
                <th className="px-2 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Officer 2</th>
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
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer1Phone || assignment.officer1?.phone || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{formatTimeToAMPM(assignment.officer1StartTime)} - {formatTimeToAMPM(assignment.officer1EndTime)}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer2?.name}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.officer2Phone || assignment.officer2?.phone || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{formatTimeToAMPM(assignment.officer2StartTime)} - {formatTimeToAMPM(assignment.officer2EndTime)}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl1?.name || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl1Phone || assignment.tl1?.phone || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl2?.name || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{assignment.tl2Phone || assignment.tl2?.phone || ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{new Date(assignment.date).toLocaleDateString()}</td>
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
        </main>
      </div>

      <footer className="bg-white/95 backdrop-blur-2xl border-t border-fuchsia-800/20 w-full flex-shrink-0 py-3 lg:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs lg:text-sm text-gray-600">
              © 2025 <span className="font-bold bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
                Commercial Bank of Ethiopia
              </span>. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-fuchsia-800/60">
              KYC Dashboard • Powered by LDAP Enterprise Authentication
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