'use client';

import { useEffect } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-bg-900 ring-1 ring-border shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{title ?? 'Details'}</p>
            <p className="mt-0.5 text-xs text-text-secondary">Press Esc to close</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/[0.05] px-3 py-2 text-sm font-semibold text-text-primary ring-1 ring-border hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60"
          >
            Close
          </button>
        </div>
        <div className="p-4 sm:p-5">
          <div className="max-h-[80vh] overflow-auto [-webkit-overflow-scrolling:touch]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
