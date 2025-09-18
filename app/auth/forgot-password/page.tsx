'use client';
/*
 * /auth/forgot-password
 * Página para solicitar link de redefinição de palavra‑passe.
 * Integra com AuthAPI.forgotPassword e mantém mensagem genérica de sucesso por segurança.
 */
import { useState } from 'react';
import AuthAPI from '@/lib/auth/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await AuthAPI.forgotPassword(email.trim());
      // Sempre mostrar mensagem genérica
      setDone(true);
    } catch (err: any) {
      // Mesmo em caso de erro, não expor se email existe
      // Mas podemos logar console em dev
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[forgot-password] erro:', err?.message);
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#18133b',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div
          style={{
            background: 'linear-gradient(145deg,#1f1a46,#141029)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '2rem 2.2rem 2.4rem',
            boxShadow:
              '0 6px 28px -8px rgba(0,0,0,0.55), 0 2px 10px -2px rgba(0,0,0,0.45)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 18% 20%, rgba(109,90,255,0.18), transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <h1 style={{ fontSize: '1.35rem', margin: '0 0 .75rem', fontWeight: 600 }}>
            Esqueci a palavra‑passe
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.85, margin: '0 0 1.25rem' }}>
            Introduz o teu email e enviaremos um link para redefinir a tua palavra‑passe se existir
            uma conta associada.
          </p>

          {!done && (
            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor="fp-email"
                style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
              >
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 12,
                  padding: '0.85rem 1rem',
                  color: 'white',
                  fontSize: 15,
                  outline: 'none',
                  marginBottom: '1.1rem',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !email.trim()) e.preventDefault();
                }}
              />
              {error && (
                <div
                  role="alert"
                  style={{
                    background: 'linear-gradient(90deg,#c026d3,#db2777)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 10,
                    fontSize: 13,
                    marginBottom: '0.9rem',
                  }}
                >
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="tj-primary-btn"
                style={{ width: '100%', opacity: submitting ? 0.8 : 1 }}
                aria-busy={submitting}
              >
                <div className="btn-inner">
                  <span className="btn-text">
                    {submitting ? 'A enviar…' : 'Enviar link de redefinição'}
                  </span>
                  <span className="btn-icon">
                    <i className="tji-arrow-right" />
                  </span>
                </div>
              </button>
            </form>
          )}

          {done && (
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              <p style={{ marginTop: 0 }}>
                Se esse email existir, receberás dentro de instantes um link para redefinir a tua
                palavra‑passe. O link expira após algum tempo e só pode ser usado uma vez.
              </p>
              <p style={{ opacity: 0.8 }}>Verifica também a tua pasta de spam / promoções.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                <Link
                  href="/"
                  className="tj-primary-btn"
                  style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}
                >
                  <div className="btn-inner">
                    <span className="btn-text">Voltar à Home</span>
                    <span className="btn-icon">
                      <i className="tji-arrow-right" />
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDone(false);
                    setEmail('');
                  }}
                  className="btn btn-outline-light"
                  style={{ flex: '0 0 auto', whiteSpace: 'nowrap', borderRadius: 14 }}
                >
                  Outro email
                </button>
              </div>
            </div>
          )}
          <div style={{ marginTop: 28 }}>
            <Link
              href="/auth/reset-password"
              style={{
                color: '#9ca3af',
                fontSize: 12,
                textDecoration: 'none',
              }}
            >
              Já tens um token? Redefinir agora
            </Link>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, opacity: 0.55, marginTop: 28 }}>
          &copy; {new Date().getFullYear()} Avarynx
        </p>
      </div>
    </main>
  );
}

