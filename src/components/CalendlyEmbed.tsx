'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';

function ensureCalendlyScriptLoaded() {
  const existing = document.querySelector('script[data-calendly]');
  if (existing) return;

  const s = document.createElement('script');
  s.src = 'https://assets.calendly.com/assets/external/widget.js';
  s.async = true;
  s.dataset.calendly = 'true';
  document.body.appendChild(s);
}

export function CalendlyEmbed({
  url = site.calendly.url,
  height = 700,
  lazy = true,
  className
}: {
  url?: string;
  height?: number;
  lazy?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(!lazy);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Calendly widgets can fail to initialize on first paint on some mobile browsers
    // unless the script is already present; load it eagerly regardless of lazy mode.
    ensureCalendlyScriptLoaded();

    if (!lazy) {
      return;
    }

    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: '280px 0px' }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [lazy]);

  useEffect(() => {
    if (!active) return;
    ensureCalendlyScriptLoaded();
  }, [active]);

  return (
    <div
      ref={rootRef}
      className={
        'overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-border shadow-card ' +
        (className ?? '')
      }
    >
      {active ? (
        <div
          className="calendly-inline-widget"
          data-url={url}
          style={{ width: '100%', minWidth: '320px', height: `${height}px` }}
        />
      ) : (
        <div className="flex min-h-[520px] items-center justify-center p-8">
          <div className="max-w-sm text-center">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-border" />
            <p className="mt-4 text-sm font-medium text-text-primary">Loading scheduling…</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Opening the booking widget when it’s needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
