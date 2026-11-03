import { useEffect, useRef, useState } from 'react';
import type { ToolId } from '../data/modules';
import { useStore } from '../lib/store';
import * as st from '../lib/stats';
import { saveFile, hosted } from '../lib/save';
import { buildDocx, textToBlocks, Block } from '../lib/docx';

export const TOOL_META: Record<ToolId, { name: string; kn: string; desc: string }> = {
  rq: { name: 'Research Question Builder', kn: 'ಸಂಶೋಧನಾ ಪ್ರಶ್ನೆ ರಚನಕಾರ', desc: 'Turn a concern into a focused question and hypothesis.' },
  ethics: { name: 'Ethics Decision Tree', kn: 'ನೈತಿಕ ನಿರ್ಧಾರ ವೃಕ್ಷ', desc: 'Find the safeguards your study needs.' },
  sample: { name: 'Sample Size Calculator', kn: 'ಮಾದರಿ ಗಾತ್ರ ಗಣಕ', desc: 'Sample size for a survey, with finite population correction.' },
  stats: { name: 'Statistics Workbench', kn: 'ಸಾಂಖ್ಯಿಕ ಕಾರ್ಯಾಗಾರ', desc: 'Descriptives, t-tests, ANOVA, chi-square, correlation.' },
  survey: { name: 'Survey Builder', kn: 'ಸಮೀಕ್ಷೆ ರಚನಕಾರ', desc: 'Draft a questionnaire and export it.' },
  coding: { name: 'Qualitative Coding Practice', kn: 'ಗುಣಾತ್ಮಕ ಸಂಕೇತೀಕರಣ ಅಭ್ಯಾಸ', desc: 'Code interview excerpts and build themes.' },
  mixed: { name: 'Mixed Methods Design Selector', kn: 'ಮಿಶ್ರ ವಿಧಾನ ವಿನ್ಯಾಸ ಆಯ್ಕೆ', desc: 'Choose a design and sketch a joint display.' },
  journal: { name: 'Action Research Journal', kn: 'ಕ್ರಿಯಾ ಸಂಶೋಧನಾ ದಿನಚರಿ', desc: 'Plan–act–observe–reflect entries.' },
  observation: { name: 'Classroom Observation Timer', kn: 'ತರಗತಿ ವೀಕ್ಷಣಾ ಟೈಮರ್', desc: 'Tally classroom events by category.' },
  stakeholder: { name: 'Stakeholder Map', kn: 'ಪಾಲುದಾರರ ನಕ್ಷೆ', desc: 'Map interest and influence for community research.' },
  proposal: { name: 'Research Proposal Builder', kn: 'ಸಂಶೋಧನಾ ಪ್ರಸ್ತಾವನೆ ರಚನಕಾರ', desc: 'Step-by-step proposal with Word export.' },
  literature: { name: 'Reference Manager', kn: 'ಉಲ್ಲೇಖ ನಿರ್ವಾಹಕ', desc: 'Keep references and format them in APA 7.' },
  quality: { name: 'Quality Checklist', kn: 'ಗುಣಮಟ್ಟ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ', desc: 'Peer-review a study stage by stage.' },
};

const f = (n: number, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');
const Field = ({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block"><span className="label">{label}</span><input className="input" {...p} /></label>
);
const Area = ({ label, ...p }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <label className="block"><span className="label">{label}</span><textarea className="input min-h-[70px]" {...p} /></label>
);

/* ---------- Research question builder ---------- */
function RQ() {
  const [v, setV] = useState({ pop: 'Grade 5 children in bilingual KPS sections', vari: 'oral comprehension in English', cmp: 'children in Kannada-medium sections', place: 'Kalaburagi district', measure: 'scores on a 20-item listening comprehension test' });
  const u = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });
  return (
    <div className="grid gap-3">
      <Field label="Who? (population)" value={v.pop} onChange={u('pop')} />
      <Field label="What? (variable or phenomenon)" value={v.vari} onChange={u('vari')} />
      <Field label="Compared with whom? (optional)" value={v.cmp} onChange={u('cmp')} />
      <Field label="Where?" value={v.place} onChange={u('place')} />
      <Field label="Measured how? (operational definition)" value={v.measure} onChange={u('measure')} />
      <div className="ka space-y-2">
        <p><strong>Research question:</strong> {v.cmp ? `What is the difference in ${v.vari} between ${v.pop} and ${v.cmp} in ${v.place}?` : `What is the level of ${v.vari} among ${v.pop} in ${v.place}?`}</p>
        {v.cmp && <p><strong>Null hypothesis (H₀):</strong> There is no significant difference in {v.vari} between {v.pop} and {v.cmp}.</p>}
        <p><strong>Operational definition:</strong> {v.vari} will be measured by {v.measure}.</p>
      </div>
    </div>
  );
}

