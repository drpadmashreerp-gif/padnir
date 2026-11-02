import { useEffect, useState } from 'react';
import { useStore } from './lib/store';
import { T } from './i18n';
import { MODULES, ToolId } from './data/modules';
import { ModeSwitch } from './lib/Bi';
import Book from './pages/Book';
import Tools from './pages/Tools';
import { Home, Contents, Search, Progress, Pre, Resources, Facilitator, Certificate, Settings, overall } from './pages/Pages';

const useHash = () => {
  const [h, setH] = useState(location.hash || '#/');
  useEffect(() => { const f = () => setH(location.hash || '#/'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return h;
};

export default function App() {
  const { s, set } = useStore();
  const t = T[s.lang];
  const hash = useHash();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const go = (h: string) => { location.hash = h.replace(/^#/, ''); };
  useEffect(() => setMenu(false), [hash]);

  const [, route, a, b] = hash.replace(/^#\/?/, '#/').split('/');
  let page;
  switch (route) {
    case 'book': page = <Book mid={a || 'm1'} page={+(b || 0)} go={go} />; break;
    case 'contents': page = <Contents />; break;
    case 'tools': page = <Tools id={a as ToolId | undefined} />; break;
    case 'resources': page = <Resources />; break;
    case 'progress': page = <Progress />; break;
    case 'pre': page = <Pre />; break;
    case 'facilitator': page = <Facilitator />; break;
    case 'certificate': page = <Certificate />; break;
    case 'settings': page = <Settings />; break;
    case 'search': page = <Search q={decodeURIComponent(a || '')} />; break;
    default: page = <Home />;
  }
  type K = keyof typeof T.en;
  const both = (k: K) => <>{T.en[k]}<span lang="kn" className="block text-xs font-normal opacity-80">{T.kn[k]}</span></>;
  const nav: [string, K][] = [['#/', 'cover'], ['#/contents', 'contents'], ['#/pre', 'pre'], ['#/tools', 'tools'], ['#/resources', 'resources'], ['#/progress', 'progress'],
    ...(s.role !== 'participant' ? [['#/facilitator', 'facilitator'] as [string, K]] : []), ['#/certificate', 'certificate'], ['#/settings', 'settings']];
  const active = (h: string) => (h === '#/' ? hash === '#/' || hash === '' : hash.startsWith(h));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-white">Skip to content</a>
      <header className="md:hidden flex items-center justify-between bg-teal-800 text-white px-4 py-3 sticky top-0 z-20">
        <a href="#/" className="font-bold">RMO · DIET Karnataka</a>
        <button className="btn bg-teal-900" aria-expanded={menu} aria-controls="side" onClick={() => setMenu(!menu)}>☰ Menu</button>
      </header>
      <aside id="side" className={`${menu ? 'block' : 'hidden'} md:block bg-white border-r border-slate-200 md:h-screen md:sticky md:top-0 overflow-y-auto p-4 space-y-4 z-10`}>
        <div className="hidden md:block"><p className="font-bold text-teal-900 leading-tight">{T.en.appTitle}</p><p lang="kn" className="text-sm text-teal-800">{T.kn.appTitle}</p><p className="text-xs text-slate-500">DIET faculty · ಡಯಟ್ ಉಪನ್ಯಾಸಕರು</p></div>
        <form role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go('#/search/' + encodeURIComponent(q.trim())); }}>
          <input className="input" placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        </form>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Course</span><span>{overall(s)}% {t.complete}</span></div>
          <div className="h-2 bg-slate-200 rounded"><div className="h-2 bg-teal-600 rounded" style={{ width: overall(s) + '%' }} /></div>
        </div>
        <nav className="space-y-1" aria-label="Main">{nav.map(([h, l]) => <a key={h} href={h} aria-current={active(h) ? 'page' : undefined} className={`block rounded-lg px-3 py-1.5 text-sm font-semibold ${active(h) ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-100'}`}>{both(l)}</a>)}</nav>
        <details open={route === 'book'}>
          <summary className="text-xs uppercase tracking-wider text-slate-500 cursor-pointer">Chapters · ಅಧ್ಯಾಯಗಳು</summary>
          <ol className="mt-2 space-y-0.5">{MODULES.map((m) => <li key={m.id}><a href={`#/book/${m.id}/0`} className={`block rounded px-2 py-1 text-sm ${route === 'book' && a === m.id ? 'bg-teal-700 text-white' : 'hover:bg-slate-100'}`}>{m.no}. {m.title}<span lang="kn" className="block text-xs opacity-80">{m.titleKn}</span></a></li>)}</ol>
        </details>
        <div><p className="text-xs text-slate-500 mb-1">Reading language · ಓದುವ ಭಾಷೆ</p><ModeSwitch /></div>
        <div className="flex gap-1 text-xs">
          
          <button className="btn-ghost" aria-label="Smaller text" onClick={() => set({ fontSize: Math.max(14, s.fontSize - 1) })}>A−</button>
          <button className="btn-ghost" aria-label="Larger text" onClick={() => set({ fontSize: Math.min(22, s.fontSize + 1) })}>A+</button>
          <button className="btn-ghost" aria-pressed={s.highContrast} onClick={() => set({ highContrast: !s.highContrast })}>◐</button>
        </div>
      </aside>
      <main id="main" className="p-4 md:p-8 min-w-0">{page}</main>
    </div>
  );
}
