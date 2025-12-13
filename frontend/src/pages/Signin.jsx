// import React, { useState } from 'react';
// import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// const Signin = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//    submitted: false
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     if (error) setError('');
//   };
  

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!formData.username || !formData.password) {
//     setError('Username and password are required!');
//     return;
//   }

//   setLoading(true);
//   setError('');
//   setSuccess(false);

//   try {
//     const response = await fetch('/api/auth/signin', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify(formData),
//     });

//     const data = await response.json();

//     if (response.ok && data.success && data.user) {
//       localStorage.setItem('cbeUser', JSON.stringify(data.user));
//       setSuccess(true);
//       setTimeout(() => {
//         window.location.href = '/dashboard';
//       }, 1500);
//     } else {
//       throw new Error(data.message || 'Invalid credentials');
//     }
//   } catch (err) {
//     setSuccess(false);
//     setError(`ACCESS DENIED\n\n${err.message}\n\nContact IT Support if needed.`);
//   } finally {
//     setLoading(false);
//   }
// };
//   return (
//     <div className="h-screen w-screen flex items-center justify-center bg-fuchsia-800 overflow-hidden">
//       {/* Animated Background Particles - FUCHSIA-800 Edition */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/25 to-pink-600/25 rounded-full blur-3xl animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/25 via-pink-700/25 to-fuchsia-800/25 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
//         <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/20 to-fuchsia-800/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center  lg:py-0 relative z-10">
//         {/* Left Side - Full Background Image */}
        
// {/* Left Side - Background Image + CBE Branding Overlay */}
// <div className=" w-full lg:w-1/2 h-full relative overflow-hidden">
//   {/* Background Image */}
//   <img 
//     src="/home.png" 
//     alt="CBE KYC Welcome" 
//     className="absolute inset-0 w-full h-full object-cover"
//   />

//   {/* Dark overlay for readability */}
//   <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

//   {/* CBE Branding - Centered & Beautiful */}
//   <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8">
    
//     {/* CBE Logo */}
//     <div className="mb-8 w-28 h-28 lg:w-36 lg:h-36 bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/30">
//       <svg className="w-14 h-14 lg:w-20 lg:h-20 text-white drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//       </svg>
//     </div>

//     {/* Title */}
//     <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black mb-4 drop-shadow-2xl">
//       CBE KYC
//     </h1>

//     {/* Bank Name */}
//     <div className="text-center mb-6 flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
//       <img 
//   src="/cbe.png" 
//   alt="Commercial Bank of Ethiopia" 
//   className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-6 object-contain drop-shadow-2xl 
//              animate-pulse-slow"
// />
//       <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black text-amber-400 drop-shadow-2xl">
//         Commercial Bank of Ethiopia
//       </h2>
//     </div>

//     {/* Tagline */}
//     <p className="text-lg lg:text-xl xl:text-2xl font-medium italic opacity-90 drop-shadow-xl">
//       Secure • Fast • Enterprise Authentication
//     </p>
//   </div>
// </div>

//         {/* Right Side - Login Form */}
//         <div className="w-full lg:w-1/2 h-auto lg:h-full flex items-center justify-center px-6 lg:px-8 xl:px-12 py-8 lg:py-24 xl:py-24 bg-fuchsia-800 lg:bg-transparent">
//           <div className="w-full max-w-sm lg:max-w-md flex flex-col items-center">
    
//     {/* TITLE - CENTERED */}
//     <div className="text-center mb-10">
//       <h1 className="text-2xl lg:text-3xl  font-black leading-tight">
//         <span className="text-white">Daily Assigned CKYC</span>
//         <br />
//         <span className="text-white">Authorizer List</span>
//       </h1>
      
//     </div>
            

//          {/* Login Form Card – FINAL & FLAWLESS */}
// <div className="bg-white/95 backdrop-blur-2xl shadow-2xl rounded-2xl border border-fuchsia-800/20 shadow-fuchsia-800/10 
//                     p-8 lg:p-12 w-full flex flex-col justify-center relative">

//   {/* Success Overlay */}
//   {success && (
//     <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/95 to-teal-600/95 backdrop-blur-md rounded-3xl flex items-center justify-center z-50 animate-pulse">
//       <div className="text-center text-white">
//         <svg className="mx-auto h-24 w-24 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//         <h2 className="text-4xl lg:text-5xl font-black">Login Successful!</h2>
//         <p className="mt-4 text-xl opacity-90">Welcome back to CBE KYC</p>
        
//       </div>
//     </div>
//   )}

//   {/* Server Error */}
//   {error && (
//     <div className="mb-8 p-2 bg-gradient-to-r from-rose-50/90 to-pink-50/90 border-2 border-rose-300/50 rounded-3xl text-center shadow-lg">
//       <p className="text-rose-700 font-bold text-sm whitespace-pre-line">{error}</p>
//     </div>
//   )}

//   <form onSubmit={handleSubmit} className="space-y-12 lg:space-y-16 xl:space-y-20">

//     {/* Username Field */}
//     <div>
//       <label htmlFor="username" className="block text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-6">
//         <span className="inline-flex items-center px-6 py-3  text-base lg:text-lg font-bold text-fuchsia-800 ">
//           CBE Username
//         </span>
//       </label>
//       <div className="relative">
//         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
//           <svg className="h-8 w-8 lg:h-10 lg:w-10 text-fuchsia-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//           </svg>
//         </div>
//         <input
//           type="text"
//           id="username"
//           name="username"
//           value={formData.username}
//           onChange={handleChange}
//           className="w-full pl-20 pr-6 py-6 sm:py-2 lg:py-7 text-lg sm:text-base lg:text-xl xl:text-2xl 
//                      border border-fuchsia-800/20 bg-gradient-to-r from-fuchsia-800/5 via-white/95 to-rose-700/5 
//                      focus:outline-none rounded-2xl focus:ring-0 focus:ring-fuchsia-800/40 focus:border-fuchsia-800 
//                      transition-all duration-300 shadow-xl hover:shadow-2xl hover:border-fuchsia-800/60 
//                      font-medium"
//           placeholder={formData.submitted && !formData.username ? "This field is required" : "Enter your CBE username"}
//           style={{ 
//             color: formData.submitted && !formData.username ? '#dc2626' : 'inherit',
//             fontStyle: formData.submitted && !formData.username ? 'italic' : 'normal',
//             fontSize: formData.submitted && !formData.username ? '0.875rem' : '1rem',
//           }}
//           disabled={loading}
//           required
//           autoComplete="username"
//         />
//       </div>
//     </div>

//     {/* Password Field */}
//     <div>
//       <label htmlFor="password" className="block text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-6">
//         <span className="inline-flex items-center px-8 py-3  text-base lg:text-lg font-bold text-rose-800 ">
//           Password
//         </span>
//       </label>
//       <div className="relative">
//         <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
//           <svg className="h-8 w-8 lg:h-10 lg:w-10 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//           </svg>
//         </div>
//         <input
//           type={showPassword ? 'text' : 'password'}
//           id="password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//           className="w-full pl-20 pr-20 py-6 sm:py-2 lg:py-7  text-lg sm:text-base lg:text-xl xl:text-2xl 
//                      border border-fuchsia-800/20 bg-gradient-to-r from-rose-700/5 via-white/95 to-fuchsia-800/5 
//                      focus:outline-none rounded-2xl focus:ring-0 focus:ring-rose-800/40 focus:border-rose-800 
//                      transition-all duration-300 shadow-xl hover:shadow-2xl hover:border-rose-800/60 
//                      font-medium 
//                     appearance-none
// [&::-webkit-password-eye]:hidden     
// [&::-ms-reveal]:hidden                
// [&::-ms-clear]:hidden"
//           placeholder={formData.submitted && !formData.password ? "This field is required" : "Enter your password"}
//           style={{ 
//             color: formData.submitted && !formData.password ? '#dc2626' : 'inherit',
//             fontStyle: formData.submitted && !formData.password ? 'italic' : 'normal',
//             fontSize: formData.submitted && !formData.password ? '0.875rem' : '1rem',
//           }}
//           disabled={loading}
//           required
//           autoComplete="current-password"
//         />

//         {/* Eye Icon */}
//        <div 
//   onClick={() => !loading && setShowPassword(!showPassword)}
//   className="absolute inset-y-0 right-0 pr-6 flex items-center cursor-pointer select-none group"
//   title={showPassword ? "Hide password" : "Show password"}
//   role="button"
//   tabIndex={0}
//   onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !loading && setShowPassword(!showPassword)}
// >
//   <div className="p-3 -m-3 rounded-full transition-all duration-300 group-hover:bg-rose-800/10 group-active:scale-90">
//     {showPassword ? (
//       <EyeIcon className="h-7 w-7 lg:h-8 lg:w-8 text-fuchsia-600 group-hover:text-fuchsia-700" />
//     ) : (
//       <EyeSlashIcon className="h-7 w-7 lg:h-8 lg:w-8 text-rose-600 group-hover:text-rose-700" />
//     )}
//   </div>
// </div>
//       </div>
//     </div>

//     {/* Submit Button */}
//     <button
//       type="submit"
//       disabled={loading}
//       onClick={() => setFormData(prev => ({ ...prev, submitted: true }))}
//       className={`
//         group relative w-full py-9 lg:py-11 xl:py-14 rounded-3xl text-2xl lg:text-3xl xl:text-4xl font-black text-white
//         shadow-3xl shadow-fuchsia-800/60 transition-all duration-500 overflow-hidden
//         ${loading ? 'bg-gradient-to-r from-gray-500 to-gray-600 cursor-not-allowed' 
//           : 'bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 hover:from-fuchsia-900 hover:via-rose-800 hover:to-pink-800 hover:shadow-4xl hover:scale-105 active:scale-95'
//         }
//       `}
//     >
//       <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
//       {loading ? 'Authenticating...' : 'Sign In to CBE KYC'}
//     </button>
//   </form>
// </div>
//           </div>
//         </div>
//       </div>

      

//       {/* Custom CSS for Animations */}
//       <style>{`
//   @keyframes blob {
//     0% { transform: translate(0px, 0px) scale(1); }
//     33% { transform: translate(30px, -50px) scale(1.1); }
//     66% { transform: translate(-20px, 20px) scale(0.9); }
//     100% { transform: translate(0px, 0px) scale(1); }
//   }
//   .animate-blob {
//     animation: blob 7s infinite;
//   }
//   .animation-delay-2000 {
//     animation-delay: 2s;
//   }
//   .animation-delay-4000 {
//     animation-delay: 4s;
//   }
// @keyframes pulse-slow {
//   0%, 100% {
//     transform: scale(1);
//   }
//   50% {
//     transform: scale(1.12);
//   }
// }

// .animate-pulse-slow {
//   animation: pulse-slow 6s ease-in-out infinite;
// }
// `

// }</style>

//     </div>
//   );
// };

// export default Signin;


// pages/Signin.jsx — FULL SCREEN + BLACK TEXT + PERFECT FOR LARGE DEVICES
import React, { useState, useEffect } from 'react';

const Signin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ employeeId: employeeId.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Backend not running? Check console.');
    } finally {
      setLoading(false);
    }
  };

  // At the very top of Signin component, after imports
