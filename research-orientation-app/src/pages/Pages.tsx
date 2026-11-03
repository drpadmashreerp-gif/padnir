import { Fragment, useState } from 'react';
import { MODULES, PRE_ASSESSMENT, TOTAL_HOURS } from '../data/modules';
import { KN, PRE_KN } from '../data/modules.kn';
import { ModeSwitch } from '../lib/Bi';
import { TEMPLATES, Template } from '../data/templates';
import { buildDocx } from '../lib/docx';
import { saveFile, outcomeText, hosted } from '../lib/save';
import { useStore, streak } from '../lib/store';
import { T } from '../i18n';
import { pagesOf } from './Book';
import Quiz from './Quiz';

const PASS = 60;
export function moduleProgress(s: ReturnType<typeof useStore>['s'], id: string) {
  const m = MODULES.find((x) => x.id === id)!;
  return Math.round(((s.pagesRead[id]?.length ?? 0) / pagesOf(m).length) * 100);
}
export function overall(s: ReturnType<typeof useStore>['s']) {
  return Math.round(MODULES.reduce((a, m) => a + (moduleProgress(s, m.id) / 100) * m.hours, 0) / TOTAL_HOURS * 100);
}
const Bar = ({ v, label }: { v: number; label: string }) => (
  <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="h-2 bg-slate-200 rounded">
    <div className="h-2 bg-teal-600 rounded" style={{ width: v + '%' }} />
  </div>
);

/* ---------- Cover + dashboard ---------- */
export function Home() {
  const { s, set } = useStore();
  const t = T[s.lang];
  const pct = overall(s);
  const next = MODULES.find((m) => moduleProgress(s, m.id) < 100);
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-teal-800 to-emerald-700 text-white p-6 md:p-10">
        <p className="uppercase tracking-wider text-xs opacity-80">For DIET faculty · examples from Karnataka school education</p>
        <p lang="kn" className="text-sm opacity-90 mt-1">ಡಯಟ್ ಉಪನ್ಯಾಸಕರಿಗಾಗಿ · ಕರ್ನಾಟಕದ ಶಾಲಾ ಶಿಕ್ಷಣದ ಉದಾಹರಣೆಗಳೊಂದಿಗೆ</p>
        <h1 className="text-3xl md:text-4xl font-bold mt-2">{T.en.appTitle}</h1>
        <p lang="kn" className="text-2xl md:text-3xl font-semibold mt-1">{T.kn.appTitle}</p>
        <p className="mt-2 opacity-90">{T.en.subtitle}</p><p lang="kn" className="opacity-90">{T.kn.subtitle}</p>
        <p className="mt-3 text-sm opacity-90">12 chapters · {TOTAL_HOURS} hours · worked examples from DSERT, DIETs, SATS, LBA, Sethubandha, Nali Kali, KPS and SDMCs</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a className="btn bg-white text-teal-900" href={s.lastPage || '#/book/m1/0'}>{s.lastPage ? `${T.en.continue} · ${T.kn.continue}` : `${T.en.start} · ${T.kn.start}`} →</a>
          {s.quiz.pre === undefined && <a className="btn bg-teal-900/40 text-white" href="#/pre">{T.en.pre} · {T.kn.pre}</a>}
        </div>
      </section>

      {!s.name && (
        <section className="card grid sm:grid-cols-3 gap-2 items-end">
          <label><span className="label">Your name</span><input className="input" onBlur={(e) => set({ name: e.target.value })} /></label>
          <label><span className="label">DIET / institution</span><input className="input" placeholder="e.g. DIET Mysuru" onBlur={(e) => set({ institution: e.target.value })} /></label>
          <p className="text-sm text-slate-500">Saved only on this device; used on your certificate.</p>
        </section>
      )}

      <section className="grid sm:grid-cols-4 gap-3">
        {[['Course complete', pct + '%'], ['Chapters passed', `${MODULES.filter((m) => (s.quiz[m.id] ?? 0) >= PASS).length}/12`], ['Day streak', `${streak(s.activeDays)} 🔥`], ['Points', String(points(s))]].map(([k, v]) => (
          <div key={k} className="card"><p className="text-xs text-slate-500">{k}</p><p className="text-2xl font-bold text-teal-900">{v}</p></div>))}
      </section>

      {next && <section className="card flex flex-wrap justify-between items-center gap-2">
        <div><p className="text-xs text-slate-500">Up next</p><p className="font-semibold">Chapter {next.no}: {next.title}</p></div>
        <a className="btn-primary" href={`#/book/${next.id}/0`}>Open chapter</a></section>}

      <Contents />
    </div>
  );
}
export const points = (s: ReturnType<typeof useStore>['s']) =>
  Object.values(s.pagesRead).reduce((a, x) => a + x.length * 5, 0) + Object.values(s.quiz).reduce((a, x) => a + x, 0) + s.journal.length * 10 + s.submissions.length * 20;

