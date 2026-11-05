# Putting the book online: Supabase + GitHub Pages

This takes about 30 minutes, once. You need: your Gmail account, and your GitHub account
(`drpadmashreerp-gif`). Everything below is free.

When you finish, the book will be at **https://drpadmashreerp-gif.github.io/padnir/**.
Participants sign in with their email (no password). Their work is saved online, facilitators see the
real cohort, and every chapter has a discussion board.

---

## Part 1 — Create the Supabase database (about 10 minutes)

1. Go to **https://supabase.com** → **Start your project** → sign in with GitHub (easiest) or your email.
2. Click **New project**.
   - **Organization:** your personal one is fine.
   - **Name:** `research-orientation`
   - **Database password:** click *Generate a password* and save it somewhere safe (you rarely need it).
   - **Region:** **South Asia (Mumbai)** — closest to Karnataka.
   - Plan: **Free**. Click **Create new project** and wait 1–2 minutes.
3. Open **SQL Editor** (left menu) → **New query**.
   Open the file `research-orientation-app/supabase/schema.sql` from this repository on GitHub,
   copy all of it, paste it into the editor, and click **Run**. You should see *Success. No rows returned*.
   (It is safe to run again later.)
4. Open **Project Settings → API** (or **Connect** at the top). Copy two values into a note:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon / public key** — a long text starting `eyJ…` (this key is meant to be public; the database rules
     in step 3 protect the data). **Do not copy the `service_role` key.**

## Part 2 — Let Supabase send sign-in codes from your Gmail (about 10 minutes)

Supabase's built-in email only reaches members of your Supabase team, so participants would never get
their code. Sending through your Gmail fixes this (up to about 500 emails a day).

1. In your Google account, turn on **2-Step Verification** (myaccount.google.com → Security), if it isn't on.
2. Go to **https://myaccount.google.com/apppasswords** → create an app password named `Supabase`.
   Google shows a 16-letter password. Copy it.
3. In Supabase: **Authentication → Emails → SMTP Settings** → turn on **Enable custom SMTP**:
   - Sender email: your Gmail address · Sender name: `Research Orientation`
   - Host: `smtp.gmail.com` · Port: `465`
   - Username: your Gmail address · Password: the 16-letter app password
   - Save.
4. **Authentication → Rate Limits**: set *Rate limit for sending emails* to `100` per hour (so a whole
   batch can sign in during a session). Save.
5. **Authentication → Emails → Templates**. The app signs people in with a **code**, so the code must be
   in the email. Edit **both** the *Magic Link* and the *Confirm signup* templates and replace the body with:

   ```html
   <h2>Research Methodology Orientation</h2>
   <p>Your sign-in code is: <strong style="font-size:24px">{{ .Token }}</strong></p>
   <p>ನಿಮ್ಮ ಸೈನ್ ಇನ್ ಸಂಕೇತ: <strong>{{ .Token }}</strong></p>
   <p>Type this code in the book. It expires in one hour. If you did not ask for it, ignore this email.</p>
   ```
   Subject for both: `Your sign-in code · ಸೈನ್ ಇನ್ ಸಂಕೇತ`. Save each.
6. **Authentication → URL Configuration** → *Site URL*: `https://drpadmashreerp-gif.github.io/padnir/` → Save.

## Part 3 — Publish on GitHub Pages (about 5 minutes)

1. Open **https://github.com/drpadmashreerp-gif/padnir/settings/pages**.
   Under *Build and deployment* → *Source*, choose **GitHub Actions**.
2. Open **https://github.com/drpadmashreerp-gif/padnir/settings/variables/actions** →
   **New repository variable**, twice:
   - Name `VITE_SUPABASE_URL` · Value: the Project URL from Part 1.
   - Name `VITE_SUPABASE_ANON_KEY` · Value: the anon public key from Part 1.
   (Use the **Variables** tab, not Secrets.)
3. Merge this branch into the repository's default branch (or ask Claude to open a pull request for you).
   The workflow **Deploy book to GitHub Pages** starts by itself. You can also start it from the
   **Actions** tab → *Deploy book to GitHub Pages* → **Run workflow**.
4. After 2–3 minutes, open **https://drpadmashreerp-gif.github.io/padnir/**.

## Part 4 — Make yourself the administrator (2 minutes)

1. Open the book → **My account** → sign in with your email and the code you receive.
   Fill in your name and DIET and click **Save profile**.
2. In Supabase → **SQL Editor** → **New query**, run (with your own email):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'drpadmashreerp@gmail.com');
   ```
3. Reload the book. **Facilitator desk** now appears. As administrator you can make any signed-in person
   a *facilitator* from the Role column of the cohort table.

## Running a batch

- Share the link with participants. Each one signs in once per device with their email and a code.
- Facilitators see every participant's quiz scores and activity responses, send feedback, post
  announcements on the cover page, and export the cohort report (CSV).
- Participants can download their certificate, chapters, the whole book and their portfolio as Word files.

## Good to know

- **Free-plan pause:** Supabase pauses a free project after 7 days with no activity. Data is kept; open the
  Supabase dashboard and click **Restore project** before the next session.
- **Free limits:** 500 MB of data and 50,000 sign-ins a month — far more than a training cohort needs.
- **Backups:** Supabase → Database → Backups, or Table Editor → Export to CSV.
- **Privacy:** data stays in your Supabase project. Participants see only their own work; discussion posts
  and announcements are visible to everyone signed in.
- **The claude.ai copy** and the standalone HTML file keep working without accounts; work stays on the device.
- **Link check:** the workflow *Check book links* tests every link in the Resource library each Monday and
  shows a red cross in the Actions tab if one breaks.
