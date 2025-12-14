
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { PlusIcon, CheckIcon, ArrowLeftIcon, PencilIcon, TrashIcon, EyeIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
// import * as XLSX from 'xlsx';

// const formatDate = (dateStr) => {
//     return new Intl.DateTimeFormat('en-GB', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric'
//     }).format(new Date(dateStr));
// };

// const BranchManagementPage = () => {
//     const navigate = useNavigate();
//     const [user] = useState({
//         employeeId: "070875",
//         displayName: "Muluken Walle Hibste",
//         fullName: "Muluken Walle Hibste",
//         email: "mulukenwalle@cbe.com.et",
//         department: "KYC Department",
//         title: "Central KYC Manager",
//         role: "CENTRAL_KYC_MANAGER",
//         isAdmin: true
//     });

//     const canEdit = user.role === 'CENTRAL_KYC_MANAGER';

//     if (!canEdit) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex items-center justify-center">
//                 <div className="text-center p-8">
//                     <PlusIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
//                     <p className="text-gray-600 mb-4">Only Central KYC Managers can manage branches.</p>
//                     <button onClick={() => navigate('/dashboard')} className="bg-fuchsia-600 text-white px-6 py-2 rounded-lg hover:bg-fuchsia-700 transition-colors">
//                         Back to Dashboard
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const [branchForm, setBranchForm] = useState({
//         name: '',
//         accountOfficerId: ''
//     });
//     const [branches, setBranches] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [showViewModal, setShowViewModal] = useState(false);
//     const [selectedBranch, setSelectedBranch] = useState(null);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [fileInputRef, setFileInputRef] = useState(null);

//     useEffect(() => {
//         fetchBranches();
//     }, []);

//     const fetchBranches = async () => {
//         try {
//             const response = await fetch('/api/branches');
//             if (response.ok) {
//                 const data = await response.json();
//                 setBranches(data);
//             }
//         } catch (err) {
//             setError('Failed to load branches');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFormChange = (e) => {
//         setBranchForm({
//             ...branchForm,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!branchForm.name || !branchForm.accountOfficerId) {
//             alert('Please fill all fields');
//             return;
//         }
//         if (!/^\d{4}$/.test(branchForm.accountOfficerId)) {
//             alert('Account Officer ID must be 4 digits');
//             return;
//         }

//         const method = 'POST';
//         const url = '/api/branches';

//         try {
//             const response = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(branchForm)
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to save branch');
//             }

//             alert('Branch created!');
//             setBranchForm({ name: '', accountOfficerId: '' });
//             fetchBranches();
//         } catch (error) {
//             alert(error.message);
//         }
//     };

//     const handleEdit = (branch) => {
//         setSelectedBranch(branch);
//         setBranchForm({ name: branch.name, accountOfficerId: branch.accountOfficerId });
//         setShowEditModal(true);
//     };

//     const handleView = (branch) => {
//         setSelectedBranch(branch);
//         setBranchForm({ name: branch.name, accountOfficerId: branch.accountOfficerId });
//         setShowViewModal(true);
//     };

//     const handleDelete = async (branchId) => {
//         if (!confirm('Delete?')) return;
//         try {
//             const response = await fetch(`/api/branches/${branchId}`, { method: 'DELETE' });
//             if (!response.ok) throw new Error(await response.text());
//             alert('Deleted!');
//             fetchBranches();
//         } catch (err) {
//             alert(err.message);
//         }
//     };

//     const handleEditSubmit = async (e) => {
//         e.preventDefault();
//         if (!branchForm.name || !branchForm.accountOfficerId) {
//             alert('Please fill all fields');
//             return;
//         }
//         if (!/^\d{4}$/.test(branchForm.accountOfficerId)) {
//             alert('Account Officer ID must be 4 digits');
//             return;
//         }

//         try {
//             const response = await fetch(`/api/branches/${selectedBranch.id}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(branchForm)
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to update branch');
//             }

//             alert('Branch updated!');
//             setShowEditModal(false);
//             setSelectedBranch(null);
//             fetchBranches();
//         } catch (error) {
//             alert(error.message);
//         }
//     };

//     const closeModal = (e) => {
//         if (e) e.preventDefault();
//         setShowEditModal(false);
//         setShowViewModal(false);
//         setSelectedBranch(null);
//         setBranchForm({ name: '', accountOfficerId: '' });
//     };

//     const handleFileChoose = (e) => {
//         const file = e.target.files[0];
//         setSelectedFile(file || null);
//     };

//     const handleBulkUpload = async () => {
//         if (!selectedFile) {
//             alert('Please choose a file first.');
//             fileInputRef?.click(); // Trigger file chooser if no file
//             return;
//         }

//         let branchesData = [];
//         try {
//             if (selectedFile.name.endsWith('.json')) {
//                 const text = await selectedFile.text();
//                 branchesData = JSON.parse(text);
//                 if (!Array.isArray(branchesData)) {
//                     throw new Error('JSON must be an array of objects');
//                 }
//             } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
//                 const data = await selectedFile.arrayBuffer();
//                 const workbook = XLSX.read(data, { type: 'array' });
//                 const sheetName = workbook.SheetNames[0];
//                 const worksheet = workbook.Sheets[sheetName];
//                 branchesData = XLSX.utils.sheet_to_json(worksheet);
//             } else {
//                 alert('Unsupported file type. Use JSON or Excel.');
//                 return;
//             }

//             // Validate structure
//             const validData = branchesData.filter(item => item.name && item.accountOfficerId && /^\d{4}$/.test(item.accountOfficerId));
//             const invalid = branchesData.length - validData.length;
//             if (invalid > 0) {
//                 alert(`Skipped ${invalid} invalid rows. Each row must have 'name' (string) and 'accountOfficerId' (4 digits).`);
//             }
//             if (validData.length === 0) {
//                 alert('No valid data found.');
//                 return;
//             }

//             const response = await fetch('/api/branches/bulk', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(validData)
//             });

//             if (!response.ok) {
//                 const err = await response.json();
//                 throw new Error(err.error || 'Failed to bulk create branches');
//             }

//             alert(`${validData.length} branches created!`);
//             setSelectedFile(null);
//             fileInputRef.value = ''; // Reset input
//             fetchBranches();
//         } catch (error) {
//             alert(error.message);
//         }
//     };

//     const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

//     if (loading) {
//         return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-b-2 border-fuchsia-600"></div></div>;
//     }
//      const handleBack = () => {
//     navigate('/dashboard');
//   };


//     return (
//         <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
//             <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
//                 <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/15 to-pink-600/15 rounded-full blur-3xl animate-blob"></div>
//                 <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/15 via-pink-700/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
//                 <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/10 to-fuchsia-800/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
//             </div>

//             <div className="relative z-10 flex-1 flex flex-col min-h-0">
//                  <header className="bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-sm z-20 w-full flex-shrink-0">
//                           <div className="max-w-7xl  px-4 sm:px-6 lg:px-8 flex justify-start">
//                             <div className="flex justify-start py-4 lg:py-6 ">
//                               <button onClick={handleBack} className="flex items-center space-x-2 text-fuchsia-800 hover:text-fuchsia-600 font-semibold transition-all duration-300 hover:scale-105">
//                                 <ArrowLeftIcon className="h-5 w-5" />
//                                 <span>Back to Dashboard</span>
//                               </button>
//                             </div>
//                           </div>
//                         </header>

//                 <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-hidden min-h-0">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full">
//                         {/* Form */}
//                         <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-y-auto max-h-[80vh]">
//                             <div className="flex items-center justify-between mb-5 lg:mb-6 pb-2">
//                                 <div className="flex items-center space-x-3">
//                                     <div className="from-emerald-500 to-teal-500 p-2 sm:p-3 bg-gradient-to-br rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
//                                         <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//                                     </div>
//                                     <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">
//                                         Add New Branch
//                                     </h2>
//                                 </div>
//                             </div>
//                             <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
//                                 <div>
//                                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Branch Name *</label>
//                                     <input
//                                         type="text"
//                                         name="name"
//                                         value={branchForm.name}
//                                         onChange={handleFormChange}
//                                         className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg lg:rounded-xl focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm border-fuchsia-300 focus:ring-emerald-500"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Account Officer ID (4 digits) *</label>
//                                     <input
//                                         type="text"
//                                         name="accountOfficerId"
//                                         value={branchForm.accountOfficerId}
//                                         onChange={(e) => setBranchForm({ ...branchForm, accountOfficerId: e.target.value.replace(/\D/g, '').slice(0, 4) })}
//                                         className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg lg:rounded-xl focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm border-fuchsia-300 focus:ring-emerald-500"
//                                         placeholder="e.g., 1234"
//                                         maxLength={4}
//                                         required
//                                     />
//                                 </div>
//                                 <button
//                                     type="submit"
//                                     className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
//                                 >
//                                     Create Branch
//                                 </button>
//                                 <div className="space-y-3">
//                                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Bulk Upload (Excel/JSON)</label>
//                                     <div className="space-y-2">
//                                         <div className="flex flex-col sm:flex-row gap-3">
//                                             <label className="flex-1 cursor-pointer">
//                                                 <input
//                                                     ref={(el) => setFileInputRef(el)}
//                                                     type="file"
//                                                     accept=".json,.xlsx,.xls"
//                                                     onChange={handleFileChoose}
//                                                     className="hidden"
//                                                 />
//                                                 <div className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-transparent hover:border-indigo-400">
//                                                     <ArrowUpTrayIcon className="h-4 w-4" />
//                                                     <span>Choose File</span>
//                                                 </div>
//                                             </label>
//                                             <button
//                                                 type="button"
//                                                 onClick={handleBulkUpload}
//                                                 disabled={!selectedFile}
//                                                 className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
//                                             >
//                                                 <ArrowUpTrayIcon className="h-4 w-4" />
//                                                 <span>Bulk Upload</span>
//                                             </button>
//                                         </div>
//                                         {selectedFile && (
//                                             <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-3">
//                                                 <p className="text-sm text-gray-700 flex items-center justify-between">
//                                                     <span className="font-medium">Selected: {selectedFile.name}</span>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => {
//                                                             setSelectedFile(null);
//                                                             fileInputRef.value = '';
//                                                         }}
//                                                         className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
//                                                     >
//                                                         Remove
//                                                     </button>
//                                                 </p>
//                                             </div>
//                                         )}
//                                         {!selectedFile && (
//                                             <p className="text-xs text-gray-500 text-center">Select a file to enable upload (Supports .xlsx, .xls, .json)</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </form>
//                         </div>

//                         {/* Table */}
//                         <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 overflow-hidden flex flex-col min-h-0 max-h-[80vh]">
//                             <div className="flex items-center space-x-3 mb-5 lg:mb-6 pb-2">
//                                 <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
//                                     <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//                                 </div>
//                                 <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">All Branches</h2>
//                             </div>
//                             <div className="flex-1 overflow-y-auto min-h-0">
//                                 <div className="overflow-x-auto">
//                                     <table className="min-w-full divide-y divide-fuchsia-200">
//                                         <thead className="bg-fuchsia-50 sticky top-0">
//                                             <tr>
//                                                 <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Branch Name</th>
//                                                 <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Account Officer ID</th>
//                                                 <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Created At</th>
//                                                 <th className="px-3 py-3 text-left text-xs font-bold text-fuchsia-700 uppercase tracking-wider">Actions</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="bg-white divide-y divide-fuchsia-200">
//                                             {branches.map((branch) => (
//                                                 <tr key={branch.id} className="hover:bg-fuchsia-50 transition-colors duration-200">
//                                                     <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{branch.name}</td>
//                                                     <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">{branch.accountOfficerId}</td>
//                                                     <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">{formatDate(branch.createdAt)}</td>
//                                                     <td className="px-3 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500">
//                                                         <div className="flex items-center space-x-2">
//                                                             <button onClick={() => handleView(branch)} className="text-blue-600 hover:text-blue-900 p-1">
//                                                                 <EyeIcon className="h-4 w-4" />
//                                                             </button>
//                                                             <button onClick={() => handleEdit(branch)} className="text-green-600 hover:text-green-900 p-1">
//                                                                 <PencilIcon className="h-4 w-4" />
//                                                             </button>
//                                                             <button onClick={() => handleDelete(branch.id)} className="text-red-600 hover:text-red-900 p-1">
//                                                                 <TrashIcon className="h-4 w-4" />
//                                                             </button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                                 {branches.length === 0 && (
//                                     <div className="text-center py-8 flex-1 flex items-center justify-center">
//                                         <div className="space-y-2">
//                                             <CheckIcon className="h-12 w-12 text-gray-300 mx-auto" />
//                                             <p className="text-sm text-gray-500">No branches yet. Add one above!</p>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </div>

//             {/* Edit Modal */}
//             {showEditModal && (
//                 <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
//                     <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
//                         <div className="flex items-center justify-between mb-5 lg:mb-6 pb-2">
//                             <div className="flex items-center space-x-3">
//                                 <div className="from-green-500 to-teal-500 p-2 sm:p-3 bg-gradient-to-br rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
//                                     <PencilIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//                                 </div>
//                                 <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">Edit Branch</h2>
//                             </div>
//                             <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
//                                 <XMarkIcon className="h-6 w-6" />
//                             </button>
//                         </div>
//                         <form onSubmit={handleEditSubmit} className="space-y-4 lg:space-y-5">
//                             <div>
//                                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Branch Name *</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={branchForm.name}
//                                     onChange={handleFormChange}
//                                     className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg lg:rounded-xl focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm border-fuchsia-300 focus:ring-emerald-500"
//                                     required
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Account Officer ID (4 digits) *</label>
//                                 <input
//                                     type="text"
//                                     name="accountOfficerId"
//                                     value={branchForm.accountOfficerId}
//                                     onChange={(e) => setBranchForm({ ...branchForm, accountOfficerId: e.target.value.replace(/\D/g, '').slice(0, 4) })}
//                                     className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg lg:rounded-xl focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-400 text-sm border-fuchsia-300 focus:ring-emerald-500"
//                                     placeholder="e.g., 1234"
//                                     maxLength={4}
//                                     required
//                                 />
//                             </div>
//                             <div className="flex space-x-3">
//                                 <button
//                                     type="submit"
//                                     className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
//                                 >
//                                     Update Branch
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={closeModal}
//                                     className="flex-1 py-2.5 sm:py-3 bg-gray-300 text-gray-700 font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* View Modal */}
//             {showViewModal && (
//                 <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
//                     <div className="bg-white/95 backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-fuchsia-800/20 p-5 sm:p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
//                         <div className="flex items-center justify-between mb-5 lg:mb-6 pb-2">
//                             <div className="flex items-center space-x-3">
//                                 <div className="from-blue-500 to-indigo-500 p-2 sm:p-3 bg-gradient-to-br rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
//                                     <EyeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//                                 </div>
//                                 <h2 className="text-xl sm:text-2xl lg:text-2xl font-black text-gray-900">View Branch</h2>
//                             </div>
//                             <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
//                                 <XMarkIcon className="h-6 w-6" />
//                             </button>
//                         </div>
//                         <div className="space-y-4 lg:space-y-5">
//                             <div>
//                                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Branch Name</label>
//                                 <input
//                                     type="text"
//                                     value={branchForm.name}
//                                     disabled
//                                     className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg lg:rounded-xl bg-gray-100 cursor-not-allowed text-sm"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 lg:mb-2">Account Officer ID</label>
//                                 <input
//                                     type="text"
//                                     value={branchForm.accountOfficerId}
//                                     disabled
//                                     className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border rounded-lg lg:rounded-xl bg-gray-100 cursor-not-allowed text-sm"
//                                 />
//                             </div>
//                             <div className="text-right">
//                                 <button
//                                     type="button"
//                                     onClick={closeModal}
//                                     className="py-2.5 sm:py-3 bg-gray-300 text-gray-700 font-bold rounded-lg lg:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-6"
//                                 >
//                                     Close
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//            <style>{`
//         @keyframes blob {
//           0% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
//         .animate-blob { animation: blob 7s infinite; }
//         .animation-delay-2000 { animation-delay: 2s; }
//         .animation-delay-4000 { animation-delay: 4s; }
//       `}</style>
//         </div>
//     );
// };

// export default BranchManagementPage;
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ArrowLeftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

const AddBranchPage = () => {
  const navigate = useNavigate();

  const [branchForm, setBranchForm] = useState({
    name: '',
    accountOfficerId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputRef, setFileInputRef] = useState(null);

  const handleFormChange = (e) => {
    setBranchForm({
      ...branchForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
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
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm)
      });

      if (!response.ok) throw new Error('Failed to create branch');

      alert('Branch created successfully!');
      navigate('/branch-list')
      setBranchForm({ name: '', accountOfficerId: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleFileChoose = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      alert('Please choose a file first.');
      fileInputRef?.click();
      return;
    }

    let branchesData = [];
    try {
      if (selectedFile.name.endsWith('.json')) {
        const text = await selectedFile.text();
        branchesData = JSON.parse(text);
        if (!Array.isArray(branchesData)) throw new Error('JSON must be an array');
      } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        const data = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        branchesData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        alert('Unsupported file type');
        return;
      }

      const validData = branchesData.filter(item => item.name && item.accountOfficerId && /^\d{4}$/.test(item.accountOfficerId));
      if (validData.length === 0) {
        alert('No valid data found');
        return;
      }

      const response = await fetch('/api/branches/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      });

      if (!response.ok) throw new Error('Bulk upload failed');

      alert(`${validData.length} branches uploaded!`);
      setSelectedFile(null);
      if (fileInputRef) fileInputRef.value = '';
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBack = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/15 to-pink-600/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/15 via-pink-700/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/10 to-fuchsia-800/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <header className="bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-sm z-20 w-full flex-shrink-0">
          <div className="max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-start">
            <div className="flex justify-start py-4 lg:py-6">
              <button onClick={handleBack} className="flex items-center space-x-2 text-fuchsia-800 hover:text-fuchsia-600 font-semibold transition-all duration-300 hover:scale-105">
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-8 lg:p-12 w-full max-w-2xl">
            <div className="flex items-center justify-center mb-8">
              <div className="from-emerald-500 to-teal-500 p-4 bg-gradient-to-br rounded-2xl shadow-lg">
                <PlusIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 ml-4">Add New Branch</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Name *</label>
                <input
                  type="text"
                  name="name"
                  value={branchForm.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border-2 border-fuchsia-300 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Account Officer ID (4 digits) *</label>
                <input
                  type="text"
                  name="accountOfficerId"
                  value={branchForm.accountOfficerId}
                  onChange={(e) => setBranchForm({ ...branchForm, accountOfficerId: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  className="w-full px-4 py-3 border-2 border-fuchsia-300 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 transition-all"
                  placeholder="e.g., 1234"
                  maxLength={4}
                  required
                />
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-lg">
                Create Branch
              </button>

              <div className="pt-6 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Bulk Upload (Excel/JSON)</label>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        ref={setFileInputRef}
                        type="file"
                        accept=".json,.xlsx,.xls"
                        onChange={handleFileChoose}
                        className="hidden"
                      />
                      <div className="w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all text-center">
                        Choose File
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={handleBulkUpload}
                      disabled={!selectedFile}
                      className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUpTrayIcon className="h-6 w-6 inline mr-2" />
                      Upload Bulk
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                      <p className="text-sm font-medium text-indigo-800">Selected: {selectedFile.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default AddBranchPage;