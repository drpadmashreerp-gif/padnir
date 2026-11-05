// Part II tools: alignment matrix, AI prompt planner, data screening, technique chooser,
// EFA, CFA reliability/validity, SEM fit checker and bootstrap mediation.
import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { DownloadButton } from '../lib/DownloadButton';
import type { Block } from '../lib/docx';
import * as mv from '../lib/multivariate';
import { chiUpperP } from '../lib/stats';
import { TRSE_ITEMS, trseData, toCsv, screeningCsv, mediationCsv } from '../data/samples';

const f2 = (n: number | undefined, d = 2) => (n === undefined || !Number.isFinite(n) ? '—' : n.toFixed(d).replace(/^(-?)0\./, '$1.'));
const Area = ({ label, id, ...p }: { label: string; id: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <label className="block" htmlFor={id}><span className="label">{label}</span><textarea id={id} className="input min-h-[120px] font-mono text-xs" {...p} /></label>
);
const Tone = ({ v }: { v: 'good' | 'acceptable' | 'poor' | 'n/a' }) =>
  <span className={`chip ${v === 'good' ? 'bg-emerald-100 text-emerald-900' : v === 'acceptable' ? 'bg-amber-100 text-amber-900' : v === 'poor' ? 'bg-rose-100 text-rose-900' : ''}`}>{v === 'good' ? '✓ good' : v === 'acceptable' ? '~ acceptable' : v === 'poor' ? '✗ poor' : 'n/a'}</span>;
async function copy(text: string) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }

/* ---------- Alignment matrix ---------- */
const ALIGN_COLS = ['Research question', 'Objective', 'Hypothesis', 'Data source / tool', 'Analysis'];
export function Align() {
  const { s, set } = useStore();
  const rows: string[][] = (() => { try { return JSON.parse(s.proposal.__align || 'null') ?? null; } catch { return null; } })() ?? [
    ['RQ1: What is the change in Kannada reading scores from June (Grade 4) to March (Grade 5)?', 'To estimate retention of Sethubandha gains', 'H1: End-of-Grade-5 scores remain above the June baseline', 'LBA reading scores; graded reading test', 'Paired t-test; Cohen\'s d'],
    ['RQ2: Which school factors are associated with retention?', 'To identify school factors linked with retention', 'H2: Weekly library periods predict higher retention', 'Head-teacher survey', 'Multiple regression / SEM'],
  ];
  const save = (r: string[][]) => set((p) => ({ proposal: { ...p.proposal, __align: JSON.stringify(r) } }));
  const gaps = rows.filter((r) => r[0].trim() && (!r[1].trim() || !r[3].trim() || !r[4].trim())).length;
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">One row per research question. Empty cells show where the proposal is not yet aligned. (The first rows are an example; replace them.)</p>
      <div className="overflow-x-auto"><table className="text-sm w-full min-w-[720px]"><thead><tr>{ALIGN_COLS.map((c) => <th key={c} className="text-left">{c}</th>)}<th /></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (
          <td key={j} className="align-top"><textarea aria-label={`${ALIGN_COLS[j]} row ${i + 1}`} className={`input min-h-[70px] ${r[0].trim() && !c.trim() ? 'border-amber-500' : ''}`} value={c}
            onChange={(e) => save(rows.map((rr, ii) => (ii === i ? rr.map((cc, jj) => (jj === j ? e.target.value : cc)) : rr)))} /></td>))}
          <td><button className="text-rose-700 text-sm" aria-label="Remove row" onClick={() => save(rows.filter((_, ii) => ii !== i))}>✕</button></td></tr>)}</tbody></table></div>
      <div className="flex flex-wrap gap-2 items-center">
        <button className="btn-ghost" onClick={() => save([...rows, ['', '', '', '', '']])}>Add question</button>
        <DownloadButton label="Download matrix (.docx)" filename="Alignment-Matrix.docx" make={() => [{ t: 'title', text: 'Research Alignment Matrix\nಸಂಶೋಧನಾ ಹೊಂದಾಣಿಕೆ ಕೋಷ್ಟಕ' }, { t: 'table', rows: [ALIGN_COLS, ...rows] }]} />
        <span className={`text-sm ${gaps ? 'text-amber-800' : 'text-emerald-800'}`}>{gaps ? `${gaps} question(s) lack an objective, data source or analysis.` : 'Every question has an objective, data source and analysis.'}</span>
      </div>
    </div>
  );
}

