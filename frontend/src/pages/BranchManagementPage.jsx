import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  XMarkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import Modal from '../components/Modal';

const AddBranchPage = () => {
  const navigate = useNavigate();

  const [branchForm, setBranchForm] = useState({
    name: '',
    accountOfficerId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onClose: null
  });

  const handleFormChange = (e) => {
    setBranchForm({
      ...branchForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.accountOfficerId) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in all fields (Branch Name and Account Officer ID).'
      });
      return;
    }
    if (!/^\d{4}$/.test(branchForm.accountOfficerId)) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Format',
        message: 'Account Officer ID must be exactly 4 digits.'
      });
      return;
    }

    try {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchForm)
      });

      if (!response.ok) throw new Error('Failed to create branch');

      setBranchForm({ name: '', accountOfficerId: '' });

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success!',
        message: 'Branch created successfully!',
        onClose: () => {
          setModal({ isOpen: false, type: 'info', title: '', message: '', onClose: null });
          navigate('/branch-list');
        }
      });
    } catch (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create branch. Please try again.'
      });
    }
  };

  const handleFileChoose = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'No File Selected',
        message: 'Please choose a file first.'
      });
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

        // FORCE HEADERS — THIS FIXES YOUR FILE
        branchesData = XLSX.utils.sheet_to_json(worksheet, {
          header: ['name', 'accountOfficerId'],
          defval: ''
        });
      } else {
        setModal({
          isOpen: true,
          type: 'warning',
          title: 'Unsupported File Type',
          message: 'Please use .json, .xlsx, or .xls files only.'
        });
        return;
      }

      // VALIDATE DATA
      const validData = branchesData.filter(item =>
        item.name &&
        item.accountOfficerId &&
        /^\d{4}$/.test(String(item.accountOfficerId).trim())
      );

      if (validData.length === 0) {
        setModal({
          isOpen: true,
          type: 'warning',
          title: 'No Valid Data',
          message: 'No valid data found. Please check that every row has a branch name and a 4-digit Account Officer ID.'
        });
        return;
      }

      // SEND TO BACKEND
      const response = await fetch('/api/branches/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk upload failed');
      }

      const result = await response.json();
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Success!',
        message: result.message || `${validData.length} branches successfully uploaded/updated!`
      });

      // RESET FORM
      setSelectedFile(null);
      if (fileInputRef) fileInputRef.value = '';

    } catch (error) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Bulk upload failed. Please try again.'
      });
    }
  };

  const handleBack = () => navigate('/dashboard');

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.json') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
    } else {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Invalid File',
        message: 'Please drop a valid .json, .xlsx, or .xls file.'
      });
    }
  };

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
          <div className="mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
              <span className="text-sm font-medium text-slate-500 bg-white/50 px-3 py-1 rounded-full border border-white/50 flex items-center gap-2">
                <BuildingOfficeIcon className="h-4 w-4" />
                Admin Mode
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">

          <div className="w-full max-w-2xl bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-purple-900/5 p-8 lg:p-12 relative overflow-hidden">

            {/* Decorative header icon */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <PlusCircleIcon className="h-64 w-64 text-fuchsia-900" />
            </div>

            <div className="flex items-center gap-4 mb-10 relative">
              <div className="p-4 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-2xl shadow-lg shadow-fuchsia-900/20 text-white">
                <PlusCircleIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Add New Branch</h2>
                <p className="text-slate-500 font-medium">Create a single branch or upload via Excel/JSON</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative">
              <div className="space-y-6">
                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-slate-700 flex justify-between">
                    Branch Name <span className="text-fuchsia-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={branchForm.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-4 bg-white/80 border border-white/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all font-medium text-slate-800 shadow-sm group-hover:shadow-md"
                    placeholder="Enter branch name..."
                    required
                  />
                </div>

                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-slate-700 flex justify-between">
                    Account Officer ID <span className="text-fuchsia-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountOfficerId"
                    value={branchForm.accountOfficerId}
                    onChange={(e) => setBranchForm({ ...branchForm, accountOfficerId: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full px-4 py-4 bg-white/80 border border-white/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all font-medium text-slate-800 shadow-sm group-hover:shadow-md"
                    placeholder="4-digit ID (e.g. 1234)"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-900/20 hover:shadow-xl hover:scale-[1.01] transition-all text-lg flex items-center justify-center gap-2">
                <PlusCircleIcon className="h-6 w-6" />
                Create Branch
              </button>

              <div className="pt-8 border-t border-slate-200/60">
                <label className="block text-sm font-bold text-slate-700 mb-4">Bulk Upload</label>

                <div
                  className={`
                        relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group
                        ${isDragOver
                      ? 'border-fuchsia-500 bg-fuchsia-50/50 scale-[1.01]'
                      : 'border-slate-300 hover:border-fuchsia-400 hover:bg-white/50'
                    }
                    `}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef && fileInputRef.click()}
                >
                  <input
                    ref={setFileInputRef}
                    type="file"
                    accept=".json,.xlsx,.xls"
                    onChange={handleFileChoose}
                    className="hidden"
                  />

                  <div className={`
                        p-4 rounded-full transition-all duration-300
                        ${isDragOver ? 'bg-white text-fuchsia-600 shadow-md' : 'bg-slate-100 text-slate-400 group-hover:bg-fuchsia-50 group-hover:text-fuchsia-500'}
                    `}>
                    <ArrowUpTrayIcon className="h-8 w-8" />
                  </div>

                  <div className="text-center space-y-1">
                    {selectedFile ? (
                      <p className="text-base font-bold text-fuchsia-700">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-base font-bold text-slate-600 group-hover:text-slate-800">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-slate-400">
                          Supports .xlsx, .xls, or .json
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleBulkUpload}
                    className="w-full mt-4 py-3 bg-white border border-fuchsia-200 text-fuchsia-700 font-bold rounded-xl hover:bg-fuchsia-50 hover:border-fuchsia-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    Process File
                  </button>
                )}

                {selectedFile && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="absolute bottom-[-40px] right-0 text-sm text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                  >
                    <XMarkIcon className="h-4 w-4" /> Clear selection
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Modal Component */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
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

export default AddBranchPage;