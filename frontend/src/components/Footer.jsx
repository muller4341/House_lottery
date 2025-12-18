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
          <p className="text-sm text-amber-500">
            © {currentYear}{' '}
            <span className="font-bold text-amber-500 bg-clip-text ">
              Commercial Bank of Ethiopia
            </span>
            . All rights reserved.
          </p>

          <p className="text-xs text-amber-500 font-medium tracking-wider">
            Powered by CBE CKYC Solutions.
          </p>

          <div className="flex justify-center items-center gap-4 border-t border-amber-500 pt-4">
            <div className="h-px text-amber-500 flex-1"></div>
            <span className="text-xs text-amber-500  font-bold">SECURE • FAST • COMPLIANT</span>
            <div className="h-px text-amber-500 flex-1"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;