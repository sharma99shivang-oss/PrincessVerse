import { Database, Image, Video } from 'lucide-react';
import GlassCard from '../../components/GlassCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
export default function Storage() { return <><PageHeader eyebrow="Your memory shelf" title="Storage" subtitle="A quick view of the space your universe uses." /><div className="storage-grid"><GlassCard><Image size={19} /><strong>Cloudinary images</strong><span>Managed media storage</span></GlassCard><GlassCard><Video size={19} /><strong>Videos</strong><span>Upload limits are enforced safely</span></GlassCard><GlassCard><Database size={19} /><strong>MongoDB records</strong><span>Couple-scoped and protected</span></GlassCard></div></>; }
