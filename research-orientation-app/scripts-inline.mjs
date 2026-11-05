// Builds dist/single/research-orientation.html: one self-contained file (CSS and JS inlined)
// that can be emailed, opened from a pen drive, or published as a single web page.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
const dir = 'dist/assets';
const files = readdirSync(dir);
const css = readFileSync(`${dir}/${files.find((f) => f.endsWith('.css'))}`, 'utf8');
const js = readFileSync(`${dir}/${files.find((f) => f.endsWith('.js'))}`, 'utf8').replace(/<\/script/g, '<\\/script');
let html = readFileSync('dist/index.html', 'utf8')
  .replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${css}</style>`)
  .replace(/<script type="module"[^>]*><\/script>/, () => '')
  .replace(/<link rel="manifest"[^>]*>/, '')
  .replace(/<link rel="icon"[^>]*>/, '');
html = html.replace('</body>', () => `<script type="module">${js}</script></body>`);
mkdirSync('dist/single', { recursive: true });
writeFileSync('dist/single/research-orientation.html', html);
console.log('wrote dist/single/research-orientation.html', (html.length / 1024).toFixed(0) + ' KB');
