// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Houses from "./pages/Houses";
// import Applicants from "./pages/Applicants";
// import Lottery from "./pages/Lottery";

// // Simple Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token"); // Check if user is logged in
  
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }
  
//   return children;
// };

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />
        
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
        
//         <Route
//           path="/houses"
//           element={
//             <ProtectedRoute>
//               <Houses />
//             </ProtectedRoute>
//           }
//         />
        
//         <Route
//           path="/applicants"
//           element={
//             <ProtectedRoute>
//               <Applicants />
//             </ProtectedRoute>
//           }
//         />
        
//         <Route
//           path="/lottery"
//           element={
//             <ProtectedRoute>
//               <Lottery />
//             </ProtectedRoute>
//           }
//         />

//         {/* Redirect unknown routes to dashboard */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;

// App.jsx — House Lottery System
import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Houses from './pages/Houses';
import Applicants from './pages/Applicants';
import Lottery from './pages/Lottery';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT ROUTE = LOGIN */}
        <Route path="/" element={<Dashboard/>} />

        {/* PUBLIC ROUTE */}
        {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/dashboard" element={<Dashboard />} />

        {/* ALL PROTECTED ROUTES — ONLY ADMIN CAN ACCESS */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

          {/* Main Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/houses" element={<Houses />} />
          <Route path="/applicants" element={<Applicants />} />
          <Route path="/lottery" element={<Lottery />} />

          {/* Future Pages (you can add later) */}
          {/* <Route path="/results" element={<LotteryResults />} /> */}
          {/* <Route path="/reports" element={<ReportsPage />} /> */}

        </Route>

        {/* ANY UNKNOWN URL → REDIRECT TO LOGIN */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;