/* ---------- Ethics decision tree ---------- */
const ETHICS = [
  { q: 'Will children under 18 take part?', yes: 'Written parental consent and the child\'s own assent in the home language.' },
  { q: 'Will you use SATS, LBA or other records that identify children or teachers?', yes: 'Departmental permission; replace IDs with study codes before analysis; store files securely.' },
  { q: 'Will you record audio, video or photographs?', yes: 'Separate consent for recording; avoid faces; no social media posting.' },
  { q: 'Could participation affect a teacher\'s appraisal or a child\'s marks?', yes: 'State clearly that participation is voluntary and has no effect on appraisal or marks; keep data away from supervisors.' },
  { q: 'Does the study involve sensitive topics (caste, disability, abuse, migration)?', yes: 'Ethics committee review; trained interviewers; referral plan (e.g. Child Helpline 1098).' },
  { q: 'Will an intervention be withheld from a comparison group?', yes: 'Offer the intervention to the comparison group after the study (wait-list design).' },
];
function Ethics() {
  const [a, setA] = useState<Record<number, boolean>>({});
  const needs = ETHICS.filter((_, i) => a[i]);
  return (
    <div className="space-y-3">
      {ETHICS.map((e, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 justify-between border-b pb-2">
          <span>{e.q}</span>
          <span className="flex gap-1">
            {[true, false].map((b) => (
              <button key={String(b)} className={a[i] === b ? 'btn-primary' : 'btn-ghost'} onClick={() => setA({ ...a, [i]: b })}>{b ? 'Yes' : 'No'}</button>
            ))}
          </span>
        </div>
      ))}
      <div className="ka">
        <strong>Safeguards for your study</strong>
        <ul className="list-disc pl-5 mt-1">
          <li>Administrative permission from the DDPI/BEO to visit schools.</li>
          <li>Plain-language information sheet in Kannada (or the participants’ language).</li>
          {needs.map((e) => <li key={e.q}>{e.yes}</li>)}
          <li>Share findings back with schools and SDMCs.</li>
        </ul>
      </div>
    </div>
  );
}

/* ---------- Sample size ---------- */
function Sample() {
  const [pop, setPop] = useState(1240), [conf, setConf] = useState<'90' | '95' | '99'>('95'), [m, setM] = useState(5), [p, setP] = useState(50);
  const n = st.sampleSize(pop, conf, m / 100, p / 100);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Population size (e.g. government schools in the district; 0 if unknown)" type="number" value={pop} onChange={(e) => setPop(+e.target.value)} />
      <label className="block"><span className="label">Confidence level</span>
        <select className="input" value={conf} onChange={(e) => setConf(e.target.value as '95')}><option>90</option><option>95</option><option>99</option></select></label>
      <Field label="Margin of error (%)" type="number" min={1} max={20} value={m} onChange={(e) => setM(+e.target.value)} />
      <Field label="Expected proportion (%) — use 50 if unsure" type="number" min={1} max={99} value={p} onChange={(e) => setP(+e.target.value)} />
      <div className="ka sm:col-span-2">
        <p className="text-2xl font-bold">n = {n}</p>
        <p className="text-sm">Add 10–15% for non-response (≈ {Math.ceil(n * 1.15)}). If you stratify (e.g. by block or medium), split n in proportion to each stratum’s size.</p>
      </div>
    </div>
  );
}

