import { Bell, Heart, Mail, Sparkles } from 'lucide-react';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
export default function NotificationsSettings() { return <><PageHeader eyebrow="Gentle reminders" title="Notification settings" subtitle="Choose which moments deserve a little ping." /><div className="settings-list">{[['Memories', CameraIcon], ['Letters', Mail], ['Gifts', Sparkles], ['Anniversaries', Heart]].map(([label, Icon]) => <GlassCard className="setting-row" key={label}><span className="setting-icon"><Icon size={18} /></span><div><h3>{label}</h3><p>Receive updates when this part of your universe changes.</p></div><button className="toggle on"><span /></button></GlassCard>)}</div></>; }
function CameraIcon(props) { return <Bell {...props} />; }
