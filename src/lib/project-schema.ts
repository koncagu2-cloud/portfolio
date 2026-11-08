import { z } from 'astro/zod';

export const evidenceSchema = z.object({
  id: z.string().min(1),
  sourceReference: z.string().min(1),
  context: z.string().min(1),
  sourceDate: z.string().min(1),
  creator: z.string().min(1),
  contribution: z.string().min(1),
  representation: z.enum(['original', 'redacted', 'reconstructed', 'explanatory']),
  verification: z.enum(['unverified', 'source-checked', 'owner-confirmed']),
  permission: z.enum(['pending', 'approved', 'restricted']),
  limitations: z.string().min(1),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  category: z.string().min(1),
  provisionalSummary: z.string().min(1),
  publicationStatus: z.enum(['draft', 'review', 'published']),
  workStatus: z.enum(['unverified', 'concept', 'prototype', 'launched']),
  caseStudy: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    headline: z.string().min(1),
    introduction: z.string().min(1),
    context: z.string().min(1),
    role: z.string().min(1),
    team: z.array(z.string().min(1)).min(1),
    sections: z.array(z.object({
      id: z.string().regex(/^[a-z][a-z0-9-]*$/),
      title: z.string().min(1),
      kicker: z.string().min(1),
      paragraphs: z.array(z.string().min(1)).min(1),
      points: z.array(z.string().min(1)).default([]),
      sourceNote: z.string().min(1),
      media: z.array(z.enum(['flow', 'sketch', 'space', 'comparison', 'screens'])).default([]),
    })).min(1),
  }).optional(),
  evidence: z.array(evidenceSchema),
  claims: z.array(z.object({
    text: z.string().min(1),
    evidenceIds: z.array(z.string()).min(1),
  })).default([]),
}).superRefine((project, ctx) => {
  const ids = project.evidence.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: 'custom', message: 'Evidence IDs must be unique.' });
  }
  for (const claim of project.claims) {
    for (const id of claim.evidenceIds) {
      const evidence = project.evidence.find((item) => item.id === id);
      if (!evidence) ctx.addIssue({ code: 'custom', message: `Missing evidence: ${id}` });
      if (project.publicationStatus === 'published' && evidence &&
          (evidence.verification === 'unverified' || evidence.permission !== 'approved')) {
        ctx.addIssue({ code: 'custom', message: `Uncleared evidence: ${id}` });
      }
    }
  }
  if (project.publicationStatus === 'published' &&
      (project.workStatus === 'unverified' || project.claims.length === 0)) {
    ctx.addIssue({ code: 'custom', message: 'Published projects require verified work status and supported claims.' });
  }
});
