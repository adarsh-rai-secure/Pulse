# Pulse: Project Description

This document describes the Pulse project in enough detail that a portfolio page, README, or demo script can be written from this file alone.

---

## 1. One-paragraph summary

Pulse is a portfolio-health tool for B2B SaaS companies that sell AI products to many client accounts at once. It takes a customer success manager's portfolio (a CSV of clients with two key metrics: how often the client's team uses the product, and how often AI-handled work converts to a real outcome), classifies every account into one of four health groups, and uses a language model to draft outreach emails grounded in each account's real numbers and the customer success team's internal notes. It was built to replace the morning spreadsheet ritual at companies whose AI tool is live across 50+ clients, where a single account manager has to figure out who needs a call, who needs an engineer, and who is ready for a referral. The original prototype was built during a practical assessment for a multifamily PropTech vendor and is preserved in `archive/property-oracle.html`. Pulse is the generalized rebuild.

---

## 2. Feature inventory

This is everything a user can do in the app, grouped by where it lives.

### Header (top bar, persistent)
- **Pulse logo and subtitle**. Identity marker. Subtitle reads "AI deployment health scoring."
- **"Why this exists" button**. Opens a small modal explaining the problem in three short paragraphs.
- **"Upload CSV" button**. Opens the Upload modal.
- **"Guide" button**. Opens the Reference Guide modal with category definitions, search syntax, team roles, and a "Start tour" button.
- **"Dev" button**. Opens the Developer / Observability panel.
- **User chip** ("AR / Adarsh"). Visual only.

### Problem banner (purple strip under the header)
- One-sentence framing of the problem.
- "Read the full setup" toggle reveals a three-paragraph expanded explanation.

### Data source row
- Shows the current data source label and account count.
- "view" link opens the Data Preview modal showing every row currently loaded.
- "replace" link opens the Upload modal.
- "Export filtered CSV" button (right side) downloads the current filtered view as a CSV.

### Splash modal (first visit only)
- Three-panel onboarding: "The problem", "How Pulse helps", "Try it now".
- Last panel has three buttons: "Use sample data", "Preview sample", "Upload my CSV".
- Dot indicator shows current panel.
- After the splash closes, the interactive tour kicks off automatically on first visit.

### Section navigation (sticky left rail)
- Four jump links: Dashboard, Outreach, All accounts, Team.
- Each link shows a live count (churn-risk count on Dashboard in red, draft-event count on Outreach, filtered row count on All accounts, team size on Team).
- Active section highlights based on scroll position using IntersectionObserver.
- Clicking a link smooth-scrolls the page to that section.

### Dashboard section
- **Portfolio summary cards (4-column grid)**. Total accounts, churn risk count (red), average usage, average close rate. Each card has an info-tip icon explaining what the metric means.
- **Threshold sliders (left panel)**. Two sliders: "High usage starts at" (0 to 100%) and "Strong close rate starts at" (0 to 50%). Sliding either re-classifies every account in real time and redraws the scatter plot, weekly digest, and all dependent UI. Default values are 30 and 20. Values persist to localStorage as `pulse.thresholds`.
- **Scatter plot (right panel)**. SVG-based, 720 by 360 viewBox. Every account is a dot positioned by user adoption (x) and conversion rate (y). Four quadrant backgrounds shade lightly by category color. Dashed purple threshold lines move with the sliders. Dots are color-coded by category. Hovering a dot shows a small dark tooltip with the property name and metrics. Clicking a dot selects that account and scrolls the Outreach section into view.
- **Weekly digest card**. Two columns: "Trending down" (accounts that moved into a worse category over the last 8 weeks based on the synthetic trend) and "Trending up" (accounts that moved into a better category). Each row shows the property name and the from-category-to-category jump as colored chips. Clicking a chip filters the All accounts section to that category and scrolls to it.

### Outreach section
- **Empty state** when no account is selected: prompt to click a dot or row.
- **Action panel** (two-column layout when an account is selected):
  - **Left column**:
    - Property name, category badge, city, unit count.
    - Two metric cards (User adoption and Conversion rate), each with the headline number and an inline sparkline showing the synthetic 8-week trend plus delta vs 8 weeks ago.
    - AI Diagnosis chip: 2-3 sentence root-cause hypothesis auto-generated on selection, cached in localStorage, with a "regenerate" link.
    - Handoff strip: avatar + name of current owner, time-stamped reference to the previous owner if a handoff has happened, "Hand off…" button that opens a two-step picker (reason then owner) with recommended-owner highlight, and an expandable "Handoff history" list.
    - Case status dropdown (New, In progress, Waiting, Completed).
    - Internal notes textarea.
  - **Right column**:
    - "Account memory" panel showing the RAG chunks injected into the prompt (account profile and account notes), plus the top 3 similar accounts ranked by TF-IDF cosine similarity with their numeric score.
    - "AI-drafted outreach" panel showing the streaming draft with subject line in a bordered header, body in a pre-formatted area, a blinking caret while streaming, model and latency telemetry below, plus four buttons: Send (simulated), Copy, Regenerate, Pin as golden.
    - Conversation view: shows the most recent draft as "You (AI-drafted) → client", the streaming reply as a pulsing placeholder when in-flight, and the final reply with a colored tone chip (Positive / Neutral / Negative).
- **Activity log** (below the action panel): collapsible per-account history of every event (draft generated, owner changed, status changed, notes edited, mailto opened, draft pinned, reply received). Sorted by most-recent event. Expanding a row shows the latest draft, the reply if one exists, and the full timeline with relative timestamps.

### All accounts section
- **Filter bar**: search input with placeholder hints, owner dropdown, health-group dropdown, hide-completed checkbox. When the search box is empty, six hint chips show search shortcuts ("TX", "churn", "stuck", "sleeping", "reference", "owner:alex"). Clicking a chip fills the box.
- **Case table**: 7-column table (Account, Use, Close, Health, What to do, Owner, Status). Each column header has an info-tip. Rows are clickable; clicking opens the account in the Outreach section. Status is editable via inline dropdown. Owner shows the assigned teammate name; reassignment happens in the Action panel's Handoff strip.
- **Pagination**: 10 rows per page with "Prev / Next" and "Showing N to M of X" status.
- **Empty state**: "No accounts match the current filters."

### Team section (collapsed by default)
- "Show" button expands the section.
- 2-column grid of team-member cards. Each card has:
  - Avatar (initials), name, role.
  - "Owns [category]" chip showing which health group this teammate is the default owner for.
  - Workload bar: stacked colored bar showing the proportional split of accounts currently assigned to this person across the four categories, with category chips beneath showing exact counts.
  - "Recent activity" mini-feed: up to three most-recent events affecting accounts assigned to this person, with relative timestamps.
  - "Show [first-name]'s queue" button that filters the All accounts section to this owner and scrolls there.

### Modals

- **Splash modal**: described above.
- **Upload modal**: three states.
  - Pick state: drag-drop zone, "Browse for a file" button, two tile-cards ("Preview the bundled sample" and "Download the sample as a CSV").
  - Map state: when headers don't auto-detect, a column-mapping wizard appears with one dropdown per Pulse field, required fields starred, and a collapsible "Show first 5 rows of raw data" panel.
  - Preview state: shows the parsed table (first 80 rows) with row count, plus "Cancel" and "Load this data" buttons.
- **Data Preview modal**: full table of the currently-loaded dataset, with "Copy as CSV" and "Download CSV" buttons.
- **Guide modal**: contains a "Replay the walkthrough" banner with a "Start tour" button (when the parent passes an `onReplayTour` callback), plus four sections: In plain English, The four health groups (with playbooks), How search works (with all search tokens), Team roles, Under the hood (technical explainer).
- **Dev / Observability panel**: model picker with 5 model options (radio cards showing per-prompt and per-completion cost per million tokens, plus a computed $ / 100 drafts derived from a 400/250 token assumption), telemetry for the latest draft (model, latency, prompt tokens, completion tokens), the exact system prompt, the exact user prompt, the full draft text, a pinned-drafts count, and a "Clear browser-side cases & drafts" button.
- **"Why Pulse exists" modal**: three-paragraph problem statement.

