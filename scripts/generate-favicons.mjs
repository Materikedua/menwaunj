import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
    }
  }
  return (~c) >>> 0;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePNG(buffer) {
  let pos = 8;
  let ihdr = null;
  const idats = [];
  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IHDR') {
      ihdr = {
        w: buffer.readUInt32BE(pos + 8),
        h: buffer.readUInt32BE(pos + 12),
        bitDepth: buffer[pos + 16],
        colorType: buffer[pos + 17]
      };
    } else if (type === 'IDAT') {
      idats.push(buffer.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idats));
  const { w, h } = ihdr;
  const bpp = 4;
  const stride = w * bpp;
  const raw = Buffer.alloc(w * h * bpp);
  let srcOffset = 0;
  for (let y = 0; y < h; y++) {
    const filter = decompressed[srcOffset++];
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x++) {
      const byte = decompressed[srcOffset++];
      const left = x >= bpp ? raw[rowOffset + x - bpp] : 0;
      const up = y > 0 ? raw[(y - 1) * stride + x] : 0;
      const upLeft = (y > 0 && x >= bpp) ? raw[(y - 1) * stride + x - bpp] : 0;
      let val = 0;
      if (filter === 0) val = byte;
      else if (filter === 1) val = (byte + left) & 0xFF;
      else if (filter === 2) val = (byte + up) & 0xFF;
      else if (filter === 3) val = (byte + Math.floor((left + up) / 2)) & 0xFF;
      else if (filter === 4) val = (byte + paeth(left, up, upLeft)) & 0xFF;
      raw[rowOffset + x] = val;
    }
  }
  return { width: w, height: h, data: raw };
}