/* ---------- AI prompt planner and responsible-use checklist ---------- */
const TASKS: Record<string, { label: string; prompt: (t: string, c: string) => string; verify: string }> = {
  outline: { label: 'Outline a literature review', prompt: (t, c) => `I am a teacher educator preparing a literature review on "${t}". Context: ${c}. Suggest a structure of 5–7 headings with one sentence on what each should cover and what kinds of studies (design, setting) to search for. Do not list or invent specific references.`, verify: 'Search each heading yourself in Shodhganga, ERIC, Google Scholar and DSERT compendia; keep only studies you have opened.' },
  questions: { label: 'Sharpen research questions', prompt: (t, c) => `My research topic is "${t}". Context: ${c}. Suggest three focused research questions that name the population, variable, place and comparison, and judge each against FINER (feasible, interesting, novel, ethical, relevant).`, verify: 'Check each question against your alignment matrix and the data you can actually collect.' },
  explain: { label: 'Explain a statistical output', prompt: (t, c) => `Explain in plain language how to interpret this output from ${t}: ${c}. Say what each number means, which thresholds are commonly used, and what I should not conclude from it.`, verify: 'Paste only numbers, never raw data with names or IDs. Check thresholds against a methods textbook.' },
  code: { label: 'Write or fix analysis code', prompt: (t, c) => `Write commented ${t} code to ${c}. Use a small made-up example dataset with the same column names so I can test it before running it on my real data.`, verify: 'Run it on dummy data first; read every line; never upload the real dataset.' },
  language: { label: 'Improve clarity of my own paragraph', prompt: (t, c) => `Improve the clarity and grammar of this paragraph from my ${t} without changing its meaning, claims or citations. Show the changes. Paragraph: ${c}`, verify: 'Confirm no claim, number or citation was changed or added.' },
};
const CHECK = [
  'I have decided what the tool may and may not do in this project.',
  'No personal or identifiable data (names, SATS numbers, phone numbers, transcripts) will be uploaded.',
  'Every fact, number and citation from the tool will be verified at the original source.',
  'I will keep my prompts and the tool\'s outputs as part of my audit trail.',
  'The interpretation, conclusions and recommendations are my own.',
  'I have checked the target journal\'s policy on AI use.',
  'AI use will be disclosed in the methods or acknowledgements.',
  'The AI tool will not be listed as an author.',
];
export function AiPrompt() {
  const [task, setTask] = useState('outline'), [topic, setTopic] = useState('multigrade teaching in Karnataka government primary schools'), [ctx, setCtx] = useState('DIET study in two blocks of Chamarajanagara; English and Kannada sources');
  const [checks, setChecks] = useState<boolean[]>(CHECK.map(() => false)), [tool, setTool] = useState(''), [use, setUse] = useState('outlining the literature review and improving the clarity of the English text'), [copied, setCopied] = useState(false);
  const t = TASKS[task]; const prompt = t.prompt(topic, ctx);
  const disclosure = `Use of AI tools: ${tool || '[tool name and version]'} was used for ${use}. All AI-assisted content was reviewed, verified against original sources and edited by the author(s), who take full responsibility for the content of this work. No personal or identifiable data were shared with the tool.`;
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block"><span className="label">Task</span><select id="ai-task" className="input" value={task} onChange={(e) => setTask(e.target.value)}>{Object.entries(TASKS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
        <label className="block"><span className="label">{task === 'code' ? 'Language (R or Python)' : task === 'explain' ? 'Analysis (e.g. AMOS CFA)' : task === 'language' ? 'Section (e.g. discussion)' : 'Topic'}</span><input id="ai-topic" className="input" value={topic} onChange={(e) => setTopic(e.target.value)} /></label>
      </div>
      <label className="block"><span className="label">{task === 'code' ? 'What the code should do' : task === 'explain' ? 'The output (numbers only)' : task === 'language' ? 'Your paragraph (no personal data)' : 'Context'}</span><textarea id="ai-ctx" className="input min-h-[70px]" value={ctx} onChange={(e) => setCtx(e.target.value)} /></label>
      <div className="ka space-y-2"><p className="font-semibold">Prompt</p><p className="whitespace-pre-wrap text-sm">{prompt}</p>
        <button className="btn-ghost" onClick={async () => setCopied(await copy(prompt))}>{copied ? 'Copied ✓' : 'Copy prompt'}</button>
        <p className="text-sm"><strong>Before you use the answer:</strong> {t.verify}</p></div>
      <fieldset className="card"><legend className="font-semibold px-1">Responsible AI checklist · ಜವಾಬ್ದಾರಿಯುತ AI ಪರಿಶೀಲನಾ ಪಟ್ಟಿ</legend>
        {CHECK.map((c, i) => <label key={c} className="flex gap-2 text-sm py-0.5"><input type="checkbox" checked={checks[i]} onChange={(e) => setChecks(checks.map((x, j) => (j === i ? e.target.checked : x)))} />{c}</label>)}
        <p className={`text-sm mt-2 ${checks.every(Boolean) ? 'text-emerald-800' : 'text-amber-800'}`}>{checks.filter(Boolean).length}/{CHECK.length} confirmed{checks.every(Boolean) ? ' — ready to use AI responsibly.' : '.'}</p></fieldset>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block"><span className="label">AI tool and version</span><input id="ai-tool" className="input" placeholder="e.g. Claude (Anthropic), November 2026" value={tool} onChange={(e) => setTool(e.target.value)} /></label>
        <label className="block"><span className="label">Used for</span><input id="ai-use" className="input" value={use} onChange={(e) => setUse(e.target.value)} /></label>
      </div>
      <p className="ka text-sm">{disclosure}</p>
      <DownloadButton label="Download disclosure and checklist (.docx)" filename="AI-Use-Disclosure.docx" make={() => [
        { t: 'title', text: 'AI Use Disclosure\nAI ಬಳಕೆ ಘೋಷಣೆ' }, { t: 'p', text: disclosure }, { t: 'h1', text: 'Responsible AI checklist' },
        ...CHECK.map((c, i): Block => ({ t: 'bullet', text: `${checks[i] ? '☑' : '☐'} ${c}` }))]} />
    </div>
  );
}

