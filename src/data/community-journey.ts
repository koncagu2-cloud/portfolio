import { communityAssets } from './community-spaces-assets';
import type { JourneyStep } from '../components/case-study/journey';

export const communityJourney: JourneyStep[] = [
  {
    id: 'discover', number: '01', label: 'Discover an event', title: 'Find an activity to consider.', node: '214:237', asset: communityAssets.events,
    task: 'Find an activity to consider.',
    decision: 'Event entries combine titles, images, dates, and short descriptions.',
    context: 'Can people distinguish the options and find a suitable date? That remains a question for evaluation.',
    finding: 'need-dates', findingLabel: 'The need for date-specific event information',
    annotations: [
      { title: 'Introduce the activity', text: 'Titles and descriptions distinguish the proposed events; the examples are illustrative.', x: 94, y: 26 },
      { title: 'Include the date', text: 'Each entry provides a date and time alongside the event information.', x: 94, y: 30 },
    ],
  },
  {
    id: 'details', number: '02', label: 'Review the details', title: 'Decide whether it fits your plans.', node: '214:167', asset: communityAssets.details,
    task: 'Decide whether the event fits their plans.',
    decision: 'The concept brings description, location, and time together before Sign Up.',
    context: 'What additional information would someone need before committing? The concept has not been usability-validated.',
    finding: 'need-participation', findingLabel: 'The path from information to participation',
    annotations: [
      { title: 'Describe the experience', text: 'The event detail explains the proposed activity before the registration action.', x: 87, y: 48 },
      { title: 'Support planning', text: 'Location and time appear together so a person can consider a visit.', x: 87, y: 64 },
    ],
  },
  {
    id: 'reserve', number: '03', label: 'Reserve a place', title: 'Review what registration requires.', node: '214:89', asset: communityAssets.reservation,
    task: 'Review registration requirements.',
    decision: 'Member type, requirements, and illustrative availability appear before Book.',
    context: 'Are eligibility, capacity, and the booking action understandable? Availability is sample interface content, not live inventory.',
    finding: 'need-participation', findingLabel: 'Finding an event and signing up',
    annotations: [
      { title: 'Identify the member type', text: 'The displayed student selection appears before the requirements.', x: 87, y: 48 },
      { title: 'Review before booking', text: 'Requirements and sample capacity are visible above Book. No reservation is made here.', x: 87, y: 67 },
    ],
  },
  {
    id: 'confirmation', number: '04', label: 'See confirmation', title: 'Understand the acknowledgment.', node: '214:4', asset: communityAssets.confirmation,
    task: 'Understand the acknowledgment and available next actions.',
    decision: 'The concept presents registration confirmation and calendar/home actions.',
    context: 'Does the wording communicate what happened and what to do next? This is an original screen, not an operating registration result.',
    finding: 'reflection', findingLabel: 'Wording and scenarios to evaluate next',
    annotations: [
      { title: 'Acknowledge registration', text: 'The heading and checkmark represent a confirmation state in the concept.', x: 88, y: 15 },
      { title: 'Consider the next action', text: 'The original Continue Shopping label remains unchanged; its fit with event registration needs evaluation.', x: 88, y: 61 },
    ],
  },
];
