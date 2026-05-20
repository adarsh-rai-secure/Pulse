import { SYSTEM_PROMPT, buildUserPrompt } from './promptBuilder';
import type { DraftInput } from './promptBuilder';
import type { DraftRecord } from '../types';
import { fallbackDraft } from './fallback';
import { splitSubjectAndBody } from './promptBuilder';

interface GenerateOptions {
  modelId: string;
  apiKey?: string;
  onToken?: (acc: string) => void;
  signal?: AbortSignal;
}

interface GenerateResult {
  record: DraftRecord;
  usedFallback: boolean;
  fallbackReason?: string;
}

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateDraft(
  input: DraftInput,
  opts: GenerateOptions
): Promise<GenerateResult> {
  const userPrompt = buildUserPrompt(input);
  const t0 = performance.now();

  const apiKey = opts.apiKey ?? import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    const text = fallbackDraft(input);
    const { subject, body } = splitSubjectAndBody(text);
    return {
      record: {
        draft: text,
        subject,
        body,
        model: 'fallback/template',
        latencyMs: Math.round(performance.now() - t0),
        promptTokens: estimateTokens(SYSTEM_PROMPT + userPrompt),
        completionTokens: estimateTokens(text),
        timestamp: Date.now(),
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        retrievedChunks: input.chunks,
      },
      usedFallback: true,
      fallbackReason: 'No API key configured',
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
        'X-Title': 'Pulse',
      },
      body: JSON.stringify({
        model: opts.modelId,
        stream: true,
        max_tokens: 500,
        temperature: 0.5,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`openrouter ${res.status}`);
    }

    const acc = await consumeStream(res.body, opts.onToken);
    const text = acc.text.trim();
    const { subject, body } = splitSubjectAndBody(text);
    return {
      record: {
        draft: text,
        subject,
        body,
        model: opts.modelId,
        latencyMs: Math.round(performance.now() - t0),
        promptTokens:
          acc.promptTokens || estimateTokens(SYSTEM_PROMPT + userPrompt),
        completionTokens: acc.completionTokens || estimateTokens(text),
        timestamp: Date.now(),
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        retrievedChunks: input.chunks,
      },
      usedFallback: false,
    };
  } catch (err) {
    const text = fallbackDraft(input);
    const { subject, body } = splitSubjectAndBody(text);
    return {
      record: {
        draft: text,
        subject,
        body,
        model: 'fallback/template',
        latencyMs: Math.round(performance.now() - t0),
        promptTokens: estimateTokens(SYSTEM_PROMPT + userPrompt),
        completionTokens: estimateTokens(text),
        timestamp: Date.now(),
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        retrievedChunks: input.chunks,
      },
      usedFallback: true,
      fallbackReason:
        err instanceof Error ? err.message : 'Unknown OpenRouter error',
    };
  }
}

interface StreamAccum {
  text: string;
  promptTokens: number;
  completionTokens: number;
}

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

function estimateTokens(s: string): number {
  return Math.ceil(s.length / 4);
}
