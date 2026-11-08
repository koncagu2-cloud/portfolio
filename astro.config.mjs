import { defineConfig } from 'astro/config';

// Intended canonical origin only; this configuration does not deploy or change DNS.
export default defineConfig({ site: 'https://suleymankoncagul.com', output: 'static', devToolbar: { enabled: false } });
