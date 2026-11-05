import { useState } from 'react';
import { saveFile, outcomeText } from './save';
import { buildDocx, Block } from './docx';

/** A button that builds a file on click and reports what happened next to it. */
export function DownloadButton({ label, filename, make, className = 'btn-ghost' }: {
  label: string; filename: string; make: () => Block[] | string; className?: string;
}) {
  const [msg, setMsg] = useState('');
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" className={className} onClick={async () => {
        setMsg('Preparing… · ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ…');
        const out = make();
        const r = await saveFile(filename, typeof out === 'string' ? out : buildDocx(out), filename.endsWith('.csv') ? 'text/csv' : 'text/plain;charset=utf-8');
        setMsg(outcomeText[r]);
      }}>⬇ {label}</button>
      {msg && <span role="status" className="text-xs text-slate-600">{msg}</span>}
    </span>
  );
}
