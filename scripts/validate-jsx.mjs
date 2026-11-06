import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const parser = require('@babel/parser');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}
let checked = 0;
for (const file of walk(path.join(root, 'src')).filter(file => /\.jsx?$/.test(file))) {
  parser.parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
  checked++;
}
console.log(`Validasi parser JSX berhasil: ${checked} file sumber React/JavaScript.`);
