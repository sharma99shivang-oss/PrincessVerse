import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader.jsx';
import GlassCard from '../../components/GlassCard.jsx';
import ModuleCard from '../../components/couple/ModuleCard.jsx';
import ModuleForm from '../../components/couple/ModuleForm.jsx';
import { useModule } from '../../hooks/useModule.js';
import { usePermissions } from "../../context/PermissionContext.jsx";

export default function ModulePage({ resource, kind, title, eyebrow, subtitle, partner = false }) {
  const [search, setSearch] = useState('');
  const { permissions } = usePermissions();
  const [open, setOpen] = useState(false);
  const { items, loading, error, create, remove, toggleFavorite, reload } = useModule(resource, search ? { search } : {});
  const createItem = async (payload) => { await create(payload); };
  const deleteItem = async (item) => { if (window.confirm(`Delete this ${kind}?`)) { await remove(item._id); toast.success('Removed.'); } };
  return <><PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} action={
    (!partner || (partner && kind === "mood" && permissions?.canAddMood)) && (
      <button className="primary-button" onClick={() => setOpen(true)}>
        <Plus size={16} />
        {kind === "mood" ? "Save Today's Mood" : `Add ${kind}`}
      </button>
    )
  } /><GlassCard className="gallery-toolbar"><div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} /></div></GlassCard>{error && <div className="alert">{error}</div>}{loading ? <div className="loading-grid">{[1, 2, 3].map((item) => <GlassCard className="skeleton-card" key={item} />)}</div> : items.length ? <div className="module-grid">{items.map((item) => <ModuleCard key={item._id} item={item} kind={kind} onFavorite={() => toggleFavorite(item._id)} onDelete={!partner ? deleteItem : undefined} />)}</div> : <div className="empty-state"><div className="empty-illustration">✨</div><h3>Your {title.toLowerCase()} shelf is waiting</h3><p>Add something special to begin this collection.</p></div>}{open && <ModuleForm resource={resource} kind={kind} onClose={() => setOpen(false)} onSaved={createItem} />}</>;
}
