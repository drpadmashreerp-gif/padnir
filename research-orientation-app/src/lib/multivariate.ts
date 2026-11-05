// Multivariate helpers for Part II: data screening, reliability, EFA, CFA indices, SEM fit and mediation.
// Pure functions, no dependencies; checked against numpy in multivariate.test.ts.

export type Matrix = number[][];

export const mean = (x: number[]) => x.reduce((a, b) => a + b, 0) / x.length;
export const sd = (x: number[]) => { const m = mean(x); return Math.sqrt(x.reduce((a, b) => a + (b - m) ** 2, 0) / (x.length - 1)); };

/** Sample skewness and excess kurtosis (bias-adjusted, as reported by SPSS). */
export function shape(x: number[]) {
  const n = x.length, m = mean(x), s = sd(x);
  const m3 = x.reduce((a, v) => a + ((v - m) / s) ** 3, 0), m4 = x.reduce((a, v) => a + ((v - m) / s) ** 4, 0);
  const skew = (n / ((n - 1) * (n - 2))) * m3;
  const kurt = ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * m4 - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return { skew, kurt };
}

/** Cronbach's alpha for items in columns (complete rows only). */
export function cronbachAlpha(items: Matrix) {
  const k = items[0].length; const cols = Array.from({ length: k }, (_, j) => items.map((r) => r[j]));
  const itemVar = cols.reduce((a, c) => a + sd(c) ** 2, 0);
  const totalVar = sd(items.map((r) => r.reduce((a, b) => a + b, 0))) ** 2;
  return (k / (k - 1)) * (1 - itemVar / totalVar);
}

export function corrMatrix(data: Matrix): Matrix {
  const p = data[0].length; const cols = Array.from({ length: p }, (_, j) => data.map((r) => r[j]));
  const ms = cols.map(mean), ss = cols.map(sd), n = data.length;
  return cols.map((a, i) => cols.map((b, j) => (i === j ? 1 : a.reduce((acc, v, t) => acc + (v - ms[i]) * (b[t] - ms[j]), 0) / ((n - 1) * ss[i] * ss[j]))));
}

/** Inverse and log-determinant by Gauss–Jordan elimination with partial pivoting. */
export function invert(A: Matrix): { inv: Matrix; logDet: number } {
  const n = A.length; const M = A.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  let logDet = 0;
  for (let c = 0; c < n; c++) {
    let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-12) throw new Error('Matrix is singular (two items may be identical or perfectly related).');
    [M[c], M[piv]] = [M[piv], M[c]];
    const d = M[c][c]; logDet += Math.log(Math.abs(d));
    for (let j = 0; j < 2 * n; j++) M[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c]; if (f) for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j]; }
  }
  return { inv: M.map((r) => r.slice(n)), logDet };
}

/** Eigen-decomposition of a symmetric matrix (cyclic Jacobi). Values sorted descending; vectors in columns. */
export function eigenSym(A: Matrix) {
  const n = A.length; const a = A.map((r) => [...r]); const v: number[][] = a.map((_, i) => a.map((__, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] ** 2;
    if (off < 1e-20) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(a[p][q]) < 1e-15) continue;
      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < n; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq; }
    }
  }
  const order = a.map((r, i) => [r[i], i] as const).sort((x, y) => y[0] - x[0]);
  return { values: order.map(([val]) => val), vectors: v.map((row) => order.map(([, i]) => row[i])) };
}

/** Kaiser–Meyer–Olkin measure (overall and per item) and Bartlett's test of sphericity. */
export function kmoBartlett(R: Matrix, n: number) {
  const p = R.length; const { inv, logDet } = invert(R);
  const partial = R.map((_, i) => R.map((__, j) => -inv[i][j] / Math.sqrt(inv[i][i] * inv[j][j])));
  let r2 = 0, q2 = 0; const perItem: number[] = [];
  for (let i = 0; i < p; i++) {
    let ri = 0, qi = 0;
    for (let j = 0; j < p; j++) if (i !== j) { ri += R[i][j] ** 2; qi += partial[i][j] ** 2; }
    perItem.push(ri / (ri + qi)); r2 += ri; q2 += qi;
  }
  const chi2 = -(n - 1 - (2 * p + 5) / 6) * logDet, df = (p * (p - 1)) / 2;
  return { kmo: r2 / (r2 + q2), perItem, chi2, df };
}

