import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import PDFDocument from "pdfkit";

process.env.MEDPANEL_OFFLINE = "1";
const { default: app } = await import("../server.js");
let server, base;

before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
after(() => server.close());

function samplePdf() {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    ["Patient Name: Test Person", "Report date 2026-03-01", "Hemoglobin 9.8 g/dL 12.0 - 15.5",
     "Potassium 6.9 mmol/L 3.5 - 5.1", "Sodium 139 mmol/L 135 - 145", "Creatinine 1.0 mg/dL 0.6 - 1.3"]
      .forEach((l) => doc.text(l));
    doc.end();
  });
}

test("analyse requires consent", async () => {
  const fd = new FormData();
  fd.append("report", new Blob([await samplePdf()], { type: "application/pdf" }), "r.pdf");
  const res = await fetch(`${base}/api/analyze`, { method: "POST", body: fd });
  assert.equal(res.status, 403);
});

test("offline analysis flags criticals and exports PDF; nothing cached", async () => {
  const fd = new FormData();
  fd.append("consent", "accepted");
  fd.append("report", new Blob([await samplePdf()], { type: "application/pdf" }), "r.pdf");
  const res = await fetch(`${base}/api/analyze`, { method: "POST", body: fd });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  const report = await res.json();
  assert.equal(report.report_date, "2026-03-01");
  assert.deepEqual(report.criticals.map((c) => c.key), ["potassium"]);
  assert.equal(report.synthesis.urgency, "urgent");
  assert.equal(report.analytes.find((a) => a.key === "hemoglobin").flag, "low");

  const pdf = await fetch(`${base}/api/export-pdf`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ report }) });
  assert.equal(pdf.headers.get("content-type"), "application/pdf");
  assert.equal(Buffer.from(await pdf.arrayBuffer()).subarray(0, 4).toString(), "%PDF");
});
