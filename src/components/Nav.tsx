'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { MobileNav } from '@/components/MobileNav';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/services/', label: 'Services' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' }
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-900/70 backdrop-blur supports-[backdrop-filter]:bg-bg-900/50">
      <Container className="relative flex h-16 items-center justify-between">
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
        {/* Desktop nav centered */}
        <nav className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center gap-6">
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

        {/* Desktop CTA on right */}
        <div className="hidden md:flex items-center">
          <Button href="/book">Book a Call</Button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <MobileNav items={nav} onBook={() => (window.location.href = '/book')} />
        </div>
      </Container>
    </header>
  );
}
