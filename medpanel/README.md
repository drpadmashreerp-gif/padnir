# MedPanel

Upload a blood report (PDF or image) and get a multi-specialist explanation: values are extracted to JSON, flagged by fixed rules, reviewed in parallel by six Claude "specialists", and synthesised by a Chief Physician call. Results are colour-coded, trended across reports and exportable as PDF.

> Educational aid, not a medical device. Review the critical limits in `lib/analytes.js` with a clinician before any real use.

## Run

```bash
cd medpanel
npm install
export ANTHROPIC_API_KEY=...      # without a key the app runs in offline, rules-only mode
npm start                          # http://localhost:3000
npm test
```

Options: `MEDPANEL_MODEL` (default `claude-opus-5-5`), `MEDPANEL_OCR=claude` (skip local Tesseract and send images to Claude vision), `MEDPANEL_OFFLINE=1`, `PORT`. Serve behind HTTPS in any real deployment.

## Pipeline

1. **Extract** (`lib/ocr.js`): text PDFs via pdf-parse, images via Tesseract.js; scanned PDFs (or images when OCR fails) go to Claude as a document/image block.
2. **De-identify** (`lib/redact.js`): names, IDs, phones, emails, DOB and addresses are removed from text before any API call. Age and sex are kept.
3. **Structure** (`lib/extract.js`): Claude structured output → `{report_date, patient, analytes[]}`.
4. **Rules in code** (`lib/analytes.js`, `lib/rules.js`): unit conversion (incl. lakh/cumm, mmol/L ↔ mg/dL), plausibility checks (likely OCR errors are marked *Verify* and never interpreted), critical limits, then lab or default reference ranges.
5. **Specialists in parallel** (`lib/orchestrator.js`): Haematology, Nephrology, Hepatology, Endocrinology, Cardiology, Internal Medicine; each runs only if it has relevant results. The shared system prompt `prompts/medpanel-system.md` is prompt-cached.
6. **Chief Physician** synthesis, then `enforceCriticals()` re-checks the output: any rule-detected critical value the model omitted is injected and urgency is forced to *urgent*. The critical banner is rendered from rule output, not model text.

Claude calls use server-side refusal fallbacks (`fallbacks: "default"`).

## Privacy

- **Consent screen** must be accepted each session; the server also rejects uploads without the consent field.
- **No retention by default**: uploads use in-memory storage, buffers are zeroed after processing, nothing is written to disk, logs record only method/path/status, and every response is `Cache-Control: no-store`.
- **Encrypted history (opt-in)**: trend data can be saved in the browser with AES-256-GCM, key derived from the user's passphrase (PBKDF2-SHA256, 310k iterations). The server never sees it. Backup/restore and delete-all are provided.
- Data sent to the Claude API is subject to Anthropic's API data-retention terms; arrange zero data retention with Anthropic if your use requires it.
