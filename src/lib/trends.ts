import type { Property } from '../types';

// Deterministic synthetic 8-week history per (property, metric).
// Walks backwards from current value with small jitter so the chart looks
// believable. The same property always produces the same history.

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

export interface MetricTrend {
  values: number[]; // 8 weeks, oldest first, newest last
  delta: number; // current - 8 weeks ago
}

export interface PropertyTrend {
  ua: MetricTrend;
  cr: MetricTrend;
}

const HISTORY_WEEKS = 8;

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

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
