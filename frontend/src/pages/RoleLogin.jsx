import { useState } from 'react';
import { Eye, EyeOff, Heart, LockKeyhole, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function RoleLogin({ role }) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/partner/dashboard'} replace />;
  const submit = async (values) => {
    setBusy(true);
    try {
      const { user: signedIn } = await login(values);
      if (signedIn.role !== role) {
        await logout();
        throw new Error(`This is a ${signedIn.role === 'ADMIN' ? 'admin' : 'partner'} account.`);
      }
      toast.success(`Welcome back, ${signedIn.name.split(' ')[0]} ✨`);
      navigate(signedIn.isFirstLogin ? '/first-login' : (location.state?.from || (role === 'ADMIN' ? '/admin/dashboard' : '/partner/dashboard')), { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Could not sign in.');
    } finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-decoration pink-orb" /><div className="auth-decoration purple-orb" /><div className="auth-panel"><Logo /><div className="auth-copy"><span className="eyebrow">{role === 'ADMIN' ? 'Keeper access' : 'Partner access'}</span><h1>{role === 'ADMIN' ? 'Your little kingdom awaits.' : 'Welcome to your shared universe.'}</h1><p>Sign in with the mobile number your couple space uses.</p></div><form onSubmit={handleSubmit(submit)} className="auth-form"><label>Mobile number<div className="input-wrap"><Phone size={17} /><input inputMode="numeric" maxLength="10" placeholder="10 digit Indian mobile number" {...register('mobileNumber', { required: 'Mobile number is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10 digit Indian mobile number' } })} /></div>{errors.mobileNumber && <small className="field-error">{errors.mobileNumber.message}</small>}</label><label>Password<div className="input-wrap"><LockKeyhole size={17} /><input type={visible ? 'text' : 'password'} placeholder="Your password" {...register('password', { required: 'Password is required' })} /><button type="button" className="password-toggle" onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors.password && <small className="field-error">{errors.password.message}</small>}</label><button className="primary-button full" disabled={busy}>{busy ? 'Opening your kingdom…' : `Sign in as ${role === 'ADMIN' ? 'Admin' : 'Partner'}`} {role === 'ADMIN' ? <ShieldCheck size={16} /> : <Heart size={16} />}</button></form><div className="auth-switch"><Link to={role === 'ADMIN' ? '/partner-login' : '/admin-login'}><Sparkles size={14} /> Sign in as {role === 'ADMIN' ? 'Partner' : 'Admin'}</Link></div><p className="auth-footer">{role === 'ADMIN' && <>New here? <Link to="/register">Create your couple account</Link></>}</p></div></div>;
}
