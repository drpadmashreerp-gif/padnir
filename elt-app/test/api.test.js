// Run: npm test  (uses a temporary store file)
const test = require('node:test');
const assert = require('node:assert');
const os = require('os'), path = require('path'), fs = require('fs');
process.env.STORE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'elt-')), 'store.json');
const server = require('../server');

let base;
test.before(() => new Promise(r => server.listen(0, () => { base = `http://localhost:${server.address().port}`; r(); })));
test.after(() => server.close());
const get = p => fetch(base + p).then(r => r.json());
const post = (p, b) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json());

test('content: manifest, all 100 units, glossary, IPA', async () => {
  assert.strictEqual((await get('/api/manifest')).length, 100);
  for (const n of [1, 4, 50, 100]) assert.strictEqual((await get('/api/units/' + n)).points.length, 8);
  assert.ok((await get('/api/glossary')).length > 800);
  const ipa = await get('/api/ipa');
  assert.strictEqual(ipa.monophthongs.length + ipa.diphthongs.length + ipa.consonants.length, 44);
});

test('unit self-check is marked by the server and recorded', async () => {
  const q = await get('/api/units/4/quiz?salt=7');
  assert.strictEqual(q.questions.length, 13);
  assert.ok(!('ans' in q.questions[0]));
  const r = await post('/api/units/4/quiz/check', { learner: 'Asha', salt: 7, answers: q.questions.map(() => 0) });
  assert.strictEqual(r.total, 13);
  const st = await get('/api/state?learner=Asha');
  assert.strictEqual(st.attempts[0].activity, 'unit-4');
});

test('every Phonetics Lab activity marks correct answers as correct', async () => {
  for (const t of (await get('/api/lab')).map(x => x.type)) {
    const q = await get(`/api/lab/${t}?n=5`);
    const first = await post(`/api/lab/${t}/check`, { answers: q.questions.map(x => ({ id: x.id, answer: x.options[0] })) });
    const right = await post(`/api/lab/${t}/check`, { answers: first.results.map(r => ({ id: r.id, answer: r.correct })) });
    assert.strictEqual(right.score, right.total, t);
    first.results.forEach((r, i) => assert.ok(q.questions[i].options.includes(r.correct), t));
  }
});

test('learner state: visits, notes, reflections', async () => {
  await post('/api/state', { learner: 'Ravi', kind: 'visit', key: '4', value: 'p1' });
  await post('/api/state', { learner: 'Ravi', kind: 'note', key: '4-0', value: 'Worked well' });
  await post('/api/state', { learner: 'Ravi', kind: 'reflection', key: '4-1', value: 'More stress work' });
  const st = await get('/api/state?learner=Ravi');
  assert.deepStrictEqual(st.visited['4'], ['p1']);
  assert.strictEqual(st.notes['4-0'], 'Worked well');
  assert.strictEqual((await post('/api/state', { learner: 'Ravi', kind: 'x', key: '1' })).error, 'unknown kind');
});

test('static files and path traversal', async () => {
  assert.strictEqual((await fetch(base + '/')).status, 200);
  assert.strictEqual((await fetch(base + '/app.js')).status, 200);
  assert.notStrictEqual((await fetch(base + '/..%2fserver.js')).status, 200);
});
