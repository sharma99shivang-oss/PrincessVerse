import { NavLink } from 'react-router-dom';
import { Activity, BarChart3, Bell, CalendarDays, Camera, Clapperboard, Download, Gift, Home, KeyRound, ListChecks, LogOut, Mail, Music2, Settings, Smile, Utensils, UserRound, Shield, TrendingUp } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
const getAvatarUrl = (avatar) => {
  if (!avatar) return "/default-avatar.png";

  if (avatar.startsWith("http")) return avatar;

  return `http://localhost:5000${avatar}`;
};
const sharedLinks = [
  ["/", "Home", Home, true],

  ["/gallery", "Gallery", Camera, "gallery"],
  ["/letters", "Letters", Mail, "letters"],
  ["/timeline", "Timeline", CalendarDays, "timeline"],

  ["/foods", "Foods", Utensils, "foods"],
  ["/movies", "Movies", Clapperboard, "movies"],
  ["/music", "Music", Music2, "music"],
  ["/gifts", "Gifts", Gift, "gifts"],

  ["/moods", "Moods", Smile, "moods"],
  ["/bucket-list", "Bucket list", ListChecks, "bucketList"],

  ["/calendar", "Calendar", CalendarDays, "calendar"],
  ["/notifications", "Notifications", Bell, "notifications"],
];
const adminLinks = [['/admin/dashboard', 'Dashboard', BarChart3], ['/admin/analytics', 'Relationship analytics', TrendingUp], ['/gallery', 'Gallery manager', Camera], ['/letters', 'Letter manager', Mail], ['/timeline', 'Timeline manager', CalendarDays], ['/gifts', 'Gift manager', Gift], ['/music', 'Songs', Music2], ['/movies', 'Movies', Clapperboard], ['/foods', 'Foods', Utensils], ['/moods', 'Mood analytics', Smile], ['/notifications', 'Notifications', Bell], ['/admin/permissions', 'Partner permissions', KeyRound], ['/admin/activity', 'Activity log', Activity], ['/admin/export', 'Export data', Download]];
export default function Sidebar({ open, onClose, variant, modules = {}, }) {
  const { user, logout } = useAuth();
  const links = variant === 'admin' ? adminLinks : sharedLinks;
  return <aside className={`sidebar ${open ? 'is-open' : ''}`}>
    <div className="sidebar-head"><Logo /><button className="icon-button mobile-close" onClick={onClose}>×</button></div>
    <p className="nav-label">My kingdom</p>
    <nav>
      {links.map(([to, label, Icon, moduleKey]) => {
        const isAdmin = user?.role === "ADMIN";

        const visible =
          user?.role === "ADMIN" ||
          moduleKey === true ||
          modules[moduleKey] === true;

        if (!visible) return null;
        return (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>

    <p className="nav-label">Account</p>
    <nav>
      <NavLink to="/profile" onClick={onClose} className="nav-link"><UserRound size={17} /><span>Profile</span></NavLink>
      <NavLink to="/settings" onClick={onClose} className="nav-link"><Settings size={17} /><span>Settings</span></NavLink>
      {user?.role === 'ADMIN' && <NavLink to="/admin/dashboard" onClick={onClose} className="nav-link"><Shield size={17} /><span>Admin dashboard</span></NavLink>}
    </nav>
    <div className="sidebar-bottom"><div className="mini-profile"><img
      src={getAvatarUrl(user?.avatar)}
      alt={user?.name}
      className="sidebar-avatar"
    /><div><strong>{user?.name || 'Princess'}</strong><small>Dreamer mode ✨</small></div></div><button className="logout-button" onClick={logout}><LogOut size={16} /></button></div>
  </aside>;
}
