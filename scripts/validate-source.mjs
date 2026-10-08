import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const SRC = path.join(ROOT, 'src');
const API = path.join(ROOT, 'api');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

// Remove comments and JS string/template contents so JSX-looking text in comments/data
// cannot produce a false positive. This is intentionally conservative: a real JSX tag
// in a .js source remains visible and fails the check.
function maskNonCode(source) {
  let out = '';
  let state = 'code';
  let quote = '';
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    const n = source[i + 1];
    if (state === 'code') {
      if (c === '/' && n === '/') { state = 'line'; out += '  '; i++; continue; }
      if (c === '/' && n === '*') { state = 'block'; out += '  '; i++; continue; }
      if (c === '"' || c === "'" || c === '`') { state = 'string'; quote = c; out += ' '; continue; }
      out += c;
    } else if (state === 'line') {
      out += c === '\n' ? '\n' : ' ';
      if (c === '\n') state = 'code';
    } else if (state === 'block') {
      out += c === '\n' ? '\n' : ' ';
      if (c === '*' && n === '/') { out += ' '; i++; state = 'code'; }
    } else if (state === 'string') {
      out += c === '\n' ? '\n' : ' ';
      if (c === '\\') { out += ' '; i++; continue; }
      if (c === quote) state = 'code';
    }
  }
  return out;
}

const files = [...walk(SRC), ...walk(API)].filter((f) => /\.(js|jsx|mjs)$/.test(f));
const jsFiles = files.filter((f) => f.endsWith('.js'));
const failures = [];

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const masked = maskNonCode(source);
  if (/<\s*[A-Za-z][\w.-]*(?:\s|\/?>)/.test(masked)) {
    failures.push(`${path.relative(ROOT, file)} contains JSX but is a .js file; rename it to .jsx.`);
  }
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (error) {
    failures.push(`${path.relative(ROOT, file)} failed Node syntax check.`);
  }
}

// Every local router import must resolve to the JSX file after the extension fix.
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const re = /from\s+['"](\.{1,2}\/[^'"\n]+)['"]/g;
  for (const match of source.matchAll(re)) {
    const spec = match[1];
    if (!spec.startsWith('.')) continue;
    const base = path.resolve(path.dirname(file), spec);
    const candidates = [base, `${base}.js`, `${base}.jsx`, `${base}.mjs`, path.join(base, 'index.js'), path.join(base, 'index.jsx')];
    if (!candidates.some((p) => fs.existsSync(p))) {
      failures.push(`${path.relative(ROOT, file)} has an unresolved local import: ${spec}`);
    }
  }
}

if (failures.length) {
  console.error('Source validation FAILED:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Source validation passed: ${files.length} source files checked; ${jsFiles.length} .js files syntax-checked without JSX.`);
