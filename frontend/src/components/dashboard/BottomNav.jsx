import { Camera, Heart, Home, Mail, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [['/partner/dashboard', 'Home', Home], ['/gallery', 'Gallery', Camera], ['/letters', 'Letters', Mail], ['/timeline', 'Timeline', Heart], ['/profile', 'Profile', UserRound]];
export default function BottomNav() {
  return <nav className="partner-bottom-nav" aria-label="Partner navigation">{items.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'bottom-nav-link active' : 'bottom-nav-link'}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>;
}
