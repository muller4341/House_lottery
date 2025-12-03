// components/ProtectedRoute.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import { fetchCurrentUser } from '../redux/user/userSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.user);
  const location = useLocation();

  useEffect(() => {
    if (!user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [user, loading, dispatch]);

  if (loading || (!user && !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-3xl font-bold text-fuchsia-800">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  /** ⭐ Only redirect USER role when NOT on assignment-view */
  if (user.role === 'USER' && location.pathname !== '/assignment-view') {
    return <Navigate to="/assignment-view" replace />;
  }

  return children;
};


export default ProtectedRoute;