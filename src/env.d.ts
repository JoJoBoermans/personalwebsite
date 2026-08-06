/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_OPERATOR_NAME?: string;
  readonly PUBLIC_OPERATOR_ADDRESS?: string;
  readonly PUBLIC_REGISTRATION_NUMBER?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_PRIVACY_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}
