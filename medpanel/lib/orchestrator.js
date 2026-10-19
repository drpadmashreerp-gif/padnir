// Upload -> extract -> code rules -> parallel specialists -> Chief Physician -> code post-check.
import { readFileSync } from "node:fs";
import { callJSON, cachedSystem, MODEL } from "./claude.js";
import { extractText } from "./ocr.js";
import { extractWithClaude, parseLabText } from "./extract.js";
import { redactText } from "./redact.js";
import { evaluatePanel, enforceCriticals } from "./rules.js";

const SYSTEM_PROMPT = readFileSync(new URL("../prompts/medpanel-system.md", import.meta.url), "utf8");

export const SPECIALISTS = [
  { id: "hematology", title: "Haematologist", groups: ["hematology"], focus: "blood counts, anaemia patterns, iron status, white cells, platelets, coagulation" },
  { id: "renal", title: "Nephrologist", groups: ["renal"], focus: "kidney function, electrolytes, acid-base, hydration" },
  { id: "hepatic", title: "Hepatologist", groups: ["hepatic"], focus: "liver enzymes, bilirubin, synthetic function" },
  { id: "metabolic", title: "Endocrinologist", groups: ["metabolic"], focus: "glucose control, thyroid, bone minerals, vitamins" },
  { id: "cardio", title: "Cardiologist", groups: ["cardio"], focus: "lipids and cardiovascular risk" },
  { id: "internal", title: "Internal Medicine", groups: ["inflammation", "other"], focus: "inflammation, infection markers, and any results not covered by other specialists" },
];

const SIGNIFICANCE = ["routine", "follow_up", "prompt_attention"];
const strArr = { type: "array", items: { type: "string" } };

const SPECIALIST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "findings", "patterns", "follow_up_tests", "questions_for_doctor"],
  properties: {
    summary: { type: "string" },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["analyte", "interpretation", "significance"],
        properties: {
          analyte: { type: "string" },
          interpretation: { type: "string" },
          significance: { type: "string", enum: SIGNIFICANCE },
        },
      },
    },
    patterns: strArr,
    follow_up_tests: strArr,
    questions_for_doctor: strArr,
  },
};

const CHIEF_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "urgency", "overall_summary", "critical_alerts", "key_issues", "reassuring_findings", "next_steps", "questions_for_doctor", "limitations"],
  properties: {
    headline: { type: "string" },
    urgency: { type: "string", enum: ["routine", "soon", "urgent"] },
    overall_summary: { type: "string" },
    critical_alerts: strArr,
    key_issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "explanation", "priority", "specialists"],
        properties: {
          title: { type: "string" },
          explanation: { type: "string" },
          priority: { type: "string", enum: SIGNIFICANCE },
          specialists: strArr,
        },
      },
    },
    reassuring_findings: strArr,
    next_steps: strArr,
    questions_for_doctor: strArr,
    limitations: strArr,
  },
};

const panelPayload = (panel, patient, extra = {}) =>
  JSON.stringify({ patient, critical_alerts: panel.criticals, implausible: panel.implausible, ...extra }, null, 1);

const slim = (a) => ({
  test: a.label, value: a.value_text, unit: a.unit, ref_low: a.ref_low, ref_high: a.ref_high, flag: a.flag, note: a.reason || undefined,
});

async function runSpecialist(spec, panel, patient) {
  const own = panel.analytes.filter((a) => spec.groups.includes(a.group));
  if (!own.length) return { id: spec.id, title: spec.title, skipped: true };
  const role =
    `You are the ${spec.title} on the MedPanel. Focus on ${spec.focus}. ` +
    "You may mention other results only where they change your interpretation.";
  const data = panelPayload(panel, patient, { your_results: own.map(slim), other_results: panel.analytes.filter((a) => !own.includes(a)).map(slim) });
  const out = await callJSON({
    system: cachedSystem(SYSTEM_PROMPT, role),
    content: [{ type: "text", text: `<panel>\n${data}\n</panel>` }],
    schema: SPECIALIST_SCHEMA,
  });
  return { id: spec.id, title: spec.title, ...out };
}

async function runChief(panel, patient, specialists) {
  const role =
    "You are the Chief Physician chairing the MedPanel. Synthesise the specialists' opinions into one coherent report: " +
    "reconcile disagreements, connect cross-specialty patterns, order issues by clinical priority, and restate every " +
    "item in critical_alerts first. Do not add findings that no specialist or result supports.";
  const data = panelPayload(panel, patient, {
    results: panel.analytes.map(slim),
    specialist_opinions: specialists.filter((s) => !s.skipped && !s.error),
  });
  return callJSON({
    system: cachedSystem(SYSTEM_PROMPT, role),
    content: [{ type: "text", text: `<panel>\n${data}\n</panel>` }],
    schema: CHIEF_SCHEMA,
    effort: "high",
  });
}

function rulesOnlySynthesis(panel) {
  const abnormal = panel.analytes.filter((a) => ["low", "high"].includes(a.flag));
  return {
    headline: panel.criticals.length ? "Critical values detected" : abnormal.length ? "Some results are outside the reference range" : "No out-of-range results detected",
    urgency: panel.criticals.length ? "urgent" : abnormal.length ? "soon" : "routine",
    overall_summary: "Offline mode: results were flagged by MedPanel's built-in rules only. No AI interpretation was run.",
    critical_alerts: [],
    key_issues: abnormal.map((a) => ({ title: `${a.label} ${a.flag}`, explanation: `${a.value_text} ${a.unit}`, priority: "follow_up", specialists: [] })),
    reassuring_findings: [],
    next_steps: ["Discuss these results with your doctor."],
    questions_for_doctor: [],
    limitations: ["AI specialist review was not run (offline mode)."],
  };
}

export async function analyseReport({ buffer, mimetype, offline = false }) {
  const source = await extractText(buffer, mimetype);
  if (source.text) source.text = redactText(source.text);

  let extracted;
  if (offline) {
    if (!source.text) throw new Error("Offline mode needs a text-based PDF or local OCR.");
    extracted = parseLabText(source.text);
  } else {
    extracted = await extractWithClaude(source);
  }

  const patient = { age: extracted.patient?.age ?? null, sex: extracted.patient?.sex ?? null };
  const panel = evaluatePanel(extracted.analytes ?? []);
  if (!panel.analytes.length) throw new Error("No laboratory values could be read from this file.");

  let specialists = [];
  let synthesis;
  if (offline) {
    synthesis = rulesOnlySynthesis(panel);
  } else {
    const settled = await Promise.allSettled(SPECIALISTS.map((s) => runSpecialist(s, panel, patient)));
    specialists = settled.map((r, i) =>
      r.status === "fulfilled" ? r.value : { id: SPECIALISTS[i].id, title: SPECIALISTS[i].title, error: r.reason?.message || "failed" },
    );
    synthesis = await runChief(panel, patient, specialists);
  }

  return {
    id: crypto.randomUUID(),
    generated_at: new Date().toISOString(),
    report_date: extracted.report_date ?? null,
    patient,
    extraction_method: offline ? `${source.method}+rules` : source.method,
    model: offline ? null : MODEL,
    analytes: panel.analytes,
    criticals: panel.criticals,
    implausible: panel.implausible,
    specialists,
    synthesis: enforceCriticals(synthesis, panel.criticals),
  };
}
