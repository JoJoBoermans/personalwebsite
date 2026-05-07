import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  robots: { index: false, follow: false }
};

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-text-primary">
      <h1 className="font-display text-3xl font-semibold">Blog (hidden)</h1>
      <p className="mt-4 text-text-secondary">
        This route is intentionally not in navigation. Future MDX integration lives here.
      </p>
    </main>
  );
}
