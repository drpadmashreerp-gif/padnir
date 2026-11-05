import { unzipSync, strFromU8 } from 'fflate';
import { buildDocx } from './docx';
import { bookBlocks, certificateBlocks, chapterBlocks, portfolioBlocks } from './exports';
import { MODULES } from '../data/modules';
import { initial } from './store';

const xmlOf = (b: ReturnType<typeof bookBlocks>) => strFromU8(unzipSync(buildDocx(b))['word/document.xml']);

test('chapter export follows the reading mode', () => {
  const en = xmlOf(chapterBlocks(MODULES[0], 'en')), kn = xmlOf(chapterBlocks(MODULES[0], 'kn')), both = xmlOf(chapterBlocks(MODULES[0], 'both'));
  expect(en).toContain('Foundations of Educational Research');
  expect(en).not.toContain('ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆ ಎಂದರೇನು');
  expect(kn).toContain('ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆ ಎಂದರೇನು');
  expect(both).toContain('What is educational research?');
  expect(both).toContain('ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆ ಎಂದರೇನು');
  expect(en).toContain('Answer key');
});
test('whole book contains all 17 chapters, both part title pages and code examples', () => {
  const x = xmlOf(bookBlocks('both'));
  for (const m of MODULES) expect(x).toContain(m.title);
  expect(x.match(/w:type="page"/g)).toHaveLength(17 + 2) // one break per chapter, plus one after each part title;
  expect(x).toContain('Advanced Research Methods: Analytics, Innovation and AI');
  expect(x).toContain('cortest.bartlett');
});
test('certificate and portfolio carry the person\'s details', () => {
  expect(xmlOf(certificateBlocks('Dr. A. Kumar', 'DIET Mysuru', '05/11/2026'))).toContain('Dr. A. Kumar');
  expect(xmlOf(certificateBlocks('Dr. A. Kumar', 'DIET Mysuru', '05/11/2026', 2))).toContain('20-hour programme');
  const p = xmlOf(portfolioBlocks({ ...initial, name: 'Dr. A. Kumar', quiz: { m1: 75 }, journal: [{ date: 'd', stage: 'Plan', text: 'My plan' }],
    submissions: [{ id: '1', moduleId: 'm1', text: 'My response', date: 'd', feedback: 'Well argued' }], proposal: { __refs: JSON.stringify([{ a: 'Rao, S.', y: '2020', t: 'A study', s: 'Journal' }]) } }));
  for (const t of ['Dr. A. Kumar', '75%', 'My plan', 'My response', 'Well argued', 'Rao, S. (2020). A study. Journal']) expect(p).toContain(t);
});
