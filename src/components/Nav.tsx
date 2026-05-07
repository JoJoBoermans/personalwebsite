import Link from 'next/link';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/services/', label: 'Services' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' }
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-900/70 backdrop-blur supports-[backdrop-filter]:bg-bg-900/50">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-500/30 to-violet-500/20 ring-1 ring-border shadow-glow" />
          <span className="font-display text-sm font-semibold tracking-tight">Joshua Boermans</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-text-secondary transition hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button href="#book" className="hidden sm:inline-flex">Book a Call</Button>
          <Button href="/services/" variant="secondary" className="sm:hidden">
            Services
          </Button>
        </div>
      </Container>
    </header>
  );
}
