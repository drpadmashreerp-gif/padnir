// Analyte catalogue: canonical keys, aliases, canonical units, unit conversions,
// default adult reference ranges, code-enforced critical limits and
// physiological plausibility bounds (values outside these are almost always
// OCR / transcription errors and must be verified, not interpreted).
//
// Critical limits are typical adult laboratory "panic values". Every lab sets
// its own; review these with your clinical lead before deployment.

export const ANALYTES = {
  hemoglobin: {
    label: "Haemoglobin", unit: "g/dL", group: "hematology",
    aliases: ["hemoglobin", "haemoglobin", "hb", "hgb"],
    convert: { "g/l": (v) => v / 10, "mmol/l": (v) => v * 1.611 },
    ref: [12.0, 17.5], critical: { low: 7.0, high: 20.0 }, plausible: [1, 30],
  },
  hematocrit: {
    label: "Haematocrit (PCV)", unit: "%", group: "hematology",
    aliases: ["hematocrit", "haematocrit", "hct", "pcv", "packed cell volume"],
    convert: { "l/l": (v) => v * 100 },
    ref: [36, 52], critical: { low: 20, high: 60 }, plausible: [5, 80],
  },
  rbc: {
    label: "RBC count", unit: "x10^6/uL", group: "hematology",
    aliases: ["rbc", "rbc count", "red blood cells", "total rbc count", "erythrocytes"],
    convert: { "x10^12/l": (v) => v },
    ref: [4.0, 5.9], plausible: [0.5, 10],
  },
  mcv: {
    label: "MCV", unit: "fL", group: "hematology",
    aliases: ["mcv", "mean corpuscular volume"],
    ref: [80, 100], plausible: [40, 150],
  },
  wbc: {
    label: "WBC count", unit: "x10^3/uL", group: "hematology",
    aliases: ["wbc", "wbc count", "tlc", "total leucocyte count", "total leukocyte count", "white blood cells", "leukocytes"],
    convert: { "/ul": (v) => v / 1000, "/cumm": (v) => v / 1000, "cells/cumm": (v) => v / 1000, "x10^9/l": (v) => v },
    ref: [4.0, 11.0], critical: { low: 2.0, high: 30.0 }, plausible: [0.1, 500],
  },
  anc: {
    label: "Absolute neutrophil count", unit: "x10^3/uL", group: "hematology",
    aliases: ["anc", "absolute neutrophil count", "neutrophils absolute"],
    convert: { "/ul": (v) => v / 1000, "/cumm": (v) => v / 1000, "x10^9/l": (v) => v },
    ref: [1.5, 8.0], critical: { low: 0.5 }, plausible: [0, 200],
  },
  platelets: {
    label: "Platelet count", unit: "x10^3/uL", group: "hematology",
    aliases: ["platelets", "platelet count", "plt", "thrombocytes"],
    convert: {
      "/ul": (v) => v / 1000, "/cumm": (v) => v / 1000, "cells/cumm": (v) => v / 1000,
      "lakh/cumm": (v) => v * 100, "lakhs/cumm": (v) => v * 100, "x10^9/l": (v) => v,
    },
    ref: [150, 450], critical: { low: 20, high: 1000 }, plausible: [1, 3000],
  },
  inr: {
    label: "INR", unit: "", group: "hematology",
    aliases: ["inr", "pt inr", "international normalized ratio"],
    ref: [0.8, 1.2], critical: { high: 5.0 }, plausible: [0.5, 20],
  },
  sodium: {
    label: "Sodium", unit: "mmol/L", group: "renal",
    aliases: ["sodium", "na", "na+", "serum sodium"],
    convert: { "meq/l": (v) => v },
    ref: [135, 145], critical: { low: 120, high: 160 }, plausible: [90, 200],
  },
  potassium: {
    label: "Potassium", unit: "mmol/L", group: "renal",
    aliases: ["potassium", "k", "k+", "serum potassium"],
    convert: { "meq/l": (v) => v },
    ref: [3.5, 5.1], critical: { low: 2.8, high: 6.2 }, plausible: [1, 12],
  },
  chloride: {
    label: "Chloride", unit: "mmol/L", group: "renal",
    aliases: ["chloride", "cl", "cl-"],
    convert: { "meq/l": (v) => v },
    ref: [98, 107], critical: { low: 80, high: 120 }, plausible: [60, 150],
  },
  bicarbonate: {
    label: "Bicarbonate", unit: "mmol/L", group: "renal",
    aliases: ["bicarbonate", "hco3", "total co2", "co2"],
    convert: { "meq/l": (v) => v },
    ref: [22, 29], critical: { low: 10, high: 40 }, plausible: [2, 60],
  },
  urea: {
    label: "Blood urea", unit: "mg/dL", group: "renal",
    aliases: ["urea", "blood urea", "serum urea"],
    convert: { "mmol/l": (v) => v * 6.006 },
    ref: [15, 45], plausible: [1, 600],
  },
  bun: {
    label: "BUN", unit: "mg/dL", group: "renal",
    aliases: ["bun", "blood urea nitrogen", "urea nitrogen"],
    convert: { "mmol/l": (v) => v * 2.801 },
    ref: [7, 20], critical: { high: 100 }, plausible: [1, 300],
  },
  creatinine: {
    label: "Creatinine", unit: "mg/dL", group: "renal",
    aliases: ["creatinine", "serum creatinine", "creat", "s. creatinine"],
    convert: { "umol/l": (v) => v / 88.4, "µmol/l": (v) => v / 88.4 },
    ref: [0.6, 1.3], critical: { high: 7.0 }, plausible: [0.1, 30],
  },
  egfr: {
    label: "eGFR", unit: "mL/min/1.73m2", group: "renal",
    aliases: ["egfr", "estimated gfr", "gfr"],
    ref: [90, null], critical: { low: 15 }, plausible: [1, 200],
  },
  uric_acid: {
    label: "Uric acid", unit: "mg/dL", group: "renal",
    aliases: ["uric acid", "serum uric acid", "urate"],
    convert: { "umol/l": (v) => v / 59.48, "µmol/l": (v) => v / 59.48 },
    ref: [3.5, 7.2], plausible: [0.5, 25],
  },
  calcium: {
    label: "Calcium", unit: "mg/dL", group: "metabolic",
    aliases: ["calcium", "ca", "serum calcium", "total calcium"],
    convert: { "mmol/l": (v) => v * 4.008 },
    ref: [8.6, 10.3], critical: { low: 6.5, high: 13.0 }, plausible: [2, 20],
  },
  magnesium: {
    label: "Magnesium", unit: "mg/dL", group: "metabolic",
    aliases: ["magnesium", "mg", "serum magnesium"],
    convert: { "mmol/l": (v) => v * 2.431 },
    ref: [1.7, 2.2], critical: { low: 1.0, high: 4.7 }, plausible: [0.2, 10],
  },
  phosphorus: {
    label: "Phosphorus", unit: "mg/dL", group: "metabolic",
    aliases: ["phosphorus", "phosphate", "inorganic phosphorus"],
    convert: { "mmol/l": (v) => v * 3.097 },
    ref: [2.5, 4.5], critical: { low: 1.0 }, plausible: [0.2, 20],
  },
  glucose: {
    label: "Glucose", unit: "mg/dL", group: "metabolic",
    aliases: ["glucose", "blood glucose", "fasting blood sugar", "fbs", "fasting glucose", "random blood sugar", "rbs", "plasma glucose", "blood sugar"],
    convert: { "mmol/l": (v) => v * 18.016 },
    ref: [70, 99], critical: { low: 40, high: 450 }, plausible: [5, 2000],
  },
  hba1c: {
    label: "HbA1c", unit: "%", group: "metabolic",
    aliases: ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin", "a1c"],
    convert: { "mmol/mol": (v) => v / 10.929 + 2.15 },
    ref: [4.0, 5.6], plausible: [3, 20],
  },
  tsh: {
    label: "TSH", unit: "mIU/L", group: "metabolic",
    aliases: ["tsh", "thyroid stimulating hormone"],
    convert: { "uiu/ml": (v) => v, "µiu/ml": (v) => v, "miu/ml": (v) => v * 1000 },
    ref: [0.4, 4.0], plausible: [0.001, 500],
  },
  vitamin_d: {
    label: "Vitamin D (25-OH)", unit: "ng/mL", group: "metabolic",
    aliases: ["vitamin d", "25-oh vitamin d", "25 hydroxy vitamin d", "vit d"],
    convert: { "nmol/l": (v) => v / 2.496 },
    ref: [30, 100], plausible: [1, 300],
  },
  vitamin_b12: {
    label: "Vitamin B12", unit: "pg/mL", group: "metabolic",
    aliases: ["vitamin b12", "b12", "cobalamin", "vit b12"],
    convert: { "pmol/l": (v) => v * 1.355 },
    ref: [200, 900], plausible: [20, 5000],
  },
  ferritin: {
    label: "Ferritin", unit: "ng/mL", group: "hematology",
    aliases: ["ferritin", "serum ferritin"],
    convert: { "ug/l": (v) => v, "µg/l": (v) => v },
    ref: [20, 300], plausible: [1, 50000],
  },
  bilirubin_total: {
    label: "Bilirubin (total)", unit: "mg/dL", group: "hepatic",
    aliases: ["total bilirubin", "bilirubin total", "bilirubin", "t. bilirubin", "tbil"],
    convert: { "umol/l": (v) => v / 17.1, "µmol/l": (v) => v / 17.1 },
    ref: [0.2, 1.2], critical: { high: 15.0 }, plausible: [0.05, 60],
  },
  alt: {
    label: "ALT (SGPT)", unit: "U/L", group: "hepatic",
    aliases: ["alt", "sgpt", "alanine aminotransferase", "alt (sgpt)"],
    ref: [7, 56], critical: { high: 1000 }, plausible: [1, 20000],
  },
  ast: {
    label: "AST (SGOT)", unit: "U/L", group: "hepatic",
    aliases: ["ast", "sgot", "aspartate aminotransferase", "ast (sgot)"],
    ref: [10, 40], critical: { high: 1000 }, plausible: [1, 20000],
  },
  alp: {
    label: "Alkaline phosphatase", unit: "U/L", group: "hepatic",
    aliases: ["alp", "alkaline phosphatase"],
    ref: [44, 147], plausible: [5, 5000],
  },
  albumin: {
    label: "Albumin", unit: "g/dL", group: "hepatic",
    aliases: ["albumin", "serum albumin"],
    convert: { "g/l": (v) => v / 10 },
    ref: [3.5, 5.0], plausible: [0.5, 7],
  },
  cholesterol_total: {
    label: "Total cholesterol", unit: "mg/dL", group: "cardio",
    aliases: ["total cholesterol", "cholesterol", "cholesterol total", "serum cholesterol"],
    convert: { "mmol/l": (v) => v * 38.67 },
    ref: [null, 200], plausible: [30, 1000],
  },
  ldl: {
    label: "LDL cholesterol", unit: "mg/dL", group: "cardio",
    aliases: ["ldl", "ldl cholesterol", "ldl-c", "ldl cholesterol direct"],
    convert: { "mmol/l": (v) => v * 38.67 },
    ref: [null, 100], plausible: [5, 800],
  },
  hdl: {
    label: "HDL cholesterol", unit: "mg/dL", group: "cardio",
    aliases: ["hdl", "hdl cholesterol", "hdl-c"],
    convert: { "mmol/l": (v) => v * 38.67 },
    ref: [40, null], plausible: [5, 200],
  },
  triglycerides: {
    label: "Triglycerides", unit: "mg/dL", group: "cardio",
    aliases: ["triglycerides", "tg", "triglyceride"],
    convert: { "mmol/l": (v) => v * 88.57 },
    ref: [null, 150], critical: { high: 1000 }, plausible: [10, 10000],
  },
  crp: {
    label: "CRP", unit: "mg/L", group: "inflammation",
    aliases: ["crp", "c-reactive protein", "hs-crp", "hscrp", "c reactive protein"],
    convert: { "mg/dl": (v) => v * 10 },
    ref: [null, 5], plausible: [0, 1000],
  },
  esr: {
    label: "ESR", unit: "mm/hr", group: "inflammation",
    aliases: ["esr", "erythrocyte sedimentation rate"],
    ref: [0, 20], plausible: [0, 200],
  },
  lactate: {
    label: "Lactate", unit: "mmol/L", group: "inflammation",
    aliases: ["lactate", "lactic acid"],
    convert: { "mg/dl": (v) => v / 9.008 },
    ref: [0.5, 2.0], critical: { high: 4.0 }, plausible: [0.1, 30],
  },
};

