// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('cbeUser');
  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;