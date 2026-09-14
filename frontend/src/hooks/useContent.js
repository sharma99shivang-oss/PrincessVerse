import { useCallback, useEffect, useState } from 'react';
import client from '../api/client.js';

export function useContent(type) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await client.get('/content', { params: type ? { type } : {} }); setItems(data.items); setError(''); }
    catch (err) { setError(err.response?.data?.message || 'Could not load your memories.'); }
    finally { setLoading(false); }
  }, [type]);
  useEffect(() => { load(); }, [load]);
  const create = async (payload) => { await client.post('/content', { ...payload, type }); await load(); };
  return { items, loading, error, reload: load, create };
}
