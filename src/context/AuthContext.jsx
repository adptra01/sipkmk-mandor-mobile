import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, me, getToken, clearToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let aktif = true;
    (async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await me();
        if (aktif) setUser(data.user ?? data);
      } catch {
        clearToken();
        if (aktif) {
          setUser(null);
          setTokenState(null);
        }
      } finally {
        if (aktif) setLoading(false);
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(email, password);
      setTokenState(data.token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setUser(null);
    setTokenState(null);
    setError(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai dalam AuthProvider');
  return ctx;
}