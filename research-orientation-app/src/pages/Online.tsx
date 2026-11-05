// Screens that need the online database: sign-in, profile, discussions, announcements, live facilitator desk.
import { useEffect, useState } from 'react';
import { supabase, cloudEnabled, useCloud, syncLabel, Profile } from '../lib/cloud';
import { useStore, Role } from '../lib/store';
import { MODULES, PART_MODULES } from '../data/modules';
import { saveFile } from '../lib/save';

const fmt = (d: string) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

/* ---------- Account: sign in with an emailed code, then profile ---------- */
export function Account() {
  const { session, profile, sync, saveProfile, signOut } = useCloud();
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name: '', institution: '', designation: '' });
  useEffect(() => { if (profile) setForm({ name: profile.name, institution: profile.institution, designation: profile.designation }); }, [profile?.id]);

  if (!cloudEnabled) return (
    <div className="max-w-xl mx-auto card space-y-2">
      <h2 className="text-2xl font-bold text-teal-900">Account · ಖಾತೆ</h2>
      <p>This copy of the book saves your work on this device only. Use the online version (GitHub Pages) to sign in and save your work online, or back up your progress from Settings.</p>
      <p lang="kn" className="text-slate-700">ಈ ಪ್ರತಿಯು ನಿಮ್ಮ ಕೆಲಸವನ್ನು ಈ ಸಾಧನದಲ್ಲಿ ಮಾತ್ರ ಉಳಿಸುತ್ತದೆ. ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಸಲು ಆನ್‌ಲೈನ್ ಆವೃತ್ತಿಯನ್ನು ಬಳಸಿ.</p>
    </div>
  );

  if (!session) return <p className="card">Please sign in. · ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.</p>;

  return (
    <div className="max-w-xl mx-auto card space-y-3">
      <h2 className="text-2xl font-bold text-teal-900">My account · ನನ್ನ ಖಾತೆ</h2>
      <p className="text-sm">Signed in as <strong>{session.user.email}</strong> · Role: <span className="chip">{profile?.role ?? '…'}</span></p>
      <p className="text-sm text-slate-600" role="status">{syncLabel[sync]}</p>
      <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); setBusy(true); const err = await saveProfile(form); setBusy(false); setMsg(err ?? 'Profile saved · ಉಳಿಸಲಾಗಿದೆ'); }}>
        <label><span className="label">Full name · ಪೂರ್ಣ ಹೆಸರು</span><input id="pname" required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label><span className="label">DIET / institution · ಸಂಸ್ಥೆ</span><input id="pinst" required className="input" placeholder="e.g. DIET Mysuru" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></label>
        <label><span className="label">Designation · ಹುದ್ದೆ</span><input id="pdes" className="input" placeholder="e.g. Senior Lecturer" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></label>
        <div className="flex gap-2"><button className="btn-primary" disabled={busy}>Save profile · ಉಳಿಸಿ</button>
          <button type="button" className="btn-ghost" onClick={signOut}>Sign out · ಸೈನ್ ಔಟ್</button></div>
      </form>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <p className="text-xs text-slate-500">Signing out removes your work from this device; it stays saved online. · ಸೈನ್ ಔಟ್ ಮಾಡಿದಾಗ ಈ ಸಾಧನದಿಂದ ತೆಗೆಯಲಾಗುತ್ತದೆ; ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಳಿಯುತ್ತದೆ.</p>
      <ChangePassword />
    </div>
  );
}

const NeedSignIn = ({ what }: { what: string }) => (
  <div className="card text-sm">
    {cloudEnabled
      ? <>Sign in to {what}. · ಸೈನ್ ಇನ್ ಮಾಡಿ. <a className="text-teal-700 underline" href="#/account">Sign in</a></>
      : <>{what[0].toUpperCase() + what.slice(1)} is available in the online version of the book. · ಇದು ಆನ್‌ಲೈನ್ ಆವೃತ್ತಿಯಲ್ಲಿ ಲಭ್ಯ.</>}
  </div>
);

