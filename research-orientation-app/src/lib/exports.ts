// Word exports: chapters, the whole book, certificate and personal portfolio.
import { MODULES, Module, totalHours, PARTS, PART_MODULES, PART_HOURS, partOf } from '../data/modules';
import { KN } from '../data/modules.kn';
import type { State } from './store';
import type { Block } from './docx';

type Mode = State['readMode'];
const bi = (mode: Mode, en: string, kn: string, t: 'p' | 'h1' | 'h2' | 'bullet' = 'p'): Block[] =>
  mode === 'en' ? [{ t, text: en }] : mode === 'kn' ? [{ t, text: kn }] : [{ t, text: en }, { t: t === 'p' ? 'p' : t, text: kn }];

export function chapterBlocks(m: Module, mode: Mode): Block[] {
  const k = KN[m.id];
  const out: Block[] = [
    { t: 'title', text: mode === 'kn' ? `ಅಧ್ಯಾಯ ${m.no}: ${m.titleKn}` : mode === 'en' ? `Chapter ${m.no}: ${m.title}` : `Chapter ${m.no}: ${m.title}\nಅಧ್ಯಾಯ ${m.no}: ${m.titleKn}` },
    { t: 'center', text: `${m.hours} hours · ${m.hours} ಗಂಟೆಗಳು` },
    ...bi(mode, 'Learning objectives', 'ಕಲಿಕಾ ಉದ್ದೇಶಗಳು', 'h1'),
    ...m.objectives.flatMap((o, i) => bi(mode, o, k.objectives[i], 'bullet')),
  ];
  m.lessons.forEach((l, i) => {
    out.push(...bi(mode, l.title, k.lessons[i].title, 'h1'));
    l.body.forEach((b, j) => out.push(...bi(mode, b, k.lessons[i].body[j])));
    l.code?.forEach((c) => out.push({ t: 'note', text: `${c.label} (${c.lang})` }, { t: 'code', text: c.src }));
  });
  out.push(...bi(mode, 'From Karnataka classrooms', 'ಕರ್ನಾಟಕದ ತರಗತಿಗಳಿಂದ', 'h1'));
  m.karnataka.forEach((ex, i) => {
    out.push(...bi(mode, ex.title, k.karnataka[i].title, 'h2'));
    ex.text.forEach((x, j) => out.push(...bi(mode, x, k.karnataka[i].text[j])));
  });
  out.push({ t: 'note', text: 'Figures in worked examples are illustrative teaching data unless a source is named. · ಮೂಲ ಹೆಸರಿಸದ ಉದಾಹರಣಾ ಅಂಕಿಗಳು ಬೋಧನೆಗಾಗಿ ಮಾತ್ರ.' });
  out.push(...bi(mode, `Activity: ${m.activity.title}`, `ಚಟುವಟಿಕೆ: ${k.activity.title}`, 'h1'), ...bi(mode, m.activity.prompt, k.activity.prompt), { t: 'blank', lines: 4 });
  out.push(...bi(mode, 'Check your understanding', 'ನಿಮ್ಮ ತಿಳುವಳಿಕೆ ಪರೀಕ್ಷಿಸಿ', 'h1'));
  m.quiz.forEach((q, i) => {
    out.push(...bi(mode, `${i + 1}. ${q.q}`, `${i + 1}. ${k.quiz[i].q}`));
    q.options.forEach((o, j) => out.push(...bi(mode, `${'abcd'[j]}) ${o}`, `${'abcd'[j]}) ${k.quiz[i].options[j]}`, 'bullet')));
  });
  out.push(...bi(mode, 'Answer key', 'ಉತ್ತರಗಳು', 'h2'), { t: 'p', text: m.quiz.map((q, i) => `${i + 1}-${'abcd'[q.answer]}`).join('   ') });
  return out;
}

export function bookBlocks(mode: Mode): Block[] {
  return [
    { t: 'big', text: 'Research Methodology Orientation' }, { t: 'big', text: 'ಸಂಶೋಧನಾ ವಿಧಾನ ದೃಷ್ಟಿಕೋನ ತರಬೇತಿ' },
    { t: 'center', text: `For DIET faculty · ಡಯಟ್ ಉಪನ್ಯಾಸಕರಿಗಾಗಿ\n${MODULES.length} chapters in two parts · ${totalHours()} hours\nExamples from Karnataka school education · ಕರ್ನಾಟಕದ ಶಾಲಾ ಶಿಕ್ಷಣದ ಉದಾಹರಣೆಗಳು` },
    { t: 'h1', text: 'Contents · ಪರಿವಿಡಿ' },
    { t: 'table', widths: [900, 4300, 2800, 1000], rows: [['Ch', 'Title', 'ಶೀರ್ಷಿಕೆ', 'Hours'], ...MODULES.map((m) => [String(m.no), m.title, m.titleKn, String(m.hours)])] },
    ...MODULES.flatMap((m, i): Block[] => [{ t: 'pagebreak' },
      ...(i === 0 || partOf(MODULES[i - 1]) !== partOf(m) ? [{ t: 'big', text: `${PARTS[partOf(m)].en}\n${PARTS[partOf(m)].kn}` } as Block, { t: 'pagebreak' } as Block] : []),
      ...chapterBlocks(m, mode)]),
  ];
}

