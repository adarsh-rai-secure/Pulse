import type {
  CategoryKey,
  Property,
  RetrievedChunk,
  SimilarAccount,
  Thresholds,
} from '../types';
import { classify } from './classify';

const STOPWORDS = new Set([
  'a','an','and','or','the','of','in','on','at','to','for','with','by','from',
  'is','are','was','were','be','been','has','have','had','this','that','these',
  'those','it','its','as','but','not','no','if','then','so','than','too','very',
  'we','us','our','they','them','their','i','you','your','my','me','he','she',
  'will','would','could','should','can','may','might','do','does','did','done',
  'about','after','before','during','since','until','while','because','also',
  'still','just','only','very','more','most','some','any','all','out','up','down',
]);

function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[a-z][a-z0-9]+/g) ?? []).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t)
  );
}

interface DocStats {
  id: string;
  terms: Map<string, number>;
  length: number;
}

function termFreq(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

interface Corpus {
  docs: DocStats[];
  idf: Map<string, number>;
}

function buildCorpus(props: Property[]): Corpus {
  const docs: DocStats[] = props.map((p) => {
    const tokens = tokenize(`${p.name} ${p.city} ${p.notes}`);
    return { id: p.id, terms: termFreq(tokens), length: tokens.length };
  });
  const N = docs.length || 1;
  const df = new Map<string, number>();
  for (const d of docs) {
    for (const t of d.terms.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [t, c] of df) idf.set(t, Math.log((N + 1) / (c + 1)) + 1);
  return { docs, idf };
}

function tfidfVector(
  terms: Map<string, number>,
  length: number,
  idf: Map<string, number>
): Map<string, number> {
  const v = new Map<string, number>();
  for (const [t, c] of terms) {
    const tf = c / Math.max(1, length);
    const w = tf * (idf.get(t) ?? 1);
    v.set(t, w);
  }
  return v;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const w of a.values()) na += w * w;
  for (const w of b.values()) nb += w * w;
  for (const [t, wa] of a) {
    const wb = b.get(t);
    if (wb) dot += wa * wb;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function findSimilar(
  target: Property,
  pool: Property[],
  thresholds: Thresholds,
  k = 3
): SimilarAccount[] {
  const others = pool.filter((p) => p.id !== target.id);
  if (others.length === 0) return [];
  const corpus = buildCorpus([target, ...others]);
  const targetDoc = corpus.docs[0];
  const tv = tfidfVector(targetDoc.terms, targetDoc.length, corpus.idf);
  const targetCat = classify(
    target.userAdoption,
    target.conversionRate,
    thresholds
  );

  const scored: { p: Property; category: CategoryKey; score: number }[] = [];
  for (let i = 1; i < corpus.docs.length; i++) {
    const d = corpus.docs[i];
    const v = tfidfVector(d.terms, d.length, corpus.idf);
    const textScore = cosine(tv, v);
    const other = others[i - 1];
    const cat = classify(other.userAdoption, other.conversionRate, thresholds);
    const metricDist =
      Math.abs(other.userAdoption - target.userAdoption) +
      Math.abs(other.conversionRate - target.conversionRate);
    const metricScore = 1 / (1 + metricDist / 30);
    const sameCat = cat === targetCat ? 0.15 : 0;
    const score = textScore * 0.55 + metricScore * 0.3 + sameCat;
    if (score > 0.02) scored.push({ p: other, category: cat, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => ({
    propertyId: s.p.id,
    propertyName: s.p.name,
    category: s.category,
    score: Number(s.score.toFixed(3)),
  }));
}

export function chunkContext(p: Property): RetrievedChunk[] {
  const chunks: RetrievedChunk[] = [];
  chunks.push({
    source: 'account.profile',
    text: `${p.name} (${p.city}, ${p.units} units). Adoption ${p.userAdoption}%, conversion ${p.conversionRate}%.`,
    score: 1.0,
  });
  if (p.notes && p.notes.trim().length > 0) {
    chunks.push({
      source: 'account.notes',
      text: p.notes.trim(),
      score: 1.0,
    });
  }
  return chunks;
}