### Interactive walkthrough (tour)
- 10 steps, automatic on first visit, replayable from Guide.
- SVG-masked spotlight cutout highlights the target element with a purple ring (green ring when the step is complete).
- Each interactive step has a green task strip ("Try it: drag the slider to roughly 20%") that flips to "Done!" when the predicate evaluates true.
- Auto-advances 700ms after completion.
- "Skip step" advances without doing the task; "Skip tour" closes the whole thing.
- Arrow keys navigate, Esc closes.
- Persisted via `pulse.tour.seen` localStorage flag.

### Toast notifications
- Bottom-right transient messages for "Loaded N accounts from filename", "Handed off X to Y", "Sent via webhook (simulated). Tracking reply…".

### Session cap
- The app enforces a 50-call-per-browser-per-24h cap on OpenRouter requests via `pulse.session.calls` and `pulse.session.resetAt`. The remaining quota shows next to the draft panel.

### Persistence
- Every case (owner, status, notes, last handoff reason), every draft, every pinned "golden" draft, every reply, every activity event, the current thresholds, the selected model, splash-seen, and tour-seen flags persist to localStorage. Data survives full page refresh.

---

## 3. Technical architecture

### Stack with versions
- **React** 18.3.1
- **React DOM** 18.3.1
- **TypeScript** 5.6.3
- **Vite** 5.4.11 with `@vitejs/plugin-react` 4.3.3
- **Tailwind CSS** 3.4.15 with `autoprefixer` 10.4.20 and `postcss` 8.4.49
- **SheetJS (xlsx)** 0.18.5 for Excel file parsing
- **@types/react** 18.3.12, **@types/react-dom** 18.3.1
- **OpenRouter** for LLM access (no SDK; native `fetch` against the chat completions endpoint)
- No charting library, no animation library, no UI component library, no routing library. SVG, CSS, and React state only.

### Folder structure

```
pulse/
├── archive/
│   └── property-oracle.html        # Original vanilla-JS prototype, neutralized of vendor branding
├── docs/
│   ├── Claude_Code_Pulse.md        # Original build prompt
│   └── Pulse_Scope.md              # Original scope document
├── public/
│   ├── favicon.svg
│   └── sample-portfolio.csv        # Public copy of the sample dataset for download
├── src/
│   ├── components/                 # 22 React components
│   │   ├── ActionPanel.tsx         # Top-level workspace for the selected account
│   │   ├── AIDraftPanel.tsx        # Streaming draft display + Send/Copy/Regenerate/Pin
│   │   ├── CaseTable.tsx           # Paginated table of accounts
│   │   ├── ConversationView.tsx    # Draft + reply threaded view inside ActionPanel
│   │   ├── DataPreviewModal.tsx    # "View current data source" modal
│   │   ├── DevPanel.tsx            # Model picker + system/user prompt + telemetry
│   │   ├── DiagnosisChip.tsx       # Auto-generated 2-3 sentence root cause panel
│   │   ├── FilterBar.tsx           # Search + owner + category + hide-completed
│   │   ├── GuideModal.tsx          # Reference guide + tour replay button
│   │   ├── HandoffStrip.tsx        # Current owner + 2-step reassignment flow
│   │   ├── Header.tsx              # Top bar
│   │   ├── InfoTip.tsx             # Hover/click info icon
│   │   ├── Modal.tsx               # Reusable modal shell
│   │   ├── OutreachSection.tsx     # Per-account activity log
│   │   ├── PortfolioSummary.tsx    # 4 stat cards
│   │   ├── ProblemBanner.tsx       # Sticky purple banner
│   │   ├── RetrievedChunks.tsx     # RAG chunks + similar accounts display
│   │   ├── ScatterPlot.tsx         # SVG chart with quadrant backgrounds
│   │   ├── Section.tsx             # Section header + optional collapsible body
│   │   ├── SectionNav.tsx          # Sticky left rail with scroll-spy
│   │   ├── Sparkline.tsx           # Inline SVG mini chart for trends
│   │   ├── SplashModal.tsx         # First-visit 3-panel onboarding
│   │   ├── TeamSection.tsx         # Team cards with workload + activity
│   │   ├── ThresholdControls.tsx   # The two slider panel
│   │   ├── Tour.tsx                # Interactive coachmark engine
│   │   ├── UploadModal.tsx         # Drag-drop, mapping wizard, preview, confirm
│   │   └── WeeklyDigest.tsx        # Trending-up / trending-down card
│   ├── data/
│   │   ├── categories.ts           # CATEGORIES record and CATEGORY_ORDER
│   │   ├── sample-portfolio.csv    # Bundled 52-account demo dataset
│   │   ├── sampleData.ts           # Imports the CSV with ?raw and parses
│   │   └── team.ts                 # TEAM array, getMember()
│   ├── hooks/
│   │   ├── useLocalStorage.ts      # Generic typed localStorage hook
│   │   └── useScrollSpy.ts         # IntersectionObserver-backed active-section hook
│   ├── lib/
│   │   ├── activity.ts             # Activity event log (localStorage-backed)
│   │   ├── classify.ts             # Quadrant classification + summarize + sort
│   │   ├── fallback.ts             # Deterministic template drafts per category
│   │   ├── generateDiagnosis.ts    # Separate model call for the AI diagnosis chip
│   │   ├── generateReply.ts        # Client-reply generation with tone weighting
│   │   ├── handoffReasons.ts       # HANDOFF_REASONS array + suggesters
│   │   ├── models.ts               # Model registry with cost math
│   │   ├── openrouter.ts           # Streaming OpenRouter chat completions client
│   │   ├── parseCsv.ts             # CSV/Excel parsing + mapping logic
│   │   ├── promptBuilder.ts        # SYSTEM_PROMPT + buildUserPrompt + splitSubjectAndBody
│   │   ├── ragStore.ts             # Cases + drafts + golden drafts persistence
│   │   ├── replyStore.ts           # Replies persistence
│   │   ├── search.ts               # Token parsing + filtering for the search bar
│   │   ├── sessionCap.ts           # 50-call-per-24h browser quota
│   │   ├── states.ts               # US state code <-> name mapping
│   │   ├── tfidf.ts                # TF-IDF + cosine similarity + chunkContext
│   │   ├── tourSteps.ts            # Tour step definitions
│   │   └── trends.ts               # Deterministic synthetic 8-week per-property trend
│   ├── App.tsx                     # Top-level state container, composition, side effects
│   ├── index.css                   # Tailwind directives + design tokens
│   ├── main.tsx                    # React DOM bootstrap
│   ├── types.ts                    # All shared TypeScript types
│   └── vite-env.d.ts               # Vite env type augmentation + CSV ?raw module
├── .env                            # VITE_OPENROUTER_API_KEY (gitignored)
├── .env.example                    # Placeholder
├── .gitignore
├── README.md
├── index.html                      # Vite entry, page title, meta description
├── package.json
├── postcss.config.js
├── tailwind.config.ts              # Design tokens
├── tsconfig.json                   # Project references
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json                     # SPA rewrites, build command, output dir
└── vite.config.ts
```

### Component hierarchy

`main.tsx` mounts `<App />`. App renders, top to bottom:

```
App
├── Header
├── ProblemBanner
├── main
│   ├── data-source row (data preview link, replace link, export filtered CSV)
│   └── 2-column grid
│       ├── SectionNav (sticky left rail)
│       └── content column
│           ├── Section "Dashboard"
│           │   ├── PortfolioSummary (4 cards with InfoTip)
│           │   ├── ThresholdControls (2 sliders with InfoTip)
│           │   ├── ScatterPlot (SVG, 4 quadrants, dots, threshold lines, tooltip)
│           │   └── WeeklyDigest (trending up/down columns)
│           ├── Section "Outreach"
│           │   ├── ActionPanel
│           │   │   ├── DiagnosisChip
│           │   │   ├── Sparkline (x2, inside metric cards)
│           │   │   ├── HandoffStrip
│           │   │   ├── status select + notes textarea
│           │   │   ├── RetrievedChunks (RAG chunks + similar accounts)
│           │   │   ├── AIDraftPanel (subject, body, action buttons)
│           │   │   └── ConversationView (draft + reply thread)
│           │   └── OutreachSection (per-account activity log)
│           ├── Section "All accounts"
│           │   ├── FilterBar (search + dropdowns + hint chips)
│           │   └── CaseTable (paginated)
│           └── Section "Team" (collapsible)
│               └── TeamSection (member cards with workload + activity)
├── footer
├── SplashModal (first visit)
├── UploadModal
├── DataPreviewModal
├── GuideModal
├── DevPanel
├── Tour (coachmark overlay)
└── Modal ("Why Pulse exists")
```

