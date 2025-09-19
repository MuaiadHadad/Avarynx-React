/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useEffect, useRef, useState, useCallback } from 'react';

// Header component now navigates to /auth/login instead of using modal
type HeaderProps = {
  // Remove onLoginClickAction since we're using navigation now
};

export default function Header({}: HeaderProps) {
  const { user, logout, loading } = useAuth();
  // Estado para dropdown do utilizador
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const avatarBtnRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen(o => !o), []);

  // Fechar ao clicar fora
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      if (avatarBtnRef.current?.contains(e.target as Node)) return;
      closeMenu();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen, closeMenu]);

  const displayName = (user?.username && user.username.trim()) || user?.email || '';
  const initials = displayName ? displayName.trim().charAt(0).toUpperCase() : '?';
  const verified = !!user?.email_verified;

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
                  <div className="header-right-item d-none d-lg-inline-flex align-items-center gap-3 relative">
                    {loading && (
                      <span className="text-white-50 small" aria-live="polite">
                        Carregando sessão...
                      </span>
                    )}

                    {!loading && user && (
                      <div className="flex items-center gap-4 pl-2 pr-1">
                        <div className="hidden md:flex flex-col items-end max-w-[200px]">
                          <span className="text-sm font-semibold text-white leading-tight truncate">
                            {displayName}
                          </span>
                          <span
                            className={`mt-0.5 inline-flex items-center gap-1 text-[11px] leading-none font-medium ${verified ? 'text-emerald-400' : 'text-amber-400'}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${verified ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}
                              aria-hidden="true"
                            />
                            {verified ? 'verified' : 'Not verified'}
                          </span>
                        </div>

                        {/* Botão Avatar + toggle menu */}
                        <button
                          ref={avatarBtnRef}
                          type="button"
                          onClick={toggleMenu}
                          aria-haspopup="menu"
                          aria-expanded={menuOpen}
                          className="relative outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full group"
                        >
                          <span className="sr-only">Open user menu</span>
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg select-none
                                       bg-gradient-to-br from-primary-600 to-primary-700 ring-2 ring-primary-600/50 ring-offset-2 ring-offset-[#202020]
                                       transition-all duration-300 group-hover:scale-105 group-active:scale-95 shadow-md shadow-primary-900/40"
                          >
                            {initials}
                          </div>
                          {verified && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#202020] text-white flex items-center justify-center text-[10px] font-bold shadow"
                              title="Email verificado"
                            >
                              ✓
                            </span>
                          )}
                        </button>

                        {/* Botão logout direto (desktop largo) */}
                        <button
                          type="button"
                          onClick={logout}
                          aria-label="Terminar sessão"
                          className="tj-primary-btn btn-light hidden xl:inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          <div className="btn-inner">
                            <span className="btn-icon h-icon"><i className="tji-arrow-right" /></span>
                            <span className="btn-text">Logout</span>
                            <span className="btn-icon"><i className="tji-arrow-right" /></span>
                          </div>
                        </button>

                        {/* Dropdown */}
                        {menuOpen && (
                          <div
                            ref={menuRef}
                            role="menu"
                            aria-label="Menu do utilizador"
                            className="absolute right-0 top-full mt-3 w-64 rounded-lg border border-primary-600/30 bg-[#26204CFF]/95 backdrop-blur-sm
                                       shadow-xl shadow-black/40 p-4 animate-fade-in z-50"
                          >
                            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-primary-600/20">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-primary-600 to-primary-700 ring-2 ring-primary-600/40">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white leading-tight truncate">{displayName}</p>
                                <p className="text-[11px] text-white/60 truncate">{user.email}</p>
                              </div>
                            </div>
                            <ul className="flex flex-col gap-1 text-sm" role="none">
                              <li role="none">
                                <span
                                  className={`w-full inline-flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium select-none ${verified ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}
                                  role="menuitem"
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${verified ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                    aria-hidden="true"
                                  />
                                  {verified ? 'Email verified' : 'Email not verified'}
                                </span>
                              </li>
                              <li role="none">
                                <button
                                  type="button"
                                  onClick={logout}
                                  role="menuitem"
                                  className="w-full text-left px-3 py-2 rounded-md bg-red-600/10 hover:bg-red-600/20 text-red-300 hover:text-red-200
                                             transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                >
                                 Logout
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {!loading && !user && (
                      <div className="header-button">
                        <Link
                          href="/auth/login"
                          className="tj-primary-btn"
                          aria-label="Ir para página de login"
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
                        </Link>
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
