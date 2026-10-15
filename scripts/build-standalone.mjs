import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';

const dist = resolve('dist');
async function asset(path) {
  const target = resolve(dist, path.replace(/^\.\//, '').replace(/^\//, ''));
  const child = relative(dist, target);
  if (child.startsWith('..') || isAbsolute(child)) throw new Error('Asset must be inside dist');
  return readFile(target, 'utf8');
}
let html = await readFile(resolve(dist, 'index.html'), 'utf8');
const script = html.match(/<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/);
if (!script) throw new Error('Production JavaScript entry not found. Run npm run build first.');
const javascript = (await asset(script[1])).replace(/<\/script/gi, '<\\/script');
html = html.replace(script[0], () => `<script type="module">${javascript}</script>`);
for (const link of [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/g)]) {
  const href = link[0].match(/href=["']([^"']+)["']/)?.[1];
  if (!href) throw new Error('Stylesheet path not found');
  const css = (await asset(href)).replace(/<\/style/gi, '<\\/style');
  html = html.replace(link[0], () => `<style>${css}</style>`);
}
const favicon = await readFile(resolve(dist, 'favicon.svg'), 'utf8');
html = html.replace(/href=["']\.\/favicon\.svg["']/, () => `href="data:image/svg+xml,${encodeURIComponent(favicon)}"`);
await writeFile('Someday.html', html);
console.log(`Created Someday.html (${Buffer.byteLength(html).toLocaleString()} bytes). Open it directly in a browser.`);
