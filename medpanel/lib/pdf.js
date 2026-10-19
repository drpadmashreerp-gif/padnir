// Render a report to PDF in memory and stream it to the response.
import PDFDocument from "pdfkit";

export const FLAG_COLOURS = {
  critical_low: "#b91c1c", critical_high: "#b91c1c", implausible: "#7e22ce",
  low: "#b45309", high: "#b45309", normal: "#15803d", unknown: "#6b7280",
};
const FLAG_TEXT = {
  critical_low: "CRITICAL LOW", critical_high: "CRITICAL HIGH", implausible: "VERIFY",
  low: "LOW", high: "HIGH", normal: "Normal", unknown: "—",
};

export function renderPdf(report, { chartPng, trends } = {}, stream) {
  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: "MedPanel report" } });
  doc.pipe(stream);
  const s = report.synthesis ?? {};
  const W = doc.page.width - 96;

  doc.fontSize(20).fillColor("#111827").text("MedPanel report");
  doc.fontSize(9).fillColor("#6b7280")
    .text(`Report date: ${report.report_date ?? "unknown"}   Generated: ${report.generated_at}   Urgency: ${s.urgency ?? "—"}`);
  doc.moveDown();

  if (report.criticals?.length || s.critical_alerts?.length) {
    const alerts = s.critical_alerts?.length ? s.critical_alerts : report.criticals.map((c) => c.message);
    const top = doc.y;
    doc.fontSize(11).fillColor("#b91c1c").text("CRITICAL VALUES — contact a clinician promptly", 58, top + 8, { width: W - 20 });
    doc.fontSize(9).fillColor("#111827");
    for (const a of alerts) doc.text(`• ${a}`, { width: W - 20 });
    const h = doc.y - top + 8;
    doc.rect(48, top, W, h).lineWidth(1.5).strokeColor("#b91c1c").stroke();
    doc.x = 48; doc.y = top + h + 10;
  }

  heading(doc, s.headline || "Summary");
  para(doc, s.overall_summary);

  heading(doc, "Results");
  const cols = [190, 80, 80, 90, 59];
  row(doc, ["Test", "Result", "Unit", "Reference", "Flag"], cols, { bold: true });
  for (const a of report.analytes) {
    const ref = a.ref_low != null || a.ref_high != null ? `${a.ref_low ?? ""} – ${a.ref_high ?? ""}` : "";
    row(doc, [a.label, a.value_text, a.unit, ref, FLAG_TEXT[a.flag]], cols, { flagColour: FLAG_COLOURS[a.flag] });
  }

  list(doc, "Key issues", (s.key_issues ?? []).map((k) => `${k.title} (${k.priority.replace("_", " ")}): ${k.explanation}`));
  list(doc, "Reassuring findings", s.reassuring_findings);
  list(doc, "Suggested next steps", s.next_steps);
  list(doc, "Questions for your doctor", s.questions_for_doctor);

  for (const sp of report.specialists ?? []) {
    if (sp.skipped || sp.error) continue;
    heading(doc, sp.title);
    para(doc, sp.summary);
    for (const f of sp.findings ?? []) para(doc, `• ${f.analyte}: ${f.interpretation}`);
  }

  if (chartPng?.startsWith("data:image/png;base64,")) {
    doc.addPage();
    heading(doc, "Trend");
    doc.image(Buffer.from(chartPng.split(",")[1], "base64"), { fit: [W, 300] });
    doc.moveDown();
  }
  if (Array.isArray(trends) && trends.length) {
    heading(doc, "Trend data");
    for (const t of trends.slice(0, 40)) {
      para(doc, `${t.label}: ${t.points.map((p) => `${p.date} ${p.value}`).join("  →  ")} ${t.unit ?? ""}`);
    }
  }

  list(doc, "Limitations", s.limitations);
  doc.moveDown().fontSize(8).fillColor("#6b7280").text(
    "MedPanel is an educational aid and not a medical diagnosis. Critical-value flags are computed by fixed rules; " +
      "reference ranges vary between laboratories. Always discuss results with a qualified clinician.",
  );
  doc.end();
}

function heading(doc, t) {
  doc.moveDown(0.6).fontSize(13).fillColor("#111827").text(t);
  doc.moveDown(0.2);
}
function para(doc, t) {
  if (t) doc.fontSize(9.5).fillColor("#1f2937").text(t, { width: doc.page.width - 96 });
}
function list(doc, title, items) {
  if (!items?.length) return;
  heading(doc, title);
  for (const i of items) para(doc, `• ${i}`);
}
function row(doc, cells, widths, { bold, flagColour } = {}) {
  if (doc.y > doc.page.height - 80) doc.addPage();
  const y = doc.y;
  let x = 48;
  doc.fontSize(9).font(bold ? "Helvetica-Bold" : "Helvetica");
  cells.forEach((c, i) => {
    doc.fillColor(i === cells.length - 1 && flagColour ? flagColour : "#111827").text(String(c ?? ""), x, y, { width: widths[i] - 4 });
    x += widths[i];
  });
  doc.font("Helvetica");
  doc.x = 48;
  doc.y = Math.max(doc.y, y + 13);
}
