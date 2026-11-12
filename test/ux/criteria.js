// Thresholds for the surface review (test/ux/review.js). Each number names its source; docs/ux/UX-CRITERIA.md has the full criteria, part A
// (measured here) and part B (judged on the rendered screens by the visual review and the Critic).
exports.T = {
  minText: 14,            // smallest text on any surface. WCAG sets no minimum; 14 px is this app's floor for middle-aged readers (UX-CRITERIA A4)
  minHand: 22,            // handwriting (Caveat) only for short annotations at 22 px and up (UX-CRITERIA A4)
  target: 44,             // touch targets 44 x 44 CSS px (Apple HIG; WCAG 2.5.5 AAA 44 px; 2.5.8 AA minimum is 24 px) (UX-CRITERIA A6)
  contrastText: 4.5,      // WCAG 2.2 SC 1.4.3 AA, normal text
  contrastLarge: 3,       // WCAG 2.2 SC 1.4.3 AA, large text: 24 px, or 18.66 px bold
  overlapPx: 2,           // two text boxes or controls may touch, not overlap by more than this
  bigText: 1.3,           // Android text scaling stress: fonts at 130 %, layout must hold (UX-CRITERIA A9)
  paper: [242, 236, 225], // #F2ECE1, the Raw Linen page; the app keeps it in dark mode (UX-CRITERIA A8)
};
exports.RULES = {
  'overflow-x': 'nothing scrolls sideways (A1)',
  'off-screen': 'no element outside the phone width unless inside a horizontal scroller (A1)',
  'text-clipped': 'no text cut off by its box (A2)',
  'placeholder-clipped': 'input hints fit their box (A2)',
  'overlap': 'text and controls never overlap (A3)',
  'text-too-small': 'no text under the floor size (A4)',
  'handwriting-too-small': 'handwriting face only at annotation size (A4)',
  'handwriting-figures': 'numbers are never set in the handwriting face (A4)',
  'input-zoom': 'inputs at 16 px or more so iOS does not zoom on focus (A4)',
  'contrast': 'text contrast WCAG AA (A5)',
  'target-small': 'touch targets 44 x 44 px (A6)',
  'no-name': 'every control and image has a name for screen readers (A7)',
  'palette': 'the paper palette holds in dark mode (A8)',
  'zoom-blocked': 'pinch zoom is never blocked (A7)',
  'covered-at-end': 'the last content scrolls clear of the fixed bars (A3)',
  'text-overflow': 'text never runs past its own box, where a neighbour can paint over it (A2)',
  'feedback-hidden': 'what a tap produces comes into view (A3, B6)',
  'next-step': 'after an error the next step fits the error: Try again where it can help, none where it cannot, and what was typed stays (A13, B6)',
};
exports.BIGTEXT_RULES = ['overflow-x', 'off-screen', 'text-clipped', 'overlap', 'covered-at-end', 'text-overflow', 'feedback-hidden', 'next-step'];
// Allowed exceptions, each with its reason. Keep this list short; every entry is read by the Critic.
exports.ALLOW = require('./allow.json');
