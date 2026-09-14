import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('pv_access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  const authPath = ['/auth/login', '/auth/register', '/auth/refresh'].some((path) => original?.url?.includes(path));
  if (error.response?.status === 401 && original && !original._retry && !authPath) {
    original._retry = true;
    try {
      const { data } = await client.post('/auth/refresh');
      localStorage.setItem('pv_access_token', data.accessToken);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return client(original);
    } catch {
      localStorage.removeItem('pv_access_token');
      window.dispatchEvent(new Event('pv:logout'));
    }
  }
  return Promise.reject(error);
});

export default client;
