// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { CalendarIcon, ClockIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
// import { useNavigate } from 'react-router-dom';

// const formatDate = (dateStr) => {
//   return new Intl.DateTimeFormat('en-GB', { 
//     day: '2-digit', 
//     month: 'short', 
//     year: 'numeric' 
//   }).format(new Date(dateStr));
// };

// const getShiftLabel = (shift) => shift === 'I' ? 'Shift I' : 'Shift II';

// const MyAssignmentsPage = () => {
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.user);
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const today = new Date().toISOString().split('T')[0];
//   const weekStart = new Date();
//   weekStart.setDate(weekStart.getDate() - weekStart.getDay());
//   const weekStartStr = weekStart.toISOString().split('T')[0];

//   useEffect(() => {
//     const fetchMyAssignments = async () => {
//       try {
//         const res = await fetch('/api/assignments/my-assignments');
//         const data = await res.json();
//         console.log("My Assignments Data:", data);
//         if (res.ok) {
//           setAssignments(data.assignments || []);
//         }
//       } catch (err) {
//         console.error("Failed to load your assignments");
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     if (user) fetchMyAssignments();
//   }, [user]);
//   console.log("user to this ",user)
//   // FIRST: Get only assignments where current user is involved
// const myAssignments = assignments.filter(a => 
//   [a.officer1Id, a.officer2Id, a.tl1Id, a.tl2Id].includes(user?.id)
// );

// const todayAssignments = myAssignments.filter(a => 
//   new Date(a.date).toISOString().split('T')[0] === today
// );

// const thisWeekAssignments = myAssignments.filter(a => {
//   const date = new Date(a.date);
//   const dateStr = date.toISOString().split('T')[0];
//   return dateStr >= weekStartStr && dateStr <= today;
// });

// const pastAssignments = myAssignments.filter(a => {
//   const dateStr = new Date(a.date).toISOString().split('T')[0];
//   return dateStr < weekStartStr;
// });

//   const renderTable = (data, title, color) => (
//     <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-${color}-200`}>
//       <div className="flex items-center gap-4 mb-6">
//         {title === 'Today' && <CalendarIcon className={`h-10 w-10 text-${color}-600`} />}
//         {title === 'This Week' && <ClockIcon className={`h-10 w-10 text-${color}-600`} />}
//         {title === 'All History' && <CheckCircleIcon className={`h-10 w-10 text-${color}-600`} />}
//         <h2 className={`text-3xl font-black text-${color}-800`}>{title}</h2>
//         <span className="ml-auto text-2xl font-bold text-gray-700">{data.length}</span>
//       </div>

//       {data.length === 0 ? (
//         <p className="text-center text-gray-500 py-12 text-lg">No assignments {title.toLowerCase()}.</p>
//       ) : (
//         <div className="overflow-x-auto rounded-2xl border border-gray-200">
//           <table className="w-full text-sm lg:text-base">
//             <thead className={`bg-gradient-to-r from-${color}-50 to-${color}-100`}>
//               <tr>
//                 <th className="px-4 py-4 text-left font-bold text-gray-800">Date</th>
//                 <th className="px-4 py-4 text-left font-bold text-gray-800">Branch</th>
//                 <th className="px-4 py-4 text-left font-bold text-gray-800">AO ID</th>
//                 <th className="px-4 py-4 text-left font-bold text-gray-800">Your Role</th>
//                 <th className="px-4 py-4 text-left font-bold text-gray-800">Shift</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {data.map(a => {
//   let role = '';
//   let shift = '';
//   if (a.officer1Id === user.id) { role = 'Officer 1'; shift = a.officer1Shift; }
//   else if (a.officer2Id === user.id) { role = 'Officer 2'; shift = a.officer2Shift; }
//   else if (a.tl1Id === user.id) { role = 'Team Leader 1'; shift = a.tl1Shift; }
//   else if (a.tl2Id === user.id) { role = 'Team Leader 2'; shift = a.tl2Shift; }

