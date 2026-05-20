import type { CategoryKey, Property, Thresholds } from '../types';
import { classify } from './classify';
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories';
import { TEAM } from '../data/team';
import { expandLocation, stateCodeFromQuery } from './states';

interface CaseLite {
  ownerId: string;
  notes: string;
}

interface SearchableAccount {
  property: Property;
  category: CategoryKey;
  haystack: string;
  state: string | null;
  ownerId: string;
}

export function buildIndex(
  properties: Property[],
  thresholds: Thresholds,
  cases: Record<string, CaseLite | undefined>
): SearchableAccount[] {
  return properties.map((p) => {
    const category = classify(p.userAdoption, p.conversionRate, thresholds);
    const cat = CATEGORIES[category];
    const cs = cases[p.id];
    const ownerName =
      TEAM.find((t) => t.id === (cs?.ownerId ?? cat.defaultOwner))?.name ?? '';
    const stateMatch = p.city.trim().match(/[A-Za-z]{2}\s*$/);
    const stateCode = stateMatch ? stateMatch[0].toUpperCase() : null;

    const parts = [
      p.name,
      expandLocation(p.city),
      p.notes ?? '',
      cs?.notes ?? '',
      cat.label,
      category,
      ownerName,
    ];
    return {
      property: p,
      category,
      haystack: parts.join(' ').toLowerCase(),
      state: stateCode,
      ownerId: cs?.ownerId ?? cat.defaultOwner,
    };
  });
}

const QUADRANT_ALIASES: Record<string, CategoryKey> = {
  churn: 'churn',
  'churn-risk': 'churn',
  'churn risk': 'churn',
  risk: 'churn',
  stuck: 'stuck',
  technical: 'stuck',
  sleeping: 'sleeping',
  'sleeping-champion': 'sleeping',
  'sleeping champion': 'sleeping',
  champion: 'sleeping',
  reference: 'reference',
  ref: 'reference',
  healthy: 'reference',
};

interface ParsedToken {
  raw: string;
  kind: 'free' | 'quadrant' | 'state' | 'owner' | 'metric';
  value: string;
  meta?: { op?: '<' | '>' | '='; field?: 'ua' | 'cr'; n?: number };
}

function parseTokens(query: string): ParsedToken[] {
  if (!query.trim()) return [];
  // Split on whitespace but keep quoted phrases intact
  const rough =
    query.toLowerCase().match(/"[^"]+"|\S+/g) ?? [];
  const out: ParsedToken[] = [];
  for (const tok of rough) {
    const clean = tok.replace(/^"|"$/g, '').trim();
    if (!clean) continue;

    const metric = clean.match(/^(ua|cr)([<>=])(\d+)$/);
    if (metric) {
      out.push({
        raw: tok,
        kind: 'metric',
        value: clean,
        meta: {
          field: metric[1] as 'ua' | 'cr',
          op: metric[2] as '<' | '>' | '=',
          n: Number(metric[3]),
        },
      });
      continue;
    }

    const ownerMatch = clean.match(/^owner:(.+)$/);
    if (ownerMatch) {
      out.push({ raw: tok, kind: 'owner', value: ownerMatch[1] });
      continue;
    }

    const state = stateCodeFromQuery(clean);
    if (state) {
      out.push({ raw: tok, kind: 'state', value: state });
      continue;
    }

    const cat = QUADRANT_ALIASES[clean];
    if (cat) {
      out.push({ raw: tok, kind: 'quadrant', value: cat });
      continue;
    }

    out.push({ raw: tok, kind: 'free', value: clean });
  }
  return out;
}

export interface SearchHit {
  property: Property;
  category: CategoryKey;
  ownerId: string;
}

export function searchAccounts(
  index: SearchableAccount[],
  query: string,
  filters: {
    ownerFilter: string;
    categoryFilter: CategoryKey | 'all';
    hideCompleted: boolean;
    completedIds: Set<string>;
  }
): SearchHit[] {
  const tokens = parseTokens(query);
  return index
    .filter((row) => {
      if (filters.hideCompleted && filters.completedIds.has(row.property.id)) {
        return false;
      }
      if (filters.ownerFilter !== 'all' && row.ownerId !== filters.ownerFilter) {
        return false;
      }
      if (
        filters.categoryFilter !== 'all' &&
        row.category !== filters.categoryFilter
      ) {
        return false;
      }
      if (tokens.length === 0) return true;

      for (const t of tokens) {
        switch (t.kind) {
          case 'state':
            if (row.state !== t.value) return false;
            break;
          case 'quadrant':
            if (row.category !== t.value) return false;
            break;
          case 'owner': {
            const member = TEAM.find(
              (m) =>
                m.id === t.value ||
                m.name.toLowerCase().includes(t.value)
            );
            if (!member || row.ownerId !== member.id) return false;
            break;
          }
          case 'metric': {
            const v =
              t.meta?.field === 'ua'
                ? row.property.userAdoption
                : row.property.conversionRate;
            const n = t.meta?.n ?? 0;
            if (t.meta?.op === '<' && !(v < n)) return false;
            if (t.meta?.op === '>' && !(v > n)) return false;
            if (t.meta?.op === '=' && v !== n) return false;
            break;
          }
          case 'free':
          default:
            if (!row.haystack.includes(t.value)) return false;
            break;
        }
      }
      return true;
    })
    .map((row) => ({
      property: row.property,
      category: row.category,
      ownerId: row.ownerId,
    }));
}

export const SEARCH_HINTS = [
  { token: 'TX', meaning: 'all accounts in Texas (state code or name)' },
  { token: 'churn', meaning: 'only churn-risk accounts' },
  { token: 'stuck', meaning: 'only stuck accounts' },
  { token: 'sleeping', meaning: 'only sleeping champions' },
  { token: 'reference', meaning: 'only reference accounts' },
  { token: 'owner:alex', meaning: 'accounts owned by Alex' },
  { token: 'ua<10', meaning: 'user adoption below 10%' },
  { token: 'cr>30', meaning: 'conversion rate above 30%' },
];

export const CATEGORY_KEYS_FOR_SEARCH = CATEGORY_ORDER;
