import { MODULES, PRE_ASSESSMENT, TOTAL_HOURS } from './modules';
import { KN, PRE_KN } from './modules.kn';

test('course totals 60 hours across 12 chapters', () => {
  expect(MODULES).toHaveLength(12);
  expect(TOTAL_HOURS).toBe(60);
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
