/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type LoginModalProps = {
  open: boolean;
  onCloseAction: () => void;
  onSubmitAction?: (payload: {
    mode: 'login' | 'register';
    email: string;
    password: string;
    username?: string;
  }) => Promise<void> | void;
  onProviderAction?: (provider: 'google' | 'microsoft' | 'linkedin') => void;
  errorMessage?: string | null; // mensagem de erro (ex: credenciais inválidas)
  infoMessage?: string | null; // mensagem informativa (ex: verifique seu email)
};

// Caminho do background decorativo (ajusta conforme o teu public/)
const BACKGROUND_URL = '/assets/images/shape/funfact-blur.webp';

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
      className="btn w-100 d-flex align-items-center justify-content-center gap-2 border rounded-3 py-2"
      style={{ backgroundColor: brandBg, color: brandColor }}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Continue with ${label}`}
    >
      <ProviderIcon provider={provider} />
      <span className="fw-medium">{label}</span>
    </button>
  );
}

export default function LoginModal({
  open,
  onCloseAction,
  onSubmitAction,
  onProviderAction,
  errorMessage,
  infoMessage,
}: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<1 | 2>(1); // login: 1=email, 2=password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirm, setConfirm] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement | null>(null);

  // Reset quando abre
  useEffect(() => {
    if (open) {
      setMode('login');
      setStep(1);
      setEmail('');
      setPassword('');
      setUsername('');
      setConfirm('');
      setConfirmTouched(false);
      setShowPassword(false);
    }
  }, [open]);

  // ESC, focus trap, scroll lock
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseAction();
      if (e.key === 'Tab' && open && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstFocusableRef.current?.focus(), 0);
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onCloseAction]);

  if (!open) return null;

  const passwordsMismatch = mode === 'register' && confirmTouched && confirm !== password;

  const handleOuterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) onCloseAction();
  };

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
      await onSubmitAction?.({
        mode,
        email: email.trim(),
        password,
        username: mode === 'register' ? username.trim() : undefined,
      });
      onCloseAction();
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting;

  return (
    <>
      <div
        ref={modalRef}
        className="modal fade show"
        style={{ display: 'block', backgroundColor: 'rgb(6,1,41)' }}
        aria-modal="true"
        role="dialog"
        aria-labelledby="auth-title"
        aria-describedby="auth-desc"
        onClick={handleOuterClick}
      >
        <div className="modal-dialog modal-dialog-centered">
          {/* Card com BG */}
          <div className="modal-content border-0 shadow-lg position-relative overflow-hidden auth-card">
            {/* BG image */}
            <div
              className="auth-bg position-absolute top-0 start-0 w-100 h-100"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${BACKGROUND_URL})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(8px)',
                opacity: 0.45,
                transform: 'scale(1.1)',
              }}
            />
            {/* Overlay */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              aria-hidden="true"
              style={{
                background:
                  'linear-gradient(180deg, rgba(24,19,59,.85) 0%, rgba(24,19,59,.95) 60%, rgba(13,9,35,.98) 100%)',
              }}
            />
            {/* Conteúdo */}
            <div className="position-relative" style={{ zIndex: 2 }}>
              {/* Header com logo */}
              <div
                className="modal-header border-0 d-flex justify-content-between align-items-center"
                style={{ background: 'transparent' }}
              >
                <div className="site_logo">
                  <Link className="logo d-inline-flex align-items-center" href="/">
                    <img
                      src="/assets/images/logos/logoA.webp"
                      alt="Logo"
                      style={{ height: '60px' }}
                    />
                  </Link>
                </div>
                <button
                  ref={firstFocusableRef}
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={onCloseAction}
                />
              </div>

              {/* Título */}
              <div className="px-4">
                <h5 id="auth-title" className="text-white mb-2">
                  {mode === 'login'
                    ? step === 1
                      ? 'Welcome back'
                      : 'Enter your password'
                    : 'Create your account'}
                </h5>
                <p id="auth-desc" className="text-white-50 small mb-3">
                  {mode === 'login'
                    ? step === 1
                      ? 'Sign in with email or a provider'
                      : `Signing in as ${email || 'your email'}`
                    : 'It takes less than a minute'}
                </p>
                {/* Removido: alertas inline (errorMessage / infoMessage) para usar AlertCenter global na página inicial */}
                {/* {errorMessage && (
                  <div className="alert alert-danger py-2 px-3 small" role="alert">
                    {errorMessage}
                  </div>
                )}
                {infoMessage && !errorMessage && (
                  <div className="alert alert-info py-2 px-3 small" role="status">
                    {infoMessage}
                  </div>
                )} */}
              </div>

              {/* Social logins (apenas no login passo 1) */}
              {mode === 'login' && step === 1 && (
                <div className="px-4 pt-1 pb-0">
                  <div className="d-flex flex-column gap-2">
                    <ProviderButton
                      provider="google"
                      label="Continue with Google"
                      onClick={() => onProviderAction?.('google')}
                      disabled={disabled}
                    />
                    <ProviderButton
                      provider="microsoft"
                      label="Continue with Microsoft"
                      onClick={() => onProviderAction?.('microsoft')}
                      disabled={disabled}
                    />
                    <ProviderButton
                      provider="linkedin"
                      label="Continue with LinkedIn"
                      onClick={() => onProviderAction?.('linkedin')}
                      disabled={disabled}
                    />
                  </div>
                  <div className="text-center text-white-50 my-3">or</div>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={
                  mode === 'login' ? (step === 1 ? handleEmailStep : handleSubmit) : handleSubmit
                }
                noValidate
              >
                <div className="modal-body pt-0">
                  {/* REGISTER: username */}
                  {mode === 'register' && (
                    <div className="mb-3">
                      <label htmlFor="register-username" className="form-label text-white">
                        Username
                      </label>
                      <input
                        id="register-username"
                        type="text"
                        className="form-control form-control-lg bg-transparent text-white border-secondary"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="yourname"
                        autoComplete="username"
                      />
                    </div>
                  )}

                  {/* REGISTER: email */}
                  {mode === 'register' && (
                    <div className="mb-3">
                      <label htmlFor="register-email" className="form-label text-white">
                        Email
                      </label>
                      <input
                        id="register-email"
                        type="email"
                        className="form-control form-control-lg bg-transparent text-white border-secondary"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>
                  )}

                  {/* LOGIN STEP 1: email */}
                  {mode === 'login' && step === 1 && (
                    <div className="mb-3">
                      <label htmlFor="login-email" className="form-label text-white">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        className="form-control form-control-lg bg-transparent text-white border-secondary"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        inputMode="email"
                      />
                    </div>
                  )}

                  {/* PASSWORD (register sempre mostra; login no step 2) */}
                  {(mode === 'register' || (mode === 'login' && step === 2)) && (
                    <div className="mb-2">
                      <label htmlFor="login-password" className="form-label text-white">
                        Password
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          className="form-control bg-transparent text-white border-secondary"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          aria-describedby="toggle-password"
                        />
                        <button
                          type="button"
                          id="toggle-password"
                          className="btn btn-outline-secondary text-white"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-pressed={showPassword}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {mode === 'login' && step === 2 && (
                        <div className="mt-1 text-end">
                          <Link
                            href="/auth/forgot-password"
                            className="text-decoration-none"
                            style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}
                          >
                            Forgot password?
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* REGISTER: confirm */}
                  {mode === 'register' && (
                    <div className="mb-1">
                      <label htmlFor="login-confirm" className="form-label text-white">
                        Confirm password
                      </label>
                      <input
                        id="login-confirm"
                        type="password"
                        className={`form-control form-control-lg bg-transparent text-white border-secondary ${
                          passwordsMismatch ? 'is-invalid' : ''
                        }`}
                        required
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        onBlur={() => setConfirmTouched(true)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      {passwordsMismatch && (
                        <div className="invalid-feedback">Passwords don’t match.</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer d-flex justify-content-between align-items-center border-0">
                  {mode === 'login' ? (
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none text-white-50"
                      onClick={() => {
                        setMode('register');
                        setStep(1);
                      }}
                      disabled={disabled}
                    >
                      Create an account
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none text-white-50"
                      onClick={() => {
                        setMode('login');
                        setStep(1);
                      }}
                      disabled={disabled}
                    >
                      Back to login
                    </button>
                  )}

                  <div className="d-flex gap-2">
                    {mode === 'login' && step === 2 && (
                      <button
                        type="button"
                        className="btn btn-outline-light"
                        onClick={() => setStep(1)}
                        disabled={disabled}
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={disabled}
                      className="tj-primary-btn"
                      aria-busy={disabled}
                    >
                      <div className="btn-inner">
                        <span className="btn-text">
                          {mode === 'login'
                            ? step === 1
                              ? 'Continue'
                              : disabled
                                ? 'Signing in…'
                                : 'Login'
                            : disabled
                              ? 'Creating…'
                              : 'Create account'}
                        </span>
                        <span className="btn-icon">
                          <i className="tji-arrow-right"></i>
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop com blur */}
      <div
        className="modal-backdrop fade show custom-blur-backdrop"
        onClick={onCloseAction}
        aria-hidden="true"
      />

      {/* estilos globais úteis */}
      <style jsx global>{`
        .auth-card {
          background-color: #18133b;
          border-radius: 18px;
        }
        .auth-bg {
          pointer-events: none;
        }
        .form-control.bg-transparent {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
        }
        .form-control.bg-transparent:focus {
          color: #ffffff;
          background-color: transparent;
          border-color: rgba(255, 255, 255, 0.45);
          box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1);
        }
        .form-control::placeholder {
          color: rgba(255, 255, 255, 0.6);
          opacity: 1;
        }
        .btn-outline-secondary {
          border-color: rgba(255, 255, 255, 0.25);
        }
        .btn-outline-secondary:hover,
        .btn-outline-secondary:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.45);
        }
        .custom-blur-backdrop {
          backdrop-filter: blur(6px);
        }
      `}</style>
    </>
  );
}
