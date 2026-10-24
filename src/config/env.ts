import dotenv from 'dotenv';

dotenv.config({ quiet: true });

/** Runtime configuration. Everything can be overridden with environment variables or a local .env file. */
export const env = {
  baseUrl: (process.env.BASE_URL ?? 'https://demo.opencart.com').replace(/\/$/, ''),
  language: process.env.OC_LANGUAGE ?? 'en-gb',
  /** Optional pre-provisioned account for @auth scenarios; when empty the setup project registers one. */
  customerEmail: process.env.OPENCART_EMAIL ?? '',
  customerPassword: process.env.OPENCART_PASSWORD ?? '',
} as const;

/** Builds an OpenCart 4 route URL, relative to baseURL. */
export function routeUrl(route: string): string {
  return `/index.php?route=${route}&language=${env.language}`;
}

/** Where the authenticated storage state of the shared @auth customer is saved. */
export const STORAGE_STATE = '.auth/customer.json';
