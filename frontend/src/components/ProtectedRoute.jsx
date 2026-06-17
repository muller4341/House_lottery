import React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchCurrentUser } from '../redux/user/userSlice';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);

  useEffect(() => {
    if (!user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [user, loading, dispatch]);

  // While fetching user session, show a loading screen
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--navy-950)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: '3px solid var(--navy-600)',
              borderTopColor: 'var(--gold-500)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
            }}
            className="spin-fast"
          />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;