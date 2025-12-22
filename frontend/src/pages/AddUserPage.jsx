// 

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Modal from '../components/Modal';

const AddUserPage = () => {
  const navigate = useNavigate();

  const [userForm, setUserForm] = useState({
    employeeId: '',
    name: '',
    role: '',
    phone: ''
  });

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  });

  const roles = [
    { value: 'OFFICER', label: 'Officer' },
    { value: 'TEAM_LEADER', label: 'Team Leader' },
    { value: 'CENTRAL_KYC_MANAGER', label: 'Central KYC Manager' }
  ];

  const handleChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!userForm.employeeId || !userForm.name || !userForm.role) {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Missing Information',
      message: 'Please fill in all required fields (Employee ID, Name, and Role).'
    });
    return;
  }

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });

    if (res.status === 409) {
      // Employee ID already exists → get the existing user and redirect to edit
      const checkRes = await fetch(`/api/users?employeeId=${userForm.employeeId}`);
      if (checkRes.ok) {
        const users = await checkRes.json();
        if (users.length > 0) {
          const existingUser = users[0];

          setModal({
            isOpen: true,
            type: 'info',
            title: 'User Already Exists',
            message: `User with Employee ID "${userForm.employeeId}" already exists. Redirecting to edit...`,
            onConfirm: () => {
              // Navigate to user list and trigger edit
              navigate('/user-list', { 
                state: { 
                  editUserId: existingUser.id 
                } 
              });
            }
          });

          // Auto-confirm after 2 seconds
          setTimeout(() => {
            setModal({ ...modal, isOpen: false });
            navigate('/user-list', { 
              state: { 
                editUserId: existingUser.id 
              } 
            });
          }, 5000);

          return;
        }
      }
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add user');
    }

    // Success: new user created
    setModal({
      isOpen: true,
      type: 'success',
      title: 'Success!',
      message: 'User added successfully!'
    });

    setUserForm({ employeeId: '', name: '', role: '', phone: '' });

  } catch (err) {
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Error',
      message: err.message || 'Failed to add user. Please try again.'
    });
  }
};
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
          <div className=" mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-start">
            <button
              onClick={() => navigate('/dashboard')}
              className="group p-2 rounded-xl bg-white/50 border border-white/60 hover:bg-white hover:shadow-md transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600 group-hover:text-fuchsia-700 transition-colors" />
              <span className="text-slate-600 font-semibold group-hover:text-fuchsia-700 transition-colors">Back to Dashboard</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl shadow-purple-900/5 p-8 sm:p-10">
            <div className="flex items-center justify-center mb-8 gap-4">
              <div className="p-4 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-2xl shadow-lg shadow-fuchsia-900/20">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Add New User</h2>
                <p className="text-slate-500">Create a new account for system access</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Employee ID <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="employeeId"
                    value={userForm.employeeId}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-white/80 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all shadow-sm"
                    placeholder="e.g. 12345"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={userForm.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-white/80 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all shadow-sm"
                    placeholder="e.g. Abebe Kebede"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Role <span className="text-rose-500">*</span></label>
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-white/80 border border-white/50 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all shadow-sm appearance-none"
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userForm.phone}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-white/80 border border-white/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-fuchsia-100 focus:border-fuchsia-500 transition-all shadow-sm"
                    placeholder="e.g. 0911234567"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-fuchsia-900/20 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 transform"
                >
                  Add User
                </button>
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
        onConfirm={modal.onConfirm}
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

export default AddUserPage;