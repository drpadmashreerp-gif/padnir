import { writeFileSync } from 'node:fs';
import { corrMatrix, kmoBartlett, principalAxis, varimax, eigenSym, cronbachAlpha, crAve, judgeFit, mediation, shape, parseTable } from './multivariate';
import { trseData, mediationCsv } from '../data/samples';

const data = trseData();
const R = corrMatrix(data);

test('eigenvalues of the TRSE correlation matrix sum to the number of items', () => {
  const { values } = eigenSym(R);
  expect(values.reduce((a, b) => a + b, 0)).toBeCloseTo(12, 6);
  expect(values.filter((v) => v > 1)).toHaveLength(3);
});
test('KMO and Bartlett are in the expected range for the sample', () => {
  const r = kmoBartlett(R, data.length);
  expect(r.kmo).toBeGreaterThan(0.8);
  expect(r.df).toBe(66);
  expect(r.chi2).toBeGreaterThan(500);
});
test('PAF + varimax recovers the three intended factors', () => {
  const { loadings } = principalAxis(R, 3);
  const rot = varimax(loadings);
  const owner = rot.map((row) => row.indexOf(Math.max(...row)));
  expect(new Set(owner.slice(0, 4)).size).toBe(1);
  expect(new Set(owner.slice(4, 8)).size).toBe(1);
  expect(new Set(owner.slice(8, 12)).size).toBe(1);
  expect(new Set([owner[0], owner[4], owner[8]]).size).toBe(3);
  // rotation keeps communalities
  loadings.forEach((row, i) => expect(row.reduce((a, x) => a + x * x, 0)).toBeCloseTo(rot[i].reduce((a, x) => a + x * x, 0), 6));
});
test('reliability and validity indices', () => {
  expect(cronbachAlpha([[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 4, 4], [5, 5, 5]])).toBeCloseTo(0.9, 1);
  const r = crAve([0.8, 0.8, 0.8]);
  expect(r.ave).toBeCloseTo(0.64, 6);
  expect(r.cr).toBeCloseTo(0.842, 3);
});
test('fit judgement computes RMSEA when missing', () => {
  const f = judgeFit({ chi2: 85.2, df: 51, n: 220, cfi: 0.97, tli: 0.96, srmr: 0.045 });
  expect(f.rmsea).toBeCloseTo(0.0553, 3);
  expect(f.rows.every((r) => r.verdict === 'good')).toBe(true);
});
test('mediation finds a positive indirect effect with a CI above zero', () => {
  const t = parseTable(mediationCsv())!;
  const r = mediation(t.rows.map((x) => x[0]), t.rows.map((x) => x[1]), t.rows.map((x) => x[2]), 1000);
  expect(r.indirect).toBeGreaterThan(0);
  expect(r.ciLow).toBeGreaterThan(0);
  expect(r.c).toBeCloseTo(r.cPrime + r.indirect, 6); // total = direct + indirect for OLS
});
test('skewness and kurtosis of a symmetric sample', () => {
  const s = shape([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(s.skew).toBeCloseTo(0, 10);
  expect(s.kurt).toBeCloseTo(-1.2, 1);
});
test('export sample for numpy cross-check', () => {
  const pa = principalAxis(R, 3); const kb = kmoBartlett(R, data.length);
  writeFileSync(process.env.MV_OUT ?? '/dev/null', JSON.stringify({ data, kmo: kb.kmo, chi2: kb.chi2, eig: eigenSym(R).values, comm: pa.communalities, alpha: cronbachAlpha(data.map((r) => r.slice(0, 4))) }));
});
