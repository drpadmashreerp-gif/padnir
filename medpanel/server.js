import express from "express";
import helmet from "helmet";
import multer from "multer";
import { analyseReport } from "./lib/orchestrator.js";
import { ACCEPTED } from "./lib/ocr.js";
import { renderPdf } from "./lib/pdf.js";
import { ModelError } from "./lib/claude.js";

const PORT = Number(process.env.PORT) || 3000;
const OFFLINE = process.env.MEDPANEL_OFFLINE === "1" || !(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: { directives: { "script-src": ["'self'"], "img-src": ["'self'", "data:", "blob:"] } },
    hsts: process.env.NODE_ENV === "production",
  }),
);
// Patient data must never be cached by browsers or proxies.
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
// Minimal access log: method, path, status. Never bodies, filenames or results.
app.use((req, res, next) => {
  res.on("finish", () => console.log(`${req.method} ${req.path} ${res.statusCode}`));
  next();
});

app.use(express.static(new URL("./public", import.meta.url).pathname));
app.use("/vendor", express.static(new URL("./node_modules/chart.js/dist", import.meta.url).pathname));

// memoryStorage: uploads are never written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, Boolean(ACCEPTED[file.mimetype])),
});

app.get("/api/config", (req, res) => res.json({ offline: OFFLINE, retention: "none" }));

app.post("/api/analyze", upload.single("report"), async (req, res) => {
  if (req.body?.consent !== "accepted") return res.status(403).json({ error: "Consent is required before analysis." });
  if (!req.file) return res.status(400).json({ error: "Upload a PDF, PNG, JPEG or WebP file (max 15 MB)." });
  const { buffer, mimetype } = req.file;
  try {
    const report = await analyseReport({ buffer, mimetype, offline: OFFLINE });
    res.json(report);
  } catch (err) {
    const status = err instanceof ModelError ? 502 : 422;
    res.status(status).json({ error: err.message || "Analysis failed." });
  } finally {
    buffer.fill(0); // drop the upload from memory as soon as we are done
    req.file = undefined;
  }
});

app.post("/api/export-pdf", express.json({ limit: "8mb" }), (req, res) => {
  const { report, chartPng, trends } = req.body ?? {};
  if (!report?.analytes) return res.status(400).json({ error: "Missing report." });
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="medpanel-report.pdf"' });
  renderPdf(report, { chartPng, trends }, res);
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  res.status(500).json({ error: "Server error." });
});

if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(PORT, () => console.log(`MedPanel on http://localhost:${PORT}${OFFLINE ? " (offline: rules only)" : ""}`));
}

export default app;
