import { useState } from 'react';
import {
    Shield,
    Lock,
    Image,
    EyeOff,
    KeyRound,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';

export default function Privacy() {
    const [vault, setVault] = useState({
        secretAlbum: true,
        blurSensitive: true,
        appLock: false,
        hiddenMemories: false,
    });

    const toggle = (key) => {
        setVault((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className="settings-subpage">
            <GlassCard className="premium-card vault-header">
                <Shield size={26} />
                <div>
                    <h2>Privacy Vault</h2>
                    <p>Your most personal memories stay protected.</p>
                </div>
            </GlassCard>

            <ToggleCard
                icon={Image}
                title="Secret Album"
                desc="Hide private photos & videos from normal gallery."
                active={vault.secretAlbum}
                toggle={() => toggle('secretAlbum')}
            />

            <ToggleCard
                icon={EyeOff}
                title="Blur Sensitive Photos"
                desc="Private memories stay blurred until tapped."
                active={vault.blurSensitive}
                toggle={() => toggle('blurSensitive')}
            />

            <ToggleCard
                icon={Lock}
                title="Hide Memories From Partner"
                desc="Only you can see selected memories."
                active={vault.hiddenMemories}
                toggle={() => toggle('hiddenMemories')}
            />

            <ToggleCard
                icon={KeyRound}
                title="Enable App Lock"
                desc="Open PrincessVerse with a PIN code."
                active={vault.appLock}
                toggle={() => toggle('appLock')}
            />

            {vault.appLock && (
                <GlassCard className="premium-card">
                    <h3>Create 4 Digit PIN</h3>
                    <input placeholder="••••" maxLength={4} />
                    <button className="primary-button">Save PIN</button>
                </GlassCard>
            )}
        </div>
    );
}

function ToggleCard({ icon: Icon, title, desc, active, toggle }) {
    return (
        <GlassCard className="premium-card toggle-card">
            <div className="settings-row">
                <div className="settings-left">
                    <Icon size={22} />
                    <div>
                        <strong>{title}</strong>
                        <p>{desc}</p>
                    </div>
                </div>

                <button
                    onClick={toggle}
                    className={`toggle-switch ${active ? 'active' : ''}`}
                >
                    <span className="toggle-dot"></span>
                </button>
            </div>
        </GlassCard>
    );
}