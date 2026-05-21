# Pulse

Portfolio health scoring for B2B AI deployments. Classifies client accounts into four quadrants by user adoption and AI conversion rate, surfaces a playbook per quadrant, and uses an LLM to draft outreach grounded in each account's real numbers and notes.

Built for the multifamily PropTech world, where AI leasing tools get deployed across dozens to hundreds of properties and a single customer success manager has to figure out who needs attention, what kind, and what to say.

![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-streaming-7F77DD)

## The problem

You sell one AI product to fifty different clients. Adoption looks wildly different at every one. Property A converts 38% of leads. Property B, running the same software, converts 4%. A single customer success manager owns 40-60 of these accounts and burns an hour every morning piecing together which ones need help.

Pulse replaces that hour with a five-minute prioritized queue.

## How it works

1. **Upload your portfolio CSV** (or use the bundled 52-account sample). Columns: property name, city, units, user adoption %, conversion rate %, notes.
2. **Threshold sliders** classify every account into one of four quadrants in real time:
   - **Churn risk**: low UA, low CR. Save call this week.
   - **Stuck**: high UA, low CR. Technical problem. Route to solutions engineering.
   - **Sleeping champion**: low UA, high CR. The product is doing the work without the team. Train and amplify.
   - **Reference**: high UA, high CR. Ask for a referral, open expansion.
3. **Click any account.** Pulse surfaces the playbook, the recommended owner, and an AI-drafted outreach email written from the account's numbers and notes.
4. **The CSM reads, edits, and sends** via mailto or copy.

## The AI engineering

This is not a template engine. The draft generation pipeline does what a real RAG system does, sized for the data on hand.

| Layer | What it does |
|---|---|
| **Chunking** | Each account is decomposed into `account.profile` and `account.notes` chunks. |
| **Retrieval** | TF-IDF over the corpus + cosine similarity finds the top 3 similar accounts. Score is blended with metric distance and category match. |
| **Prompt assembly** | System prompt fixes the role and rules. User prompt injects retrieved chunks, similar accounts, account snapshot, thresholds in use, the playbook, and the CSM's identity. |
| **Generation** | OpenRouter chat completions with `stream: true`. Tokens render live with a blinking caret. |
| **Persistence** | All cases, notes, and drafts go to localStorage under `pulse.*` keys. Pinned drafts ("golden examples") are kept separately. |
| **Observability** | Dev panel exposes the exact system+user prompts, model ID, latency, token counts, and a model picker with per-100-query cost. |
| **Fallback** | If the API key is missing or the call fails, deterministic templates produce a category-appropriate email so the demo never goes dark. |

## Tech stack

| Component | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS 3 (light theme only) |
| Charting | Inline SVG, no D3 |
| Data parsing | Native CSV + SheetJS (`xlsx`) for Excel |
| LLM | OpenRouter (Gemini, GPT-4o-mini, Claude Haiku 4.5, Sonnet 4.6) |
| Storage | `localStorage`-backed RAG store |
| Hosting | Vercel |

## Quick start

```bash
git clone https://github.com/adarsh-rai-secure/pulse.git
cd pulse
npm install
cp .env.example .env   # add VITE_OPENROUTER_API_KEY (optional)
npm run dev
```

Then open http://localhost:5173.

## Data format

```
Property Name,City,Units,User Adoption (%),Conversion Rate (%),Notes
The Belmonte,"Miami, FL",346,93,48,Highest conversion in the portfolio. Weekly self-run optimization reviews.
Ironwood Flats,"Phoenix, AZ",264,3,1,Contract is up in 90 days. No engagement since January.
```

Shorthand `UA` and `CR` headers also work. Excel files (`.xlsx`, `.xls`) are supported via SheetJS.

## Deployment

```bash
npm run build
```

A `vercel.json` is included. Add `VITE_OPENROUTER_API_KEY` as an environment variable on Vercel (Project → Settings → Environment Variables). Without it, drafts fall back to the deterministic templates.

A session cap (50 generations per browser per 24h) is enforced in `src/lib/sessionCap.ts` to keep demo costs bounded.

## Project layout

```
src/
  components/      React UI
  data/            Categories, team, bundled sample CSV
  hooks/           useLocalStorage
  lib/             classify, parseCsv, tfidf, openrouter, fallback,
                   models, ragStore, sessionCap, promptBuilder
  App.tsx          Top-level state + composition
  types.ts         Shared types
docs/              Build prompt and scope document
archive/           Original Property Oracle HTML prototype
```

## Author

Built by [Adarsh Rai](https://github.com/adarsh-rai-secure), MS Information Security and Policy Management, Carnegie Mellon University. The first version of this tool was a vanilla-JS prototype I built during a practical assessment. The archived prototype is in [archive/property-oracle.html](archive/property-oracle.html). Pulse is the rebuilt version.

## License

MIT
