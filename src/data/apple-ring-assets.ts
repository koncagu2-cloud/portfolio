import product from '../assets/apple-ring/product.webp';
import handoff from '../assets/apple-ring/handoff.webp';
import missing from '../assets/apple-ring/missing.webp';
import disconnected from '../assets/apple-ring/disconnected.webp';
import before from '../assets/apple-ring/charging-before.webp';
import after from '../assets/apple-ring/charging-after.webp';
import viewer from '../assets/apple-ring/viewer.webp';
import type { Artifact } from '../components/case-study/artifact';
const stillSource = 'AI-generated product visualization · Independent concept · Unvalidated hardware';
const screenSource = 'Capture of the coded, AI-assisted prototype · Illustrative readings and device states';
export const appleRingAssets = {
  product: { name: 'ring concept', image: product, alt: 'Speculative satin titanium ring with polished edges and a dark inner sensing surface', caption: 'A proposed physical form, not a manufactured Apple product.', source: stillSource },
  handoff: { name: 'overnight handoff', image: handoff, alt: 'Overnight and morning controls alongside a Watch companion showing a Ring sleep estimate, source, battery status and last-sync time', caption: 'The revised handoff makes the proposed relationship between Ring and Watch explicit. All values are samples.', decision: 'Source and last-sync labels distinguish a Ring estimate from live Watch information. Missing and disconnected states withhold unavailable readings.', source: screenSource },
  missing: { name: 'missing-reading state', image: missing, alt: 'Watch companion displaying Not enough readings and explaining a gap in the sample night', caption: 'An incomplete night produces no complete sleep estimate.', source: screenSource },
  disconnected: { name: 'disconnected state', image: disconnected, alt: 'Watch companion displaying No new sync, unavailable Ring battery and unknown last sync', caption: 'A disconnected Ring does not present new readings or a current battery percentage.', source: screenSource },
  before: { name: 'earlier charging proposal', image: before, alt: 'Earlier illustration of a ring standing upright beside a vertical charging post with mismatched axes', caption: 'The earlier render did not explain credible support or charging alignment.', source: stillSource },
  after: { name: 'revised charging proposal', image: after, alt: 'Ring resting horizontally on a circular dock around a centered insert', caption: 'The revised pose shows supported placement; it does not prove inductive charging or thermal performance.', source: stillSource },
  viewer: { name: 'interactive design viewer', image: viewer, alt: 'Try Ring interface with a procedural ring model, four finishes, product angles, rotation and zoom controls', caption: 'Finish choices are shared with the main page. Explicit controls accompany the drag interaction.', source: screenSource },
} satisfies Record<string, Artifact>;
