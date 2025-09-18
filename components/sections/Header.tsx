/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

// Mantido para compatibilidade: callback para abrir modal de login
// Se o usuário estiver autenticado mostramos info + logout
// Caso contrário, mostramos botão de login

type HeaderProps = {
  onLoginClickAction?: () => void;
};

export default function Header({ onLoginClickAction }: HeaderProps) {
  const { user, logout, loading } = useAuth();

  return (
    <>
      {/* Header principal do site */}
      <header className="header-area header-2" style={{ padding: '4px 0' }}>
        <div className="header-bottom">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="header-wrapper" style={{ padding: '5px 0' }}>
                  {/* Logo */}
                  <div className="site_logo">
                    <Link className="logo" href="/">
                      <img
                        src="/assets/images/logos/logoA.webp"
                        alt="Logo"
                        style={{ height: '60px' }}
                      />
                    </Link>
                  </div>

                  {/* Lado direito (auth) */}
                  <div className="header-right-item d-none d-lg-inline-flex align-items-center gap-3">
                    {loading && (
                      <span className="text-white-50 small" aria-live="polite">
                        Carregando sessão...
                      </span>
                    )}

                    {!loading && user && (
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex flex-column text-end">
                          <span className="text-white fw-semibold" style={{ lineHeight: 1 }}>
                            {user.username || user.email}
                          </span>
                          <span
                            className={`small ${user.email_verified ? 'text-success' : 'text-warning'}`}
                            style={{ lineHeight: 1 }}
                          >
                            {user.email_verified ? 'Verificado' : 'Não verificado'}
                          </span>
                        </div>
                        {/* Avatar simples com inicial */}
                        <div
                          className="d-inline-flex justify-content-center align-items-center rounded-circle bg-primary text-white fw-bold"
                          style={{ width: 46, height: 46 }}
                          aria-label="User avatar"
                        >
                          {(user.username || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <button
                          type="button"
                          onClick={logout}
                          className="btn btn-sm btn-outline-light"
                          aria-label="Terminar sessão"
                        >
                          Sair
                        </button>
                      </div>
                    )}

                    {!loading && !user && (
                      <div className="header-button">
                        <button
                          type="button"
                          onClick={onLoginClickAction}
                          className="tj-primary-btn"
                          aria-label="Abrir modal de login"
                        >
                          <div className="btn-inner">
                            <span className="btn-icon h-icon">
                              <i className="tji-arrow-right"></i>
                            </span>
                            <span className="btn-text">Login</span>
                            <span className="btn-icon">
                              <i className="tji-arrow-right"></i>
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
