import type {
  CategoryKey,
  Property,
  RetrievedChunk,
  SimilarAccount,
} from '../types';
import { CATEGORIES } from '../data/categories';

export const SYSTEM_PROMPT = `You are a customer success manager at a B2B SaaS company that sells AI-powered leasing tools to multifamily property management companies. You draft outreach for a specific property account.

Rules:
- Reference the property by name and city
- Cite the adoption and conversion numbers exactly as given
- Diagnose what those numbers mean for this account's category
- Make one specific ask (meeting, review, referral) drawn from the playbook
- Sound like a real person wrote this, not a template
- For "stuck" accounts: write an INTERNAL ticket to the solutions engineering team, not the client
- First line is "Subject: ...", then one blank line, then the body
- Keep it under 200 words
- Do not invent metrics, dates, or names that were not provided`;

export interface DraftInput {
  property: Property;
  category: CategoryKey;
  ownerName: string;
  ownerRole: string;
  chunks: RetrievedChunk[];
  similar: SimilarAccount[];
  thresholds: { ua: number; cr: number };
  handoffReasonLabel?: string;
  handoffReasonHint?: string;
  handoffNote?: string;
}

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
  lines.push(`Category: ${cat.label} — ${cat.description}`);
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

export function splitSubjectAndBody(text: string): {
  subject: string;
  body: string;
} {
  const trimmed = text.trim();
  const subjMatch = trimmed.match(/^subject:\s*(.+?)(?:\n|$)/i);
  if (!subjMatch) return { subject: '(no subject)', body: trimmed };
  const subject = subjMatch[1].trim();
  const body = trimmed.slice(subjMatch[0].length).trim();
  return { subject, body };
}
