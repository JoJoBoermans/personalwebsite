import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cases',
  robots: { index: false, follow: false }
};

export default function CasesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-text-primary">
      <h1 className="font-display text-3xl font-semibold">Cases (hidden)</h1>
      <p className="mt-4 text-text-secondary">
        Placeholder for case studies. Designed to activate later without changing IA.
      </p>
    </main>
  );
}
