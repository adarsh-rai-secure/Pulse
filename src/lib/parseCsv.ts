import * as XLSX from 'xlsx';
import type { Property } from '../types';

const HEADER_ALIASES: Record<string, FieldKey> = {
  'property name': 'name',
  property: 'name',
  name: 'name',
  account: 'name',
  'account name': 'name',
  city: 'city',
  location: 'city',
  market: 'city',
  units: 'units',
  'unit count': 'units',
  doors: 'units',
  'user adoption (%)': 'userAdoption',
  'user adoption': 'userAdoption',
  'user_adoption': 'userAdoption',
  adoption: 'userAdoption',
  usage: 'userAdoption',
  ua: 'userAdoption',
  'conversion rate (%)': 'conversionRate',
  'conversion rate': 'conversionRate',
  conversion: 'conversionRate',
  cr: 'conversionRate',
  'close rate': 'conversionRate',
  notes: 'notes',
  comments: 'notes',
  context: 'notes',
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let buf = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuote) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          buf += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        buf += c;
      }
    } else if (c === ',') {
      out.push(buf);
      buf = '';
    } else if (c === '"') {
      inQuote = true;
    } else {
      buf += c;
    }
  }
  out.push(buf);
  return out;
}

export interface RawTable {
  headers: string[];
  rows: string[][];
}

export function parseRawTable(csv: string): RawTable {
  const lines = csv
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);
  if (lines.length < 1) return { headers: [], rows: [] };
  const headers = parseLine(lines[0]).map((s) => s.trim());
  const rows = lines.slice(1).map((l) => parseLine(l));
  return { headers, rows };
}

export type FieldKey =
  | 'name'
  | 'city'
  | 'units'
  | 'userAdoption'
  | 'conversionRate'
  | 'notes';

export const REQUIRED_FIELDS: FieldKey[] = [
  'name',
  'userAdoption',
  'conversionRate',
];

export const FIELD_LABELS: Record<FieldKey, string> = {
  name: 'Property name',
  city: 'City',
  units: 'Units',
  userAdoption: 'User adoption (%)',
  conversionRate: 'Conversion rate (%)',
  notes: 'Notes',
};

export function autoDetectMapping(headers: string[]): Record<FieldKey, number> {
  const map: Partial<Record<FieldKey, number>> = {};
  headers.forEach((h, i) => {
    const key = HEADER_ALIASES[normalize(h)];
    if (key && map[key] === undefined) map[key] = i;
  });
  return {
    name: map.name ?? -1,
    city: map.city ?? -1,
    units: map.units ?? -1,
    userAdoption: map.userAdoption ?? -1,
    conversionRate: map.conversionRate ?? -1,
    notes: map.notes ?? -1,
  };
}

export function applyMapping(
  table: RawTable,
  mapping: Record<FieldKey, number>
): Property[] {
  const props: Property[] = [];
  table.rows.forEach((cells, r) => {
    const name = mapping.name >= 0 ? (cells[mapping.name] ?? '').trim() : '';
    if (!name) return;
    const num = (idx: number) => {
      if (idx < 0) return 0;
      const v = (cells[idx] ?? '').trim();
      const n = Number(v.replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(n) ? Math.round(n) : 0;
    };
    const text = (idx: number) =>
      idx < 0 ? '' : (cells[idx] ?? '').trim();

    props.push({
      id: slug(name) || `row-${r + 1}`,
      name,
      city: text(mapping.city),
      units: num(mapping.units),
      userAdoption: clamp(num(mapping.userAdoption), 0, 100),
      conversionRate: clamp(num(mapping.conversionRate), 0, 100),
      notes: text(mapping.notes),
    });
  });
  return props;
}

export function parseCsvToProperties(csv: string): Property[] {
  const lines = csv
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headerCells = parseLine(lines[0]).map(normalize);
  const fieldMap: (FieldKey | null)[] = headerCells.map(
    (h) => HEADER_ALIASES[h] ?? null
  );

  const props: Property[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = parseLine(lines[r]);
    const draft: Partial<Property> = { notes: '' };
    cells.forEach((raw, i) => {
      const key = fieldMap[i];
      if (!key) return;
      const v = raw.trim();
      if (key === 'units' || key === 'userAdoption' || key === 'conversionRate') {
        const n = Number(v.replace(/[^0-9.\-]/g, ''));
        draft[key] = Number.isFinite(n) ? Math.round(n) : 0;
      } else {
        draft[key] = v;
      }
    });
    if (!draft.name) continue;
    props.push({
      id: slug(draft.name) || `row-${r}`,
      name: draft.name,
      city: draft.city ?? '',
      units: draft.units ?? 0,
      userAdoption: clamp(draft.userAdoption ?? 0, 0, 100),
      conversionRate: clamp(draft.conversionRate ?? 0, 0, 100),
      notes: draft.notes ?? '',
    });
  }
  return props;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export async function parseFileToProperties(file: File): Promise<Property[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(ws);
    return parseCsvToProperties(csv);
  }
  const text = await file.text();
  return parseCsvToProperties(text);
}

export async function readFileAsTable(file: File): Promise<RawTable> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(ws);
    return parseRawTable(csv);
  }
  const text = await file.text();
  return parseRawTable(text);
}

export function propertiesToCsv(props: Property[]): string {
  const header =
    'Property Name,City,Units,User Adoption (%),Conversion Rate (%),Notes';
  const rows = props.map((p) => {
    const esc = (s: string) =>
      /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    return [
      esc(p.name),
      esc(p.city),
      String(p.units),
      String(p.userAdoption),
      String(p.conversionRate),
      esc(p.notes),
    ].join(',');
  });
  return [header, ...rows].join('\n');
}
