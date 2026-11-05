// Minimal Word (.docx) writer: headings, paragraphs, bullets, blank lines and bordered tables.
// Kannada runs use the complex-script font slot so Word picks a Kannada font (Nirmala UI / Tunga).
import { zipSync, strToU8 } from 'fflate';

export type Block =
  | { t: 'title' | 'h1' | 'h2' | 'p' | 'bullet' | 'note' | 'center' | 'big'; text: string }
  | { t: 'pagebreak' }
  | { t: 'blank'; lines?: number }
  | { t: 'table'; rows: string[][]; header?: boolean; widths?: number[] };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SIZE = { title: 32, h1: 28, h2: 24, p: 22, bullet: 22, note: 18, center: 24, big: 44 } as const;

function run(text: string, size: number, bold = false, italic = false) {
  return `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Nirmala UI"/>${bold ? '<w:b/><w:bCs/>' : ''}${italic ? '<w:i/>' : ''}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}
function para(text: string, kind: keyof typeof SIZE) {
  const heading = kind === 'title' || kind === 'h1' || kind === 'h2' || kind === 'big';
  const centered = kind === 'title' || kind === 'center' || kind === 'big';
  const ppr = `<w:pPr><w:spacing w:before="${heading ? 240 : 0}" w:after="120" w:line="300" w:lineRule="auto"/>${centered ? '<w:jc w:val="center"/>' : ''}${kind === 'bullet' ? '<w:ind w:left="360" w:hanging="240"/>' : ''}</w:pPr>`;
  const lines = text.split('\n');
  const runs = lines.map((l, i) => (i ? '<w:r><w:br/></w:r>' : '') + run((kind === 'bullet' && i === 0 ? '• ' : '') + l, SIZE[kind], heading, kind === 'note')).join('');
  return `<w:p>${ppr}${runs}</w:p>`;
}
function table(rows: string[][], header = true, widths?: number[]) {
  const cols = Math.max(...rows.map((r) => r.length));
  const total = 9000;
  const w = widths ?? Array(cols).fill(Math.floor(total / cols));
  const border = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((s) => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="808080"/>`).join('');
  const grid = `<w:tblGrid>${w.map((x) => `<w:gridCol w:w="${x}"/>`).join('')}</w:tblGrid>`;
  const trs = rows.map((r, i) => `<w:tr>${Array.from({ length: cols }, (_, j) =>
    `<w:tc><w:tcPr><w:tcW w:w="${w[j]}" w:type="dxa"/>${header && i === 0 ? '<w:shd w:val="clear" w:color="auto" w:fill="E6F2F0"/>' : ''}</w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${run(r[j] ?? '', 20, header && i === 0)}</w:p></w:tc>`).join('')}</w:tr>`).join('');
  return `<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/><w:tblBorders>${border}</w:tblBorders><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>${grid}${trs}</w:tbl><w:p/>`;
}

export function buildDocx(blocks: Block[]): Uint8Array {
  const body = blocks.map((b) => {
    if (b.t === 'pagebreak') return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    if (b.t === 'blank') return Array(b.lines ?? 1).fill('<w:p/>').join('');
    if (b.t === 'table') return table(b.rows, b.header ?? true, b.widths);
    return para(b.text, b.t);
  }).join('');
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  return zipSync({
    '[Content_Types].xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'),
    'word/document.xml': strToU8(doc),
  });
}

/** Turns a heading/body list into blocks: lines starting with "# " become headings. */
export function textToBlocks(title: string, sections: [string, string][]): Block[] {
  return [{ t: 'title', text: title }, ...sections.flatMap(([h, body]): Block[] => [{ t: 'h1', text: h }, { t: 'p', text: body || ' ' }])];
}
