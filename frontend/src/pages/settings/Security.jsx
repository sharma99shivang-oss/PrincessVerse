import { useState } from 'react';
import {
    LockKeyhole,
    ShieldCheck,
    Smartphone,
    Laptop,
    Globe,
    LogOut,
    Eye,
    EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client';
import GlassCard from '../../components/GlassCard';

export default function Security() {
    const [show, setShow] = useState(false);

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const savePassword = async (e) => {
        e.preventDefault();

        if (form.newPassword !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            await client.patch('/settings/change-password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            toast.success('Password updated successfully 💖');

            setForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password update failed');
        }
    };

    return (
        <div className="settings-subpage">
            <GlassCard className="security-card premium-card">
                <div className="settings-heading">
                    <ShieldCheck size={22} />
                    <div>
                        <h2>Change Password</h2>
                        <p>Your account stays protected.</p>
                    </div>
                </div>

                <form className="auth-form" onSubmit={savePassword}>
                    {['currentPassword', 'newPassword', 'confirmPassword'].map((key) => (
                        <label key={key}>
                            {key.replace(/([A-Z])/g, ' $1')}
                            <div className="password-box">
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={form[key]}
                                    onChange={(e) =>
                                        setForm({ ...form, [key]: e.target.value })
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                >
                                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </label>
                    ))}

                    <button className="primary-button">
                        <LockKeyhole size={17} />
                        Update Password
                    </button>
                </form>
            </GlassCard>

            <GlassCard className="premium-card">
                <div className="settings-heading">
                    <Globe size={20} />
                    <div>
                        <h2>Active Sessions</h2>
                        <p>Devices currently logged into PrincessVerse.</p>
                    </div>
                </div>

                <SessionCard
                    icon={Laptop}
                    name="Windows Chrome"
                    current
                    location="Bareilly, India"
                />

                <SessionCard
                    icon={Smartphone}
                    name="Android Chrome"
                    location="Last Active Today"
                />

                <button className="danger-button full-width">
                    <LogOut size={16} /> Logout All Devices
                </button>
            </GlassCard>
        </div>
    );
}

function SessionCard({ icon: Icon, name, location, current }) {
    return (
        <div className="session-card">
            <div className="session-left">
                <Icon size={22} />
                <div>
                    <strong>{name}</strong>
                    <small>{location}</small>
                </div>
            </div>

            {current ? (
                <span className="current-device">Current</span>
            ) : (
                <button className="logout-small">Logout</button>
            )}
        </div>
    );
}