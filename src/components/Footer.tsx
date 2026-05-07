import { Container } from '@/components/Container';
import { site } from '@/lib/site';

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-900">
      <Container className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{site.name}</span> — Outbound infrastructure for B2B teams.
        </div>
        <div className="flex items-center gap-5 text-sm">
          <a className="text-text-secondary hover:text-text-primary" href={site.socials.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="text-text-secondary hover:text-text-primary" href={`mailto:${site.socials.email}`}>
            {site.socials.email}
          </a>
        </div>
      </Container>
    </footer>
  );
}
