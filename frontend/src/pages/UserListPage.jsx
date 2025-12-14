import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeftIcon, PencilIcon, TrashIcon, EyeIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({ employeeId: '', name: '', role: '', phone: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
 

  const roles = ['OFFICER', 'TEAM_LEADER', 'CENTRAL_KYC_MANAGER'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users?status=0');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (err) {
      alert('Failed to load users');
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

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      alert('User deactivated');
      fetchUsers();
    } catch (err) {
      alert('Failed to deactivate');
    }
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
    alert('User updated successfully!');
    setShowEditModal(false);
    closeModal();
    fetchUsers(); // refresh list
  } catch (err) {
    alert(err.message);
  }
};

  

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-12 w-12 border-b-4 border-fuchsia-600 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/15 to-pink-600/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/15 via-pink-700/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/10 to-fuchsia-800/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-sm">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 text-fuchsia-800 hover:text-fuchsia-600 font-semibold">
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8">
          <div className=" mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-fuchsia-200 p-8">
              <div className="flex items-center justify-center mb-8">
                <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                  <CheckIcon className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 ml-6">All Users</h2>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by Employee ID or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-base"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-fuchsia-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase">Employee ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase">Phone</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase">Created</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-fuchsia-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.employeeId}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{capitalizeRole(u.role)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.phone || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button onClick={() => handleView(u)} className="text-blue-600 hover:text-blue-800">
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleEdit(u)} className="text-green-600 hover:text-green-800">
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No users found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* EDIT & VIEW MODALS — FULLY WORKING */}
      {/* (Same as your original code — copy them here if needed) */}
            {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit User</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID</label>
                <input type="text" value={userForm.employeeId} readOnly className="w-full px-4 py-3 bg-gray-100 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-fuchsia-300 rounded-xl focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-fuchsia-300 rounded-xl focus:border-blue-500"
                  required
                >
                  <option value="OFFICER">Officer</option>
                  <option value="TEAM_LEADER">Team Leader</option>
                  <option value="CENTRAL_KYC_MANAGER">Central KYC Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-fuchsia-300 rounded-xl focus:border-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl">
                  Update
                </button>
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-300 text-gray-700 font-bold rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID</label>
                <p className="px-4 py-3 bg-gray-100 rounded-xl">{userForm.employeeId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <p className="px-4 py-3 bg-gray-100 rounded-xl">{userForm.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <p className="px-4 py-3 bg-gray-100 rounded-xl">{capitalizeRole(userForm.role)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <p className="px-4 py-3 bg-gray-100 rounded-xl">{userForm.phone || 'N/A'}</p>
              </div>
              <button onClick={closeModal} className="w-full py-3 bg-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-400">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default UserListPage;