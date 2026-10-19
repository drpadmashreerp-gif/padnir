// Runs the full Claude pipeline against a local stand-in for the Messages API.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import PDFDocument from "pdfkit";

const calls = [];
let mock;

function reply(body) {
  const sys = body.system.map((b) => b.text).join("\n");
  let out;
  if (sys.includes("transcribe laboratory reports")) {
    out = { report_date: "2026-05-02", patient: { age: 54, sex: "male" }, analytes: [
      { name: "Haemoglobin", value: 13.9, value_text: "13.9", unit: "g/dL", ref_low: 13, ref_high: 17 },
      { name: "Sodium", value: 118, value_text: "118", unit: "mmol/L", ref_low: 135, ref_high: 145 },
      { name: "LDL Cholesterol", value: 165, value_text: "165", unit: "mg/dL", ref_low: null, ref_high: 100 },
    ] };
  } else if (sys.includes("Chief Physician")) {
    // Deliberately omits the critical sodium so the code post-check must add it.
    out = { headline: "Mostly fine", urgency: "routine", overall_summary: "s", critical_alerts: [], key_issues: [],
      reassuring_findings: [], next_steps: [], questions_for_doctor: [], limitations: [] };
  } else {
    out = { summary: "ok", findings: [], patterns: [], follow_up_tests: [], questions_for_doctor: [] };
  }
  return { id: "msg_1", type: "message", role: "assistant", model: body.model, stop_reason: "end_turn",
    content: [{ type: "text", text: JSON.stringify(out) }], usage: { input_tokens: 1, output_tokens: 1 } };
}

before(async () => {
  mock = http.createServer((req, res) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      const body = JSON.parse(data);
      calls.push({ headers: req.headers, body });
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(reply(body)));
    });
  });
  await new Promise((r) => mock.listen(0, r));
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${mock.address().port}`;
  process.env.ANTHROPIC_API_KEY = "test";
});
after(() => mock.close());

const pdf = () => new Promise((resolve) => {
  const doc = new PDFDocument(); const chunks = [];
  doc.on("data", (c) => chunks.push(c)); doc.on("end", () => resolve(Buffer.concat(chunks)));
  doc.text("Patient Name: Jane Example   Age: 54\nHaemoglobin 13.9 g/dL 13.0 - 17.0\nSodium 118 mmol/L 135 - 145\nLDL Cholesterol 165 mg/dL");
  doc.end();
});

test("extraction, parallel specialists, chief synthesis and critical enforcement", async () => {
  const { analyseReport } = await import("../lib/orchestrator.js");
  const report = await analyseReport({ buffer: await pdf(), mimetype: "application/pdf" });

  const [extract, ...rest] = calls;
  assert.ok(!JSON.stringify(extract.body.messages).includes("Jane"), "identifiers redacted before sending");
  assert.equal(extract.body.model, "claude-opus-5-5");
  assert.equal(extract.body.fallbacks, "default");
  assert.match(extract.headers["anthropic-beta"], /server-side-fallback-2026-07-01/);
  assert.equal(extract.body.output_config.format.type, "json_schema");

  // hematology, renal, cardio have data -> 3 specialists + 1 chief
  assert.equal(rest.length, 4);
  assert.ok(rest.every((c) => c.body.system[0].cache_control?.type === "ephemeral"));
  assert.deepEqual(report.specialists.filter((s) => !s.skipped).map((s) => s.id), ["hematology", "renal", "cardio"]);

  assert.deepEqual(report.criticals.map((c) => c.key), ["sodium"]);
  assert.equal(report.synthesis.urgency, "urgent");
  assert.deepEqual(report.synthesis.enforced_by_rules, ["Sodium"]);
  assert.equal(report.analytes.find((a) => a.key === "ldl").flag, "high");
});
