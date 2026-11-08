import type { Artifact } from './artifact';

export interface JourneyStep {
  id: string;
  number: string;
  label: string;
  title: string;
  node: string;
  asset: Artifact;
  task: string;
  decision: string;
  context: string;
  finding: string;
  findingLabel: string;
  annotations: { title: string; text: string; x: number; y: number }[];
}