### State management approach

All state is managed with `useState` and `useMemo` in `App.tsx`. No Redux, no Zustand, no context API. The component tree is shallow enough and the data dependencies are clear enough that prop drilling stays manageable.

Persistent state uses a typed `useLocalStorage<T>(key, initial)` hook for thresholds, model id, splash-seen, and tour-seen. Domain stores (`ragStore`, `replyStore`, `activity`) wrap `localStorage.getItem/setItem` with try/catch and JSON serialization behind a small object API.

A `bumpActivity()` function increments an `activityNonce` integer in state whenever any localStorage-backed activity record changes. Components that read from those stores (OutreachSection, TeamSection, HandoffStrip, the Tour completion predicates) take `nonce` as a prop and use it as a `useMemo` dependency to re-pull from storage on changes.

Side effects (writing to localStorage, calling OpenRouter, logging activity events) happen outside React state updaters to avoid double-invocation under StrictMode.

### Data flow

1. **Initial load**. `loadSampleProperties()` imports `src/data/sample-portfolio.csv` via Vite's `?raw` query param and parses it through `parseCsvToProperties`. The result populates the `properties` state. Cases, drafts, and replies are pulled from localStorage on mount.
2. **Classification**. Anywhere we need a category, we call `classify(ua, cr, thresholds)`. The result is a `CategoryKey`. `summarize(properties, thresholds)` returns the four counts plus averages for the summary cards.
3. **Search and filter**. `buildIndex(properties, thresholds, cases)` produces a flat array of `SearchableAccount` rows containing the property, its category, a precomputed lowercase haystack of (name + city-with-state-expansion + notes + case-notes + category-label + owner-name), the state code, and the owner id. `searchAccounts(index, query, filters)` parses the query into typed tokens and filters the index.
4. **Selection**. Clicking a scatter dot or a table row calls `handleSelect(id)`, which sets `selectedId` and smooth-scrolls the Outreach section into view.
5. **AI draft pipeline**. The Action panel computes `chunks = chunkContext(enrichedProperty)` and `similar = findSimilar(enrichedProperty, allProperties, thresholds, 3)`. When the user clicks Generate / Regenerate, `generateDraft({ property, category, ownerName, ownerRole, chunks, similar, thresholds, handoffReasonLabel, handoffReasonHint, handoffNote }, { modelId, onToken })` is called. It builds the user prompt, POSTs to OpenRouter with `stream: true`, consumes the SSE stream token-by-token (calling `onToken` for each accumulated chunk), and returns a `DraftRecord` containing the full text, parsed subject and body, model, latency, token counts, the system and user prompts, and the retrieved chunks. The record persists via `ragStore.saveDraft`.
6. **Diagnosis chip**. On selection, `DiagnosisChip` computes a cache key from `(propertyId, ua, cr, notes-length)`. If a cached entry exists in `pulse.diagnoses.v1`, it shows immediately. Otherwise it calls `generateDiagnosis` against OpenRouter (non-streaming, lower max_tokens, lower temperature). The result is cached.
7. **Send (simulated)**. Clicking the Send button calls `onMailtoOpened`, which logs a `mailto_opened` activity event, sets the property as sent, shows a toast, and schedules a reply via `scheduleReply(propertyId)`. After a 1.8 to 3.2 second delay, `generateReply` is invoked. The function hashes `propertyId + draftTimestamp` into a seed, picks a tone using category-weighted probabilities, streams the reply from OpenRouter, and persists the result to `replyStore`. A `reply_received` activity event is logged.
8. **Handoff**. The HandoffStrip opens a two-step modal flow inside its own panel: pick a reason (suggested reasons depend on the current category), then pick a new owner (recommended owner is highlighted based on the reason). `handleHandoff(propertyId, newOwnerId, reasonId, note)` logs the `owner_changed` activity event with the reason in its summary, updates the case, persists, and shows a toast. The next AI draft generation pulls the reason's `promptHint` from `handoffReasons.ts` and injects it into the user prompt under a "Why this account was just handed off to you" section.
9. **CSV upload**. The Upload modal calls `readFileAsTable(file)` (handles CSV and Excel via SheetJS). `autoDetectMapping(table.headers)` returns a `Record<FieldKey, number>` mapping each Pulse field to a column index, or -1 if not found. If any required field (`name`, `userAdoption`, `conversionRate`) is missing, the modal switches to the mapping wizard. Once mapping is complete, `applyMapping(table, mapping)` returns `Property[]`, which feeds into the preview step. Confirming "Load this data" calls `onLoadProperties(props, filename)`, which replaces the dataset and clears all per-account stores.

---

## 4. AI integration details

### Endpoint

Pulse calls **OpenRouter** directly from the browser. The endpoint constant lives in `src/lib/openrouter.ts`, `src/lib/generateReply.ts`, and `src/lib/generateDiagnosis.ts`:

```
https://openrouter.ai/api/v1/chat/completions
```

Auth via `Authorization: Bearer ${apiKey}` where the key comes from `import.meta.env.VITE_OPENROUTER_API_KEY`. Two custom headers are included on every request:

```
HTTP-Referer: ${window.location.origin}
X-Title: Pulse              (or "Pulse (reply simulation)" or "Pulse (diagnosis)")
```

### Models

The model registry is in `src/lib/models.ts`. Five OpenRouter model IDs are pre-configured with cost data:

| Model ID | Provider | Tier | Prompt cost ($/M) | Completion cost ($/M) |
|---|---|---|---|---|
| `google/gemini-flash-1.5-8b` | Google | cheap | 0.0375 | 0.15 |
| `google/gemini-2.0-flash-lite-001` | Google | cheap | 0.075 | 0.3 |
| `anthropic/claude-haiku-4.5` | Anthropic | balanced | 1.0 | 5.0 |
| `openai/gpt-4o-mini` | OpenAI | balanced | 0.15 | 0.6 |
| `anthropic/claude-sonnet-4.6` | Anthropic | quality | 3.0 | 15.0 |

Default model: `google/gemini-2.0-flash-lite-001`.

The Dev panel surfaces a radio-card selector for these models with a derived "$ / 100 drafts" cost (assumes 400 prompt tokens and 250 completion tokens per draft).

### System prompt (draft generation)

Verbatim from `src/lib/promptBuilder.ts`:

```
You are a customer success manager at a B2B SaaS company that sells AI-powered leasing tools to multifamily property management companies. You draft outreach for a specific property account.

Rules:
- Reference the property by name and city
- Cite the adoption and conversion numbers exactly as given
- Diagnose what those numbers mean for this account's category
- Make one specific ask (meeting, review, referral) drawn from the playbook
- Sound like a real person wrote this, not a template
- For "stuck" accounts: write an INTERNAL ticket to the solutions engineering team, not the client
- First line is "Subject: ...", then one blank line, then the body
- Keep it under 200 words
- Do not invent metrics, dates, or names that were not provided
```

### User prompt template (draft generation)

Verbatim function from `src/lib/promptBuilder.ts`:

