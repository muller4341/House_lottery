// components/ProtectedRoute.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchCurrentUser } from '../redux/user/userSlice';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.user);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  if (loading) return <div className="p-8 text-center">Loading user...</div>;
  if (!user) return <Navigate to="/dashboard" />;

  return children;
};

export default ProtectedRoute;