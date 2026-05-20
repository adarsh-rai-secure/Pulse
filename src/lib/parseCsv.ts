import * as XLSX from 'xlsx';
import type { Property } from '../types';

const HEADER_ALIASES: Record<string, keyof Property> = {
  'property name': 'name',
  property: 'name',
  name: 'name',
  city: 'city',
  units: 'units',
  'user adoption (%)': 'userAdoption',
  'user adoption': 'userAdoption',
  'user_adoption': 'userAdoption',
  adoption: 'userAdoption',
  ua: 'userAdoption',
  'conversion rate (%)': 'conversionRate',
  'conversion rate': 'conversionRate',
  conversion: 'conversionRate',
  cr: 'conversionRate',
  notes: 'notes',
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

export function parseCsvToProperties(csv: string): Property[] {
  const lines = csv
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headerCells = parseLine(lines[0]).map(normalize);
  const fieldMap: (keyof Property | null)[] = headerCells.map(
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
