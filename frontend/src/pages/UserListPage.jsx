import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeftIcon, PencilIcon, TrashIcon, EyeIcon, XMarkIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../components/Modal';
import { useLocation } from 'react-router-dom'; // ← add this import

const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
};

const capitalizeRole = (role) => role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

const UserListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({ employeeId: '', name: '', role: '', phone: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
  if (location.state?.editUserId) {
    const userToEdit = users.find(u => u.id === location.state.editUserId);
    if (userToEdit) {
      handleEdit(userToEdit);
      // Clear the state so it doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }
}, [location.state, users]);
  

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  });


  const roles = ['OFFICER', 'TEAM_LEADER', 'CENTRAL_KYC_MANAGER'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => {
      // Search filter
      const matchesSearch = user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' ? true :
        statusFilter === 'active' ? user.status === 0 :
          user.status === 1;

      return matchesSearch && matchesStatus;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users, statusFilter]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to load users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setUserForm({
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setUserForm({
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
      phone: user.phone || ''
    });
    setShowViewModal(true);
  };
  const closeModal = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedUser(null);
    setUserForm({ employeeId: '', name: '', role: '', phone: '' });
  };

  const handleDelete = async (id, currentStatus, userName) => {
    const action = currentStatus === 0 ? 'Deactivate' : 'Activate';

    setModal({
      isOpen: true,
      type: 'confirm',
      title: `${action} User`,
      message: `Are you sure you want to ${action.toLowerCase()} "${userName}"? ${currentStatus === 0 ? 'They will no longer have access to the system.' : 'They will regain access to the system.'}`,
      confirmText: action,
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Operation failed');
          }

          setModal({
            isOpen: true,
            type: 'success',
            title: 'Success!',
            message: `User ${action.toLowerCase()}d successfully!`
          });
          fetchUsers();
        } catch (err) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: err.message || 'Operation failed. Please try again.'
          });
        }
      }
    });
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (!res.ok) throw new Error('Update failed');

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success!',
        message: 'User updated successfully!'
      });

      setShowEditModal(false);
      closeModal();
      fetchUsers();
    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to update user. Please try again.'
      });
    }
  };





  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-fuchsia-600 animate-spin"></div>
        </div>
      </div>
    );
  }

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
              <button
                onClick={() => navigate('/dashboard')}
                className="group p-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <ArrowLeftIcon className="h-5 w-5 text-slate-600 group-hover:text-fuchsia-700 transition-colors" />
              </button>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-700 to-purple-800">
                User Management
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium font-bold text-gray-700 bg-fuchsia-50 border border-fuchsia-200 px-3 py-1 rounded-md">
                Total: {users.length}
              </span>
              <span className="text-sm font-medium font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                Active: {users.filter(u => u.status === 0).length}
              </span>
              <span className="text-sm font-medium font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-md">
                Inactive: {users.filter(u => u.status === 1).length}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className=" mx-auto h-full flex flex-col gap-6">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg shadow-purple-900/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-xl shadow-lg shadow-fuchsia-900/20 text-white">
                  <CheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">All Users</h2>
                  <p className="text-sm text-slate-500">Manage system access</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none w-full sm:w-48 px-4 py-3 pr-10 bg-white/80 border border-white/50 rounded-xl text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
                  >
                    <option value="active">✓ Active Users</option>
                    <option value="inactive">✗ Inactive Users</option>
                    <option value="all">⊙ All Users</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Search Input */}
                <div className="w-full sm:w-80 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-fuchsia-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-white/80 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:bg-white shadow-sm transition-all hover:shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-purple-900/5 overflow-hidden flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-slate-200/60">
                  <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 bg-transparent">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="group hover:bg-white/80 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 group-hover:border-blue-200 transition-colors">
                            {u.employeeId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${u.role === 'OFFICER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            u.role === 'TEAM_LEADER' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100'
                            }`}>
                            {capitalizeRole(u.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.phone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${u.status === 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                            {u.status === 0 ? (
                              <>
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-4 w-4 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleView(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleEdit(u)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id, u.status, u.name)}
                              className={`p-2 transition-all rounded-lg ${u.status === 0
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                              title={u.status === 0 ? 'Deactivate user' : 'Activate user'}
                            >
                              {u.status === 0 ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                      <MagnifyingGlassIcon className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No users found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-fuchsia-50/50 to-white">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <PencilIcon className="h-6 w-6 text-fuchsia-600" />
                Edit User
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Employee ID</label>
                  <input type="text" value={userForm.employeeId} readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Name</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all font-medium text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all font-medium text-slate-700"
                    required
                  >
                    <option value="OFFICER">Officer</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="CENTRAL_KYC_MANAGER">Central KYC Manager</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-900/20 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CheckIcon className="h-6 w-6 text-fuchsia-600" />
                User Details
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee ID</label>
                <p className="text-lg font-medium text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">{userForm.employeeId}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label>
                <p className="text-lg font-medium text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">{userForm.name}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full border mt-1 ${userForm.role === 'OFFICER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  userForm.role === 'TEAM_LEADER' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100'
                  }`}>
                  {capitalizeRole(userForm.role)}
                </span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                <p className="text-lg font-medium text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">{userForm.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Component */}
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
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default UserListPage;