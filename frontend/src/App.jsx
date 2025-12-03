// App.jsx — FINAL VERSION WITH NAVBAR & FOOTER
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signin from './pages/Signin';
import Dashboard from './pages/Dashboard';
import AssignmentPage from './pages/AssignmentPage';
import AddUserPage from './pages/AddUserPage';
import AssignmentViewPage from './pages/AssignmentViewPage';
import BranchManagementPage from './pages/BranchManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // We'll create this next
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchCurrentUser } from './redux/user/userSlice';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES — NO NAVBAR/FOOTER */}
        <Route path="/" element={<Signin />} />
        <Route path="/signin" element={<Signin />} />

        {/* PROTECTED ROUTES — WITH NAVBAR + FOOTER */}
        <Route
          path="/*"
          element={
            <ProtectedLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/daily-assignment" element={<AssignmentPage />} />
                <Route path="/add-user" element={<AddUserPage />} />
                <Route path="/assignment-view" element={<AssignmentViewPage />} />
                <Route path="/branch-management" element={<BranchManagementPage />} />
                {/* Optional: fallback */}
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </ProtectedLayout>
          }
        />
      </Routes>
    </Router>
  );
}

// In App.jsx — inside ProtectedLayout
const ProtectedLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  return (
   <div className="min-h-screen flex flex-col bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50">
  <Navbar />  {/* This is fixed/sticky → stays on top */}

  {/* ADD pt-20 (or pt-24) HERE → pushes content below navbar */}
  <main className="flex-1 pt-20 lg:pt-24 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 w-full">
    <div className="w-full">
      {children}
    </div>
  </main>

  <Footer />
</div>
  );
};

export default App;