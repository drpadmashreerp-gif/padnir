import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Role = 'participant' | 'facilitator' | 'admin';
export interface JournalEntry { date: string; stage: string; text: string }
export interface Submission { id: string; moduleId: string; text: string; date: string; feedback?: string }
export interface State {
  name: string; institution: string; role: Role; lang: 'en' | 'kn'; readMode: 'en' | 'kn' | 'both'; fontSize: number; highContrast: boolean;
  pagesRead: Record<string, number[]>;          // moduleId -> page indexes read
  quiz: Record<string, number>;                 // moduleId | 'pre' -> best % score
  notes: Record<string, string>;                // moduleId -> notes
  bookmarks: string[];                          // "m3:2"
  journal: JournalEntry[];
  proposal: Record<string, string>;
  submissions: Submission[];
  activeDays: string[];                         // ISO dates, for streaks
  lastPage?: string;
  updatedAt?: number;
  ownerId?: string;                             // online account this device copy belongs to                           // last local change (ms), used when merging with the online copy
}
export const initial: State = {
  name: '', institution: '', role: 'participant', lang: 'en', readMode: 'both', fontSize: 16, highContrast: false,
  pagesRead: {}, quiz: {}, notes: {}, bookmarks: [], journal: [], proposal: {}, submissions: [], activeDays: [],
};
const KEY = 'rmo-state-v1';
function load(): State {
  try { return { ...initial, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return initial; }
}
type Ctx = { s: State; set: (p: Partial<State> | ((s: State) => Partial<State>)) => void; replace: (next: State) => void };
const C = createContext<Ctx>(null!);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
    document.documentElement.style.setProperty('--fs', s.fontSize + 'px');
    document.documentElement.classList.toggle('hc', s.highContrast);
    document.documentElement.lang = s.lang;
  }, [s]);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setS((p) => (p.activeDays.includes(today) ? p : { ...p, activeDays: [...p.activeDays, today] }));
  }, []);
  const set: Ctx['set'] = (p) => setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p), updatedAt: Date.now() }));
  const replace = (next: State) => setS({ ...initial, ...next });
  return <C.Provider value={{ s, set, replace }}>{children}</C.Provider>;
}
export const useStore = () => useContext(C);

export function streak(days: string[]) {
  const set = new Set(days); let n = 0; const d = new Date();
  while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