```typescript
export function buildUserPrompt(input: DraftInput): string {
  const cat = CATEGORIES[input.category];
  const lines: string[] = [];
  lines.push(`# Retrieved context`);
  for (const c of input.chunks) {
    lines.push(`- [${c.source}] ${c.text}`);
  }
  if (input.similar.length > 0) {
    lines.push('');
    lines.push('# Similar accounts in portfolio');
    for (const s of input.similar) {
      lines.push(
        `- ${s.propertyName} (${CATEGORIES[s.category].label}, similarity ${s.score})`
      );
    }
  }
  lines.push('');
  lines.push('# Account snapshot');
  lines.push(`Property: ${input.property.name}, ${input.property.city}`);
  lines.push(`Units: ${input.property.units}`);
  lines.push(`User Adoption: ${input.property.userAdoption}%`);
  lines.push(`Conversion Rate: ${input.property.conversionRate}%`);
  lines.push(
    `Thresholds in use: UA ≥ ${input.thresholds.ua}%, CR ≥ ${input.thresholds.cr}%`
  );
  lines.push(`Category: ${cat.label}. ${cat.description}`);
  lines.push('');
  lines.push('# Playbook for this category');
  cat.playbook.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  lines.push('');
  lines.push('# Your identity');
  lines.push(`Your name: ${input.ownerName}`);
  lines.push(`Your role: ${input.ownerRole}`);

  if (input.handoffReasonLabel || input.handoffReasonHint) {
    lines.push('');
    lines.push('# Why this account was just handed off to you');
    if (input.handoffReasonLabel) {
      lines.push(`Reason: ${input.handoffReasonLabel}`);
    }
    if (input.handoffReasonHint) {
      lines.push(`Tone guidance: ${input.handoffReasonHint}`);
    }
    if (input.handoffNote) {
      lines.push(`Additional context: ${input.handoffNote}`);
    }
  }

  lines.push('');
  lines.push('Write the draft now.');
  return lines.join('\n');
}
```

### Generation parameters (drafts)

```json
{
  "model": "<modelId>",
  "stream": true,
  "max_tokens": 500,
  "temperature": 0.5,
  "messages": [
    { "role": "system", "content": "<SYSTEM_PROMPT>" },
    { "role": "user",   "content": "<built user prompt>" }
  ]
}
```

### System prompt (client reply simulation)

Verbatim from `src/lib/generateReply.ts`:

```
You are the client recipient of an outreach email about an AI leasing tool deployed at one of your apartment properties. You are a property manager or regional VP at a multifamily real estate company. Reply to the email you received.

Rules:
- First line is "Subject: Re: ..." then a blank line then the body
- Keep under 120 words
- Sound like a real busy person, not a customer service rep
- Reference one specific detail from the email when natural
- Sign off on its own line with first initial + last name only (e.g., "S. Patel")
- Do not use em dashes anywhere in the body
- Do not invent dates, names, or numbers that were not provided

Tone:
- positive: agree warmly to the meeting, share a specific time or one detail about the property; sound engaged
- neutral: ask a clarifying question, push back gently on timing, or note one concern; not hostile but not committed
- negative: be polite but cold; cite a constraint (busy, mid-quarter, recent leadership change) or disagree with the diagnosis; do not commit to anything
```

### Tone weighting (replies)

```typescript
const TONE_WEIGHTS: Record<CategoryKey, [number, number, number]> = {
  // [positive, neutral, negative]
  churn:     [0.10, 0.30, 0.60],
  stuck:     [0.25, 0.40, 0.35],
  sleeping:  [0.60, 0.30, 0.10],
  reference: [0.75, 0.20, 0.05],
};
```

The tone is selected deterministically: `mulberry32(hashString(propertyId + ':' + draftTimestamp))` produces a stable random number in [0, 1) for each (account, draft) pair, then weighted-thresholded against the tone weights. The same draft for the same property always produces the same tone.

### Generation parameters (replies)

```json
{
  "model": "<modelId>",
  "stream": true,
  "max_tokens": 300,
  "temperature": 0.7,
  "messages": [
    { "role": "system", "content": "<reply SYSTEM_PROMPT>" },
    { "role": "user",   "content": "<built reply prompt>" }
  ]
}
```

### System prompt (diagnosis chip)

Verbatim from `src/lib/generateDiagnosis.ts`:

```
You are an analyst at a B2B SaaS company that sells AI leasing tools to multifamily property managers. Given a single account's metrics and notes, write a 2-3 sentence root-cause hypothesis.

Rules:
- Be specific. Reference the actual numbers and notes.
- Don't restate the category label.
- Lead with the most likely cause.
- If notes are empty, say what you'd need to confirm.
- Plain prose. No bullet points. Under 60 words.
- Do not invent facts. Only use what's in the snapshot.
```

### Generation parameters (diagnosis)

```json
{
  "model": "<modelId>",
  "stream": false,
  "max_tokens": 180,
  "temperature": 0.4,
  "messages": [
    { "role": "system", "content": "<diagnosis SYSTEM_PROMPT>" },
    { "role": "user",   "content": "<formatted account snapshot>" }
  ]
}
```

### Response parsing

Drafts stream as Server-Sent Events. The streaming consumer (`consumeStream` in `openrouter.ts`) reads from the `ReadableStream`, splits on newlines, filters for `data:`-prefixed lines, parses JSON, and accumulates `delta.content` from each chunk. The `onToken` callback fires after each delta with the full accumulated string, which drives the live-typing UI. Usage telemetry comes from the final SSE chunk's `usage` field when present; otherwise token counts are estimated by `Math.ceil(text.length / 4)`.

`splitSubjectAndBody(text)` matches `/^subject:\s*(.+?)(?:\n|$)/i`, returning `{ subject, body }`. If no Subject line is found, subject defaults to `(no subject)` and body is the trimmed full text.

### Fallback behavior

Three fallback paths exist:

1. **No API key**: `import.meta.env.VITE_OPENROUTER_API_KEY` is undefined. Each generator immediately returns a deterministic template via `fallbackDraft(input)`, `fallback(input, tone, t0, ...)`, or `fallbackDiagnosis(input)`.
2. **API call fails**: any non-2xx response or thrown error from `fetch` falls back to the same template path.
3. **Session cap reached**: `generateReply` skips the API and goes straight to fallback if `getCapState().remaining <= 0`. The DiagnosisChip does the same.

Fallback drafts use string interpolation with real metrics (no `[placeholder]` markers). The model field is set to `fallback/template` so the Dev panel and the activity log can show that the deterministic path was used. The UI also displays a "fallback" chip on the draft panel when this happens.

### Prompt engineering decisions

- **Retrieved context first.** The prompt opens with the RAG chunks, then similar accounts, then the account snapshot. This puts ground-truth content before the model's task instructions and minimizes the chance of hallucinated numbers.
- **Threshold values included.** The prompt explicitly tells the model which thresholds the classification used. This anchors the diagnosis: a "stuck" account at UA 50 / CR 5 reads very differently than a "stuck" account at UA 90 / CR 18, and the model gets to reason about distance from the bar.
- **Playbook injected as numbered steps.** Each category's playbook is the model's working spec for what kind of ask to make. The system prompt is the persona and tone; the playbook is the action.
- **Identity at the bottom.** "Your name: ..." and "Your role: ..." are last so the model writes a signature consistent with whoever currently owns the account.
- **Handoff context as a distinct section.** When a handoff has just happened, the user prompt includes a "Why this account was just handed off to you" block with the human-readable reason label and a `promptHint` string from `handoffReasons.ts`. The hint is what changes the email's frame, for example turning a client outreach into an internal SE ticket when a technical handoff just occurred.
- **No invented facts.** Every system prompt includes a "Do not invent..." rule. This matters because the temperature is 0.5 to 0.7 and the model is small. Without that rule the cheaper Gemini variants invent dates and contact names freely.

### Response format expectations

The UI expects `Subject: ...\n\n<body>`. The `splitSubjectAndBody` function tolerates the absence of a Subject line by returning `(no subject)`. Streaming output is rendered verbatim into a `<pre className="whitespace-pre-wrap font-sans">` so paragraph breaks render naturally. A blinking caret `▍` appears via the `streaming-caret` CSS class while the stream is active.

---

## 5. Data model

### Core types (verbatim from `src/types.ts`)

```typescript
export type CategoryKey = 'churn' | 'stuck' | 'sleeping' | 'reference';

export type CaseStatus = 'new' | 'in_progress' | 'waiting' | 'completed';

export interface Property {
  id: string;
  name: string;
  city: string;
  units: number;
  userAdoption: number;
  conversionRate: number;
  notes: string;
}

export interface CaseState {
  ownerId: string;
  status: CaseStatus;
  notes: string;
  draftCache?: DraftRecord;
  lastHandoffReasonId?: string;
  lastHandoffNote?: string;
}

