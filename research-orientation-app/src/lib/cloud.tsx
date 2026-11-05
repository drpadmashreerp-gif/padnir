// Online accounts and storage (Supabase). Switched on when the site is built with
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY; otherwise the book keeps everything on the device.
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { useStore, State, Role, initial } from './store';
import { mergeStates } from './merge';

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const supabase: SupabaseClient | null = URL_ && KEY_
  ? createClient(URL_, KEY_, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } })
  : null;
export const cloudEnabled = !!supabase;

export interface Profile { id: string; name: string; institution: string; designation: string; role: Role }
export type SyncState = 'off' | 'signed-out' | 'loading' | 'saved' | 'saving' | 'offline' | 'error';

type Ctx = {
  session: Session | null; profile: Profile | null; sync: SyncState; isStaff: boolean; isAdmin: boolean;
  saveProfile: (p: Partial<Profile>) => Promise<string | null>;
  saveSubmission: (moduleId: string, body: string) => Promise<void>;
  refreshFeedback: () => Promise<void>;
  signOut: () => Promise<void>;
  /** null while checking; false when signed in but not (or no longer) on the allowed list. */
  member: boolean | null;
  authReady: boolean;
};
const C = createContext<Ctx>(null!);
export const useCloud = () => useContext(C);

/** Strip per-device conveniences before saving online. */
const forCloud = (s: State) => s;

export function CloudProvider({ children }: { children: ReactNode }) {
  const { s, set, replace } = useStore();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sync, setSync] = useState<SyncState>(cloudEnabled ? 'loading' : 'off');
  const [member, setMember] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(!cloudEnabled);
  const ready = useRef(false);          // true once the online copy has been merged in
  const timer = useRef<number>();
  const latest = useRef(s); latest.current = s;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); if (!data.session) setSync('signed-out'); });
    const { data } = supabase.auth.onAuthStateChange((_e, sess) => { setSession(sess); if (!sess) { setProfile(null); ready.current = false; setSync('signed-out'); } });
    return () => data.subscription.unsubscribe();
  }, []);

  const pushProgress = useCallback(async (state: State) => {
    if (!supabase || !session) return;
    setSync('saving');
    const { error } = await supabase.from('progress').upsert({ user_id: session.user.id, data: forCloud(state), updated_at: new Date().toISOString() });
    setSync(error ? (navigator.onLine ? 'error' : 'offline') : 'saved');
  }, [session]);

  const refreshFeedback = useCallback(async () => {
    if (!supabase || !session) return;
    const { data } = await supabase.from('submissions').select('module_id, body, feedback, updated_at').eq('user_id', session.user.id);
    if (!data) return;
    set((st) => ({
      submissions: [
        ...st.submissions.filter((x) => !data.some((d) => d.module_id === x.moduleId)),
        ...data.map((d) => {
          const loc = st.submissions.find((x) => x.moduleId === d.module_id);
          return { id: loc?.id ?? d.module_id, moduleId: d.module_id, text: loc?.text ?? d.body, date: loc?.date ?? new Date(d.updated_at).toLocaleDateString('en-IN'), feedback: d.feedback ?? undefined };
        }),
      ],
    }));
  }, [session]);

  // On sign-in: load profile and the online copy, merge with this device, save the result.
  useEffect(() => {
    if (!supabase || !session) return;
    let cancelled = false;
    (async () => {
      setSync('loading');
      setMember(null);
      const { data: allowed, error: aErr } = await supabase.rpc('am_i_allowed');
      if (cancelled) return;
      if (aErr || allowed !== true) { setMember(false); setSync('signed-out'); return; }
      setMember(true);
      const uid = session.user.id;
      const [{ data: prof }, { data: prog }] = await Promise.all([
        supabase.from('profiles').select('id,name,institution,designation,role').eq('id', uid).maybeSingle(),
        supabase.from('progress').select('data').eq('user_id', uid).maybeSingle(),
      ]);
      if (cancelled) return;
      const p = (prof as Profile) ?? { id: uid, name: '', institution: '', designation: '', role: 'participant' as Role };
      setProfile(p);
      // A copy left by a different account on a shared computer is never mixed in.
      const local = latest.current.ownerId && latest.current.ownerId !== uid
        ? { ...initial, readMode: latest.current.readMode, fontSize: latest.current.fontSize, highContrast: latest.current.highContrast }
        : latest.current;
      const merged = { ...mergeStates(local, prog?.data as Partial<State>), ownerId: uid };
      replace({ ...merged, role: p.role, name: p.name || merged.name, institution: p.institution || merged.institution });
      // carry any responses written on this device before sign-in
      for (const x of merged.submissions) await supabase.from('submissions').upsert({ user_id: uid, module_id: x.moduleId, body: x.text }, { onConflict: 'user_id,module_id', ignoreDuplicates: true });
      ready.current = true;
      await pushProgress({ ...merged, role: p.role });
      await refreshFeedback();
    })();
    return () => { cancelled = true; };
  }, [session?.user.id]);

  // After every change, save online (batched every 1.5 s).
  useEffect(() => {
    if (!ready.current) return;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => pushProgress(latest.current), 1500);
  }, [s.updatedAt]);
  useEffect(() => {
    const on = () => ready.current && pushProgress(latest.current);
    addEventListener('online', on); return () => removeEventListener('online', on);
  }, [pushProgress]);

  const saveProfile = async (patch: Partial<Profile>) => {
    if (!supabase || !session) return 'Not signed in';
    const clean = { name: patch.name, institution: patch.institution, designation: patch.designation };
    const { error } = await supabase.from('profiles').update(clean).eq('id', session.user.id);
    if (error) return error.message;
    setProfile((p) => (p ? { ...p, ...clean } as Profile : p));
    set({ name: clean.name ?? s.name, institution: clean.institution ?? s.institution });
    return null;
  };
  const saveSubmission = async (moduleId: string, body: string) => {
    if (!supabase || !session) return;
    await supabase.from('submissions').upsert({ user_id: session.user.id, module_id: moduleId, body }, { onConflict: 'user_id,module_id' });
  };
  const signOut = async () => {
    clearTimeout(timer.current);
    if (ready.current) await pushProgress(latest.current);
    await supabase?.auth.signOut();
    const keep = latest.current;
    replace({ ...initial, readMode: keep.readMode, fontSize: keep.fontSize, highContrast: keep.highContrast }); // leave nothing personal on a shared computer
  };

  const isStaff = profile?.role === 'facilitator' || profile?.role === 'admin';
  return (
    <C.Provider value={{ session, profile, sync, isStaff, isAdmin: profile?.role === 'admin', saveProfile, saveSubmission, refreshFeedback, signOut, member, authReady }}>
      {children}
    </C.Provider>
  );
}

export const syncLabel: Record<SyncState, string> = {
  off: 'Saved on this device · ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
  'signed-out': 'Sign in to save online · ಆನ್‌ಲೈನ್ ಉಳಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
  loading: 'Loading your work… · ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
  saving: 'Saving… · ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
  saved: 'Saved online ✓ · ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
  offline: 'Offline: will save when connected · ಸಂಪರ್ಕ ಬಂದಾಗ ಉಳಿಸಲಾಗುವುದು',
  error: 'Could not save online; your work is safe on this device.',
};
