import { clsx } from 'clsx';
import { Container } from '@/components/Container';

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={clsx('py-16 sm:py-20', className)}>
      <Container>
        <div className="mx-auto max-w-3xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-4 text-base leading-relaxed text-text-secondary">{subtitle}</p>
          ) : null}
        </div>
        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}
