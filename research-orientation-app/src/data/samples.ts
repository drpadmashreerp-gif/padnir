// Illustrative datasets for the Part II tools (generated, not real survey data).
import { seededNormal } from '../lib/multivariate';

/** Teacher Research Self-Efficacy (TRSE) scale: 12 Likert items (1–5), three intended factors. */
export const TRSE_ITEMS = [
  ['PF1', 'I can turn a classroom concern into a researchable question.'],
  ['PF2', 'I can find studies related to my research problem.'],
  ['PF3', 'I can write clear objectives and hypotheses.'],
  ['PF4', 'I can choose a design that fits my question.'],
  ['DA1', 'I can enter and clean survey data in a spreadsheet.'],
  ['DA2', 'I can choose a suitable statistical test.'],
  ['DA3', 'I can interpret a p-value and an effect size.'],
  ['DA4', 'I can code interview data into themes.'],
  ['RC1', 'I can write a research report in a standard structure.'],
  ['RC2', 'I can present findings to teachers and officers.'],
  ['RC3', 'I can prepare a two-page policy brief.'],
  ['RC4', 'I can submit a paper to a peer-reviewed journal.'],
] as const;

const clip = (v: number) => Math.min(5, Math.max(1, Math.round(v)));

export function trseData(n = 220, seed = 2026): number[][] {
  const z = seededNormal(seed);
  const rows: number[][] = [];
  for (let i = 0; i < n; i++) {
    const g = z();                                     // general research confidence
    const f = [0.6 * g + 0.8 * z(), 0.6 * g + 0.8 * z(), 0.6 * g + 0.8 * z()];
    const load = [0.85, 0.8, 0.75, 0.7];
    rows.push(f.flatMap((fi) => load.map((l) => clip(3.1 + 0.95 * (l * fi + Math.sqrt(1 - l * l) * z())))));
  }
  return rows;
}

export const toCsv = (header: readonly string[], rows: (number | string)[][]) =>
  [header.join(','), ...rows.map((r) => r.map((v) => (typeof v === 'number' && Number.isNaN(v) ? '' : v)).join(','))].join('\n');

/** TRSE data with typical problems added for the screening exercise. */
export function screeningCsv() {
  const rows: number[][] = trseData(60, 11).map((r) => r.slice(0, 6));
  rows[3][2] = NaN; rows[17][0] = NaN; rows[17][5] = NaN; rows[40][4] = NaN;   // missing answers
  rows[9] = [5, 5, 5, 5, 5, 5];                                               // straight-lining
  rows[25][1] = 9;                                                            // data-entry error outside 1–5
  rows[52] = [1, 1, 1, 1, 1, 1];
  return toCsv(TRSE_ITEMS.slice(0, 6).map(([k]) => k), rows);
}

/** DIET support (X) → research self-efficacy (M) → research engagement (Y), n = 200. */
export function mediationCsv() {
  const z = seededNormal(77); const rows: number[][] = [];
  for (let i = 0; i < 200; i++) {
    const x = z(); const m = 0.5 * x + 0.85 * z(); const y = 0.45 * m + 0.15 * x + 0.85 * z();
    rows.push([+(3 + 0.8 * x).toFixed(2), +(3.2 + 0.7 * m).toFixed(2), +(2.9 + 0.75 * y).toFixed(2)]);
  }
  return toCsv(['diet_support', 'self_efficacy', 'engagement'], rows);
}
