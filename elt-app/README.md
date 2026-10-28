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
