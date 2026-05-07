import Link from 'next/link';
import { clsx } from 'clsx';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60 focus-visible:ring-offset-0';

export function Button({
  href,
  children,
  variant = 'primary',
  className
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-b from-accent-500 to-accent-600 text-white shadow-glow hover:translate-y-[-1px] hover:shadow-[0_0_0_1px_rgba(59,130,246,.35),0_0_60px_rgba(59,130,246,.18)]'
      : variant === 'secondary'
        ? 'bg-white/[0.06] text-text-primary ring-1 ring-border hover:bg-white/[0.08] hover:translate-y-[-1px]'
        : 'text-text-primary/90 hover:text-text-primary';

  return (
    <Link href={href} className={clsx(base, styles, className)}>
      {children}
    </Link>
  );
}
