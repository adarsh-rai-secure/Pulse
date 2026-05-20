import type { CategoryKey, Property, Thresholds } from '../types';
import { CATEGORIES } from '../data/categories';

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

export function classifyAll(
  properties: Property[],
  t: Thresholds
): Map<string, CategoryKey> {
  const m = new Map<string, CategoryKey>();
  for (const p of properties) {
    m.set(p.id, classify(p.userAdoption, p.conversionRate, t));
  }
  return m;
}

export interface QuadrantStats {
  total: number;
  byCategory: Record<CategoryKey, number>;
  avgUA: number;
  avgCR: number;
}

export function summarize(
  properties: Property[],
  t: Thresholds
): QuadrantStats {
  const byCategory = { churn: 0, stuck: 0, sleeping: 0, reference: 0 };
  let sumUA = 0;
  let sumCR = 0;
  for (const p of properties) {
    const k = classify(p.userAdoption, p.conversionRate, t);
    byCategory[k]++;
    sumUA += p.userAdoption;
    sumCR += p.conversionRate;
  }
  const n = properties.length || 1;
  return {
    total: properties.length,
    byCategory,
    avgUA: Math.round(sumUA / n),
    avgCR: Math.round(sumCR / n),
  };
}

export function sortForCaseTable(
  properties: Property[],
  t: Thresholds
): Property[] {
  const ranked = properties.map((p) => {
    const k = classify(p.userAdoption, p.conversionRate, t);
    return {
      p,
      priority: CATEGORIES[k].priority,
      severity: p.userAdoption + p.conversionRate,
    };
  });
  ranked.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.severity - b.severity;
  });
  return ranked.map((r) => r.p);
}