/* ---------- Contents ---------- */
export function Contents() {
  const { s } = useStore();
  const t = T[s.lang];
  return (
    <section>
      <h2 className="text-xl font-bold text-teal-900 mb-3">Contents · <span lang="kn">ಪರಿವಿಡಿ</span></h2>
      <ol className="grid md:grid-cols-2 gap-3">
        {MODULES.map((m) => {
          const pr = moduleProgress(s, m.id);
          return (
            <li key={m.id}><a href={`#/book/${m.id}/0`} className="card block hover:border-teal-600">
              <div className="flex justify-between gap-2"><span className="text-xs text-slate-500">{t.chapter} {m.no}</span><span className="chip">{m.hours} h</span></div>
              <h3 className="font-semibold text-teal-900">{m.title}</h3>
              <p lang="kn" className="text-sm text-teal-800 mb-2">{m.titleKn}</p>
              <Bar v={pr} label={`${m.title} progress`} />
              <p className="text-xs mt-1 text-slate-500">{pr}% read{s.quiz[m.id] !== undefined && ` · quiz ${s.quiz[m.id]}%`}{(s.quiz[m.id] ?? 0) >= 75 && ' 🏅'}</p>
            </a></li>);
        })}
      </ol>
    </section>
  );
}

/* ---------- Search ---------- */
export function Search({ q }: { q: string }) {
  const term = q.toLowerCase().trim();
  const hits: { href: string; where: string; text: string }[] = [];
  if (term.length > 1) MODULES.forEach((m) => {
    const pages = pagesOf(m);
    m.lessons.forEach((l, i) => l.body.forEach((b) => b.toLowerCase().includes(term) && hits.push({ href: `#/book/${m.id}/${i + 1}`, where: `Ch ${m.no} · ${l.title}`, text: b })));
    m.karnataka.forEach((k) => k.text.forEach((b) => (b + k.title).toLowerCase().includes(term) && hits.push({ href: `#/book/${m.id}/${pages.length - 3}`, where: `Ch ${m.no} · ${k.title}`, text: b })));
    const kn = KN[m.id];
    kn.lessons.forEach((l, i) => l.body.forEach((b) => b.includes(q.trim()) && hits.push({ href: `#/book/${m.id}/${i + 1}`, where: `ಅಧ್ಯಾಯ ${m.no} · ${l.title}`, text: b })));
    kn.karnataka.forEach((k) => k.text.forEach((b) => (b + k.title).includes(q.trim()) && hits.push({ href: `#/book/${m.id}/${pages.length - 3}`, where: `ಅಧ್ಯಾಯ ${m.no} · ${k.title}`, text: b })));
  });
  const mark = (text: string) => {
    const i = text.toLowerCase().indexOf(term);
    if (i < 0) return text;
    const a = Math.max(0, i - 80);
    return <>{a > 0 && '…'}{text.slice(a, i)}<mark>{text.slice(i, i + term.length)}</mark>{text.slice(i + term.length, i + 160)}…</>;
  };
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <h2 className="text-xl font-bold">Search results for “{q}” ({hits.length})</h2>
      {hits.map((h, i) => <a key={i} href={h.href} className="card block hover:border-teal-600"><p className="text-xs text-teal-800 font-semibold">{h.where}</p><p className="text-sm">{mark(h.text)}</p></a>)}
    </div>
  );
}

