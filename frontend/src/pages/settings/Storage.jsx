import {
    Cloud,
    HardDrive,
    Download,
    DatabaseBackup,
    Trash2,
} from 'lucide-react';
import GlassCard from '../../components/GlassCard';

export default function Storage() {
    return (
        <div className="settings-subpage">
            <GlassCard className="premium-card storage-hero">
                <Cloud size={28} />

                <div>
                    <h2>Cloud Storage</h2>
                    <p>Cloudinary stores your memories securely.</p>
                </div>
            </GlassCard>

            <GlassCard className="premium-card">
                <StorageItem title="Photos" value="2.4 GB" />
                <StorageItem title="Videos" value="860 MB" />
                <StorageItem title="Letters" value="40 KB" />
                <StorageItem title="Timeline" value="18 KB" />

                <div className="storage-progress">
                    <div className="storage-bar"></div>
                </div>

                <small>Used 3.3 GB of Unlimited Couple Storage 💖</small>
            </GlassCard>

            <GlassCard className="premium-card export-card">
                <button className="export-btn pink">
                    <Download size={18} /> Export Love Story PDF
                </button>

                <button className="export-btn purple">
                    <DatabaseBackup size={18} /> Download ZIP Backup
                </button>

                <button className="export-btn blue">
                    <HardDrive size={18} /> Export JSON Backup
                </button>
            </GlassCard>

            <GlassCard className="premium-card danger-zone">
                <h3>Danger Zone</h3>

                <button className="danger-button full-width">
                    <Trash2 size={16} /> Delete All Memories
                </button>
            </GlassCard>
        </div>
    );
}

function StorageItem({ title, value }) {
    return (
        <div className="storage-item">
            <span>{title}</span>
            <strong>{value}</strong>
        </div>
    );
}