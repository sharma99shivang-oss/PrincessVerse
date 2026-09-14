import { useRef, useState } from 'react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client.js';
import GlassCard from '../GlassCard.jsx';

export default function MemoryUploader({ onClose, onSaved }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', location: '', memoryDate: '', tags: '' });
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const addFiles = (event) => setFiles(Array.from(event.target.files || []).slice(0, 12));
  const submit = async (event) => {
    event.preventDefault();
    if (!files.length) return toast.error('Choose at least one photo or video.');
    setSaving(true);
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    files.forEach((file) => body.append(file.type.startsWith('video/') ? 'videos' : 'images', file));
    try { await client.post('/memories', body, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: (event) => setProgress(Math.round((event.loaded * 100) / (event.total || 1))) }); toast.success('Memory saved to your universe.'); onSaved?.(); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || 'Upload failed.'); }
    finally { setSaving(false); }
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><GlassCard className="memory-modal upload-modal" onMouseDown={(event) => event.stopPropagation()}><div className="card-heading"><div><span className="eyebrow">A new chapter</span><h2>Upload memory</h2></div><button className="icon-button" onClick={onClose}><X size={18} /></button></div><form className="auth-form" onSubmit={submit}><label>Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Give this moment a name" /></label><label>Story<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What makes it special?" /></label><div className="upload-dropzone" onClick={() => inputRef.current?.click()}><UploadCloud size={27} /><strong>{files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Drop photos or videos here'}</strong><small>Images up to 10MB · videos up to 100MB</small><input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={addFiles} /></div><div className="upload-fields"><label>Date<input type="date" value={form.memoryDate} onChange={(event) => setForm({ ...form, memoryDate: event.target.value })} /></label><label>Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Goa, India" /></label></div><label>Tags <small>(comma separated)</small><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="trip, beach, summer" /></label>{saving && <div className="upload-progress"><i style={{ width: `${progress}%` }} /><span>{progress}% uploading</span></div>}<button className="primary-button full" disabled={saving}><ImagePlus size={16} />{saving ? 'Saving memory…' : 'Save memory'}</button></form></GlassCard></div>;
}