export function certificateBlocks(name: string, institution: string, date: string, part: 1 | 2 = 1): Block[] {
  const n = PART_MODULES(part).length;
  return [
    { t: 'blank', lines: 3 },
    { t: 'center', text: 'CERTIFICATE OF COMPLETION · ಪೂರ್ಣಗೊಳಿಸಿದ ಪ್ರಮಾಣಪತ್ರ' },
    { t: 'big', text: part === 1 ? 'Research Methodology Orientation' : 'Advanced Research Methods: Analytics, Innovation and AI' },
    { t: 'center', text: `${PART_HOURS(part)}-hour programme for DIET faculty, Karnataka\nಡಯಟ್ ಉಪನ್ಯಾಸಕರಿಗಾಗಿ ${PART_HOURS(part)} ಗಂಟೆಗಳ ತರಬೇತಿ` },
    { t: 'blank', lines: 2 },
    { t: 'center', text: 'This is to certify that · ಇವರು' },
    { t: 'big', text: name || '______________________' },
    { t: 'center', text: institution || '______________________' },
    { t: 'center', text: `has completed all ${n} chapters and assessments of ${part === 1 ? 'Part I' : 'Part II'}.\n${part === 1 ? 'ಭಾಗ ೧' : 'ಭಾಗ ೨'}ರ ಎಲ್ಲಾ ${n} ಅಧ್ಯಾಯಗಳು ಮತ್ತು ಮೌಲ್ಯಮಾಪನಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದಾರೆ ಎಂದು ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ.` },
    { t: 'blank', lines: 3 },
    { t: 'table', header: false, widths: [4500, 4500], rows: [[`Date · ದಿನಾಂಕ: ${date}`, 'Signature · ಸಹಿ: ____________________']] },
  ];
}

export function portfolioBlocks(s: State, email?: string): Block[] {
  const out: Block[] = [
    { t: 'title', text: 'My Research Portfolio\nನನ್ನ ಸಂಶೋಧನಾ ಕಡತ' },
    { t: 'center', text: [s.name, s.institution, email].filter(Boolean).join(' · ') || ' ' },
    { t: 'center', text: `Downloaded ${new Date().toLocaleDateString('en-IN')}` },
    { t: 'h1', text: 'Progress and scores · ಪ್ರಗತಿ ಮತ್ತು ಅಂಕಗಳು' },
    { t: 'table', widths: [700, 5000, 1600, 1700], rows: [['Ch', 'Chapter', 'Quiz (best)', 'Activity'],
      ...MODULES.map((m) => [String(m.no), m.title, s.quiz[m.id] !== undefined ? `${s.quiz[m.id]}%` : '—', s.submissions.some((x) => x.moduleId === m.id) ? 'Submitted' : '—'])] },
  ];
  if (s.quiz.pre !== undefined) out.push({ t: 'p', text: `Pre-assessment: ${s.quiz.pre}%` });
  const subs = MODULES.map((m) => ({ m, x: s.submissions.find((y) => y.moduleId === m.id) })).filter((v) => v.x);
  if (subs.length) {
    out.push({ t: 'h1', text: 'Activity responses · ಚಟುವಟಿಕೆ ಪ್ರತಿಕ್ರಿಯೆಗಳು' });
    subs.forEach(({ m, x }) => out.push({ t: 'h2', text: `Ch ${m.no}: ${m.activity.title}` }, { t: 'p', text: x!.text }, ...(x!.feedback ? [{ t: 'note', text: `Facilitator feedback: ${x!.feedback}` } as Block] : [])));
  }
  if (s.journal.length) {
    out.push({ t: 'h1', text: 'Action research journal · ಕ್ರಿಯಾ ಸಂಶೋಧನಾ ದಿನಚರಿ' });
    [...s.journal].reverse().forEach((j) => out.push({ t: 'h2', text: `${j.stage} · ${j.date}` }, { t: 'p', text: j.text }));
  }
  const notes = MODULES.filter((m) => s.notes[m.id]?.trim());
  if (notes.length) {
    out.push({ t: 'h1', text: 'Chapter notes · ಅಧ್ಯಾಯ ಟಿಪ್ಪಣಿಗಳು' });
    notes.forEach((m) => out.push({ t: 'h2', text: `Ch ${m.no}: ${m.title}` }, { t: 'p', text: s.notes[m.id] }));
  }
  const prop = Object.entries(s.proposal).filter(([k, v]) => !k.startsWith('__') && v?.trim());
  if (prop.length) {
    out.push({ t: 'h1', text: 'Research proposal draft · ಸಂಶೋಧನಾ ಪ್ರಸ್ತಾವನೆ ಕರಡು' });
    prop.forEach(([k, v]) => out.push({ t: 'h2', text: k[0].toUpperCase() + k.slice(1) }, { t: 'p', text: v }));
  }
  const refs = referenceList(s);
  if (refs.length) { out.push({ t: 'h1', text: 'References (APA 7) · ಉಲ್ಲೇಖಗಳು' }); refs.forEach((r) => out.push({ t: 'p', text: r })); }
  return out;
}

type Ref = { a: string; y: string; t: string; s: string };
export function referenceList(s: State): string[] {
  let refs: Ref[] = [];
  try { refs = JSON.parse(s.proposal.__refs || '[]'); } catch { /* ignore */ }
  return [...refs].sort((x, y) => x.a.localeCompare(y.a)).map((r) => `${r.a} (${r.y || 'n.d.'}). ${r.t}. ${r.s}`.replace(/\.\./g, '.'));
}
