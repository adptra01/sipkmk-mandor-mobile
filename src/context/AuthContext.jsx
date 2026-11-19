import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, me, getToken, clearToken, onUnauthorized } from '../lib/api';
import { clearMasterCache } from '../lib/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [initializing, setInitializing] = useState(true); // boot check /me
  const [submitting, setSubmitting] = useState(false); // submit form login
  const [error, setError] = useState(null);

  // Validasi token tersimpan saat boot.
  useEffect(() => {
    let aktif = true;
    (async () => {
      if (!getToken()) {
        if (aktif) setInitializing(false);
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
        if (aktif) setInitializing(false);
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  // 401 dari API → bersihkan sesi & arahkan ulang ke login (data outbox tetap aman).
  useEffect(() => {
    const off = onUnauthorized(() => {
      clearToken();
      setTokenState(null);
      setUser(null);
      setError('Sesi berakhir. Silakan masuk lagi.');
    });
    return off;
  }, []);

  async function login(email, password) {
    setSubmitting(true);
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
      setSubmitting(false);
    }
  }

  function logout() {
    // best-effort revoke token di server
    import('../lib/api').then(({ apiRequest }) => {
      apiRequest('/logout', { method: 'POST' }).catch(() => {});
    });
    clearToken();
    clearMasterCache().catch(() => {});
    setUser(null);
    setTokenState(null);
    setError(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, initializing, submitting, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai dalam AuthProvider');
  return ctx;
}