import fs from 'fs';
import path from 'path';

function glob(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(glob(full));
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

const files = glob('src');
const pathRegex = /['"](\/(?:kegiatan|header|struktur|narasumber|dokumentasi|mitra|dokumen|jersey|assets)[\w\d_./-]+\.(?:png|jpg|jpeg|svg|webp|pdf))['"]/g;
const foundPaths = new Set();

for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  let m;
  while ((m = pathRegex.exec(content)) !== null) {
    foundPaths.add(m[1]);
  }
}

console.log('Total referenced static paths in src:', foundPaths.size);
const missing = [];
for (const p of foundPaths) {
  const localPath = path.join('public', p);
  if (!fs.existsSync(localPath)) {
    missing.push(p);
  }
}

console.log('Missing referenced static paths count:', missing.length);
if (missing.length > 0) {
  console.log('Missing:', missing);
}
