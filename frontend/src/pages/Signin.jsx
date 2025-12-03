import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Signin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.username || !formData.password) {
    setError('Username and password are required!');
    return;
  }

  setLoading(true);
  setError('');
  setSuccess(false);

  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok && data.success && data.user) {
      localStorage.setItem('cbeUser', JSON.stringify(data.user));
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      throw new Error(data.message || 'Invalid credentials');
    }
  } catch (err) {
    setSuccess(false);
    setError(`ACCESS DENIED\n\n${err.message}\n\nContact IT Support if needed.`);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-pink-50/90 overflow-hidden">
      {/* Animated Background Particles - FUCHSIA-800 Edition */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-fuchsia-800/25 to-pink-600/25 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-800/25 via-pink-700/25 to-fuchsia-800/25 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-72 h-72 bg-gradient-to-br from-pink-800/20 to-fuchsia-800/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full h-full flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-0 relative z-10">
        {/* Left Side - Logo & Branding */}
        <div className="w-full lg:w-1/2 xl:w-2/5 h-auto lg:h-full flex flex-col items-center justify-center text-center px-4 lg:px-8 xl:px-12 py-8 lg:py-12 xl:py-16">
          {/* CBE Logo - FUCHSIA-800 */}
          <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 2xl:w-44 2xl:h-44 bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 rounded-full flex items-center justify-center shadow-2xl shadow-fuchsia-800/50 ring-2 ring-fuchsia-800/40">
            <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 2xl:w-22 2xl:h-22 text-white drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          {/* Title - FUCHSIA-800 Gradient */}
          <h1 className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-14 2xl:mt-16 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent leading-tight">
            CBE KYC
          </h1>
          
          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12 max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-700 font-semibold">
            Commercial Bank of Ethiopia
          </p>
          
          {/* Tagline */}
          <p className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 max-w-2xl mx-auto text-xs sm:text-sm md:text-base lg:text-lg text-fuchsia-800/80 font-medium italic">
            Secure • Fast • Enterprise Authentication
          </p>
          
          {/* Features - FUCHSIA-800 */}
          <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 max-w-2xl w-full">
            <div className="flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 bg-gradient-to-r from-fuchsia-800/10 to-rose-700/10 rounded-2xl border border-fuchsia-800/20 backdrop-blur-sm shadow-lg shadow-fuchsia-800/5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-fuchsia-800 to-rose-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-fuchsia-800/30">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">LDAP Auth</p>
                <p className="text-xs sm:text-sm text-fuchsia-800/80">Enterprise Security</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 bg-gradient-to-r from-rose-700/10 to-pink-700/10 rounded-2xl border border-rose-700/20 backdrop-blur-sm shadow-lg shadow-rose-700/5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-700 to-pink-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-700/30">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">Lightning Fast</p>
                <p className="text-xs sm:text-sm text-rose-700/80">Instant Access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-3/5 h-auto lg:h-full flex items-center justify-center px-6 lg:px-8 xl:px-12 py-8 lg:py-12 xl:py-16">
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
            {/* Success Message */}
            {success && (
              <div className="mb-8 lg:mb-10 xl:mb-12 bg-gradient-to-r from-emerald-50 to-fuchsia-50/80 border-2 border-emerald-200/50 rounded-3xl p-6 lg:p-8 xl:p-10 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 lg:h-10 lg:w-10 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4 lg:ml-6">
                    <p className="text-lg lg:text-xl xl:text-2xl font-bold text-emerald-800">
                      🎉 Login Successful!
                    </p>
                    <p className="text-sm lg:text-base text-emerald-700 mt-1">
                      Redirecting to Dashboard...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-8 lg:mb-10 xl:mb-12 bg-gradient-to-r from-rose-50/80 to-fuchsia-50/80 border-2 border-rose-200/50 rounded-3xl p-6 lg:p-8 xl:p-10 shadow-2xl shadow-rose-500/10 backdrop-blur-xl">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-8 w-8 lg:h-10 lg:w-10 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4 lg:ml-6">
                    <p className="text-lg lg:text-xl xl:text-2xl font-bold text-rose-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form Card - FUCHSIA-800 */}
            <div className="bg-white/95 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 lg:p-10 xl:p-12 2xl:p-14 border border-fuchsia-800/20 shadow-fuchsia-800/10">
              <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 xl:space-y-10">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-base lg:text-lg xl:text-xl font-bold text-gray-800 mb-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-fuchsia-800/10 via-rose-700/10 to-pink-700/10 text-fuchsia-800 border border-fuchsia-800/20 shadow-sm">
                      👤 CBE Username
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <svg className="h-6 w-6 lg:h-7 lg:w-7 text-fuchsia-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-12 lg:pl-14 xl:pl-16 pr-4 lg:pr-6 xl:pr-8 py-4 lg:py-5 xl:py-6 border-2 border-fuchsia-800/20 bg-gradient-to-r from-fuchsia-800/5 via-white/95 to-rose-700/5 rounded-2xl focus:ring-4 focus:ring-fuchsia-800/30 focus:border-fuchsia-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-fuchsia-800/40 text-base lg:text-lg xl:text-xl placeholder-fuchsia-700/60 font-medium"
                      placeholder="mulukenwalle"
                      disabled={loading}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-base lg:text-lg xl:text-xl font-bold text-gray-800 mb-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-rose-700/10 via-pink-700/10 to-fuchsia-800/10 text-rose-800 border border-rose-700/20 shadow-sm">
                      🔒 Password
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <svg className="h-6 w-6 lg:h-7 lg:w-7 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 lg:pl-14 xl:pl-16 pr-12 lg:pr-14 xl:pr-16 py-4 lg:py-5 xl:py-6 border-2 border-fuchsia-800/20 bg-gradient-to-r from-rose-700/5 via-white/95 to-fuchsia-800/5 rounded-2xl focus:ring-4 focus:ring-rose-800/30 focus:border-rose-800 transition-all duration-300 shadow-lg 
                      hover:shadow-xl hover:border-fuchsia-800/40 text-black lg:text-lg xl:text-xl placeholder-rose-700/60 font-medium"
                      placeholder="Enter your CBE password"
                      disabled={loading}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 lg:pr-4 xl:pr-5 flex items-center hover:bg-fuchsia-800/10 rounded-2xl p-2 lg:p-3 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-fuchsia-800/20"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-6 w-6 lg:h-7 lg:w-7 text-rose-800 hover:text-rose-900" />
                      ) : (
                        <EyeIcon className="h-6 w-6 lg:h-7 lg:w-7 text-fuchsia-800 hover:text-fuchsia-900" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button - FUCHSIA-800 MASTERPIECE */}
                <button
                  type="submit"
                  disabled={loading || !formData.username || !formData.password}
                  className={`
                    group relative w-full flex justify-center items-center py-5 lg:py-6 xl:py-7 px-8 lg:px-10 xl:px-12 border-2 border-transparent rounded-3xl shadow-2xl shadow-fuchsia-800/40 lg:shadow-fuchsia-800/50
                    text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-black text-white tracking-wide
                    focus:outline-none focus:ring-4 focus:ring-fuchsia-800/50 focus:ring-offset-2 focus:ring-offset-fuchsia-50/50
                    transition-all duration-500 overflow-hidden
                    ${
                      loading || !formData.username || !formData.password
                        ? 'bg-gradient-to-r from-gray-400/80 to-gray-500/80 cursor-not-allowed shadow-lg'
                        : 'bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 hover:from-fuchsia-900 hover:via-rose-800 hover:to-pink-800 hover:shadow-3xl hover:shadow-fuchsia-800/60 hover:scale-105 active:scale-95 hover:-translate-y-1'
                    }
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-800/40 via-rose-700/40 to-pink-700/40 blur opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-800/20 to-pink-700/20 -z-10 animate-pulse"></div>
                  {loading && (
                    <svg className="animate-spin -ml-2 mr-4 lg:mr-5 h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span className="relative z-10 flex items-center">
                    {loading ? '🔐 Authenticating with LDAP...' : '🚀 Sign In to CBE KYC'}
                  </span>
                </button>
              </form>

              {/* Divider - FUCHSIA-800 */}
              <div className="relative my-10 lg:my-12 xl:my-14">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-fuchsia-800/20" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 lg:px-8 xl:px-10 py-3 bg-gradient-to-r from-fuchsia-800/10 via-rose-700/10 to-pink-700/10 border-2 border-fuchsia-800/20 rounded-3xl text-lg lg:text-xl font-bold text-fuchsia-800 shadow-lg backdrop-blur-sm shadow-fuchsia-800/10">
                    🔐 CBE Enterprise Authentication
                  </span>
                </div>
              </div>

              {/* Support - FUCHSIA-800 */}
              <div className="text-center py-8 lg:py-10 xl:py-12">
                <p className="text-sm lg:text-base xl:text-lg text-gray-600 leading-relaxed">
                  Need assistance? Contact our IT Support Team:
                </p>
                <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6">
                  <a 
                    href="mailto:it-support@cbe.com.et" 
                    className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-fuchsia-800 to-rose-700 rounded-2xl text-white font-semibold text-sm lg:text-base xl:text-lg shadow-lg hover:shadow-xl hover:shadow-fuchsia-800/50 hover:scale-105 transition-all duration-300"
                  >
                    📧 it-support@cbe.com.et
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a 
                    href="tel:+251115500000" 
                    className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-700 to-pink-700 rounded-2xl text-white font-semibold text-sm lg:text-base xl:text-lg shadow-lg hover:shadow-xl hover:shadow-rose-700/50 hover:scale-105 transition-all duration-300"
                  >
                    📞 +251-11-550-0000
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs sm:text-sm md:text-base text-gray-600/90 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl border border-fuchsia-800/20 shadow-lg shadow-fuchsia-800/5">
          © 2025{' '}
          <span className="font-bold bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
            Commercial Bank of Ethiopia
          </span>
          . All rights reserved. | Enterprise KYC Platform
        </p>
      </div>

      {/* Custom CSS for Animations */}
      <style>{`
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`}</style>

    </div>
  );
};

export default Signin;