/* ---------- Progress & badges ---------- */
export function Progress() {
  const { s } = useStore();
  const badges = [
    ['📘', 'First page', Object.keys(s.pagesRead).length > 0],
    ['🧭', 'Pre-assessment taken', s.quiz.pre !== undefined],
    ['⚖️', 'Ethics ready', (s.quiz.m2 ?? 0) >= 75],
    ['📊', 'Number cruncher', (s.quiz.m4 ?? 0) >= 75 && (s.quiz.m10 ?? 0) >= 75],
    ['🗣️', 'Qualitative listener', (s.quiz.m5 ?? 0) >= 75],
    ['🔁', 'Reflective practitioner', s.journal.length >= 3],
    ['📝', 'Proposal drafted', Object.keys(s.proposal).filter((k) => !k.startsWith('__') && s.proposal[k]?.trim()).length >= 10],
    ['🔥', '5-day streak', streak(s.activeDays) >= 5],
    ['🎓', 'Course complete', MODULES.every((m) => (s.quiz[m.id] ?? 0) >= PASS)],
  ] as const;
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-teal-900">My progress</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm"><thead><tr className="text-left"><th>Chapter</th><th>Hours</th><th className="w-1/3">Read</th><th>Quiz</th><th>Activity</th></tr></thead>
          <tbody>{MODULES.map((m) => <tr key={m.id} className="border-t"><td className="py-1">{m.no}. {m.title}</td><td>{m.hours}</td>
            <td><Bar v={moduleProgress(s, m.id)} label={m.title} /></td><td>{s.quiz[m.id] !== undefined ? s.quiz[m.id] + '%' : '—'}</td>
            <td>{s.submissions.some((x) => x.moduleId === m.id) ? '✓' : '—'}</td></tr>)}</tbody></table>
        {s.quiz.pre !== undefined && <p className="text-sm mt-2">Pre-assessment: {s.quiz.pre}% · Average chapter quiz: {Math.round(MODULES.reduce((a, m) => a + (s.quiz[m.id] ?? 0), 0) / 12)}%</p>}
      </div>
      <h3 className="font-semibold">Badges</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{badges.map(([icon, name, got]) => (
        <div key={name} className={`card text-center ${got ? '' : 'opacity-40 grayscale'}`}><div className="text-3xl" aria-hidden>{icon}</div><p className="text-xs font-semibold">{name}</p><p className="sr-only">{got ? 'earned' : 'not yet earned'}</p></div>))}</div>
      {s.bookmarks.length > 0 && <><h3 className="font-semibold">Bookmarks</h3><ul className="list-disc pl-6">{s.bookmarks.map((b) => { const [mid, p] = b.split(':'); const m = MODULES.find((x) => x.id === mid)!; return <li key={b}><a className="text-teal-700 underline" href={`#/book/${mid}/${p}`}>Ch {m.no} · {pagesOf(m)[+p]?.title}</a></li>; })}</ul></>}
    </div>
  );
}

/* ---------- Pre-assessment ---------- */
export function Pre() {
  return <div className="max-w-3xl mx-auto space-y-3"><h2 className="text-2xl font-bold text-teal-900">Pre-assessment</h2>
    <p className="text-slate-600">Five questions to see where you start. Your score is compared with your chapter quiz average on the progress page.</p>
    <ModeSwitch /><Quiz id="pre" items={PRE_ASSESSMENT} kn={PRE_KN} /></div>;
}

