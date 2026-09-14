import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
export default function Security() { return <><PageHeader eyebrow="Keep your universe safe" title="Security center" subtitle="Protect your account and shared memories." /><div className="settings-list"><GlassCard className="setting-row"><span className="setting-icon"><LockKeyhole /></span><div><h3>Password</h3><p>Change your password and keep access private.</p></div><Link to="/first-login" className="soft-button">Change</Link></GlassCard><GlassCard className="setting-row"><span className="setting-icon"><ShieldCheck /></span><div><h3>Session security</h3><p>JWT access and HTTP-only refresh sessions are active.</p></div><span className="date-chip">Protected</span></GlassCard></div></>; }
