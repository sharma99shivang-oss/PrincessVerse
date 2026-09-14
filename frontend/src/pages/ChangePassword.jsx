import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function ChangePassword() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');
  const submit = async (values) => {
    setBusy(true);
    try { const { data } = await client.post('/auth/change-password', values); setUser(data.user); toast.success('Your new password is ready.'); navigate('/partner/dashboard', { replace: true }); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not update your password.'); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><div className="auth-panel"><Logo /><div className="auth-copy"><span className="eyebrow">One tiny security step</span><h1>Make your password yours.</h1><p>Welcome, {user?.name}. Replace the temporary password before entering your shared universe.</p></div><form onSubmit={handleSubmit(submit)} className="auth-form">{[['currentPassword', 'Temporary password'], ['newPassword', 'New password'], ['confirmPassword', 'Confirm new password']].map(([name, label]) => <label key={name}>{label}<div className="input-wrap"><LockKeyhole size={17} /><input type={visible ? 'text' : 'password'} {...register(name, { required: `${label} is required`, ...(name === 'newPassword' ? { pattern: { value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, message: 'Use 8+ chars with uppercase, number and special character' } } : {}), ...(name === 'confirmPassword' ? { validate: (value) => value === newPassword || 'Passwords do not match' } : {}) })} /><button type="button" className="password-toggle" onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{errors[name] && <small className="field-error">{errors[name].message}</small>}</label>)}<button className="primary-button full" disabled={busy}>{busy ? 'Securing your account…' : 'Save new password'} <Sparkles size={16} /></button></form></div></div>;
}
