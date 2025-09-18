'use client';
// ============================================================================
// /auth/callback
// ----------------------------------------------------------------------------
// Página de callback para fluxos OAuth (Google). O backend deve redirecionar
// para esta rota após concluir a autenticação e definir o cookie refresh_token.
// Aqui forçamos um refresh para obter o access_token e depois redirecionamos
// o utilizador para a home (ou outra rota protegida futuramente).
// ============================================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { refreshNow } = useAuth();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('A concluir início de sessão...');

  useEffect(() => {
    (async () => {
      try {
        const ok = await refreshNow();
        if (ok) {
          setStatus('ok');
          setMessage('Sessão iniciada. Redirecionando...');
          setTimeout(() => router.replace('/'), 800);
        } else {
          setStatus('error');
          setMessage('Não foi possível validar a sessão.');
          setTimeout(() => router.replace('/'), 1500);
        }
      } catch (e) {
        setStatus('error');
        setMessage('Erro inesperado no callback OAuth.');
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
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
      `}</style>
    </main>
  );
}

