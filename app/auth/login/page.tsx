'use client';
/*
 * /auth/login
 * Separate login page similar to forgot-password structure.
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import AlertCenter, { type AlertData } from '@/components/alerts/AlertCenter';

// Provider icons (same as LoginModal)
function ProviderIcon({ provider }: { provider: 'google' | 'microsoft' | 'linkedin' }) {
  if (provider === 'google') {
    return (
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 31.5 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 5.3 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.8 0 19.7-7.9 21-18v-6.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.5 16.3 18.8 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 5.3 29.3 3 24 3 16 3 9.1 7.6 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 45c5.2 0 10-2 13.6-5.4l-6.3-5.2C29.3 35.5 26.8 36.5 24 36.5 18.8 36.5 14.5 33.2 13 28.6l-6.6 5C9.1 40.4 16 45 24 45z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-1 2.8-3.1 5.1-5.7 6.3l6.3 5.2C38.1 36.9 41 31.9 41 26c0-1.9-.2-3.2-.4-5.5z"
        />
      </svg>
    );
  }
  if (provider === 'microsoft') {
    return (
      <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M12 1h10v10H12z" />
        <path fill="#00A4EF" d="M1 12h10v10H1z" />
        <path fill="#FFB900" d="M12 12h10v10H12z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#0A66C2"
        d="M22.23 0H1.77C.79 0 0 .78 0 1.74v20.52C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.74V1.74C24 .78 23.21 0 22.23 0z"
      />
      <path
        fill="#FFF"
        d="M7.06 20.45H3.56V9h3.5v11.45zM5.31 7.49a2.03 2.03 0 110-4.06 2.03 2.03 0 010 4.06zM20.45 20.45h-3.49v-5.58c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.94v5.67H9.49V9h3.35v1.56h.05c.47-.9 1.62-1.85 3.33-1.85 3.56 0 4.22 2.34 4.22 5.39v6.35z"
      />
    </svg>
  );
}

function ProviderButton({
  provider,
  label,
  onClick,
  disabled,
}: {
  provider: 'google' | 'microsoft' | 'linkedin';
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  const brandBg = provider === 'linkedin' ? '#0a66c2' : '#ffffff';
  const brandColor = provider === 'linkedin' ? '#ffffff' : '#111827';

  return (
    <button
      type="button"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundColor: brandBg,
        color: brandColor,
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        fontSize: '14px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        marginBottom: '0.5rem',
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Continue with ${label}`}
    >
      <ProviderIcon provider={provider} />
      <span>{label}</span>
    </button>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<1 | 2>(1); // login: 1=email, 2=password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirm, setConfirm] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Replace simple success state with AlertCenter alerts
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const router = useRouter();
  const { login, register, loginWithGoogle, error: authError } = useAuth();

  const passwordsMismatch = mode === 'register' && confirmTouched && confirm !== password;

  // Helper para adicionar alert
  const pushAlert = (kind: AlertData['kind'], message: string, ttl?: number) => {
    setAlerts((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, kind, message, ttl },
    ]);
  };

  // Helper para remover alert
  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  // Clear alerts when switching modes
  useEffect(() => {
    setAlerts([]);
  }, [mode]);

  // Watch for auth errors and show alerts
  useEffect(() => {
    if (authError) {
      pushAlert('error', authError);
    }
  }, [authError]);

  const handleEmailStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (mode === 'register' && password !== confirm) {
      setConfirmTouched(true);
      return;
    }
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const success = await login(email.trim(), password);
        if (success) {
          pushAlert('success', 'Signed in successfully!');
          setTimeout(() => router.push('/'), 1500); // Small delay to show success alert
        }
      } else {
        // Register mode
        const success = await register(email.trim(), password, username.trim());
        if (success) {
          pushAlert('success', 'Account created! Check your email to activate it.');
          // Reset form but keep on register mode
          setEmail('');
          setPassword('');
          setUsername('');
          setConfirm('');
          setConfirmTouched(false);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvider = (provider: 'google' | 'microsoft' | 'linkedin') => {
    if (provider === 'google') {
      loginWithGoogle();
    } else {
      pushAlert('warning', 'OAuth for this provider is not implemented yet.');
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
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/">
            <img
              src="/assets/images/logos/logoA.webp"
              alt="Logo"
              style={{ height: '60px' }}
            />
          </Link>
        </div>

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

          {/* Title */}
          <h1 style={{ fontSize: '1.35rem', margin: '0 0 .75rem', fontWeight: 600 }}>
            {mode === 'login'
              ? step === 1
                ? 'Welcome back'
                : 'Enter your password'
              : 'Create your account'}
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.85, margin: '0 0 1.25rem' }}>
            {mode === 'login'
              ? step === 1
                ? 'Sign in with email or a provider'
                : `Signing in as ${email || 'your email'}`
              : 'It takes less than a minute'}
          </p>

          {/* Error message */}
          {/* {error && (
            <div
              role="alert"
              style={{
                background: 'linear-gradient(90deg,#c026d3,#db2777)',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                fontSize: 13,
                marginBottom: '1rem',
              }}
            >
              {error}
            </div>
          )} */}

          {/* Social logins (apenas no login passo 1) */}
          {mode === 'login' && step === 1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <ProviderButton
                provider="google"
                label="Continue with Google"
                onClick={() => handleProvider('google')}
                disabled={submitting}
              />
              <ProviderButton
                provider="microsoft"
                label="Continue with Microsoft"
                onClick={() => handleProvider('microsoft')}
                disabled={submitting}
              />
              <ProviderButton
                provider="linkedin"
                label="Continue with LinkedIn"
                onClick={() => handleProvider('linkedin')}
                disabled={submitting}
              />

              <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <span style={{ fontSize: '13px', opacity: 0.7 }}>or</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={step === 1 && mode === 'login' ? handleEmailStep : handleSubmit}>
            {/* Register mode - show all fields at once */}
            {mode === 'register' && (
              <>
                <label
                  htmlFor="username"
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  autoComplete="username"
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
                />

                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  Email
                </label>
                <input
                  id="email"
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
                />

                <label
                  htmlFor="password"
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 12,
                      padding: '0.85rem 1rem',
                      paddingRight: '3rem',
                      color: 'white',
                      fontSize: 15,
                      outline: 'none',
                      marginBottom: '1.1rem',
                    }}
                  />

                </div>

                <label
                  htmlFor="confirm"
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setConfirmTouched(true);
                  }}
                  placeholder="Confirm your password"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${passwordsMismatch ? '#dc3545' : 'rgba(255,255,255,0.25)'}`,
                    borderRadius: 12,
                    padding: '0.85rem 1rem',
                    color: 'white',
                    fontSize: 15,
                    outline: 'none',
                    marginBottom: '0.5rem',
                  }}
                />
                {passwordsMismatch && (
                  <p style={{ color: '#dc3545', fontSize: 12, margin: '0 0 1.1rem' }}>
                    Passwords do not match
                  </p>
                )}
              </>
            )}

            {/* Login mode - step 1: email */}
            {mode === 'login' && step === 1 && (
              <>
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  Email
                </label>
                <input
                  id="email"
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
                />
              </>
            )}

            {/* Login mode - step 2: password */}
            {mode === 'login' && step === 2 && (
              <>
                <label
                  htmlFor="password"
                  style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 12,
                      padding: '0.85rem 1rem',
                      paddingRight: '3rem',
                      color: 'white',
                      fontSize: 15,
                      outline: 'none',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      opacity: 0.7,
                    }}
                  >
                    {/*{showPassword ? '👁️' : '👁️‍🗨️'}*/}
                  </button>
                </div>

                <div style={{ textAlign: 'right', marginBottom: '1.1rem' }}>
                  <Link
                    href="/auth/forgot-password"
                    style={{ color: '#6366f1', fontSize: 13, textDecoration: 'none' }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </>
            )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  {/* Back button */}
                  {step === 2 && mode === 'login' && (
                      <button
                          type="button"
                          onClick={() => setStep(1)}
                          aria-label="Terminar sessão"
                          className="tj-primary-btn btn-light hidden xl:inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                          style={{width: '37%',  opacity: submitting ? 0.8 : 1,display: 'flex',marginRight: 'auto'  }}
                      >
                          <div className="btn-inner">
                              <span className="btn-icon h-icon"><i className="tji-arrow-left" /></span>
                              <span className="btn-text">Get back</span>
                              <span className="btn-icon"><i className="tji-arrow-left" /></span>
                          </div>
                      </button>
                  )}

                  {/* Submit button */}
                  <button
                      type="submit"
                      disabled={
                          submitting ||
                          (step === 1 && !email.trim()) ||
                          (step === 2 && mode === 'login' && !password) ||
                          (mode === 'register' && (!email.trim() || !password || !username.trim() || passwordsMismatch))
                      }
                      className="tj-primary-btn"
                      style={{ width: '37%', opacity: submitting ? 0.8 : 1,display: 'flex',marginLeft: 'auto' }}
                      aria-busy={submitting}
                  >
                      <div className="btn-inner">
                          <span className="btn-text">
                            {submitting
                                ? mode === 'login'
                                    ? 'Signing in...'
                                    : 'Creating account...'
                                : step === 1 && mode === 'login'
                                    ? 'Continue'
                                    : mode === 'login'
                                        ? 'Sign in'
                                        : 'Create account'}
                          </span>
                          <span className="btn-icon"><i className="tji-arrow-right" /></span>

                      </div>
                  </button>
              </div>
            {/* Mode switch */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setStep(1);
                    setPassword('');
                    setUsername('');
                    setConfirm('');
                    setConfirmTouched(false);
                    setAlerts([]); // Clear alerts when switching modes
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>

      {/* Alert center */}
      <AlertCenter alerts={alerts} onDismiss={dismissAlert} />
    </main>
  );
}
