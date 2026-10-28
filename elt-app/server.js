// English Language Teaching: A Sequenced Guide — app server with Phonetics Lab.
// No dependencies: Node 18+. Run `node server.js` and open http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const STORE = process.env.STORE || path.join(ROOT, 'data', 'store.json');

const load = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const pad = n => String(n).padStart(3, '0');
const MANIFEST = load('manifest.json');
const GLOSSARY = load('glossary.json');
const IPA = load('ipa.json');
const UNITS = {};
for (let n = 1; n <= 100; n++) UNITS[n] = load(`u${pad(n)}.json`);

// ---------- store (one JSON file) ----------
const EMPTY = () => ({ learners: {} });
let cache = null;
function readStore() {
  if (cache) return cache;
  try { cache = JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { cache = EMPTY(); }
  if (!cache.learners) cache = EMPTY();
  return cache;
}
function writeStore() {
  const tmp = STORE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cache));
  fs.renameSync(tmp, STORE);
}
function learnerState(name) {
  const s = readStore();
  return s.learners[name] || (s.learners[name] = { visited: {}, tried: {}, notes: {}, reflections: {}, attempts: [] });
}

// ---------- quiz helpers ----------
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
function shuffle(a, r = Math.random) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pick = (a, n) => shuffle(a).slice(0, n);
const strip = s => String(s).replace(/<[^>]+>/g, '');

// Unit self-check: one statement per point (which point is it from?) + five key terms.
// Deterministic from (unit, salt), so the server can regrade from the same seed.
function unitQuiz(n, salt) {
  const U = UNITS[n], r = rng(n * 131 + salt + 3), qs = [];
  U.points.forEach((P, i) => {
    const st = P.pts[Math.floor(r() * P.pts.length)];
    const opts = shuffle([i, ...shuffle(U.points.map((x, j) => j).filter(j => j !== i), r).slice(0, 3)], r);
    qs.push({ kind: 'p', q: 'Which point is this statement from?', quote: st, opts: opts.map(j => U.points[j].h), ans: opts.indexOf(i), why: `It is from point ${i + 1}, ${U.points[i].h}.` });
  });
  shuffle(U.terms || [], r).slice(0, 5).forEach(t => {
    let ds = shuffle((U.terms || []).filter(x => x.term !== t.term), r).slice(0, 3).map(x => x.term);
    if (ds.length < 3) ds = ds.concat(['washback', 'scaffolding', 'recast', 'schema', 'chunk'].filter(x => x !== t.term && !ds.includes(x)).slice(0, 3 - ds.length));
    const opts = shuffle([t.term, ...ds], r);
    const blank = strip(t.def).replace(new RegExp(t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), '____');
    qs.push({ kind: 't', q: 'Which term matches this definition?', quote: blank, opts, ans: opts.indexOf(t.term), why: `${t.term}: ${strip(t.def)}` });
  });
  return qs;
}

// Phonetics Lab activities. Question ids encode the source item so answers are checked server-side.
const SOUNDS = [...IPA.monophthongs, ...IPA.diphthongs, ...IPA.consonants];
const PATTERNS = ['Oo', 'oO', 'Ooo', 'oOo'];
const LAB = {
  minimal: {
    title: 'Minimal pairs: which word do you hear?',
    make: n => pick(IPA.minimalPairs.map((p, i) => i), n).map(i => {
      const k = Math.random() < .5 ? 0 : 1, p = IPA.minimalPairs[i];
      return { id: i + ':' + k, speak: p[k], prompt: 'Listen and choose the word.', options: [p[0], p[1]] };
    }),
    answer: id => { const [i, k] = id.split(':').map(Number); return (IPA.minimalPairs[i] || [])[k]; },
    explain: id => { const p = IPA.minimalPairs[+id.split(':')[0]]; return p && `${p[0]} /${p[2]}/ · ${p[1]} /${p[3]}/`; }
  },
  symbol: {
    title: 'Symbol to sound: which word has this sound?',
    make: n => pick(SOUNDS, n).map(ph => ({ id: ph.s, symbol: '/' + ph.s + '/', prompt: 'Which word is the key word for this sound?', options: shuffle([ph.w, ...pick(SOUNDS.filter(x => x.s !== ph.s), 3).map(x => x.w)]) })),
    answer: id => (SOUNDS.find(x => x.s === id) || {}).w,
    explain: id => { const p = SOUNDS.find(x => x.s === id); return p && `/${p.s}/ as in ${p.w} /${p.t}/`; }
  },
  stress: {
    title: 'Word stress: choose the pattern',
    make: n => pick(IPA.stressWords.map((w, i) => i), n).map(i => ({ id: String(i), speak: IPA.stressWords[i][0], word: IPA.stressWords[i][0], prompt: 'Which stress pattern does this word have? (O = stressed syllable)', options: PATTERNS })),
    answer: id => (IPA.stressWords[+id] || [])[1],
    explain: id => (IPA.stressWords[+id] || [])[2]
  },
  transcription: {
    title: 'Read the transcription',
    make: n => pick(IPA.transcriptions.map((t, i) => i), n).map(i => {
      const t = IPA.transcriptions[i];
      return { id: String(i), symbol: '/' + t[0] + '/', prompt: 'Which word is this?', options: shuffle([t[1], ...pick(IPA.transcriptions.filter(x => x[1] !== t[1]), 3).map(x => x[1])]) };
    }),
    answer: id => (IPA.transcriptions[+id] || [])[1],
    explain: id => { const t = IPA.transcriptions[+id]; return t && `/${t[0]}/ = ${t[1]}`; }
  },
  shift: {
    title: 'Stress shift: noun or verb?',
    make: n => pick(IPA.stressShift.map((w, i) => i), n).map(i => {
      const k = Math.random() < .5 ? 1 : 2;
      return { id: i + ':' + k, word: IPA.stressShift[i][k].split(' ')[0], prompt: 'Look at the stressed syllable (in capitals). Noun or verb?', options: ['noun', 'verb'] };
    }),
    answer: id => ({ 1: 'noun', 2: 'verb' })[+id.split(':')[1]],
    explain: id => { const s = IPA.stressShift[+id.split(':')[0]]; return s && `${s[1]} · ${s[2]}`; }
  }
};