/* ---------- Statistics workbench ---------- */
const STAT_TABS = ['Descriptives', 'Independent t', 'Paired t', 'ANOVA', 'Chi-square', 'Correlation'] as const;
function Bars({ groups }: { groups: { label: string; value: number }[] }) {
  const max = Math.max(...groups.map((g) => g.value), 1);
  return (
    <svg viewBox={`0 0 300 ${groups.length * 28}`} className="w-full max-w-md" role="img" aria-label="Bar chart of group means">
      {groups.map((g, i) => (
        <g key={g.label} transform={`translate(0 ${i * 28})`}>
          <text x="0" y="16" fontSize="11" fill="currentColor">{g.label}</text>
          <rect x="90" y="4" height="16" rx="3" width={(g.value / max) * 170} fill="#0f766e" />
          <text x={95 + (g.value / max) * 170} y="16" fontSize="11" fill="currentColor">{f(g.value)}</text>
        </g>
      ))}
    </svg>
  );
}
function Stats() {
  const [tab, setTab] = useState<(typeof STAT_TABS)[number]>('Descriptives');
  const [a, setA] = useState('12 15 9 14 11 16 13 10 15 12'), [b, setB] = useState('10 11 8 12 9 13 10 9 11 10'), [c, setC] = useState('14 16 13 15 17 14 16 15');
  const [tbl, setTbl] = useState('62 38\n45 55');
  const A = st.parseNums(a), B = st.parseNums(b), Cn = st.parseNums(c);
  const note = <p className="text-xs text-slate-500">Data are illustrative. Paste your own numbers separated by spaces, commas or new lines.</p>;
  let out: JSX.Element | null = null;
  if (tab === 'Descriptives') {
    const r = st.describe(A);
    out = r && <table className="text-sm"><tbody>{Object.entries({ N: r.n, Mean: f(r.mean), Median: f(r.median), Mode: r.mode.join(', ') || 'none', SD: f(r.sd), Variance: f(r.variance), Min: r.min, Max: r.max }).map(([k, v]) => <tr key={k}><td className="pr-4 font-semibold">{k}</td><td>{v}</td></tr>)}</tbody></table>;
  } else if (tab === 'Independent t') {
    const r = st.tTestIndependent(A, B);
    out = r && <><Bars groups={[{ label: 'Group A', value: r.A.mean }, { label: 'Group B', value: r.B.mean }]} />
      <p>Welch t({f(r.df, 1)}) = {f(r.t)}, p = {st.fmtP(r.p)}, Cohen’s d = {f(r.d)}</p>
      <p className="text-sm">{r.p < 0.05 ? 'The difference is statistically significant at .05.' : 'The difference is not statistically significant at .05.'} Effect size is {Math.abs(r.d) < 0.2 ? 'negligible' : Math.abs(r.d) < 0.5 ? 'small' : Math.abs(r.d) < 0.8 ? 'medium' : 'large'}.</p></>;
  } else if (tab === 'Paired t') {
    const r = st.tTestPaired(A, B);
    out = r ? <p>Mean change (Post − Pre) = {f(r.meanDiff)}; t({r.df}) = {f(r.t)}, p = {st.fmtP(r.p)}, d = {f(r.d)}</p> : <p className="text-rose-700">Pre and post lists must have the same number of values.</p>;
  } else if (tab === 'ANOVA') {
    const r = st.anova([A, B, Cn]);
    out = r && <><Bars groups={[['Kannada medium', A], ['Urdu medium', B], ['English medium', Cn]].map(([l, g]) => ({ label: l as string, value: st.describe(g as number[])?.mean ?? 0 }))} />
      <p>F({r.df1}, {r.df2}) = {f(r.F)}, p = {st.fmtP(r.p)}, η² = {f(r.eta2)}</p>
      <p className="text-sm">If significant, compare pairs and look for explanations beyond medium (vacancies, enrolment, socio-economic status).</p></>;
  } else if (tab === 'Chi-square') {
    const table = tbl.trim().split('\n').map((row) => st.parseNums(row));
    const r = table.every((row) => row.length === table[0].length) ? st.chiSquare(table) : null;
    out = r ? <><p>χ²({r.df}) = {f(r.x2)}, p = {st.fmtP(r.p)}, Cramér’s V = {f(r.cramerV)}</p>
      {r.lowExpected > 0 && <p className="text-sm text-amber-700">{r.lowExpected} cell(s) have expected count below 5; interpret with caution.</p>}</> : <p className="text-rose-700">Each row needs the same number of counts.</p>;
  } else {
    const r = st.pearson(A, B);
    out = r && <p>r = {f(r.r, 3)}, n = {r.n}, p = {st.fmtP(r.p)} — {Math.abs(r.r) < 0.3 ? 'weak' : Math.abs(r.r) < 0.5 ? 'moderate' : 'strong'} {r.r >= 0 ? 'positive' : 'negative'} association (not proof of cause).</p>;
  }
  const labels: Record<string, [string, string?, string?]> = {
    Descriptives: ['Scores (e.g. LBA marks out of 20)'],
    'Independent t': ['Group A (e.g. Sethubandha + reading period: gain scores)', 'Group B (e.g. Sethubandha only: gain scores)'],
    'Paired t': ['Pre-test (same children)', 'Post-test (same children, same order)'],
    ANOVA: ['Kannada-medium schools', 'Urdu-medium schools', 'English-medium schools'],
    Correlation: ['Variable X (e.g. teacher attendance %)', 'Variable Y (e.g. class mean score)'],
    'Chi-square': [''],
  };
  const L = labels[tab];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1" role="tablist">{STAT_TABS.map((x) => <button key={x} role="tab" aria-selected={tab === x} className={tab === x ? 'btn-primary' : 'btn-ghost'} onClick={() => setTab(x)}>{x}</button>)}</div>
      {tab === 'Chi-square' ? (
        <Area label="Contingency table: one row per line (example: girls 62 borrowed / 38 not; boys 45 / 55)" value={tbl} onChange={(e) => setTbl(e.target.value)} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Area label={L[0]} value={a} onChange={(e) => setA(e.target.value)} />
          {L[1] && <Area label={L[1]} value={b} onChange={(e) => setB(e.target.value)} />}
          {L[2] && <Area label={L[2]} value={c} onChange={(e) => setC(e.target.value)} />}
        </div>
      )}
      <div className="ka">{out ?? <p>Enter enough data (at least two values per group).</p>}</div>
      {note}
    </div>
  );
}

