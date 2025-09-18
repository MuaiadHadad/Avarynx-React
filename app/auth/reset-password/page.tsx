'use client';
/*
 * /auth/reset-password
 * Page to enter a new password from a reset token.
 * Flow:
 *  - If token comes via query (?token=...), shows form directly.
 *  - Otherwise, asks for token first.
 *  - Sends POST AuthAPI.resetPassword.
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthAPI from '@/lib/auth/api';

function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const rules = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^\w\s]/.test(value),
    value.length >= 8,
  ];
  const passed = rules.filter(Boolean).length;
  const percent = (passed / rules.length) * 100;
  const colors = ['#ef4444', '#f97316', '#eab308', '#10b981', '#10b981'];
  return (
    <div style={{ marginTop: 6 }} aria-hidden="true">
      <div
        style={{
          height: 6,
            borderRadius: 4,
          background: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: colors[passed - 1] || '#ef4444',
            transition: 'width .3s ease',
          }}
        />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const search = useSearchParams();
  const router = useRouter();
  const initialToken = search?.get('token') || '';
  const [token, setToken] = useState(initialToken);
  const [askingToken, setAskingToken] = useState(!initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken) setAskingToken(false);
  }, [initialToken]);

  const validPassword = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !validPassword || mismatch || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await AuthAPI.resetPassword({ token: token.trim(), password });
      setDone(true);
      // Clear sensitive data
      setPassword('');
      setConfirm('');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (askingToken) {
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
            <h1 style={{ fontSize: '1.35rem', margin: '0 0 .75rem', fontWeight: 600 }}>
              Enter your reset token
            </h1>
            <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5, margin: '0 0 1.1rem' }}>
              Paste here the token you received in the password reset email.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!token.trim()) return;
                setAskingToken(false);
                router.replace(`/auth/reset-password?token=${encodeURIComponent(token.trim())}`);
              }}
            >
              <textarea
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                rows={3}
                placeholder="Reset token"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 14,
                  padding: '0.85rem 1rem',
                  color: 'white',
                  fontSize: 14,
                  outline: 'none',
                  marginBottom: '1rem',
                  resize: 'vertical',
                }}
              />
              <button
                type="submit"
                className="tj-primary-btn"
                style={{ width: '100%' }}
                disabled={!token.trim()}
              >
                <div className="btn-inner">
                  <span className="btn-text">Continue</span>
                  <span className="btn-icon">
                    <i className="tji-arrow-right" />
                  </span>
                </div>
              </button>
            </form>
            <div style={{ marginTop: 24 }}>
              <Link href="/auth/forgot-password" style={{ color: '#9ca3af', fontSize: 12 }}>
                Need a token? Request a new link
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
                'radial-gradient(circle at 20% 25%, rgba(90,69,255,0.2), transparent 60%)',
              pointerEvents: 'none',
            }}
          />
          <h1 style={{ fontSize: '1.35rem', margin: '0 0 .75rem', fontWeight: 600 }}>
            Reset password
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.85, margin: '0 0 1.1rem' }}>
            Choose a new secure password for your account.
          </p>

          {!done && (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="new-password"
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  New password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 12,
                      padding: '0.85rem 1rem',
                      color: 'white',
                      fontSize: 15,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 10,
                      transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: 'white',
                      fontSize: 12,
                      padding: '4px 8px',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <PasswordStrength value={password} />
                <p style={{ fontSize: 12, opacity: 0.65, margin: '6px 0 0' }}>
                  Min. 8 chars, 1 uppercase, 1 number. Special character recommended.
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="confirm-password"
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${mismatch ? '#f87171' : 'rgba(255,255,255,0.25)'}`,
                    borderRadius: 12,
                    padding: '0.85rem 1rem',
                    color: 'white',
                    fontSize: 15,
                    outline: 'none',
                  }}
                />
                {mismatch && (
                  <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>
                    Passwords do not match.
                  </div>
                )}
              </div>
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
                disabled={!validPassword || mismatch || submitting}
                className="tj-primary-btn"
                style={{ width: '100%', opacity: submitting ? 0.8 : 1 }}
                aria-busy={submitting}
              >
                <div className="btn-inner">
                  <span className="btn-text">
                    {submitting ? 'Saving…' : 'Save new password'}
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
                Password successfully reset. You can now sign in with your new password.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                <Link
                  href="/"
                  className="tj-primary-btn"
                  style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}
                >
                  <div className="btn-inner">
                    <span className="btn-text">Go Home</span>
                    <span className="btn-icon">
                      <i className="tji-arrow-right" />
                    </span>
                  </div>
                </Link>
                <Link
                  href="/"
                  className="btn btn-outline-light"
                  style={{ flex: '0 0 auto', whiteSpace: 'nowrap', borderRadius: 14 }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}

          <div style={{ marginTop: 28 }}>
            <Link
              href="/auth/forgot-password"
              style={{
                color: '#9ca3af',
                fontSize: 12,
                textDecoration: 'none',
              }}
            >
              Need a new token? Request again
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