/* ---------- Chapter discussion ---------- */
type Post = { id: number; module_id: string; user_id: string; author_name: string; body: string; created_at: string };
export function Discussion({ mid }: { mid: string }) {
  const { session, profile, isStaff } = useCloud();
  const m = MODULES.find((x) => x.id === mid) ?? MODULES[0];
  const [posts, setPosts] = useState<Post[] | null>(null), [body, setBody] = useState(''), [err, setErr] = useState('');
  const load = async () => {
    const { data, error } = await supabase!.from('posts').select('*').eq('module_id', m.id).order('created_at');
    if (error) setErr('Could not load the discussion. Check your connection.'); else setPosts(data as Post[]);
  };
  useEffect(() => { if (session) load(); }, [session, m.id]);
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <a href={`#/book/${m.id}/0`} className="text-sm text-teal-700">← Chapter {m.no}</a>
      <h2 className="text-2xl font-bold text-teal-900">Discussion · ಚರ್ಚೆ — {m.title}</h2>
      <p lang="kn" className="text-teal-800">{m.titleKn}</p>
      {!session ? <NeedSignIn what="join the discussion" /> : (<>
        <form className="card space-y-2" onSubmit={async (e) => {
          e.preventDefault(); if (!body.trim()) return;
          const { error } = await supabase!.from('posts').insert({ module_id: m.id, user_id: session.user.id, author_name: `${profile?.name || 'Participant'}${profile?.institution ? ', ' + profile.institution : ''}`, body: body.trim() });
          if (error) setErr('Your post was not sent. Try again.'); else { setBody(''); setErr(''); load(); }
        }}>
          <label className="label" htmlFor="post">Share a question, an example from your district, or a reply (English or ಕನ್ನಡ)</label>
          <textarea id="post" className="input min-h-[90px]" maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex gap-2"><button className="btn-primary" disabled={!body.trim()}>Post · ಪ್ರಕಟಿಸಿ</button><button type="button" className="btn-ghost" onClick={load}>Refresh</button></div>
        </form>
        {err && <p role="alert" className="text-rose-700 text-sm">{err}</p>}
        {posts === null ? <p className="text-sm text-slate-500">Loading…</p> : posts.length === 0
          ? <p className="card text-sm text-slate-600">No posts yet. Start the discussion. · ಇನ್ನೂ ಯಾವುದೇ ಪೋಸ್ಟ್ ಇಲ್ಲ.</p>
          : <ul className="space-y-2">{posts.map((p) => (
            <li key={p.id} className="card">
              <div className="flex justify-between gap-2 text-xs text-slate-500"><span className="font-semibold text-slate-700">{p.author_name || 'Participant'}</span><span>{fmt(p.created_at)}</span></div>
              <p className="whitespace-pre-wrap mt-1">{p.body}</p>
              {(p.user_id === session.user.id || isStaff) && <button className="text-xs text-rose-700 mt-1" onClick={async () => { await supabase!.from('posts').delete().eq('id', p.id); load(); }}>Delete</button>}
            </li>))}</ul>}
      </>)}
    </div>
  );
}

