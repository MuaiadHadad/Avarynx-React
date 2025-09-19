'use client';
// ============================================================================
// /auth/callback
// ----------------------------------------------------------------------------
// Callback page for OAuth flows (Google). The backend should redirect
// to this route after completing authentication and setting the refresh_token cookie.
// Here we force a refresh to obtain the access_token and then redirect the
// user to the home (or another protected route in the future).
// ============================================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { refreshNow } = useAuth();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('Finishing sign-in...');

  useEffect(() => {
    (async () => {
      try {
        const ok = await refreshNow();
        if (ok) {
          setStatus('ok');
          setMessage('Signed in. Redirecting...');
          setTimeout(() => router.replace('/'), 800);
        } else {
          setStatus('error');
          setMessage('Could not validate session.');
          setTimeout(() => router.replace('/'), 1500);
        }
      } catch (e) {
        setStatus('error');
        setMessage('Unexpected error in OAuth callback.');
        setTimeout(() => router.replace('/'), 1500);
      }
    })();
  }, [refreshNow, router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: '#18133b',
        color: 'white',
        fontFamily: 'sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', margin: 0 }}>OAuth Callback</h1>
      <p style={{ opacity: 0.85 }}>{message}</p>
      {status === 'loading' && (
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: '4px solid rgba(255,255,255,0.25)',
            borderTopColor: '#fff',
            animation: 'spin 0.9s linear infinite',
          }}
        />
      )}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
