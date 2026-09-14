import { Search as SearchIcon, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import client from '../../api/client.js';
import PageHeader from '../../components/PageHeader.jsx';
import GlassCard from '../../components/GlassCard.jsx';
import ModuleCard from '../../components/couple/ModuleCard.jsx';
import MemoryTile from '../../components/gallery/MemoryTile.jsx';

export default function SearchPage() {
  const [query, setQuery] = useState(''); const [results, setResults] = useState(null); const [loading, setLoading] = useState(false);
  useEffect(() => { if (!query.trim()) { setResults(null); return undefined; } const timer = setTimeout(() => { setLoading(true); client.get('/search', { params: { q: query } }).then(({ data }) => setResults(data)).finally(() => setLoading(false)); }, 280); return () => clearTimeout(timer); }, [query]);
  const groups = results?.groups || results?.results || {};
  const entries = Object.entries(groups).map(([type, group]) => [type, Array.isArray(group) ? group : group?.items || []]);
  return <><PageHeader eyebrow="Find a feeling" title="Search your universe" subtitle="Look through memories, letters, songs, food, movies, and dreams." /><GlassCard className="global-search-box"><SearchIcon size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything…" /></GlassCard>{loading && <div className="app-loading inline-loading"><div className="loading-sparkle">✦</div><p>Looking through your chapters…</p></div>}{!query && <div className="search-empty"><Sparkles size={28} /><h2>What are you remembering?</h2><p>Try a place, a title, a tag, or a favorite food.</p></div>}{results && !loading && <div className="search-results">{entries.map(([type, items]) => items.length ? <section key={type}><div className="section-heading"><h2>{type}</h2><span>{items.length} found</span></div><div className="module-grid">{items.map((item) => type === 'memories' ? <MemoryTile key={item._id} memory={item} /> : <ModuleCard key={item._id} item={item} kind={type.replace(/s$/, '')} />)}</div></section> : null)}{!entries.some(([, items]) => items.length) && <div className="empty-state"><h3>No chapters matched that search</h3><p>Try another word or browse your collections.</p></div>}</div>}</>;
}
