import type { CategoryKey, Property } from '../types';
import { CATEGORIES } from '../data/categories';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are an analyst at a B2B SaaS company that sells AI leasing tools to multifamily property managers. Given a single account's metrics and notes, write a 2-3 sentence root-cause hypothesis.

Rules:
- Be specific. Reference the actual numbers and notes.
- Don't restate the category label.
- Lead with the most likely cause.
- If notes are empty, say what you'd need to confirm.
- Plain prose. No bullet points. Under 60 words.
- Do not invent facts. Only use what's in the snapshot.`;

export interface DiagnosisInput {
  property: Property;
  category: CategoryKey;
  caseNotes: string;
}

export interface DiagnosisResult {
  text: string;
  model: string;
  latencyMs: number;
  usedFallback: boolean;
}

export interface DiagnosisOptions {
  modelId: string;
  apiKey?: string;
  signal?: AbortSignal;
}

export async function generateDiagnosis(
  input: DiagnosisInput,
  opts: DiagnosisOptions
): Promise<DiagnosisResult> {
  const t0 = performance.now();
  const apiKey = opts.apiKey ?? import.meta.env.VITE_OPENROUTER_API_KEY;
  const prompt = buildPrompt(input);

  if (!apiKey) {
    return {
      text: fallbackDiagnosis(input),
      model: 'fallback/template',
      latencyMs: Math.round(performance.now() - t0),
      usedFallback: true,
    };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: opts.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Pulse (diagnosis)',
      },
      body: JSON.stringify({
        model: opts.modelId,
        stream: false,
        max_tokens: 180,
        temperature: 0.4,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`openrouter ${res.status}`);
    const data = await res.json();
    const text: string =
      data?.choices?.[0]?.message?.content?.trim() ?? fallbackDiagnosis(input);
    return {
      text,
      model: opts.modelId,
      latencyMs: Math.round(performance.now() - t0),
      usedFallback: false,
    };
  } catch {
    return {
      text: fallbackDiagnosis(input),
      model: 'fallback/template',
      latencyMs: Math.round(performance.now() - t0),
      usedFallback: true,
    };
  }
}

function buildPrompt(input: DiagnosisInput): string {
  const cat = CATEGORIES[input.category];
  const notes = (input.caseNotes || input.property.notes || '').trim();
  return [
    `Property: ${input.property.name}, ${input.property.city}, ${input.property.units} units`,
    `User adoption: ${input.property.userAdoption}%`,
    `Conversion rate: ${input.property.conversionRate}%`,
    `Health group: ${cat.label}`,
    `Notes: ${notes || '(none)'}`,
    '',
    'Write the 2-3 sentence root-cause hypothesis now.',
  ].join('\n');
}

function fallbackDiagnosis(input: DiagnosisInput): string {
  const { property, category } = input;
  const notes = (input.caseNotes || property.notes || '').trim();
  const notesFrag = notes
    ? ` Notes on file: "${notes.length > 90 ? notes.slice(0, 87) + '…' : notes}"`
    : ` No internal notes yet — first step is to pull the last 30 days of platform sessions to confirm the diagnosis.`;
  switch (category) {
    case 'churn':
      return `Adoption at ${property.userAdoption}% with conversion at ${property.conversionRate}% means almost nobody is logging in and nothing the tool produces is closing. Likely a combination of stalled onboarding and the leasing team falling back on manual processes.${notesFrag}`;
    case 'stuck':
      return `${property.userAdoption}% adoption is healthy on its own, but ${property.conversionRate}% conversion is well below what comparable accounts produce. Almost always a configuration or routing issue downstream of the AI rather than a training gap.${notesFrag}`;
    case 'sleeping':
      return `${property.conversionRate}% conversion at only ${property.userAdoption}% adoption is the textbook sleeping-champion shape: the product is doing the work, the team isn't on it. A single internal champion plus a focused training session is usually enough to double the account's effective output.${notesFrag}`;
    case 'reference':
      return `${property.userAdoption}% adoption and ${property.conversionRate}% conversion both well above target. The team has internalized the workflow. Best use of this account right now is a referral conversation and a case study.${notesFrag}`;
  }
}
