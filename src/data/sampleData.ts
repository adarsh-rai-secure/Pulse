import classicCsv from './sample-portfolio.csv?raw';
import richCsv from './sample-portfolio-rich.csv?raw';
import { parseCsvToProperties } from '../lib/parseCsv';
import type { Property } from '../types';

export type SampleId = 'classic' | 'rich-notes';

export interface SampleDataset {
  id: SampleId;
  label: string;
  shortLabel: string;
  description: string;
  csv: string;
  accountCount: number;
  notesPerRow: 'sparse' | 'dense';
  filename: string;
}

function countRows(csv: string): number {
  const lines = csv.replace(/\r\n?/g, '\n').split('\n').filter((l) => l.trim());
  return Math.max(0, lines.length - 1);
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'classic',
    label: 'Mixed portfolio (52 accounts)',
    shortLabel: 'mixed-52',
    description:
      'Balanced spread across all four health groups. Some accounts have notes, most do not, which mirrors what a real CSV pulled from a CRM usually looks like.',
    csv: classicCsv,
    accountCount: countRows(classicCsv),
    notesPerRow: 'sparse',
    filename: 'sample portfolio (mixed)',
  },
  {
    id: 'rich-notes',
    label: 'Rich context (25 accounts, every row noted)',
    shortLabel: 'rich-notes-25',
    description:
      'Smaller portfolio where every account has detailed customer-success notes. The AI draft engine has much more to work with on each property, so this is the best dataset for seeing how Pulse grounds outreach in real account context.',
    csv: richCsv,
    accountCount: countRows(richCsv),
    notesPerRow: 'dense',
    filename: 'sample portfolio (rich notes)',
  },
];

export function getSample(id: SampleId): SampleDataset {
  return SAMPLE_DATASETS.find((s) => s.id === id) ?? SAMPLE_DATASETS[0];
}

export function loadSampleById(id: SampleId): Property[] {
  return parseCsvToProperties(getSample(id).csv);
}

export const DEFAULT_SAMPLE_ID: SampleId = 'classic';

// Legacy exports kept for any callers that still want a single bundled sample.
export function loadSampleProperties(): Property[] {
  return loadSampleById(DEFAULT_SAMPLE_ID);
}

export const SAMPLE_CSV_TEXT = classicCsv;