const ALIAS_INDEX = new Map();
for (const [key, def] of Object.entries(ANALYTES)) {
  ALIAS_INDEX.set(key, key);
  for (const a of def.aliases) ALIAS_INDEX.set(normaliseLabel(a), key);
}

function normaliseLabel(s) {
  return String(s).toLowerCase().replace(/[,:*]/g, " ").replace(/\s+/g, " ").trim();
}

export function normaliseUnit(u) {
  return String(u || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/μ|µ/g, "u")
    .replace(/×|\*/g, "x")
    .replace(/10\^?3\/(ul|mm3|cumm)/, "10^3/ul")
    .replace(/10\^?6\/(ul|mm3|cumm)/, "10^6/ul")
    .replace(/10\^?9\/l/, "10^9/l")
    .replace(/10\^?12\/l/, "10^12/l")
    .replace(/\/mm3$/, "/cumm")
    .replace(/^cells\/ul$/, "/ul");
}

/** Map a free-text test name to a canonical analyte key, or null. */
export function resolveAnalyte(name) {
  const n = normaliseLabel(name);
  if (ALIAS_INDEX.has(n)) return ALIAS_INDEX.get(n);
  // Strip parenthetical qualifiers and method notes, e.g. "Glucose (Fasting) - Hexokinase".
  const stripped = n.replace(/\(.*?\)/g, " ").split(/ - | by /)[0].replace(/\s+/g, " ").trim();
  if (ALIAS_INDEX.has(stripped)) return ALIAS_INDEX.get(stripped);
  return null;
}

/** Convert a value to the analyte's canonical unit. Returns null if the unit is unknown. */
export function toCanonical(key, value, unit) {
  const def = ANALYTES[key];
  const u = normaliseUnit(unit);
  const canon = normaliseUnit(def.unit);
  if (!u || u === canon) return value;
  if (canon === "x10^3/ul" && (u === "10^3/ul" || u === "k/ul" || u === "thou/ul")) return value;
  if (canon === "x10^6/ul" && (u === "10^6/ul" || u === "mill/ul" || u === "m/ul")) return value;
  if (canon === "mmol/l" && u === "meq/l") return value;
  const fn = def.convert?.[u] ?? def.convert?.["x" + u] ?? def.convert?.[u.replace(/^x/, "")];
  return fn ? fn(value) : null;
}