/* ---------- Announcements (shown on the cover; facilitators post) ---------- */
type Ann = { id: number; author_name: string; title: string; body: string; created_at: string };
export function Announcements() {
  const { session, profile, isStaff } = useCloud();
  const [items, setItems] = useState<Ann[]>([]), [t, setT] = useState(''), [b, setB] = useState('');
  const load = async () => { const { data } = await supabase!.from('announcements').select('*').order('created_at', { ascending: false }).limit(10); setItems((data as Ann[]) ?? []); };
  useEffect(() => { if (session) load(); }, [session]);
  if (!session) return null;
  return (
    <section className="card space-y-2">
      <h2 className="font-bold text-teal-900">Announcements · ಪ್ರಕಟಣೆಗಳು</h2>
      {items.length === 0 && <p className="text-sm text-slate-500">No announcements yet.</p>}
      {items.map((a) => (
        <article key={a.id} className="border-l-4 border-teal-600 pl-3">
          <p className="font-semibold">{a.title}</p>{a.body && <p className="text-sm whitespace-pre-wrap">{a.body}</p>}
          <p className="text-xs text-slate-500">{a.author_name} · {fmt(a.created_at)}
            {isStaff && <button className="text-rose-700 ml-2" onClick={async () => { await supabase!.from('announcements').delete().eq('id', a.id); load(); }}>Delete</button>}</p>
        </article>))}
      {isStaff && (
        <form className="grid gap-2 border-t pt-2" onSubmit={async (e) => {
          e.preventDefault(); if (!t.trim()) return;
          await supabase!.from('announcements').insert({ user_id: session.user.id, author_name: profile?.name || 'Facilitator', title: t.trim(), body: b.trim() });
          setT(''); setB(''); load();
        }}>
          <input id="ann-t" className="input" placeholder="New announcement title (e.g. Session 4 on Friday, 10 am)" value={t} onChange={(e) => setT(e.target.value)} />
          <textarea id="ann-b" className="input" placeholder="Details (optional)" value={b} onChange={(e) => setB(e.target.value)} />
          <button className="btn-primary justify-self-start" disabled={!t.trim()}>Post announcement</button>
        </form>)}
    </section>
  );
}

