'use client';

import { useEffect } from 'react';
import { site } from '@/lib/site';

export function CalendlyEmbed({ url = site.calendly.url }: { url?: string }) {
  useEffect(() => {
    const existing = document.querySelector('script[data-calendly]');
    if (existing) return;

    const s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    s.dataset.calendly = 'true';
    document.body.appendChild(s);
  }, []);

  return (
    <div className="rounded-2xl bg-white/[0.04] ring-1 ring-border shadow-card overflow-hidden">
      <div
        className="calendly-inline-widget"
        data-url={url}
        style={{ width: '100%', minWidth: '320px', height: '700px' }}
      />
    </div>
  );
}
