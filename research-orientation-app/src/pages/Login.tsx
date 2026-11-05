// Sign-in screen for the online version. Only emails the administrator has allowed can create an account.
import { useState, ReactNode } from 'react';
import { supabase, cloudEnabled, useCloud } from '../lib/cloud';

type Mode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';
const MIN = 8;

function explain(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('database error') || m.includes('not been given access')) return 'This email has not been given access to the book. Please ask the course administrator to add it. · ಈ ಇಮೇಲ್‌ಗೆ ಪ್ರವೇಶ ನೀಡಲಾಗಿಲ್ಲ; ಆಡಳಿತಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ.';
  if (m.includes('invalid login')) return 'Email or password is not correct. · ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಸರಿಯಿಲ್ಲ.';
  if (m.includes('already registered')) return 'An account already exists for this email. Sign in, or use "Forgot password". · ಈ ಇಮೇಲ್‌ಗೆ ಈಗಾಗಲೇ ಖಾತೆ ಇದೆ.';
  if (m.includes('expired') || m.includes('invalid') && m.includes('token')) return 'That code is wrong or has expired. Ask for a new one. · ಸಂಕೇತ ತಪ್ಪು ಅಥವಾ ಅವಧಿ ಮೀರಿದೆ.';
  if (m.includes('rate limit') || m.includes('security purposes')) return 'Too many attempts. Please wait a minute and try again. · ಸ್ವಲ್ಪ ಸಮಯ ಕಾದು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.';
  if (m.includes('fetch')) return 'No internet connection. Check your connection and try again. · ಅಂತರ್ಜಾಲ ಸಂಪರ್ಕ ಇಲ್ಲ.';
  return msg;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-teal-800 to-emerald-700 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4 text-slate-800">
        <div>
          <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold">For DIET faculty · ಡಯಟ್ ಉಪನ್ಯಾಸಕರಿಗಾಗಿ</p>
          <h1 className="text-2xl font-bold text-teal-900">Research Methodology Orientation</h1>
          <p lang="kn" className="text-teal-800">ಸಂಶೋಧನಾ ವಿಧಾನ ದೃಷ್ಟಿಕೋನ ತರಬೇತಿ</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [pw2, setPw2] = useState(''), [code, setCode] = useState(''), [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), [err, setErr] = useState('');
  const go = (m: Mode, note = '') => { setMode(m); setErr(''); setMsg(note); setCode(''); };
  const e = email.trim().toLowerCase();
  const run = async (fn: () => Promise<void>) => { setBusy(true); setErr(''); try { await fn(); } catch (x) { setErr(explain((x as Error).message)); } finally { setBusy(false); } };
  const pwOk = mode === 'signin' ? pw.length > 0 : pw.length >= MIN && pw === pw2;

  const submit = () => run(async () => {
    const sb = supabase!;
    if (mode === 'signin') {
      const { error } = await sb.auth.signInWithPassword({ email: e, password: pw });
      if (error?.message.toLowerCase().includes('not confirmed')) { await sb.auth.resend({ type: 'signup', email: e }); go('verify', 'Your email is not yet confirmed. We have sent a new 6-digit code.'); return; }
      if (error) throw error;
    } else if (mode === 'signup') {
      const { data, error } = await sb.auth.signUp({ email: e, password: pw });
      if (error) throw error;
      if (!data.session) go('verify', 'We emailed a 6-digit code to confirm your email. It can take a minute; check spam too. · ಇಮೇಲ್ ಖಚಿತಪಡಿಸಲು 6 ಅಂಕಿಯ ಸಂಕೇತ ಕಳುಹಿಸಲಾಗಿದೆ.');
    } else if (mode === 'verify') {
      const { error } = await sb.auth.verifyOtp({ email: e, token: code.trim(), type: 'signup' });
      if (error) throw error;
    } else if (mode === 'forgot') {
      const { error } = await sb.auth.resetPasswordForEmail(e);
      if (error) throw error;
      setPw(''); setPw2(''); go('reset', 'If this email has an account, a 6-digit code is on its way. · ಖಾತೆ ಇದ್ದರೆ 6 ಅಂಕಿಯ ಸಂಕೇತ ಕಳುಹಿಸಲಾಗಿದೆ.');
    } else if (mode === 'reset') {
      const { error } = await sb.auth.verifyOtp({ email: e, token: code.trim(), type: 'recovery' });
      if (error) throw error;
      const { error: e2 } = await sb.auth.updateUser({ password: pw });
      if (e2) throw e2;
    }
  });

  const title: Record<Mode, string> = { signin: 'Sign in · ಸೈನ್ ಇನ್', signup: 'Create your account · ಖಾತೆ ರಚಿಸಿ', verify: 'Confirm your email · ಇಮೇಲ್ ಖಚಿತಪಡಿಸಿ', forgot: 'Forgot password · ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ', reset: 'Set a new password · ಹೊಸ ಪಾಸ್‌ವರ್ಡ್' };
  const action: Record<Mode, string> = { signin: 'Sign in', signup: 'Create account', verify: 'Confirm', forgot: 'Email me a code', reset: 'Save new password' };
  const needsPw = mode === 'signin' || mode === 'signup' || mode === 'reset';
  const needsCode = mode === 'verify' || mode === 'reset';

  return (
    <Shell>
      <h2 className="text-lg font-bold">{title[mode]}</h2>
      {mode === 'signup' && <p className="text-sm text-slate-600">Use the email address the course administrator added for you. · ಆಡಳಿತಗಾರರು ಸೇರಿಸಿದ ಇಮೇಲ್ ಬಳಸಿ.</p>}
      {msg && <p role="status" className="text-sm bg-teal-50 text-teal-900 rounded-lg p-2">{msg}</p>}
      <form className="space-y-3" onSubmit={(ev) => { ev.preventDefault(); submit(); }}>
        <label className="block"><span className="label">Email · ಇಮೇಲ್</span>
          <input id="login-email" type="email" required autoComplete="email" className="input" value={email} disabled={needsCode} onChange={(ev) => setEmail(ev.target.value)} /></label>
        {needsCode && <label className="block"><span className="label">6-digit code from the email · ಇಮೇಲ್‌ನಲ್ಲಿನ ಸಂಕೇತ</span>
          <input id="login-code" inputMode="numeric" pattern="[0-9]{6,8}" required autoComplete="one-time-code" className="input tracking-widest text-lg" value={code} onChange={(ev) => setCode(ev.target.value)} /></label>}
        {needsPw && <label className="block"><span className="label">{mode === 'signin' ? 'Password · ಪಾಸ್‌ವರ್ಡ್' : `New password (at least ${MIN} characters) · ಹೊಸ ಪಾಸ್‌ವರ್ಡ್`}</span>
          <span className="flex gap-1"><input id="login-pw" type={show ? 'text' : 'password'} required minLength={mode === 'signin' ? 1 : MIN} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} className="input" value={pw} onChange={(ev) => setPw(ev.target.value)} />
            <button type="button" className="btn-ghost shrink-0" onClick={() => setShow(!show)} aria-pressed={show}>{show ? 'Hide' : 'Show'}</button></span></label>}
        {(mode === 'signup' || mode === 'reset') && <label className="block"><span className="label">Type the password again · ಮತ್ತೆ ಟೈಪ್ ಮಾಡಿ</span>
          <input id="login-pw2" type={show ? 'text' : 'password'} required autoComplete="new-password" className="input" value={pw2} onChange={(ev) => setPw2(ev.target.value)} />
          {pw2 && pw !== pw2 && <span className="text-xs text-rose-700">The two passwords do not match.</span>}</label>}
        {err && <p role="alert" className="text-sm text-rose-700">{err}</p>}
        <button className="btn-primary w-full justify-center" disabled={busy || (needsPw && !pwOk)}>{busy ? 'Please wait…' : action[mode]}</button>
      </form>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        {mode === 'signin' ? <>
          <button className="text-teal-700 underline" onClick={() => go('signup')}>First time? Create your account</button>
          <button className="text-teal-700 underline" onClick={() => go('forgot')}>Forgot password?</button>
        </> : mode === 'verify' ? <>
          <button className="text-teal-700 underline" onClick={() => run(async () => { const { error } = await supabase!.auth.resend({ type: 'signup', email: e }); if (error) throw error; setMsg('A new code has been sent.'); })}>Send a new code</button>
          <button className="text-teal-700 underline" onClick={() => go('signin')}>Back to sign in</button>
        </> : <button className="text-teal-700 underline" onClick={() => go('signin')}>Back to sign in</button>}
      </div>
      <p className="text-xs text-slate-500">This book is open only to people invited by the course administrator. · ಆಹ್ವಾನಿತರಿಗೆ ಮಾತ್ರ.</p>
    </Shell>
  );
}

