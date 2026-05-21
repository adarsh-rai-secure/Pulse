import { useEffect, useRef, useState } from 'react';
import type { CategoryKey, Property } from '../types';
import { generateDiagnosis } from '../lib/generateDiagnosis';
import { getCapState, incrementCap } from '../lib/sessionCap';
import { InfoTip } from './InfoTip';

interface Cached {
  text: string;
  model: string;
  latencyMs: number;
  usedFallback: boolean;
}

interface Props {
  property: Property;
  category: CategoryKey;
  caseNotes: string;
  modelId: string;
}

const CACHE_KEY = 'pulse.diagnoses.v1';

function readCache(): Record<string, Cached> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function writeCache(map: Record<string, Cached>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // quota
  }
}

function cacheKey(p: Property, caseNotes: string): string {
  return `${p.id}|ua${p.userAdoption}|cr${p.conversionRate}|n${(caseNotes || p.notes || '').length}`;
}

export function DiagnosisChip({ property, category, caseNotes, modelId }: Props) {
  const [result, setResult] = useState<Cached | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const key = cacheKey(property, caseNotes);

  useEffect(() => {
    abortRef.current?.abort();
    setLoading(false);
    setResult(null);

    const cached = readCache()[key];
    if (cached) {
      setResult(cached);
      return;
    }

    // Auto-run on selection. Respects session cap.
    const state = getCapState();
    if (state.remaining === 0) return;

    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      const r = await generateDiagnosis(
        { property, category, caseNotes },
        { modelId, signal: ctrl.signal }
      );
      if (ctrl.signal.aborted) return;
      if (!r.usedFallback) incrementCap();
      const next: Cached = {
        text: r.text,
        model: r.model,
        latencyMs: r.latencyMs,
        usedFallback: r.usedFallback,
      };
      const all = readCache();
      all[key] = next;
      writeCache(all);
      setResult(next);
      setLoading(false);
    })();

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, modelId]);

  function regenerate() {
    const all = readCache();
    delete all[key];
    writeCache(all);
    setResult(null);
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    (async () => {
      const state = getCapState();
      if (state.remaining === 0) {
        setLoading(false);
        return;
      }
      const r = await generateDiagnosis(
        { property, category, caseNotes },
        { modelId, signal: ctrl.signal }
      );
      if (ctrl.signal.aborted) return;
      if (!r.usedFallback) incrementCap();
      const next: Cached = {
        text: r.text,
        model: r.model,
        latencyMs: r.latencyMs,
        usedFallback: r.usedFallback,
      };
      const cache = readCache();
      cache[key] = next;
      writeCache(cache);
      setResult(next);
      setLoading(false);
    })();
  }

  return (
    <div className="bg-brand-50/60 border border-brand-200 rounded-md p-2.5">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className="label-eyebrow text-brand-700">AI diagnosis</span>
          <InfoTip
            text="A separate, lighter model call that produces a 2-3 sentence hypothesis about WHY this account is in its current state. Runs once per (account, metrics, notes) and is cached in localStorage."
            side="bottom"
          />
        </div>
        {result && (
          <button
            onClick={regenerate}
            disabled={loading}
            className="text-2xs text-brand-700 hover:text-brand-900 underline underline-offset-2 disabled:opacity-40"
          >
            regenerate
          </button>
        )}
      </div>
      {loading && !result && (
        <div className="text-2xs text-ink-500 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Analyzing this account…
        </div>
      )}
      {result && (
        <>
          <p className="text-13 text-ink-900 leading-snug">{result.text}</p>
          <div className="text-2xs font-mono text-ink-400 mt-1">
            {result.model} · {result.latencyMs}ms
            {result.usedFallback && ' · fallback'}
          </div>
        </>
      )}
      {!loading && !result && (
        <p className="text-2xs text-ink-500">
          Diagnosis paused: session cap reached.
        </p>
      )}
    </div>
  );
}
