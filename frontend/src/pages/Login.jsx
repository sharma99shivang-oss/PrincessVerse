import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RoleLogin from './RoleLogin.jsx';

export default function Login() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/partner/dashboard'} replace />;
  return <RoleLogin role="ADMIN" />;
}
