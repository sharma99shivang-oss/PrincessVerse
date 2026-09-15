import { useEffect, useState } from 'react';
import { Menu, Search, Bell, Plus, Sun, Moon, ChevronDown } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import { usePermissions } from "../context/PermissionContext.jsx";
const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const getImageUrl = (url) => {
  if (!url) return "/default-avatar.png";

  if (url.startsWith("http")) return url;

  return `${API_URL}${url}`;
};
export default function AppShell({ children, variant = "shared" }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('pv_theme') || 'princess-pink');
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuth();
  const { modules } = usePermissions();
  const toggleTheme = () => { const next = theme === 'dark-princess' ? 'princess-pink' : 'dark-princess'; setTheme(next); localStorage.setItem('pv_theme', next); document.documentElement.dataset.theme = next; };
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return <div className={`app-shell app-shell-${variant}`}><Sidebar open={open} onClose={() => setOpen(false)} variant={variant} modules={modules} /><div className="mobile-top"><button className="icon-button" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button><Logo /><Link to="/notifications" className="icon-button" aria-label="Notifications"><Bell size={18} /></Link></div><main className="main-content"><header className="topbar"><div><span className="breadcrumb">PrincessVerse / </span><strong>{user?.role === 'ADMIN' ? 'Keeper dashboard' : 'Our scrapbook'}</strong></div><div className="topbar-actions">  <Link className="search-pill" aria-label="Search memories" to="/search"><Search size={16} /> Search memories</Link><Link to="/notifications" className="icon-button" aria-label="Notifications"><Bell size={18} /></Link><button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'dark-princess' ? <Sun size={17} /> : <Moon size={17} />}</button><button className="profile-trigger" onClick={() => setProfileOpen((value) => !value)}><img
    className="avatar"
    src={getAvatarUrl(user?.avatar)}
    alt={user?.name}
  /><ChevronDown size={14} /></button>{profileOpen && (
    <div className="profile-dropdown">
      <div className="profile-dropdown-user">
        <img
          className="avatar"
          src={getImageUrl(user?.avatar)}
          alt={user?.name}
        />
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.role === "ADMIN" ? "Keeper 💖" : "Partner 💕"}</small>
        </div>
      </div>

      <Link to="/profile">View profile</Link>
      <Link to="/settings">Settings</Link>
    </div>
  )}</div></header>{children || <Outlet />}{user?.role === 'ADMIN' && <Link className="floating-add" to="/gallery" aria-label="Add memory"><Plus size={22} /></Link>}{variant === "partner" && (
    <BottomNavigation modules={modules} />
  )}</main></div>;
}

function BottomNavigation({ modules }) {
  return (
    <nav className="partner-bottom-nav" aria-label="Partner navigation">
      <Link to="/partner/dashboard">Home</Link>

      {modules.gallery && <Link to="/gallery">Gallery</Link>}

      {modules.letters && <Link to="/letters">Letters</Link>}

      {modules.timeline && <Link to="/timeline">Timeline</Link>}

      <Link to="/profile">Profile</Link>
    </nav>
  );
}