/* ---------- Survey builder ---------- */
type SQ = { text: string; type: 'Multiple choice' | 'Likert (5-point)' | 'Yes/No' | 'Open text'; options: string };
function Survey() {
  const [title, setTitle] = useState('School Library Use Survey – Head Teachers');
  const [qs, setQs] = useState<SQ[]>([
    { text: 'Does your school have a separate library room?', type: 'Yes/No', options: '' },
    { text: 'How often is a library period held for Grades 6–8?', type: 'Multiple choice', options: 'Daily, Weekly, Monthly, Never' },
    { text: 'Children in my school enjoy reading library books.', type: 'Likert (5-point)', options: '' },
  ]);
  const [draft, setDraft] = useState<SQ>({ text: '', type: 'Multiple choice', options: '' });
  const opts = (q: SQ) => q.type === 'Yes/No' ? ['Yes', 'No'] : q.type === 'Likert (5-point)' ? ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'] : q.type === 'Multiple choice' ? q.options.split(',').map((o) => o.trim()).filter(Boolean) : [];
  const text = `${title}\n\n` + qs.map((q, i) => `${i + 1}. ${q.text}\n` + (opts(q).length ? opts(q).map((o) => `   [ ] ${o}`).join('\n') : '   ____________________')).join('\n\n');
  return (
    <div className="space-y-3">
      <Field label="Survey title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <ol className="list-decimal pl-6 space-y-2">{qs.map((q, i) => (
        <li key={i}><span className="font-semibold">{q.text}</span> <span className="chip">{q.type}</span>
          {opts(q).length > 0 && <span className="text-sm text-slate-500"> — {opts(q).join(' / ')}</span>}
          <button className="text-rose-700 text-sm ml-2" onClick={() => setQs(qs.filter((_, j) => j !== i))} aria-label="Remove question">✕</button></li>))}</ol>
      <div className="grid gap-2 sm:grid-cols-3 border-t pt-3">
        <Field label="New question" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
        <label className="block"><span className="label">Type</span>
          <select className="input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as SQ['type'] })}>
            {['Multiple choice', 'Likert (5-point)', 'Yes/No', 'Open text'].map((x) => <option key={x}>{x}</option>)}</select></label>
        {draft.type === 'Multiple choice' && <Field label="Options (comma separated)" value={draft.options} onChange={(e) => setDraft({ ...draft, options: e.target.value })} />}
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" disabled={!draft.text.trim()} onClick={() => { setQs([...qs, draft]); setDraft({ ...draft, text: '', options: '' }); }}>Add question</button>
        <button className="btn-ghost" onClick={() => saveFile('survey.docx', buildDocx([{ t: 'title', text: title }, ...qs.flatMap((q, i): Block[] => [{ t: 'p', text: `${i + 1}. ${q.text}` }, ...(opts(q).length ? opts(q).map((o): Block => ({ t: 'bullet', text: `☐ ${o}` })) : [{ t: 'blank' } as Block])])]))}>Download survey (.docx)</button>
      </div>
    </div>
  );
}

