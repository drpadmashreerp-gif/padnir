import { mergeStates } from './merge';
import { initial, State } from './store';

const base = (p: Partial<State>): State => ({ ...initial, ...p });

test('keeps the best of both copies', () => {
  const local = base({ updatedAt: 100, quiz: { m1: 50, m2: 100 }, pagesRead: { m1: [0, 1] }, notes: { m1: 'local note' }, bookmarks: ['m1:0'], fontSize: 18,
    journal: [{ date: 'd1', stage: 'Plan', text: 'a' }] });
  const remote = base({ updatedAt: 200, quiz: { m1: 75 }, pagesRead: { m1: [1, 2], m3: [0] }, notes: { m1: '', m2: 'remote note' }, bookmarks: ['m2:1'], fontSize: 20,
    journal: [{ date: 'd1', stage: 'Plan', text: 'a' }, { date: 'd2', stage: 'Act', text: 'b' }] });
  const m = mergeStates(local, remote);
  expect(m.quiz).toEqual({ m1: 75, m2: 100 });
  expect(m.pagesRead).toEqual({ m1: [0, 1, 2], m3: [0] });
  expect(m.notes).toEqual({ m1: 'local note', m2: 'remote note' });
  expect(m.bookmarks.sort()).toEqual(['m1:0', 'm2:1']);
  expect(m.journal).toHaveLength(2);
  expect(m.fontSize).toBe(20); // newer copy wins settings
  expect(m.updatedAt).toBe(200);
});
test('an empty online copy leaves local work untouched', () => {
  const local = base({ quiz: { m1: 90 } });
  expect(mergeStates(local, {})).toBe(local);
  expect(mergeStates(local, null)).toBe(local);
});
test('submissions keep facilitator feedback', () => {
  const local = base({ updatedAt: 300, submissions: [{ id: 'a', moduleId: 'm1', text: 'edited', date: 'x' }] });
  const remote = base({ updatedAt: 100, submissions: [{ id: 'a', moduleId: 'm1', text: 'old', date: 'x', feedback: 'Good' }] });
  expect(mergeStates(local, remote).submissions).toEqual([{ id: 'a', moduleId: 'm1', text: 'edited', date: 'x', feedback: 'Good' }]);
});
