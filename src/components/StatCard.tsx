import { clsx } from 'clsx';

export function StatCard({
  label,
  value,
  hint,
  tone = 'blue'
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'blue' | 'violet' | 'neutral';
}) {
  const toneClass =
    tone === 'blue'
      ? 'from-accent-500/14 to-transparent'
      : tone === 'violet'
        ? 'from-violet-500/14 to-transparent'
        : 'from-white/[0.10] to-transparent';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] p-5 ring-1 ring-border shadow-card">
      <div className={clsx('pointer-events-none absolute inset-0 bg-gradient-to-b', toneClass)} />
      <div className="relative">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
          {label}
        </div>
        <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
          {value}
        </div>
        {hint ? (
          <div className="mt-2 text-sm text-text-secondary">{hint}</div>
        ) : null}
      </div>
    </div>
  );
}