/** Principal axis factoring with iterated communalities (starting from squared multiple correlations). */
export function principalAxis(R: Matrix, k: number, iterations = 100) {
  const p = R.length; const { inv } = invert(R);
  let h = R.map((_, i) => Math.max(0.005, 1 - 1 / inv[i][i]));
  let L: Matrix = [];
  for (let it = 0; it < iterations; it++) {
    const Rr = R.map((r, i) => r.map((v, j) => (i === j ? h[i] : v)));
    const { values, vectors } = eigenSym(Rr);
    L = Array.from({ length: p }, (_, i) => Array.from({ length: k }, (__, f) => vectors[i][f] * Math.sqrt(Math.max(values[f], 0))));
    const hNew = L.map((row) => Math.min(0.999, row.reduce((a, x) => a + x * x, 0)));
    const change = Math.max(...hNew.map((x, i) => Math.abs(x - h[i]))); h = hNew;
    if (change < 1e-6) break;
  }
  return { loadings: L, communalities: h };
}

/** Varimax rotation with Kaiser normalisation (as in SPSS). */
export function varimax(L: Matrix, maxIter = 500): Matrix {
  const p = L.length, k = L[0].length; if (k < 2) return L;
  const hn = L.map((r) => Math.sqrt(r.reduce((a, x) => a + x * x, 0)) || 1);
  const A = L.map((r, i) => r.map((x) => x / hn[i]));
  for (let it = 0; it < maxIter; it++) {
    let changed = false;
    for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
      let U = 0, V = 0, C = 0, D = 0;
      for (let i = 0; i < p; i++) { const u = A[i][a] ** 2 - A[i][b] ** 2, v = 2 * A[i][a] * A[i][b]; U += u; V += v; C += u * u - v * v; D += 2 * u * v; }
      const phi = Math.atan2(D - (2 * U * V) / p, C - (U * U - V * V) / p) / 4;
      if (Math.abs(phi) > 1e-10) {
        changed = true; const c = Math.cos(phi), s = Math.sin(phi);
        for (let i = 0; i < p; i++) { const x = A[i][a], y = A[i][b]; A[i][a] = c * x + s * y; A[i][b] = -s * x + c * y; }
      }
    }
    if (!changed) break;
  }
  // sign convention: make each factor's largest loadings positive; order factors by explained variance
  const out = A.map((r, i) => r.map((x) => x * hn[i]));
  for (let f = 0; f < k; f++) if (out.reduce((s, r) => s + r[f], 0) < 0) out.forEach((r) => (r[f] = -r[f]));
  const ss = Array.from({ length: k }, (_, f) => out.reduce((s, r) => s + r[f] ** 2, 0));
  const order = ss.map((v, f) => [v, f]).sort((x, y) => y[0] - x[0]).map(([, f]) => f);
  return out.map((r) => order.map((f) => r[f]));
}

/** Composite reliability and average variance extracted from standardised loadings. */
export function crAve(loadings: number[]) {
  const sum = loadings.reduce((a, b) => a + b, 0), err = loadings.reduce((a, l) => a + (1 - l * l), 0);
  return { cr: sum ** 2 / (sum ** 2 + err), ave: loadings.reduce((a, l) => a + l * l, 0) / loadings.length };
}

