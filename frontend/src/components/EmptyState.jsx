import { Sparkles } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', text = 'Add your first little memory to make this space sparkle.' }) {
  return <div className="empty-state"><Sparkles size={28} /><h3>{title}</h3><p>{text}</p></div>;
}
