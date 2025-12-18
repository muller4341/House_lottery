// components/Layout.jsx
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50">
      {/* Navbar — fixed at top */}
      <Navbar />

      {/* Main Content — pushes below navbar */}
      <main className="flex-1 ">
        <Outlet />  {/* This shows Dashboard, AssignmentView, etc. */}
      </main>

      {/* Footer — always at bottom */}
      <Footer />
    </div>
  );
};

export default Layout;