import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Outbound infrastructure services: cold outreach, appointment setting, lead lists, CRM automation, funnel building, and outbound systems.'
};

const blocks = [
  {
    title: 'Cold Outreach',
    desc: 'Sequence design, copy frameworks, and deliverability-first execution. Built to earn replies from your ICP without sounding like an agency template.'
  },
  {
    title: 'Appointment Setting',
    desc: 'Qualification, booking, calendar discipline, and clean handoffs. The outcome is meetings your team actually wants to take.'
  },
  {
    title: 'Lead Lists (Lead Sourcing)',
    desc: 'ICP research, enrichment, validation, and QA. Lists designed for conversion — not volume.'
  },
  {
    title: 'CRM Automation',
    desc: 'Workflows, routing, hygiene, and reporting. Reliable pipeline visibility without manual ops overhead.'
  },
  {
    title: 'Funnel Building',
    desc: 'Offer positioning, landing assets, and conversion-oriented messaging that supports outbound performance.'
  },
  {
    title: 'Outbound Infrastructure',
    desc: 'A complete outbound system: tooling, domains, sequences, governance, QA, and optimization loops.'
  }
] as const;

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-bg-900">
      <div className="aurora" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 grid-bg" />
      <Nav />

      <Section
        eyebrow="Services"
        title="Outbound capabilities you can deploy fast"
        subtitle="Choose a starting point. We’ll build the infrastructure to scale it."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {blocks.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.04}>
              <div className="rounded-2xl bg-white/[0.04] p-7 ring-1 ring-border shadow-card">
                <h3 className="font-display text-xl font-semibold">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {b.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
}
