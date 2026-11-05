# Putting the book online: Supabase + GitHub Pages

This takes about 30 minutes, once. You need: your Gmail account, and your GitHub account
(`drpadmashreerp-gif`). Everything below is free.

When you finish, the book will be at **https://drpadmashreerp-gif.github.io/padnir/**.
**Only people you allow can use it.** Each person signs in with their email and a password. An account can
be created only for an email you have added in the app's *Access control* panel; removing an email stops
that person's access at once. Their work is saved online, facilitators see the real cohort, and every
chapter has a discussion board.

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
   copy all of it and paste it into the editor.
   **Before running:** scroll to the last lines and replace `your.email@example.com` with **your own email
   in lower case**. This makes you the first administrator. Then click **Run**. You should see
   *Success. No rows returned*. (It is safe to run again later.)
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
5. **Authentication → Sign In / Providers → Email**: keep **Enable Email provider**, **Allow new users to
   sign up** and **Confirm email** all switched on (the database itself refuses anyone not on your list).
   Set **Minimum password length** to `8`. Save.
6. **Authentication → Emails → Templates**. The app confirms emails and resets passwords with a
   **6-digit code**, so the code must be in the email. Edit the **Confirm signup** and **Reset Password**
   templates and replace each body with:

   ```html
   <h2>Research Methodology Orientation</h2>
   <p>Your code is: <strong style="font-size:24px">{{ .Token }}</strong></p>
   <p>ನಿಮ್ಮ ಸಂಕೇತ: <strong>{{ .Token }}</strong></p>
   <p>Type this code in the book. It expires in one hour. If you did not ask for it, ignore this email.</p>
   ```
   Subject: `Your code · ನಿಮ್ಮ ಸಂಕೇತ`. Save each.
7. **Authentication → URL Configuration** → *Site URL*: `https://drpadmashreerp-gif.github.io/padnir/` → Save.

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

## Part 4 — Create your account and invite people (5 minutes)

1. Open the book. It shows a sign-in screen. Choose **First time? Create your account**, enter the email
   you put in the setup script and a password, then type the 6-digit code from the email.
   You are now the administrator. Open **My account** to add your name and DIET.
2. Open **Facilitator desk → Access control**. Paste the emails of the people you allow (one per line or
   separated by commas), choose their role (participant, facilitator or administrator), add a note such as
   the batch or DIET, and click **Give access**.
3. Tell them: open the link, choose **Create your account**, use that same email, set a password, and type
   the code they receive. Anyone whose email is not on your list cannot create an account.
4. To stop someone's access, click **Remove** next to their email. Their saved work is kept; adding the email
   again restores access. People can reset a forgotten password themselves with **Forgot password?**.

## Running a batch

- Share the link only with people you have added in Access control. Each signs in with email and password.
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
- **What the login protects:** using the app, everyone's saved work, activity responses, discussions,
  announcements and the cohort data. The book's text itself is part of the website's code, and this
  repository is public, so a technically skilled person could still read the chapter text without signing in.
  To keep the text private as well, make the repository private and host it on a service that supports
  private repositories (GitHub Pages needs a paid plan for that).
- **The claude.ai copy** is private to you unless you share it, and has no login. A standalone HTML copy
  (`npm run build:single`) also has no login, so share it only with people you trust; it is not kept in this repository.
- **Link check:** the workflow *Check book links* tests every link in the Resource library each Monday and
  shows a red cross in the Actions tab if one breaks.
