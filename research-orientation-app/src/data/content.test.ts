import { MODULES, PRE_ASSESSMENT, TOTAL_HOURS, PART_HOURS, PART_MODULES } from './modules';
import { KN, PRE_KN } from './modules.kn';

test('Part I is 60 hours in 12 chapters; Part II is 20 hours in 5 chapters', () => {
  expect(PART_MODULES(1)).toHaveLength(12);
  expect(PART_HOURS(1)).toBe(60);
  expect(PART_MODULES(2)).toHaveLength(5);
  expect(PART_HOURS(2)).toBe(20);
  expect(TOTAL_HOURS).toBe(80);
  expect(MODULES.map((m) => m.no)).toEqual(Array.from({ length: 17 }, (_, i) => i + 1));
});
test('every tool a chapter names exists', async () => {
  const { TOOL_META } = await import('../pages/Tools');
  for (const m of MODULES) { for (const t of m.tools) expect(TOOL_META[t], `${m.id} ${t}`).toBeDefined(); if (m.activity.tool) expect(TOOL_META[m.activity.tool]).toBeDefined(); }
});
test('Kannada edition mirrors English item for item', () => {
  for (const m of MODULES) {
    const k = KN[m.id];
    expect(k, m.id).toBeDefined();
    expect(k.objectives.length, `${m.id} objectives`).toBe(m.objectives.length);
    expect(k.lessons.length, `${m.id} lessons`).toBe(m.lessons.length);
    m.lessons.forEach((l, i) => expect(k.lessons[i].body.length, `${m.id} lesson ${i}`).toBe(l.body.length));
    expect(k.karnataka.length, `${m.id} examples`).toBe(m.karnataka.length);
    m.karnataka.forEach((e, i) => expect(k.karnataka[i].text.length, `${m.id} example ${i}`).toBe(e.text.length));
    expect(k.quiz.length, `${m.id} quiz`).toBe(m.quiz.length);
    m.quiz.forEach((q, i) => expect(k.quiz[i].options.length, `${m.id} q${i}`).toBe(q.options.length));
  }
  expect(PRE_KN.length).toBe(PRE_ASSESSMENT.length);
  PRE_ASSESSMENT.forEach((q, i) => expect(PRE_KN[i].options.length).toBe(q.options.length));
});
test('every quiz answer index is valid', () => {
  for (const q of [...MODULES.flatMap((m) => m.quiz), ...PRE_ASSESSMENT]) expect(q.options[q.answer]).toBeDefined();
});
