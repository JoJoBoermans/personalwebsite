'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';

export function MobileNav({
  items,
  onBook
}: {
  items: Array<{ href: string; label: string }>;
  onBook?: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-text-primary ring-1 ring-border hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60"
      >
        <span className="sr-only">Toggle navigation</span>
        <div className="grid gap-1">
          <span className="block h-0.5 w-5 rounded bg-text-primary" />
          <span className="block h-0.5 w-5 rounded bg-text-primary/80" />
          <span className="block h-0.5 w-5 rounded bg-text-primary/60" />
        </div>
      </button>

      {open ? (
        <div id="mobile-nav" className="fixed inset-0 z-50">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-3 right-3 top-3 rounded-2xl bg-bg-900 ring-1 ring-border shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-text-primary">Menu</p>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white/[0.05] px-3 py-2 text-sm font-semibold text-text-primary ring-1 ring-border hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60"
              >
                Close
              </button>
            </div>
            <div className="p-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-text-primary hover:bg-white/[0.04]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-white/10 p-3">
              {onBook ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onBook();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-accent-500 to-accent-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition will-change-transform hover:translate-y-[-1px] hover:shadow-[0_0_0_1px_rgba(59,130,246,.35),0_0_60px_rgba(59,130,246,.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60"
                >
                  Book a Call
                </button>
              ) : (
                <Button href="/" className="w-full">Book a Call</Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