/* ---------- Live facilitator desk ---------- */
type Row = Profile & { quiz: Record<string, number>; read: number; updated?: string };
type Sub = { id: number; user_id: string; module_id: string; body: string; feedback: string | null; updated_at: string };
export function FacilitatorLive() {
  const [rows, setRows] = useState<Row[] | null>(null), [subs, setSubs] = useState<Sub[]>([]), [fb, setFb] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<'pending' | 'all'>('pending'), [err, setErr] = useState('');
  const load = async () => {
    const [p, g, s] = await Promise.all([
      supabase!.from('profiles').select('id,name,institution,designation,role').order('institution'),
      supabase!.from('progress').select('user_id,data,updated_at'),
      supabase!.from('submissions').select('*').order('updated_at', { ascending: false }),
    ]);
    if (p.error || g.error || s.error) { setErr('Could not load the cohort. Check your connection.'); return; }
    const prog = new Map((g.data ?? []).map((x) => [x.user_id, x]));
    setRows((p.data as Profile[]).map((pr) => {
      const d = (prog.get(pr.id)?.data ?? {}) as { quiz?: Record<string, number>; pagesRead?: Record<string, number[]> };
      return { ...pr, quiz: d.quiz ?? {}, read: Object.values(d.pagesRead ?? {}).reduce((a, x) => a + x.length, 0), updated: prog.get(pr.id)?.updated_at };
    }));
    setSubs(s.data as Sub[]);
  };
  useEffect(() => { load(); }, []);
  if (err) return <p className="card text-rose-700">{err}</p>;
  if (!rows) return <p className="card">Loading the cohort…</p>;
  const name = (id: string) => rows.find((r) => r.id === id);
  const participants = rows.filter((r) => r.role === 'participant');
  const passed = (r: Row) => MODULES.filter((m) => (r.quiz[m.id] ?? 0) >= 60).length;
  const csv = ['Name,DIET,Designation,Role,Pre,' + MODULES.map((m) => 'Ch' + m.no).join(',') + ',Chapters passed,Last active',
    ...rows.map((r) => [r.name, r.institution, r.designation, r.role, r.quiz.pre ?? '', ...MODULES.map((m) => r.quiz[m.id] ?? ''), passed(r), r.updated ?? '']
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
  const avg = MODULES.map((m) => { const xs = participants.map((r) => r.quiz[m.id]).filter((x): x is number => x !== undefined); return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0; });
  const shown = subs.filter((x) => filter === 'all' || !x.feedback);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-5 gap-3">
        {[['Participants', participants.length], ['Completed Part I', participants.filter((r) => PART_MODULES(1).every((m) => (r.quiz[m.id] ?? 0) >= 60)).length], ['Completed Part II', participants.filter((r) => PART_MODULES(2).every((m) => (r.quiz[m.id] ?? 0) >= 60)).length], ['Need support (<4 passed)', participants.filter((r) => passed(r) < 4).length], ['Responses awaiting feedback', subs.filter((x) => !x.feedback).length]].map(([k, v]) => (
          <div key={k as string} className="card"><p className="text-xs text-slate-500">{k}</p><p className="text-2xl font-bold text-teal-900">{v}</p></div>))}
      </div>
      <div className="card overflow-x-auto">
        <div className="flex flex-wrap justify-between gap-2 mb-2"><h3 className="font-semibold">Cohort</h3>
          <span className="flex gap-2"><button className="btn-ghost" onClick={load}>Refresh</button><button className="btn-ghost" onClick={() => saveFile('cohort-report.csv', csv, 'text/csv')}>Export report (CSV)</button></span></div>
        <table className="text-sm w-full"><thead><tr className="text-left"><th>Name</th><th>DIET</th>{MODULES.map((m) => <th key={m.id} className="text-center">{m.no}</th>)}<th>Status</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id} className="border-t"><td>{r.name || <em className="text-slate-400">no name yet</em>}</td><td>{r.institution}</td>
              {MODULES.map((m) => { const x = r.quiz[m.id]; return <td key={m.id} className={`text-center ${x === undefined ? 'text-slate-400' : x >= 60 ? 'text-emerald-700' : 'text-amber-700'}`}>{x ?? '·'}</td>; })}
              <td>{passed(r) === MODULES.length ? 'Complete' : passed(r) < 4 ? <span className="text-rose-700 font-semibold">Needs support</span> : 'On track'}</td>
            </tr>))}</tbody></table>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Average quiz score by chapter (participants)</h3>
        <svg viewBox="0 0 480 160" className="w-full max-w-xl" role="img" aria-label="Average quiz score by chapter">
          {avg.map((v, i) => <g key={i}><rect x={10 + i * 39} y={130 - v * 1.2} width="28" height={v * 1.2} rx="3" fill={v >= 60 ? '#0f766e' : '#b45309'} />
            <text x={24 + i * 39} y={145} fontSize="10" textAnchor="middle" fill="currentColor">{i + 1}</text>
            <text x={24 + i * 39} y={126 - v * 1.2} fontSize="9" textAnchor="middle" fill="currentColor">{v}</text></g>)}
        </svg>
      </div>
      <div className="card space-y-3">
        <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">Activity responses</h3>
          <span className="flex gap-1">{(['pending', 'all'] as const).map((f) => <button key={f} className={filter === f ? 'btn-primary' : 'btn-ghost'} onClick={() => setFilter(f)}>{f === 'pending' ? 'Awaiting feedback' : 'All'}</button>)}</span></div>
        {shown.length === 0 && <p className="text-sm text-slate-500">Nothing here.</p>}
        {shown.map((x) => { const m = MODULES.find((mm) => mm.id === x.module_id); const who = name(x.user_id); return (
          <div key={x.id} className="border rounded-lg p-3">
            <p className="text-xs text-slate-500">{who?.name || 'Participant'}{who?.institution ? ` · ${who.institution}` : ''} · Ch {m?.no} · {m?.activity.title} · {fmt(x.updated_at)}</p>
            <p className="whitespace-pre-wrap">{x.body}</p>
            <form className="flex gap-2 mt-2" onSubmit={async (e) => { e.preventDefault(); await supabase!.from('submissions').update({ feedback: fb[x.id] ?? x.feedback ?? '' }).eq('id', x.id); load(); }}>
              <input aria-label="Feedback" className="input" placeholder="Feedback to the participant" value={fb[x.id] ?? x.feedback ?? ''} onChange={(e) => setFb({ ...fb, [x.id]: e.target.value })} />
              <button className="btn-primary">Send</button>
            </form>
          </div>); })}
      </div>
    </div>
  );
}