/** Shows the app only to signed-in people who are on the allowed list (online version). */
export function Gate({ children }: { children: ReactNode }) {
  const { session, member, authReady, signOut } = useCloud();
  if (!cloudEnabled) return <>{children}</>;
  if (!authReady) return <Shell><p role="status">Loading… · ಲೋಡ್ ಆಗುತ್ತಿದೆ…</p></Shell>;
  if (!session) return <Login />;
  if (member === null) return <Shell><p role="status">Checking your access… · ಪ್ರವೇಶ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…</p></Shell>;
  if (member === false) return (
    <Shell>
      <h2 className="text-lg font-bold">No access · ಪ್ರವೇಶವಿಲ್ಲ</h2>
      <p className="text-sm">The account <strong>{session.user.email}</strong> is not on the list of people allowed to use this book, or its access has been removed. Please contact the course administrator.</p>
      <p lang="kn" className="text-sm">ಈ ಖಾತೆಗೆ ಪುಸ್ತಕ ಬಳಸಲು ಅನುಮತಿ ಇಲ್ಲ ಅಥವಾ ಅನುಮತಿ ತೆಗೆಯಲಾಗಿದೆ. ಆಡಳಿತಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ.</p>
      <button className="btn-primary" onClick={signOut}>Sign out · ಸೈನ್ ಔಟ್</button>
    </Shell>
  );
  return <>{children}</>;
}
