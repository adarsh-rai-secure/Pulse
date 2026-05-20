# Pulse: Scope Document

## The problem

Multifamily property management companies deploy AI leasing tools
across dozens or hundreds of properties. The tools automate lead
intake, tour scheduling, and follow-ups. AI adoption in this sector
jumped from 21% to 34% between 2024 and 2025. 85% of operators
who deploy AI report better lead-to-lease conversion.

But performance varies wildly across properties. At one property,
the leasing team uses the AI platform daily and converts 38% of
leads into tours. At the next property, the same software sits
untouched and converts at 4%. Same product. Different outcomes.

The person responsible for figuring out why is a customer success
manager. One customer success manager at a company like EliseAI
owns 40 to 60 property accounts. Every morning they open three
different systems: one for platform usage data, one for conversion
metrics, one for support tickets. By the time they have assembled
a picture of which properties need attention, an hour is gone.
Then they have to decide what kind of attention each property needs.

Is it a training problem? The leasing team does not know how to use
the tool. Is it a technical problem? The AI is misconfigured or the
integration is broken. Is it a relationship problem? The client is
disengaging and might not renew. Or is it a success story that
should be turned into a case study and a referral?

Each diagnosis leads to a different owner, a different playbook,
and a different email. Most customer success teams solve this with
a shared spreadsheet. They color-code rows, write notes in a doc,
and draft outreach from scratch every time. It works at 15 accounts.
It breaks at 50.

Pulse replaces that spreadsheet.

---

## What Pulse does

You upload your portfolio data: property name, user adoption
percentage, and lead conversion rate. Pulse classifies every
property into one of four health quadrants:

**Churn risk.** Low adoption, low conversion. Nobody uses the
product and it is not producing results. This is a save-or-lose
situation that needs someone on the phone within a week.

**Stuck.** High adoption, low conversion. The team uses the
platform actively, but leads are not converting. This is a
technical problem: something in the AI configuration, the
integration, or the lead source mapping is broken. Route it to the
solutions engineering team, not the account manager.

**Sleeping champion.** Low adoption, high conversion. The product
converts well, but the leasing team barely touches it. This is the
highest-upside category in the portfolio. Get more people on the
team using it and the numbers double without changing the product.

**Reference.** High adoption, high conversion. Both numbers are
green. These accounts are the engine for expansion, case studies,
and referrals.

Each category maps to a default owner, a step-by-step playbook,
and an AI-generated outreach draft. The account manager clicks a
property, reads the draft, edits it, and sends it. The AI writes
the first version using the property's actual metrics, category,
and any notes the account manager has added. That cuts daily triage
from an hour of spreadsheet work to five minutes reviewing a
prioritized queue.

---

## The 90-second pitch

"AI leasing tools get deployed across hundreds of apartment
properties, and the adoption curve looks different at every single
one. One property converts 38% of leads. The next one, running the
same software, converts 4%. The customer success team has to figure
out which accounts need help, what kind of help, and what to say.
At 50 accounts, a spreadsheet does not cut it.

Pulse is a portfolio health tool that fixes this. Upload two
metrics per property: how much the leasing team uses the platform,
and how many AI-handled leads convert. Pulse classifies every
property into one of four health quadrants. Churn risk means
nobody uses it and nothing converts: schedule a save call. Stuck
means the team uses it but leads are not converting: that is a
technical problem, route it to solutions engineering. Sleeping
champion means the product converts well but the team barely
touches it: run a training session. Reference means both numbers
are green: ask for a referral.

Each category comes with a playbook and an AI-generated outreach
draft written from the property's actual numbers and any notes the
account manager has added. Click, review, edit, send. Five minutes
instead of an hour.

I built the first version during a practical assessment for a
PropTech company. They asked for a Retool dashboard. I built a
standalone tool with AI-generated outreach and deployed it."

---

## Where AI fits (the defensible answer)

The outreach draft is not a template with variables swapped in.
A template says: "Hi [name], your adoption is [X]% and conversion
is [Y]%." That is a mail merge.

