// App.jsx — FINAL NATIONAL BANK VERSION (ALL PAGES + DEFAULT SIGNIN)
import React from 'react';
import { Routes, Route, Navigate ,BrowserRouter} from 'react-router-dom';

// Pages
import Signin from './pages/Signin';
import Dashboard from './pages/Dashboard';
import AssignmentPage from './pages/AssignmentPage';
import AddUserPage from './pages/AddUserPage';
import AssignmentViewPage from './pages/AssignmentViewPage';
import BranchManagementPage from './pages/BranchManagementPage';
import MyAssignmentsPage from './pages/MyAssignmentsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
    <Routes>

      {/* DEFAULT ROUTE = SIGNIN */}
      <Route path="/" element={<Signin />} />

      {/* PUBLIC ROUTE */}
      <Route path="/signin" element={<Signin />} />

      {/* ALL PROTECTED ROUTES — ONLY LOGGED IN USERS */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

        {/* MANAGER / TEAM LEADER / ADMIN PAGES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-user" element={<AddUserPage />} />
        <Route path="/daily-assignment" element={<AssignmentPage />} />
        <Route path="/branch-management" element={<BranchManagementPage />} />
        <Route path="/my-assignments" element={<MyAssignmentsPage />} />

        {/* OFFICER PAGE — ProtectedRoute will redirect USER role here */}
        <Route path="/assignment-view" element={<AssignmentViewPage />} />

        {/* Optional: Profile, Reports, etc. */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}

      </Route>

      {/* ANY UNKNOWN URL → BACK TO SIGNIN */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
    </BrowserRouter>
  );
}

export default App;