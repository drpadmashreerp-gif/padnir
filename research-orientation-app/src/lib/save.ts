// One way to hand the reader a file, wherever the book is opened.
// Published on claude.ai: the viewer's `downloads` capability shows a save prompt.
// Standalone HTML / local build: an ordinary browser download.
type Downloads = { save(r: { filename: string; data: string | Blob | Uint8Array }): Promise<{ status: string }> };
type ClaudeHost = { use?: (name: string) => Promise<unknown> };

let dlPromise: Promise<Downloads | null> | null = null;
function downloads(): Promise<Downloads | null> {
  const host = (window as unknown as { claude?: ClaudeHost }).claude;
  if (!host?.use) return Promise.resolve(null);
  dlPromise ??= Promise.race([
    host.use('downloads') as Promise<Downloads | null>,
    new Promise<null>((r) => setTimeout(() => r(null), 4000)),
  ]).catch(() => null);
  return dlPromise;
}

export type SaveOutcome = 'saved' | 'declined' | 'busy' | 'failed';

export async function saveFile(filename: string, data: string | Blob | Uint8Array, mime = 'text/plain;charset=utf-8'): Promise<SaveOutcome> {
  const dl = await downloads();
  if (dl) {
    try { await dl.save({ filename, data }); return 'saved'; }
    catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === 'declined') return 'declined';
      if (code === 'rate_limited') return 'busy';
      if (code && !['unavailable', 'not_granted', 'capability_disabled', 'capability_removed'].includes(code)) return 'failed';
      // otherwise fall through to a plain browser download
    }
  }
  try {
    const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return 'saved';
  } catch { return 'failed'; }
}

export const outcomeText: Record<SaveOutcome, string> = {
  saved: 'Downloaded · ಡೌನ್‌ಲೋಡ್ ಆಯಿತು',
  declined: 'Download cancelled · ರದ್ದಾಯಿತು',
  busy: 'Another download is waiting for your answer. Try again in a moment.',
  failed: 'This file could not be saved here. Try the standalone HTML book.',
};

/** True when the book runs inside the claude.ai viewer, where printing and pop-ups are blocked. */
export const hosted = typeof window !== 'undefined' && !!(window as unknown as { claude?: ClaudeHost }).claude?.use;
