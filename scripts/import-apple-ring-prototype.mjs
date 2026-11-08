// Import the owner's buildless presentation for a self-contained portfolio demo.
// Usage: node scripts/import-apple-ring-prototype.mjs /absolute/path/to/apple-ring-site/dist
import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Provide the original prototype dist directory.');
const source = path.resolve(process.argv[2]);
const original = await readFile(path.join(source, 'index.html'), 'utf8');
if (!original.includes('Apple Ring') || !original.includes('id="try-ring"')) throw new Error('Expected the existing Apple Ring prototype.');
const target = path.join(repo, 'public/prototypes/apple-ring');
if (source === target) throw new Error('Source must be separate from the exported demo.');
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
const files = [];
async function copyTree(dir, relative = '') {
 for (const entry of await readdir(dir, { withFileTypes: true })) {
  const name = path.join(relative, entry.name);
  if (entry.isDirectory() && ['assets', 'vendor'].includes(name)) await copyTree(path.join(dir, entry.name), name);
  else if (entry.isFile() && /\.(?:css|js|svg|webp|txt)$/.test(entry.name)) {
   await mkdir(path.dirname(path.join(target, name)), { recursive: true });
   await copyFile(path.join(dir, entry.name), path.join(target, name));
   files.push(name);
  }
 }
}
await copyTree(source);
const context = '<nav class="portfolio-context" aria-label="Portfolio context"><a href="../../work/apple-ring/">← Back to case study</a><span>Interactive concept</span></nav>';
const style = '<style>.portfolio-context{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px max(20px,calc((100% - 1120px)/2));background:#161618;color:#f5f5f7;border-bottom:1px solid #424248;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.portfolio-context a{display:inline-flex;align-items:center;min-height:44px;color:inherit;text-decoration:underline;text-underline-offset:4px}.portfolio-context a:focus-visible{outline:3px solid #8ac5ff;outline-offset:4px}.portfolio-context span{color:#adadb5;font-size:12px}@media(max-width:360px){.portfolio-context span{max-width:90px;text-align:right}}</style>';
const metadata = "<link rel=\"canonical\" href=\"https://suleymankoncagul.com/prototypes/apple-ring/\"><meta property=\"og:type\" content=\"website\"><meta property=\"og:title\" content=\"Apple Ring \u2014 Independent Concept\"><meta property=\"og:description\" content=\"An independent, AI-assisted interactive portfolio concept. Hardware and Apple integrations are speculative.\"><meta property=\"og:url\" content=\"https://suleymankoncagul.com/prototypes/apple-ring/\"><meta property=\"og:image\" content=\"https://suleymankoncagul.com/social/apple-ring.png\"><meta property=\"og:image:alt\" content=\"Apple Ring \u2014 an independent, AI-assisted concept, not affiliated with Apple.\"><meta name=\"twitter:card\" content=\"summary_large_image\">";
const html = original.replace('</head>', '<meta name="robots" content="noindex, nofollow"><link rel="icon" href="../../favicon.svg" type="image/svg+xml">'+metadata+style+'</head>')
 .replace('<header class="global">', context+'<header class="global">')
 .replace('</body>', '<script type="module" src="../../prototype-support/apple-ring.js"></script></body>');
await writeFile(path.join(target, 'index.html'), html);
files.push('index.html');
const manifest = [];
for (const file of files.sort()) {
 const bytes = await readFile(path.join(target, file));
 manifest.push({ file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await mkdir(path.join(repo, 'docs/apple-ring'), { recursive: true });
await writeFile(path.join(repo, 'docs/apple-ring/prototype-files.json'), JSON.stringify({
 source: 'Owner-retained buildless Apple Ring concept',
 route: '/prototypes/apple-ring/',
 changes: ['Portfolio return navigation', 'Review-only noindex metadata', 'Portfolio result-visibility support module (public/prototype-support/apple-ring.js)'],
 files: manifest,
}, null, 2)+'\n');
console.log(`Imported ${files.length} files (${manifest.reduce((total, file) => total + file.bytes, 0)} bytes).`);