/* ---------- Qualitative coding ---------- */
const EXCERPTS = [
  'T1: "In the bilingual section I explain the science concept in Kannada first, then give the English words. Otherwise half the class just copies from the board."',
  'T2: "Entering LBA marks on the portal takes me two evenings each month. I do it, but I rarely look at the reports afterwards."',
  'T3: "The Lambani children understand quickly when I use one or two words from their language. The textbook does not help with that."',
  'T4: "After the training I felt more confident to speak English in class, but there is no one at school to practise with."',
  'T5: "Parents ask why marks in the HPC are not like the old marks card. I find it hard to explain."',
  'T6: "When the CRP visits, she checks registers. I wish she would watch my lesson and tell me what to improve."',
];
function Coding() {
  const { s, set } = useStore();
  const codes: string[] = JSON.parse(s.proposal.__codes || '[]');
  const setCode = (i: number, v: string) => { const c = [...codes]; c[i] = v; set((p) => ({ proposal: { ...p.proposal, __codes: JSON.stringify(c) } })); };
  const groups = new Map<string, number[]>();
  codes.forEach((c, i) => c?.trim() && groups.set(c.trim().toLowerCase(), [...(groups.get(c.trim().toLowerCase()) || []), i + 1]));
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Excerpts from illustrative interviews with government school teachers. Give each a short code (2–4 words). Reuse a code when the idea repeats. Suggested codes appear after you try.</p>
      {EXCERPTS.map((e, i) => (
        <div key={i} className="grid sm:grid-cols-[1fr_200px] gap-2 items-start border-b pb-2">
          <p className="italic">{e}</p>
          <input className="input" placeholder="Code" value={codes[i] || ''} onChange={(ev) => setCode(i, ev.target.value)} aria-label={`Code for excerpt ${i + 1}`} />
        </div>
      ))}
      {groups.size > 0 && <div className="ka"><strong>Your codes → candidate themes</strong>
        <ul className="list-disc pl-5">{[...groups].map(([c, ids]) => <li key={c}>{c} (excerpts {ids.join(', ')})</li>)}</ul>
        <p className="text-sm mt-2">One possible reading: <em>Language as a bridge</em> (T1, T3, T4); <em>Assessment burden and meaning</em> (T2, T5); <em>Support that teachers want</em> (T4, T6).</p></div>}
    </div>
  );
}

