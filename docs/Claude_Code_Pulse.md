# Claude Code Prompt: Build Pulse

## MANDATORY SAFEGUARDS — READ BEFORE EXECUTING

### No Claude Attribution
- Do NOT use --author flag or Co-authored-by trailers in any commit
- Let the system git config handle all authorship
- After ALL commits, verify: git log --format='%an' | sort -u
- If "Claude" or "claude" appears anywhere in authorship, fix with filter-branch

### Writing Rules (apply to all text: README, comments, docstrings)
Reference: https://github.com/adarsh-rai-secure/pulse
Full guide: Adarsh_Anti_AI_Writing_Guide.md

BANNED WORDS (never use): delve, harness, robust, comprehensive, innovative,
cutting-edge, leverage, utilize, furthermore, additionally, moreover, landscape,
paradigm, multifaceted, spearhead, foster, facilitate, pivotal, groundbreaking,
transformative, ecosystem, synergy, holistic, streamline, seamless, empower,
reimagine, showcase, underscore, unlock, tapestry, revolutionize, unparalleled,
meticulous, vibrant, commendable, garner, pioneering, trailblazing, unleash

BANNED STRUCTURES: No em dashes. No rule-of-three as rhythm. No "-ing" tail
phrases. No "serves as" (use "is"). No puffery openers. No "Additionally/
Furthermore/Moreover" sentence starters.

VOICE: Active voice. First person where appropriate. Specific claims over
vague modifiers. Vary sentence length. Technical and direct.

### Post-Execution Checklist
- [ ] git log --format='%an' | sort -u shows ONLY "Adarsh Rai"
- [ ] No em dashes in any text file
- [ ] No banned words in any text file
- [ ] grep -ri "claude" in the repo returns zero results (except library refs)

---


---

## What you are building

Pulse is a portfolio health scoring tool for B2B companies that
deploy AI products across multiple client accounts. It was built
for the multifamily property management industry, where AI leasing
tools get deployed across 50 to 500 properties and a single
customer success manager needs to triage which accounts need
attention, what kind, and what to say.

The tool classifies accounts into four health quadrants based on
two metrics (user adoption % and conversion rate %), surfaces a
prioritized playbook per category, and generates AI-drafted
outreach emails via OpenRouter.

---

## Tech stack

- React + TypeScript (Vite)
- Tailwind CSS
- Inline SVG for scatter plot (no charting library)
- OpenRouter API for AI outreach drafts
- SheetJS (xlsx) for Excel parsing, native CSV parsing
- Deploy: Vercel

---

## Project structure

```
pulse/
  src/
    components/
      Header.tsx               # Logo, title, upload btn, guide btn, user chip
      PortfolioSummary.tsx     # 4 stat cards: total, churn count, avg UA, avg CR
      ThresholdControls.tsx    # Two sliders for UA and CR thresholds
      ScatterPlot.tsx          # SVG with quadrant bgs, threshold lines, dots
      FilterBar.tsx            # Owner dropdown, search input, show-completed
      CaseTable.tsx            # Sortable table with inline owner/status
      ActionPanel.tsx          # Property detail: playbook + AI draft side by side
      AIDraftPanel.tsx         # Draft display, copy/mailto/regenerate buttons
      ReferenceGuide.tsx       # Expandable panel explaining categories and roles
      FileUpload.tsx           # CSV/Excel upload with status message
    data/
      properties.ts            # Default dataset (loaded from bundled CSV or array)
      categories.ts            # Four quadrant definitions with playbooks
      team.ts                  # Generic team roles
    lib/
      classify.ts              # categorize(property, thresholds) -> category key
      generateDraft.ts         # OpenRouter API call + fallback templates
      parseUpload.ts           # CSV and Excel parsing
    types.ts                   # Property, Category, TeamMember, CaseState types
    App.tsx
    main.tsx
  public/
    sample-data.csv            # Sample CSV for users to download and inspect format
  .env.example                 # VITE_OPENROUTER_API_KEY=your_key_here
  README.md
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.ts
  vercel.json
```

---

