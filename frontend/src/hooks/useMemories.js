import { useCallback, useEffect, useState } from 'react';
import client from '../api/client.js';

export function useMemories(params = {}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/memories', { params });
      setItems(data.items || []);
      setMeta(data.meta || { page: 1, pages: 1, total: data.items?.length || 0 });
      setError('');
    } catch (err) { setError(err.response?.data?.message || 'Could not load your memories.'); }
    finally { setLoading(false); }
  }, [JSON.stringify(params)]);
  useEffect(() => { load(); }, [load]);
  return { items, meta, loading, error, reload: load };
}
