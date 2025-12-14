// 

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const AddUserPage = () => {
  const navigate = useNavigate();

  const [userForm, setUserForm] = useState({
    employeeId: '',
    name: '',
    role: '',
    phone: ''
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
      alert('Please fill required fields');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      if (!res.ok) throw new Error('Failed to add user');
      alert('User added successfully!');
      setUserForm({ employeeId: '', name: '', role: '', phone: '' });
    } catch (err) {
      alert(err.message);
    }
  };

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

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-fuchsia-200 p-10 w-full max-w-2xl">
            <div className="flex items-center justify-center mb-10">
              <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 ml-6">Add New User</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={userForm.employeeId}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-fuchsia-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-fuchsia-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Role *</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-fuchsia-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 text-base"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={userForm.phone}
                  onChange={handleChange}
                  placeholder="e.g. 0912345678"
                  className="w-full px-5 py-4 border-2 border-fuchsia-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 text-base"
                />
              </div>

              <button type="submit" className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Add User
              </button>
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

export default AddUserPage;