## Dataset

The user (Adarsh) will provide their own CSV file as the default
dataset. The app should load a default dataset from src/data/properties.ts.
If no CSV is provided yet, seed with 20 placeholder properties that
demonstrate all four quadrants at default thresholds (UA=30, CR=20).

Expected CSV columns:
- Property Name (string)
- City (string, format: "City, ST")
- Units (integer)
- User Adoption (%) (integer, 1-99)
- Conversion Rate (%) (integer, 1-50)
- Notes (string, optional)

The app must accept CSVs with these column names (case-insensitive,
trimmed). Also accept shorthand: "UA" for User Adoption, "CR" for
Conversion Rate.

---

## Team roles (team.ts)

Generic roles. Do NOT use any EliseAI employee names or emails.

| id | name | role | defaultFor |
|---|---|---|---|
| csm | Alex Rivera | Customer Success, Retention | churn |
| se_lead | Jordan Park | Director, Solutions Engineering | stuck |
| se | Sam Chen | Sr. Solutions Engineer | stuck (secondary) |
| adoption | Morgan Lee | Adoption Specialist | sleeping |
| expansion | Taylor Kim | Account Executive, Expansion | reference |

---

## Category definitions (categories.ts)

### churn
- Label: "Churn risk"
- Color: red (#E24B4A badge on #FCEBEB background)
- Default owner: csm
- Suggested action: "Schedule save call"
- Priority: 1 (highest, sort first)
- Description: Low adoption and low conversion. The team is not
  using the product and it is not producing results.
- Playbook:
  1. Schedule an executive save call within 7 days
  2. Pull conversation logs and identify specific failure modes
  3. Book an executive business review with their leadership
  4. If no response in 5 business days, escalate to your director

### stuck
- Label: "Stuck"
- Color: amber (#EF9F27 badge on #FAEEDA background)
- Default owner: se_lead
- Suggested action: "Open SE ticket"
- Priority: 2
- Description: High adoption but low conversion. The team uses the
  platform but leads are not converting. This is a technical issue.
- Playbook:
  1. Open a solutions engineering ticket with full context
  2. Audit AI configuration, integrations, and source mapping
  3. Pull 25 recent non-converting conversations, tag failure types
  4. Book a 30-minute technical review with their ops lead

### sleeping
- Label: "Sleeping champion"
- Color: purple (#7F77DD badge on #EEEDFE background)
- Default owner: adoption
- Suggested action: "Drive adoption"
- Priority: 3
- Description: Low adoption but high conversion. The product works,
  the team barely uses it. Double their value without changing the
  product.
- Playbook:
  1. Identify the team member best positioned as internal champion
  2. Book a 45-minute training session for the wider leasing team
  3. Send leadership a one-pager showing conversion results
  4. Set a 14-day follow-up to review adoption metrics

### reference
- Label: "Reference"
- Color: green (#639922 badge on #EAF3DE background)
- Default owner: expansion
- Suggested action: "Ask for referral"
- Priority: 4 (lowest, sort last)
- Description: High adoption and high conversion. Both numbers are
  green. The engine for expansion, case studies, and referrals.
- Playbook:
  1. Send a referral request and ask for one warm intro
  2. Offer to feature them as a case study
  3. Open an expansion conversation for additional buildings
  4. Confirm renewal terms 90 days before contract end

---

## Classification logic (classify.ts)

```typescript
type CategoryKey = 'churn' | 'stuck' | 'sleeping' | 'reference';

interface Thresholds { ua: number; cr: number; }

function categorize(ua: number, cr: number, t: Thresholds): CategoryKey {
  const highUA = ua >= t.ua;
  const highCR = cr >= t.cr;
  if (!highUA && !highCR) return 'churn';
  if (highUA && !highCR) return 'stuck';
  if (!highUA && highCR) return 'sleeping';
  return 'reference';
}
```

---

## AI draft generation (generateDraft.ts)

### OpenRouter call

Endpoint: https://openrouter.ai/api/v1/chat/completions
Auth: Bearer token from VITE_OPENROUTER_API_KEY env var

```typescript
interface DraftInput {
  propertyName: string;
  city: string;
  units: number;
  category: CategoryKey;
  ua: number;
  cr: number;
  notes: string;
  ownerName: string;
  ownerRole: string;
  playbook: string[];
}

async function generateDraft(input: DraftInput): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) return fallbackDraft(input);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Pulse'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5-8b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPrompt(input) }
        ],
        max_tokens: 500
      })
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || fallbackDraft(input);
  } catch {
    return fallbackDraft(input);
  }
}
```

### System prompt

```
You are a customer success manager at a B2B SaaS company that sells
AI-powered leasing tools to multifamily property management companies.
Draft an outreach email for a specific property account.

Rules:
- Reference the property by name and city
- Cite the specific adoption and conversion numbers
- Diagnose what the numbers likely mean for this account category
- Make a specific ask (meeting, review, referral) based on the playbook
- Sound like a real person, not a template
- For "stuck" accounts: write an INTERNAL ticket to solutions engineering
- Start with "Subject: ..." then blank line then body
- Under 200 words
```

### User prompt builder

```typescript
function buildPrompt(input: DraftInput): string {
  return `Property: ${input.propertyName}, ${input.city}
Units: ${input.units}
Category: ${input.category}
User Adoption: ${input.ua}%
Conversion Rate: ${input.cr}%
Account Notes: ${input.notes || 'No notes yet.'}
Playbook steps: ${input.playbook.join('; ')}
Your name and role: ${input.ownerName}, ${input.ownerRole}`;
}
```

### Fallback templates

If API key is missing or call fails, generate a template draft:

- churn: "Subject: {name}, let's get this back on track" + body
  citing UA/CR, asking for a 30-min call this week
- stuck: "Subject: SE review needed, {name}" + internal ticket
  format with context, asks, and investigation steps
- sleeping: "Subject: {name}, your numbers look great" + body
  offering training session and leadership one-pager
- reference: "Subject: {name}, quick ask and a thank you" + body
  asking for case study and referral

These templates should use string interpolation with real metrics,
not placeholders like [name]. The output should read like a real
email even without the AI.

---

## Scatter plot spec (ScatterPlot.tsx)

SVG, rendered in React. No D3 or charting library.

- ViewBox: adapt to container width, approximately 560 x 280
- X axis: User Adoption (0-100%)
- Y axis: Conversion Rate (0-50%)
- Four quadrant backgrounds as rects with low opacity fills:
  - Bottom-left: red (churn risk)
  - Bottom-right: amber (stuck)
  - Top-left: purple (sleeping champion)
  - Top-right: green (reference)
- Dashed threshold lines: update position on slider change
- Dots: circles, r=5 default, r=7 selected, colored by category
- Selected dot gets a subtle outer ring (r=11, same color, 0.4 opacity)
- Quadrant labels: category name + count, positioned in each quadrant
- Click handler on dots: sets selected property
- Hover: show tooltip with property name and metrics

---

## UI layout (top to bottom)

### 1. Header
Left: purple logo square (28x28, border-radius 6px, white heartbeat
icon inside) + "Pulse" title (18px, weight 500) + subtitle
"AI deployment health scoring" (12px, secondary color).
Right: "Upload CSV" button with upload icon, "Guide" button with
book icon, user avatar chip.

### 2. Portfolio summary
4-column grid of metric cards on secondary background.
- Total properties (count)
- Churn risk (count, with red color, optional trend indicator)
- Average adoption (percentage)
- Average conversion (percentage)

### 3. Threshold controls + scatter plot
2-column grid: narrow left panel (180px) with threshold sliders,
wide right panel with scatter plot.

### 4. Filter bar
Row: owner dropdown, search input, "show completed" checkbox.

### 5. Case table
Columns: Property (26%), UA (7%), CR (7%), Health (16%),
Next step (20%), Owner (14%), Status (10%).
Sort by category priority (churn first), then by UA+CR ascending.
Selected row: light purple background.
Owner and status: inline selects.

### 6. Action panel (conditional, shows on property click)
Two-column grid inside a panel on secondary background.

Left column:
- Property name (16px, weight 500)
- Category badge + city + unit count
- Two metric cards (UA and CR)
- "Playbook" section label + numbered list
- Owner and status dropdowns (side by side)
- "Internal notes" textarea

Right column:
- "AI-generated outreach" label + purple "AI draft" tag
- Draft display area (white background, thin border, pre-formatted)
  with bold subject line separated by a thin border
- Three buttons: "Open in mail client" (purple primary), "Copy"
  (outline), "Regenerate" (outline with refresh icon)

---

## Styling

Use Tailwind CSS. Light mode only for V1.

Key tokens:
- Primary accent: #534AB7 (purple)
- Font: system stack (-apple-system, BlinkMacSystemFont, etc.)
- Max width: 1200px, centered
- Border radius: rounded-md (6px) for controls, rounded-lg (8px) for panels
- Text: text-[13px] body, text-[11px] labels, text-lg title
- Borders: 0.5px (use border + border-opacity or ring if Tailwind lacks 0.5px)
- Backgrounds: white for page, gray-50 for panels and secondary surfaces

---

## README.md

### 1. Title + badges
H1: Pulse
Shields.io badges: React, TypeScript, Tailwind CSS, OpenRouter, Vite, Vercel

One paragraph: "Portfolio health scoring tool for B2B companies
that deploy AI products across multiple client accounts. Classifies
accounts into four health quadrants by user adoption and conversion
rate, surfaces a prioritized playbook per category, and generates
AI-drafted outreach emails. Built for the multifamily property
management industry where AI leasing tools are deployed across
hundreds of properties and a single customer success manager needs
to triage which accounts need attention, what kind, and what to say."

Links: Portfolio | Live Demo

### 2. Screenshot
Full-width screenshot placeholder

### 3. The problem
3-4 sentences. AI adoption in multifamily property management
jumped from 21% to 34% between 2024 and 2025. Companies deploy
leasing AI across hundreds of properties, but performance varies
wildly by account. A customer success manager owning 50 properties
spends an hour each morning assembling a picture of what needs
attention from three different systems. Pulse replaces that hour
with a five-minute prioritized queue.

### 4. How it works
Quadrant model, threshold sliders, playbooks, AI outreach.
Data flow: Upload CSV > Classify > Prioritize > Generate > Send.

### 5. AI integration
OpenRouter API call. System prompt. Contrast with template
approach. Fallback behavior.

### 6. Tech stack table
| Component | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Styling | Tailwind CSS |
| Visualization | Inline SVG |
| AI | OpenRouter (Gemini Flash 1.5 8B) |
| Data parsing | SheetJS + native CSV |
| Deployment | Vercel |

### 7. Quick start
```bash
git clone https://github.com/adarsh-rai-secure/pulse.git
cd pulse
npm install
cp .env.example .env  # add OpenRouter API key (optional)
npm run dev
```

### 8. Data format
Table: Property Name, City, Units, User Adoption (%), Conversion Rate (%), Notes

### 9. Author
Adarsh Rai, MS Information Security and Policy Management, Carnegie Mellon University
Portfolio | LinkedIn

### 10. License
MIT

---

## Deployment

vercel.json:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

Environment variable on Vercel: VITE_OPENROUTER_API_KEY

---

## Repository description
Portfolio health scoring tool for B2B AI companies. Classifies
client accounts into four health quadrants, surfaces playbooks,
and generates AI-drafted outreach via OpenRouter.

## Repository topics
react, typescript, tailwind-css, openrouter, vite, vercel,
proptech, customer-success, ai-engineering, data-visualization

---

## Commit messages (plain English, no conventional commits)
- "init vite react typescript project with tailwind"
- "add property types, classification logic, and category data"
- "build scatter plot component with quadrant backgrounds"
- "build case table with inline controls"
- "add action panel with playbook display"
- "add openrouter integration for AI outreach drafts"
- "add csv and excel upload with sheetjs"
- "add portfolio summary and filter bar"
- "write readme"