//   return (
//     <tr key={a.id} className="hover:bg-gray-50 transition-colors">
//       <td className="px-4 py-4 font-medium">{formatDate(a.date)}</td>
//       <td className="px-4 py-4 font-semibold text-fuchsia-700">{a.branchName}</td>
//       <td className="px-4 py-4">{a.accountOfficerEmployeeId}</td>
//       <td className="px-4 py-4">
//         <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold 
//           ${role.includes('Officer') ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
//           {role}
//         </span>
//       </td>
//       <td className="px-4 py-4 font-bold text-gray-700">{getShiftLabel(shift)}</td>
//     </tr>
//   );
// })}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-fuchsia-800"></div>
//           <p className="mt-6 text-xl font-bold text-fuchsia-800">Loading your assignments...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex flex-col">
//       {/* Blobs */}
//       <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
//       </div>

//       <div className="relative z-10 flex-1 p-6 lg:p-12">
//         <button onClick={() => navigate('/dashboard')} className="mb-8 flex items-center space-x-3 text-fuchsia-800 hover:text-fuchsia-600 font-bold text-lg hover:scale-105 transition-all">
//           <ArrowLeftIcon className="h-6 w-6" />
//           <span>Back to Dashboard</span>
//         </button>

//         <div className="text-center mb-12">
//           <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
//             My Assignments
//           </h1>
//           <p className="mt-4 text-xl text-fuchsia-700 font-medium">
//             Hello, <span className="font-bold">{user.name}</span> ({user.role.replace('_', ' ')})
//           </p>
//         </div>

//         <div className="space-y-12 max-w-7xl mx-auto">
//           {renderTable(todayAssignments, 'Today', 'emerald')}
//           {renderTable(thisWeekAssignments, 'This Week', 'blue')}
//           {renderTable(pastAssignments, 'All History', 'purple')}
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes blob { 0%, 100% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
//         .animate-blob { animation: blob 7s infinite; }
//         .animation-delay-2000 { animation-delay: 2s; }
//       `}</style>
//     </div>
//   );
// };

// export default MyAssignmentsPage;

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CalendarIcon, ClockIcon, CalendarDaysIcon, ArchiveBoxIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date(dateStr));
};

const getShiftLabel = (shift) => shift === 'I' ? 'Shift I' : 'Shift II';

const MyAssignmentsPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  useEffect(() => {
    const fetchMyAssignments = async () => {
      try {
        const res = await fetch('/api/assignments/my-assignments');
        const data = await res.json();
        if (res.ok) setAssignments(data.assignments || []);
      } catch (err) {
        console.error("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyAssignments();
  }, [user]);

  const toDateOnly = (dateStr) => dateStr ? dateStr.split('T')[0] : '';
  
  const today = toDateOnly(new Date().toISOString());
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartStr = thisMonthStart.toISOString().split('T')[0];

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // Group assignments by date + shift + role
  const groupedAssignments = assignments
    .filter(a => [a.officer1Id, a.officer2Id, a.tl1Id, a.tl2Id].includes(user?.id))
    .reduce((acc, a) => {
      const date = toDateOnly(a.date);
      const { role, shift } = (() => {
        if (a.officer1Id === user.id) return { role: 'Officer 1', shift: a.officer1Shift };
        if (a.officer2Id === user.id) return { role: 'Officer 2', shift: a.officer2Shift };
        if (a.tl1Id === user.id) return { role: 'Team Leader 1', shift: a.tl1Shift || 'N/A' };
        if (a.tl2Id === user.id) return { role: 'Team Leader 2', shift: a.tl2Shift || 'N/A' };
        return { role: '', shift: '' };
      })();

      if (!role) return acc;

      const key = `${date}-${shift}-${role}`;
      if (!acc[key]) {
        acc[key] = { date, role, shift, branches: [], aoIds: [] };
      }
      acc[key].branches.push(a.branchName);
      acc[key].aoIds.push(a.accountOfficerEmployeeId);
      return acc;
    }, {});

  const groupedList = Object.values(groupedAssignments);

  const filteredAssignments = groupedList
    .filter(a => {
      if (filter === 'today') return a.date === today;
      if (filter === 'week') return a.date >= weekStartStr && a.date <= today;
      if (filter === 'month') return a.date >= monthStartStr;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-fuchsia-800"></div>
          <p className="mt-6 text-xl font-bold text-fuchsia-800">Loading your assignments...</p>
        </div>
      </div>
    );
  }

   const handleBack = () => {
    navigate('/dashboard');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 flex flex-col">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-0">
       <header className="bg-white/95 backdrop-blur-2xl border-b border-fuchsia-800/20 shadow-sm z-20 w-full flex-shrink-0">
                 <div className="max-w-7xl  px-4 sm:px-6 lg:px-8 flex justify-start">
                   
         <div className="flex justify-start py-4 lg:py-6">
           {user?.role !== 'USER' && (
           <button 
                onClick={handleBack} 
                className="flex items-center space-x-2 text-fuchsia-800 hover:text-fuchsia-600 font-semibold transition-all duration-300 hover:scale-105"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
           )}
         </div>
       
                 </div>
               </header>
       

        {/* Filter Tabs */}
        <div className="flex md:flex-row md:gap-64 mb-8 mt-6 flex-col gap-6 ">
          <div className="px-6 py-5 border-b border-gray-200 ">
            <h2 className="text-2xl lg:text-3xl font-black text-fuchsia-800">
              My Assignments
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 ">
          {[
            { key: 'today', label: 'Today', icon: CalendarIcon, color: 'emerald' },
            { key: 'week', label: 'This Week', icon: ClockIcon, color: 'blue' },
            { key: 'month', label: 'This Month', icon: CalendarDaysIcon, color: 'violet' },
            { key: 'all', label: 'All Time', icon: ArchiveBoxIcon, color: 'rose' },
          ].map(({ key, label, icon: Icon, color }) => {
            const count = groupedList.filter(a => {
              if (key === 'today') return a.date === today;
              if (key === 'week') return a.date >= weekStartStr && a.date <= today;
              if (key === 'month') return a.date >= monthStartStr;
              return true;
            }).length;

            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm lg:text-base transition-all shadow-md focus:outline-none focus:ring-0
  ${filter === key 
    ? `bg-gradient-to-r from-${color}-600 to-${color}-700 text-white shadow-lg` 
    : 'bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900'
  }`}
              >
                <Icon className="h-5 w-5" />
                {label} ({count})
              </button>
            );
          })}
          </div>
        </div>

        {/* Single Clean Table */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden  md:mx-8 lg:mx-12 xl:mx-16">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <ArchiveBoxIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl">No assignments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-xs lg:text-sm">
                <thead className="bg-gradient-to-r from-fuchsia-100 to-rose-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-fuchsia-900">Date</th>
                    <th className="px-6 py-4 text-left font-bold text-fuchsia-900">Branches</th>
                    <th className="px-6 py-4 text-left font-bold text-fuchsia-900">AO IDs</th>
                    <th className="px-6 py-4 text-left font-bold text-fuchsia-900">Your Role</th>
                    <th className="px-6 py-4 text-left font-bold text-fuchsia-900">Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssignments.map((a, i) => (
                    <tr key={i} className="hover:bg-fuchsia-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{formatDate(a.date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {a.branches.map((b, idx) => (
                            <span key={idx} className="px-3 py-1 bg-fuchsia-100 text-fuchsia-800 rounded-full text-xs font-medium">
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {a.aoIds.map((id, idx) => (
                            <span key={idx} className="px-6 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                              {id}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold 
                          ${a.role.includes('Officer') ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}`}>
                          {a.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700">{getShiftLabel(a.shift)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob { 0%, 100% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
};

export default MyAssignmentsPage;