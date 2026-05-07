import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources',
  robots: { index: false, follow: false }
};

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-text-primary">
      <h1 className="font-display text-3xl font-semibold">Resources (hidden)</h1>
      <p className="mt-4 text-text-secondary">
        Placeholder for future outbound playbooks, checklists, and templates.
      </p>
    </main>
  );
}
