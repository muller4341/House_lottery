import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { 
  CheckBadgeIcon, 
  ArrowLeftIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  EyeIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

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
  const [modal, setModal] = useState({
  isOpen: false,
  type: 'info', // 'info' | 'confirm' | 'success' | 'error'
  title: '',
  message: '',
  onConfirm: null,
  confirmText: 'Confirm',
  cancelText: 'Cancel'
});

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
    } else {
      throw new Error('Failed to load branches');
    }
  } catch (err) {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Error',
      message: err.message || 'Failed to load branches. Please try again.'
    });
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
  setModal({
    isOpen: true,
    type: 'confirm',
    title: 'Delete Branch',
    message: 'Are you sure you want to delete this branch? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        const response = await fetch(`/api/branches/${branchId}`, { method: 'DELETE' });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to delete branch');
        }
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Deleted!',
          message: 'Branch deleted successfully!'
        });
        fetchBranches();
      } catch (err) {
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: err.message
        });
      }
    }
  });
};

  const handleEditSubmit = async (e) => {
  e.preventDefault();
  if (!branchForm.name || !branchForm.accountOfficerId) {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Missing Fields',
      message: 'Please fill all fields'
    });
    return;
  }
  if (!/^\d{4}$/.test(branchForm.accountOfficerId)) {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Invalid AO ID',
      message: 'Account Officer ID must be exactly 4 digits'
    });
    return;
  }

  try {
    const response = await fetch(`/api/branches/${selectedBranch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchForm)
    });
    if (!response.ok) throw new Error('Update failed');

    setModal({
      isOpen: true,
      type: 'success',
      title: 'Success!',
      message: 'Branch updated successfully!'
    });

    setShowEditModal(false);
    setSelectedBranch(null);
    setBranchForm({ name: '', accountOfficerId: '' });
    fetchBranches();
  } catch (error) {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to update branch'
    });
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
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-fuchsia-600 animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <BuildingLibraryIcon className="h-6 w-6 text-fuchsia-600 animate-pulse" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-fuchsia-200/30 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm z-20 flex-shrink-0 sticky top-0">
          <div className=" mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack} 
                className="group p-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <ArrowLeftIcon className="h-5 w-5 text-slate-600 group-hover:text-fuchsia-700 transition-colors" />
              </button>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-700 to-purple-800">
                Branch Management
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium font-bold text-gray-700 bg-fuchsia-50 border border-fuchsia-200 px-3 py-1 rounded-md ">
                    Total Branches: {branches.length}
                </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <div className=" mx-auto h-full flex flex-col gap-6">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg shadow-purple-900/5">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-xl shadow-lg shadow-fuchsia-900/20 text-white">
                        <BuildingLibraryIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">All Branches</h2>
                        <p className="text-sm text-slate-500">Manage your network</p>
                    </div>
                </div>

                <div className="w-full sm:w-96 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-fuchsia-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search branches by name or AO ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-white/80 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:bg-white shadow-sm transition-all hover:shadow-md"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-purple-900/5 overflow-hidden flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-slate-200/60">
                  <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">AO ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 bg-transparent">
                    {filteredBranches.map((branch) => (
                      <tr 
                        key={branch.id} 
                        className="group hover:bg-white/80 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-fuchsia-100/50 flex items-center justify-center text-fuchsia-600 font-bold text-lg group-hover:scale-110 group-hover:bg-fuchsia-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                {branch.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-slate-900">{branch.name}</div>
                              
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100 group-hover:border-blue-200 transition-colors">
                            {branch.accountOfficerId}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {formatDate(branch.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleView(branch)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleEdit(branch)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDelete(branch.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredBranches.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                        <MagnifyingGlassIcon className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No branches found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Styles for blobs */}
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
      
      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BuildingLibraryIcon className="h-6 w-6 text-fuchsia-600" />
                Branch Details
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Branch Name</label>
                    <p className="text-lg font-medium text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">{branchForm.name}</p>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Officer ID</label>
                    <p className="text-lg font-medium text-slate-800 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">{branchForm.accountOfficerId}</p>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created At</label>
                    <p className="text-sm font-medium text-slate-600 px-4 py-2">{formatDate(selectedBranch.createdAt)}</p>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-fuchsia-50/50 to-white">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <PencilSquareIcon className="h-6 w-6 text-fuchsia-600" />
                Edit Branch
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Branch Name</label>
                        <input
                        type="text"
                        value={branchForm.name}
                        onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all font-medium text-slate-700"
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Account Officer ID</label>
                        <input
                        type="text"
                        value={branchForm.accountOfficerId}
                        onChange={(e) => setBranchForm({ ...branchForm, accountOfficerId: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all font-medium text-slate-700"
                        maxLength={4}
                        required
                        />
                        <p className="text-xs text-slate-400">Must be exactly 4 digits</p>
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
                        Save Changes
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
      {/* Reusable Modal */}
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

export default BranchListPage;