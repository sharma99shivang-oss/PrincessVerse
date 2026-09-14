import { Filter, Heart, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import GlassCard from '../../components/GlassCard.jsx';
import MemoryTile from '../../components/gallery/MemoryTile.jsx';
import { useMemories } from '../../hooks/useMemories.js';
import client from '../../api/client.js';
import { usePermissions } from "../../context/PermissionContext.jsx";
import MemoryUploader from "../../components/gallery/MemoryUploader.jsx";

export default function Gallery() {
  const [search, setSearch] = useState('');
  const { permissions } = usePermissions();
  const [open, setOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const { role } = useAuth();
  const { items, loading, error, reload } = useMemories({ search, favorite: favorite || undefined });
  const handleDelete = async (memoryId) => {
    if (!window.confirm('Delete this memory permanently?')) return;

    try {
      await client.delete(`/memories/${memoryId}`);
      toast.success('Memory deleted successfully');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };
  const toggleFavorite = async (memory) => { await client.patch(`/memories/${memory._id}/favorite`); reload(); };
  return <><PageHeader
    eyebrow="Little snapshots"
    title="Gallery"
    subtitle="The moments you wish you could bottle up."
    action={
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span className="date-chip">
          <Heart size={13} />
          {items.filter((item) => item.favorite).length} favorites
        </span>

        {(role === "ADMIN" || permissions.canUploadPhotos) && (
          <button
            className="primary-button"
            onClick={() => setOpen(true)}
          >
            <Plus size={16} />
            Upload Memory
          </button>
        )}
      </div>
    }
  /><GlassCard className="gallery-toolbar"><div className="search-field"><Search size={16} /> <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, tags, places…" /></div > <button className={`filter-button ${favorite ? 'active' : ''}`} onClick={() => setFavorite((value) => !value)}><Filter size={15} /> Favorites</button></GlassCard > {error && <div className="alert">{error}</div>}{
      loading ? <div className="memory-masonry">{[1, 2, 3, 4].map((item) => <GlassCard key={item} className="skeleton-card" />)}</div> : items.length ? <div className="memory-masonry">{items.map((item) => <MemoryTile key={item._id} memory={item} onFavorite={toggleFavorite} onDelete={handleDelete} isAdmin={role === 'ADMIN'}
      />)}</div> : <div className="empty-state"><div className="empty-illustration">📸</div><h3>No memories found</h3><p>Try another search or wait for a new little moment.</p></div>
    }{open && (
      <MemoryUploader
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          reload();
        }}
      />
    )}</>;
}
