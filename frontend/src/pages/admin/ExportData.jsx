import { Download, FileJson } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client.js';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';

const resources = ['memories', 'letters', 'timeline', 'gifts', 'songs', 'movies', 'foods', 'moods', 'bucket-list'];
export default function ExportData() {
  const download = async () => {
    try {
      const entries = await Promise.all(resources.map(async (resource) => { const { data } = await client.get(`/${resource}`, { params: { limit: 100 } }); return [resource, data.items || data.memories || data.letters || data.events || []]; }));
      const blob = new Blob([JSON.stringify(Object.fromEntries(entries), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `princessverse-export-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); toast.success('Your export is ready.');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not create export.'); }
  };
  return <><PageHeader eyebrow="Keep a copy of your chapters" title="Export data" subtitle="Download a couple-scoped JSON backup of your memories and collections." /><GlassCard className="form-card"><FileJson size={34} /><h2>PrincessVerse backup</h2><p>Only your protected couple data is included.</p><button className="primary-button" onClick={download}><Download size={16} /> Download JSON backup</button></GlassCard></>;
}
