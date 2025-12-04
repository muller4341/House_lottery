// components/Footer.jsx — FINAL WORKING VERSION
import { useState, useEffect } from 'react';

// components/Footer.jsx — DYNAMIC YEAR ONLY (2025 → 2026 auto-updates!)
const Footer = () => {
  const currentYear = new Date().getFullYear(); // This will be 2025, 2026, etc. automatically

  return (
    <footer className="bg-fuchsia-900 backdrop-blur-2xl border-t border-fuchsia-800/20 mt-auto">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">

          {/* Dynamic Copyright with Current Year */}
          <p className="text-sm text-gray-600">
            © {currentYear}{' '}
            <span className="font-bold bg-gradient-to-r from-fuchsia-800 via-rose-700 to-pink-700 bg-clip-text text-transparent">
              Commercial Bank of Ethiopia
            </span>
            . All rights reserved.
          </p>

          <p className="text-xs text-fuchsia-800/70 font-medium tracking-wider">
            KYC Dashboard • Powered by LDAP Enterprise Authentication
          </p>

          <div className="flex justify-center items-center gap-4">
            <div className="h-px bg-gradient-to-r from-transparent via-fuchsia-800/30 to-transparent flex-1"></div>
            <span className="text-xs text-fuchsia-800/50 font-bold">SECURE • FAST • COMPLIANT</span>
            <div className="h-px bg-gradient-to-r from-transparent via-fuchsia-800/30 to-transparent flex-1"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;