export interface Thresholds {
  ua: number;
  cr: number;
}

export interface Category {
  key: CategoryKey;
  label: string;
  description: string;
  action: string;
  defaultOwner: string;
  priority: number;
  playbook: string[];
  badgeBg: string;
  badgeFg: string;
  dot: string;
  quadrantFill: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface ModelOption {
  id: string;
  label: string;
  provider: string;
  promptCostPerM: number;
  completionCostPerM: number;
  per100Queries: number;
  tier: 'cheap' | 'balanced' | 'quality';
}

export interface DraftRecord {
  draft: string;
  subject: string;
  body: string;
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  timestamp: number;
  systemPrompt: string;
  userPrompt: string;
  retrievedChunks: RetrievedChunk[];
  pinned?: boolean;
}

export interface RetrievedChunk {
  source: string;
  text: string;
  score: number;
}

export interface SimilarAccount {
  propertyId: string;
  propertyName: string;
  category: CategoryKey;
  score: number;
}

export type ReplyTone = 'positive' | 'neutral' | 'negative';

export interface ReplyRecord {
  propertyId: string;
  toDraftTimestamp?: number;
  subject: string;
  body: string;
  raw: string;
  tone: ReplyTone;
  model: string;
  latencyMs: number;
  timestamp: number;
  usedFallback: boolean;
}
```

### Classification function (verbatim from `src/lib/classify.ts`)

```typescript
export function classify(
  ua: number,
  cr: number,
  t: Thresholds
): CategoryKey {
  const highUA = ua >= t.ua;
  const highCR = cr >= t.cr;
  if (!highUA && !highCR) return 'churn';
  if (highUA && !highCR) return 'stuck';
  if (!highUA && highCR) return 'sleeping';
  return 'reference';
}
```

### Default thresholds

```typescript
{ ua: 30, cr: 20 }
```

Stored in localStorage under `pulse.thresholds`. The tour recommends moving these to `{ ua: 20, cr: 40 }` to match observed industry averages.

### Pre-loaded dataset

The bundled dataset is `src/data/sample-portfolio.csv`, imported via Vite's `?raw` query param (declared in `src/vite-env.d.ts`):

```typescript
declare module '*.csv?raw' {
  const content: string;
  export default content;
}
```

The file contains 52 properties distributed across all four health groups at the default thresholds. Sample rows:

```csv
Property Name,City,Units,User Adoption (%),Conversion Rate (%),Notes
Ashford Terrace,"Atlanta, GA",280,8,3,Client POC changed last month. New contact has not responded to two outreach attempts.
Ironwood Flats,"Phoenix, AZ",264,3,1,Contract is up in 90 days. No engagement from the property manager since January.
The Belmonte,"Miami, FL",346,93,48,Highest conversion rate in the portfolio. Leasing team runs weekly optimization reviews on their own.
```

A complete copy is also served from `public/sample-portfolio.csv` so users can download it as a template.

### CSV parsing logic

`parseCsvToProperties(csv: string)` in `src/lib/parseCsv.ts`:

1. Normalize line endings, split on newlines, drop empty lines.
2. Tokenize the header row, normalize each cell (`trim().toLowerCase().replace(/\s+/g, ' ')`), and look up each header in the `HEADER_ALIASES` map to find its target `FieldKey`. Unknown headers map to null and are ignored.
3. For each data row, parse cells with a custom CSV tokenizer (`parseLine`) that handles double-quoted values with escaped inner quotes.
4. For each known column, write the cell into a partial `Property` object. Numeric fields (`units`, `userAdoption`, `conversionRate`) strip non-numeric characters before parsing. Numeric fields are clamped: UA and CR to [0, 100], units to >= 0.
5. Slugify the property name to produce `id` (`/[^a-z0-9]+/g` replaced with `-`, leading/trailing dashes stripped).
6. Drop rows with an empty name.

### Accepted header aliases (from `HEADER_ALIASES`)

| Field | Recognized headers |
|---|---|
| `name` | `property name`, `property`, `name`, `account`, `account name` |
| `city` | `city`, `location`, `market` |
| `units` | `units`, `unit count`, `doors` |
| `userAdoption` | `user adoption (%)`, `user adoption`, `user_adoption`, `adoption`, `usage`, `ua` |
| `conversionRate` | `conversion rate (%)`, `conversion rate`, `conversion`, `cr`, `close rate` |
| `notes` | `notes`, `comments`, `context` |

### Mapping wizard fallback

If auto-detection fails for any required field (`name`, `userAdoption`, `conversionRate`), the Upload modal switches to a mapping step. The user picks a column for each Pulse field from a dropdown of the raw header names. `applyMapping(table, mapping)` then transforms the raw `RawTable` into a `Property[]`.

Malformed values are handled gracefully: missing or non-numeric numeric cells default to 0; missing strings default to empty. The slug fallback (`row-N`) covers cases where a name slug would be empty.

---

## 6. Category definitions

All four categories are defined verbatim in `src/data/categories.ts`. The classification logic (`classify`) determines membership using only the two thresholds and the two metrics.

### Churn risk

- **Key**: `churn`
- **Label**: "Churn risk"
- **Description**: Low adoption and low conversion. Nobody is using the product and it is not producing results.
- **Suggested action**: Schedule save call
- **Default owner**: `csm` (Alex Rivera, Customer Success, Retention)
- **Priority**: 1 (sorts first in case-table queue)
- **Colors**:
  - Badge background: `#FCEBEB`
  - Badge foreground: `#B91C1C`
  - Dot: `#E24B4A`
  - Quadrant fill: `rgba(226, 75, 74, 0.08)`
- **Playbook**:
  1. Schedule an executive save call within 7 days
  2. Pull conversation logs and identify specific failure modes
  3. Book an executive business review with their leadership
  4. If no response in 5 business days, escalate to your director

### Stuck

- **Key**: `stuck`
- **Label**: "Stuck"
- **Description**: High adoption, low conversion. The team uses the platform actively, but leads are not converting. This is a technical problem.
- **Suggested action**: Open SE ticket
- **Default owner**: `se_lead` (Jordan Park, Director, Solutions Engineering)
- **Priority**: 2
- **Colors**:
  - Badge background: `#FAEEDA`
  - Badge foreground: `#B45309`
  - Dot: `#EF9F27`
  - Quadrant fill: `rgba(239, 159, 39, 0.08)`
- **Playbook**:
  1. Open a solutions engineering ticket with full context
  2. Audit AI configuration, integrations, and source mapping
  3. Pull 25 recent non-converting conversations and tag failure types
  4. Book a 30-minute technical review with their ops lead

### Sleeping champion

- **Key**: `sleeping`
- **Label**: "Sleeping champion"
- **Description**: Low adoption, high conversion. The product converts well but the team barely touches it. The highest-upside category in the portfolio.
- **Suggested action**: Drive adoption
- **Default owner**: `adoption` (Morgan Lee, Adoption Specialist)
- **Priority**: 3
- **Colors**:
  - Badge background: `#EEEDFE`
  - Badge foreground: `#534AB7`
  - Dot: `#7F77DD`
  - Quadrant fill: `rgba(127, 119, 221, 0.10)`
- **Playbook**:
  1. Identify the team member best positioned as an internal champion
  2. Book a 45-minute training session for the wider leasing team
  3. Send leadership a one-pager showing conversion results
  4. Set a 14-day follow-up to review adoption metrics

### Reference

- **Key**: `reference`
- **Label**: "Reference"
- **Description**: High adoption and high conversion. Both numbers are green. These accounts are the engine for expansion, case studies, and referrals.
- **Suggested action**: Ask for referral
- **Default owner**: `expansion` (Taylor Kim, Account Executive, Expansion)
- **Priority**: 4 (sorts last)
- **Colors**:
  - Badge background: `#EAF3DE`
  - Badge foreground: `#15803D`
  - Dot: `#639922`
  - Quadrant fill: `rgba(99, 153, 34, 0.10)`
- **Playbook**:
  1. Send a referral request and ask for one warm intro
  2. Offer to feature them as a case study
  3. Open an expansion conversation for additional buildings
  4. Confirm renewal terms 90 days before contract end

### Team roster

From `src/data/team.ts`:

| ID | Name | Role | Email | Default owner of |
|---|---|---|---|---|
| `csm` | Alex Rivera | Customer Success, Retention | alex.rivera@pulse.example | Churn risk |
| `se_lead` | Jordan Park | Director, Solutions Engineering | jordan.park@pulse.example | Stuck |
| `se` | Sam Chen | Senior Solutions Engineer | sam.chen@pulse.example | (handoff target) |
| `adoption` | Morgan Lee | Adoption Specialist | morgan.lee@pulse.example | Sleeping champion |
| `expansion` | Taylor Kim | Account Executive, Expansion | taylor.kim@pulse.example | Reference |

---

## 7. UI design details

### Color palette

Defined in `tailwind.config.ts` and `src/index.css`.

**Brand (purple, primary accent)**
- 50: `#F0ECFB`
- 100: `#EEEDFE`
- 200: `#C3B8F0`
- 500: `#7F77DD`
- 600: `#6E56CF`
- 700: `#534AB7` (primary button background, logo background, accent borders, focus rings)
- 900: `#1F1A66`

**Ink (text)**
- 900: `#0B0B14` (primary text)
- 700: `#2A2A3A`
- 500: `#5A5A6E` (secondary text)
- 400: `#8B8B9A` (tertiary, axis labels)
- 300: `#B5B5C0`

**Surface (backgrounds + borders)**
- 0: `#FFFFFF` (page background)
- 50: `#F7F7FB` (panel background, table header)
- 100: `#EFEFF5` (chip / muted background)
- 200: `#E4E4EC` (borders)

**Signal (category-specific)**
- Churn: bg `#FCEBEB` / fg `#B91C1C` / bar `#E24B4A`
- Stuck: bg `#FAEEDA` / fg `#B45309` / bar `#EF9F27`
- Sleeping: bg `#EEEDFE` / fg `#534AB7` / bar `#7F77DD`
- Reference: bg `#EAF3DE` / fg `#15803D` / bar `#639922`

### Typography

- **Font family (body)**: system stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`
- **Font family (monospace)**: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`
- **Base size**: 14px with 1.5 line-height (set in `index.css`)
- **`text-13`**: 13px / 18px line-height (body and dense table rows)
- **`text-2xs`**: 11px / 14px line-height (eyebrow labels, fine print)
- **`label-eyebrow` class**: 11px, uppercase, letter-spacing 0.06em, weight 500, ink-500
- **Section headers**: 18px, weight 600, tracking-tight
- **Property name in action panel**: 16px, weight 600
- **Metric values**:
  - Summary cards: 20px (`text-xl`)
  - Action panel metric cards: 18px

### Layout dimensions

- **Page max width**: 1280px
- **Page padding**: 24px horizontal (6 in Tailwind units), 20px vertical (5)
- **Main grid**: 200px sticky left rail + flexible right content
- **Dashboard inner grid**: 260px threshold panel + flexible scatter
- **Action panel grid**: 1 column on mobile, 2 columns at `lg:` breakpoint
- **Section spacing**: `space-y-10` (40px) between sections
- **Card padding**: 12px (panel-flat p-3) or 16px (panel p-4)
- **Gaps**: 12px between cards in grids, 24px in main 2-column grid
- **Modal max widths**: typically `max-w-3xl` (768px) for content modals, `max-w-xl` for short ones

### Border radius

- `rounded-md`: 6px (buttons, inputs, chips inside tables)
- `rounded-lg`: 8px (panels, modals, scatter plot container)
- `rounded-xl`: 12px (tour tooltip card)
- `rounded-full`: pills, range slider track, chips

### Shadows

- `card`: `0 1px 0 rgba(11, 11, 20, 0.04), 0 1px 2px rgba(11, 11, 20, 0.04)`
- `panel`: `0 1px 0 rgba(11, 11, 20, 0.05), 0 4px 16px -8px rgba(11, 11, 20, 0.10)`

### Animations and transitions

- **Streaming caret**: blinking `▍` character after streaming text via `pulseCaret` keyframes (1s step animation, alternating opacity 1 and 0).
- **Pulse dot** (pending reply indicator): Tailwind's `animate-pulse` on a small purple dot.
- **Smooth scroll**: `scrollIntoView({ behavior: 'smooth', block: 'start' })` for section jumps and selection scroll.
- **Hover transitions**: 150ms color transition on buttons and links via Tailwind's `transition-colors`.
- **Tour highlight ring**: morphs from purple (`#7F77DD`) to green (`#639922`) when a step is marked complete.

### Responsive behavior

The app targets desktop primarily. The main grid drops the sticky left rail at mobile widths (left rail is `lg:grid-cols-[200px_1fr]`, falling back to a single column). The action panel goes single-column at the same breakpoint. The page max width caps at 1280px and is centered.

### Light / dark mode

Light mode only. There is no dark mode toggle. All color tokens assume a light background.

### Focus and selection styles

- All buttons and inputs use a 2px purple focus ring (`focus:ring-2 focus:ring-brand-200`).
- Text selection: purple background (`#C3B8F0`), navy text (`#1F1A66`).

### Range slider

Custom styling for `input[type="range"]`:
- Track height: 4px
- Thumb: 16px circle, purple fill (`#534AB7`), 2px white border, 1px secondary outer ring
- Track background: `#EFEFF5` (surface-100)

---

## 8. Scatter plot implementation

The chart is a single SVG element in `src/components/ScatterPlot.tsx` with no chart library.

### Dimensions and coordinate space

```typescript
const W = 720;
const H = 360;
const PAD = { top: 28, right: 24, bottom: 36, left: 44 };
const X_MAX = 100;     // user adoption %
const Y_MAX = 50;      // conversion rate %
```

The SVG uses `viewBox="0 0 720 360"` and `width="100%"` so it scales responsively while preserving aspect ratio.

### Coordinate mapping

```typescript
function sx(x: number): number {
  return PAD.left + (x / X_MAX) * (W - PAD.left - PAD.right);
}
function sy(y: number): number {
  return H - PAD.bottom - (y / Y_MAX) * (H - PAD.top - PAD.bottom);
}
```

`sx` maps a UA percentage (0 to 100) to an x pixel within the chart's inner area, accounting for left padding (axis labels) and right padding. `sy` maps a CR percentage (0 to 50) to a y pixel, inverted because SVG's y axis grows downward.

### Quadrant backgrounds

Four `<rect>` elements, one per quadrant, computed from the current threshold lines:

```typescript
const tx = sx(thresholds.ua);   // x coordinate of the vertical threshold line
const ty = sy(thresholds.cr);   // y coordinate of the horizontal threshold line
```

- **Churn (bottom-left)**: `x={PAD.left} y={ty} width={tx - PAD.left} height={H - PAD.bottom - ty}` filled with `rgba(226, 75, 74, 0.08)`
- **Stuck (bottom-right)**: `x={tx} y={ty} width={W - PAD.right - tx} height={H - PAD.bottom - ty}` filled amber
- **Sleeping (top-left)**: `x={PAD.left} y={PAD.top} width={tx - PAD.left} height={ty - PAD.top}` filled purple
- **Reference (top-right)**: `x={tx} y={PAD.top} width={W - PAD.right - tx} height={ty - PAD.top}` filled green

All four rects re-render in real time when either threshold changes because they read `tx` and `ty` from the slider-bound state.

### Threshold lines

Two dashed `<line>` elements drawn in brand purple (`#534AB7`) at 60% opacity with stroke-dasharray `4 3`. Vertical line at `x={tx}`, horizontal line at `y={ty}`. They sit above the quadrant fills, below the dots.

### Axes

Solid 1px grey lines at the chart's left and bottom edges. Tick marks every 25% on the x axis (0, 25, 50, 75, 100) and every 10% on the y axis (0, 10, 20, 30, 40, 50), each with a small numeric label in `#8B8B9A`. Axis titles "User adoption (%)" centered below and "Conversion rate (%)" rotated -90 degrees on the left.

### Dots

```typescript
{properties.map((p) => {
  const cat = classify(p.userAdoption, p.conversionRate, thresholds);
  const color = CATEGORIES[cat].dot;
  const cx = sx(p.userAdoption);
  const cy = sy(Math.min(Y_MAX, p.conversionRate));
  const isSelected = p.id === selectedId;
  return (
    <g key={p.id}>
      {isSelected && <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.25} />}
      <circle
        cx={cx} cy={cy}
        r={isSelected ? 6.5 : 5}
        fill={color}
        stroke={isSelected ? '#0B0B14' : 'white'}
        strokeWidth={isSelected ? 1.2 : 1}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHover({ id: p.id, x: cx, y: cy })}
        onMouseLeave={() => setHover(null)}
        onClick={() => onSelect(p.id)}
      />
    </g>
  );
})}
```

- Base radius 5px, expands to 6.5px when selected.
- Fill color comes from the category.
- White stroke separates dots that overlap.
- Selected dot adds a translucent outer ring (`r={11}`, opacity 0.25) and switches its stroke to near-black for contrast.
- `onClick` fires `onSelect(propertyId)` which selects the account globally and smooth-scrolls Outreach into view.

### Quadrant counts

Each quadrant has a small text label like "Churn risk · 13" positioned in the corner farthest from the threshold intersection. The count is computed once per render with a memo over the properties and thresholds.

### Tooltip

Hover state is held in component state: `const [hover, setHover] = useState<{ id; x; y } | null>(null)`. When set, an absolutely-positioned `<div>` renders to the right of the dot showing the property name and metrics. The tooltip uses `pointer-events-none` so it never blocks clicks. Position is computed in percentages from the SVG coordinate space to match the responsive scaling:

```typescript
const left = `calc(${(hover.x / W) * 100}% + 8px)`;
const top  = `calc(${(hover.y / H) * 100}% - 4px)`;
```

---

## 9. Key code patterns

### TF-IDF + cosine similarity for "Similar accounts" (from `src/lib/tfidf.ts`)

```typescript
function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[a-z][a-z0-9]+/g) ?? []).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t)
  );
}

function buildCorpus(props: Property[]): Corpus {
  const docs: DocStats[] = props.map((p) => {
    const tokens = tokenize(`${p.name} ${p.city} ${p.notes}`);
    return { id: p.id, terms: termFreq(tokens), length: tokens.length };
  });
  const N = docs.length || 1;
  const df = new Map<string, number>();
  for (const d of docs) {
    for (const t of d.terms.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [t, c] of df) idf.set(t, Math.log((N + 1) / (c + 1)) + 1);
  return { docs, idf };
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const w of a.values()) na += w * w;
  for (const w of b.values()) nb += w * w;
  for (const [t, wa] of a) {
    const wb = b.get(t);
    if (wb) dot += wa * wb;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function findSimilar(
  target: Property,
  pool: Property[],
  thresholds: Thresholds,
  k = 3
): SimilarAccount[] {
  const others = pool.filter((p) => p.id !== target.id);
  if (others.length === 0) return [];
  const corpus = buildCorpus([target, ...others]);
  const targetDoc = corpus.docs[0];
  const tv = tfidfVector(targetDoc.terms, targetDoc.length, corpus.idf);
  const targetCat = classify(
    target.userAdoption,
    target.conversionRate,
    thresholds
  );

  const scored: { p: Property; category: CategoryKey; score: number }[] = [];
  for (let i = 1; i < corpus.docs.length; i++) {
    const d = corpus.docs[i];
    const v = tfidfVector(d.terms, d.length, corpus.idf);
    const textScore = cosine(tv, v);
    const other = others[i - 1];
    const cat = classify(other.userAdoption, other.conversionRate, thresholds);
    const metricDist =
      Math.abs(other.userAdoption - target.userAdoption) +
      Math.abs(other.conversionRate - target.conversionRate);
    const metricScore = 1 / (1 + metricDist / 30);
    const sameCat = cat === targetCat ? 0.15 : 0;
    const score = textScore * 0.55 + metricScore * 0.3 + sameCat;
    if (score > 0.02) scored.push({ p: other, category: cat, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => ({
    propertyId: s.p.id,
    propertyName: s.p.name,
    category: s.category,
    score: Number(s.score.toFixed(3)),
  }));
}
```

The composite similarity score is `text * 0.55 + metric * 0.3 + sameCategoryBonus`. Text similarity dominates so accounts with similar narrative context (notes mentioning the same kind of problem) rank higher than accounts that just happen to have similar numbers. The metric component prevents wild metric outliers from being treated as similar based on prose alone. The category bonus keeps the recommendations clustered around accounts the user is likely to be reasoning about together.

### Search token parsing (from `src/lib/search.ts`)

```typescript
function parseTokens(query: string): ParsedToken[] {
  if (!query.trim()) return [];
  const rough = query.toLowerCase().match(/"[^"]+"|\S+/g) ?? [];
  const out: ParsedToken[] = [];
  for (const tok of rough) {
    const clean = tok.replace(/^"|"$/g, '').trim();
    if (!clean) continue;

    const metric = clean.match(/^(ua|cr)([<>=])(\d+)$/);
    if (metric) {
      out.push({
        raw: tok,
        kind: 'metric',
        value: clean,
        meta: {
          field: metric[1] as 'ua' | 'cr',
          op: metric[2] as '<' | '>' | '=',
          n: Number(metric[3]),
        },
      });
      continue;
    }

    const ownerMatch = clean.match(/^owner:(.+)$/);
    if (ownerMatch) {
      out.push({ raw: tok, kind: 'owner', value: ownerMatch[1] });
      continue;
    }

    const state = stateCodeFromQuery(clean);
    if (state) {
      out.push({ raw: tok, kind: 'state', value: state });
      continue;
    }

    const cat = QUADRANT_ALIASES[clean];
    if (cat) {
      out.push({ raw: tok, kind: 'quadrant', value: cat });
      continue;
    }

    out.push({ raw: tok, kind: 'free', value: clean });
  }
  return out;
}
```

The query is split on whitespace (with quoted phrases preserved as a single token), then each token is tried in priority order: metric expression (`ua<10`, `cr>30`), owner directive (`owner:alex`), US state code or full state name, quadrant alias, free-text fallback. All tokens AND together.

### useScrollSpy custom hook (from `src/hooks/useScrollSpy.ts`)

```typescript
export function useScrollSpy(ids: string[], offsetTop = 120): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.offsetTop - b.offsetTop);
        if (visible[0]?.id) setActive(visible[0].id);
      },
      {
        rootMargin: `-${offsetTop}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids.join('|'), offsetTop]);

  return active;
}
```

The rootMargin shrinks the viewport from the top by the offset and from the bottom by 55% of the viewport, so an element is considered "active" only when it crosses the upper third of the page. Sorting by `offsetTop` ensures the topmost visible section wins when multiple are in view.

### useLocalStorage hook (from `src/hooks/useLocalStorage.ts`)

```typescript
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```

### Activity event log (from `src/lib/activity.ts`)

```typescript
export type ActivityType =
  | 'draft_generated'
  | 'draft_pinned'
  | 'mailto_opened'
  | 'owner_changed'
  | 'status_changed'
  | 'notes_edited'
  | 'data_loaded'
  | 'reply_received';

