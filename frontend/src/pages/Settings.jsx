import { useEffect, useState } from 'react';
import {
  Palette,
  BellRing,
  ShieldCheck,
  LockKeyhole,
  Cloud,
  HeartHandshake,
  MoonStar,
  Download,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';

export default function Settings() {
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    theme: 'princess-pink',
    sweetReminders: true,
    memoriesPrivate: true,
    notificationSound: true,
    backupCloud: true,
    canPartnerDownload: false,
  });

  useEffect(() => {
    client
      .get('/settings')
      .then(({ data }) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === 'theme') {
      document.documentElement.dataset.theme = value;
      localStorage.setItem('pv_theme', value);
    }

    try {
      await client.patch('/settings', { [key]: value });
      toast.success('Saved 💖');
    } catch {
      toast.error('Setting could not be saved');
    }
  };

  if (loading) return <div className="app-loading">Loading settings...</div>;

  return (
    <div className="settings-page premium-settings-page">
      <PageHeader
        eyebrow="PrincessVerse Premium"
        title="Settings"
        subtitle="Customize your love universe ✨"
      />

      <GlassCard className="settings-profile-card">
        <div className="settings-profile-row">
          <div className="settings-avatar">👑</div>
          <div>
            <h2>PrincessVerse Premium</h2>
            <p>Your memories stay private and beautiful.</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="settings-section">
        <div className="settings-heading">
          <Palette size={22} />
          <div>
            <h3>Appearance</h3>
            <small>Blush Glass · Dark Princess · Lavender Dream</small>
          </div>
        </div>

        <div className="theme-grid">
          {[
            ['princess-pink', '🌸 Princess Pink'],
            ['lavender-dream', '💜 Lavender Dream'],
            ['dark-princess', '🌙 Dark Princess'],
            ['midnight-love', '🖤 Midnight Love'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => updateSetting('theme', value)}
              className={`theme-card ${settings.theme === value ? 'active' : ''}`}
            >
              <span>{label}</span>
              {settings.theme === value && <CheckCircle2 size={18} />}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="settings-section">
        <div className="settings-heading">
          <BellRing size={22} />
          <div>
            <h3>Sweet Reminders</h3>
            <small>Daily hugs, anniversaries and love notes.</small>
          </div>
        </div>

        <SettingToggle
          title="Daily Love Reminder 💌"
          value={settings.sweetReminders}
          onChange={(v) => updateSetting('sweetReminders', v)}
        />

        <SettingToggle
          title="Notification Sound 🔔"
          value={settings.notificationSound}
          onChange={(v) => updateSetting('notificationSound', v)}
        />
      </GlassCard>

      <GlassCard className="settings-section">
        <div className="settings-heading">
          <ShieldCheck size={22} />
          <div>
            <h3>Privacy Vault</h3>
            <small>Your memories are private by default.</small>
          </div>
        </div>

        <SettingToggle
          title="Keep Memories Private 🔒"
          value={settings.memoriesPrivate}
          onChange={(v) => updateSetting('memoriesPrivate', v)}
        />

        <SettingToggle
          title="Allow Partner to Download Memories"
          value={settings.canPartnerDownload}
          onChange={(v) => updateSetting('canPartnerDownload', v)}
        />
      </GlassCard>

      <GlassCard className="settings-section clickable-card">
        <div className="settings-row">
          <div className="settings-left">
            <LockKeyhole size={20} />
            <div>
              <strong>Security</strong>
              <p>Change Password · Active Sessions</p>
            </div>
          </div>
          <ChevronRight size={18} />
        </div>
      </GlassCard>

      <GlassCard className="settings-section clickable-card">
        <div className="settings-row">
          <div className="settings-left">
            <HeartHandshake size={20} />
            <div>
              <strong>Partner Permissions</strong>
              <p>Control what your partner can access.</p>
            </div>
          </div>
          <ChevronRight size={18} />
        </div>
      </GlassCard>

      <GlassCard className="settings-section clickable-card">
        <div className="settings-row">
          <div className="settings-left">
            <Cloud size={20} />
            <div>
              <strong>Storage & Backup</strong>
              <p>Cloudinary Backup • Export ZIP • Export PDF</p>
            </div>
          </div>
          <ChevronRight size={18} />
        </div>
      </GlassCard>

      <GlassCard className="settings-section clickable-card">
        <div className="settings-row">
          <div className="settings-left">
            <MoonStar size={20} />
            <div>
              <strong>Theme Preview</strong>
              <p>Live preview before saving.</p>
            </div>
          </div>
          <ChevronRight size={18} />
        </div>
      </GlassCard>

      <GlassCard className="settings-section clickable-card">
        <div className="settings-row">
          <div className="settings-left">
            <Download size={20} />
            <div>
              <strong>Export Memories</strong>
              <p>Create your love scrapbook PDF.</p>
            </div>
          </div>
          <ChevronRight size={18} />
        </div>
      </GlassCard>
    </div>
  );
}

function SettingToggle({ title, value, onChange }) {
  return (
    <div className="setting-toggle-row">
      <span>{title}</span>
      <button
        className={`toggle-switch ${value ? 'active' : ''}`}
        onClick={() => onChange(!value)}
      >
        <span className="toggle-dot"></span>
      </button>
    </div>
  );
}