/* ---------- Data screening ---------- */
export function Screen() {
  const [text, setText] = useState(screeningCsv()), [lo, setLo] = useState(1), [hi, setHi] = useState(5);
  const t = mv.parseTable(text);
  const out = useMemo(() => {
    if (!t) return null;
    const { header, rows } = t;
    const clean = rows.map((r) => r.map((v) => (Number.isFinite(v) && v >= lo && v <= hi ? v : NaN)));
    const range = rows.flatMap((r, i) => r.map((v, j) => (Number.isFinite(v) && (v < lo || v > hi) ? `row ${i + 1}, ${header[j]} = ${v}` : '')).filter(Boolean));
    const cols = header.map((h, j) => {
      const xs = clean.map((r) => r[j]).filter(Number.isFinite);
      const m = xs.length > 1 ? mv.mean(xs) : NaN, s = xs.length > 1 ? mv.sd(xs) : NaN;
      const sh = xs.length > 3 ? mv.shape(xs) : { skew: NaN, kurt: NaN };
      const outl = clean.map((r, i) => (Number.isFinite(r[j]) && Math.abs((r[j] - m) / s) > 3.29 ? i + 1 : 0)).filter(Boolean);
      return { h, n: xs.length, miss: rows.length - xs.length, m, s, ...sh, outl };
    });
    const straight = clean.map((r, i) => (r.every(Number.isFinite) && new Set(r).size === 1 ? i + 1 : 0)).filter(Boolean);
    const complete = clean.filter((r) => r.every(Number.isFinite));
    const alpha = complete.length > 2 && header.length > 1 ? mv.cronbachAlpha(complete) : NaN;
    const missPct = (clean.flat().filter((v) => !Number.isFinite(v)).length / clean.flat().length) * 100;
    return { cols, straight, complete: complete.length, alpha, range, missPct, n: rows.length };
  }, [text, lo, hi]);
  const report = () => out ? [`Data screening report (${out.n} cases, ${t!.header.length} variables)`, `Out-of-range values (${lo}–${hi}): ${out.range.join('; ') || 'none'}`,
    `Missing: ${out.missPct.toFixed(1)}% of cells; complete cases: ${out.complete}`, `Straight-lining rows: ${out.straight.join(', ') || 'none'}`,
    `Cronbach's alpha (complete cases): ${f2(out.alpha)}`, '', 'Variable,n,missing,mean,sd,skewness,kurtosis,|z|>3.29 rows',
    ...out.cols.map((c) => [c.h, c.n, c.miss, f2(c.m), f2(c.s), f2(c.skew), f2(c.kurt), c.outl.join(' ')].join(','))].join('\n') : '';
  return (
    <div className="space-y-3">
      <Area id="scr-data" label="Paste data with a header row (comma or tab separated; blank = missing). Sample: 60 teachers × 6 research self-efficacy items." value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-sm">Valid range <input aria-label="Lowest valid value" type="number" className="input inline w-16" value={lo} onChange={(e) => setLo(+e.target.value)} /> to <input aria-label="Highest valid value" type="number" className="input inline w-16" value={hi} onChange={(e) => setHi(+e.target.value)} /></label>
        <button className="btn-ghost" onClick={() => setText(screeningCsv())}>Load sample</button>
        {out && <DownloadButton label="Download report (.txt)" filename="data-screening-report.txt" make={report} />}
      </div>
      {!out ? <p className="text-rose-700 text-sm">Paste at least a header row and one data row.</p> : (<>
        <div className="grid sm:grid-cols-4 gap-2">
          {[['Cases', out.n], ['Missing cells', out.missPct.toFixed(1) + '%'], ['Complete cases', out.complete], ['Cronbach\'s α', f2(out.alpha)]].map(([k, v]) => <div key={k as string} className="card"><p className="text-xs text-slate-500">{k}</p><p className="text-xl font-bold">{v}</p></div>)}
        </div>
        <div className="overflow-x-auto"><table className="text-sm w-full"><thead><tr className="text-left"><th>Item</th><th>n</th><th>Missing</th><th>Mean</th><th>SD</th><th>Skew</th><th>Kurtosis</th><th>Outlier rows (|z| &gt; 3.29)</th></tr></thead>
          <tbody>{out.cols.map((c) => <tr key={c.h} className="border-t"><td>{c.h}</td><td>{c.n}</td><td className={c.miss ? 'text-amber-700 font-semibold' : ''}>{c.miss}</td><td>{f2(c.m)}</td><td>{f2(c.s)}</td>
            <td className={Math.abs(c.skew) > 2 ? 'text-rose-700' : ''}>{f2(c.skew)}</td><td className={Math.abs(c.kurt) > 7 ? 'text-rose-700' : ''}>{f2(c.kurt)}</td><td>{c.outl.join(', ') || '—'}</td></tr>)}</tbody></table></div>
        <div className="ka text-sm space-y-1">
          <p><strong>Out of range ({lo}–{hi}), treated as missing:</strong> {out.range.join('; ') || 'none'}</p>
          <p><strong>Straight-lining (same answer to every item):</strong> {out.straight.length ? `rows ${out.straight.join(', ')} — check these responses; consider excluding them and report it.` : 'none'}</p>
          <p><strong>Missing data:</strong> {out.missPct < 5 ? 'under 5% — usually acceptable; report the amount and pattern.' : '5% or more — examine the pattern and use multiple imputation or FIML rather than deleting cases.'}</p>
          <p><strong>Normality:</strong> skewness within ±2 and kurtosis within ±7 are usually acceptable for maximum-likelihood SEM.</p>
        </div>
      </>)}
    </div>
  );
}

