import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { CalendlyEmbed } from '@/components/CalendlyEmbed';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Book a Call',
  description: 'Book a call with Joshua Boermans. Pick a time that works — no forms.'
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-bg-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 grid-bg" />
      <Nav />

      <Section
        eyebrow="Booking"
        title="Book a call"
        subtitle="Pick a time. We’ll map your ICP, channels, and the fastest path to consistent meetings."
      >
        <div className="mx-auto max-w-3xl">
          <CalendlyEmbed url={site.calendly.url} lazy={false} height={780} />
        </div>
      </Section>

      <Footer />
    </div>
  );
}
