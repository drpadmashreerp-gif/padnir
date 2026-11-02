// Small, dependency-free statistics helpers used by the Tools page.

export const parseNums = (s: string): number[] =>
  s.split(/[\s,;]+/).map(Number).filter((n) => Number.isFinite(n) && s.trim() !== '');

export function describe(xs: number[]) {
  const n = xs.length;
  if (!n) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const variance = n > 1 ? xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const counts = new Map<number, number>();
  xs.forEach((x) => counts.set(x, (counts.get(x) || 0) + 1));
  const maxC = Math.max(...counts.values());
  const mode = maxC > 1 ? [...counts].filter(([, c]) => c === maxC).map(([v]) => v) : [];
  return { n, mean, median, mode, sd: Math.sqrt(variance), variance, min: sorted[0], max: sorted[n - 1] };
}

// ---- special functions ----
function gammaln(x: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5, ser = 1.000000000190015;
  tmp -= (x + 0.5) * Math.log(tmp);
  for (const ci of c) ser += ci / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}
function betacf(a: number, b: number, x: number) {
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
  let h = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; d = 1 / (Math.abs(d) < 1e-30 ? 1e-30 : d);
    c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < 3e-12) break;
  }
  return h;
}
/** Regularised incomplete beta I_x(a,b). */
export function ibeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}
/** Regularised lower incomplete gamma P(a,x). */
function gammp(a: number, x: number): number {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let sum = 1 / a, del = sum, ap = a;
    for (let i = 0; i < 500; i++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; }
    return sum * Math.exp(-x + a * Math.log(x) - gammaln(a));
  }
  let b = x + 1 - a, c = 1e30, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a); b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c; if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - gammaln(a)) * h;
}

export const tTwoTailedP = (t: number, df: number) => ibeta(df / (df + t * t), df / 2, 0.5);
export const fUpperP = (f: number, d1: number, d2: number) => ibeta(d2 / (d2 + d1 * f), d2 / 2, d1 / 2);
export const chiUpperP = (x: number, df: number) => 1 - gammp(df / 2, x / 2);

/** Welch's independent-samples t-test with Cohen's d. */
export function tTestIndependent(a: number[], b: number[]) {
  const A = describe(a), B = describe(b);
  if (!A || !B || A.n < 2 || B.n < 2) return null;
  const va = A.variance / A.n, vb = B.variance / B.n;
  const t = (A.mean - B.mean) / Math.sqrt(va + vb);
  const df = (va + vb) ** 2 / (va ** 2 / (A.n - 1) + vb ** 2 / (B.n - 1));
  const sp = Math.sqrt(((A.n - 1) * A.variance + (B.n - 1) * B.variance) / (A.n + B.n - 2));
  return { t, df, p: tTwoTailedP(t, df), d: (A.mean - B.mean) / sp, A, B };
}

/** Paired t-test (e.g. pre-test vs post-test for the same children). */
export function tTestPaired(pre: number[], post: number[]) {
  if (pre.length !== post.length || pre.length < 2) return null;
  const diff = post.map((v, i) => v - pre[i]);
  const D = describe(diff)!;
  const t = D.mean / (D.sd / Math.sqrt(D.n));
  return { t, df: D.n - 1, p: tTwoTailedP(t, D.n - 1), meanDiff: D.mean, d: D.mean / D.sd };
}

/** One-way ANOVA. */
export function anova(groups: number[][]) {
  const gs = groups.filter((g) => g.length > 0);
  const k = gs.length, N = gs.reduce((s, g) => s + g.length, 0);
  if (k < 2 || N - k < 1) return null;
  const grand = gs.flat().reduce((a, b) => a + b, 0) / N;
  let ssb = 0, ssw = 0;
  for (const g of gs) {
    const m = g.reduce((a, b) => a + b, 0) / g.length;
    ssb += g.length * (m - grand) ** 2;
    ssw += g.reduce((s, x) => s + (x - m) ** 2, 0);
  }
  const df1 = k - 1, df2 = N - k, F = ssb / df1 / (ssw / df2);
  return { F, df1, df2, p: fUpperP(F, df1, df2), eta2: ssb / (ssb + ssw) };
}

/** Chi-square test of independence on a contingency table. */
export function chiSquare(table: number[][]) {
  const r = table.length, c = table[0]?.length ?? 0;
  if (r < 2 || c < 2) return null;
  const rows = table.map((row) => row.reduce((a, b) => a + b, 0));
  const cols = table[0].map((_, j) => table.reduce((s, row) => s + row[j], 0));
  const N = rows.reduce((a, b) => a + b, 0);
  let x2 = 0, lowExpected = 0;
  table.forEach((row, i) => row.forEach((o, j) => {
    const e = (rows[i] * cols[j]) / N;
    if (e < 5) lowExpected++;
    x2 += (o - e) ** 2 / e;
  }));
  const df = (r - 1) * (c - 1);
  return { x2, df, p: chiUpperP(x2, df), cramerV: Math.sqrt(x2 / (N * (Math.min(r, c) - 1))), lowExpected };
}

const Z: Record<string, number> = { '90': 1.645, '95': 1.96, '99': 2.576 };
/** Sample size for estimating a proportion, with finite population correction. */
export function sampleSize(population: number, confidence: '90' | '95' | '99', margin: number, p = 0.5) {
  const z = Z[confidence];
  const n0 = (z * z * p * (1 - p)) / (margin * margin);
  return Math.ceil(population > 0 ? n0 / (1 + (n0 - 1) / population) : n0);
}

/** Pearson correlation. */
export function pearson(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return null;
  const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n, my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  const r = sxy / Math.sqrt(sxx * syy);
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  return { r, n, p: tTwoTailedP(t, n - 2) };
}

export const fmtP = (p: number) => (p < 0.001 ? '< .001' : p.toFixed(3).replace(/^0/, ''));
