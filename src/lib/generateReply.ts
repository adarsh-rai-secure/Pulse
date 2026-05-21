import type {
  CategoryKey,
  DraftRecord,
  Property,
  ReplyRecord,
  ReplyTone,
} from '../types';
import { CATEGORIES } from '../data/categories';
import { splitSubjectAndBody } from './promptBuilder';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are the client recipient of an outreach email about an AI leasing tool deployed at one of your apartment properties. You are a property manager or regional VP at a multifamily real estate company. Reply to the email you received.

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
- negative: be polite but cold; cite a constraint (busy, mid-quarter, recent leadership change) or disagree with the diagnosis; do not commit to anything`;

const TONE_WEIGHTS: Record<CategoryKey, [number, number, number]> = {
  // [positive, neutral, negative]
  churn: [0.1, 0.3, 0.6],
  stuck: [0.25, 0.4, 0.35],
  sleeping: [0.6, 0.3, 0.1],
  reference: [0.75, 0.2, 0.05],
};

function pickTone(category: CategoryKey, seed: number): ReplyTone {
  const [p, n] = TONE_WEIGHTS[category];
  const r = mulberry32(seed)();
  if (r < p) return 'positive';
  if (r < p + n) return 'neutral';
  return 'negative';
}

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

export interface ReplyInput {
  property: Property;
  category: CategoryKey;
  draft: DraftRecord;
}

export interface ReplyOptions {
  modelId: string;
  apiKey?: string;
  signal?: AbortSignal;
  onToken?: (acc: string) => void;
}

export async function generateReply(
  input: ReplyInput,
  opts: ReplyOptions
): Promise<ReplyRecord> {
  const seed = hashString(input.property.id + ':' + input.draft.timestamp);
  const tone = pickTone(input.category, seed);
  const t0 = performance.now();

  const userPrompt = buildPrompt(input, tone);
  const apiKey = opts.apiKey ?? import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    return fallback(input, tone, t0, 'No API key configured');
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: opts.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Pulse (reply simulation)',
      },
      body: JSON.stringify({
        model: opts.modelId,
        stream: true,
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok || !res.body) throw new Error(`openrouter ${res.status}`);
    const text = await consumeStream(res.body, opts.onToken);
    const trimmed = text.trim();
    const { subject, body } = splitSubjectAndBody(trimmed);
    return {
      propertyId: input.property.id,
      toDraftTimestamp: input.draft.timestamp,
      subject,
      body,
      raw: trimmed,
      tone,
      model: opts.modelId,
      latencyMs: Math.round(performance.now() - t0),
      timestamp: Date.now(),
      usedFallback: false,
    };
  } catch {
    return fallback(input, tone, t0, 'OpenRouter call failed');
  }
}

function buildPrompt(input: ReplyInput, tone: ReplyTone): string {
  const cat = CATEGORIES[input.category];
  return [
    `You received this email from a customer success rep at the AI vendor.`,
    `Subject: ${input.draft.subject}`,
    ``,
    input.draft.body,
    ``,
    `---`,
    `Reply tone: ${tone.toUpperCase()}`,
    `Your role: ${roleFor(tone)} at ${input.property.name} (${input.property.city}, ${input.property.units} units).`,
    `Health context (for your awareness, do not mention by name): ${cat.label}. The vendor sees adoption at ${input.property.userAdoption}% and conversion at ${input.property.conversionRate}%.`,
    `Write your reply now.`,
  ].join('\n');
}

function roleFor(tone: ReplyTone): string {
  if (tone === 'positive') return 'Property manager who actively uses the platform';
  if (tone === 'neutral') return 'Regional manager who is on the fence';
  return 'Regional VP who is skeptical of the vendor';
}

async function consumeStream(
  body: ReadableStream<Uint8Array>,
  onToken?: (acc: string) => void
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
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
        if (typeof delta === 'string') {
          text += delta;
          onToken?.(text);
        }
      } catch {
        // ignore
      }
    }
  }
  return text;
}

function fallback(
  input: ReplyInput,
  tone: ReplyTone,
  t0: number,
  _reason: string
): ReplyRecord {
  const body = templateBody(input, tone);
  const subject = `Re: ${input.draft.subject}`;
  const raw = `Subject: ${subject}\n\n${body}`;
  return {
    propertyId: input.property.id,
    toDraftTimestamp: input.draft.timestamp,
    subject,
    body,
    raw,
    tone,
    model: 'fallback/template',
    latencyMs: Math.round(performance.now() - t0),
    timestamp: Date.now(),
    usedFallback: true,
  };
}

function templateBody(input: ReplyInput, tone: ReplyTone): string {
  const name = input.property.name;
  switch (tone) {
    case 'positive':
      return `Thanks for the note. Thursday afternoon works on my end. Let's say 2pm. I'll loop in our leasing lead at ${name}. Glad you're keeping an eye on the numbers; we've been trying to figure out why the early-week tours don't close.\n\nJ. Morales`;
    case 'neutral':
      return `Appreciate the outreach. Before I commit to a time, can you send the actual conversation logs you mentioned? I want to look at the failure modes myself first. We had a leadership change in February and I'm being careful about putting more on my team's plate without context.\n\nP. Chang`;
    case 'negative':
      return `Got the note. I'll be honest, I'm not sure this is the right week. We're mid-quarter, the regional team has been focused on other vendor reviews, and I don't have a strong read on whether the tool is the issue or the new lead sources. Let's circle back after our QBR next month.\n\nD. Reilly`;
  }
}
