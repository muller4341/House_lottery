import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import {
    ArrowLeftIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const MemoPage = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const [memos, setMemos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({ title: '', file: null });
    const [selectedMemo, setSelectedMemo] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null
    });

    const isAuthorized = user?.role === 'TEAM_LEADER' || user?.role === 'CENTRAL_KYC_MANAGER';

    useEffect(() => {
        fetchMemos();
    }, []);

    const fetchMemos = async () => {
        try {
            const response = await fetch('/api/memos');
            if (response.ok) {
                const data = await response.json();
                setMemos(data);
            } else {
                throw new Error('Failed to load memos');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.title || !uploadForm.file) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Missing Fields',
                message: 'Please provide both title and a PDF file.'
            });
            return;
        }

        if (uploadForm.file.type !== 'application/pdf') {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Invalid File',
                message: 'Only PDF files are allowed.'
            });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', uploadForm.title);
        formData.append('memo', uploadForm.file);

        try {
            const response = await fetch('/api/memos', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Upload failed');
            }

            setModal({
                isOpen: true,
                type: 'success',
                title: 'Success',
                message: 'Memo uploaded successfully!'
            });
            setShowUploadModal(false);
            setUploadForm({ title: '', file: null });
            fetchMemos();
        } catch (err) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: err.message
            });
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (memo) => {
        setSelectedMemo(memo);
        setEditTitle(memo.title);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editTitle) return;

        try {
            const response = await fetch(`/api/memos/${selectedMemo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle })
            });

            if (!response.ok) throw new Error('Update failed');

            setModal({
                isOpen: true,
                type: 'success',
                title: 'Updated',
                message: 'Memo title updated successfully!'
            });
            setShowEditModal(false);
            fetchMemos();
        } catch (err) {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: err.message
            });
        }
    };

    const handleDelete = async (memoId) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title: 'Delete Memo',
            message: 'Are you sure you want to delete this memo? This action cannot be undone.',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/memos/${memoId}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Delete failed');

                    setModal({
                        isOpen: true,
                        type: 'success',
                        title: 'Deleted',
                        message: 'Memo deleted successfully!'
                    });
                    fetchMemos();
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

    const handleDownload = (memoId) => {
        window.location.href = `/api/memos/${memoId}/download`;
    };

    const filteredMemos = memos.filter(memo =>
        memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memo.uploadedBy?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            {/* Dynamic Background (Blobs) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <div className="relative z-10 flex flex-col h-screen">
                {/* Header */}
                <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm z-20 flex-shrink-0 sticky top-0">
                    <div className=" mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="group p-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all duration-300"
                            >
                                <ArrowLeftIcon className="h-5 w-5 text-slate-600 group-hover:text-fuchsia-700" />
                            </button>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-700 to-purple-800">
                                Official Memos
                            </h1>
                        </div>

                        {isAuthorized && (
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-fuchsia-900/20 hover:scale-[1.02] transition-all"
                            >
                                <CloudArrowUpIcon className="h-5 w-5" />
                                Upload Memo
                            </button>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
                    <div className="max-w-8xl mx-auto h-full flex flex-col gap-6">

                        {/* Search Bar */}
                        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg shadow-purple-900/5">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-fuchsia-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search memos by title or uploader..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 bg-white/80 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Memo List */}
                        <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-purple-900/5 overflow-hidden flex flex-col">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full divide-y divide-slate-200/60">
                                    <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded By</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/60">
                                        {filteredMemos.map((memo) => (
                                            <tr key={memo.id} className="group hover:bg-white/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                                                            <DocumentIcon className="h-6 w-6" />
                                                        </div>
                                                        <span className="font-bold text-slate-800">{memo.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {memo.uploadedBy?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(memo.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3 items-center">
                                                        <button
                                                            onClick={() => handleDownload(memo.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs transition-all"
                                                            title="Download PDF"
                                                        >
                                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                                            Download
                                                        </button>
                                                        {isAuthorized && (
                                                            <>
                                                                <button onClick={() => handleEdit(memo)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Edit Title">
                                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button onClick={() => handleDelete(memo.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredMemos.length === 0 && (
                                    <div className="p-20 text-center text-slate-400">
                                        No memos found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Upload Official Memo</h3>
                            <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Memo Title</label>
                                    <input
                                        type="text"
                                        value={uploadForm.title}
                                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500/20"
                                        placeholder="e.g. KYC Update Dec 2025"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Select PDF</label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-fuchsia-50 file:text-fuchsia-700 hover:file:bg-fuchsia-100 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-800">Edit Memo Title</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Memo Title</label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reusable Modal Component */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                confirmText={modal.onConfirm ? (modal.type === 'confirm' ? 'Delete' : 'Confirm') : 'OK'}
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
      `}</style>
        </div>
    );
};

export default MemoPage;
