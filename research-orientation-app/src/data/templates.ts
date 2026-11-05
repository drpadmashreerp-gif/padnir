// Downloadable Word templates for the Resource library (bilingual headings; Kannada to be reviewed by a DSERT language editor).
import type { Block } from '../lib/docx';

export interface Template { id: string; name: string; kn: string; desc: string; blocks: Block[] }

const line = '______________________________';
const head = (en: string, kn: string): Block => ({ t: 'title', text: `${en}\n${kn}` });
const fields = (rows: [string, string][]): Block => ({ t: 'table', header: false, widths: [3600, 5400], rows: rows.map(([en, kn]) => [`${en} / ${kn}`, '']) });

export const TEMPLATES: Template[] = [
  {
    id: 'consent', name: 'Parent consent form', kn: 'ಪೋಷಕರ ಒಪ್ಪಿಗೆ ಪತ್ರ', desc: 'English and Kannada on one page, with signature or thumb impression.',
    blocks: [
      head('Parent / Guardian Consent Form', 'ಪೋಷಕರ / ಪಾಲಕರ ಒಪ್ಪಿಗೆ ಪತ್ರ'),
      fields([['Study title', 'ಅಧ್ಯಯನದ ಶೀರ್ಷಿಕೆ'], ['Researcher and DIET', 'ಸಂಶೋಧಕರು ಮತ್ತು ಡಯಟ್'], ['School', 'ಶಾಲೆ'], ['Contact number', 'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ']]),
      { t: 'h2', text: 'English' },
      { t: 'p', text: `Your child is invited to take part in a study about ${line}. Your child will be asked to ${line} for about ____ minutes during school hours.` },
      { t: 'bullet', text: 'Taking part is voluntary. You or your child may stop at any time.' },
      { t: 'bullet', text: 'Your child\'s marks and school records will not be affected.' },
      { t: 'bullet', text: 'Your child\'s name and SATS number will not appear in any report.' },
      { t: 'bullet', text: 'Photographs or recordings will be made only if you tick the box below.' },
      { t: 'h2', text: 'ಕನ್ನಡ' },
      { t: 'p', text: `ನಿಮ್ಮ ಮಗುವನ್ನು ${line} ಕುರಿತ ಅಧ್ಯಯನದಲ್ಲಿ ಭಾಗವಹಿಸಲು ಆಹ್ವಾನಿಸಲಾಗಿದೆ. ಶಾಲಾ ಸಮಯದಲ್ಲಿ ಸುಮಾರು ____ ನಿಮಿಷಗಳ ಕಾಲ ನಿಮ್ಮ ಮಗು ${line} ಮಾಡಬೇಕಾಗುತ್ತದೆ.` },
      { t: 'bullet', text: 'ಭಾಗವಹಿಸುವಿಕೆ ಸ್ವಯಂಪ್ರೇರಿತ. ನೀವು ಅಥವಾ ನಿಮ್ಮ ಮಗು ಯಾವಾಗ ಬೇಕಾದರೂ ಹಿಂದೆ ಸರಿಯಬಹುದು.' },
      { t: 'bullet', text: 'ಮಗುವಿನ ಅಂಕಗಳು ಮತ್ತು ಶಾಲಾ ದಾಖಲೆಗಳ ಮೇಲೆ ಯಾವುದೇ ಪರಿಣಾಮ ಇರುವುದಿಲ್ಲ.' },
      { t: 'bullet', text: 'ಮಗುವಿನ ಹೆಸರು ಮತ್ತು SATS ಸಂಖ್ಯೆ ಯಾವುದೇ ವರದಿಯಲ್ಲಿ ಪ್ರಕಟವಾಗುವುದಿಲ್ಲ.' },
      { t: 'bullet', text: 'ಕೆಳಗಿನ ಚೌಕದಲ್ಲಿ ನೀವು ಗುರುತು ಹಾಕಿದರೆ ಮಾತ್ರ ಫೋಟೋ ಅಥವಾ ಧ್ವನಿಮುದ್ರಣ ಮಾಡಲಾಗುವುದು.' },
      { t: 'h2', text: 'Agreement · ಒಪ್ಪಿಗೆ' },
      { t: 'p', text: '[  ] I agree that my child may take part. · ನನ್ನ ಮಗು ಭಾಗವಹಿಸಲು ನಾನು ಒಪ್ಪುತ್ತೇನೆ.\n[  ] I agree to photographs / audio recording. · ಫೋಟೋ / ಧ್ವನಿಮುದ್ರಣಕ್ಕೆ ನಾನು ಒಪ್ಪುತ್ತೇನೆ.' },
      fields([['Child\'s name', 'ಮಗುವಿನ ಹೆಸರು'], ['Parent / guardian name', 'ಪೋಷಕರ ಹೆಸರು'], ['Signature or thumb impression', 'ಸಹಿ ಅಥವಾ ಹೆಬ್ಬೆಟ್ಟು'], ['Date', 'ದಿನಾಂಕ']]),
    ],
  },
  {
    id: 'assent', name: 'Child assent script', kn: 'ಮಗುವಿನ ಸಮ್ಮತಿ ನುಡಿ', desc: 'What to say to a child before an activity, in both languages.',
    blocks: [
      head('Child Assent Script', 'ಮಗುವಿನ ಸಮ್ಮತಿ ನುಡಿ'),
      { t: 'note', text: 'Read aloud in the child\'s home language. Record the answer below. · ಮಗುವಿನ ಮನೆಮಾತಿನಲ್ಲಿ ಗಟ್ಟಿಯಾಗಿ ಓದಿ. ಉತ್ತರವನ್ನು ಕೆಳಗೆ ದಾಖಲಿಸಿ.' },
      { t: 'p', text: '"Hello. My name is ______. I want to learn how children read and do sums. I will ask you to read a short story and answer a few questions. This is not an exam. Your marks will not change. You can stop at any time and nobody will be upset. Would you like to try?"' },
      { t: 'p', text: '"ನಮಸ್ಕಾರ. ನನ್ನ ಹೆಸರು ______. ಮಕ್ಕಳು ಹೇಗೆ ಓದುತ್ತಾರೆ, ಲೆಕ್ಕ ಮಾಡುತ್ತಾರೆ ಎಂದು ತಿಳಿಯಲು ಬಯಸುತ್ತೇನೆ. ಒಂದು ಚಿಕ್ಕ ಕಥೆ ಓದಿ ಕೆಲವು ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಲು ಕೇಳುತ್ತೇನೆ. ಇದು ಪರೀಕ್ಷೆ ಅಲ್ಲ. ನಿನ್ನ ಅಂಕಗಳು ಬದಲಾಗುವುದಿಲ್ಲ. ಯಾವಾಗ ಬೇಕಾದರೂ ನಿಲ್ಲಿಸಬಹುದು, ಯಾರೂ ಬೇಸರ ಮಾಡಿಕೊಳ್ಳುವುದಿಲ್ಲ. ಪ್ರಯತ್ನಿಸುತ್ತೀಯಾ?"' },
      { t: 'table', rows: [['Child code · ಮಗುವಿನ ಸಂಕೇತ', 'Agreed? · ಒಪ್ಪಿದೆಯೇ (Yes/No)', 'Researcher initials · ಸಂಶೋಧಕರ ಸಹಿ', 'Date · ದಿನಾಂಕ'], ...Array(8).fill(['', '', '', ''])] },
    ],
  },
  {
    id: 'interview', name: 'Teacher interview guide', kn: 'ಶಿಕ್ಷಕರ ಸಂದರ್ಶನ ಮಾರ್ಗದರ್ಶಿ', desc: 'Semi-structured guide with probes; adapt the questions to your study.',
    blocks: [
      head('Semi-structured Interview Guide: Teachers', 'ಅರೆ-ರಚಿತ ಸಂದರ್ಶನ ಮಾರ್ಗದರ್ಶಿ: ಶಿಕ್ಷಕರು'),
      fields([['Interview code', 'ಸಂದರ್ಶನ ಸಂಕೇತ'], ['School type / block', 'ಶಾಲೆಯ ಪ್ರಕಾರ / ಬ್ಲಾಕ್'], ['Date, start and end time', 'ದಿನಾಂಕ, ಆರಂಭ ಮತ್ತು ಮುಕ್ತಾಯ ಸಮಯ'], ['Consent for recording', 'ಧ್ವನಿಮುದ್ರಣಕ್ಕೆ ಒಪ್ಪಿಗೆ']]),
      { t: 'h1', text: '1. Opening · ಆರಂಭ' },
      { t: 'p', text: 'Tell me about your class this year. · ಈ ವರ್ಷದ ನಿಮ್ಮ ತರಗತಿಯ ಬಗ್ಗೆ ಹೇಳಿ.\nProbe: number of grades taught, languages children speak at home.' },
      { t: 'h1', text: '2. Main questions · ಮುಖ್ಯ ಪ್ರಶ್ನೆಗಳು' },
      { t: 'p', text: '2.1 Describe a recent lesson that went well. What made it work? · ಇತ್ತೀಚೆಗೆ ಚೆನ್ನಾಗಿ ನಡೆದ ಒಂದು ಪಾಠವನ್ನು ವಿವರಿಸಿ. ಅದು ಏಕೆ ಯಶಸ್ವಿಯಾಯಿತು?\nProbe: materials, grouping, language used.' },
      { t: 'p', text: '2.2 Which children find learning hardest? How do you support them? · ಯಾವ ಮಕ್ಕಳಿಗೆ ಕಲಿಕೆ ಹೆಚ್ಚು ಕಷ್ಟ? ಅವರಿಗೆ ನೀವು ಹೇಗೆ ನೆರವಾಗುತ್ತೀರಿ?\nProbe: Sethubandha, LBA results, peer support.' },
      { t: 'p', text: '2.3 How do you use assessment records (LBA, HPC)? · ಮೌಲ್ಯಮಾಪನ ದಾಖಲೆಗಳನ್ನು (LBA, HPC) ಹೇಗೆ ಬಳಸುತ್ತೀರಿ?\nProbe: time taken, what changes after seeing results.' },
      { t: 'p', text: '2.4 What support from the CRP, BRC or DIET would help you most? · ಸಿಆರ್‌ಪಿ, ಬಿಆರ್‌ಸಿ ಅಥವಾ ಡಯಟ್‌ನಿಂದ ಯಾವ ಬೆಂಬಲ ಹೆಚ್ಚು ಉಪಯುಕ್ತ?' },
      { t: 'h1', text: '3. Closing · ಮುಕ್ತಾಯ' },
      { t: 'p', text: 'Is there anything else you would like to tell me? · ಬೇರೆ ಏನಾದರೂ ಹೇಳಲು ಬಯಸುತ್ತೀರಾ?\nThank the teacher; explain how findings will be shared.' },
      { t: 'h2', text: 'Field notes (after the interview) · ಕ್ಷೇತ್ರ ಟಿಪ್ಪಣಿಗಳು' }, { t: 'blank', lines: 6 },
    ],
  },
  {
    id: 'observation', name: 'Classroom observation schedule', kn: 'ತರಗತಿ ವೀಕ್ಷಣಾ ವೇಳಾಪಟ್ಟಿ', desc: '30-second interval grid with category codes and field-note space.',
    blocks: [
      head('Classroom Observation Schedule', 'ತರಗತಿ ವೀಕ್ಷಣಾ ವೇಳಾಪಟ್ಟಿ'),
      fields([['School / block', 'ಶಾಲೆ / ಬ್ಲಾಕ್'], ['Grade and subject', 'ತರಗತಿ ಮತ್ತು ವಿಷಯ'], ['Date and time', 'ದಿನಾಂಕ ಮತ್ತು ಸಮಯ'], ['Observer', 'ವೀಕ್ಷಕರು'], ['Children present (girls / boys)', 'ಹಾಜರಿದ್ದ ಮಕ್ಕಳು (ಬಾಲಕಿಯರು / ಬಾಲಕರು)']]),
      { t: 'p', text: 'Codes · ಸಂಕೇತಗಳು: TT Teacher talk · ಶಿಕ್ಷಕರ ಮಾತು | CT Child talk · ಮಕ್ಕಳ ಮಾತು | GW Group work · ಗುಂಪು ಕೆಲಸ | IW Individual work · ವೈಯಕ್ತಿಕ ಕೆಲಸ | S Silence/transition · ಮೌನ | O Off-task · ಕಾರ್ಯದಿಂದ ಹೊರಗೆ' },
      { t: 'table', widths: [1200, 1300, 1300, 1300, 1300, 2600], rows: [['Minute · ನಿಮಿಷ', '0:00', '0:30', 'Minute', '0:00', '0:30 · Notes'], ...Array.from({ length: 10 }, (_, i) => [String(i + 1), '', '', String(i + 11), '', ''])] },
      { t: 'h2', text: 'Field notes: description only · ಕ್ಷೇತ್ರ ಟಿಪ್ಪಣಿ: ವರ್ಣನೆ ಮಾತ್ರ' }, { t: 'blank', lines: 5 },
      { t: 'h2', text: 'Reflections: interpretation, kept separate · ಚಿಂತನೆ: ವ್ಯಾಖ್ಯಾನ, ಪ್ರತ್ಯೇಕವಾಗಿ' }, { t: 'blank', lines: 4 },
    ],
  },
  {
    id: 'proposal', name: 'Research proposal outline', kn: 'ಸಂಶೋಧನಾ ಪ್ರಸ್ತಾವನೆ ರೂಪರೇಖೆ', desc: 'Fourteen sections with guidance under each heading.',
    blocks: [
      head('Research Proposal (DIET)', 'ಸಂಶೋಧನಾ ಪ್ರಸ್ತಾವನೆ (ಡಯಟ್)'),
      fields([['Title', 'ಶೀರ್ಷಿಕೆ'], ['Principal investigator', 'ಮುಖ್ಯ ಸಂಶೋಧಕರು'], ['Co-investigators', 'ಸಹ ಸಂಶೋಧಕರು'], ['Duration', 'ಅವಧಿ']]),
      ...([
        ['1. Background and need · ಹಿನ್ನೆಲೆ ಮತ್ತು ಅಗತ್ಯ', 'Why this matters in your district; what NAS, SATS, LBA or earlier studies show.'],
        ['2. Review of related literature · ಸಂಬಂಧಿತ ಸಾಹಿತ್ಯ ಅವಲೋಕನ', 'Key studies and the gap this study fills.'],
        ['3. Objectives · ಉದ್ದೇಶಗಳು', '1. To …  2. To …'],
        ['4. Research questions / hypotheses · ಸಂಶೋಧನಾ ಪ್ರಶ್ನೆಗಳು / ಊಹೆಗಳು', ''],
        ['5. Operational definitions · ಕಾರ್ಯಾತ್ಮಕ ವ್ಯಾಖ್ಯಾನಗಳು', 'How each key variable is measured.'],
        ['6. Design and method · ವಿನ್ಯಾಸ ಮತ್ತು ವಿಧಾನ', 'Survey / quasi-experiment / case study / action research / mixed methods.'],
        ['7. Population and sample · ಜನಸಂಖ್ಯೆ ಮತ್ತು ಮಾದರಿ', 'Sampling technique, sample size and justification.'],
        ['8. Tools · ಸಾಧನಗಳು', 'Tests, questionnaires, schedules; reliability, validity and pilot plan.'],
        ['9. Data collection procedure · ದತ್ತಾಂಶ ಸಂಗ್ರಹ ಕ್ರಮ', 'Who collects data, when, and how investigators are trained.'],
        ['10. Data analysis · ದತ್ತಾಂಶ ವಿಶ್ಲೇಷಣೆ', 'Descriptives; t-test / ANOVA / chi-square; thematic analysis.'],
        ['11. Ethical considerations · ನೈತಿಕ ಅಂಶಗಳು', 'Consent, assent, anonymity, data storage, permissions.'],
        ['12. Timeline · ಕಾಲಮಿತಿ', 'Month-wise plan.'],
        ['13. Budget · ಬಜೆಟ್', 'Travel, printing, honorarium for investigators.'],
        ['14. Expected outcomes and use · ನಿರೀಕ್ಷಿತ ಫಲಿತಾಂಶ ಮತ್ತು ಬಳಕೆ', 'Who will use the findings and how.'],
        ['References (APA 7) · ಉಲ್ಲೇಖಗಳು', ''],
      ] as [string, string][]).flatMap(([h, g]): Block[] => [{ t: 'h1', text: h }, ...(g ? [{ t: 'note', text: g } as Block] : []), { t: 'blank', lines: 2 }]),
    ],
  },
  {
    id: 'action', name: 'Action research cycle planner', kn: 'ಕ್ರಿಯಾ ಸಂಶೋಧನಾ ಚಕ್ರ ಯೋಜಕ', desc: 'Plan–act–observe–reflect table for two cycles.',
    blocks: [
      head('Action Research Cycle Planner', 'ಕ್ರಿಯಾ ಸಂಶೋಧನಾ ಚಕ್ರ ಯೋಜಕ'),
      fields([['Teacher / lecturer', 'ಶಿಕ್ಷಕರು / ಉಪನ್ಯಾಸಕರು'], ['Class or batch', 'ತರಗತಿ ಅಥವಾ ತಂಡ'], ['Problem in my practice', 'ನನ್ನ ಅಭ್ಯಾಸದ ಸಮಸ್ಯೆ']]),
      { t: 'table', widths: [1800, 3600, 3600], rows: [['Stage · ಹಂತ', 'Cycle 1 · ಚಕ್ರ 1', 'Cycle 2 · ಚಕ್ರ 2'], ['Plan · ಯೋಜನೆ\n(change to try, duration)', '', ''], ['Act · ಕ್ರಿಯೆ\n(what I did)', '', ''], ['Observe · ವೀಕ್ಷಣೆ\n(evidence collected)', '', ''], ['Reflect · ಚಿಂತನೆ\n(what changed, for whom, why)', '', '']] },
      { t: 'h2', text: 'Evidence log · ಪುರಾವೆ ದಾಖಲೆ' },
      { t: 'table', rows: [['Date · ದಿನಾಂಕ', 'Evidence · ಪುರಾವೆ', 'What it shows · ಏನು ತೋರಿಸುತ್ತದೆ'], ...Array(6).fill(['', '', ''])] },
    ],
  },
  {
    id: 'codebook', name: 'Codebook', kn: 'ಸಂಕೇತ ಪುಸ್ತಕ', desc: 'Variable names, labels, codes and missing-value codes.',
    blocks: [
      head('Codebook', 'ಸಂಕೇತ ಪುಸ್ತಕ'),
      { t: 'table', widths: [1300, 2400, 2700, 1100, 1500], rows: [
        ['Variable · ಚರಾಂಶ', 'Label · ಶೀರ್ಷಿಕೆ', 'Values / codes · ಮೌಲ್ಯಗಳು', 'Missing · ಕಾಣೆ', 'Notes · ಟಿಪ್ಪಣಿ'],
        ['id', 'Study code (not SATS number)', 'C001–C999', '—', ''],
        ['dist', 'District', '1 = … 2 = …', '99', ''],
        ['block', 'Block', '1 = … 2 = …', '99', ''],
        ['medium', 'Medium of instruction', '1 = Kannada 2 = English 3 = Urdu 4 = Other', '9', ''],
        ['grade', 'Grade', '1–10', '99', ''],
        ['sex', 'Sex of child', '1 = Girl 2 = Boy 3 = Other', '9', ''],
        ['rd_pre', 'Reading pre-test (words correct per minute)', '0–150', '999', ''],
        ['rd_post', 'Reading post-test (words correct per minute)', '0–150', '999', ''],
        ...Array(6).fill(['', '', '', '', '']),
      ] },
    ],
  },
  {
    id: 'brief', name: 'Policy brief', kn: 'ನೀತಿ ಸಂಕ್ಷೇಪ', desc: 'Two-page brief for officers: findings and actions.',
    blocks: [
      head('Policy Brief', 'ನೀತಿ ಸಂಕ್ಷೇಪ'),
      fields([['To', 'ಇವರಿಗೆ'], ['From (DIET)', 'ಇವರಿಂದ (ಡಯಟ್)'], ['Date', 'ದಿನಾಂಕ']]),
      { t: 'h1', text: 'The problem · ಸಮಸ್ಯೆ' }, { t: 'note', text: 'Three lines.' }, { t: 'blank', lines: 2 },
      { t: 'h1', text: 'What we studied · ನಾವು ಅಧ್ಯಯನ ಮಾಡಿದ್ದು' }, { t: 'note', text: 'Who, where, how — three lines.' }, { t: 'blank', lines: 2 },
      { t: 'h1', text: 'Key findings · ಮುಖ್ಯ ಫಲಿತಾಂಶಗಳು' }, { t: 'bullet', text: ' ' }, { t: 'bullet', text: ' ' }, { t: 'bullet', text: ' ' },
      { t: 'h1', text: 'Recommended actions · ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು' },
      { t: 'table', rows: [['Action · ಕ್ರಮ', 'Who · ಯಾರು', 'By when · ಯಾವಾಗ', 'Cost · ವೆಚ್ಚ'], ['', '', '', ''], ['', '', '', ''], ['', '', '', '']] },
      { t: 'h1', text: 'Contact · ಸಂಪರ್ಕ' }, { t: 'blank' },
    ],
  },
  {
    id: 'review', name: 'Peer review checklist', kn: 'ಸಹವರ್ತಿ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ', desc: 'Stage-by-stage quality checklist with space for comments.',
    blocks: [
      head('Peer Review Checklist', 'ಸಹವರ್ತಿ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ'),
      fields([['Study title', 'ಅಧ್ಯಯನದ ಶೀರ್ಷಿಕೆ'], ['Reviewer', 'ಪರಿಶೀಲಕರು'], ['Date', 'ದಿನಾಂಕ']]),
      { t: 'table', widths: [5400, 1000, 2600], rows: [
        ['Criterion · ಮಾನದಂಡ', 'Yes / No', 'Comment · ಟಿಪ್ಪಣಿ'],
        ['The problem is specific to a population and place', '', ''],
        ['Questions are answerable with the planned data', '', ''],
        ['A gap in earlier studies is stated', '', ''],
        ['Design matches the questions', '', ''],
        ['Sampling method and size are justified', '', ''],
        ['A comparison group or baseline exists where cause is claimed', '', ''],
        ['Tools were piloted outside the sample', '', ''],
        ['Reliability and validity are reported', '', ''],
        ['Tools are in the participants\' language', '', ''],
        ['Consent and assent are planned; SATS IDs removed', '', ''],
        ['Tests suit the data; effect sizes reported', '', ''],
        ['Non-significant results and limitations are reported', '', ''],
        ['Recommendations follow from the findings', '', ''],
      ] },
      { t: 'h2', text: 'Three strengths · ಮೂರು ಸಾಮರ್ಥ್ಯಗಳು' }, { t: 'blank', lines: 3 },
      { t: 'h2', text: 'Three specific improvements · ಮೂರು ನಿರ್ದಿಷ್ಟ ಸುಧಾರಣೆಗಳು' }, { t: 'blank', lines: 3 },
    ],
  },
];
