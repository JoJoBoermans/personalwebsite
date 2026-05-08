import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Pricing for outbound meeting generation: Core (€2,500/mo), Growth (€3,750/mo), Scale (€5,500/mo) + €2,500 setup. LinkedIn + email follow-up, qualification, and weekly optimization.'
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-white/[0.03] p-4 ring-1 ring-border">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
        {label}
      </div>
      <div className="text-sm text-text-primary">{value}</div>
    </div>
  );
}

function Foldout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl bg-white/[0.04] ring-1 ring-border shadow-card">
      <summary className="cursor-pointer list-none px-6 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60">
        <div className="flex items-center justify-between gap-4">
          <div className="font-display text-base font-semibold text-text-primary">{title}</div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] text-accent-500 ring-1 ring-border transition group-open:rotate-45">
            +
          </span>
        </div>
      </summary>
      <div className="px-6 pb-6 text-sm leading-relaxed text-text-secondary">
        {children}
      </div>
    </details>
  );
}

const offerCatalogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: 'Outbound pricing',
  url: 'https://joshuaboermans.com/pricing/',
  itemListElement: [
    {
      '@type': 'Offer',
      name: 'Core',
      priceCurrency: 'EUR',
      price: '2500',
      category: 'Monthly retainer'
    },
    {
      '@type': 'Offer',
      name: 'Growth',
      priceCurrency: 'EUR',
      price: '3750',
      category: 'Monthly retainer'
    },
    {
      '@type': 'Offer',
      name: 'Scale',
      priceCurrency: 'EUR',
      price: '5500',
      category: 'Monthly retainer'
    },
    {
      '@type': 'Offer',
      name: 'Setup',
      priceCurrency: 'EUR',
      price: '2500',
      category: 'One-time'
    }
  ]
} as const;