/* ---------- Access control (administrator only) ---------- */
type Person = { email: string; role: Role; note: string; added_at: string; joined: boolean; user_id: string | null; name: string; institution: string; last_sign_in: string | null };
export function AccessAdmin() {
  const { session } = useCloud();
  const [people, setPeople] = useState<Person[] | null>(null), [err, setErr] = useState(''), [msg, setMsg] = useState('');
  const [emails, setEmails] = useState(''), [role, setRole] = useState<Role>('participant'), [note, setNote] = useState(''), [filter, setFilter] = useState('');
  const load = async () => { const { data, error } = await supabase!.rpc('admin_people'); if (error) setErr(error.message); else { setErr(''); setPeople(data as Person[]); } };
  useEffect(() => { load(); }, []);
  const add = async () => {
    const list = [...new Set(emails.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean))];
    const bad = list.filter((x) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
    if (bad.length) { setErr(`Not a valid email: ${bad.join(', ')}`); return; }
    if (!list.length) return;
    const { error } = await supabase!.from('allowed_users').upsert(list.map((email) => ({ email, role, note })), { onConflict: 'email' });
    if (error) { setErr(error.message); return; }
    setEmails(''); setNote(''); setMsg(`${list.length} email(s) given access. Tell them to open the book and choose "Create your account".`); load();
  };
  const setPersonRole = async (p: Person, r: Role) => {
    const a = await supabase!.from('allowed_users').update({ role: r }).eq('email', p.email);
    const b = p.user_id ? await supabase!.from('profiles').update({ role: r }).eq('id', p.user_id) : { error: null };
    if (a.error || b.error) setErr((a.error ?? b.error)!.message); else load();
  };
  const remove = async (p: Person) => {
    const { error } = await supabase!.from('allowed_users').delete().eq('email', p.email);
    if (error) setErr(error.message); else { setMsg(`${p.email} can no longer use the book. Their saved work is kept; add the email again to restore access.`); load(); }
  };
  const me = session?.user.email?.toLowerCase();
  const shown = (people ?? []).filter((p) => !filter || (p.email + p.name + p.institution + p.note).toLowerCase().includes(filter.toLowerCase()));
  const csv = () => ['Email,Role,Note,Joined,Name,DIET,Last sign-in,Added', ...(people ?? []).map((p) => [p.email, p.role, p.note, p.joined ? 'Yes' : 'No', p.name, p.institution, p.last_sign_in ?? '', p.added_at].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
  return (
    <section className="card space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold">Access control · ಪ್ರವೇಶ ನಿಯಂತ್ರಣ</h3>
        <span className="flex gap-2"><button className="btn-ghost" onClick={load}>Refresh</button><button className="btn-ghost" onClick={() => saveFile('people-with-access.csv', csv(), 'text/csv')}>Export list (CSV)</button></span>
      </div>
      <p className="text-sm text-slate-600">Only the emails below can create an account and use the book. Removing an email stops access immediately.</p>
      <form className="grid sm:grid-cols-[1fr_auto] gap-2 border rounded-lg p-3" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <label className="sm:col-span-2"><span className="label">Give access to (one or more emails, separated by commas or new lines)</span>
          <textarea id="acc-emails" className="input min-h-[70px]" placeholder="lecturer1@example.com, lecturer2@example.com" value={emails} onChange={(e) => setEmails(e.target.value)} /></label>
        <div className="flex flex-wrap gap-2">
          <label><span className="label">Role</span><select id="acc-role" className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}><option value="participant">Participant</option><option value="facilitator">Facilitator</option><option value="admin">Administrator</option></select></label>
          <label className="flex-1 min-w-[160px]"><span className="label">Note (batch, DIET…)</span><input id="acc-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} /></label>
        </div>
        <button className="btn-primary self-end" disabled={!emails.trim()}>Give access</button>
      </form>
      {msg && <p role="status" className="text-sm text-teal-900">{msg}</p>}
      {err && <p role="alert" className="text-sm text-rose-700">{err}</p>}
      <div className="flex flex-wrap gap-3 items-center text-sm">
        <input aria-label="Search people" className="input max-w-xs" placeholder="Search" value={filter} onChange={(e) => setFilter(e.target.value)} />
        {people && <span>{people.length} with access · {people.filter((p) => p.joined).length} joined · {people.filter((p) => !p.joined).length} not yet joined</span>}
      </div>
      {!people ? <p className="text-sm">Loading…</p> : (
        <div className="overflow-x-auto"><table className="text-sm w-full min-w-[640px]"><thead><tr className="text-left"><th>Email</th><th>Name / DIET</th><th>Status</th><th>Role</th><th /></tr></thead>
          <tbody>{shown.map((p) => (
            <tr key={p.email} className="border-t">
              <td>{p.email}{p.note && <span className="block text-xs text-slate-500">{p.note}</span>}</td>
              <td>{p.name || '—'}{p.institution && <span className="block text-xs text-slate-500">{p.institution}</span>}</td>
              <td>{p.joined ? <span className="chip bg-emerald-100 text-emerald-900">Joined</span> : <span className="chip bg-amber-100 text-amber-900">Invited</span>}
                {p.last_sign_in && <span className="block text-xs text-slate-500">Last sign-in {new Date(p.last_sign_in).toLocaleDateString('en-IN')}</span>}</td>
              <td><select aria-label={`Role for ${p.email}`} className="input py-1" value={p.role} disabled={p.email === me} onChange={(e) => setPersonRole(p, e.target.value as Role)}>
                <option value="participant">participant</option><option value="facilitator">facilitator</option><option value="admin">admin</option></select></td>
              <td>{p.email !== me && <ConfirmRemove onConfirm={() => remove(p)} />}</td>
            </tr>))}</tbody></table></div>)}
    </section>
  );
}
function ConfirmRemove({ onConfirm }: { onConfirm: () => void }) {
  const [ask, setAsk] = useState(false);
  return ask
    ? <span className="flex gap-1"><button className="btn bg-rose-700 text-white py-1" onClick={() => { setAsk(false); onConfirm(); }}>Remove access</button><button className="btn-ghost py-1" onClick={() => setAsk(false)}>Cancel</button></span>
    : <button className="text-rose-700 text-sm" onClick={() => setAsk(true)}>Remove</button>;
}

/* ---------- Change password ---------- */
export function ChangePassword() {
  const [pw, setPw] = useState(''), [pw2, setPw2] = useState(''), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);
  return (
    <form className="grid gap-2 border-t pt-3" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const { error } = await supabase!.auth.updateUser({ password: pw });
      setBusy(false); setMsg(error ? error.message : 'Password changed · ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿತು'); if (!error) { setPw(''); setPw2(''); }
    }}>
      <h3 className="font-semibold">Change password · ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ</h3>
      <input id="new-pw" type="password" className="input" placeholder="New password (at least 8 characters)" autoComplete="new-password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} />
      <input id="new-pw2" type="password" className="input" placeholder="Type it again" autoComplete="new-password" required value={pw2} onChange={(e) => setPw2(e.target.value)} />
      <button className="btn-ghost justify-self-start" disabled={busy || pw.length < 8 || pw !== pw2}>Change password</button>
      {msg && <p role="status" className="text-sm">{msg}</p>}
    </form>
  );
}