/* ---------- Mixed methods selector ---------- */
function Mixed() {
  const [q, setQ] = useState<string | null>(null);
  const designs: Record<string, string> = {
    explain: 'Explanatory sequential (QUAN → qual): analyse scores first, then interview to explain patterns.',
    explore: 'Exploratory sequential (QUAL → quan): explore meanings first, then build and test a tool.',
    compare: 'Convergent (QUAN + QUAL together): collect both at once and compare for agreement.',
  };
  const [rows, setRows] = useState([['High-drop schools', 'Mean fell 4 marks Gr 5→6', 'Teachers: new subject teachers, no handover'], ['Low-drop schools', 'Mean fell 1 mark', 'Teachers: same teacher continues Gr 5–6'], ['', '', '']]);
  return (
    <div className="space-y-3">
      <p className="font-semibold">What do you mainly need?</p>
      <div className="grid gap-2">
        {[['explain', 'I have (or will have) numbers and need to explain them.'], ['explore', 'I do not yet know what to measure; I need to explore first.'], ['compare', 'I want to check numbers and experiences against each other at the same time.']].map(([k, l]) => (
          <button key={k} className={`text-left ${q === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setQ(k)}>{l}</button>))}
      </div>
      {q && <p className="ka">{designs[q]}</p>}
      <p className="font-semibold">Joint display</p>
      <div className="overflow-x-auto"><table className="text-sm w-full"><thead><tr><th className="text-left">Case / group</th><th className="text-left">Quantitative finding</th><th className="text-left">Qualitative finding</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><input className="input" value={c} onChange={(e) => setRows(rows.map((rr, ii) => ii === i ? rr.map((cc, jj) => jj === j ? e.target.value : cc) : rr))} /></td>)}</tr>)}</tbody></table></div>
      <button className="btn-ghost" onClick={() => setRows([...rows, ['', '', '']])}>Add row</button>
    </div>
  );
}

/* ---------- Action research journal ---------- */
function Journal() {
  const { s, set } = useStore();
  const [stage, setStage] = useState('Plan'), [text, setText] = useState('');
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">{['Plan', 'Act', 'Observe', 'Reflect'].map((x) => <button key={x} className={stage === x ? 'btn-primary' : 'btn-ghost'} onClick={() => setStage(x)}>{x}</button>)}</div>
      <textarea className="input min-h-[90px]" value={text} onChange={(e) => setText(e.target.value)} aria-label="Journal entry"
        placeholder={{ Plan: 'Problem in my practice… change I will try… for how long… evidence I will collect…', Act: 'What I did today…', Observe: 'What happened? What did the evidence show?', Reflect: 'What does it mean? What will I change in the next cycle?' }[stage]} />
      <button className="btn-primary" disabled={!text.trim()} onClick={() => { set((p) => ({ journal: [{ date: new Date().toLocaleString(), stage, text }, ...p.journal] })); setText(''); }}>Save entry</button>
      <ul className="space-y-2">{s.journal.map((j, i) => <li key={i} className="border-l-4 border-teal-600 pl-3"><span className="chip">{j.stage}</span> <span className="text-xs text-slate-500">{j.date}</span><p>{j.text}</p></li>)}</ul>
    </div>
  );
}

/* ---------- Observation timer ---------- */
const OBS = ['Teacher talk', 'Child talk', 'Group work', 'Individual work', 'Silence / transition', 'Off-task'];
function Observation() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [sec, setSec] = useState(0), [run, setRun] = useState(false), [interval, setIntv] = useState(30);
  const ref = useRef<number>();
  useEffect(() => { if (run) ref.current = window.setInterval(() => setSec((x) => x + 1), 1000); return () => clearInterval(ref.current); }, [run]);
  const due = run && sec > 0 && sec % interval === 0;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={() => setRun(!run)}>{run ? 'Pause' : 'Start'}</button>
        <button className="btn-ghost" onClick={() => { setRun(false); setSec(0); setCounts({}); }}>Reset</button>
        <span className="font-mono text-lg">{String(Math.floor(sec / 60)).padStart(2, '0')}:{String(sec % 60).padStart(2, '0')}</span>
        <label className="text-sm">Record every <input type="number" className="input inline w-20" value={interval} min={5} onChange={(e) => setIntv(Math.max(5, +e.target.value))} /> s</label>
        {due && <span className="chip bg-amber-100 text-amber-900">Record now</span>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{OBS.map((o) => (
        <button key={o} className="btn-ghost justify-between" onClick={() => setCounts({ ...counts, [o]: (counts[o] || 0) + 1 })}>{o}<span className="chip">{counts[o] || 0}</span></button>))}</div>
      {total > 0 && <Bars groups={OBS.map((o) => ({ label: o.split(' ')[0], value: Math.round(((counts[o] || 0) / total) * 100) }))} />}
      {total > 0 && <p className="text-sm">Percentages of {total} recorded intervals.</p>}
    </div>
  );
}

/* ---------- Stakeholder map ---------- */
function Stakeholder() {
  const [list, setList] = useState([
    { n: 'Parents of Grade 8 girls', i: 'High', f: 'Low' }, { n: 'SDMC president', i: 'High', f: 'High' },
    { n: 'Head teacher', i: 'High', f: 'High' }, { n: 'Anganwadi worker', i: 'Low', f: 'Low' }, { n: 'Gram panchayat member', i: 'Low', f: 'High' },
  ]);
  const [n, setN] = useState('');
  const cell = (i: string, f: string) => list.filter((x) => x.i === i && x.f === f);
  const Q = ({ i, f, t }: { i: string; f: string; t: string }) => (
    <div className="border rounded-lg p-2 min-h-[90px]"><p className="text-xs font-semibold text-teal-800">{t}</p>
      {cell(i, f).map((x) => <p key={x.n} className="text-sm">• {x.n}</p>)}</div>);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Q i="High" f="High" t="Partner closely (high interest, high influence)" /><Q i="Low" f="High" t="Keep satisfied (low interest, high influence)" />
        <Q i="High" f="Low" t="Keep informed and involve (high interest, low influence)" /><Q i="Low" f="Low" t="Monitor (low interest, low influence)" />
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        <Field label="Add stakeholder" value={n} onChange={(e) => setN(e.target.value)} />
        {(['High', 'Low'] as const).flatMap((i) => (['High', 'Low'] as const).map((f) => (
          <button key={i + f} className="btn-ghost" disabled={!n.trim()} onClick={() => { setList([...list, { n, i, f }]); setN(''); }}>Interest {i} · Influence {f}</button>)))}
      </div>
    </div>
  );
}

/* ---------- Proposal builder ---------- */
const SECTIONS = [
  ['title', 'Title', 'e.g. Retention of Sethubandha gains from Grade 4 to Grade 5 in Yadgir district'],
  ['background', 'Background and need', 'Why this matters in your district; what State data show.'],
  ['review', 'Review of related literature', 'Key studies (DSERT/DIET compendia, NCERT, journals) and the gap.'],
  ['objectives', 'Objectives', '1. To… 2. To…'],
  ['questions', 'Research questions / hypotheses', ''],
  ['design', 'Design and method', 'Survey / quasi-experiment / case study / action research / mixed.'],
  ['sample', 'Population and sample', 'Population, sampling technique, sample size and justification.'],
  ['tools', 'Tools', 'Tests, questionnaires, schedules; reliability and validity; pilot plan.'],
  ['analysis', 'Data analysis', 'Descriptives; t-test / ANOVA / chi-square; thematic analysis.'],
  ['ethics', 'Ethical considerations', 'Consent, assent, anonymity, data storage, permissions.'],
  ['timeline', 'Timeline', 'Month-wise plan.'],
  ['budget', 'Budget', 'Travel, printing, honorarium for investigators.'],
  ['outcomes', 'Expected outcomes and use', 'Who will use the findings and how.'],
  ['references', 'References (APA 7)', ''],
] as const;
function Proposal() {
  const { s, set } = useStore();
  const [step, setStep] = useState(0);
  const [k, label, hint] = SECTIONS[step];
  const filled = SECTIONS.filter(([key]) => s.proposal[key]?.trim()).length;
  const html = `<html><head><meta charset="utf-8"><title>${s.proposal.title || 'Research Proposal'}</title></head><body style="font-family:Calibri,Arial;line-height:1.5">` +
    `<h1>${s.proposal.title || 'Research Proposal'}</h1><p>${s.name || ''}${s.institution ? ', ' + s.institution : ''}</p>` +
    SECTIONS.slice(1).map(([key, l]) => `<h2>${l}</h2><p>${(s.proposal[key] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`).join('') + '</body></html>';
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">{SECTIONS.map(([key, l], i) => (
        <button key={key} className={`text-xs ${i === step ? 'btn-primary' : s.proposal[key]?.trim() ? 'btn-ghost ring-1 ring-teal-600' : 'btn-ghost'}`} onClick={() => setStep(i)}>{i + 1}. {l.split(' ')[0]}</button>))}</div>
      <label className="block"><span className="label">{step + 1}. {label}</span>
        <textarea className="input min-h-[160px]" placeholder={hint} value={s.proposal[k] || ''} onChange={(e) => set((p) => ({ proposal: { ...p.proposal, [k]: e.target.value } }))} /></label>
      <div className="flex flex-wrap gap-2 items-center">
        <button className="btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
        <button className="btn-ghost" disabled={step === SECTIONS.length - 1} onClick={() => setStep(step + 1)}>Next section →</button>
        <button className="btn-primary" onClick={() => saveFile('research-proposal.docx', buildDocx(textToBlocks(s.proposal.title || 'Research Proposal', [['Researcher', [s.name, s.institution].filter(Boolean).join(', ')], ...SECTIONS.slice(1).map(([key, l]): [string, string] => [l, s.proposal[key] || ''])])))}>Export to Word (.docx)</button>
        {!hosted && <button className="btn-ghost" onClick={() => { const w = window.open(''); if (w) { w.document.write(html); w.document.close(); w.print(); } }}>Print / PDF</button>}
        <span className="text-sm text-slate-500">{filled}/{SECTIONS.length} sections drafted</span>
      </div>
    </div>
  );
}

/* ---------- Reference manager ---------- */
type Ref = { a: string; y: string; t: string; s: string };
function Literature() {
  const { s, set } = useStore();
  const refs: Ref[] = JSON.parse(s.proposal.__refs || '[]');
  const save = (r: Ref[]) => set((p) => ({ proposal: { ...p.proposal, __refs: JSON.stringify(r) } }));
  const [d, setD] = useState<Ref>({ a: '', y: '', t: '', s: '' });
  const apa = (r: Ref) => `${r.a} (${r.y || 'n.d.'}). ${r.t}. ${r.s}`.replace(/\.\./g, '.');
  const sorted = [...refs].sort((x, y) => x.a.localeCompare(y.a));
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-2">
        <Field label="Author(s) — Surname, A. A., & Surname, B." value={d.a} onChange={(e) => setD({ ...d, a: e.target.value })} />
        <Field label="Year" value={d.y} onChange={(e) => setD({ ...d, y: e.target.value })} />
        <Field label="Title" value={d.t} onChange={(e) => setD({ ...d, t: e.target.value })} />
        <Field label="Source (journal, volume(issue), pages / publisher / URL)" value={d.s} onChange={(e) => setD({ ...d, s: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" disabled={!d.a || !d.t} onClick={() => { save([...refs, d]); setD({ a: '', y: '', t: '', s: '' }); }}>Add reference</button>
        {refs.length > 0 && <button className="btn-ghost" onClick={() => set((p) => ({ proposal: { ...p.proposal, references: sorted.map(apa).join('\n') } }))}>Copy list into proposal</button>}
      </div>
      <ol className="space-y-1 pl-6 -indent-6">{sorted.map((r, i) => <li key={i} className="text-sm">{apa(r)} <button className="text-rose-700" onClick={() => save(refs.filter((x) => x !== r))} aria-label="Remove">✕</button></li>)}</ol>
      <p className="text-xs text-slate-500">Check journal quality against the UGC-CARE list before citing.</p>
    </div>
  );
}

/* ---------- Quality checklist ---------- */
const QC: [string, string[]][] = [
  ['Problem and questions', ['The problem is specific to a population and place', 'Questions are answerable with the planned data', 'A gap in earlier studies is stated']],
  ['Design and sample', ['Design matches the questions', 'Sampling method is described and justified', 'Sample size is calculated', 'A comparison group or baseline exists where cause is claimed']],
  ['Tools', ['Tools were piloted outside the sample', 'Reliability is reported', 'Content validity was checked by experts', 'Tools are in the participants\' language']],
  ['Ethics', ['Consent and assent are planned', 'Identifiers (SATS IDs, names) are removed', 'Findings will be shared back']],
  ['Analysis and reporting', ['Tests suit the data', 'Effect sizes are reported', 'Non-significant results are reported', 'Limitations are stated', 'Recommendations follow from findings']],
];
function Quality() {
  const [c, setC] = useState<Record<string, boolean>>({});
  const all = QC.flatMap(([, xs]) => xs), score = all.filter((x) => c[x]).length;
  return (
    <div className="space-y-3">
      {QC.map(([h, xs]) => <fieldset key={h}><legend className="font-semibold">{h}</legend>
        {xs.map((x) => <label key={x} className="flex gap-2 text-sm"><input type="checkbox" checked={!!c[x]} onChange={(e) => setC({ ...c, [x]: e.target.checked })} />{x}</label>)}</fieldset>)}
      <p className="ka"><strong>{score}/{all.length}</strong> criteria met. {score === all.length ? 'Ready for external review.' : 'Unchecked items are your revision list.'}</p>
    </div>
  );
}

const VIEWS: Record<ToolId, () => JSX.Element> = { rq: RQ, ethics: Ethics, sample: Sample, stats: Stats, survey: Survey, coding: Coding, mixed: Mixed, journal: Journal, observation: Observation, stakeholder: Stakeholder, proposal: Proposal, literature: Literature, quality: Quality };
export function ToolView({ id }: { id: ToolId }) { const V = VIEWS[id]; return <V />; }

export default function Tools({ id }: { id?: ToolId }) {
  if (id && VIEWS[id]) return (
    <div className="max-w-3xl mx-auto space-y-3">
      <a href="#/tools" className="text-sm text-teal-700">← All tools</a>
      <h2 className="text-2xl font-bold text-teal-900">{TOOL_META[id].name} · <span lang="kn">{TOOL_META[id].kn}</span></h2>
      <p className="text-slate-600">{TOOL_META[id].desc}</p>
      <div className="card"><ToolView id={id} /></div>
    </div>
  );
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {(Object.keys(TOOL_META) as ToolId[]).map((k) => (
        <a key={k} href={`#/tools/${k}`} className="card hover:border-teal-600"><h3 className="font-semibold text-teal-900">{TOOL_META[k].name}</h3><p lang="kn" className="text-sm text-teal-800">{TOOL_META[k].kn}</p><p className="text-sm text-slate-600">{TOOL_META[k].desc}</p></a>))}
    </div>
  );
}
