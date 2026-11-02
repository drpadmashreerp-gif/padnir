# Research Methodology Orientation — interactive bilingual book for DIET faculty, Karnataka
# ಸಂಶೋಧನಾ ವಿಧಾನ ದೃಷ್ಟಿಕೋನ ತರಬೇತಿ — ಡಯಟ್ ಉಪನ್ಯಾಸಕರಿಗಾಗಿ ದ್ವಿಭಾಷಾ ಸಂವಾದಾತ್ಮಕ ಪುಸ್ತಕ

A 60-hour, 12-chapter orientation built from the master prompt, with worked examples from Karnataka's
Department of School Education and Literacy (DSERT, DIETs, CRCs/BRCs, SATS, LBA, HPC, Sethubandha,
Kalika Chetarike, Nali Kali, KPS bilingual sections, SDMCs, Chinnara Angala, NAS/PARAKH).

## What is in the book
| Ch | Title | Hours |
|---|---|---|
| 1 | Foundations of Educational Research · ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆಯ ಅಡಿಪಾಯ | 5 |
| 2 | Research Ethics and Integrity · ಸಂಶೋಧನಾ ನೈತಿಕತೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆ | 3 |
| 3 | Identifying Research Problems · ಸಂಶೋಧನಾ ಸಮಸ್ಯೆಗಳ ಗುರುತಿಸುವಿಕೆ | 4 |
| 4 | Quantitative Research Methods · ಪರಿಮಾಣಾತ್ಮಕ ಸಂಶೋಧನಾ ವಿಧಾನಗಳು | 6 |
| 5 | Qualitative Research Methods · ಗುಣಾತ್ಮಕ ಸಂಶೋಧನಾ ವಿಧಾನಗಳು | 6 |
| 6 | Mixed Methods Research · ಮಿಶ್ರ ವಿಧಾನ ಸಂಶೋಧನೆ | 4 |
| 7 | Action Research for Education · ಶಿಕ್ಷಣದಲ್ಲಿ ಕ್ರಿಯಾ ಸಂಶೋಧನೆ | 5 |
| 8 | Classroom Research · ತರಗತಿ ಸಂಶೋಧನೆ | 4 |
| 9 | Community-Based Research · ಸಮುದಾಯ ಆಧಾರಿತ ಸಂಶೋಧನೆ | 3 |
| 10 | Data Collection and Analysis · ದತ್ತಾಂಶ ಸಂಗ್ರಹ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ | 8 |
| 11 | Research Communication · ಸಂಶೋಧನಾ ಸಂವಹನ | 6 |
| 12 | Quality Assurance in Research · ಸಂಶೋಧನೆಯಲ್ಲಿ ಗುಣಮಟ್ಟ ಭರವಸೆ | 6 |

Each chapter is a set of pages: opener with objectives → lessons → "From Karnataka classrooms" examples →
activity (with an embedded tool and a response sent to the facilitator desk) → quiz with feedback.

**Bilingual reading.** Every chapter, example, activity and quiz exists in English and Kannada.
Readers switch between English, ಕನ್ನಡ, or both side by side (default). Menus are shown in both languages.

**13 research tools:** research question builder, ethics decision tree, sample size calculator, statistics
workbench (descriptives, Welch and paired t-tests, one-way ANOVA, chi-square, Pearson r — with p-values and
effect sizes), survey builder, qualitative coding practice, mixed-methods design selector with joint display,
action research journal, classroom observation timer, stakeholder map, proposal builder (Word export / print),
APA reference manager, quality checklist.

**Also:** pre-assessment, progress tracking, badges, points and day streaks, bookmarks, notes, full-text search
(English and Kannada), resource library with downloadable templates (bilingual consent form, observation
schedule, proposal outline, policy brief, codebook), glossary of Karnataka terms, facilitator desk (cohort
table, chapter analytics, CSV export, feedback on submissions), printable certificate, text size, high-contrast
mode, backup/restore, offline use (PWA).

## Run it
```bash
npm install
npm run dev          # local development
npm test             # statistics and content-parity tests
npm run build        # PWA build in dist/
npm run build:single # one self-contained HTML file: dist/single/research-orientation.html
```
A ready-built copy is committed as `Research_Methodology_Orientation_Book.html`. The single HTML file can be shared by email or pen drive and opened in any browser without internet
(fonts fall back to system fonts offline).

## Notes for the Department
- Figures inside worked examples are **illustrative teaching data** unless a source is named; the page says so.
  Statements about State evidence come from the background notes in this repository's `rewrites/` folder.
- The Kannada text is a careful first translation; it should be reviewed by a DSERT language editor before
  wide release. Tool screens (calculators, forms) have bilingual titles but English working labels.
- Data are stored only in each user's browser. The facilitator desk shows a sample cohort; connecting a shared
  database (e.g. Supabase or Firebase, as the master prompt suggests) is the next step for real multi-DIET use,
  along with login, messaging and mentorship features.
- Content lives in `src/data/modules.ts` (English) and `src/data/modules.kn.ts` (Kannada). A test fails if the
  two editions drift apart.
