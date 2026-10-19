// Strip direct identifiers from OCR text before it leaves the server.
// Age and sex are kept because reference ranges depend on them.

const LINE_PATTERNS = [
  /^\s*(referred\s*by|ref\.?\s*(by|doctor|dr)|consultant|physician)\s*[:\-]/i,
  /^\s*(address|addr)\s*[:\-]/i,
];

const INLINE_PATTERNS = [
  [/\b(?:patient\s*name|name)\s*[:\-]\s*[^\n|]+?(?=\s{2,}|\||\bage\b|\bsex\b|\bgender\b|$)/gim, "Name: [REDACTED]"],
  [/\b(?:uhid|mrn|reg(?:istration)?\.?\s*no|patient\s*id|lab\s*no|sample\s*id|bill\s*no|visit\s*id|aadhaar|abha)\s*[:#\-]?\s*[A-Z0-9\-\/]{3,}/gi, "[ID REDACTED]"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL REDACTED]"],
  [/\b(?:ph(?:one)?|mob(?:ile)?|tel|contact)\.?\s*(?:no\.?)?\s*[:\-]?\s*\+?\d[\d\s-]{6,}\d/gi, "Phone: [REDACTED]"],
  [/(?:\+\d{1,3}[\s-]?)?\b(?:[6-9]\d{4}[\s-]?\d{5}|\d{3}[\s-]\d{3}[\s-]\d{4})\b/g, "[PHONE REDACTED]"],
  [/\b(?:dob|date\s*of\s*birth)\s*[:\-]?\s*[\d\/\-.]{6,10}/gi, "DOB: [REDACTED]"],
];

export function redactText(text) {
  const lines = String(text).split(/\r?\n/).map((line) =>
    LINE_PATTERNS.some((re) => re.test(line)) ? line.replace(/[:\-].*$/, ": [REDACTED]") : line,
  );
  let out = lines.join("\n");
  for (const [re, rep] of INLINE_PATTERNS) out = out.replace(re, rep);
  return out;
}
