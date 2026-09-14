import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import PageHeader from './PageHeader.jsx';
import ContentCard from './ContentCard.jsx';
import EmptyState from './EmptyState.jsx';
import GlassCard from './GlassCard.jsx';
import { useContent } from '../hooks/useContent.js';

export default function CollectionPage({ type, title, eyebrow, subtitle, icon = '✨' }) {
  const { items, loading, error, create } = useContent(type);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image: '', emoji: icon });
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await create(form);
      setForm({ title: '', description: '', image: '', emoji: icon });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };
  return <><PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} action={<button className="primary-button" onClick={() => setOpen(true)}><Plus size={17} /> Add {type}</button>} />
    {error && <div className="alert">{error}</div>}
    {loading ? <div className="loading-grid">{[1, 2, 3].map((n) => <GlassCard key={n} className="skeleton-card" />)}</div> : items.length ? <div className="content-grid">{items.map((item) => <ContentCard item={item} key={item._id} />)}</div> : <EmptyState title={`Your ${type} shelf is waiting`} text={`Add a little ${icon} magic to start this collection.`} />}
    {open && <div className="modal-backdrop" onMouseDown={() => setOpen(false)}><GlassCard className="memory-modal" onMouseDown={(event) => event.stopPropagation()}><div className="card-heading"><div><span className="eyebrow">A new little treasure</span><h2>Add to {title}</h2></div><button className="icon-button" onClick={() => setOpen(false)}><X size={18} /></button></div><form className="auth-form" onSubmit={submit}><label>Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Give this moment a name" /></label><label>Note<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What makes it special?" /></label><label>Image URL <small>(optional)</small><input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://…" /></label><button className="primary-button full" disabled={saving}>{saving ? 'Saving your sparkle…' : 'Save memory'} <Plus size={16} /></button></form></GlassCard></div>}
  </>;
}
