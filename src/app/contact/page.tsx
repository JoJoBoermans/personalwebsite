import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { CalendlyEmbed } from '@/components/CalendlyEmbed';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Book a call with Joshua Boermans or reach out via email/LinkedIn.'
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 grid-bg" />
      <Nav />

      <Section
        eyebrow="Contact"
        title="Book a call"
        subtitle="No forms. Just pick a time — or reach out directly."
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="rounded-2xl bg-white/[0.04] p-7 ring-1 ring-border shadow-card">
            <h3 className="font-display text-xl font-semibold">Direct</h3>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <p>
                Email: <a className="text-text-primary hover:underline" href={`mailto:${site.socials.email}`}>{site.socials.email}</a>
              </p>
              <p>
                LinkedIn: <a className="text-text-primary hover:underline" href={site.socials.linkedin} target="_blank" rel="noreferrer">Profile</a>
              </p>
            </div>
            <p className="mt-6 text-sm text-text-secondary">
              If you share your ICP and a few example accounts, we’ll come prepared with a channel + sequence recommendation.
            </p>
          </div>
          <div>
            <CalendlyEmbed url={site.calendly.url} />
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
