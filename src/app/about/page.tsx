import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Joshua Boermans — outbound systems expert helping B2B start-ups and scale-ups generate consistent meetings through AI-enhanced multi-channel outreach.'
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-900">
      <div className="aurora" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 grid-bg" />
      <Nav />

      <Section
        eyebrow="About"
        title="Technical outbound. Measured outcomes."
        subtitle="We build outbound systems that behave like infrastructure: defined inputs, observable outputs, and continuous iteration."
      >
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl bg-white/[0.04] p-7 ring-1 ring-border shadow-card">
              <h3 className="font-display text-xl font-semibold">Positioning</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                We help B2B start-ups and scale-ups generate consistent, high-quality meetings through AI-powered multi-channel outbound.
                The focus is quality and repeatability — not spam volume.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="rounded-2xl bg-white/[0.04] p-7 ring-1 ring-border shadow-card">
              <h3 className="font-display text-xl font-semibold">What we optimize</h3>
              <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                <li>Deliverability + domain strategy</li>
                <li>Lead quality and enrichment</li>
                <li>Messaging architecture and sequencing</li>
                <li>CRM hygiene and reporting</li>
                <li>Channel mix (email, LinkedIn, selective calling)</li>
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-6 max-w-4xl">
          <Reveal delay={0.08}>
            <div className="rounded-2xl bg-gradient-to-br from-accent-500/10 to-violet-500/10 p-7 ring-1 ring-border shadow-card">
              <h3 className="font-display text-xl font-semibold">Experience</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                7+ years in sales and outbound execution. Startup and scale-up environments.
                Systems-first approach: build once, measure, iterate.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
