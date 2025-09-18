'use client';
/*
 * /auth/forgot-password
 * Page to request password reset link.
 * Integrates with AuthAPI.forgotPassword and keeps a generic success message for security.
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
      // Always show generic message
      setDone(true);
    } catch (err: any) {
      // Even in case of error, do not expose if email exists
      // But we can log to console in dev
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[forgot-password] error:', err?.message);
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
            Forgot your password
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.85, margin: '0 0 1.25rem' }}>
            Enter your email and we will send a password reset link if an account exists for it.
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
                placeholder="you@example.com"
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
                    {submitting ? 'Sending…' : 'Send reset link'}
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
                If that email exists you will receive a reset link shortly. The link expires after a
                limited time and can only be used once.
              </p>
              <p style={{ opacity: 0.8 }}>Be sure to also check your spam / promotions folder.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                <Link
                  href="/"
                  className="tj-primary-btn"
                  style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}
                >
                  <div className="btn-inner">
                    <span className="btn-text">Back to Home</span>
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
                  Use another email
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
              Already have a token? Reset now
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