function PricingCard({
  name,
  price,
  target,
  threshold,
  whoItsFor,
  highlights,
  accent
}: {
  name: string;
  price: string;
  target: string;
  threshold: string;
  whoItsFor: string;
  highlights: string[];
  accent?: boolean;
}) {
  return (
    <div
      className={
        'relative h-full overflow-hidden rounded-3xl p-6 ring-1 shadow-card ' +
        (accent
          ? 'bg-gradient-to-br from-accent-500/14 to-violet-500/10 ring-border'
          : 'bg-white/[0.04] ring-border')
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]">
        <div className="absolute -top-10 left-10 h-28 w-28 rounded-full bg-accent-500/10 blur-2xl" />
        <div className="absolute -bottom-12 right-10 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
              {name}
            </div>
            <div className="mt-2 font-display text-3xl font-semibold tracking-tight text-text-primary">
              {price}
            </div>
          </div>
          <div className="rounded-2xl bg-white/[0.03] px-3 py-2 text-xs font-semibold text-text-primary ring-1 ring-border">
            {threshold}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-text-secondary">{whoItsFor}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoRow label="Target" value={target} />
          <InfoRow label="Incentive" value="€100 per qualified meeting attended" />
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Included
          </div>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary">
            {highlights.map((h) => (
              <li key={h} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent-500" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/book">Book a Call</Button>
          <Button
            href="/contact/"
            variant="ghost"
            className="ring-1 ring-border bg-white/[0.03] hover:bg-white/[0.05]"
          >
            Ask a question
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 grid-bg" />
      <Nav />

      <main>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalogJsonLd) }}
        />

        <Section
          eyebrow="Pricing"
          title="Clear pricing. Clear scope."
          subtitle="You’re paying for a measurable system that produces qualified meetings attended — not vague ‘activity’."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <Reveal>
              <PricingCard
                name="Core"
                price="€2,500 / mo"
                target="5–10 qualified meetings attended / month"
                threshold="Threshold: 5 attended"
                whoItsFor="For SaaS teams who want consistent meetings without overcomplicating targeting or messaging."
                highlights={[
                  'Outreach execution (LinkedIn + email follow-up)',
                  'Sequence build + weekly iteration',
                  'Basic qualification + booking',
                  'Weekly updates + next-step plan'
                ]}
              />
            </Reveal>
            <Reveal delay={0.06}>
              <PricingCard
                name="Growth"
                price="€3,750 / mo"
                target="10–15 qualified meetings attended / month"
                threshold="Threshold: 10 attended"
                whoItsFor="For SaaS teams ready to test more angles and turn outbound into a steady pipeline channel."
                highlights={[
                  'More testing velocity (multiple cohorts over time)',
                  'Tighter QA on targeting + messaging',
                  'Qualification + clean handoff notes',
                  'Weekly updates + experiment backlog'
                ]}
                accent
              />
            </Reveal>
            <Reveal delay={0.12}>
              <PricingCard
                name="Scale"
                price="€5,500 / mo"
                target="15–25 qualified meetings attended / month"
                threshold="Threshold: 15 attended"
                whoItsFor="For scaling SaaS teams expanding segments/markets while keeping quality high."
                highlights={[
                  'Higher cadence optimization',
                  'More cohorts over time (replace underperformers)',
                  'Optional dashboard setup (Scale only)',
                  'Fast response SLA (business hours)'
                ]}
              />
            </Reveal>
          </div>

          <div className="mt-10 rounded-2xl bg-white/[0.04] p-6 ring-1 ring-border shadow-card">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Setup (Required)
                </div>
                <div className="mt-1 font-display text-2xl font-semibold text-text-primary">€2,500 one-time</div>
                <p className="mt-2 text-sm text-text-secondary">
                  Week 1–2: ICP + exclusions, offer angles, messaging foundations, outreach setup/QA, reporting template, and qualification/handoff flow.
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button href="/book">Start with a call</Button>
              </div>
            </div>
          </div>
        </Section>

        <Section
          eyebrow="Details"
          title="What the pricing includes"
          subtitle="Fold-outs below explain the variables: what counts, what’s included, and where the boundaries are."
          className="bg-bg-850/30"
        >
          <div className="mx-auto max-w-3xl space-y-4">
            <Reveal>
              <Foldout title="How the €100 incentive works">
                <p>
                  Each tier has a minimum monthly threshold of <b>qualified meetings attended</b> (Core: 5, Growth: 10, Scale: 15).
                  Once the threshold is reached, the incentive is paid at <b>€100 per qualified meeting attended</b> for that month.
                </p>
                <p className="mt-3">
                  This aligns incentives and avoids paying for low-quality booked calls or no-shows.
                </p>
              </Foldout>
            </Reveal>

            <Reveal delay={0.05}>
              <Foldout title="What counts as a qualified meeting">
                <p>A meeting counts only if it meets all four criteria:</p>
                <ul className="mt-3 list-disc pl-5">
                  <li><b>ICP fit</b> (agreed industry/size/geo + exclusions)</li>
                  <li><b>Right persona</b> (agreed roles/titles)</li>
                  <li><b>Intent</b> (clear need/problem aligned to the offer)</li>
                  <li><b>Attended</b> (not canceled, rescheduled indefinitely, or a no-show)</li>
                </ul>
              </Foldout>
            </Reveal>

            <Reveal delay={0.1}>
              <Foldout title="ICP/personas: ‘no limit’ without chaos">
                <p>
                  We can test multiple ICPs and personas, but we cap the number of <b>active cohorts</b> at a time to protect deliverability and keep learning clean.
                  Underperforming cohorts get replaced.
                </p>
                <p className="mt-3">Typical: 2–3 active cohorts concurrently (varies by sending capacity).</p>
              </Foldout>
            </Reveal>

            <Reveal delay={0.15}>
              <Foldout title="Lead lists (included when I run outreach)">
                <p>
                  Lead lists are included in the monthly pricing <b>when I’m running the outreach</b>.
                  If your team prefers to run outreach internally, you can purchase lead lists separately.
                </p>
                <ul className="mt-3 list-disc pl-5">
                  <li><b>€1,000 per 2,000 contacts</b> (minimum 2,000)</li>
                  <li>Includes verified emails + core enrichment (name, title, company, LinkedIn URLs)</li>
                </ul>
              </Foldout>
            </Reveal>

            <Reveal delay={0.2}>
              <Foldout title="Email campaigns (add-on)">
                <p>
                  The core delivery includes LinkedIn outreach with email follow-up.
                  If you want separate, dedicated email campaigns (additional segments, offers, or testing):
                </p>
                <ul className="mt-3 list-disc pl-5">
                  <li><b>€750/mo</b> — 1 additional email campaign (build + manage + iterate)</li>
                  <li><b>€1,250/mo</b> — 2 additional email campaigns</li>
                </ul>
              </Foldout>
            </Reveal>

            <Reveal delay={0.25}>
              <Foldout title="Client responsibilities">
                <ul className="list-disc pl-5">
                  <li>Provide access to a brand email inbox (preferred) and/or LinkedIn account as agreed.</li>
                  <li>Share positioning, differentiators, and approved claims/boundaries.</li>
                  <li>Provide ICP guidance: best-fit customers, exclusions, and target markets.</li>
                  <li>Give feedback on meeting quality and outcomes.</li>
                </ul>
              </Foldout>
            </Reveal>

            <Reveal delay={0.3}>
              <Foldout title="Exclusions (not included)">
                <ul className="list-disc pl-5">
                  <li>Full sales cycle closing</li>
                  <li>Proposal writing</li>
                  <li>Paid ads management</li>
                  <li>Website redesign/development</li>
                  <li>Any work unrelated to generating and qualifying meetings</li>
                </ul>
              </Foldout>
            </Reveal>

            <Reveal delay={0.35}>
              <Foldout title="Inbound lead management">
                <p>
                  Inbound leads are supported only if they go through the same qualification process.
                  Only <b>qualified meetings attended</b> count toward targets and incentives.
                </p>
              </Foldout>
            </Reveal>

            <Reveal delay={0.4}>
              <Foldout title="Reporting + response times">
                <ul className="list-disc pl-5">
                  <li><b>Weekly updates</b>: performance summary, learnings, experiments shipped, next actions.</li>
                  <li><b>Response SLA</b>: Core 48h, Growth 24h, Scale same business day (business hours).</li>
                </ul>
              </Foldout>
            </Reveal>
          </div>
        </Section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="rounded-3xl bg-gradient-to-br from-accent-500/12 to-violet-500/10 p-6 ring-1 ring-border shadow-card sm:p-10">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
                <div>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    Want to see if it fits?
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-text-secondary">
                    Book a 30-minute call. We’ll sanity-check ICP fit, capacity, and what “qualified” should mean for your offer.
                  </p>
                  <div className="mt-8 flex gap-3">
                    <Button href="/book">Book a Call</Button>
                    <Button
                      href="/services/"
                      variant="ghost"
                      className="ring-1 ring-border bg-white/[0.03] hover:bg-white/[0.05]"
                    >
                      See services
                    </Button>
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
