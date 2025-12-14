import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ArrowLeftIcon, PencilIcon, TrashIcon, EyeIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
};

const BranchListPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchForm, setBranchForm] = useState({ name: '', accountOfficerId: '' });
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = branches.filter(branch =>
      branch.name.toLowerCase().includes(lowerSearch) ||
      branch.accountOfficerId.includes(searchTerm)
    );
    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
        setFilteredBranches(data);
      }
    } catch (err) {
      alert('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setBranchForm({ name: branch.name, accountOfficerId: branch.accountOfficerId });
    setShowEditModal(true);
  };

  const handleView = (branch) => {
    setSelectedBranch(branch);
    setBranchForm({ name: branch.name, accountOfficerId: branch.accountOfficerId });
    setShowViewModal(true);
  };

  const handleDelete = async (branchId) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      const response = await fetch(`/api/branches/${branchId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      alert('Branch deleted successfully!');
      fetchBranches();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.accountOfficerId) {
      alert('Please fill all fields');
      return;
    }
    if (!/^\d{4}$/.test(branchForm.accountOfficerId)) {
      alert('Account Officer ID must be 4 digits');
      return;
    }

    try {
      const response = await fetch(`/api/branches/${selectedBranch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm)
      });
      if (!response.ok) throw new Error('Update failed');
      alert('Branch updated successfully!');
      setShowEditModal(false);
      setSelectedBranch(null);
      setBranchForm({ name: '', accountOfficerId: '' });
      fetchBranches();
    } catch (error) {
      alert(error.message);
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedBranch(null);
    setBranchForm({ name: '', accountOfficerId: '' });
  };

  const handleBack = () => navigate('/dashboard');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-b-4 border-fuchsia-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/15 to-pink-600/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/15 via-pink-700/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/10 to-fuchsia-800/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <header className="bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-sm z-20 w-full flex-shrink-0">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-start">
            <div className="flex justify-start py-4 lg:py-6">
              <button onClick={handleBack} className="flex items-center space-x-2 text-fuchsia-800 hover:text-fuchsia-600 font-semibold transition-all hover:scale-105">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className=" mx-auto mx-4">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-8 flex flex-col h-full">
              {/* Title */}
              <div className="flex items-center justify-center mb-8">
                <div className="from-blue-500 to-indigo-500 p-4 bg-gradient-to-br rounded-2xl shadow-lg">
                  <CheckIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 ml-4">All Branches</h2>
              </div>

              {/* SEARCH BAR */}
              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by branch name or account officer ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 text-sm font-medium placeholder-gray-500 transition-all"
                  />
                </div>
              </div>

              {/* TABLE WITH STICKY HEADER & SCROLLABLE BODY */}
              <div className="flex-1 overflow-hidden border border-gray-200 rounded-xl">
                <div className="max-h-[60vh] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-fuchsia-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Branch Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Account Officer ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Created At</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-fuchsia-800 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBranches.map(branch => (
                        <tr key={branch.id} className="hover:bg-fuchsia-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{branch.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{branch.accountOfficerId}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(branch.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-4">
                              <button onClick={() => handleView(branch)} className="text-blue-600 hover:text-blue-800">
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleEdit(branch)} className="text-green-600 hover:text-green-800">
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleDelete(branch.id)} className="text-red-600 hover:text-red-800">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredBranches.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-gray-500 text-lg italic">
                        {searchTerm ? 'No branches match your search.' : 'No branches found.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Branch</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-fuchsia-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Officer ID</label>
                <input
                  type="text"
                  value={branchForm.accountOfficerId}
                  onChange={(e) => setBranchForm({ ...branchForm, accountOfficerId: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className="w-full px-4 py-3 border-2 border-fuchsia-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                  maxLength={4}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Update Branch
                </button>
                <button type="button" onClick={closeModal} className="flex-1 py-3 bg-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-400 transition-all">
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
              <h3 className="text-2xl font-bold text-gray-900">Branch Details</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Name</label>
                <p className="px-4 py-3 bg-gray-100 rounded-xl text-sm font-medium">{branchForm.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Officer ID</label>
                <p className="px-4 py-3 bg-gray-100 rounded-xl text-sm font-medium">{branchForm.accountOfficerId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Created At</label>
                <p className="px-4 py-3 bg-gray-100 rounded-xl text-sm font-medium">{formatDate(selectedBranch.createdAt)}</p>
              </div>
              <button onClick={closeModal} className="w-full py-3 bg-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-400 transition-all">
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

export default BranchListPage;