import { useState } from 'react';
import { CalendarDays, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function General() { const [form, setForm] = useState({ dateFormat: 'long', greeting: 'soft' }); const save = async (event) => { event.preventDefault(); try { await client.patch('/settings', form); toast.success('General settings saved.'); } catch (error) { toast.error(error.response?.data?.message || 'Could not save settings.'); } }; return <><PageHeader eyebrow="Make it feel like yours" title="General settings" subtitle="Small choices for a softer experience." /><GlassCard className="form-card"><form onSubmit={save} className="auth-form"><label>Date format<select value={form.dateFormat} onChange={(event) => setForm({ ...form, dateFormat: event.target.value })}><option value="long">September 8, 2026</option><option value="short">08/09/2026</option></select></label><label>Greeting style<select value={form.greeting} onChange={(event) => setForm({ ...form, greeting: event.target.value })}><option value="soft">Good morning, starlight</option><option value="simple">Good morning</option></select></label><button className="primary-button"><Save size={15} /> Save settings</button></form></GlassCard></>; }
