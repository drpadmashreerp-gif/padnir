// Part II — Advanced Research Methods: Analytics, Innovation and AI (20 hours, five chapters).
// Structured around five themes: proposal and AI assistance; measurement and data preparation;
// EFA and CFA; structural equation modelling; academic writing, publication and AI-enabled research.
// Datasets and numbers in examples are ILLUSTRATIVE unless a source is named.
import type { Module } from './modules';

export const ADVANCED: Module[] = [
  {
    id: 'm13', no: 13, hours: 4, part: 2,
    title: 'Research Design, Proposal Development and AI Assistance',
    titleKn: 'ಸಂಶೋಧನಾ ವಿನ್ಯಾಸ, ಪ್ರಸ್ತಾವನೆ ರಚನೆ ಮತ್ತು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯ ನೆರವು',
    objectives: [
      'Identify and state a research gap precisely.',
      'Align problem, questions, objectives, hypotheses, design and analysis in one matrix.',
      'Structure a fundable, reviewable research proposal with a conceptual framework.',
      'Use AI tools to assist proposal development while protecting integrity and data.',
    ],
    lessons: [
      { title: 'From research gap to research questions', body: [
        'A gap is what the existing evidence does not yet tell us. Six common kinds: an evidence gap (findings disagree), a knowledge gap (the topic is unstudied), a practical gap (what works in practice is not documented), a methodological gap (earlier studies used weak designs or tools), a population gap (the topic is unstudied for a group or place), and a theoretical gap (no framework explains the pattern).',
        'Write the gap in one sentence: "Although [what is known], [what is not known] for [population, place], because [reason earlier studies fall short]." Test the question with FINER: Feasible, Interesting, Novel, Ethical, Relevant.',
        'Alignment is the backbone of a strong proposal. Each research question needs a matching objective, a hypothesis where relevant, a named data source or tool, and an analysis. If a question has no analysis, or an analysis answers no question, the proposal is misaligned.',
      ]},
      { title: 'Choosing a design and structuring the proposal', body: [
        'Choose the design from the question, not from habit: describe → survey; relate → correlational or SEM; compare existing groups → causal-comparative; test an intervention → experimental or quasi-experimental; understand meanings → qualitative; explain numbers → explanatory sequential mixed methods.',
        'A conceptual framework is a diagram of the constructs and the relationships the study will test, each arrow backed by theory or earlier evidence. It becomes the measurement model (constructs and items) and the structural model (paths) in Chapters 15 and 16.',
        'Reviewers most often reject proposals for a vague problem, an unjustified sample size, tools with no evidence of reliability or validity, analysis that does not match the questions, missing ethics, and an unrealistic timeline.',
      ]},
      { title: 'AI-assisted proposal development', body: [
        'AI tools can help at several stages: literature discovery (Semantic Scholar, Elicit, Consensus, Research Rabbit, Connected Papers), reference management (Zotero), brainstorming research questions, outlining a review, improving clarity of language, and explaining statistical procedures or code.',
        'AI tools can also invent references, misquote findings and state errors with confidence. Every citation an AI suggests must be opened and checked at the source. Never paste identifiable data — SATS records, names, phone numbers, unpublished interview transcripts — into a public AI tool.',
        'Integrity rules: an AI tool cannot be an author, because it cannot take responsibility for the work (COPE position statement, 2023). Disclose the tool, version and purpose in the methods or acknowledgements, as most journals now require. The researcher remains responsible for every sentence and number.',
      ]},
    ],
    karnataka: [
      { title: 'An alignment matrix for a Sethubandha study', text: [
        'Gap: "Although Sethubandha is run at the start of every year, no district study has followed whether Grade 4 gains last until the end of Grade 5 in Kalyana Karnataka." RQ1: What is the change in Kannada reading scores from June (Grade 4) to March (Grade 5)? → Objective: to estimate retention of gains → H1: scores at the end of Grade 5 remain above the June baseline → Data: LBA reading scores and a graded reading test → Analysis: paired t-test and effect size.',
        'RQ2: Which school factors are associated with retention? → Data: head-teacher survey on library periods, teacher vacancies and attendance → Analysis: multiple regression (or SEM in Chapter 16).',
      ]},
      { title: 'Using an AI assistant safely for a review outline', text: [
        'A DIET lecturer asks an AI assistant: "Suggest an outline for a literature review on multigrade teaching in Indian government primary schools, with headings and the kinds of studies to look for. Do not invent citations." She then searches Shodhganga, ERIC and the DSERT compendia herself for each heading, keeps only studies she has opened, and records in her methods note which tool she used and for what.',
      ]},
    ],
    activity: { title: 'Build your alignment matrix', prompt: 'Use the alignment matrix to link each research question to an objective, hypothesis, data source and analysis. Then use the AI prompt planner to draft one safe prompt for your literature search and write your AI-use disclosure statement.', tool: 'align' },
    tools: ['align', 'aiprompt', 'proposal'],
    quiz: [
      { q: '"Earlier studies of LBA used only post-tests without a baseline." This is mainly a…', options: ['Population gap', 'Methodological gap', 'Theoretical gap', 'Practical gap'], answer: 1, why: 'The weakness lies in how earlier studies were designed.' },
      { q: 'An AI assistant gives you five references. What must you do?', options: ['Cite them as given', 'Open and verify each one at the source before citing', 'List the AI as co-author', 'Cite only the first one'], answer: 1, why: 'AI tools can fabricate or misreport references.' },
      { q: 'Which may be pasted into a public AI tool?', options: ['A spreadsheet of SATS numbers and marks', 'Unpublished interview transcripts with names', 'Your own draft paragraph with no personal data', 'Parents\' phone numbers'], answer: 2, why: 'Identifiable or confidential data must never be shared.' },
      { q: 'In an alignment matrix, an analysis that answers no research question shows…', options: ['Thoroughness', 'Misalignment to be removed or justified', 'Strong design', 'Mixed methods'], answer: 1, why: 'Every analysis should answer a stated question.' },
    ],
  },
  {
    id: 'm14', no: 14, hours: 4, part: 2,
    title: 'Measurement, Scales and Data Preparation',
    titleKn: 'ಮಾಪನ, ಮಾಪಕಗಳು ಮತ್ತು ದತ್ತಾಂಶ ಸಿದ್ಧತೆ',
    objectives: [
      'Distinguish levels of measurement and reflective from formative constructs.',
      'Develop and translate a Likert scale using sound psychometric steps.',
      'Choose the right statistical technique for a question and data type.',
      'Screen, clean and prepare data in R or Python.',
    ],
    lessons: [
      { title: 'Constructs, scales and instrument development', body: [
        'Levels of measurement decide which statistics are allowed: nominal (medium of instruction), ordinal (ranks, single Likert items), interval (summed scale scores, treated as interval in practice) and ratio (words correct per minute, attendance days).',
        'A construct is an unobserved quality such as "research self-efficacy". Reflective constructs cause their items, so items should correlate highly and are interchangeable (most attitude scales). Formative constructs are formed by their indicators, like a school facilities index built from library, laboratory and toilets; their indicators need not correlate.',
        'Scale development steps: define the construct and its dimensions → write an item pool (3–4 times the final number) → expert review for content validity (item-level CVI ≥ .78) → cognitive interviews with a few teachers → pilot (n ≥ 100) → item analysis (corrected item–total r ≥ .30) → factor analysis (Chapter 15). Write short, single-idea items; avoid double-barrelled and leading items; add a few reverse-worded items and recode them before analysis.',
        'For Kannada versions use forward translation by two translators, reconciliation, back-translation by an independent translator, and review by a committee; then pilot both language versions.',
      ]},
      { title: 'Choosing the statistical technique', body: [
        'Decide from four questions: What is the aim (compare, relate, predict, explore structure, confirm structure, test a model)? What level is the outcome? How many groups, and are they independent or paired? Are parametric assumptions reasonable?',
        'Common pairs (parametric → non-parametric): independent t-test → Mann–Whitney U; paired t-test → Wilcoxon signed-rank; one-way ANOVA → Kruskal–Wallis; Pearson r → Spearman ρ. For prediction use multiple regression (logistic regression for a yes/no outcome). For the structure of a scale use EFA, then CFA; for relationships among constructs use SEM.',
      ]},
      { title: 'Data screening, cleaning and preparation', body: [
        'Screen in this order: (1) out-of-range values and entry errors; (2) missing data — describe the amount and pattern; under 5% scattered missingness is usually harmless, otherwise use multiple imputation or full-information maximum likelihood rather than deleting cases; (3) careless responding such as straight-lining (the same answer to every item); (4) outliers — univariate |z| > 3.29, multivariate by Mahalanobis distance (p < .001); (5) normality — skewness within ±2 and excess kurtosis within ±7 is usually acceptable for SEM with maximum likelihood; (6) multicollinearity — VIF below 5.',
        'With a single self-report questionnaire, check common method bias: if one unrotated factor explains more than 50% of the variance (Harman\'s single-factor test), interpret relationships with caution. Better still, design it out: separate sections, assure anonymity, mix item order.',
        'Keep a cleaning log: what was changed, why, and how many cases were affected. Never overwrite the raw file; save a cleaned copy with a new name.',
      ], code: [
        { label: 'Screening in R', lang: 'R', src: `library(psych)
d <- read.csv("trse.csv")
d[d < 1 | d > 5] <- NA                      # out-of-range values become missing
colMeans(is.na(d)) * 100                    # % missing per item
d$sd_row <- apply(d[, 1:12], 1, sd, na.rm = TRUE)
d <- subset(d, sd_row > 0)                  # drop straight-liners
describe(d[, 1:12])                         # mean, sd, skew, kurtosis
z <- scale(d[, 1:12]); which(abs(z) > 3.29, arr.ind = TRUE)
md <- mahalanobis(na.omit(d[, 1:12]), colMeans(na.omit(d[, 1:12])), cov(na.omit(d[, 1:12])))
which(md > qchisq(.999, df = 12))           # multivariate outliers
alpha(d[, c("PF1","PF2","PF3","PF4")])      # Cronbach's alpha` },
        { label: 'Screening in Python', lang: 'Python', src: `import pandas as pd, numpy as np
from scipy import stats
d = pd.read_csv("trse.csv")
items = d.columns[:12]
d[items] = d[items].where(d[items].between(1, 5))   # out-of-range -> NaN
print(d[items].isna().mean() * 100)                  # % missing per item
d = d[d[items].std(axis=1) > 0]                       # drop straight-liners
print(d[items].agg(["mean", "std", "skew", "kurt"]).T)
z = np.abs(stats.zscore(d[items], nan_policy="omit"))
print((z > 3.29).sum())                               # univariate outliers per item` },
      ]},
    ],
    karnataka: [
      { title: 'A bilingual research self-efficacy scale for DIET faculty', text: [
        'A DSERT working group drafts 36 items on three dimensions — problem framing, data analysis and research communication — for DIET lecturers and CRPs. Six experts rate relevance; items with I-CVI below .78 are dropped. The remaining 18 items are translated into Kannada and back-translated; a cognitive interview reveals that "hypothesis" needs the Kannada term ಊಹೆ with the English word in brackets. After piloting with 120 lecturers, 12 items are kept for factor analysis.',
      ]},
      { title: 'Cleaning an SDMC survey', text: [
        'In an illustrative survey of 400 SDMC members in Bidar district, 6% of answers to an income question are missing, while other items have under 2% missing. The researcher reports the pattern, keeps all cases, and uses multiple imputation rather than deleting 24 respondents — most of whom were women members, whose views would otherwise be under-represented.',
      ]},
    ],
    activity: { title: 'Screen a dataset and choose a technique', prompt: 'Load the sample data in the screening tool. Identify the missing values, out-of-range entry, straight-liners and outliers, and note what you would do with each. Then use the technique chooser for your own research question.', tool: 'screen' },
    tools: ['screen', 'chooser', 'survey', 'stats'],
    quiz: [
      { q: 'A school facilities index built from library, laboratory and toilets is best treated as…', options: ['A reflective construct', 'A formative construct', 'A nominal variable', 'An outlier'], answer: 1, why: 'The indicators form the index; they need not correlate.' },
      { q: 'The non-parametric alternative to a paired t-test is…', options: ['Mann–Whitney U', 'Wilcoxon signed-rank', 'Kruskal–Wallis', 'Chi-square'], answer: 1, why: 'Wilcoxon signed-rank compares paired observations.' },
      { q: 'A respondent answers "5" to all 40 items. This is…', options: ['Excellent data', 'Possible straight-lining (careless responding)', 'A formative indicator', 'A missing value'], answer: 1, why: 'Identical answers throughout suggest careless responding.' },
      { q: 'Back-translation is used to…', options: ['Increase sample size', 'Check that a translated instrument keeps the original meaning', 'Remove outliers', 'Test hypotheses'], answer: 1, why: 'An independent translator reverses the translation to reveal drift in meaning.' },
    ],
  },
  {
    id: 'm15', no: 15, hours: 4, part: 2,
    title: 'Construct Exploration and Validation: EFA and CFA',
    titleKn: 'ರಚನೆಗಳ ಅನ್ವೇಷಣೆ ಮತ್ತು ದೃಢೀಕರಣ: EFA ಮತ್ತು CFA',
    objectives: [
      'Check whether data are suitable for factor analysis (KMO, Bartlett).',
      'Run and interpret an exploratory factor analysis in SPSS, R or Python.',
      'Specify and assess a measurement model with confirmatory factor analysis in AMOS or lavaan.',
      'Establish reliability, convergent validity and discriminant validity.',
    ],
    lessons: [
      { title: 'Exploratory factor analysis (EFA)', body: [
        'EFA asks: how many underlying factors explain the correlations among items, and which items belong to which factor? Use it when a scale is new or used in a new population.',
        'Suitability: at least 5–10 respondents per item and preferably 200 or more; KMO ≥ .60 (≥ .80 is good) and each item\'s KMO ≥ .50; Bartlett\'s test of sphericity significant (p < .05).',
        'Extraction: principal axis factoring or maximum likelihood estimate common factors; principal components analysis summarises total variance and is not strictly factor analysis. How many factors: eigenvalues > 1 (Kaiser), the elbow of the scree plot, and — most reliable — parallel analysis; the solution must also make theoretical sense.',
        'Rotation: varimax (orthogonal) when factors are expected to be unrelated; promax or oblimin (oblique) when they are expected to correlate, which is usual in education. Keep items with loadings ≥ .50 on their own factor and cross-loadings below .30 (or at least .20 lower); communalities ideally ≥ .40. Remove weak items one at a time and re-run.',
        'SPSS: Analyze → Dimension Reduction → Factor → Descriptives: KMO and Bartlett\'s test; Extraction: Principal axis factoring, Scree plot; Rotation: Promax (or Varimax); Options: Sorted by size, suppress small coefficients below .30.',
      ], code: [
        { label: 'EFA in R (psych)', lang: 'R', src: `library(psych)
items <- d[, 1:12]
KMO(items); cortest.bartlett(cor(items), n = nrow(items))
fa.parallel(items, fa = "fa")                 # how many factors?
efa <- fa(items, nfactors = 3, fm = "pa", rotate = "promax")
print(efa$loadings, cutoff = .30, sort = TRUE)` },
        { label: 'EFA in Python (factor_analyzer)', lang: 'Python', src: `from factor_analyzer import FactorAnalyzer, calculate_kmo, calculate_bartlett_sphericity
items = d.iloc[:, :12].dropna()
print(calculate_kmo(items)[1], calculate_bartlett_sphericity(items))
fa = FactorAnalyzer(n_factors=3, method="principal", rotation="promax")
fa.fit(items)
print(pd.DataFrame(fa.loadings_, index=items.columns).round(2))` },
      ]},
      { title: 'Confirmatory factor analysis (CFA)', body: [
        'CFA tests a measurement model specified in advance: which items load on which factor, with no cross-loadings. Use a different sample from the EFA (split the data randomly, or collect a second sample).',
        'In AMOS: draw each latent factor as an ellipse, its items as rectangles, add an error term to every item, fix the first loading of each factor to 1 (or the factor variance to 1), connect factors with two-headed arrows (covariances), choose Maximum likelihood, and tick Standardized estimates and Modification indices in Analysis Properties. Report model fit (Chapter 16) before interpreting loadings.',
        'Assessment: standardised loadings ≥ .70 are ideal (≥ .50 acceptable if reliability holds); composite reliability (CR) ≥ .70; average variance extracted (AVE) ≥ .50 for convergent validity. Discriminant validity: the square root of each factor\'s AVE should exceed its correlations with other factors (Fornell & Larcker, 1981), and the heterotrait–monotrait ratio (HTMT) should be below .85 (or .90 for similar concepts; Henseler et al., 2015).',
      ], code: [
        { label: 'CFA in R (lavaan)', lang: 'R', src: `library(lavaan); library(semTools)
model <- '
  ProblemFraming =~ PF1 + PF2 + PF3 + PF4
  DataAnalysis   =~ DA1 + DA2 + DA3 + DA4
  Communication  =~ RC1 + RC2 + RC3 + RC4
'
fit <- cfa(model, data = d, estimator = "MLR")
summary(fit, fit.measures = TRUE, standardized = TRUE)
reliability(fit)          # composite reliability (omega) and AVE
htmt(model, data = d)     # discriminant validity` },
        { label: 'CFA in Python (semopy)', lang: 'Python', src: `import semopy
desc = """
ProblemFraming =~ PF1 + PF2 + PF3 + PF4
DataAnalysis   =~ DA1 + DA2 + DA3 + DA4
Communication  =~ RC1 + RC2 + RC3 + RC4
"""
m = semopy.Model(desc); m.fit(d)
print(m.inspect(std_est=True))
print(semopy.calc_stats(m).T)   # chi2, CFI, TLI, RMSEA` },
      ]},
      { title: 'Reliability and validity: putting it together', body: [
        'Report Cronbach\'s alpha and composite reliability for each factor, loadings with their significance, CR and AVE in one table, and a Fornell–Larcker or HTMT table for discriminant validity.',
        'If AVE is below .50 but CR is above .60, convergent validity can still be considered adequate (Fornell & Larcker, 1981) — state this explicitly. Never delete items only to improve fit without considering what the item measures; content validity matters as much as numbers.',
      ]},
    ],
    karnataka: [
      { title: 'EFA of the research self-efficacy scale', text: [
        'Illustrative results from 220 DIET lecturers and CRPs on the 12-item scale: KMO = .85, Bartlett\'s χ²(66) = 1121, p < .001. Three factors have eigenvalues above 1 (4.47, 1.99, 1.72) and together account for about 68% of the total variance (initial eigenvalues; about 58% after principal axis extraction). After rotation, the four problem-framing, four data-analysis and four communication items each load on their own factor. Run this yourself in the EFA tool.',
      ]},
      { title: 'CFA on a second sample', text: [
        'A second, independent sample of 240 teachers from Kalaburagi and Raichur is used for CFA. Illustrative standardised loadings range from .68 to .86. CR is above .80 and AVE above .55 for all three factors, and each √AVE exceeds the correlations between factors, supporting discriminant validity. The scale can now be used in the SEM in Chapter 16.',
      ]},
    ],
    activity: { title: 'Run an EFA and assess the measurement model', prompt: 'Run the EFA tool on the sample data with three factors. Name each factor and decide whether any item should be dropped. Then enter loadings and factor correlations in the CFA calculator and judge reliability and validity.', tool: 'efa' },
    tools: ['efa', 'cfa', 'screen'],
    quiz: [
      { q: 'KMO = .52 for your data means…', options: ['Excellent suitability', 'Barely suitable; consider more data or removing weak items', 'The model fits', 'Reliability is high'], answer: 1, why: 'Values below .60 indicate poor sampling adequacy.' },
      { q: 'When factors are expected to correlate, use…', options: ['Varimax', 'An oblique rotation such as promax or oblimin', 'No rotation', 'Bartlett\'s test'], answer: 1, why: 'Oblique rotations allow factors to correlate.' },
      { q: 'AVE = .58 and CR = .84 indicate…', options: ['Poor reliability', 'Adequate convergent validity and reliability', 'Discriminant validity failure', 'Overfitting'], answer: 1, why: 'AVE ≥ .50 and CR ≥ .70 are the usual thresholds.' },
      { q: 'Why run CFA on a different sample from the EFA?', options: ['To save time', 'To confirm the structure rather than re-describe the same data', 'Because AMOS needs it', 'To increase alpha'], answer: 1, why: 'Using the same data capitalises on chance.' },
    ],
  },
  {
    id: 'm16', no: 16, hours: 4, part: 2,
    title: 'Structural Equation Modelling (SEM)',
    titleKn: 'ರಚನಾತ್ಮಕ ಸಮೀಕರಣ ಮಾದರೀಕರಣ (SEM)',
    objectives: [
      'Explain latent and observed variables, measurement and structural models.',
      'Draw and estimate a structural path model in AMOS or lavaan.',
      'Assess model fit and validate the model responsibly.',
      'Test mediation, moderation and group differences (multi-group SEM).',
    ],
    lessons: [
      { title: 'Understanding SEM and building path models', body: [
        'SEM tests a network of relationships among constructs while accounting for measurement error. It combines a measurement model (CFA: constructs and their items) and a structural model (paths between constructs). Exogenous constructs have no arrows pointing to them; endogenous constructs are predicted by others.',
        'Use the two-step approach (Anderson & Gerbing, 1988): first establish a good measurement model (Chapter 15), then add the structural paths. Every path needs a theoretical reason. Sample size: 200 or more is a common minimum, more for complex models; aim for at least 10 cases per estimated parameter where possible.',
        'Covariance-based SEM (AMOS, lavaan) tests theory and gives fit indices. Partial least squares SEM (for example SmartPLS) suits prediction, small samples and formative constructs, but does not test overall model fit in the same way. Choose by aim, not by convenience.',
        'In AMOS: start from the validated CFA diagram, replace covariances between constructs with single-headed arrows where the theory predicts an effect, add a residual (disturbance) to every endogenous construct, and estimate with maximum likelihood. Report standardised path coefficients (β), their significance, and R² for each endogenous construct.',
      ], code: [
        { label: 'Structural model in R (lavaan)', lang: 'R', src: `model <- '
  # measurement model
  Support     =~ S1 + S2 + S3
  Efficacy    =~ PF1 + PF2 + DA1 + DA2
  Engagement  =~ E1 + E2 + E3
  # structural model
  Efficacy   ~ a * Support
  Engagement ~ b * Efficacy + c * Support
  indirect := a * b
  total    := c + a * b
'
fit <- sem(model, data = d, estimator = "ML", se = "bootstrap", bootstrap = 5000)
summary(fit, fit.measures = TRUE, standardized = TRUE, rsquare = TRUE)
parameterEstimates(fit, boot.ci.type = "perc", standardized = TRUE)` },
      ]},
      { title: 'Model fit, assessment and validation', body: [
        'Report several fit indices together: χ² with df and p (sensitive to large samples, so not used alone), χ²/df (≤ 3 good), CFI and TLI (≥ .95 good, ≥ .90 acceptable), RMSEA with its 90% confidence interval (≤ .06 good, ≤ .08 acceptable) and SRMR (≤ .08). These are guidelines (Hu & Bentler, 1999), not laws.',
        'Modification indices suggest changes that would improve fit. Accept only changes with a clear theoretical reason (for example, correlated errors between two items with near-identical wording), make them one at a time, and report every change. A model modified to fit one sample must be cross-validated on another.',
        'Validate by comparing the model with plausible alternatives (for example, with and without a direct path), checking that estimates are sensible (no negative error variances, standardised values within ±1), and testing on a hold-out sample.',
      ]},
      { title: 'Advanced applications', body: [
        'Mediation: an indirect effect (a × b) shows that X affects Y through M. Test it with bootstrapped confidence intervals (5,000 resamples); if the 95% interval excludes zero, the indirect effect is significant. Report the direct, indirect and total effects. In AMOS: Analysis Properties → Bootstrap → Perform bootstrap (5000), Bias-corrected confidence intervals; request Indirect, direct and total effects.',
        'Moderation: the effect of X on Y depends on W. With observed variables, add an X × W interaction (mean-centred); with latent variables use latent interaction methods or multi-group analysis.',
        'Multi-group SEM: compare groups such as Kalyana Karnataka and other districts, or men and women teachers. First test measurement invariance in steps — configural (same structure), metric (equal loadings), scalar (equal intercepts) — accepting each step if CFI drops by no more than .01. Only then compare paths or means across groups.',
        'Higher-order models represent a general factor above first-order factors (for example, overall research self-efficacy above its three dimensions).',
      ]},
    ],
    karnataka: [
      { title: 'Does DIET support build research engagement?', text: [
        'Illustrative model with 260 teachers: DIET support (mentoring, workshops, feedback) → research self-efficacy → research engagement (action research projects, presentations at cluster meetings). Fit: χ²(87) = 141.6, χ²/df = 1.63, CFI = .97, TLI = .96, RMSEA = .049, SRMR = .046. Support → self-efficacy β = .48; self-efficacy → engagement β = .44; the direct path from support to engagement is small (β = .12). The bootstrapped indirect effect is significant, suggesting that DIET support works mainly by building teachers\' confidence.',
      ]},
      { title: 'Comparing regions with multi-group SEM', text: [
        'The same model is tested separately for Kalyana Karnataka districts and other districts. Configural and metric invariance hold (ΔCFI < .01), so the paths can be compared. If the support → self-efficacy path is stronger in Kalyana Karnataka, the DIET can argue for prioritising mentoring there.',
      ]},
    ],
    activity: { title: 'Assess fit and test mediation', prompt: 'Enter the fit indices from the worked example (or your own output) in the fit checker and copy the generated sentence. Then run the mediation tool on the sample data and report the indirect effect with its confidence interval.', tool: 'fit' },
    tools: ['fit', 'mediation', 'cfa'],
    quiz: [
      { q: 'In the two-step approach you first…', options: ['Add all structural paths', 'Validate the measurement model', 'Run multi-group analysis', 'Delete items with low loadings'], answer: 1, why: 'A sound measurement model comes before structural paths.' },
      { q: 'CFI = .96, RMSEA = .05, SRMR = .04 indicate…', options: ['Poor fit', 'Good fit', 'Overfitting only', 'Nothing without χ²'], answer: 1, why: 'All three meet commonly used good-fit guidelines.' },
      { q: 'A mediation effect is supported when…', options: ['The direct path is zero', 'The bootstrapped 95% CI of a × b excludes zero', 'R² is above .50', 'χ² is non-significant'], answer: 1, why: 'The indirect effect is tested with bootstrapped intervals.' },
      { q: 'Before comparing paths across two groups you must establish…', options: ['Equal sample sizes', 'Measurement invariance (at least metric)', 'Identical means', 'A higher-order factor'], answer: 1, why: 'Constructs must be measured the same way in both groups.' },
    ],
  },
  {
    id: 'm17', no: 17, hours: 4, part: 2,
    title: 'Academic Writing, Publication and AI-Enabled Research',
    titleKn: 'ಶೈಕ್ಷಣಿಕ ಬರವಣಿಗೆ, ಪ್ರಕಟಣೆ ಮತ್ತು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ ಸಂಶೋಧನೆ',
    objectives: [
      'Report EFA, CFA and SEM results to journal standard.',
      'Choose a suitable journal, respond to reviewers and avoid predatory outlets.',
      'Use generative and agentic AI tools responsibly across the research process.',
      'Recognise opportunities and risks of big data and interdisciplinary research in education.',
    ],
    lessons: [
      { title: 'From findings to a publishable manuscript', body: [
        'Most empirical articles follow IMRaD: Introduction (problem, gap, aim), Method (participants, instruments, procedure, ethics, analysis), Results, and Discussion (meaning, comparison with earlier studies, implications, limitations, future research). Write the methods so another researcher could repeat the study.',
        'What to report for multivariate analysis: software and version; estimator; how missing data were handled; KMO, Bartlett, extraction, rotation and loadings for EFA; a CFA table with loadings, CR, AVE and discriminant validity; fit indices with RMSEA confidence interval; standardised path coefficients with standard errors, p-values and confidence intervals; R²; and indirect effects with bootstrapped intervals. A clear path diagram with standardised estimates helps readers.',
        'In the discussion, interpret effect sizes in practical terms ("a one standard deviation increase in DIET support is associated with…"), separate association from causation in cross-sectional data, and link recommendations to specific findings.',
      ]},
      { title: 'Publishing: choosing journals and working with reviewers', body: [
        'Choose a journal by fit of scope, audience, indexing (Scopus, Web of Science, UGC-CARE list), review time and cost. Read recent issues and author guidelines. Check for cloned or predatory journals: verify the journal\'s website from the indexing database itself, be wary of guaranteed acceptance or very fast review, and do not pay fees before a genuine peer review.',
        'Write a short cover letter stating the contribution and why it suits the journal. Treat reviewer comments as free expert advice: reply point by point in a table, say what you changed and where, and explain politely when you disagree with evidence.',
        'Strengthen visibility and integrity with an ORCID iD, sharing data and code where ethics allow, preprints where the journal permits, and open-access options such as institutional repositories.',
      ]},
      { title: 'AI-enabled research: from generative to agentic AI', body: [
        'Generative AI (chat assistants such as ChatGPT, Claude or Gemini) can draft text, summarise papers you supply, suggest code for R or Python, explain statistical output, and support first-pass coding of qualitative data. Agentic AI goes further: agents plan multi-step tasks, search sources, run code and revise their own work, with the researcher supervising.',
        'Opportunities: faster literature mapping, reproducible analysis scripts, translation support for bilingual instruments, accessibility. Risks: fabricated facts and citations, hidden bias, loss of the researcher\'s own judgement, privacy breaches, and over-reliance on outputs nobody has checked. Agents that act on their own need clear limits, logs and human approval of every important step.',
        'A responsible-use routine: decide what the tool may and may not do; never upload personal data; verify every fact, citation and number at the source; keep prompts and outputs as part of the audit trail; disclose use in the paper; and keep the interpretation and conclusions your own.',
        'Big data and interdisciplinary research: large administrative datasets (UDISE+, SATS aggregates, assessment portals, learning-app logs) allow population-level analysis and learning analytics, but need permission, de-identification and care under India\'s Digital Personal Data Protection Act, 2023. Many education questions — nutrition and learning, migration and dropout, technology and equity — are best studied with colleagues from public health, economics, data science and sociology.',
      ]},
    ],
    karnataka: [
      { title: 'A results paragraph for the self-efficacy CFA', text: [
        '"A three-factor CFA (maximum likelihood, AMOS; N = 240) showed good fit, χ²(51) = 85.2, p = .002, CFI = .97, TLI = .96, RMSEA = .053 [90% CI .031, .073], SRMR = .045. All standardised loadings were significant (.68–.86). Composite reliability ranged from .82 to .88 and AVE from .55 to .64; the square root of each AVE exceeded the inter-factor correlations (.41–.58), supporting discriminant validity." (Illustrative values.)',
      ]},
      { title: 'Big data with care: SATS aggregates', text: [
        'A DIET wants to study whether attendance patterns predict Grade 7 LBA scores across 1,200 schools. It requests school-level aggregates rather than child-level records, works on a departmental computer, documents its code, and uses an AI assistant only to help write and debug the analysis script on dummy data — never on the real file. The policy brief reports patterns by block, not by individual school, to avoid naming small schools.',
      ]},
    ],
    activity: { title: 'Write it up and plan responsible AI use', prompt: 'Using your fit checker or CFA calculator output, write a results paragraph in APA style. Then complete the responsible AI checklist in the AI prompt planner and download your AI-use disclosure statement for your next paper.', tool: 'aiprompt' },
    tools: ['aiprompt', 'fit', 'literature', 'proposal'],
    quiz: [
      { q: 'Which belongs in the Method section of a SEM paper?', options: ['Only the hypotheses', 'Estimator, software, missing-data handling and fit criteria', 'Implications for policy', 'The cover letter'], answer: 1, why: 'Method reports how the analysis was done so others can repeat it.' },
      { q: 'A journal promises acceptance within 72 hours for a fee. You should…', options: ['Submit quickly', 'Treat it as a likely predatory journal and verify it through indexing databases', 'Pay first and ask later', 'Cite it in your review'], answer: 1, why: 'Guaranteed fast acceptance is a common sign of predatory practice.' },
      { q: 'What distinguishes agentic AI from a basic chat assistant?', options: ['It cannot use tools', 'It plans and carries out multi-step tasks such as searching and running code', 'It never makes errors', 'It can be listed as an author'], answer: 1, why: 'Agents act over several steps, so they need limits and human oversight.' },
      { q: 'Under responsible AI use, the researcher should…', options: ['Upload SATS data for faster analysis', 'Verify every AI-supplied fact and disclose AI use', 'Let the AI write the conclusions', 'Hide AI use'], answer: 1, why: 'Verification and disclosure protect integrity.' },
    ],
  },
];
