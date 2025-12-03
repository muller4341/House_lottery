// AddUserPage.jsx
// Updated: Removed ACCOUNT_OFFICER from roles array (non-relational ID).
// Retained responsive design, table with capitalized roles.
// Added: Actions column with Edit/Delete buttons.
// Edit: Simple modal form (prefill, PUT /api/users/:id).
// Delete: Confirm + DELETE /api/users/:id.
// No other changes to UI/form.
// Fixes: Enhanced error handling in add/edit for backend errors (parse json). Modal buttons: Added min-width/padding for text visibility. After update: Ensure modal closes + table refresh. Add: Improved fetch error logging. Fixed white screen: Added loading state during fetch, prevent re-render issues by using functional updates and key on table.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, CheckIcon, ArrowLeftIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateStr));
};

const AddUserPage = () => {
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

  const canEdit = user.role === 'CENTRAL_KYC_MANAGER';

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex items-center justify-center">
        <div className="text-center p-8">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only Central KYC Managers can add users.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-fuchsia-600 text-white px-6 py-2 rounded-lg hover:bg-fuchsia-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const [userForm, setUserForm] = useState({
    employeeId: '',
    name: '',
    role: '',
    phone: ''
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);  // New: Loading state to prevent white screen
  const [editingUser, setEditingUser] = useState(null);  // New: For edit modal
  const [showEditModal, setShowEditModal] = useState(false);  // New: Edit modal state

  const roles = [
    { value: 'OFFICER', label: 'Officer' },
    { value: 'TEAM_LEADER', label: 'Team Leader' },
    { value: 'CENTRAL_KYC_MANAGER', label: 'Central KYC Manager' }
  ];

  const handleFormChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userForm.employeeId || !userForm.name || !userForm.role) {
      alert('Please fill required fields.');
      return;
    }

    setLoading(true);  // Show loading
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Add user error:', response.status, errorData);  // Log for debug
        throw new Error(errorData.error || `Failed to add user (Status: ${response.status})`);
      }

      const newUser = await response.json();
      setUsers(prev => [newUser, ...prev]);  // Functional update
      alert(`User ${userForm.name} added successfully!`);
      setUserForm({ employeeId: '', name: '', role: '', phone: '' });
    } catch (error) {
      console.error('Error adding user:', error);
      alert(`Failed to add user: ${error.message}. Please check console for details.`);
    } finally {
      setLoading(false);  // Hide loading
      fetchUsers();  // Refresh table
    }
  };

  const handleEditUser = async (e) => {  // New: Edit submit
    e.preventDefault();
    if (!userForm.employeeId || !userForm.name || !userForm.role) {
      alert('Please fill required fields.');
      return;
    }

    setLoading(true);  // Show loading
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Edit user error:', response.status, errorData);  // Log for debug
        throw new Error(errorData.error || `Failed to update user (Status: ${response.status})`);
      }

      const updatedUser = await response.json();
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));  // Functional update
      alert(`User ${userForm.name} updated successfully!`);
      setUserForm({ employeeId: '', name: '', role: '', phone: '' });
      setEditingUser(null);
      setShowEditModal(false);  // Close modal after alert (before OK click)
      // No need for navigate('/add-user') as we're already on the page; just refresh
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error.message}. Please check console for details.`);
    } finally {
      setLoading(false);  // Hide loading
      fetchUsers();  // Refresh table to ensure page loads
    }
  };

  const handleDeleteUser = async (userId) => {  // New: Delete
    if (!confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);  // Show loading
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete user');
      }

      setUsers(prev => prev.filter(u => u.id !== userId));  // Functional update
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
      fetchUsers();  // Refresh table
    }
  };

  const openEditModal = (u) => {  // New: Open edit
    setEditingUser(u);
    setUserForm({
      employeeId: u.employeeId,
      name: u.name,
      role: u.role,
      phone: u.phone || ''
    });
    setShowEditModal(true);
  };

  const fetchUsers = async () => {
    setLoading(true);  // Show loading during fetch
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Fetch users error:', response.status);
        setUsers([]);  // Fallback to empty array to prevent white screen
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);  // Fallback
    } finally {
      setLoading(false);  // Always hide loading
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const capitalizeRole = (role) => role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );  // Prevent white screen during load
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full">
            {/* Add User Form */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center space-x-3 mb-5 lg:mb-6 pb-2">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">Add New Officer/Team Leader/Manager</h2>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4 lg:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Employee ID *</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={userForm.employeeId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
                    required
                    disabled={loading}  // Disable during load
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={userForm.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Role *</label>
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Role</option>
                    {roles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userForm.phone}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-fuchsia-300 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm"
                    placeholder="e.g., 0912345678"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 transform mt-2 lg:mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center space-x-2 text-sm sm:text-base">
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{loading ? 'Adding...' : 'Add User'}</span>
                  </span>
                </button>
              </form>
            </div>

            {/* Users Table */}
            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-hidden flex flex-col min-h-0 max-h-[80vh]">
              <div className="flex items-center space-x-3 mb-5 lg:mb-6 pb-2">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
                  <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">All Users</h2>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-fuchsia-200" key={users.length}>  {/* Key to force re-render */}
                    <thead className="bg-fuchsia-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Employee ID</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Name</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Role</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Phone</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Created At</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Actions</th>  {/* New */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-fuchsia-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-fuchsia-50 transition-colors duration-200">
                          <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{u.employeeId}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{u.name}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{capitalizeRole(u.role)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{u.phone || 'N/A'}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">  {/* New Actions */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openEditModal(u)}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
                                title="Edit User"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={loading}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Delete User"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {users.length === 0 && !loading && (
                  <div className="text-center py-8 flex-1 flex items-center justify-center">
                    <div className="space-y-2">
                      <CheckIcon className="h-12 w-12 text-gray-300 mx-auto" />
                      <p className="text-sm text-gray-500">No users yet. Add one above!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New: Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button onClick={() => { setShowEditModal(false); setEditingUser(null); setUserForm({ employeeId: '', name: '', role: '', phone: '' }); }} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={userForm.employeeId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  required
                  disabled={loading}
                >
                  <option value="">Select Role</option>
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={userForm.phone}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="e.g., 0912345678"
                  disabled={loading}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 min-w-[80px] px-4 !bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingUser(null); setUserForm({ employeeId: '', name: '', role: '', phone: '' }); }}
                  disabled={loading}
                  className="flex-1 py-2 min-w-[80px] px-4 !bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-white/95 backdrop-blur-2xl border-t border-fuchsia-800/20 w-full flex-shrink-0 py-3 lg:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs lg:text-sm text-gray-600">
              © 2025{' '}
              <span className="font-bold bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
                Commercial Bank of Ethiopia - የኢትዮጵያ ንግድ ባንክ
              </span>
              . All rights reserved.
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

export default AddUserPage;