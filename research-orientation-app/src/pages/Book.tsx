import { useEffect } from 'react';
import { MODULES, Module } from '../data/modules';
import { KN } from '../data/modules.kn';
import { useStore } from '../lib/store';
import { Bi, ModeSwitch } from '../lib/Bi';
import { T } from '../i18n';
import Quiz from './Quiz';
import { ToolView, TOOL_META } from './Tools';

export function pagesOf(m: Module) {
  const k = KN[m.id];
  return [
    { kind: 'opener' as const, title: m.title, kn: m.titleKn },
    ...m.lessons.map((l, i) => ({ kind: 'lesson' as const, title: l.title, kn: k.lessons[i].title, i })),
    { kind: 'karnataka' as const, title: 'From Karnataka classrooms', kn: 'ಕರ್ನಾಟಕದ ತರಗತಿಗಳಿಂದ' },
    { kind: 'activity' as const, title: m.activity.title, kn: k.activity.title },
    { kind: 'quiz' as const, title: 'Check your understanding', kn: 'ನಿಮ್ಮ ತಿಳುವಳಿಕೆ ಪರೀಕ್ಷಿಸಿ' },
  ];
}

export default function Book({ mid, page, go }: { mid: string; page: number; go: (h: string) => void }) {
  const { s, set } = useStore();
  const t = T[s.lang];
  const idx = Math.max(0, MODULES.findIndex((m) => m.id === mid));
  const m = MODULES[idx];
  const k = KN[m.id];
  const pages = pagesOf(m);
  const p = Math.min(Math.max(page || 0, 0), pages.length - 1);
  const pg = pages[p];
  const key = `${m.id}:${p}`;

  const prevHref = p > 0 ? `#/book/${m.id}/${p - 1}` : idx > 0 ? `#/book/${MODULES[idx - 1].id}/${pagesOf(MODULES[idx - 1]).length - 1}` : '#/';
  const nextHref = p < pages.length - 1 ? `#/book/${m.id}/${p + 1}` : idx < MODULES.length - 1 ? `#/book/${MODULES[idx + 1].id}/0` : '#/certificate';

  useEffect(() => {
    set((st) => {
      const read = st.pagesRead[m.id] ?? [];
      return { lastPage: `#/book/${m.id}/${p}`, pagesRead: read.includes(p) ? st.pagesRead : { ...st.pagesRead, [m.id]: [...read, p] } };
    });
    window.scrollTo(0, 0);
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') go(nextHref);
      if (e.key === 'ArrowLeft') go(prevHref);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [m.id, p]);

  const marked = s.bookmarks.includes(key);
  const sub = s.submissions.find((x) => x.moduleId === m.id);

  return (
    <article className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
        <span>Chapter {m.no} · ಅಧ್ಯಾಯ {m.no} — {m.title} · <span lang="kn">{m.titleKn}</span></span>
        <span className="flex items-center gap-2"><ModeSwitch /> {t.page} {p + 1} {t.of} {pages.length}</span>
      </div>
      <div className="h-1.5 bg-slate-200 rounded mb-4" aria-hidden>
        <div className="h-1.5 bg-teal-600 rounded" style={{ width: `${((p + 1) / pages.length) * 100}%` }} />
      </div>

      <div className="card md:p-8 min-h-[50vh]">
        <div className="flex justify-between items-start gap-2 mb-4">
          <Bi as="h2" className="text-2xl font-bold text-teal-900"
            en={pg.kind === 'opener' ? `Chapter ${m.no}: ${m.title}` : pg.title}
            kn={pg.kind === 'opener' ? `ಅಧ್ಯಾಯ ${m.no}: ${m.titleKn}` : pg.kn} />
          <button className="btn-ghost shrink-0" aria-pressed={marked}
            onClick={() => set((st) => ({ bookmarks: marked ? st.bookmarks.filter((b) => b !== key) : [...st.bookmarks, key] }))}>
            {marked ? '★' : '☆'}<span className="sr-only">{t.bookmark}</span>
          </button>
        </div>

        {pg.kind === 'opener' && (
          <div className="space-y-4">
            <p><span className="chip">{m.hours} hours · {m.hours} ಗಂಟೆಗಳು</span></p>
            <Bi as="h3" className="font-semibold" en="Learning objectives" kn="ಕಲಿಕಾ ಉದ್ದೇಶಗಳು" />
            <ol className="list-decimal pl-6 space-y-2">{m.objectives.map((o, i) => <li key={o}><Bi en={o} kn={k.objectives[i]} /></li>)}</ol>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-slate-500">Tools · ಸಾಧನಗಳು:</span>
              {m.tools.map((id) => <a key={id} className="chip" href={`#/tools/${id}`}>{TOOL_META[id].name} · <span lang="kn">{TOOL_META[id].kn}</span></a>)}
            </div>
          </div>
        )}

        {pg.kind === 'lesson' && (
          <div className="space-y-5 leading-relaxed">{m.lessons[pg.i].body.map((b, i) => <Bi key={i} en={b} kn={k.lessons[pg.i].body[i]} />)}</div>
        )}

        {pg.kind === 'karnataka' && (
          <div className="space-y-4">
            {m.karnataka.map((ex, j) => (
              <section key={ex.title} className="ka space-y-2">
                <Bi as="h3" className="font-semibold" en={ex.title} kn={k.karnataka[j].title} />
                {ex.text.map((x, i) => <Bi key={i} en={x} kn={k.karnataka[j].text[i]} />)}
              </section>
            ))}
            <Bi className="text-xs text-slate-500" en="Figures in worked examples are illustrative teaching data unless a source is named."
              kn="ಮೂಲವನ್ನು ಹೆಸರಿಸದ ಹೊರತು ಉದಾಹರಣೆಗಳಲ್ಲಿನ ಅಂಕಿಅಂಶಗಳು ಬೋಧನೆಗಾಗಿ ನೀಡಿದ ಉದಾಹರಣಾ ದತ್ತಾಂಶ." />
          </div>
        )}

        {pg.kind === 'activity' && (
          <div className="space-y-4">
            <Bi en={m.activity.prompt} kn={k.activity.prompt} />
            {m.activity.tool && <div className="border rounded-xl p-3 bg-slate-50"><ToolView id={m.activity.tool} /></div>}
            <label className="label" htmlFor="sub">Your response · ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ (English or ಕನ್ನಡ — sent to the facilitator desk)</label>
            <textarea id="sub" className="input min-h-[120px]" defaultValue={sub?.text} key={m.id}
              onBlur={(e) => {
                const text = e.target.value.trim(); if (!text) return;
                set((st) => ({ submissions: [...st.submissions.filter((x) => x.moduleId !== m.id),
                  { id: m.id + Date.now(), moduleId: m.id, text, date: new Date().toLocaleDateString('en-IN'), feedback: sub?.feedback }] }));
              }} />
            {sub?.feedback && <p className="ka"><strong>Facilitator feedback · ಪ್ರತಿಕ್ರಿಯೆ:</strong> {sub.feedback}</p>}
          </div>
        )}

        {pg.kind === 'quiz' && <Quiz key={m.id} id={m.id} items={m.quiz} kn={k.quiz} />}
      </div>

      <details className="card mt-4">
        <summary className="cursor-pointer font-semibold">{t.notes}</summary>
        <textarea className="input mt-2 min-h-[100px]" value={s.notes[m.id] ?? ''} aria-label={t.notes}
          onChange={(e) => set((st) => ({ notes: { ...st.notes, [m.id]: e.target.value } }))} />
      </details>

      <nav className="flex justify-between mt-4 sticky bottom-2">
        <a className="btn-ghost shadow" href={prevHref}>← {t.prev}</a>
        <a className="btn-primary shadow" href={nextHref}>{t.next} →</a>
      </nav>
    </article>
  );
}
