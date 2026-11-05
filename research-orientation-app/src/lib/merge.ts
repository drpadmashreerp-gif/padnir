// Merges this device's saved work with the copy stored online, so signing in on a
// second device (or after working offline) never throws work away.
import type { State, JournalEntry, Submission } from './store';

const union = <T,>(a: T[] = [], b: T[] = []) => [...new Set([...a, ...b])];

export function mergeStates(local: State, remote: Partial<State> | null | undefined): State {
  if (!remote || !Object.keys(remote).length) return local;
  const newer = (remote.updatedAt ?? 0) > (local.updatedAt ?? 0) ? 'remote' : 'local';
  const pick = <K extends keyof State>(k: K): State[K] => (newer === 'remote' && remote[k] !== undefined ? (remote[k] as State[K]) : local[k]);

  const pagesRead: State['pagesRead'] = { ...local.pagesRead };
  for (const [m, pages] of Object.entries(remote.pagesRead ?? {})) pagesRead[m] = union(pagesRead[m], pages).sort((x, y) => x - y);

  const quiz: State['quiz'] = { ...local.quiz };
  for (const [m, v] of Object.entries(remote.quiz ?? {})) quiz[m] = Math.max(quiz[m] ?? 0, v);

  const keyJ = (j: JournalEntry) => `${j.date}|${j.stage}|${j.text}`;
  const seen = new Set<string>(); const journal: JournalEntry[] = [];
  for (const j of [...(local.journal ?? []), ...(remote.journal ?? [])]) if (!seen.has(keyJ(j))) { seen.add(keyJ(j)); journal.push(j); }

  const older = newer === 'remote' ? local : remote;
  const newerS = newer === 'remote' ? remote : local;
  const fill = (a: Record<string, string> = {}, b: Record<string, string> = {}) => {
    const out = { ...a };
    for (const [k, v] of Object.entries(b)) if (v?.trim() && !out[k]?.trim()) out[k] = v;
    return out;
  };
  const subs = new Map<string, Submission>();
  for (const x of [...(older.submissions ?? []), ...(newerS.submissions ?? [])]) {
    const prev = subs.get(x.moduleId);
    subs.set(x.moduleId, { ...x, feedback: x.feedback ?? prev?.feedback });
  }

  return {
    ...local,
    name: pick('name'), institution: pick('institution'), readMode: pick('readMode'), fontSize: pick('fontSize'),
    highContrast: pick('highContrast'), lang: pick('lang'), lastPage: pick('lastPage'),
    pagesRead, quiz, journal,
    notes: fill(newerS.notes, older.notes),
    proposal: fill(newerS.proposal, older.proposal),
    bookmarks: union(local.bookmarks, remote.bookmarks),
    activeDays: union(local.activeDays, remote.activeDays).sort(),
    submissions: [...subs.values()],
    updatedAt: Math.max(local.updatedAt ?? 0, remote.updatedAt ?? 0),
  };
}
