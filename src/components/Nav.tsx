'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { MobileNav } from '@/components/MobileNav';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/services/', label: 'Services' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' }
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-900/70 backdrop-blur supports-[backdrop-filter]:bg-bg-900/50">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white/[0.03] ring-1 ring-border shadow-glow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-jb-mark.svg"
              alt="JB"
              className="h-full w-full"
              loading="eager"
              decoding="async"
            />
          </div>
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
          <Button href="/book">Book a Call</Button>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <MobileNav items={nav} onBook={() => (window.location.href = '/book')} />
        </div>
      </Container>
    </header>
  );
}