The AI draft says: "Your leasing team at Parkview Commons uses the
platform 72% of the time, but only 8% of leads are converting.
That pattern usually points to a configuration issue, not a
training gap. I want to pull 25 recent conversations that did not
convert and tag the failure mode before we talk. Could I get
30 minutes with your ops lead this Thursday?"

The difference: the AI reasons about what the numbers mean in
context, incorporates the account manager's notes, and generates a
specific ask. The account manager reads it, decides whether the
diagnosis is right, edits the tone, and sends it. Human judgment
stays in the loop. The AI removes the blank page problem.

This is the same human-AI teaming pattern I built in Argus CTI,
where the system generates intelligence reports and the analyst
reviews before sign-off. Different domain. Same interaction model.

---

## Feature scope

### Must have (V1)

1. Four-quadrant classification with adjustable thresholds
2. Pre-loaded demo dataset (you build this as a CSV)
3. CSV/Excel upload to replace demo data
4. Interactive SVG scatter plot with clickable dots
5. Case table with inline owner/status/search/filter
6. Action panel with playbook, owner, status, notes
7. AI-generated outreach drafts via OpenRouter
8. Fallback to template-based drafts when API is unavailable
9. Portfolio summary bar (total, per-quadrant counts, averages)
10. Deployed on Vercel with live demo URL

### Should have (V1 if time)

1. AI account diagnosis (2-3 sentence hypothesis on click)
2. Export filtered table as CSV
3. Reference guide panel with category/role definitions

### Nice to have (V2)

1. Natural language data queries ("show me stuck accounts in TX")
2. Historical trend tracking across multiple uploads

### Cut

- Real-time API integration (paid, fragile)
- User authentication
- Database persistence
- Multi-dataset mode

---

## Dataset spec (you build this)

Create a CSV with these columns:

| Column | Type | Range |
|---|---|---|
| Property Name | string | Realistic multifamily names |
| City | string | Real U.S. city, state abbreviation |
| Units | integer | 80-400 |
| User Adoption (%) | integer | 1-99 |
| Conversion Rate (%) | integer | 1-50 |
| Notes | string (optional) | Short account manager observations |

Target distribution at default thresholds (UA=30, CR=20):

| Quadrant | Count | UA range | CR range |
|---|---|---|---|
| Churn risk | 12-15 | 2-28 | 1-18 |
| Stuck | 8-10 | 35-95 | 2-18 |
| Sleeping champion | 8-10 | 3-28 | 22-48 |
| Reference | 15-18 | 35-98 | 22-50 |

Add notes to 12-15 properties. Examples:
- "Client point of contact changed last month. New contact has not
  responded to two outreach attempts."
- "Training session completed April 8. Adoption up 12 points but
  still below target."
- "Renewed for 2 years in March. Strong case study candidate."
- "Support ticket open for API integration failure. SE investigating."
- "Leasing team prefers phone calls. Regional manager is supportive."

These notes feed into the AI draft and make the demo feel real.

---

## OpenRouter integration

Endpoint: https://openrouter.ai/api/v1/chat/completions
Auth: Bearer token via environment variable (VITE_OPENROUTER_API_KEY)

```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
    'HTTP-Referer': 'https://pulse-deploy.vercel.app',
    'X-Title': 'Pulse'
  },
  body: JSON.stringify({
    model: 'google/gemini-flash-1.5-8b',  // or cheapest available
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(input) }
    ],
    max_tokens: 500
  })
});
```

System prompt for outreach generation:
```
You are a customer success manager at a B2B SaaS company that
sells AI-powered leasing tools to multifamily property management
companies. You are drafting an outreach email for a specific
property account.

Write a professional, warm, direct email. No corporate jargon.

The email should:
- Reference the property by name and city
- Cite the specific adoption and conversion numbers
- Diagnose what the numbers likely mean for this category
- Make a specific ask (meeting, review, referral) based on the
  playbook
- Sound like a real person wrote it, not a template

For "stuck" accounts: write the email as an INTERNAL ticket to the
solutions engineering team, not to the client.

Format: Start with "Subject: ..." on the first line, then a blank
line, then the email body. Keep it under 200 words.
```