/** Fit-index verdicts using widely cited cut-offs (Hu & Bentler, 1999; Kline, 2016). */
export function judgeFit(f: { chi2?: number; df?: number; n?: number; cfi?: number; tli?: number; rmsea?: number; srmr?: number }) {
  const rmsea = f.rmsea ?? (f.chi2 !== undefined && f.df && f.n ? Math.sqrt(Math.max(f.chi2 - f.df, 0) / (f.df * (f.n - 1))) : undefined);
  const rows: { index: string; value?: number; rule: string; verdict: 'good' | 'acceptable' | 'poor' | 'n/a' }[] = [];
  const add = (index: string, value: number | undefined, rule: string, good: (v: number) => boolean, ok: (v: number) => boolean) =>
    rows.push({ index, value, rule, verdict: value === undefined || Number.isNaN(value) ? 'n/a' : good(value) ? 'good' : ok(value) ? 'acceptable' : 'poor' });
  const ratio = f.chi2 !== undefined && f.df ? f.chi2 / f.df : undefined;
  add('χ²/df', ratio, '≤ 3 good, ≤ 5 acceptable', (v) => v <= 3, (v) => v <= 5);
  add('CFI', f.cfi, '≥ .95 good, ≥ .90 acceptable', (v) => v >= 0.95, (v) => v >= 0.9);
  add('TLI', f.tli, '≥ .95 good, ≥ .90 acceptable', (v) => v >= 0.95, (v) => v >= 0.9);
  add('RMSEA', rmsea, '≤ .06 good, ≤ .08 acceptable', (v) => v <= 0.06, (v) => v <= 0.08);
  add('SRMR', f.srmr, '≤ .08 good, ≤ .10 acceptable', (v) => v <= 0.08, (v) => v <= 0.1);
  return { rows, rmsea };
}

/** Least squares with an intercept: returns coefficients [b0, b1, ...]. */
export function ols(y: number[], X: Matrix): number[] {
  const Z = X.map((r) => [1, ...r]); const k = Z[0].length;
  const XtX = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (__, j) => Z.reduce((a, r) => a + r[i] * r[j], 0)));
  const Xty = Array.from({ length: k }, (_, i) => Z.reduce((a, r, t) => a + r[i] * y[t], 0));
  const { inv } = invert(XtX);
  return inv.map((row) => row.reduce((a, v, j) => a + v * Xty[j], 0));
}

/** Simple mediation X → M → Y with a percentile bootstrap CI for the indirect effect. */
export function mediation(x: number[], m: number[], y: number[], boots = 2000, seed = 7) {
  const est = (xs: number[], ms: number[], ys: number[]) => {
    const a = ols(ms, xs.map((v) => [v]))[1];
    const [, cPrime, b] = ols(ys, xs.map((v, i) => [v, ms[i]]));
    const c = ols(ys, xs.map((v) => [v]))[1];
    return { a, b, cPrime, c, indirect: a * b };
  };
  const base = est(x, m, y); const n = x.length; let s = seed;
  const rand = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const ind: number[] = [];
  for (let r = 0; r < boots; r++) {
    const idx = Array.from({ length: n }, () => Math.floor(rand() * n));
    try { ind.push(est(idx.map((i) => x[i]), idx.map((i) => m[i]), idx.map((i) => y[i])).indirect); } catch { /* skip degenerate resample */ }
  }
  ind.sort((p, q) => p - q);
  return { ...base, ciLow: ind[Math.floor(0.025 * ind.length)], ciHigh: ind[Math.ceil(0.975 * ind.length) - 1], boots: ind.length };
}

/** Deterministic pseudo-random normal numbers for sample datasets. */
export function seededNormal(seed: number) {
  let s = seed >>> 0;
  const u = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s + 0.5) / 4294967296; };
  return () => Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u());
}

/** Parses pasted CSV / tab-separated text with a header row. Blank or non-numeric cells become NaN (missing). */
export function parseTable(text: string) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return null;
  const sep = lines[0].includes('\t') ? '\t' : ',';
  const header = lines[0].split(sep).map((h) => h.trim());
  const rows = lines.slice(1).map((l) => { const c = l.split(sep); return header.map((_, j) => { const v = (c[j] ?? '').trim(); return v === '' ? NaN : Number(v); }); });
  return { header, rows };
}
