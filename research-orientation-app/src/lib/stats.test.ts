import { describe as d, tTestIndependent, tTestPaired, anova, chiSquare, sampleSize, pearson, chiUpperP } from './stats';

test('descriptives', () => {
  const r = d([2, 4, 4, 4, 5, 5, 7, 9])!;
  expect(r.mean).toBe(5);
  expect(r.median).toBe(4.5);
  expect(r.mode).toEqual([4]);
  expect(r.sd).toBeCloseTo(2.138, 3);
});
test('welch t-test matches reference', () => {
  // Means 3 vs 5, SE = 1, so t = -2 on 8 df; two-tailed p = 0.0805
  const r = tTestIndependent([1, 2, 3, 4, 5], [3, 4, 5, 6, 7])!;
  expect(r.t).toBeCloseTo(-2, 3);
  expect(r.df).toBeCloseTo(8, 3);
  expect(r.p).toBeCloseTo(0.0805, 3);
});
test('paired t-test', () => {
  const r = tTestPaired([10, 12, 9, 14, 11], [13, 15, 10, 17, 12])!;
  expect(r.meanDiff).toBeCloseTo(2.2, 5);
  expect(r.t).toBeCloseTo(4.491, 2);
  expect(r.p).toBeCloseTo(0.0109, 3);
});
test('anova', () => {
  const r = anova([[1, 2, 3], [4, 5, 6], [7, 8, 9]])!;
  expect(r.F).toBeCloseTo(27, 5);
  expect(r.p).toBeCloseTo(0.00100, 4);
});
test('chi-square', () => {
  expect(chiUpperP(3.841, 1)).toBeCloseTo(0.05, 3);
  const r = chiSquare([[20, 30], [30, 20]])!;
  expect(r.x2).toBeCloseTo(4, 5);
});
test('sample size', () => {
  expect(sampleSize(0, '95', 0.05)).toBe(385);
  expect(sampleSize(1000, '95', 0.05)).toBe(278);
});
test('pearson', () => {
  expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])!.r).toBeCloseTo(1, 6);
});
