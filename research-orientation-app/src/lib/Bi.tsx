import type { ElementType, ReactNode } from 'react';
import { useStore } from './store';

/** Renders English and/or Kannada text according to the reader's chosen mode. */
export function Bi({ en, kn, as: Tag = 'p', className = '' }: { en: ReactNode; kn?: ReactNode; as?: ElementType; className?: string }) {
  const { s } = useStore();
  const mode = kn ? s.readMode : 'en';
  if (mode === 'en') return <Tag className={className}>{en}</Tag>;
  if (mode === 'kn') return <Tag lang="kn" className={className}>{kn}</Tag>;
  return (
    <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
      <Tag className={className}>{en}</Tag>
      <Tag lang="kn" className={`${className} kn`}>{kn}</Tag>
    </div>
  );
}

export function ModeSwitch() {
  const { s, set } = useStore();
  const opts = [['en', 'English'], ['kn', 'ಕನ್ನಡ'], ['both', 'English + ಕನ್ನಡ']] as const;
  return (
    <div role="radiogroup" aria-label="Reading language" className="inline-flex rounded-lg bg-slate-100 p-0.5">
      {opts.map(([k, l]) => (
        <button key={k} role="radio" aria-checked={s.readMode === k} onClick={() => set({ readMode: k })}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md ${s.readMode === k ? 'bg-teal-700 text-white' : 'text-slate-700'}`}>{l}</button>
      ))}
    </div>
  );
}
