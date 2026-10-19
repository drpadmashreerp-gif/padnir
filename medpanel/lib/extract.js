// OCR text -> structured JSON of lab values.
import { callJSON } from "./claude.js";

const nullable = (type) => ({ type: [type, "null"] });

export const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["report_date", "patient", "analytes"],
  properties: {
    report_date: { ...nullable("string"), description: "Collection or report date, ISO yyyy-mm-dd if known" },
    patient: {
      type: "object",
      additionalProperties: false,
      required: ["age", "sex"],
      properties: { age: nullable("number"), sex: { ...nullable("string"), description: "male, female or other" } },
    },
    analytes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "value", "value_text", "unit", "ref_low", "ref_high"],
        properties: {
          name: { type: "string" },
          value: nullable("number"),
          value_text: { type: "string" },
          unit: { type: "string" },
          ref_low: nullable("number"),
          ref_high: nullable("number"),
        },
      },
    },
  },
};

const EXTRACT_SYSTEM = [
  {
    type: "text",
    text:
      "You transcribe laboratory reports into JSON. Copy every test result exactly as printed: test name, numeric value, " +
      "unit, and the lab's reference interval split into ref_low/ref_high (null when one side is open, e.g. '<200'). " +
      "Indian-style counts such as '1.5 lakh/cumm' keep their printed unit. If a result is qualitative (e.g. 'Positive'), " +
      "set value to null and put the text in value_text. Do not interpret, correct or infer values. Ignore names, IDs and addresses.",
  },
];

export async function extractWithClaude(source) {
  const content = source.text
    ? [{ type: "text", text: `<report>\n${source.text}\n</report>` }]
    : [source.block, { type: "text", text: "Transcribe this laboratory report." }];
  return callJSON({ system: EXTRACT_SYSTEM, content, schema: EXTRACTION_SCHEMA, effort: "low" });
}

/**
 * Deterministic line parser used in offline mode and as a cross-check.
 * Matches lines like "Haemoglobin   13.5  g/dL   13.0 - 17.0".
 */
export function parseLabText(text) {
  const re =
    /^\s*([A-Za-z][A-Za-z0-9 ().,'\/+-]*?[A-Za-z)])\s*[:\-]?\s+([<>]?\s*\d+(?:\.\d+)?)\s*([A-Za-zµμ%\/^0-9.x×*]+(?:\/[A-Za-z0-9.]+)?)?\s*(?:\(?\s*(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*\)?)?/;
  const analytes = [];
  for (const line of String(text).split(/\r?\n/)) {
    if (/\b(date|time|age|page)\b/i.test(line)) continue;
    const m = line.match(re);
    if (!m) continue;
    const value = parseFloat(m[2].replace(/[<>\s]/g, ""));
    analytes.push({
      name: m[1].trim(),
      value,
      value_text: m[2].trim(),
      unit: (m[3] || "").trim(),
      ref_low: m[4] ? parseFloat(m[4]) : null,
      ref_high: m[5] ? parseFloat(m[5]) : null,
    });
  }
  const date = String(text).match(/(\d{4}-\d{2}-\d{2})/);
  return { report_date: date ? date[1] : null, patient: { age: null, sex: null }, analytes };
}
