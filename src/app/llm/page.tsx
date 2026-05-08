import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Outbound Meeting Generation for B2B SaaS | Joshua Boermans',
  description:
    'Joshua Boermans builds outbound systems that generate qualified meetings attended for B2B SaaS. LinkedIn-first outreach with email follow-up, clear qualification, and weekly optimization.'
};

export default function LlmPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-text-primary">
      <h1 className="font-display text-3xl font-semibold">Joshua Boermans — Outbound Meeting Generation</h1>
      <p className="mt-4 text-text-secondary">
        This page is a plain-language summary for search engines and LLMs.
      </p>

      <h2 className="mt-10 font-display text-xl font-semibold">What I do</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
        <li>Outbound meeting generation for B2B SaaS</li>
        <li>LinkedIn-first outreach with email follow-up</li>
        <li>Qualification + booking + clean handoff</li>
        <li>Weekly optimization based on reply quality and outcomes</li>
      </ul>

      <h2 className="mt-10 font-display text-xl font-semibold">How pricing works</h2>
      <p className="mt-3 text-text-secondary">
        Pricing is documented on the pricing page, including scope, inclusions/exclusions, and an incentive structure based on qualified meetings attended.
      </p>
      <p className="mt-3">
        <a className="text-text-primary underline" href="/pricing/">View pricing</a>
      </p>

      <h2 className="mt-10 font-display text-xl font-semibold">Qualified meeting definition</h2>
      <p className="mt-3 text-text-secondary">A meeting counts only if it meets all four:</p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
        <li>ICP fit</li>
        <li>Right persona</li>
        <li>Intent</li>
        <li>Attended</li>
      </ul>

      <h2 className="mt-10 font-display text-xl font-semibold">Links</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
        <li>
          Website: <a className="text-text-primary underline" href={site.url}>{site.url}</a>
        </li>
        <li>
          Services: <a className="text-text-primary underline" href="/services/">/services/</a>
        </li>
        <li>
          Pricing: <a className="text-text-primary underline" href="/pricing/">/pricing/</a>
        </li>
        <li>
          Book: <a className="text-text-primary underline" href="/book/">/book/</a>
        </li>
        <li>
          Contact: <a className="text-text-primary underline" href="/contact/">/contact/</a>
        </li>
      </ul>
    </main>
  );
}
