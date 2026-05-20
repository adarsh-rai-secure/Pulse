import sampleCsv from './sample-portfolio.csv?raw';
import { parseCsvToProperties } from '../lib/parseCsv';
import type { Property } from '../types';

export function loadSampleProperties(): Property[] {
  return parseCsvToProperties(sampleCsv);
}

export const SAMPLE_CSV_TEXT = sampleCsv;
