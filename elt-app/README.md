# English Language Teaching: A Sequenced Guide — app

The full guide (100 units, 800 figures, 805-term glossary) as a working web app, plus a **Phonetics Lab**.

## Run
```
node server.js        # Node 18+, no installs needed
# open http://localhost:3000
npm test              # API tests
```

## What is inside
- **Library**: 100 units in four Parts. Each unit has an opening wall of eight points, aims and background, the eight points (poster statements, classroom activity, model language with ▶ Listen, figure, tools, offline alternative), assess and reflect, self-check and further reading.
- **Activities in every unit**: put the procedure in order, “Did you try this?” with classroom notes, teacher reflection questions, and a self-check quiz marked by the server.
- **Phonetics Lab**: an interactive chart of the 44 British English phonemes (British Council / Cambridge symbols) with key words, extra words, minimal pairs, teaching tips, mouth diagrams (consonants) and a vowel chart (vowels and diphthong glides). Activities: minimal pairs, symbol to sound, read the transcription, word stress, stress shift, record yourself.
- **Figures** and **Glossary** with search; **My progress** with scores.

## Backend
`server.js` serves the front end and a JSON API: `/api/manifest`, `/api/units/:n`, `/api/glossary`, `/api/ipa`, `/api/units/:n/quiz` (+ `/check`), `/api/lab/:type` (+ `/check`), `/api/state`. Learners sign in by typing a name; progress, notes, reflections and scores are kept in `data/store.json`. Without a name, they stay in the browser.

Audio uses the device’s British English speech voice for words and sentences. The chart layout is original; the Underhill chart design is not reproduced (see Unit 4 permissions).

## Put it online (Render, free plan)
1. Sign in at https://render.com with your GitHub account.
2. Choose **New → Blueprint**, pick the `padnir` repository and the branch with this app. Render reads `render.yaml` at the repository root and creates the `elt-guide` web service.
3. Click **Apply**. After a minute or two Render shows a public link such as `https://elt-guide.onrender.com`.

Notes on the free plan: the site sleeps after about 15 minutes without visitors and takes up to a minute to wake. Its disk is temporary, so learner progress saved on the server (`data/store.json`) is wiped whenever the service restarts or redeploys. To keep it, upgrade to a paid plan, add a persistent disk mounted at `/var/data`, and set the environment variable `STORE=/var/data/store.json`.

Other hosts (Railway, Fly.io and so on) work too: set the root directory to `elt-app` and the start command to `node server.js`. The app listens on the `PORT` the host provides.