useEffect(() => {
  // Force clear everything when signin page loads
  localStorage.clear();
  document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}, []);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 relative overflow-hidden">
      
      {/* Full-Screen Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-fuchsia-800/20 to-pink-600/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 lg:w-[700px] lg:h-[700px] bg-gradient-to-tr from-rose-800/20 via-pink-700/20 to-fuchsia-800/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-10 w-80 h-80 lg:w-[550px] lg:h-[550px] bg-gradient-to-br from-pink-800/15 to-fuchsia-800/15 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Full Width Content */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 xl:px-20 2xl:px-32 flex items-center justify-center min-h-screen">

        <div className="w-full max-w-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-28 h-28 lg:w-36 lg:h-36 bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 rounded-full shadow-2xl ring-12 ring-fuchsia-800/30">
              <svg className="w-16 h-16 lg:w-20 lg:h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="mt-8 text-6xl lg:text-8xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
              CBE KYC
            </h1>
            <p className="mt-4 text-2xl lg:text-3xl font-bold text-fuchsia-800">Development Sign In</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-10 bg-emerald-50/90 backdrop-blur-xl border-2 border-emerald-300 rounded-3xl p-8 text-center shadow-2xl">
              <p className="text-3xl lg:text-4xl font-black text-emerald-800">Welcome Back!</p>
              <p className="text-xl text-emerald-700 mt-3">Redirecting to dashboard...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-10 bg-rose-50/90 backdrop-blur-xl border-2 border-rose-300 rounded-3xl p-8 text-center shadow-2xl">
              <p className="text-2xl lg:text-3xl font-black text-rose-800">{error}</p>
            </div>
          )}

          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-fuchsia-800/20 p-10 lg:p-16">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div>
                <label className="block text-2xl lg:text-3xl font-black text-gray-900 mb-6">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-8 py-7 text-2xl lg:text-3xl font-bold text-black bg-gradient-to-r from-fuchsia-50/70 to-pink-50/70 
                           border-4 border-fuchsia-800/40 rounded-3xl 
                           focus:outline-none focus:ring-4 focus:ring-fuchsia-800/50 focus:border-fuchsia-800 
                           placeholder-gray-600 shadow-xl transition-all duration-300"
                  placeholder="CBE12345"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !employeeId.trim()}
                className={`w-full py-8 rounded-3xl font-black text-3xl lg:text-4xl text-white shadow-2xl transition-all duration-500 
                  ${loading || !employeeId.trim()
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 hover:shadow-3xl hover:scale-105 active:scale-95'
                  }`}
              >
                {loading ? 'Signing In...' : 'Enter Dashboard'}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-lg lg:text-xl font-bold text-fuchsia-800">Development Mode</p>
              <p className="text-gray-600 mt-2">Just type any registered Employee ID</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-lg lg:text-xl text-gray-700">
              © {new Date().getFullYear()}{' '}
              <span className="font-black bg-gradient-to-r from-fuchsia-800 to-pink-700 bg-clip-text text-transparent">
                Commercial Bank of Ethiopia
              </span>
            </p>
            <p className="text-fuchsia-700 font-bold mt-2">Enterprise KYC Platform • Dev Build</p>
          </div>
        </div>
      </div>

      {/* Blob Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        .animate-blob { animation: blob 15s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Signin;

