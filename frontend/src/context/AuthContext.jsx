import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import client from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("pv_access_token"));

  useEffect(() => {
    if (!token) { setLoading(false); return undefined; }
    client.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => { localStorage.removeItem('pv_access_token'); setUser(null); })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener('pv:logout', handleLogout);
    return () => window.removeEventListener('pv:logout', handleLogout);
  }, []);

  const login = async (credentials) => {
    const { data } = await client.post("/auth/login", credentials);

    localStorage.setItem("pv_access_token", data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);

    return data;
  };
  const register = async (payload) => {
    const { data } = await client.post("/auth/register", payload);

    localStorage.setItem("pv_access_token", data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);

    return data;
  };
  const logout = async () => {
    try {
      await client.post("/auth/logout");
    } finally {
      localStorage.removeItem("pv_access_token");
      setToken(null);
      setUser(null);
    }
  };
  const value = useMemo(() => ({
    user,
    role: user?.role || null,
    token,
    coupleId: user?.coupleId || null,
    loading,
    booting: loading,
    login,
    register,
    logout,
    setUser
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
