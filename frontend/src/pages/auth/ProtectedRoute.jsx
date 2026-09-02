import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppSkeleton } from '../../App';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useSelector(state => state.auth);

  if (!isInitialized) return <AppSkeleton />;
  
  if (!isAuthenticated && location.pathname.startsWith("/dashboard")) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (isAuthenticated && (location.pathname === "/signin" || location.pathname === "/signup" || location.pathname === "/")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