/* ---------- Resources ---------- */
const LINKS: [string, string, string][] = [
  ['DSERT Karnataka', 'https://dsert.karnataka.gov.in', 'State academic authority: curriculum, teacher education, research.'],
  ['Department of School Education, Karnataka', 'https://schooleducation.karnataka.gov.in', 'Circulars, programmes and statistics.'],
  ['UDISE+', 'https://udiseplus.gov.in', 'School-level data on enrolment, teachers and infrastructure.'],
  ['National Achievement Survey', 'https://nas.gov.in', 'NAS district report cards for learning outcomes.'],
  ['NCERT', 'https://ncert.nic.in', 'National research, curriculum and journals.'],
  ['Shodhganga', 'https://shodhganga.inflibnet.ac.in', 'Indian doctoral theses — useful for reviews of literature.'],
  ['ERIC', 'https://eric.ed.gov', 'International education research database.'],
  ['DOAJ', 'https://doaj.org', 'Open-access journals.'],
  ['UGC-CARE list', 'https://ugccare.unipune.ac.in', 'Check journal quality before citing or publishing.'],
  ['APA Style', 'https://apastyle.apa.org', 'Referencing guidance (7th edition).'],
  ['JASP', 'https://jasp-stats.org', 'Free point-and-click statistics software.'],
  ['Zotero', 'https://www.zotero.org', 'Free reference manager.'],
];
export function Resources() {
  const [msg, setMsg] = useState<Record<string, string>>({});
  const get = async (tp: Template) => {
    setMsg((m) => ({ ...m, [tp.id]: 'Preparing… · ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ…' }));
    const r = await saveFile(`${tp.name.replace(/\W+/g, '-')}.docx`, buildDocx(tp.blocks));
    setMsg((m) => ({ ...m, [tp.id]: outcomeText[r] }));
  };
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-teal-900">Resource library</h2>
      <h3 className="font-semibold">Templates to download · ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದಾದ ನಮೂನೆಗಳು</h3>
      <p className="text-sm text-slate-600">Word (.docx) files with English and Kannada headings. Open in Microsoft Word, LibreOffice or Google Docs, then fill in or adapt. · Word ಕಡತಗಳು; ತೆರೆದು ಭರ್ತಿ ಮಾಡಿ ಅಥವಾ ಬದಲಿಸಿ.</p>
      <ul className="grid sm:grid-cols-2 gap-2">{TEMPLATES.map((tp) => (
        <li key={tp.id} className="card flex flex-col gap-2">
          <div><p className="font-semibold text-teal-900">{tp.name}</p><p lang="kn" className="text-sm text-teal-800">{tp.kn}</p><p className="text-sm text-slate-600">{tp.desc}</p></div>
          <div className="flex flex-wrap items-center gap-2 mt-auto">
            <button className="btn-primary" onClick={() => get(tp)} aria-describedby={`msg-${tp.id}`}>⬇ Download .docx</button>
            <span id={`msg-${tp.id}`} role="status" className="text-xs text-slate-600">{msg[tp.id]}</span>
          </div>
        </li>))}</ul>
      <h3 className="font-semibold">Key sources and databases</h3>
      <ul className="grid sm:grid-cols-2 gap-2">{LINKS.map(([n, u, d]) => <li key={n} className="card"><a className="font-semibold text-teal-800 underline" href={u} target="_blank" rel="noreferrer">{n}</a><p className="text-sm text-slate-600">{d}</p></li>)}</ul>
      <h3 className="font-semibold">Glossary of Karnataka terms used in this book</h3>
      <dl className="card grid sm:grid-cols-[180px_1fr] gap-x-4 gap-y-1 text-sm">
        {[['DSEL', 'Department of School Education and Literacy'], ['DSERT', 'Department of State Educational Research and Training'], ['DIET', 'District Institute of Education and Training'], ['CRC / BRC', 'Cluster / Block Resource Centre (CRP / BRP: resource persons)'], ['SATS', 'Student Achievement Tracking System'], ['LBA', 'Lesson Based Assessment'], ['HPC', 'Holistic Progress Card'], ['Sethubandha', 'Start-of-year bridge programme for learning gaps'], ['Kalika Chetarike', 'Learning-recovery programme after COVID-19 school closures'], ['Nali Kali', 'Activity-based multigrade approach for Classes 1–3'], ['KPS', 'Karnataka Public Schools (bilingual, LKG to PU on one campus)'], ['SDMC', 'School Development and Monitoring Committee'], ['Chinnara Angala', 'Bridge course for out-of-school children'], ['FLN', 'Foundational Literacy and Numeracy'], ['NAS / PARAKH', 'National Achievement Survey / PARAKH Rashtriya Sarvekshan']].map(([k, v]) => <Fragment key={k}><dt className="font-semibold">{k}</dt><dd>{v}</dd></Fragment>)}
      </dl>
    </div>
  );
}

