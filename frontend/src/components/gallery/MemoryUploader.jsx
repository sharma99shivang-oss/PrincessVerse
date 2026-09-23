import { useRef, useState } from 'react';
import { Camera, ImagePlus, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client.js';
import GlassCard from '../GlassCard.jsx';

const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];

export default function MemoryUploader({ onClose, onSaved }) {
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const abortRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', location: '', memoryDate: '', tags: '' });
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const addFiles = (selected) => {
    const next = Array.from(selected || []).filter((file) => {
      const validType = imageTypes.includes(file.type) || videoTypes.includes(file.type);
      const max = videoTypes.includes(file.type) ? 150 : 20;
      if (!validType) toast.error(`${file.name}: unsupported media type.`);
      if (validType && file.size > max * 1024 * 1024) toast.error(`${file.name}: maximum size is ${max}MB.`);
      return validType && file.size <= max * 1024 * 1024;
    });
    setFiles((current) => [...current, ...next].slice(0, 12));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!files.length) return toast.error('Choose at least one photo or video.');
    setSaving(true);
    setProgress(0);
    abortRef.current = new AbortController();
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    files.forEach((file) => body.append(videoTypes.includes(file.type) ? 'videos' : 'images', file));
    try {
      await client.post('/memories', body, {
        signal: abortRef.current.signal,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => setProgress(Math.round((event.loaded * 100) / (event.total || 1))),
      });
      toast.success('Memory saved to your universe.');
      onSaved?.();
      onClose();
    } catch (err) {
      if (err.code !== 'ERR_CANCELED') toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      abortRef.current = null;
      setSaving(false);
    }
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
    setSaving(false);
    setProgress(0);
  };

  return (
    <div className="modal-backdrop memory-upload-backdrop" onMouseDown={onClose}>
      <GlassCard className="memory-modal upload-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="card-heading">
          <div><span className="eyebrow">A new chapter</span><h2>Upload memory</h2></div>
          <button className="icon-button" onClick={onClose} disabled={saving}><X size={18} /></button>
        </div>
        <form className="auth-form memory-upload-form" onSubmit={submit}>
          <label>Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Give this moment a name" /></label>
          <label>Story<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What makes it special?" /></label>
          <div
            className={`upload-dropzone memory-dropzone ${dragging ? 'is-dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
          >
            <UploadCloud size={27} />
            <strong>{files.length ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Drop photos or videos here'}</strong>
            <small>Images up to 20MB · videos up to 150MB</small>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic,video/mp4,video/quicktime,video/webm,video/x-msvideo" multiple hidden onChange={(event) => addFiles(event.target.files)} />
          </div>
          <div className="memory-upload-actions">
            <button type="button" className="soft-button" onClick={() => cameraRef.current?.click()}><Camera size={16} /> Camera</button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(event) => addFiles(event.target.files)} />
          </div>
          {!!files.length && <div className="memory-upload-previews">{files.map((file) => <div key={`${file.name}-${file.lastModified}`} className="memory-upload-file"><span>{file.type.startsWith('video/') ? '🎬' : '📸'}</span><small>{file.name} · {(file.size / 1024 / 1024).toFixed(1)}MB</small></div>)}</div>}
          <div className="upload-fields"><label>Date<input type="date" value={form.memoryDate} onChange={(event) => setForm({ ...form, memoryDate: event.target.value })} /></label><label>Location<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Goa, India" /></label></div>
          <label>Tags <small>(comma separated)</small><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="trip, beach, summer" /></label>
          {saving && <div className="upload-progress"><i style={{ width: `${progress}%` }} /><span>{progress}% uploading</span></div>}
          <div className="memory-upload-submit">
            <button type="button" className="soft-button" onClick={cancelUpload} disabled={!saving}>Cancel</button>
            <button className="primary-button full" disabled={saving}><ImagePlus size={16} />{saving ? 'Saving memory…' : 'Save memory'}</button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
