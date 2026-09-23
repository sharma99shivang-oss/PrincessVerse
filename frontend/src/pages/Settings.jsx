import { useEffect, useState } from 'react';
import {
  Palette,
  BellRing,
  ShieldCheck,
  LockKeyhole,
  MoonStar,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import client from '../api/client';
import GlassCard from '../components/GlassCard';
import PageHeader from '../components/PageHeader';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    theme: "light",
    sweetReminders: true,
    notificationSound: true,
    memoriesPrivate: true,
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
            ['light', '🌸 Romantic Pink'],
            ['lavender', '💜 Lavender Dream'],
            ['dark', '🌙 Luxury Dark'],
            ['midnight', '🌌 Midnight Galaxy'],
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
        {/* 
        <SettingToggle
          title="Allow Partner to Download Memories"
          value={settings.canPartnerDownload}
          onChange={(v) => updateSetting('canPartnerDownload', v)}
        /> */}
      </GlassCard>

      <div
        className="settings-section clickable-card"
        onClick={() => navigate("/settings/security")}
      >
        <GlassCard>
          <div className="settings-row">
            <div className="settings-left">
              <LockKeyhole size={20} />

              <div>
                <strong>Security</strong>
                <p>Change Password</p>
              </div>
            </div>

            <ChevronRight size={18} />
          </div>
        </GlassCard>
      </div>

      {/* <GlassCard className="settings-section clickable-card">
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
      </GlassCard> */}

      {/* <GlassCard className="settings-section clickable-card">
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
      </GlassCard> */}

      <GlassCard className="settings-section">
        <div className="settings-heading">
          <MoonStar size={22} />

          <div>
            <h3>Theme Preview</h3>
            <small>See your PrincessVerse instantly.</small>
          </div>
        </div>

        <div className="theme-preview-card">
          <div className={`theme-preview ${settings.theme}`}>
            <h3>PrincessVerse</h3>

            <p>Love looks beautiful in every theme. 💖</p>
          </div>
        </div>
      </GlassCard>

      {/* <GlassCard className="settings-section clickable-card">
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
      </GlassCard> */}
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