/* ---------- Technique chooser ---------- */
export function Chooser() {
  const [aim, setAim] = useState('compare'), [dv, setDv] = useState('continuous'), [groups, setGroups] = useState('2'), [paired, setPaired] = useState(false), [normal, setNormal] = useState(true);
  const rec = (() => {
    if (aim === 'explore') return ['Exploratory factor analysis (EFA)', 'SPSS: Analyze → Dimension Reduction → Factor · R: psych::fa · Python: factor_analyzer', 'Check KMO and Bartlett first (EFA tool).'];
    if (aim === 'confirm') return ['Confirmatory factor analysis (CFA)', 'AMOS · R: lavaan::cfa · Python: semopy', 'Report fit, loadings, CR, AVE and discriminant validity (CFA calculator).'];
    if (aim === 'model') return ['Structural equation modelling (SEM)', 'AMOS · R: lavaan::sem · SmartPLS for PLS-SEM', 'Validate the measurement model first; test mediation with bootstrapping.'];
    if (aim === 'predict') return dv === 'binary' ? ['Binary logistic regression', 'SPSS: Analyze → Regression → Binary Logistic · R: glm(family = binomial)', 'Report odds ratios with 95% CI.'] : ['Multiple linear regression', 'SPSS: Analyze → Regression → Linear · R: lm()', 'Check VIF < 5 and residual plots.'];
    if (aim === 'relate') return dv === 'categorical' ? ['Chi-square test of independence', 'SPSS: Analyze → Descriptive Statistics → Crosstabs', 'Report Cramér\'s V; expected counts ≥ 5.'] : normal ? ['Pearson correlation', 'SPSS: Analyze → Correlate → Bivariate', 'Non-parametric alternative: Spearman ρ.'] : ['Spearman rank correlation', 'SPSS: Analyze → Correlate → Bivariate (Spearman)', 'Use when data are ordinal or clearly non-normal.'];
    if (dv === 'categorical') return ['Chi-square test', 'SPSS: Crosstabs', 'For paired yes/no data use McNemar\'s test.'];
    if (groups === '2') return paired ? (normal ? ['Paired t-test', 'SPSS: Compare Means → Paired-Samples T Test', 'Non-parametric: Wilcoxon signed-rank.'] : ['Wilcoxon signed-rank test', 'SPSS: Nonparametric Tests → Related Samples', 'Report median difference and r effect size.'])
      : (normal ? ['Independent-samples t-test (Welch)', 'SPSS: Compare Means → Independent-Samples T Test', 'Non-parametric: Mann–Whitney U.'] : ['Mann–Whitney U test', 'SPSS: Nonparametric Tests → Independent Samples', 'Report medians and r effect size.']);
    return paired ? ['Repeated-measures ANOVA', 'SPSS: General Linear Model → Repeated Measures', 'Non-parametric: Friedman test.'] : (normal ? ['One-way ANOVA', 'SPSS: Compare Means → One-Way ANOVA', 'Follow with post-hoc tests; non-parametric: Kruskal–Wallis.'] : ['Kruskal–Wallis test', 'SPSS: Nonparametric Tests → Independent Samples', 'Follow with pairwise comparisons.']);
  })();
  const Opt = ({ v, cur, set, children }: { v: string; cur: string; set: (x: string) => void; children: React.ReactNode }) => <button className={cur === v ? 'btn-primary' : 'btn-ghost'} onClick={() => set(v)}>{children}</button>;
  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">1. What is your aim?</p>
      <div className="flex flex-wrap gap-1">{[['compare', 'Compare groups'], ['relate', 'Relate two variables'], ['predict', 'Predict an outcome'], ['explore', 'Explore a scale\'s structure'], ['confirm', 'Confirm a scale\'s structure'], ['model', 'Test a model of constructs']].map(([v, l]) => <Opt key={v} v={v} cur={aim} set={setAim}>{l}</Opt>)}</div>
      {['compare', 'relate', 'predict'].includes(aim) && <>
        <p className="font-semibold text-sm">2. What kind of outcome variable?</p>
        <div className="flex flex-wrap gap-1">{[['continuous', 'Scores / continuous'], ['categorical', 'Categories'], ...(aim === 'predict' ? [['binary', 'Yes / no']] : [])].map(([v, l]) => <Opt key={v} v={v} cur={dv} set={setDv}>{l}</Opt>)}</div>
      </>}
      {aim === 'compare' && dv === 'continuous' && <>
        <p className="font-semibold text-sm">3. How many groups or occasions?</p>
        <div className="flex flex-wrap gap-1"><Opt v="2" cur={groups} set={setGroups}>Two</Opt><Opt v="3" cur={groups} set={setGroups}>Three or more</Opt>
          <label className="flex items-center gap-1 text-sm ml-2"><input type="checkbox" checked={paired} onChange={(e) => setPaired(e.target.checked)} /> Same people measured each time (paired)</label></div>
      </>}
      {(aim === 'compare' || aim === 'relate') && dv === 'continuous' && <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={normal} onChange={(e) => setNormal(e.target.checked)} /> Data roughly normal and interval-level (n ≥ 30 per group helps)</label>}
      <div className="ka"><p className="text-lg font-bold">{rec[0]}</p><p className="text-sm">{rec[1]}</p><p className="text-sm">{rec[2]}</p></div>
    </div>
  );
}