/* ---------- Facilitator desk ---------- */
const COHORT = [
  { n: 'Participant 01', d: 'DIET Kalaburagi', q: [80, 75, 100, 50, 75, 100, 75, 0, 0, 0, 0, 0] },
  { n: 'Participant 02', d: 'DIET Mysuru', q: [100, 100, 75, 75, 100, 75, 100, 100, 75, 50, 0, 0] },
  { n: 'Participant 03', d: 'DIET Dharwad', q: [60, 50, 50, 25, 0, 0, 0, 0, 0, 0, 0, 0] },
  { n: 'Participant 04', d: 'DIET Udupi', q: [100, 75, 100, 100, 75, 100, 100, 75, 100, 75, 75, 100] },
];
export function Facilitator() {
  const { s, set } = useStore();
  const [fb, setFb] = useState<Record<string, string>>({});
  const avg = MODULES.map((m, i) => { const xs = [...COHORT.map((c) => c.q[i]), s.quiz[m.id] ?? 0]; return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length); });
  const csv = 'Name,DIET,' + MODULES.map((m) => 'Ch' + m.no).join(',') + '\n' + [...COHORT, { n: s.name || 'You', d: s.institution, q: MODULES.map((m) => s.quiz[m.id] ?? 0) }].map((c) => [c.n, c.d, ...c.q].join(',')).join('\n');
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-teal-900">Facilitator desk</h2>
      <p className="text-sm text-slate-600">The cohort below is sample data showing how the desk works. Your own scores and submissions are live. Connect a shared database (e.g. Supabase) to see real cohorts across DIETs.</p>
      <div className="card overflow-x-auto">
        <table className="text-sm w-full"><thead><tr className="text-left"><th>Participant</th><th>DIET</th>{MODULES.map((m) => <th key={m.id} className="text-center">{m.no}</th>)}<th>Status</th></tr></thead>
          <tbody>{[...COHORT, { n: (s.name || 'You') + ' (live)', d: s.institution || '—', q: MODULES.map((m) => s.quiz[m.id] ?? 0) }].map((c) => {
            const passed = c.q.filter((x) => x >= PASS).length;
            return <tr key={c.n} className="border-t"><td>{c.n}</td><td>{c.d}</td>{c.q.map((x, i) => <td key={i} className={`text-center ${x >= PASS ? 'text-emerald-700' : x > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{x || '·'}</td>)}
              <td>{passed === 12 ? 'Complete' : passed < 4 ? <span className="text-rose-700 font-semibold">Needs support</span> : 'On track'}</td></tr>;
          })}</tbody></table>
        <button className="btn-ghost mt-2" onClick={() => saveFile('cohort-report.csv', csv, 'text/csv')}>Export report (CSV)</button>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Average quiz score by chapter</h3>
        <svg viewBox="0 0 480 160" className="w-full max-w-xl" role="img" aria-label="Average quiz score by chapter, bar chart">
          {avg.map((v, i) => <g key={i}><rect x={10 + i * 39} y={130 - v * 1.2} width="28" height={v * 1.2} rx="3" fill={v >= PASS ? '#0f766e' : '#b45309'} />
            <text x={24 + i * 39} y={145} fontSize="10" textAnchor="middle" fill="currentColor">{i + 1}</text>
            <text x={24 + i * 39} y={126 - v * 1.2} fontSize="9" textAnchor="middle" fill="currentColor">{v}</text></g>)}
        </svg>
        <p className="text-xs text-slate-500">Teal = average at or above {PASS}%; amber = below. Numbers above bars give exact values.</p>
      </div>
      <div className="card space-y-3">
        <h3 className="font-semibold">Submission queue</h3>
        {s.submissions.length === 0 && <p className="text-sm text-slate-500">No activity submissions yet. Activities are on the last-but-one page of each chapter.</p>}
        {s.submissions.map((x) => { const m = MODULES.find((mm) => mm.id === x.moduleId)!; return (
          <div key={x.id} className="border rounded-lg p-3"><p className="text-xs text-slate-500">Ch {m.no} · {m.activity.title} · {x.date}</p><p className="whitespace-pre-wrap">{x.text}</p>
            <div className="flex gap-2 mt-2"><input className="input" placeholder="Feedback" value={fb[x.id] ?? x.feedback ?? ''} onChange={(e) => setFb({ ...fb, [x.id]: e.target.value })} />
              <button className="btn-primary" onClick={() => set((p) => ({ submissions: p.submissions.map((y) => y.id === x.id ? { ...y, feedback: fb[x.id] } : y) }))}>Send</button></div></div>); })}
      </div>
    </div>
  );
}

/* ---------- Certificate ---------- */
export function Certificate() {
  const { s } = useStore();
  const passed = MODULES.filter((m) => (s.quiz[m.id] ?? 0) >= PASS).length;
  const ok = passed === 12;
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {!ok && <p className="card">Pass all 12 chapter quizzes ({PASS}% or more) to unlock your certificate. Passed so far: <strong>{passed}/12</strong>.</p>}
      <div className={`card text-center border-4 border-double border-teal-800 p-10 relative ${ok ? '' : 'opacity-50'}`} id="cert">
        {!ok && <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-slate-300 -rotate-12 pointer-events-none">PREVIEW</span>}
        <p className="uppercase tracking-widest text-xs text-slate-500">Certificate of Completion</p>
        <h2 className="text-2xl font-bold text-teal-900 mt-2">Research Methodology Orientation</h2>
        <p className="text-sm text-slate-600">{TOTAL_HOURS}-hour programme for DIET faculty, Karnataka</p>
        <p className="mt-6">This is to certify that</p>
        <p className="text-3xl font-semibold my-2">{s.name || '________________'}</p>
        <p>{s.institution || '________________'}</p>
        <p className="mt-4">has completed all twelve chapters and assessments.</p>
        <p className="mt-6 text-sm text-slate-500">Date: {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      {ok && !hosted && <button className="btn-primary" onClick={() => window.print()}>Print / Save as PDF</button>}
      {ok && hosted && <p className="text-sm text-slate-600">To print, open the standalone HTML book in a browser and use Print. · ಮುದ್ರಿಸಲು ಸ್ವತಂತ್ರ HTML ಪುಸ್ತಕವನ್ನು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ.</p>}
    </div>
  );
}

/* ---------- Settings ---------- */
export function Settings() {
  const { s, set } = useStore();
  return (
    <div className="max-w-xl mx-auto card space-y-4">
      <h2 className="text-2xl font-bold text-teal-900">Settings</h2>
      <label className="block"><span className="label">Name</span><input className="input" value={s.name} onChange={(e) => set({ name: e.target.value })} /></label>
      <label className="block"><span className="label">DIET / institution</span><input className="input" value={s.institution} onChange={(e) => set({ institution: e.target.value })} /></label>
      <label className="block"><span className="label">Role</span><select className="input" value={s.role} onChange={(e) => set({ role: e.target.value as typeof s.role })}><option value="participant">Participant (DIET faculty)</option><option value="facilitator">Facilitator / Resource person</option><option value="admin">Administrator</option></select></label>
      <label className="block"><span className="label">Interface language</span><select className="input" value={s.lang} onChange={(e) => set({ lang: e.target.value as 'en' | 'kn' })}><option value="en">English</option><option value="kn">ಕನ್ನಡ</option></select></label>
      <label className="block"><span className="label">Text size: {s.fontSize}px</span><input type="range" min={14} max={22} value={s.fontSize} onChange={(e) => set({ fontSize: +e.target.value })} className="w-full" /></label>
      <label className="flex gap-2 items-center"><input type="checkbox" checked={s.highContrast} onChange={(e) => set({ highContrast: e.target.checked })} /> High-contrast mode</label>
      <div className="flex gap-2 border-t pt-3">
        <button className="btn-ghost" onClick={() => saveFile('my-rmo-progress.json', JSON.stringify(s, null, 2), 'application/json')}>Back up my progress</button>
        <label className="btn-ghost cursor-pointer">Restore<input type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) try { set(JSON.parse(await f.text())); } catch { alert('Not a valid backup file.'); } }} /></label>
      </div>
      <p className="text-xs text-slate-500">All data stay in this browser. The app works offline after the first visit.</p>
    </div>
  );
}
