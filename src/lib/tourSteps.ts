import type { TourStep } from '../components/Tour';

export const TOUR_STEPS: TourStep[] = [
  {
    target: 'body',
    title: 'Welcome to Pulse',
    body: 'Quick 9-step tour of how this app works. You can skip any time. The tour runs once on first visit, but you can replay it from the Guide button in the header.',
    placement: 'center',
  },
  {
    target: '[data-tour="problem-banner"]',
    title: 'The problem Pulse solves',
    body: 'Your AI product is live at many clients. Adoption looks wildly different at each one. Pulse helps you spot who needs help and what to say.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="data-source"]',
    title: 'Your data',
    body: 'This shows which dataset is powering the app. Click the name to preview every row. Click "replace" to upload your own CSV.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="thresholds"]',
    title: 'Define "high enough"',
    body: 'These two sliders set the cutoffs that decide which health group each account falls into. Drag them and watch the dots regroup.',
    placement: 'right',
  },
  {
    target: '[data-tour="scatter"]',
    title: 'The health map',
    body: 'Every account sits where its usage (x) and close rate (y) put it. Red = churn risk, amber = stuck, purple = sleeping champion, green = reference. Click any dot to open it.',
    placement: 'left',
  },
  {
    target: '[data-tour="digest"]',
    title: 'This week\'s movement',
    body: 'Accounts that crossed a health-group line in the last 8 weeks. Click any group label to filter the All accounts section to just that group.',
    placement: 'top',
  },
  {
    target: '[data-tour="section-outreach"]',
    title: 'Outreach lives here',
    body: 'When you click an account, this section becomes the workspace: AI diagnosis, playbook, AI-drafted email, and the back-and-forth conversation log.',
    placement: 'top',
  },
  {
    target: '[data-tour="section-accounts"]',
    title: 'All accounts',
    body: 'The full portfolio with smart search. Try "TX", "churn", "owner:alex", or "ua<10". The Guide button has the complete list of tokens.',
    placement: 'top',
  },
  {
    target: '[data-tour="section-team"]',
    title: 'Team',
    body: 'Click "Show" to see who owns what, current workload split by health group, and recent activity. Use "Show queue" to filter All accounts.',
    placement: 'top',
  },
];
