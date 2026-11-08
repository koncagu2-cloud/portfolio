import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { projectSchema } from '../src/lib/project-schema';

const evidence = {
  id: 'source-1', sourceReference: 'public/source', context: 'Test fixture only',
  sourceDate: 'unknown', creator: 'Test author', contribution: 'Test contribution',
  representation: 'original', verification: 'unverified', permission: 'pending', limitations: 'Test fixture',
};
const project = {
  title: 'Test fixture', order: 1, category: 'Test', provisionalSummary: 'Test fixture only',
  publicationStatus: 'review', workStatus: 'unverified', evidence: [evidence], claims: [],
};

test('review candidates can explicitly record unknown evidence without asserting outcomes', () => {
  assert.equal(projectSchema.safeParse(project).success, true);
});
test('a claim cannot reference a missing source', () => {
  assert.equal(projectSchema.safeParse({ ...project, claims: [{ text: 'Test', evidenceIds: ['missing'] }] }).success, false);
});
test('publication is blocked while work status is unverified or claims are absent', () => {
  assert.equal(projectSchema.safeParse({ ...project, publicationStatus: 'published' }).success, false);
});
test('pending, restricted, and unverified sources block publication of linked claims', () => {
  for (const overrides of [
    { verification: 'source-checked', permission: 'pending' },
    { verification: 'owner-confirmed', permission: 'restricted' },
    { verification: 'unverified', permission: 'approved' },
  ]) {
    assert.equal(projectSchema.safeParse({ ...project, workStatus: 'prototype', publicationStatus: 'published',
      evidence: [{ ...evidence, ...overrides }], claims: [{ text: 'Test', evidenceIds: ['source-1'] }],
    }).success, false);
  }
});
test('supported, cleared claims pass the structural gate without certifying truth', () => {
  assert.equal(projectSchema.safeParse({ ...project, workStatus: 'prototype', publicationStatus: 'published',
    evidence: [{ ...evidence, verification: 'owner-confirmed', permission: 'approved' }],
    claims: [{ text: 'Test', evidenceIds: ['source-1'] }],
  }).success, true);
});
test('duplicate evidence IDs are rejected', () => {
  assert.equal(projectSchema.safeParse({ ...project, evidence: [evidence, evidence] }).success, false);
});

test('Community Spaces originals match provenance hashes and durable source references', () => {
  const manifest = JSON.parse(readFileSync('docs/community-spaces-assets.json', 'utf8'));
  const assets = Object.entries(manifest.assets) as [string, { sha256: string; source: object }][];
  assert.equal(assets.length, 9);
  for (const [path, entry] of assets) {
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), entry.sha256);
    assert.ok(!JSON.stringify(entry.source).includes('/api/mcp/asset/'));
  }
});

test('D2L review artifacts have stable source nodes and unchanged recorded hashes', () => {
  const manifest = JSON.parse(readFileSync('docs/d2l/assets.json', 'utf8'));
  const assets = Object.entries(manifest.assets) as [string, { sha256: string; source: { fileKey: string; nodeId: string; exportSha256: string } }][];
  assert.equal(assets.length, 11);
  assert.equal(new Set(assets.map(([, entry]) => entry.source.nodeId)).size, 11);
  for (const [path, entry] of assets) {
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), entry.sha256);
    assert.equal(entry.source.fileKey, 'piRHnDp4bwoVkKMo1mHSt7');
    assert.match(entry.source.nodeId, /^\d+:\d+$/);
    assert.match(entry.source.exportSha256, /^[a-f0-9]{64}$/);
    assert.ok(!JSON.stringify(entry).includes('/api/mcp/asset/'));
  }
});

test('Apple Ring artifacts retain provenance and its public QA summary matches the reviewed evidence', () => {
  const manifest = JSON.parse(readFileSync('docs/apple-ring/assets.json', 'utf8'));
  const assets = Object.entries(manifest.assets) as [string, { sha256: string; representation: string; limitations: string }][];
  assert.equal(assets.length, 7);
  for (const [path, entry] of assets) {
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), entry.sha256);
    assert.match(entry.representation, /AI-generated|Screenshot/);
    assert.match(entry.limitations, /not validated/);
  }
  const evidence = readFileSync('docs/apple-ring/validation-summary.json', 'utf8');
  assert.equal(readFileSync('public/evidence/apple-ring-validation.json', 'utf8'), evidence);
  const handoff = JSON.parse(evidence).reports.find((report: { name: string }) => report.name === 'handoff-checks');
  assert.equal(handoff.layoutCombinations, 40);
  assert.equal(handoff.accessibilityStates, 4);
});

test('bundled Apple Ring demo retains exported files and third-party licensing', () => {
  const manifest = JSON.parse(readFileSync('docs/apple-ring/prototype-files.json', 'utf8'));
  assert.ok(manifest.files.some((file: { file: string }) => file.file === 'vendor/three-LICENSE.txt'));
  for (const file of manifest.files as { file: string; sha256: string }[]) {
    assert.equal(createHash('sha256').update(readFileSync(`public/prototypes/apple-ring/${file.file}`)).digest('hex'), file.sha256);
  }
  const html = readFileSync('public/prototypes/apple-ring/index.html', 'utf8');
  assert.match(html, /Portfolio context/);
  assert.match(html, /\.\.\/\.\.\/work\/apple-ring\//);
});
