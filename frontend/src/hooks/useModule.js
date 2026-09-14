import { useCallback, useEffect, useState } from 'react';
import client from '../api/client.js';

export function useModule(resource, params = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await client.get(`/${resource}`, { params }); setItems(data.items || data[resource] || []); setError(''); }
    catch (err) { setError(err.response?.data?.message || `Could not load ${resource}.`); }
    finally { setLoading(false); }
  }, [resource, JSON.stringify(params)]);
  useEffect(() => { load(); }, [load]);
  const create = async (payload) => { await client.post(`/${resource}`, payload); await load(); };
  const remove = async (id) => { await client.delete(`/${resource}/${id}`); await load(); };
  const toggleFavorite = async (id) => { await client.patch(`/${resource}/${id}/favorite`); await load(); };
  return { items, loading, error, reload: load, create, remove, toggleFavorite };
}
