import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Reveal } from '@/components/Reveal';
import { CalendlyEmbed } from '@/components/CalendlyEmbed';
import { StatCard } from '@/components/StatCard';
import { IconBolt, IconLayers, IconShield, IconSignal } from '@/components/Icons';

const services = [
  {
    title: 'Cold Outreach',
    desc: 'Personalized messaging that earns replies without sounding like a template.',
    icon: IconSignal
  },
  {
    title: 'Appointment Setting',
    desc: 'Consistent meeting volume with clean handoff and calendar discipline.',
    icon: IconBolt
  },
  {
    title: 'Lead Sourcing',
    desc: 'ICP-first lists with intent, enrichment, and quality control baked in.',
    icon: IconLayers
  },
  {
    title: 'CRM Automations',
    desc: 'Routing, follow-ups, and reporting that keep pipeline reliable.',
    icon: IconShield
  },
  {
    title: 'Outbound Systems',
    desc: 'A repeatable outbound engine: tools, sequences, data, and governance.',
    icon: IconLayers
  },
  {
    title: 'Funnel Building',
    desc: 'Offer + positioning + landing assets that convert meetings to revenue.',
    icon: IconSignal
  }
] as const;

const faqs = [
  {
    q: 'How quickly can we start?',
    a: 'Typically within 7–14 days. We align on ICP, set infrastructure, and ship the first sequences.'
  },
  {
    q: 'Which industries do you work with?',
    a: 'B2B software and services. If you sell to teams (not consumers), it’s usually a fit.'
  },
  {
    q: 'Do you work internationally?',
    a: 'Yes. We run outbound across EU/UK/US time zones with channel-specific constraints.'
  },
  {
    q: 'Is this fully outsourced?',
    a: 'It can be. We can run the system end-to-end, or build it with your team and transfer execution.'
  },
  {
    q: 'Do you help build internal outbound systems?',
    a: 'Yes. Infrastructure, playbooks, sequence design, CRM hygiene, and reporting — built to operate without me.'
  },
  {
    q: 'Which outreach channels do you use?',
    a: 'Email, LinkedIn, and selective calling — based on ICP, market norms, and deliverability constraints.'
  }
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 grid-bg" />

      <Nav />

      {/* HERO */}
      <main>
        <section className="relative overflow-hidden pb-6 pt-12 sm:pt-16">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <Reveal>
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-4 py-2 text-xs font-semibold text-text-secondary ring-1 ring-border">
                    Outbound infrastructure for B2B start-ups & scale-ups
                    <span className="h-1 w-1 rounded-full bg-accent-500" />
                    AI-enhanced multi-channel execution
                  </p>
                </Reveal>

                <Reveal delay={0.05}>
                  <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                    AI-Powered Outbound Systems That Generate Consistent B2B Meetings
                  </h1>
                </Reveal>

                <Reveal delay={0.1}>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
                    We help B2B start-ups and scale-ups generate consistent, high-quality meetings through AI-powered multi-channel outbound.
                  </p>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button href="#book">Book a Call</Button>
                    <Button href="/services/" variant="ghost" className="ring-1 ring-border bg-white/[0.03] hover:bg-white/[0.05]">
                      View Services
                    </Button>
                  </div>
                </Reveal>

                <Reveal delay={0.19}>
                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard label="Average meetings booked" value="20–30" hint="per month (market + offer dependent)" tone="blue" />
                    <StatCard label="Peak month" value="60" hint="meetings booked (best month)" tone="violet" />
                    <StatCard label="Delivery" value="Multi-channel" hint="Email + LinkedIn + selective calling" tone="neutral" />
                  </div>
                </Reveal>

                {/* Visual / "empty space" fill */}
                <div className="relative mt-10 hidden max-w-xl sm:block">
                  <div className="absolute -left-2 top-0 h-24 w-44 rotate-[-2deg] rounded-2xl bg-white/[0.04] ring-1 ring-border shadow-card" />
                  <div className="absolute left-32 top-10 h-20 w-56 rotate-[2deg] rounded-2xl bg-gradient-to-br from-accent-500/10 to-violet-500/10 ring-1 ring-border shadow-card" />
                  <div className="absolute left-10 top-16 h-16 w-40 rotate-[0deg] rounded-2xl bg-white/[0.03] ring-1 ring-border shadow-card" />

                  <div className="absolute -right-8 -top-6 h-44 w-56 rounded-3xl bg-gradient-to-br from-accent-500/14 to-transparent blur-2xl" />
                  <div className="absolute -left-10 top-10 h-44 w-56 rounded-3xl bg-gradient-to-br from-violet-500/12 to-transparent blur-2xl" />

                  <div className="relative h-32" />
                </div>
              </div>

              <Reveal delay={0.1}>
                <div id="book" className="scroll-mt-24">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-text-primary">Book a call</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      30 minutes. We’ll map your ICP, channels, and the fastest path to consistent meetings.
                    </p>
                  </div>

                  {/* Desktop: embed inline. Mobile: route to dedicated booking page for reliability. */}
                  <div className="hidden sm:block">
                    <CalendlyEmbed lazy={false} />
                  </div>

                  <div className="sm:hidden">
                    <Button href="/book" className="w-full">Book a Call</Button>
                    <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                      Opens the scheduler. No forms.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* TRUST / PROOF */}
        <Section
          title="Built for founders who want predictable pipeline"
          subtitle="The goal is simple: consistent, qualified meetings — produced by a system, not luck."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Startup & scale-up execution',
                desc: 'Operator mindset: fast iteration, clean reporting, and tight feedback loops.'
              },
              {
                title: 'Acquisition & growth experience',
                desc: 'Outbound that supports real revenue motion — not vanity metrics.'
              },
              {
                title: 'On average 20 meetings a month',
                desc: 'When ICP, deliverability, and messaging align — volume follows.'
              }
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05}>
                <div className="h-full rounded-2xl bg-white/[0.04] p-6 ring-1 ring-border shadow-card">
                  <div className="font-display text-lg font-semibold">{c.title}</div>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {c.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* SERVICES */}
        <Section
          eyebrow="Services"
          title="Outbound that looks like infrastructure"
          subtitle="Modular capabilities you can start with now — and expand as you scale."
          className="bg-bg-850/30"
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 0.03}>
                  <div className="group h-full rounded-2xl bg-white/[0.04] p-6 ring-1 ring-border shadow-card transition hover:bg-white/[0.06]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-display text-lg font-semibold">
                        {s.title}
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/16 to-violet-500/10 ring-1 ring-border transition group-hover:shadow-glow">
                        <Icon className="h-5 w-5 text-text-primary/90" />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {s.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* PROCESS */}
        <Section
          eyebrow="Process"
          title="A systemized outbound timeline"
          subtitle="Designed to be measurable, repeatable, and resilient — not dependent on heroics."
        >
          <div className="grid gap-6 md:grid-cols-2">
            {[
              'Strategy',
              'Infrastructure',
              'Lead Sourcing',
              'Multi-Channel Outreach',
              'Meeting Generation',
              'Optimization'
            ].map((step, idx) => (
              <Reveal key={step} delay={idx * 0.04}>
                <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] p-6 ring-1 ring-border shadow-card">
                  <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]">
                    <div className="absolute -top-10 left-10 h-28 w-28 rounded-full bg-accent-500/10 blur-2xl" />
                    <div className="absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />
                  </div>
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-border font-display text-sm font-semibold text-text-primary">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="font-display text-lg font-semibold">{step}</div>
                      <div className="mt-1 text-sm text-text-secondary">
                        {idx === 0 && 'ICP definition, offer, constraints, and reporting.'}
                        {idx === 1 && 'Tooling, deliverability, domains, tracking, CRM.'}
                        {idx === 2 && 'List building, enrichment, validation, QA.'}
                        {idx === 3 && 'Email + LinkedIn sequences; human QA; follow-ups.'}
                        {idx === 4 && 'Qualification, booking, handoff, feedback loops.'}
                        {idx === 5 && 'Iteration based on reply quality and revenue outcomes.'}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* FOUNDER */}
        <Section
          eyebrow="Founder"
          title="Joshua Boermans"
          subtitle="I care about turning good products into real revenue — with outreach that’s clear, respectful, and measurable."
          className="bg-bg-850/30"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <div className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-border shadow-card">
                <div className="font-display text-lg font-semibold">What drives me</div>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  I’m at my best when I can take a complex offer, make it easy to understand, and build an outbound engine
                  that creates momentum week after week.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  I like clean inputs and outputs: the right ICP, a list you’d stand behind, messaging that sounds human,
                  and a follow-up system that doesn’t rely on luck.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="rounded-2xl bg-gradient-to-br from-accent-500/10 to-violet-500/10 p-6 ring-1 ring-border shadow-card">
                <div className="font-display text-lg font-semibold">How I help companies succeed</div>
                <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent-500" />Translate technical value into clear outbound positioning</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent-500" />Build multi-channel sequences that earn replies (not spam)</li>
                  <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent-500" />Keep execution tight with tracking, iteration, and feedback loops</li>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="#book">Book a Call</Button>
                  <Button href="/about/" variant="ghost" className="ring-1 ring-border bg-white/[0.03] hover:bg-white/[0.05]">Read more</Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* FAQ */}
        <Section
          eyebrow="FAQ"
          title="Questions founders ask before they commit"
          subtitle="Direct answers. Clear constraints. No sales theatre."
          className="bg-bg-850/30"
        >
          <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-2xl bg-white/[0.04] ring-1 ring-border shadow-card">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.03}>
                <details className="group px-6 py-5">
                  <summary className="-mx-2 cursor-pointer list-none rounded-xl px-2 py-2 font-medium text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.04] text-accent-500 ring-1 ring-border transition group-open:rotate-45">
                      +
                    </span>
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* FINAL CTA */}
        <section className="py-16 sm:py-20">
          <Container>
            <div className="rounded-3xl bg-gradient-to-br from-accent-500/12 to-violet-500/10 p-6 ring-1 ring-border shadow-card sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
                <div>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    Build a Predictable Outbound Pipeline
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-text-secondary">
                    If you want consistent meetings without building a large internal outbound team, let’s map the system.
                  </p>
                  <div className="mt-8 flex gap-3">
                    <Button href="#book">Book a Call</Button>
                    <Button href="/contact/" variant="ghost" className="ring-1 ring-border bg-white/[0.03] hover:bg-white/[0.05]">Contact</Button>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