function resizeRGBA(src, targetW, targetH) {
  const { width: srcW, height: srcH, data: srcData } = src;
  const out = Buffer.alloc(targetW * targetH * 4);
  const xRatio = srcW / targetW;
  const yRatio = srcH / targetH;

  for (let y = 0; y < targetH; y++) {
    const srcYStart = Math.floor(y * yRatio);
    const srcYEnd = Math.min(srcH, Math.ceil((y + 1) * yRatio));
    for (let x = 0; x < targetW; x++) {
      const srcXStart = Math.floor(x * xRatio);
      const srcXEnd = Math.min(srcW, Math.ceil((x + 1) * xRatio));

      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
      let count = 0;

      for (let sy = srcYStart; sy < srcYEnd; sy++) {
        for (let sx = srcXStart; sx < srcXEnd; sx++) {
          const idx = (sy * srcW + sx) * 4;
          const a = srcData[idx + 3] / 255;
          rSum += srcData[idx] * a;
          gSum += srcData[idx + 1] * a;
          bSum += srcData[idx + 2] * a;
          aSum += srcData[idx + 3];
          count++;
        }
      }

      const outIdx = (y * targetW + x) * 4;
      if (count > 0 && aSum > 0) {
        const avgAlpha = aSum / count;
        const normAlpha = avgAlpha / 255;
        out[outIdx] = Math.min(255, Math.round((rSum / count) / normAlpha));
        out[outIdx + 1] = Math.min(255, Math.round((gSum / count) / normAlpha));
        out[outIdx + 2] = Math.min(255, Math.round((bSum / count) / normAlpha));
        out[outIdx + 3] = Math.min(255, Math.round(avgAlpha));
      } else {
        out[outIdx] = 0;
        out[outIdx + 1] = 0;
        out[outIdx + 2] = 0;
        out[outIdx + 3] = 0;
      }
    }
  }
  return { width: targetW, height: targetH, data: out };
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(image) {
  const { width: w, height: h, data } = image;
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const scanlines = Buffer.alloc(h * (1 + w * 4));
  let dest = 0;
  let src = 0;
  for (let y = 0; y < h; y++) {
    scanlines[dest++] = 0; // Filter 0 (None)
    for (let x = 0; x < w * 4; x++) {
      scanlines[dest++] = data[src++];
    }
  }
  const idatData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createICO(pngImages) {
  const count = pngImages.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(count, 4); // Count

  let currentOffset = 6 + count * 16;
  const dirEntries = [];
  for (const img of pngImages) {
    const entry = Buffer.alloc(16);
    entry[0] = img.width >= 256 ? 0 : img.width;
    entry[1] = img.height >= 256 ? 0 : img.height;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size
    entry.writeUInt32LE(currentOffset, 12); // Offset
    dirEntries.push(entry);
    currentOffset += img.buffer.length;
  }
  return Buffer.concat([header, ...dirEntries, ...pngImages.map(img => img.buffer)]);
}

async function run() {
  console.log('Generating complete Google Search compliant favicon suite...');
  const logoPath = path.join(PUBLIC_DIR, 'logo-menwa-unj.png');
  const logoBuf = fs.readFileSync(logoPath);
  const decoded = decodePNG(logoBuf);

  // 1. Generate sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 }, // Google standard
    { name: 'favicon-96x96.png', size: 96 }, // Google standard (2x)
    { name: 'favicon-144x144.png', size: 144 }, // Google standard (3x)
    { name: 'apple-touch-icon.png', size: 180 }, // Apple standard
    { name: 'favicon-192x192.png', size: 192 }, // Google standard (4x) & PWA
    { name: 'favicon-512x512.png', size: 512 }, // PWA HD
  ];

  const generatedPngs = [];

  for (const { name, size } of sizes) {
    const resized = resizeRGBA(decoded, size, size);
    const png = encodePNG(resized);
    const outPath = path.join(PUBLIC_DIR, name);
    fs.writeFileSync(outPath, png);
    console.log(`✓ Generated ${name} (${size}x${size}, ${png.length} bytes)`);
    if ([16, 32, 48].includes(size)) {
      generatedPngs.push({ width: size, height: size, buffer: png });
    }
  }

  // 2. Generate multi-resolution favicon.ico
  const ico = createICO(generatedPngs);
  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  fs.writeFileSync(icoPath, ico);
  console.log(`✓ Generated favicon.ico (16, 32, 48px embedded, ${ico.length} bytes)`);

  // 3. Generate SVG vector favicon embedding high-resolution logo
  const logoBase64 = logoBuf.toString('base64');
  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="108" fill="#006569" />
  <circle cx="256" cy="256" r="236" fill="none" stroke="#FFDD00" stroke-width="8" opacity="0.6"/>
  <image href="data:image/png;base64,${logoBase64}" x="36" y="36" width="440" height="440" filter="url(#shadow)"/>
</svg>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), svgFavicon, 'utf8');
  console.log('✓ Generated favicon.svg (Vector emblem with high-contrast badge background)');

  // 4. Generate robots.txt
  const robotsTxt = `# Robots.txt for Menwa UNJ Portal Resmi (https://menwaunj.or.id)
User-agent: *
Allow: /
Allow: /favicon.ico
Allow: /favicon*.png
Allow: /favicon.svg
Allow: /apple-touch-icon.png
Allow: /logo-menwa-unj.png
Allow: /manifest.json

# Disallow internal API endpoints & security debug routes
Disallow: /api/
Disallow: /mako-ops

Sitemap: https://menwaunj.or.id/sitemap.xml
`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsTxt, 'utf8');
  console.log('✓ Generated robots.txt');

  // 5. Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://menwaunj.or.id/</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/gallery</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/kc</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/geranat</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/geranat/voting</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/youth-spark</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/informasi</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/administrasi</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/garis-komando</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/pendidikan</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/games</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/portal-peserta</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/official</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/verifikasi-surat</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/kebijakan-privasi</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://menwaunj.or.id/persyaratan-layanan</loc>
    <lastmod>2026-11-01</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('✓ Generated sitemap.xml');
}

run().catch((err) => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
