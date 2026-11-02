// Course content for the 60-hour Research Methodology Orientation for DIET faculty.
// Every worked example is set in Karnataka's School Education and Literacy Department (DSEL).
// Numbers inside examples are ILLUSTRATIVE teaching data unless a source is named.

export type ToolId =
  | 'rq' | 'ethics' | 'sample' | 'stats' | 'survey' | 'coding' | 'mixed'
  | 'journal' | 'observation' | 'stakeholder' | 'proposal' | 'literature' | 'quality';

export interface Quiz { q: string; options: string[]; answer: number; why: string }
export interface Lesson { title: string; body: string[] }
export interface Example { title: string; text: string[] }
export interface Module {
  id: string; no: number; title: string; titleKn: string; hours: number;
  objectives: string[]; lessons: Lesson[]; karnataka: Example[];
  activity: { title: string; prompt: string; tool?: ToolId };
  tools: ToolId[]; quiz: Quiz[];
}

export const MODULES: Module[] = [
  {
    id: 'm1', no: 1, hours: 5,
    title: 'Foundations of Educational Research',
    titleKn: 'ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆಯ ಅಡಿಪಾಯ',
    objectives: [
      'Explain what makes an inquiry "research" rather than opinion or reporting.',
      'Distinguish basic, applied, evaluation and action research.',
      'Relate research paradigms (positivist, interpretivist, critical, pragmatic) to questions DIETs ask.',
      'Describe the research mandate of DIETs, DSERT and the State research ecosystem.',
    ],
    lessons: [
      { title: 'What is educational research?', body: [
        'Educational research is systematic, transparent inquiry into teaching, learning and the systems around them. It starts with a question, gathers evidence in a planned way, analyses it openly, and reports so that others can check and use the findings.',
        'Three tests help separate research from routine reporting: (1) Is there a clear question? (2) Is the method planned before data are collected? (3) Can another person follow the steps and judge the conclusion?',
      ]},
      { title: 'Types and paradigms', body: [
        'Basic research builds theory (e.g. how children acquire reading in a second script). Applied research solves a known problem (why Grade 6 mathematics scores dip). Evaluation research judges a programme against its goals. Action research is done by practitioners to improve their own practice in cycles.',
        'Paradigms are beliefs about knowledge. Positivist studies measure and test; interpretivist studies seek meanings people give to experience; critical studies examine power and equity; pragmatic studies use whatever method answers the question best. Most DIET studies are pragmatic.',
      ]},
      { title: 'The research cycle', body: [
        'Identify a problem → review literature → frame questions or hypotheses → choose design and sample → build and pilot tools → seek ethical clearance → collect data → analyse → interpret → report and share → use findings.',
        'A study is only as strong as its weakest step. The commonest weakness in district studies is a vague question, which then produces a tool that measures everything and answers nothing.',
      ]},
    ],
    karnataka: [
      { title: 'The research mandate in Karnataka', text: [
        'DSERT is the State academic authority for school education in Karnataka. It sets the research agenda, trains DIET faculty and publishes research compendia. Each DIET is expected to carry out district-level studies that inform teacher education and classroom practice, often with CRPs and BRPs as field partners.',
        'Ask: of the studies your DIET completed in the last three years, how many changed a training module, a district plan or a classroom practice? That is the real test of research use.',
      ]},
      { title: 'Classifying real district questions', text: [
        '"Does Sethubandha (the start-of-year bridge programme) close learning gaps in Grade 4?" — evaluation research.',
        '"How do teachers in Lambani tandas in Vijayapura use the home language during Kannada lessons?" — interpretivist, qualitative.',
        '"Can I raise my D.El.Ed. trainees\' questioning skills through micro-teaching?" — action research by a DIET lecturer.',
      ]},
    ],
    activity: { title: 'Sort the studies', prompt: 'List three studies done at your DIET. For each, note its type (basic / applied / evaluation / action), its paradigm, and one decision it informed (or could have).' },
    tools: ['rq'],
    quiz: [
      { q: 'A DIET studies whether Kalika Chetarike learning-recovery materials met their stated goals. This is best called…', options: ['Basic research', 'Evaluation research', 'Historical research', 'Action research'], answer: 1, why: 'It judges a programme against its own objectives.' },
      { q: 'Which feature most separates research from a monitoring report?', options: ['Use of tables', 'A planned method to answer a stated question', 'Length of the report', 'Signature of an officer'], answer: 1, why: 'Research begins from a question and a method fixed before data collection.' },
      { q: 'A study of the meanings SDMC members give to "a good school" sits mainly in which paradigm?', options: ['Positivist', 'Interpretivist', 'Experimental', 'Econometric'], answer: 1, why: 'It seeks participants\' meanings, not measurement.' },
      { q: 'The pragmatic paradigm means…', options: ['Only surveys are allowed', 'The question decides the method', 'Qualitative data are ignored', 'No theory is needed'], answer: 1, why: 'Pragmatists choose methods for fitness to the question.' },
    ],
  },
  {
    id: 'm2', no: 2, hours: 3,
    title: 'Research Ethics and Integrity',
    titleKn: 'ಸಂಶೋಧನಾ ನೈತಿಕತೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆ',
    objectives: [
      'Apply respect, beneficence and justice to studies with children and teachers.',
      'Obtain informed consent from parents and assent from children.',
      'Protect identity and data, including SATS identifiers.',
      'Recognise plagiarism, fabrication and falsification.',
    ],
    lessons: [
      { title: 'Core principles', body: [
        'Respect for persons: people decide freely whether to take part. Beneficence: maximise benefit, minimise harm. Justice: the burden and benefit of research are shared fairly — the same few "convenient" schools should not be studied every year.',
        'Children cannot consent on their own. Seek written consent from a parent or guardian and simple oral or pictorial assent from the child, in the language the child speaks at home.',
      ]},
      { title: 'Ethics review', body: [
        'An ethics (institutional review) process checks the protocol before fieldwork: purpose, risks, consent forms, data storage and how findings return to the community. A DIET can form a small ethics committee with a senior lecturer, an external academic and a community member.',
        'Permission from the Block Education Officer to enter schools is administrative permission. It does not replace informed consent from participants.',
      ]},
      { title: 'Integrity', body: [
        'Fabrication (inventing data), falsification (altering data) and plagiarism (using others\' words or ideas without credit) are the three serious breaches. Copying a questionnaire from another study is acceptable only with citation and, where required, permission.',
        'Keep raw data, field notes and analysis files so another person can trace any reported figure back to its source.',
      ]},
    ],
    karnataka: [
      { title: 'Using SATS data responsibly', text: [
        'The Student Achievement Tracking System (SATS) holds identifiable records of every child in Karnataka\'s schools. A DIET may use SATS or LBA portal data for research only with departmental permission, and should replace SATS IDs with study codes before analysis. Never publish a child\'s name, SATS number or school with a small enrolment that makes children identifiable.',
      ]},
      { title: 'Case: photographs in a Nali Kali classroom', text: [
        'A researcher photographs children in a Nali Kali (multigrade, activity-based, Classes 1–3) classroom for a report. Parents were not asked. Is this acceptable? No: images identify children. Seek parental consent, avoid faces where possible, and do not post on social media.',
      ]},
    ],
    activity: { title: 'Ethics decision tree', prompt: 'Run your planned study through the ethics decision tree. Record which safeguards you need and draft a two-line consent statement in Kannada for parents.', tool: 'ethics' },
    tools: ['ethics'],
    quiz: [
      { q: 'A BEO has approved school visits. Do you still need parental consent to test children?', options: ['No, BEO approval is enough', 'Yes, consent is separate from administrative permission', 'Only for private schools', 'Only in urban areas'], answer: 1, why: 'Administrative permission does not replace individual consent.' },
      { q: 'Before analysing SATS records you should…', options: ['Publish IDs for transparency', 'Replace SATS IDs with study codes', 'Share the file on WhatsApp for team access', 'Delete all records after one day'], answer: 1, why: 'Pseudonymisation protects children.' },
      { q: 'Changing a few post-test scores so a programme looks effective is…', options: ['Fabrication', 'Falsification', 'Plagiarism', 'Triangulation'], answer: 1, why: 'Altering real data is falsification.' },
      { q: 'Assent means…', options: ['A child\'s own agreement in age-appropriate form', 'A teacher\'s signature', 'Approval of the ethics committee', 'Parental consent'], answer: 0, why: 'Assent is the child\'s agreement alongside parental consent.' },
    ],
  },
  {
    id: 'm3', no: 3, hours: 4,
    title: 'Identifying Research Problems',
    titleKn: 'ಸಂಶೋಧನಾ ಸಮಸ್ಯೆಗಳ ಗುರುತಿಸುವಿಕೆ',
    objectives: [
      'Move from a felt difficulty to a researchable problem.',
      'Use existing evidence (NAS, PARAKH, SATS, LBA, earlier DSERT studies) to justify a problem.',
      'Write focused research questions and testable hypotheses.',
      'Define variables operationally.',
    ],
    lessons: [
      { title: 'From concern to problem', body: [
        'A felt difficulty ("children are weak in English") is not yet a problem. Narrow it: who (Grade 5 children in bilingual KPS sections), what (oral comprehension), where (Kalaburagi district), compared with what (Kannada-medium sections), and why it matters (equity for first-generation learners).',
        'A good problem is significant, researchable with the time and resources you have, ethical, and new enough to add something.',
      ]},
      { title: 'Reviewing literature', body: [
        'Search earlier DSERT and DIET compendia, NCERT studies, Shodhganga theses, ERIC and Google Scholar. Read for what is known, how it was measured, and what is still missing (the gap). Keep a reference list from the first day.',
      ]},
      { title: 'Questions, hypotheses, variables', body: [
        'Research questions are specific and answerable: "What is the difference in oral reading fluency between Grade 3 children in Nali Kali and non-Nali Kali classrooms in Mysuru district?"',
        'A hypothesis predicts an answer that data can contradict: "Children in classrooms with a functioning library corner will read more words correct per minute than those without." Operational definitions say exactly how each variable is measured (e.g. words correct per minute on a graded Kannada passage).',
      ]},
    ],
    karnataka: [
      { title: 'Finding a gap in State evidence', text: [
        'The State\'s research background notes (in this repository) report that foundational literacy and numeracy gains made by Grade 3 tend to fade by Grades 6 and 9, especially in mathematics and science. The same notes record that no completed study yet evaluates the LBA portal. Both are ready-made gaps for DIET research.',
        'Possible question: "Do children who received Sethubandha bridge support in Grade 4 retain their gains at the end of Grade 5?"',
      ]},
      { title: 'Narrowing a broad concern', text: [
        'Broad: "Library use is poor." Focused: "How often do Grade 6–8 children in government higher primary schools of Chikkamagaluru district borrow library books, and what school factors are associated with borrowing?"',
      ]},
    ],
    activity: { title: 'Build your research question', prompt: 'Use the question builder to turn one concern from your district into a focused research question and a hypothesis.', tool: 'rq' },
    tools: ['rq', 'literature'],
    quiz: [
      { q: 'Which is the most researchable question?', options: ['Is education improving in Karnataka?', 'What is the effect of LBA on Grade 7 mathematics scores in two blocks of Raichur district?', 'Why are teachers not motivated?', 'Should English be taught?'], answer: 1, why: 'It names the population, variable, place and comparison.' },
      { q: '"Reading fluency will be higher where library periods are held weekly" is a…', options: ['Research question', 'Hypothesis', 'Objective', 'Limitation'], answer: 1, why: 'It predicts a testable relationship.' },
      { q: 'An operational definition of "reading fluency" would be…', options: ['Love of reading', 'Words correct per minute on a graded passage', 'Teacher\'s impression', 'Number of books in the library'], answer: 1, why: 'It states exactly how the variable is measured.' },
      { q: 'The "gap" in a literature review is…', options: ['Missing pages', 'What is not yet known or not studied in your context', 'Time between surveys', 'Difference between boys and girls'], answer: 1, why: 'The gap justifies the new study.' },
    ],
  },
  {
    id: 'm4', no: 4, hours: 6,
    title: 'Quantitative Research Methods',
    titleKn: 'ಪರಿಮಾಣಾತ್ಮಕ ಸಂಶೋಧನಾ ವಿಧಾನಗಳು',
    objectives: [
      'Choose among survey, correlational, causal-comparative and experimental designs.',
      'Select a sample and calculate its size.',
      'Build reliable and valid tests and questionnaires.',
      'Pick the right statistical test for a question.',
    ],
    lessons: [
      { title: 'Designs', body: [
        'Survey: describes a population (e.g. availability of science labs in high schools). Correlational: examines association (teacher attendance and pupil scores). Causal-comparative: compares existing groups (KPS vs non-KPS schools). Experimental and quasi-experimental: the researcher introduces an intervention and compares with a control or comparison group, ideally with pre- and post-tests.',
        'Correlation is not causation. Schools with libraries may also have better-resourced communities.',
      ]},
      { title: 'Sampling', body: [
        'Probability samples (simple random, stratified, cluster, multistage) allow generalisation. Stratify when sub-groups matter — for example by region (Kalyana Karnataka vs others), medium of instruction, or rural/urban. Cluster sampling (choose clusters, then all or some schools within) suits CRC-based fieldwork.',
        'Sample size depends on the confidence level, the margin of error you can accept, and the variability in the population. Use the sample size calculator.',
      ]},
      { title: 'Tools and analysis', body: [
        'Reliability is consistency (test–retest, Cronbach\'s alpha ≥ 0.70 for most scales). Validity is whether a tool measures what it claims (content validity through expert review; construct validity through pattern of results). Always pilot.',
        'Choosing a test: compare two group means → t-test; same group before and after → paired t-test; three or more groups → ANOVA; two categorical variables → chi-square; relationship between two scores → correlation.',
      ]},
    ],
    karnataka: [
      { title: 'Quasi-experiment: Sethubandha in Yadgir', text: [
        'Illustrative design: 20 government lower primary schools in Yadgir district run the Sethubandha bridge programme with an added daily 20-minute reading period (treatment); 20 matched schools run Sethubandha alone (comparison). Grade 4 children take a Kannada reading test in June and again in September. Analyse gain scores with an independent-samples t-test and report effect size (Cohen\'s d).',
      ]},
      { title: 'Stratified sample of high schools', text: [
        'To survey use of science laboratories across a district with 180 government high schools, stratify by Kannada, English and Urdu medium, then sample randomly within each stratum in proportion to its size.',
      ]},
    ],
    activity: { title: 'Plan a sample and a test', prompt: 'For a district survey of your choice, calculate the sample size, then enter the illustrative pre/post data in the statistics tool and interpret the result in two sentences.', tool: 'sample' },
    tools: ['sample', 'stats', 'survey'],
    quiz: [
      { q: 'You compare SSLC mathematics scores of the same students in a pre-test and post-test. Use…', options: ['Chi-square', 'Paired t-test', 'Independent t-test', 'ANOVA'], answer: 1, why: 'Same students measured twice.' },
      { q: 'Comparing mean scores of Kannada, English and Urdu medium schools needs…', options: ['Paired t-test', 'One-way ANOVA', 'Correlation', 'Content analysis'], answer: 1, why: 'Three independent groups.' },
      { q: 'Cronbach\'s alpha tells you about…', options: ['Validity', 'Internal consistency reliability', 'Sample size', 'Effect size'], answer: 1, why: 'Alpha estimates internal consistency.' },
      { q: 'A strong correlation between library periods and reading scores proves…', options: ['Libraries cause better reading', 'An association that may have other explanations', 'Nothing at all', 'Reading causes libraries'], answer: 1, why: 'Correlation alone does not establish cause.' },
    ],
  },
  {
    id: 'm5', no: 5, hours: 6,
    title: 'Qualitative Research Methods',
    titleKn: 'ಗುಣಾತ್ಮಕ ಸಂಶೋಧನಾ ವಿಧಾನಗಳು',
    objectives: [
      'Choose among case study, ethnography, phenomenology, narrative and grounded theory.',
      'Conduct semi-structured interviews and focus groups.',
      'Code transcripts and develop themes.',
      'Establish trustworthiness.',
    ],
    lessons: [
      { title: 'Approaches', body: [
        'Case study: in-depth study of a bounded case (one KPS campus). Ethnography: extended observation of a culture (life in an ashram school). Phenomenology: shared lived experience (first-year teachers in single-teacher schools). Narrative: life stories (women head teachers). Grounded theory: building a theory from data.',
      ]},
      { title: 'Data collection', body: [
        'Semi-structured interviews use a guide of open questions with probes. Focus groups of 6–8 people suit SDMC members or parents. Observation uses field notes that separate description from interpretation. Record only with consent; transcribe in the original language and translate carefully.',
      ]},
      { title: 'Analysis and trustworthiness', body: [
        'Thematic analysis: familiarise → generate initial codes → search for themes → review → define and name themes → write up with quotations. Trustworthiness rests on credibility (member checks, triangulation), transferability (thick description), dependability (audit trail) and confirmability (reflexive notes).',
      ]},
    ],
    karnataka: [
      { title: 'Case study: a single-teacher school in Uttara Kannada', text: [
        'How does one teacher manage five classes in a hilly-area school? Observe a full week, interview the teacher, SDMC president and three parents, and collect lesson plans. Expect themes such as time-sharing, peer tutoring and use of Nali Kali materials beyond Class 3.',
      ]},
      { title: 'Interviews on bilingual sections', text: [
        'The State\'s notes record that over 60% of tribal students struggled when the medium of instruction differed from their home language. A DIET in Chamarajanagara could interview Soliga parents and teachers about bilingual KPS sections to learn what bridge support children actually need.',
      ]},
    ],
    activity: { title: 'Code an interview excerpt', prompt: 'Read the teacher interview excerpts in the coding tool, assign codes, and group them into two or three themes.', tool: 'coding' },
    tools: ['coding'],
    quiz: [
      { q: 'Studying one KPS campus in depth over a term is a…', options: ['Survey', 'Case study', 'Experiment', 'Meta-analysis'], answer: 1, why: 'A bounded case studied in depth.' },
      { q: 'Member checking means…', options: ['Checking attendance', 'Returning findings to participants to confirm accuracy', 'Counting codes', 'Random sampling'], answer: 1, why: 'Participants confirm interpretations.' },
      { q: 'An ideal focus group size is about…', options: ['2', '6–8', '25', '50'], answer: 1, why: 'Large enough for range, small enough for everyone to speak.' },
      { q: 'An audit trail supports…', options: ['Dependability', 'Statistical power', 'Random selection', 'Generalisation to all States'], answer: 0, why: 'It lets others follow your decisions.' },
    ],
  },
  {
    id: 'm6', no: 6, hours: 4,
    title: 'Mixed Methods Research',
    titleKn: 'ಮಿಶ್ರ ವಿಧಾನ ಸಂಶೋಧನೆ',
    objectives: [
      'Explain convergent, explanatory sequential and exploratory sequential designs.',
      'Plan the point at which quantitative and qualitative strands meet.',
      'Build a joint display that integrates findings.',
    ],
    lessons: [
      { title: 'Three core designs', body: [
        'Convergent: collect both strands at the same time and compare. Explanatory sequential: quantitative first, then qualitative to explain surprising results. Exploratory sequential: qualitative first to build a tool or hypotheses, then quantitative to test them.',
      ]},
      { title: 'Integration', body: [
        'Mixing must happen somewhere — in sampling (choosing interviewees from survey results), in analysis (a joint display table that puts numbers and themes side by side), or in interpretation. Two separate reports stapled together are not mixed methods.',
      ]},
    ],
    karnataka: [
      { title: 'Explanatory sequential: Grade 6 dip', text: [
        'Phase 1: analyse LBA scores for Grades 5 and 6 in a district to find schools where mathematics scores drop sharply. Phase 2: interview teachers and children in four high-drop and four low-drop schools to learn why. Integrate in a joint display: "score pattern | teacher explanation | child explanation".',
      ]},
      { title: 'Exploratory sequential: SDMC engagement scale', text: [
        'Focus groups with SDMC members in Bidar identify what "active participation" means locally; those themes become items in a questionnaire that is then administered to SDMCs across the district.',
      ]},
    ],
    activity: { title: 'Select your design', prompt: 'Answer the design selector questions for your planned study and sketch a joint display with at least three rows.', tool: 'mixed' },
    tools: ['mixed'],
    quiz: [
      { q: 'Interviews are used to explain unexpected survey results. The design is…', options: ['Convergent', 'Explanatory sequential', 'Exploratory sequential', 'Embedded experimental'], answer: 1, why: 'Quantitative first, qualitative explains.' },
      { q: 'A joint display is…', options: ['A poster', 'A table placing quantitative and qualitative findings side by side', 'A bar chart', 'A consent form'], answer: 1, why: 'It shows integration visibly.' },
      { q: 'Building a questionnaire from focus group themes is…', options: ['Exploratory sequential', 'Explanatory sequential', 'Convergent', 'Not mixed methods'], answer: 0, why: 'Qualitative first informs the quantitative tool.' },
      { q: 'Which is NOT genuine mixing?', options: ['Joint display', 'Choosing interviewees from survey results', 'Two unrelated reports in one cover', 'Comparing themes with scores'], answer: 2, why: 'Integration must occur.' },
    ],
  },
  {
    id: 'm7', no: 7, hours: 5,
    title: 'Action Research for Education',
    titleKn: 'ಶಿಕ್ಷಣದಲ್ಲಿ ಕ್ರಿಯಾ ಸಂಶೋಧನೆ',
    objectives: [
      'Run plan–act–observe–reflect cycles on one\'s own practice.',
      'Collect simple, usable evidence in the classroom or training hall.',
      'Mentor teachers and CRPs in action research.',
    ],
    lessons: [
      { title: 'The cycle', body: [
        'Plan: name a specific problem in your practice and a change to try. Act: carry out the change for a fixed period. Observe: collect evidence (work samples, short tests, observation notes, reflections). Reflect: what changed, for whom, and why? Then plan the next cycle.',
        'Action research is small, local and practical. Its findings are for improving your own setting first; generalisation is not its aim.',
      ]},
      { title: 'Evidence that teachers can manage', body: [
        'Use what already exists: notebooks, LBA records, attendance registers. Add one simple tool such as a weekly 5-item quiz or an exit slip. Keep a reflective journal with date, what was done, what happened, and what you think it means.',
      ]},
    ],
    karnataka: [
      { title: 'A D.El.Ed. lecturer\'s cycle', text: [
        'Problem: trainees ask only recall questions during practice teaching. Action: model "why" and "what if" questions and use peer observation with a question-type checklist for four weeks. Evidence: count of higher-order questions per lesson before and after. Reflection: gains were larger for trainees who saw a video of their own lesson — next cycle adds video review.',
      ]},
      { title: 'A teacher in a Kalika Chetarike classroom', text: [
        'A Grade 5 teacher in Koppal notices that children skip the learning-sheet activities in mathematics. She introduces paired work with one stronger and one weaker reader to read the instructions aloud. After three weeks completion rates rise; she records this in her journal and shares it at the cluster meeting.',
      ]},
    ],
    activity: { title: 'Plan your first cycle', prompt: 'Use the action research journal to write a full plan for one cycle and make your first reflective entry.', tool: 'journal' },
    tools: ['journal'],
    quiz: [
      { q: 'The correct order of an action research cycle is…', options: ['Act–plan–reflect–observe', 'Plan–act–observe–reflect', 'Observe–publish–plan–act', 'Reflect–act–plan–publish'], answer: 1, why: 'Plan, act, observe, reflect, then repeat.' },
      { q: 'The main aim of action research is…', options: ['Generalising to all schools', 'Improving one\'s own practice', 'Testing theories in labs', 'Ranking schools'], answer: 1, why: 'It is practitioner inquiry for improvement.' },
      { q: 'Which is a suitable low-burden evidence source for a teacher?', options: ['A national survey', 'Exit slips', 'MRI scans', 'Census data'], answer: 1, why: 'Simple, quick, and close to practice.' },
      { q: 'After reflection, the researcher should…', options: ['Stop', 'Plan the next cycle', 'Delete data', 'Change the topic'], answer: 1, why: 'Action research is cyclical.' },
    ],
  },
  {
    id: 'm8', no: 8, hours: 4,
    title: 'Classroom Research',
    titleKn: 'ತರಗತಿ ಸಂಶೋಧನೆ',
    objectives: [
      'Use structured and unstructured classroom observation.',
      'Analyse children\'s work and assessment data.',
      'Study multigrade and monograde classrooms fairly.',
    ],
    lessons: [
      { title: 'Observation', body: [
        'Structured observation uses a schedule with defined categories (e.g. teacher talk, child talk, group work, silence) recorded at fixed intervals. Unstructured observation uses running notes. Observer presence changes behaviour; visit more than once so the class gets used to you.',
      ]},
      { title: 'Children\'s work and assessment data', body: [
        'Notebooks, worksheets, drawings and portfolios show how children think. Formative records such as LBA and the Holistic Progress Card (HPC) give longitudinal data. Look for error patterns, not just scores.',
      ]},
    ],
    karnataka: [
      { title: 'Observing a Nali Kali classroom', text: [
        'In Nali Kali, children work in groups by milestone using learning cards and track their progress on a ladder. An observation schedule can record every 5 minutes: which groups are teacher-supported, partly supported or self-learning, and what each child is doing. This shows whether self-learning groups are truly engaged.',
      ]},
      { title: 'Error analysis in Grade 7 fractions', text: [
        'A DIET lecturer and four teachers in Hassan collect 120 fraction worksheets. Coding the errors shows that most children add numerators and denominators separately (1/2 + 1/3 = 2/5). The finding feeds a CRC workshop on area models.',
      ]},
    ],
    activity: { title: 'Run a timed observation', prompt: 'Use the observation tool during a 20-minute lesson (real or video) and summarise the pattern of classroom talk.', tool: 'observation' },
    tools: ['observation'],
    quiz: [
      { q: 'Recording a category every 30 seconds is…', options: ['Interval-based structured observation', 'Narrative interview', 'Document analysis', 'Survey'], answer: 0, why: 'Fixed-interval category coding.' },
      { q: 'Why visit a classroom several times before recording?', options: ['To reduce observer effect', 'To increase sample size', 'For payment', 'It is not needed'], answer: 0, why: 'The class adapts to the observer.' },
      { q: 'Analysing notebook errors is useful because…', options: ['It shows thinking patterns', 'It replaces teaching', 'It ranks teachers', 'It is quicker than tests'], answer: 0, why: 'Errors reveal misconceptions.' },
      { q: 'In a Nali Kali class a researcher should observe…', options: ['Only the teacher', 'All groups, including self-learning groups', 'Only the brightest child', 'Only the blackboard'], answer: 1, why: 'Multigrade dynamics involve every group.' },
    ],
  },
  {
    id: 'm9', no: 9, hours: 3,
    title: 'Community-Based Research',
    titleKn: 'ಸಮುದಾಯ ಆಧಾರಿತ ಸಂಶೋಧನೆ',
    objectives: [
      'Map stakeholders and their interests.',
      'Engage communities as partners, not only respondents.',
      'Handle ethics in community settings.',
    ],
    lessons: [
      { title: 'Principles', body: [
        'Community-based participatory research treats community members as co-researchers: they help decide questions, collect data and interpret findings. It builds trust and makes findings more likely to be used.',
      ]},
      { title: 'Engagement and ethics', body: [
        'Meet in familiar spaces at times that suit farm and work schedules. Use the local language. Be clear about what the study can and cannot offer. Share results back at a Gram Sabha or SDMC meeting.',
      ]},
    ],
    karnataka: [
      { title: 'SDMCs as research partners', text: [
        'School Development and Monitoring Committees (SDMCs) bring parents and local leaders into school governance. A DIET in Tumakuru can work with SDMC members to study why girls\' attendance drops in Grade 8, with SDMC members conducting door-to-door conversations using a short guide.',
      ]},
      { title: 'Out-of-school children', text: [
        'In a migrant-labour taluk of Kalaburagi, mapping families who leave for seasonal work helps plan Chinnara Angala bridge courses and seasonal hostels. Partners: anganwadi workers, gram panchayat, SDMCs and CRPs.',
      ]},
    ],
    activity: { title: 'Map your stakeholders', prompt: 'Use the stakeholder map to list everyone affected by your planned study and decide how each will be involved.', tool: 'stakeholder' },
    tools: ['stakeholder'],
    quiz: [
      { q: 'In participatory research, community members are…', options: ['Only respondents', 'Co-researchers', 'Excluded from analysis', 'Paid enumerators only'], answer: 1, why: 'They share in decisions.' },
      { q: 'A good place to return findings in a village is…', options: ['A journal only', 'An SDMC or Gram Sabha meeting', 'A private email', 'Nowhere'], answer: 1, why: 'Findings should return to the community.' },
      { q: 'Which is a stakeholder in a study on girls\' attendance?', options: ['Parents', 'SDMC', 'Anganwadi worker', 'All of these'], answer: 3, why: 'All have interests and influence.' },
      { q: 'Scheduling meetings during harvest is…', options: ['Respectful', 'Likely to exclude farming families', 'Required', 'Irrelevant'], answer: 1, why: 'Timing affects who can take part.' },
    ],
  },
  {
    id: 'm10', no: 10, hours: 8,
    title: 'Data Collection and Analysis',
    titleKn: 'ದತ್ತಾಂಶ ಸಂಗ್ರಹ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ',
    objectives: [
      'Design forms that reduce error.',
      'Train field investigators and monitor quality.',
      'Clean, code and manage data.',
      'Run descriptive and inferential analyses and interpret them.',
    ],
    lessons: [
      { title: 'Planning fieldwork', body: [
        'Pilot every tool in 2–3 schools not in the sample. Write an investigator manual. Train CRPs or student-teachers who will collect data, including mock interviews. Plan visits so that schools are not visited on exam days or festival days.',
      ]},
      { title: 'Data management', body: [
        'Create a codebook: variable name, label, values, missing-data codes. Enter data twice or check 10% of forms. Store files with dated versions, keep a master copy read-only, and back up.',
      ]},
      { title: 'Analysis and interpretation', body: [
        'Start with descriptives: n, mean, median, SD, frequencies. Then test hypotheses. Report the test, statistic, degrees of freedom, p-value and effect size: "t(38) = 2.41, p = .021, d = 0.76". Statistical significance is not the same as practical importance.',
        'For qualitative data, use the coding and thematic steps from Module 5. Spreadsheet software such as LibreOffice Calc is enough for most DIET studies; JASP and R are free for more advanced work.',
      ]},
    ],
    karnataka: [
      { title: 'Worked example: chi-square on library borrowing', text: [
        'Illustrative data from 200 Grade 7 children in Mandya district: of 100 girls, 62 borrowed a library book in the past month; of 100 boys, 45 did. Is borrowing associated with gender? Enter the 2×2 table (62, 38 / 45, 55) in the chi-square tool. The result (χ² ≈ 5.8, p ≈ .016) suggests an association; follow up with interviews to understand why.',
      ]},
      { title: 'Worked example: ANOVA across mediums', text: [
        'Illustrative LBA mathematics scores (out of 20) from three schools each of Kannada, English and Urdu medium. Run one-way ANOVA; if significant, examine which pairs differ and look for explanations beyond medium (teacher vacancies, enrolment size).',
      ]},
    ],
    activity: { title: 'Analyse the worked data', prompt: 'Run the chi-square example and one ANOVA in the statistics tool. Write a results paragraph in APA style.', tool: 'stats' },
    tools: ['stats', 'survey', 'coding'],
    quiz: [
      { q: 'A codebook records…', options: ['Passwords', 'Variable names, labels and value codes', 'Teacher salaries', 'Only missing data'], answer: 1, why: 'It documents how data are coded.' },
      { q: 'p = .03 means…', options: ['The effect is large', 'If there were no real effect, a result this extreme would occur about 3% of the time', 'The hypothesis is 97% true', 'The data are wrong'], answer: 1, why: 'p is about data under the null hypothesis.' },
      { q: 'Effect size is reported because…', options: ['It shows practical size of a difference', 'Journals need numbers', 'It replaces the mean', 'It is the p-value'], answer: 0, why: 'Significance ≠ importance.' },
      { q: 'Tools should be piloted in…', options: ['Sample schools', 'Schools similar to but outside the sample', 'The DIET office', 'No schools'], answer: 1, why: 'Avoid contaminating the sample.' },
    ],
  },
  {
    id: 'm11', no: 11, hours: 6,
    title: 'Research Communication',
    titleKn: 'ಸಂಶೋಧನಾ ಸಂವಹನ',
    objectives: [
      'Write a research report with a standard structure.',
      'Cite sources in APA style.',
      'Present findings to teachers, officers and communities.',
      'Prepare a policy brief and a poster.',
    ],
    lessons: [
      { title: 'Report structure', body: [
        'Title, abstract (150–250 words), introduction and problem, review of literature, objectives and questions, method (design, sample, tools, procedure, ethics), results, discussion, recommendations, limitations, references, appendices (tools, consent forms).',
      ]},
      { title: 'Writing for different readers', body: [
        'Officers need a two-page policy brief: the problem, three key findings, three actions, and cost or feasibility. Teachers need practical classroom implications. Communities need a short talk in Kannada with pictures. Academics need the full report or a journal article.',
      ]},
      { title: 'Citing and publishing', body: [
        'Use APA 7th edition: Author, A. A. (Year). Title. Publisher. Check journals against the UGC-CARE list and avoid predatory journals that charge fees without real peer review. Share at DSERT research conferences and district review meetings.',
      ]},
    ],
    karnataka: [
      { title: 'From report to decision', text: [
        'A DIET study finds that only a minority of high schools use their science laboratory weekly (illustrative). A good policy brief to the Deputy Director (Administration) and the DIET Principal would recommend: a weekly lab period in the timetable, a short CRC training on low-cost experiments, and a follow-up check in the next academic year.',
      ]},
    ],
    activity: { title: 'Draft your proposal', prompt: 'Use the proposal builder to draft a complete research proposal. Export it and share it with your facilitator.', tool: 'proposal' },
    tools: ['proposal', 'literature'],
    quiz: [
      { q: 'A policy brief for officers should be…', options: ['100 pages', 'About two pages with clear actions', 'Only tables', 'In academic jargon'], answer: 1, why: 'Busy decision-makers need brevity and action.' },
      { q: 'Where should the ethics procedure be described?', options: ['Abstract only', 'Method section', 'References', 'Not at all'], answer: 1, why: 'Ethics is part of method.' },
      { q: 'Predatory journals are those that…', options: ['Publish quickly after real peer review', 'Charge fees without genuine peer review', 'Are in Kannada', 'Are on UGC-CARE'], answer: 1, why: 'They lack genuine review.' },
      { q: 'APA reference order is…', options: ['Title, Year, Author', 'Author, Year, Title, Source', 'Year, Publisher, Author', 'Any order'], answer: 1, why: 'Author–date system.' },
    ],
  },
  {
    id: 'm12', no: 12, hours: 6,
    title: 'Quality Assurance in Research',
    titleKn: 'ಸಂಶೋಧನೆಯಲ್ಲಿ ಗುಣಮಟ್ಟ ಭರವಸೆ',
    objectives: [
      'Review a study against quality criteria at each stage.',
      'Conduct and receive constructive peer review.',
      'Identify common threats to validity in district studies.',
    ],
    lessons: [
      { title: 'Quality across the cycle', body: [
        'Question: clear, focused, justified. Design: matches the question. Sample: adequate and well described. Tools: piloted, reliable, valid. Analysis: appropriate tests, effect sizes, honest reporting of non-significant results. Conclusions: follow from evidence; limitations stated.',
      ]},
      { title: 'Threats to validity', body: [
        'Selection bias (only "good" schools chosen), history (another programme started at the same time), maturation (children grow anyway), testing effects (same test twice), attrition (children absent at post-test), and Hawthorne effect (people change because they are watched).',
      ]},
      { title: 'Peer review', body: [
        'Review the work, not the person. Start with strengths, then the most important problems, then minor points. Suggest specific improvements. Every DIET study can be reviewed by one internal and one external colleague before submission.',
      ]},
    ],
    karnataka: [
      { title: 'Review practice: a weak design', text: [
        'Proposal: "Effect of Kalika Chetarike on learning" using only post-test scores from 5 schools chosen by the BEO. Problems: no baseline, no comparison, selection bias. Improvement: use the Sethubandha baseline as pre-test, add matched comparison schools, select schools randomly within blocks.',
      ]},
      { title: 'A shared State agenda', text: [
        'The State\'s research notes suggest a yearly State research agenda with a few statewide questions — for example, whether FLN gains last beyond Grade 3 — so that districts can pool samples using common tools. Quality improves when DIETs share designs and tools rather than each starting alone.',
      ]},
    ],
    activity: { title: 'Peer-review a proposal', prompt: 'Apply the quality checklist to your own proposal and to a colleague\'s. Record three strengths and three specific improvements.', tool: 'quality' },
    tools: ['quality'],
    quiz: [
      { q: 'Schools chosen by an officer because they "perform well" introduce…', options: ['Maturation', 'Selection bias', 'Reliability', 'Triangulation'], answer: 1, why: 'Non-random choice biases results.' },
      { q: 'Children improving simply because they grew older over the year is…', options: ['Maturation', 'History', 'Attrition', 'Instrumentation'], answer: 0, why: 'Natural development over time.' },
      { q: 'A good peer review begins with…', options: ['Personal criticism', 'Strengths of the work', 'Rejection', 'Spelling errors only'], answer: 1, why: 'Constructive review acknowledges strengths first.' },
      { q: 'Reporting non-significant results is…', options: ['Dishonest', 'Part of honest research', 'Forbidden', 'Unnecessary'], answer: 1, why: 'Hiding them biases the evidence base.' },
    ],
  },
];

export const TOTAL_HOURS = MODULES.reduce((s, m) => s + m.hours, 0);

export const PRE_ASSESSMENT: Quiz[] = [
  { q: 'A hypothesis is…', options: ['A summary of findings', 'A testable prediction', 'A list of references', 'A sampling method'], answer: 1, why: 'It predicts a relationship that data can test.' },
  { q: 'Which design best tests whether a new reading programme causes improvement?', options: ['Single survey', 'Quasi-experiment with comparison group and pre-test', 'One interview', 'Document review'], answer: 1, why: 'A comparison group and baseline help rule out other explanations.' },
  { q: 'Triangulation means…', options: ['Using three schools', 'Checking findings with different data sources or methods', 'A geometry test', 'Three researchers signing'], answer: 1, why: 'Multiple sources strengthen credibility.' },
  { q: 'Which statistic describes spread?', options: ['Mean', 'Standard deviation', 'Mode', 'Median'], answer: 1, why: 'SD measures dispersion.' },
  { q: 'Informed consent requires…', options: ['Only the head teacher\'s signature', 'Participants understanding the study and agreeing freely', 'Payment', 'BEO approval only'], answer: 1, why: 'Understanding and voluntary agreement.' },
];