/* ---------- EFA ---------- */
export function Efa() {
  const sample = () => toCsv(TRSE_ITEMS.map(([k]) => k), trseData());
  const [text, setText] = useState(sample), [k, setK] = useState(0), [cut, setCut] = useState(0.4);
  const res = useMemo(() => {
    const t = mv.parseTable(text); if (!t) return { err: 'Paste data with a header row.' };
    const rows = t.rows.filter((r) => r.every(Number.isFinite));
    if (rows.length < t.header.length + 2) return { err: 'Need more complete cases than items.' };
    try {
      const R = mv.corrMatrix(rows); const kb = mv.kmoBartlett(R, rows.length); const eig = mv.eigenSym(R).values;
      const nf = k || Math.max(1, eig.filter((v) => v > 1).length);
      const pa = mv.principalAxis(R, nf); const L = nf > 1 ? mv.varimax(pa.loadings) : pa.loadings;
      const ss = Array.from({ length: nf }, (_, f) => L.reduce((a, r) => a + r[f] ** 2, 0));
      return { header: t.header, n: rows.length, kb, eig, nf, L, comm: pa.communalities, ss };
    } catch (e) { return { err: (e as Error).message }; }
  }, [text, k]);
  if ('err' in res) return <div className="space-y-2"><Area id="efa-data" label="Data" value={text} onChange={(e) => setText(e.target.value)} /><p className="text-rose-700 text-sm">{res.err}</p></div>;
  const p = res.header.length; const maxE = Math.max(...res.eig);
  const pBart = res.kb.chi2 > 0 ? 'p < .001' : '';
  const kmoV: 'good' | 'acceptable' | 'poor' = res.kb.kmo >= 0.8 ? 'good' : res.kb.kmo >= 0.6 ? 'acceptable' : 'poor';
  const label = (h: string) => TRSE_ITEMS.find(([c]) => c === h)?.[1];
  const loadCsv = () => ['Item,' + Array.from({ length: res.nf }, (_, f) => `F${f + 1}`).join(',') + ',Communality', ...res.L.map((r, i) => [res.header[i], ...r.map((x) => x.toFixed(3)), res.comm[i].toFixed(3)].join(','))].join('\n');
  return (
    <div className="space-y-3">
      <Area id="efa-data" label={`Item responses with a header row. Sample: 220 respondents × 12 research self-efficacy items (illustrative).`} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <label>Factors: <select aria-label="Number of factors" className="input inline w-auto" value={k} onChange={(e) => setK(+e.target.value)}><option value={0}>Auto (eigenvalue &gt; 1)</option>{Array.from({ length: Math.min(6, p - 1) }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>
        <label>Hide loadings below <select aria-label="Hide loadings below" className="input inline w-auto" value={cut} onChange={(e) => setCut(+e.target.value)}>{[0, 0.3, 0.4, 0.5].map((c) => <option key={c} value={c}>{c === 0 ? 'show all' : c}</option>)}</select></label>
        <button className="btn-ghost" onClick={() => setText(sample())}>Load sample</button>
        <DownloadButton label="Download loadings (CSV)" filename="efa-loadings.csv" make={loadCsv} />
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        <div className="card"><p className="text-xs text-slate-500">KMO (sampling adequacy)</p><p className="text-xl font-bold">{f2(res.kb.kmo)} <Tone v={kmoV} /></p></div>
        <div className="card"><p className="text-xs text-slate-500">Bartlett's test</p><p className="text-lg font-bold">χ²({res.kb.df}) = {res.kb.chi2.toFixed(1)}</p><p className="text-xs">{pBart}</p></div>
        <div className="card"><p className="text-xs text-slate-500">Variance explained ({res.nf} factor{res.nf > 1 ? 's' : ''}, after extraction)</p><p className="text-xl font-bold">{(res.ss.reduce((a, b) => a + b, 0) / p * 100).toFixed(1)}%</p></div>
      </div>
      <div className="card"><p className="font-semibold text-sm mb-1">Scree plot (eigenvalues; dashed line = 1)</p>
        <svg viewBox={`0 0 ${40 + p * 36} 150`} className="w-full max-w-xl" role="img" aria-label={`Scree plot. Eigenvalues: ${res.eig.map((e) => e.toFixed(2)).join(', ')}`}>
          <line x1="30" x2={30 + p * 36} y1={120 - (1 / maxE) * 100} y2={120 - (1 / maxE) * 100} stroke="#b45309" strokeDasharray="4 3" />
          <polyline fill="none" stroke="#0f766e" strokeWidth="2" points={res.eig.map((e, i) => `${45 + i * 36},${120 - (e / maxE) * 100}`).join(' ')} />
          {res.eig.map((e, i) => <g key={i}><circle cx={45 + i * 36} cy={120 - (e / maxE) * 100} r="4" fill={e > 1 ? '#0f766e' : '#94a3b8'} />
            <text x={45 + i * 36} y={138} fontSize="9" textAnchor="middle" fill="currentColor">{i + 1}</text>
            <text x={45 + i * 36} y={112 - (e / maxE) * 100} fontSize="8" textAnchor="middle" fill="currentColor">{e.toFixed(2)}</text></g>)}
        </svg></div>
      <div className="overflow-x-auto"><table className="text-sm w-full"><thead><tr className="text-left"><th>Item</th>{Array.from({ length: res.nf }, (_, f) => <th key={f} className="text-center">F{f + 1}</th>)}<th className="text-center">h²</th></tr></thead>
        <tbody>{res.L.map((r, i) => { const abs = r.map(Math.abs); const top = abs.indexOf(Math.max(...abs)); return (
          <tr key={i} className="border-t"><td><span className="font-semibold">{res.header[i]}</span>{label(res.header[i]) && <span className="block text-xs text-slate-500">{label(res.header[i])}</span>}</td>
            {r.map((x, f) => <td key={f} className={`text-center ${Math.abs(x) >= 0.5 && f === top ? 'font-bold text-teal-800' : ''}`}>{Math.abs(x) >= cut ? f2(x) : ''}</td>)}
            <td className={`text-center ${res.comm[i] < 0.4 ? 'text-amber-700' : ''}`}>{f2(res.comm[i])}</td></tr>); })}</tbody>
        <tfoot><tr className="border-t text-xs"><td>SS loadings</td>{res.ss.map((v, f) => <td key={f} className="text-center">{v.toFixed(2)}</td>)}<td /></tr></tfoot></table></div>
      <p className="text-xs text-slate-500">Principal axis factoring with varimax rotation (Kaiser normalisation), on {res.n} complete cases. Bold = primary loading ≥ .50; amber h² = communality below .40. For correlated factors, confirm with an oblique rotation (promax/oblimin) in SPSS, R or Python.</p>
    </div>
  );
}

/* ---------- CFA reliability and validity ---------- */
export function Cfa() {
  const [loadText, setLoadText] = useState('Problem framing: .81, .78, .74, .70\nData analysis: .84, .79, .72, .68\nCommunication: .86, .80, .75, .71');
  const [corrText, setCorrText] = useState('Problem framing, Data analysis: .52\nProblem framing, Communication: .41\nData analysis, Communication: .58');
  const factors = loadText.trim().split('\n').map((l) => { const [name, rest] = l.split(':'); return { name: name?.trim(), l: (rest ?? '').split(/[,\s]+/).map(Number).filter((x) => Number.isFinite(x) && x !== 0) }; }).filter((x) => x.name && x.l.length);
  const res = factors.map((x) => ({ ...x, ...mv.crAve(x.l), min: Math.min(...x.l) }));
  const corr: Record<string, number> = {};
  corrText.trim().split('\n').forEach((l) => { const m = l.match(/^(.*?),(.*?):\s*([-\d.]+)/); if (m) { const a = m[1].trim(), b = m[2].trim(), r = Number(m[3]); corr[`${a}|${b}`] = r; corr[`${b}|${a}`] = r; } });
  const tbl = [['Factor', 'Items', 'Lowest loading', 'CR', 'AVE', '√AVE'], ...res.map((r) => [r.name, String(r.l.length), f2(r.min), f2(r.cr), f2(r.ave), f2(Math.sqrt(r.ave))])];
  const fl = [['', ...res.map((r) => r.name)], ...res.map((a) => [a.name, ...res.map((b) => (a.name === b.name ? f2(Math.sqrt(a.ave)) : corr[`${a.name}|${b.name}`] !== undefined ? f2(corr[`${a.name}|${b.name}`]) : '—'))])];
  const dvOk = res.every((a) => res.every((b) => a.name === b.name || corr[`${a.name}|${b.name}`] === undefined || Math.sqrt(a.ave) > Math.abs(corr[`${a.name}|${b.name}`])));
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Area id="cfa-load" label="Standardised loadings — one factor per line: Name: λ1, λ2, …" value={loadText} onChange={(e) => setLoadText(e.target.value)} />
        <Area id="cfa-corr" label="Factor correlations — one pair per line: Name A, Name B: r" value={corrText} onChange={(e) => setCorrText(e.target.value)} />
      </div>
      <div className="overflow-x-auto"><table className="text-sm w-full"><thead><tr className="text-left">{tbl[0].map((h) => <th key={h}>{h}</th>)}<th>Verdict</th></tr></thead>
        <tbody>{res.map((r, i) => <tr key={r.name} className="border-t">{tbl[i + 1].map((c, j) => <td key={j}>{c}</td>)}
          <td><Tone v={r.cr >= 0.7 && r.ave >= 0.5 ? 'good' : r.cr >= 0.6 ? 'acceptable' : 'poor'} /></td></tr>)}</tbody></table></div>
      <p className="font-semibold text-sm">Fornell–Larcker table (diagonal = √AVE)</p>
      <div className="overflow-x-auto"><table className="text-sm w-full"><tbody>{fl.map((r, i) => <tr key={i} className={i ? 'border-t' : 'font-semibold'}>{r.map((c, j) => <td key={j} className={i && j === i ? 'font-bold text-teal-800' : ''}>{c}</td>)}</tr>)}</tbody></table></div>
      <div className="ka text-sm space-y-1">
        <p><strong>Reliability:</strong> CR ≥ .70 for {res.filter((r) => r.cr >= 0.7).length} of {res.length} factors.</p>
        <p><strong>Convergent validity:</strong> AVE ≥ .50 for {res.filter((r) => r.ave >= 0.5).length} of {res.length} factors{res.some((r) => r.ave < 0.5 && r.cr >= 0.6) ? ' (where AVE < .50 but CR ≥ .60, convergent validity may still be judged adequate — say so explicitly).' : '.'}</p>
        <p><strong>Discriminant validity (Fornell–Larcker):</strong> {dvOk ? 'supported — each √AVE exceeds that factor\'s correlations.' : 'not supported for at least one pair — check HTMT and item wording.'}</p>
      </div>
      <DownloadButton label="Download tables (.docx)" filename="CFA-Reliability-Validity.docx" make={() => [{ t: 'title', text: 'Measurement Model: Reliability and Validity' }, { t: 'table', rows: tbl }, { t: 'h2', text: 'Fornell–Larcker criterion (diagonal = √AVE)' }, { t: 'table', rows: fl }, { t: 'note', text: 'CR = (Σλ)² / [(Σλ)² + Σ(1 − λ²)]; AVE = Σλ² / k. Thresholds: CR ≥ .70, AVE ≥ .50 (Fornell & Larcker, 1981; Hair et al.).' }]} />
    </div>
  );
}

/* ---------- SEM fit checker ---------- */
export function Fit() {
  const [v, setV] = useState({ chi2: '141.6', df: '87', n: '260', cfi: '.97', tli: '.96', rmsea: '', srmr: '.046' });
  const num = (x: string) => (x.trim() === '' ? undefined : Number(x));
  const r = mv.judgeFit({ chi2: num(v.chi2), df: num(v.df), n: num(v.n), cfi: num(v.cfi), tli: num(v.tli), rmsea: num(v.rmsea), srmr: num(v.srmr) });
  const okAll = r.rows.filter((x) => x.verdict !== 'n/a');
  const overall = okAll.every((x) => x.verdict === 'good') ? 'good' : okAll.some((x) => x.verdict === 'poor') ? 'mixed — inspect residuals and theory before modifying' : 'acceptable';
  const p = num(v.chi2) !== undefined && num(v.df) ? chiUpperP(num(v.chi2)!, num(v.df)!) : undefined;
  const sentence = `The model showed ${overall.split(' ')[0]} fit to the data, χ²(${v.df || '…'}${v.n ? `, N = ${v.n}` : ''}) = ${v.chi2 || '…'}${p !== undefined ? `, p ${p < 0.001 ? '< .001' : '= ' + f2(p, 3)}` : ''}, χ²/df = ${f2(r.rows[0].value)}, CFI = ${f2(num(v.cfi))}, TLI = ${f2(num(v.tli))}, RMSEA = ${f2(r.rmsea, 3)}, SRMR = ${f2(num(v.srmr), 3)}.`;
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{([['chi2', 'χ²'], ['df', 'df'], ['n', 'N'], ['cfi', 'CFI'], ['tli', 'TLI'], ['rmsea', 'RMSEA (blank = compute)'], ['srmr', 'SRMR']] as const).map(([k, l]) => (
        <label key={k} className="block"><span className="label">{l}</span><input id={`fit-${k}`} className="input" inputMode="decimal" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>))}</div>
      <table className="text-sm w-full"><thead><tr className="text-left"><th>Index</th><th>Value</th><th>Guideline</th><th>Verdict</th></tr></thead>
        <tbody>{r.rows.map((x) => <tr key={x.index} className="border-t"><td>{x.index}</td><td>{f2(x.value, 3)}</td><td className="text-slate-600">{x.rule}</td><td><Tone v={x.verdict} /></td></tr>)}</tbody></table>
      <div className="ka text-sm"><p className="font-semibold">Overall: {overall}</p><p>{sentence}</p>
        <button className="btn-ghost mt-1" onClick={async () => setCopied(await copy(sentence))}>{copied ? 'Copied ✓' : 'Copy sentence'}</button></div>
      <p className="text-xs text-slate-500">Guidelines from Hu & Bentler (1999) and Kline (2016). Judge fit from several indices together, and never modify a model only to improve fit.</p>
    </div>
  );
}
/* ---------- Mediation ---------- */
export function Mediation() {
  const [text, setText] = useState(mediationCsv), [cols, setCols] = useState([0, 1, 2]), [res, setRes] = useState<ReturnType<typeof mv.mediation> | null>(null), [err, setErr] = useState('');
  const t = mv.parseTable(text);
  const run = () => {
    if (!t) return setErr('Paste data with a header row.');
    const rows = t.rows.filter((r) => cols.every((c) => Number.isFinite(r[c])));
    if (rows.length < 20) return setErr('Need at least 20 complete cases.');
    try { setErr(''); setRes(mv.mediation(rows.map((r) => r[cols[0]]), rows.map((r) => r[cols[1]]), rows.map((r) => r[cols[2]]), 2000)); } catch (e) { setErr((e as Error).message); }
  };
  const h = t?.header ?? [];
  const sig = res && (res.ciLow > 0 || res.ciHigh < 0);
  return (
    <div className="space-y-3">
      <Area id="med-data" label="Data with a header row. Sample: DIET support → research self-efficacy → research engagement (200 teachers, illustrative)." value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} />
      <div className="flex flex-wrap gap-2 items-end">
        {(['X (predictor)', 'M (mediator)', 'Y (outcome)'] as const).map((l, i) => (
          <label key={l} className="text-sm">{l}<select aria-label={l} className="input" value={cols[i]} onChange={(e) => { setCols(cols.map((c, j) => (j === i ? +e.target.value : c))); setRes(null); }}>{h.map((name, j) => <option key={j} value={j}>{name}</option>)}</select></label>))}
        <button className="btn-primary" onClick={run}>Run (2,000 bootstrap samples)</button>
        <button className="btn-ghost" onClick={() => { setText(mediationCsv()); setRes(null); }}>Load sample</button>
      </div>
      {err && <p className="text-rose-700 text-sm">{err}</p>}
      {res && (<>
        <svg viewBox="0 0 420 150" className="w-full max-w-lg" role="img" aria-label={`Mediation diagram: a = ${f2(res.a)}, b = ${f2(res.b)}, direct c' = ${f2(res.cPrime)}`}>
          {[[20, 100, h[cols[0]]], [160, 15, h[cols[1]]], [300, 100, h[cols[2]]]].map(([x, y, name]) => <g key={name as string}><rect x={x as number} y={y as number} width="100" height="34" rx="6" fill="none" stroke="#0f766e" strokeWidth="1.5" /><text x={(x as number) + 50} y={(y as number) + 21} fontSize="11" textAnchor="middle" fill="currentColor">{name}</text></g>)}
          <line x1="80" y1="100" x2="190" y2="49" stroke="currentColor" markerEnd="url(#ar)" /><line x1="240" y1="49" x2="340" y2="100" stroke="currentColor" markerEnd="url(#ar)" /><line x1="120" y1="117" x2="298" y2="117" stroke="currentColor" markerEnd="url(#ar)" />
          <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor" /></marker></defs>
          <text x="115" y="68" fontSize="11" fill="currentColor">a = {f2(res.a)}</text><text x="285" y="68" fontSize="11" fill="currentColor">b = {f2(res.b)}</text><text x="210" y="140" fontSize="11" textAnchor="middle" fill="currentColor">c′ = {f2(res.cPrime)} (direct)</text>
        </svg>
        <table className="text-sm"><tbody>{[['Indirect effect (a × b)', f2(res.indirect, 3)], ['95% bootstrap CI', `[${f2(res.ciLow, 3)}, ${f2(res.ciHigh, 3)}]`], ['Direct effect (c′)', f2(res.cPrime, 3)], ['Total effect (c)', f2(res.c, 3)], ['Bootstrap samples', String(res.boots)]].map(([k, v]) => <tr key={k} className="border-t"><td className="pr-4 font-semibold">{k}</td><td>{v}</td></tr>)}</tbody></table>
        <p className="ka text-sm">{sig ? `The indirect effect is significant: the 95% bootstrap interval excludes zero. ${h[cols[0]]} is associated with ${h[cols[2]]} partly through ${h[cols[1]]}.` : 'The 95% bootstrap interval includes zero, so the indirect effect is not supported.'} Unstandardised OLS estimates on observed scores; in a full SEM, use latent variables and 5,000 bootstrap samples.</p>
      </>)}
    </div>
  );
}