Fallback: if the API key is missing or the call fails, generate a
template-based draft using the same logic as the original Property
Oracle HTML (string concatenation with property metrics).

---

## UI architecture

### Color system
- Purple (#534AB7) as primary accent (logo, active states, AI tag)
- Red for churn risk quadrant and badges
- Amber for stuck quadrant and badges
- Purple (lighter) for sleeping champion quadrant and badges
- Green for reference quadrant and badges
- Gray backgrounds for panels and controls

### Layout (top to bottom)
1. **Header bar:** Pulse logo (purple square with heartbeat icon) +
   title + subtitle. Right side: upload CSV button, reference guide
   button, user chip.

2. **Summary cards:** 4-column grid. Total properties, churn risk
   count (with trend indicator), average adoption, average
   conversion. Update on threshold change and data upload.

3. **Main area:** 2-column grid.
   - Left (narrow, ~180px): threshold sliders for user adoption and
     conversion rate, with helper text.
   - Right (wide): SVG scatter plot with colored quadrant
     backgrounds, dashed threshold lines, clickable dots, quadrant
     labels with counts.

4. **Filter bar:** Owner dropdown, search input, "show completed"
   checkbox.

5. **Case table:** Property name, UA%, CR%, health badge, next step,
   owner (inline select), status (inline select). Rows are clickable.
   Selected row highlighted in light purple.

6. **Action panel** (appears on row/dot click): Two-column layout.
   - Left: property name, city, units, category badge, metric cards
     (UA and CR), step-by-step playbook, owner selector, status
     selector, notes textarea.
   - Right: AI-generated outreach draft with subject line, body,
     and three buttons: "Open in mail client" (primary purple),
     "Copy" (outline), "Regenerate" (outline).

### Typography
- Title: 18px, weight 500
- Body: 13px, weight 400
- Labels: 11px, uppercase, letter-spacing 0.04em, secondary color
- Metric values: 20px in summary cards, 16px in action panel

### Interactions
- Slider drag: re-classify all properties, update scatter, table,
  summary, and action panel in real time
- Dot click: select property, highlight in table, open action panel,
  smooth scroll to panel
- Row click: same as dot click
- Upload: parse file, replace dataset, reset selections
- Generate AI draft: show loading spinner, call OpenRouter, display
  result. Regenerate calls again with fresh request.
- Copy: clipboard API, button text changes to "Copied" for 1.5s
- Open in mail: mailto: link with subject and body pre-filled

---

## Interview defense points

Q: "Why not use a real database?"
A: "The data source for this tool is a CRM export. The customer
success team pulls a CSV from Salesforce or HubSpot, uploads it,
and works through the queue. Adding a database adds authentication,
migrations, and hosting costs without changing what the user
actually does. If the team grows past 20 people or needs audit
trails, Supabase is a one-day addition."

Q: "How is the AI draft different from a template?"
A: "Templates swap variables. The AI reasons about what the numbers
mean. A property with 72% adoption and 8% conversion has a
different problem than one with 5% adoption and 2% conversion, even
though both might land in similar quadrants. The AI draft
incorporates the account manager's notes, the specific metrics, and
the category playbook to produce an email that reads like someone
wrote it after thinking about the account."

Q: "What would you change for production?"
A: "Three things. Persistent storage so case status and notes
survive across sessions. CRM integration so the tool pulls metrics
automatically instead of requiring a manual upload. A feedback loop
where the account manager rates each AI draft so the prompts
improve over time."

---

## Origin story (for portfolio page and README)

I built the first version of this tool during a practical
assessment for EliseAI, a company that makes AI leasing tools for
multifamily property management. The assessment asked me to build
a Retool dashboard that filters properties by adoption and
conversion rate.

I did not build a Retool dashboard. I built a standalone tool with
a quadrant classification engine, interactive scatter plot, case
management workflow, and AI-generated outreach. Then I deployed it.

The original version had EliseAI branding and hardcoded team names.
Pulse is the generalized version: any B2B company with account
health data can upload a CSV and start using it.
