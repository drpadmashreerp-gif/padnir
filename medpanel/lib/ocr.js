// Text extraction. Everything stays in memory; nothing is written to disk.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export const ACCEPTED = {
  "application/pdf": "pdf",
  "image/png": "image",
  "image/jpeg": "image",
  "image/webp": "image",
};

let workerPromise;
async function tesseract() {
  if (!workerPromise) {
    workerPromise = import("tesseract.js").then(({ createWorker }) => createWorker("eng"));
  }
  return workerPromise;
}

/**
 * Returns { text, method } when local text extraction works, otherwise
 * { block, method } holding a content block to send directly to Claude
 * (scanned PDFs, or images when local OCR is unavailable).
 */
export async function extractText(buffer, mimetype) {
  const kind = ACCEPTED[mimetype];
  if (!kind) throw new Error("Unsupported file type");

  if (kind === "pdf") {
    // pdf-parse's bundled pdf.js ignores byteOffset, so small Buffers carved out of
    // Node's shared pool parse as garbage. Hand it a copy that owns its memory.
    const copy = new Uint8Array(buffer);
    const { text } = await pdfParse(copy).finally(() => copy.fill(0));
    if (text && text.replace(/\s/g, "").length > 80) return { text, method: "pdf-text" };
    return {
      method: "claude-vision",
      block: { type: "document", source: { type: "base64", media_type: "application/pdf", data: buffer.toString("base64") } },
    };
  }

  if (process.env.MEDPANEL_OCR !== "claude") {
    try {
      const worker = await tesseract();
      const { data } = await worker.recognize(buffer);
      if (data.text && data.text.replace(/\s/g, "").length > 40) return { text: data.text, method: "tesseract" };
    } catch {
      workerPromise = undefined; // fall through to Claude vision
    }
  }
  return {
    method: "claude-vision",
    block: { type: "image", source: { type: "base64", media_type: mimetype, data: buffer.toString("base64") } },
  };
}
