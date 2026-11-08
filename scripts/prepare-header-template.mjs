// Generate an inert host configuration example. It is NOT copied to dist or deployed.
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const hashes = new Set();
async function scan(dir) {
 for (const item of await readdir(dir, { withFileTypes: true })) {
  const file = `${dir}/${item.name}`;
  if (item.isDirectory()) await scan(file);
  else if (item.name.endsWith('.html')) {
   const html = await readFile(file, 'utf8');
   for (const [, attrs, script] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc\s*=/i.test(attrs) && script.trim()) hashes.add(`'sha256-${createHash('sha256').update(script).digest('base64')}'`);
   }
  }
 }
}
await scan('dist');
const csp = `default-src 'self'; script-src 'self' ${[...hashes].sort().join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'`;
const headers = { 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()', 'X-Frame-Options': 'DENY' };
await mkdir('docs/deployment', { recursive: true });
await writeFile('docs/deployment/security-headers.json', JSON.stringify(headers, null, 2)+'\n');
await writeFile('docs/deployment/headers.example', '# INERT EXAMPLE — regenerate after the final build and adapt to the chosen host.\n/*\n'+Object.entries(headers).map(([k,v])=>`  ${k}: ${v}`).join('\n')+'\n\n/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/\n  Cache-Control: no-cache\n\n/work/*\n  Cache-Control: no-cache\n\n/prototypes/*\n  Cache-Control: no-cache\n\n/*.html\n  Cache-Control: no-cache\n\n/robots.txt\n  Cache-Control: no-cache\n\n/sitemap.xml\n  Cache-Control: no-cache\n');
console.log(`Prepared an inert header template with ${hashes.size} inline script hashes. Nothing was installed on a server.`);
