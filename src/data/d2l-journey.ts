import { d2lAssets } from './d2l-assets';

export const d2lJourney = [
  {
    id: 'requirements', number: '01', label: 'Understand requirements', title: 'Start with the requirements.', node: '554:1123', asset: d2lAssets.assignment,
    task: 'Understand what the assignment asks before choosing a file.',
    decision: 'The named assignment groups its directions, due date, points, submission type, and status beneath the course navigation.',
    context: 'This screen shows an already-open assignment, rather than the process of finding it.',
    finding: 'finding-location', findingLabel: 'Where am I in this course?',
    annotations: [
      { title: 'Keep location visible', text: 'Assignments is underlined in the navigation, with the assignment named directly below.', x: 35, y: 10 },
      { title: 'Bring requirements together', text: 'The summary and directions appear before the Add File action. Dates and coursework are illustrative.', x: 50, y: 30 },
    ],
  },
  {
    id: 'file', number: '02', label: 'Review selected file', title: 'Check the file before Submit.', node: '554:1377', asset: d2lAssets.file,
    task: 'Check which file is selected before committing to submission.',
    decision: 'The selected-file concept names the chosen PDF and provides removal, Add File, Cancel, and Submit controls.',
    context: 'Removal is shown before Submit. The post-submission replacement question is discussed in Reflection.',
    finding: 'finding-file', findingLabel: 'Which file will count?',
    annotations: [
      { title: 'Name the chosen file', text: 'The filename identifies the current selection rather than showing only a generic upload state.', x: 23, y: 40 },
      { title: 'Allow reconsideration', text: 'The X represents pre-submit removal; it is not evidence of replacing an already-submitted file.', x: 82, y: 44 },
    ],
  },
  {
    id: 'record', number: '03', label: 'Check submission record', title: 'Check the submission record.', node: '554:1169', asset: d2lAssets.history,
    task: 'Inspect the proposed record of submitted coursework.',
    decision: 'The separate history screen presents the filename, an illustrative submission date, and Submitted status.',
    context: 'History is a separate source state; the original prototype does not establish this as the destination after confirmation.',
    finding: 'reflection', findingLabel: 'Prototype connections and status consistency',
    annotations: [
      { title: 'Make the displayed status explicit', text: 'The assignment summary reads Submitted in this state. It is interface content, not a live submission result.', x: 50, y: 27 },
      { title: 'Provide a record to inspect', text: 'The history entry includes a file and submission date. Opening the pictured file is not part of this portfolio walkthrough.', x: 65, y: 38 },
    ],
  },
];