export const activity = {
  log(event: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent {
    const full: ActivityEvent = {
      ...event,
      id: `${event.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    const all = readAll();
    all.unshift(full);
    writeAll(all);
    return full;
  },
  all(): ActivityEvent[] { return readAll(); },
  forProperty(propertyId: string): ActivityEvent[] {
    return readAll().filter((e) => e.propertyId === propertyId);
  },
  forOwner(ownerId: string): ActivityEvent[] {
    return readAll().filter((e) => e.ownerId === ownerId);
  },
  clear(): void { localStorage.removeItem(KEY); },
};
```

The event log is capped at 500 events in localStorage (`writeAll` slices to the limit before serializing).

### Deterministic synthetic trends (from `src/lib/trends.ts`)

```typescript
function buildSeries(seed: number, current: number, max: number): MetricTrend {
  const rand = mulberry32(seed);
  // Pick a long-term drift in [-12, +12]
  const drift = (rand() - 0.5) * 24;
  const start = clamp(current - drift, 1, max);
  const series: number[] = [];
  for (let i = 0; i < HISTORY_WEEKS; i++) {
    const progress = i / (HISTORY_WEEKS - 1);
    const base = start + (current - start) * progress;
    const wobble = (rand() - 0.5) * 6;
    series.push(Math.round(clamp(base + wobble, 1, max)));
  }
  series[series.length - 1] = current; // anchor the last point exactly
  return { values: series, delta: current - series[0] };
}

export function trendFor(p: Property): PropertyTrend {
  return {
    ua: buildSeries(hashString(p.id + ':ua'), p.userAdoption, 100),
    cr: buildSeries(hashString(p.id + ':cr'), p.conversionRate, 50),
  };
}
```

The hash seeds a `mulberry32` PRNG per property+metric pair, so the same account always produces the same 8-week trend line. The final value is anchored to the actual current metric, so the sparkline always ends at the real number.

### Reply tone hashing (from `src/lib/generateReply.ts`)

```typescript
function mulberry32(a: number): () => number {
  let s = a >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickTone(category: CategoryKey, seed: number): ReplyTone {
  const [p, n] = TONE_WEIGHTS[category];
  const r = mulberry32(seed)();
  if (r < p) return 'positive';
  if (r < p + n) return 'neutral';
  return 'negative';
}
```

`hashString` is FNV-1a 32-bit. The seed for tone selection is always `hashString(propertyId + ':' + draftTimestamp)`, so a regenerated draft (which has a new timestamp) can produce a different tone, while the same draft replayed gets the same tone.

### OpenRouter streaming consumption (from `src/lib/openrouter.ts`)

```typescript
async function consumeStream(
  body: ReadableStream<Uint8Array>,
  onToken?: (acc: string) => void
): Promise<StreamAccum> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let promptTokens = 0;
  let completionTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const evt = JSON.parse(payload);
        const delta = evt?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          text += delta;
          onToken?.(text);
        }
        if (evt?.usage) {
          promptTokens = evt.usage.prompt_tokens ?? promptTokens;
          completionTokens = evt.usage.completion_tokens ?? completionTokens;
        }
      } catch {
        // ignore bad line
      }
    }
  }
  return { text, promptTokens, completionTokens };
}
```

Standard SSE consumer: read chunks, accumulate into a buffer, split on newlines, peel off `data:` payloads, parse JSON, accumulate `delta.content`, fire `onToken` with the running total.

---

## 10. Deployment

- **Hosting**: Vercel
- **Build command**: `npm run build` (which runs `tsc -b && vite build`)
- **Output directory**: `dist`
- **Framework preset**: `vite`
- **vercel.json**:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite",
    "rewrites": [{ "source": "/(.*)", "destination": "/" }]
  }
  ```
  The rewrite rule routes all paths to `/` so the single-page app handles its own internal navigation.
- **Required environment variables**:
  - `VITE_OPENROUTER_API_KEY`: an OpenRouter API key. If absent, the app boots fine but every AI generation falls back to deterministic templates. The key is exposed in the client bundle because Vite inlines `VITE_*` env vars at build time; the operator is expected to set a spending cap and a model allowlist on OpenRouter to bound risk.
- **Local development**:
  ```bash
  npm install
  cp .env.example .env   # add VITE_OPENROUTER_API_KEY
  npm run dev            # starts Vite on http://localhost:5173
  ```
- **Live URL**: deployed on Vercel under the GitHub-connected project. The exact URL depends on the project slug. The repository is at `https://github.com/adarsh-rai-secure/pulse` and inherits the live demo URL Vercel assigns.

---

## 11. What is NOT in the app

Things that were discussed or could exist but are intentionally not implemented:

- **Server-side persistence / database**. All state is in browser localStorage. Cases, drafts, replies, activity, thresholds, model selection, splash and tour flags are all per-browser. Clearing site data wipes everything.
- **Authentication or multi-user support**. There are no user accounts. The "team" is a static array of five names in `team.ts`. There is no concept of "logged in as" or "shared with."
- **Real CRM integration**. The Send button is labeled "Send (simulated)" because it does not actually transmit anything. In production this would POST to a webhook, the customer's CRM, or a mail-send API. The reply simulation is also synthetic.
- **Historical metric tracking**. The 8-week trends rendered as sparklines and used by the Weekly digest are deterministically synthetic, derived from the current metric values via a hashed PRNG. There is no real history. Pulse does not track changes to the same account over time.
- **Natural-language data queries**. There is no "show me all stuck accounts in Texas with adoption below 10" via a chat box. The smart-search bar supports tokens like `TX`, `churn`, `ua<10`, but composition is a structured token grammar, not natural language.
- **Audit log surfaced to the user**. The activity log is per-account and per-team-member in the UI, but there is no "show me everything that happened today across the portfolio" view.
- **Comments or @-mentions**. Notes are a single textarea per account. No threading, no mentions, no shared writeups.
- **Email composition assistance beyond the draft**. There is no "tone slider", no "rewrite shorter" button, no "make this more direct" prompts. The user edits in plain text or regenerates the whole draft.
- **Bulk operations**. Selecting multiple accounts and acting on them at once is not supported.
- **Real CSV column mapping for re-uploads**. Once a CSV is loaded, replacing it wipes all state. There is no merge or diff path.
- **Server-side prompt routing or RAG**. Everything happens in the browser. TF-IDF, chunking, and similar-account retrieval are all client-side over the in-memory dataset.
- **Embedded analytics**. There is no Mixpanel, no PostHog, no Segment.
- **Dark mode**. Light theme only.
- **Mobile-first design**. The app is responsive in that it collapses gracefully, but the experience is desktop-first.

The "what would you change for production" interview answer is: persistent storage (Supabase or Postgres) so cases survive across users and browsers; a backend proxy for the LLM call so the API key is not in the client bundle; CRM integration so the Send button actually sends; real historical metric ingestion via a CRM webhook so the trends and Weekly digest are real; a feedback loop on AI drafts so prompts can be tuned over time.

---

## 12. Dependencies

From `package.json`:

### Runtime dependencies

| Package | Version | Why it's used |
|---|---|---|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM renderer |
| `xlsx` | ^0.18.5 | SheetJS, used to parse `.xls` and `.xlsx` files from the Upload modal. Converts the workbook to CSV in-memory, then the native CSV parser takes over. |

### Dev dependencies

| Package | Version | Why it's used |
|---|---|---|
| `@types/react` | ^18.3.12 | TypeScript types for React |
| `@types/react-dom` | ^18.3.1 | TypeScript types for React DOM |
| `@vitejs/plugin-react` | ^4.3.3 | React Fast Refresh for Vite |
| `autoprefixer` | ^10.4.20 | Adds vendor prefixes to Tailwind output |
| `postcss` | ^8.4.49 | PostCSS pipeline used by Tailwind |
| `tailwindcss` | ^3.4.15 | Utility-first CSS framework. Custom design tokens in `tailwind.config.ts` |
| `typescript` | ^5.6.3 | Static typing for the entire codebase. Strict mode on. |
| `vite` | ^5.4.11 | Build tool and dev server. Provides the `?raw` import for inlining the bundled sample CSV. |

### What is deliberately NOT a dependency

- No charting library (D3, Recharts, Chart.js). The scatter plot and sparklines are hand-written SVG.
- No animation library (Framer Motion, React Spring). The single animation is a CSS keyframes blinking caret.
- No UI library (MUI, shadcn, Radix). All components are custom Tailwind.
- No routing library. The app is a single page with section anchors.
- No state library (Redux, Zustand, Jotai). React's `useState` and `useMemo` are sufficient.
- No HTTP client (axios, ky). Native `fetch` with `ReadableStream` reader for SSE.
- No LLM SDK. OpenRouter exposes a standard OpenAI-compatible chat-completions endpoint; the app talks to it directly.
- No date library (date-fns, dayjs). `formatRelativeTime` is 15 lines of native `Date.now()` arithmetic.

This kept the production bundle to roughly 605 kB JS (200 kB gzipped) including SheetJS, which is the single biggest dependency by weight.
