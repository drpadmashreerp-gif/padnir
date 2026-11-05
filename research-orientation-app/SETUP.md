# Putting the book online: Supabase + GitHub Pages

This takes about 30 minutes, once. You need: your Gmail account, and your GitHub account
(`drpadmashreerp-gif`). Everything below is free.

When you finish, the book will be at an address such as **https://dsert-research-orientation.netlify.app**
(you choose the name in Part 3). The repository is kept **private**, so the book's text is not public.
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
4. Still in the SQL Editor, click **New query** again. Open `research-orientation-app/supabase/content.sql`
   on GitHub (click **Raw**, then select all and copy), paste it and click **Run**. This installs the book's
   chapters inside the protected database, where only signed-in people on your list can read them.
   Whenever the chapters are updated later, run this file again.
5. Open **Project Settings → API** (or **Connect** at the top). Copy two values into a note:
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
7. **Authentication → URL Configuration** → *Site URL*: your Netlify address from Part 3 (you can come back
   to this step after Part 3) → Save.

## Part 3 — Make the repository private and publish on Netlify (about 10 minutes)

**A. Make the repository private**

1. First merge this branch into the repository's default branch (or ask Claude to open a pull request).
2. Open **https://github.com/drpadmashreerp-gif/padnir/settings** → scroll to **Danger Zone** →
   **Change repository visibility** → **Make private** → confirm.
   From now on only you (and people you add as collaborators) can see the code, the chapter text and the
   old commits. The GitHub Pages workflow switches itself off for a private repository.

**B. Create the Netlify site (free)**

1. Go to **https://app.netlify.com/signup** and choose **Sign up with GitHub**.
2. Click **Add new site** (called **Add new project** in newer screens) **→ Import an existing project → GitHub**. When GitHub asks, choose
   **Only select repositories → padnir** and click **Install & Authorize**. This lets Netlify read your
   private repository; nobody else gains access.
3. Pick **padnir**. Netlify reads the settings from the `netlify.toml` file in the repository, so the boxes
   fill in by themselves: *Base directory* `research-orientation-app`, *Build command*
   `npm test && npm run build`, *Publish directory* `research-orientation-app/dist`. Leave them as they are.
   Under *Branch to deploy*, choose the branch you merged into.
4. Click **Add environment variables** (or after the first deploy: **Site configuration → Environment
   variables → Add a variable**) and add two:
   - `VITE_SUPABASE_URL` = the Project URL from Part 1
   - `VITE_SUPABASE_ANON_KEY` = the anon public key from Part 1
5. Click **Deploy**. After 2–3 minutes the site is live at a random address such as
   `https://wonderful-name-123.netlify.app`.
6. Give it a clear name: **Site configuration → Change site name** → for example
   `dsert-research-orientation` → the address becomes `https://dsert-research-orientation.netlify.app`.
7. Go back to Supabase → **Authentication → URL Configuration** → set *Site URL* to this address (Part 2, step 7).
8. If you added the environment variables after the first deploy, open **Deploys → Trigger deploy →
   Deploy site** once so the build picks them up.

From now on, every change merged into that branch is published automatically.

*Prefer GitHub Pages instead?* It works only while the repository is public (or with a paid GitHub plan):
Settings → Pages → Source **GitHub Actions**, and add the same two values under
Settings → Secrets and variables → Actions → **Variables**.

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
- **What is private:** the online website contains no chapter text at all. The chapters are stored in the
  protected database and are sent only to signed-in people on your list, together with their saved work,
  responses, discussions, announcements and cohort data. With the repository private, the source code and
  its history are hidden as well. A participant's device keeps a copy of the chapters for offline reading
  until they sign out.
- **Netlify free plan:** 100 GB of traffic and 300 build minutes a month — plenty for training batches.
- **The claude.ai copy** is private to you unless you share it, and has no login. A standalone HTML copy
  (`npm run build:single`) also has no login, so share it only with people you trust; it is not kept in this repository.
- **Link check:** the workflow *Check book links* tests every link in the Resource library each Monday and
  shows a red cross in the Actions tab if one breaks.
