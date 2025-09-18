'use client';
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type AlertKind = 'info' | 'error' | 'success' | 'warning';
export interface AlertData {
  id: string;
  kind: AlertKind;
  message: string;
  ttl?: number; // ms (default 5s, error 8s)
}

export interface AlertCenterProps {
  alerts: AlertData[];
  onDismiss: (id: string) => void;
}

// Simple color scheme per kind
const STYLES: Record<AlertKind, { border: string; bg: string; icon: JSX.Element; shadow: string }> = {
  info: {
    border: 'border-sky-400/60',
    bg: 'from-sky-500/90 via-sky-600/90 to-sky-700/90',
    shadow: 'shadow-[0_0_0_1px_rgba(56,189,248,0.4),0_4px_24px_-2px_rgba(56,189,248,0.35)]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    )
  },
  success: {
    border: 'border-emerald-400/60',
    bg: 'from-emerald-500/90 via-emerald-600/90 to-emerald-700/90',
    shadow: 'shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_4px_24px_-2px_rgba(16,185,129,0.35)]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/><path d="M20 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8"/></svg>
    )
  },
  warning: {
    border: 'border-amber-400/60',
    bg: 'from-amber-500/90 via-amber-600/90 to-amber-700/90',
    shadow: 'shadow-[0_0_0_1px_rgba(251,191,36,0.45),0_4px_24px_-2px_rgba(245,158,11,0.35)]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    )
  },
  error: {
    border: 'border-rose-400/60',
    bg: 'from-rose-500/90 via-rose-600/90 to-rose-700/90',
    shadow: 'shadow-[0_0_0_1px_rgba(251,113,133,0.45),0_4px_24px_-2px_rgba(225,29,72,0.35)]',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
    )
  }
};

export function AlertCenter({ alerts, onDismiss }: AlertCenterProps) {
  // Auto dismiss via ttl
  useEffect(() => {
    if (!alerts.length) return;
    const timers = alerts.map(alert => {
      const base = alert.ttl ?? (alert.kind === 'error' ? 8000 : 5000);
      return setTimeout(() => onDismiss(alert.id), base);
    });
    return () => { timers.forEach(t => clearTimeout(t)); };
  }, [alerts, onDismiss]);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[2000] flex flex-col gap-3 w-[min(360px,92vw)]">
      <AnimatePresence initial={false}>
        {alerts.map(a => {
          const style = STYLES[a.kind];
          return (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, scale: 0.9, filter: 'blur(6px)' }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.6 }}
              role="alert"
              aria-live={a.kind === 'error' ? 'assertive' : 'polite'}
              className={`group relative overflow-hidden rounded-xl border backdrop-blur-md text-white px-4 py-3 pl-3 shadow-lg ${style.border} ${style.shadow} pointer-events-auto`}
            >
              <div className="absolute inset-0 opacity-[0.35] bg-gradient-to-br from-white/10 via-transparent to-white/5" />
              <div className="absolute -inset-px rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),rgba(255,255,255,0)_70%)]" />
              <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-90`} />
              <div className="relative flex items-start gap-3">
                <div className="mt-[2px] shrink-0 text-white/90 drop-shadow-sm">
                  {style.icon}
                </div>
                <div className="flex-1 text-sm leading-relaxed whitespace-pre-line font-medium tracking-wide">
                  {a.message}
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(a.id)}
                  className="opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none active:scale-95 transition text-white"
                  aria-label="Fechar alerta"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <motion.div
                layoutId="alert-glow"
                className="pointer-events-none absolute -inset-1 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(125deg, rgba(255,255,255,0.25), rgba(255,255,255,0) 60%)',
                  mixBlendMode: 'overlay'
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default AlertCenter;

