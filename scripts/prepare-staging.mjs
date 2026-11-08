// Local packaging only. This script has no network or deployment calls.
import { cp, mkdir, readFile, writeFile, readdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const target = 'staging-dist';
const pages = ['index.html', 'work/d2l-redesign/index.html', 'work/community-spaces/index.html', 'work/apple-ring/index.html', 'prototypes/apple-ring/index.html', '404.html'];
for (const file of pages) {
 const html = await readFile(`dist/${file}`, 'utf8');
 if (!/<meta\s+name="robots"\s+content="noindex, nofollow"/.test(html)) throw new Error(`Refusing to package indexable output: ${file}`);
}
if (!(await readFile('dist/robots.txt', 'utf8')).includes('Disallow: /')) throw new Error('Review robots policy is missing.');
if ((await readFile('dist/sitemap.xml', 'utf8')).includes('<loc>')) throw new Error('Review sitemap should be empty.');
let exists = true;
try { await access(target); } catch { exists = false; }
if (exists) throw new Error('staging-dist already exists. Archive or remove that generated snapshot deliberately before packaging another.');
await cp('dist', target, { recursive: true, force: false, errorOnExist: true });
const policy = (await readFile('docs/deployment/headers.example', 'utf8'))
 .replace(/^#.*\n/, '# Temporary review package. Publishing requires separate owner approval.\n')
 .replace('Content-Security-Policy:', 'Content-Security-Policy-Report-Only:')
 // The experiment embeds same-origin case studies and prototypes in its reader.
 .replace("frame-ancestors 'none'", "frame-ancestors 'self'")
 .replace('X-Frame-Options: DENY', 'X-Frame-Options: SAMEORIGIN')
 .replace('/*\n', '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n');
await writeFile(`${target}/_headers`, policy);
const files = [], findings = [];
async function walk(dir, relative = '') {
 for (const item of await readdir(dir, { withFileTypes: true })) {
  const name = relative + item.name;
  if (item.isDirectory()) { await walk(`${dir}/${item.name}`, name + '/'); continue; }
  const bytes = await readFile(`${dir}/${item.name}`);
  if (/(^|\/)(\.env[^/]*|\.git|node_modules|CNAME|netlify\.toml)$|\.map$/.test(name)) findings.push({ file: name, issue: 'Unexpected source/configuration file' });
  if (/\.(js|html|css|json|txt)$/.test(name)) {
   const text = bytes.toString('utf8');
   if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:ghp_|github_pat_)[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|sk_live_[A-Za-z0-9]{20,}/.test(text)) findings.push({ file: name, issue: 'Credential pattern' });
   if (/\/Users\/|\/var\/folders\/|localhost:\d|127\.0\.0\.1:\d/.test(text)) findings.push({ file: name, issue: 'Machine-local reference' });
  }
  files.push({ file: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
 }
}
await walk(target);
await mkdir('docs/staging', { recursive: true });
await writeFile('docs/staging/package-manifest.json', JSON.stringify({ directory: target, createdUtc: new Date().toISOString(), deployed: false,
 indexing: 'Disabled by HTML meta, robots and prepared host header. No access control is provided by these.',
 dataIncluded: ['Owner-approved contact details, education and resume', 'Review case studies and original artifacts', 'Illustrative prototype data and public QA summary'],
 findings, files }, null, 2)+'\n');
if (findings.length) throw new Error('Review package scan found issues. See docs/staging/package-manifest.json; do not upload.');
console.log(`Prepared ${files.length} local files in ${target}. Nothing uploaded; authentication is still a host-side prerequisite.`);
