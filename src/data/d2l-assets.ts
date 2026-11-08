import type { Artifact } from '../components/case-study/artifact';
import home from '../assets/d2l/student-home.webp';
import overview from '../assets/d2l/instructor-overview.webp';
import studentFlow from '../assets/d2l/student-flow.webp';
import instructorFlow from '../assets/d2l/instructor-flow.webp';
import studentSketch from '../assets/d2l/student-sketch.webp';
import instructorSketch from '../assets/d2l/instructor-sketch.webp';
import earlier from '../assets/d2l/assignment-earlier.webp';
import assignment from '../assets/d2l/assignment-final.webp';
import file from '../assets/d2l/file-review.webp';
import history from '../assets/d2l/submission-history.webp';
import rubric from '../assets/d2l/rubric-maker.webp';

export const d2lAssets = {
  home: { name: 'student home concept', image: home, alt: "Student home concept showing four course cards and a New Content panel beneath labeled D2L navigation.", caption: "Student / Find coursework. Course cards and recent activity share one view.", source: 'Original Figma · 554:1219' },
  overview: { name: 'instructor assignment setup', image: overview, alt: "Instructor New Assignment step one with title, assignment type, availability dates, due date, directions, file upload and Continue.", caption: "Instructor / Create coursework. Overview and dates are grouped before grading settings.", source: 'Original Figma · 274:414' },
  studentFlow: { name: 'student task flow', image: studentFlow, alt: "Original student task flow: select a course, open Assignments and an assignment, add or drag a file, review chosen files, confirm or go back, submit, and receive confirmation. A separate branch covers taking a quiz.", caption: "The original student task map. This case study follows its submission branch.", source: 'Original Figma · 123:4' },
  instructorFlow: { name: 'instructor task flow', image: instructorFlow, alt: "Original instructor task flow from opening a course through assignment details, rubric criteria, supporting files, publishing, grading and feedback.", caption: "The original instructor task map connects setup, publication, grading and feedback.", source: 'Original Figma · 123:3' },
  studentSketch: { name: 'student sketches', image: studentSketch, alt: "Original student sketch sheet with course cards, course content, assignment, upload, file selection, selected-file review and confirmation layouts.", caption: "Student exploration / establish the sequence before the visual detail.", source: 'Original Figma · 160:4' },
  instructorSketch: { name: 'instructor sketches', image: instructorSketch, alt: "Original hand-drawn instructor sketch linking course home, assignment and rubric creation, and a submission review area.", caption: "Instructor exploration / connect requirements, criteria and submission review.", source: 'Original Figma · 161:2' },
  earlier: { name: 'earlier assignment concept', image: earlier, alt: "Earlier D2L assignment concept with active Assignments navigation, due date and status summary, empty directions and comments areas, and Add File.", caption: "Earlier prototype / navigation, assignment summary, directions, and comments establish the layout before content is populated.", source: 'Original Figma · 481:1306' },
  assignment: { name: 'final assignment concept', image: assignment, alt: "Final D2L assignment concept retaining the same layout while adding an Overview description and formatting controls to the comment editor.", caption: "Final prototype / populated directions and editor controls within the retained layout.", decision: 'The Overview gains content and the comment editor gains formatting controls; the underlying layout remains the same.', source: 'Original Figma · 554:1123' },
  file: { name: 'selected-file review', image: file, alt: "D2L selected-file review concept showing a named PDF, remove-file X, Add File, Cancel and Submit over the assignment page.", caption: "Review before Submit / the chosen filename remains visible with a removal control.", source: 'Original Figma · 554:1377' },
  history: { name: 'submission record', image: history, alt: "D2L submission-history concept with Submitted status, a named file, an illustrative submission date, directions and comments.", caption: "A separate history state / the proposed record of a submitted file.", source: 'Original Figma · 554:1169' },
  rubric: { name: 'rubric maker', image: rubric, alt: "Instructor Rubric Maker concept with labeled criteria, criteria headers and score columns, template selection and save or draft controls.", caption: "Instructor / Define the criteria. Explicit headers separate criteria and score.", decision: "Criteria, headers, and scores have separate labels—a visible response to the rubric-cell observation. Easier authoring has not been demonstrated.", source: 'Original Figma · 286:415' },
} satisfies Record<string, Artifact>;
