/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
// ============================================================================
// AuthProvider
// ----------------------------------------------------------------------------
// Fornece contexto de autenticação para o front-end Next.js consumindo o
// backend FastAPI (rotas: /register, /login, /refresh, /me, /logout e OAuth).
// ============================================================================

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AuthAPI, { AuthUserDTO, isExpired, decodeJwt } from '@/lib/auth/api';

export interface AuthContextValue {
  user: AuthUserDTO | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  refreshNow: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = 'avarynx_access_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback((token: string) => {
    clearRefreshTimer();
    const decoded = decodeJwt(token);
    if (!decoded?.exp) return;
    const expMs = decoded.exp * 1000;
    const now = Date.now();
    const ttl = expMs - now;
    if (ttl <= 0) return;
    const margin = Math.min(60_000, Math.max(ttl * 0.5, 5_000));
    const delay = Math.max(ttl - margin, 5_000);
    refreshTimerRef.current = setTimeout(() => {
      refreshNow();
    }, delay);
  }, [clearRefreshTimer]);

  const applyToken = useCallback((token: string) => {
    setAccessToken(token);
    try { sessionStorage.setItem(STORAGE_KEY, token); } catch {}
    scheduleRefresh(token);
  }, [scheduleRefresh]);

  const resetSession = useCallback(() => {
    clearRefreshTimer();
    setAccessToken(null);
    setUser(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, [clearRefreshTimer]);

  const fetchMe = useCallback(async (token: string) => {
    try {
      const me = await AuthAPI.me(token);
      setUser(me);
      return true;
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn('[auth] /me falhou:', e?.message);
      resetSession();
      return false;
    }
  }, [resetSession]);

  const refreshNow = useCallback(async () => {
    try {
      const data = await AuthAPI.refresh();
      applyToken(data.access_token);
      await fetchMe(data.access_token);
      return true;
    } catch {
      resetSession();
      return false;
    }
  }, [applyToken, fetchMe, resetSession]);

  const login = useCallback(async (identifier: string, password: string) => {
    setError(null);
    try {
      const data = await AuthAPI.login({ identifier, password });
      applyToken(data.access_token);
      await fetchMe(data.access_token);
      return true;
    } catch (e: any) {
      setError(e?.message || 'Failed to sign in');
      return false;
    }
  }, [applyToken, fetchMe]);

  const register = useCallback(async (email: string, password: string, username?: string) => {
    setError(null);
    try {
      await AuthAPI.register({ email, password, username });
      return true; // will show message to check email
    } catch (e: any) {
      setError(e?.message || 'Failed to register');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await AuthAPI.logout(); } catch { /* ignore */ }
    resetSession();
  }, [resetSession]);

  const loginWithGoogle = useCallback(() => {
    window.location.href = AuthAPI.googleUrl();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let stored: string | null = null;
        try { stored = sessionStorage.getItem(STORAGE_KEY); } catch {}
        if (!stored || isExpired(stored)) {
          await refreshNow();
          return;
        }
        applyToken(stored);
        const ok = await fetchMe(stored);
        if (!ok) await refreshNow();
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearRefreshTimer(), [clearRefreshTimer]);

  const value: AuthContextValue = {
    user,
    accessToken,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGoogle,
    refreshNow,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider />');
  return ctx;
}

export default AuthProvider;
