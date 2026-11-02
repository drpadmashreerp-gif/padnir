import { useState } from 'react';
import type { Quiz as Q } from '../data/modules';
import type { KnQuiz } from '../data/modules.kn';
import { useStore } from '../lib/store';
import { Bi } from '../lib/Bi';

export default function Quiz({ id, items, kn }: { id: string; items: Q[]; kn?: KnQuiz[] }) {
  const { s, set } = useStore();
  const [ans, setAns] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const score = Math.round((items.filter((q, i) => ans[i] === q.answer).length / items.length) * 100);
  const submit = () => { setDone(true); set((p) => ({ quiz: { ...p.quiz, [id]: Math.max(p.quiz[id] ?? 0, score) } })); };
  return (
    <div className="space-y-4">
      {items.map((q, i) => (
        <fieldset key={i} className="card">
          <legend className="sr-only">{q.q}</legend>
          <Bi className="font-semibold mb-2" en={`${i + 1}. ${q.q}`} kn={kn && `${i + 1}. ${kn[i].q}`} />
          <div className="grid gap-2 mt-2">
            {q.options.map((o, j) => {
              const picked = ans[i] === j;
              const tone = done ? (j === q.answer ? 'border-emerald-500 bg-emerald-50' : picked ? 'border-rose-400 bg-rose-50' : '') : picked ? 'border-teal-600 bg-teal-50' : '';
              return (
                <label key={j} className={`flex gap-2 items-start border rounded-lg p-2 cursor-pointer ${tone}`}>
                  <input type="radio" name={`${id}-${i}`} disabled={done} checked={picked} onChange={() => setAns({ ...ans, [i]: j })} className="mt-1.5" />
                  <span className="flex-1"><Bi as="span" className="block" en={o} kn={kn?.[i].options[j]} /></span>
                </label>
              );
            })}
          </div>
          {done && <Bi className="text-sm mt-2 text-slate-600" en={`${ans[i] === q.answer ? '✓' : '✗'} ${q.why}`} kn={kn && `${ans[i] === q.answer ? '✓' : '✗'} ${kn[i].why}`} />}
        </fieldset>
      ))}
      {!done ? (
        <button className="btn-primary" disabled={Object.keys(ans).length < items.length} onClick={submit}>Submit · ಸಲ್ಲಿಸಿ</button>
      ) : (
        <div className="card flex flex-wrap items-center gap-3">
          <strong className="text-lg">Score · ಅಂಕ: {score}%</strong>
          <span className="text-sm text-slate-600">Best · ಅತ್ಯುತ್ತಮ: {s.quiz[id] ?? score}% {score >= 75 ? '· 🏅' : '· 75% → 🏅'}</span>
          <button className="btn-ghost" onClick={() => { setAns({}); setDone(false); }}>Try again · ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ</button>
        </div>
      )}
    </div>
  );
}
