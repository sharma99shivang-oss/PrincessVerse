import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Gallery from '../partner/Gallery.jsx';
import MemoryUploader from '../../components/gallery/MemoryUploader.jsx';

export default function GalleryManager() {
  const { role } = useAuth(); const [open, setOpen] = useState(false);
  return <>{role === 'ADMIN' && <PageHeader
  // eyebrow="Keeper's room" subtitle="Upload, organize, and keep your shared chapters safe."
  // action=
  // {
  // <button className="primary-button" onClick={() => setOpen(true)}><Plus size={16} /> Upload memory</button>}
  />}{open && <MemoryUploader onClose={() => setOpen(false)} onSaved={() => window.location.reload()} />}<Gallery /></>;
}
