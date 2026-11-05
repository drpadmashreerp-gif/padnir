import { unzipSync, strFromU8 } from 'fflate';
import { TEMPLATES } from './templates';
import { buildDocx } from '../lib/docx';

test('every template builds a .docx with the three required parts', () => {
  for (const tp of TEMPLATES) {
    const bytes = buildDocx(tp.blocks);
    const parts = unzipSync(bytes);
    expect(Object.keys(parts).sort()).toEqual(['[Content_Types].xml', '_rels/.rels', 'word/document.xml']);
    const xml = strFromU8(parts['word/document.xml']);
    expect(xml).toContain(tp.name.split(' ')[0]);
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;)/);
  }
});