// ---------- http ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml' };
function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function body(req) {
  return new Promise((ok, bad) => {
    let d = ''; req.on('data', c => { d += c; if (d.length > 2e5) { bad(new Error('Request too large')); req.destroy(); } });
    req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch (e) { bad(new Error('Invalid JSON')); } });
  });
}
const cleanName = s => String(s || '').trim().replace(/\s+/g, ' ').slice(0, 60);
const KEY = /^[\w.-]{1,40}$/;

function record(learner, activity, score, total) {
  if (!learner || !total) return;
  learnerState(learner).attempts.push({ activity, score, total, at: new Date().toISOString() });
  writeStore();
}

async function api(req, res, url) {
  const p = url.pathname, m = req.method; let mm;
  if (m === 'GET' && p === '/api/manifest') return send(res, 200, MANIFEST);
  if (m === 'GET' && p === '/api/glossary') return send(res, 200, GLOSSARY);
  if (m === 'GET' && p === '/api/ipa') return send(res, 200, IPA);
  if (m === 'GET' && (mm = p.match(/^\/api\/units\/(\d{1,3})$/))) {
    const U = UNITS[+mm[1]]; return U ? send(res, 200, U) : send(res, 404, { error: 'No such unit' });
  }
  if ((mm = p.match(/^\/api\/units\/(\d{1,3})\/quiz(\/check)?$/))) {
    const n = +mm[1]; if (!UNITS[n]) return send(res, 404, { error: 'No such unit' });
    if (m === 'GET' && !mm[2]) {
      const salt = +url.searchParams.get('salt') || 0;
      return send(res, 200, { salt, questions: unitQuiz(n, salt).map(({ ans, why, ...q }) => q) });
    }
    if (m === 'POST' && mm[2]) {
      const b = await body(req), qs = unitQuiz(n, +b.salt || 0), answers = b.answers || [];
      const results = qs.map((q, i) => ({ ok: answers[i] === q.ans, ans: q.ans, why: q.why }));
      const score = results.filter(r => r.ok).length;
      record(cleanName(b.learner), `unit-${n}`, score, qs.length);
      return send(res, 200, { score, total: qs.length, results });
    }
  }
  if (m === 'GET' && p === '/api/lab') return send(res, 200, Object.entries(LAB).map(([type, q]) => ({ type, title: q.title })));
  if ((mm = p.match(/^\/api\/lab\/(\w+)(\/check)?$/))) {
    const q = LAB[mm[1]]; if (!q) return send(res, 404, { error: 'No such activity' });
    if (m === 'GET' && !mm[2]) return send(res, 200, { type: mm[1], title: q.title, questions: q.make(Math.max(1, Math.min(20, +url.searchParams.get('n') || 8))) });
    if (m === 'POST' && mm[2]) {
      const b = await body(req);
      const results = (b.answers || []).slice(0, 40).map(a => { const right = q.answer(String(a.id)); return { id: a.id, ok: right !== undefined && a.answer === right, correct: right, explain: q.explain(String(a.id)) }; });
      const score = results.filter(r => r.ok).length;
      record(cleanName(b.learner), `lab-${mm[1]}`, score, results.length);
      return send(res, 200, { score, total: results.length, results });
    }
  }
  if (p === '/api/state') {
    if (m === 'GET') {
      const name = cleanName(url.searchParams.get('learner'));
      if (!name) return send(res, 400, { error: 'learner is required' });
      return send(res, 200, readStore().learners[name] || { visited: {}, tried: {}, notes: {}, reflections: {}, attempts: [] });
    }
    if (m === 'POST') {
      // { learner, kind: visit|tried|note|reflection, key, value }
      const b = await body(req), name = cleanName(b.learner), key = String(b.key || '');
      if (!name) return send(res, 400, { error: 'learner is required' });
      if (!KEY.test(key)) return send(res, 400, { error: 'invalid key' });
      const st = learnerState(name);
      if (b.kind === 'visit') { const v = st.visited[key] || (st.visited[key] = []); const c = String(b.value || ''); if (/^\w{1,10}$/.test(c) && !v.includes(c)) v.push(c); }
      else if (b.kind === 'tried') st.tried[key] = !!b.value;
      else if (b.kind === 'note') st.notes[key] = String(b.value || '').slice(0, 5000);
      else if (b.kind === 'reflection') st.reflections[key] = String(b.value || '').slice(0, 5000);
      else return send(res, 400, { error: 'unknown kind' });
      writeStore();
      return send(res, 200, { ok: true });
    }
  }
  send(res, 404, { error: 'Not found' });
}

function serveStatic(res, p) {
  const f = path.normalize(path.join(PUB, p === '/' ? 'index.html' : p));
  if (!f.startsWith(PUB + path.sep) && f !== PUB) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else serveStatic(res, decodeURIComponent(url.pathname));
  } catch (e) { send(res, 400, { error: e.message }); }
});

if (require.main === module) server.listen(PORT, () => console.log(`ELT Guide running at http://localhost:${PORT}`));
module.exports = server;
