import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="app-loading"><div className="loading-sparkle">✦</div><p>Opening your kingdom…</p></div>;
  if (user?.isFirstLogin && location.pathname !== '/first-login') return <Navigate to="/first-login" replace />;
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
