import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Minimal pure-Node PNG generator
function createPNG(width, height, getPixel) {
  // getPixel(x, y) => [r, g, b, a]
  const rowSize = width * 4 + 1; // +1 for filter byte
  const rawData = Buffer.alloc(height * rowSize);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Draw a medical appointment organizer icon
function makeMedicalIconPixel(width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = isMaskable ? 0.72 : 0.88;
  const cardRadius = (width / 2) * scale;

  return function (x, y) {
    if (isMaskable) {
      // Solid background fills the whole frame
      // Draw a circular/squircle brand background or full bleed #0d9488
    }

    const bgR = 13, bgG = 148, bgB = 136; // #0d9488 Teal-600
    const darkR = 15, darkG = 118, darkB = 110; // #0f766e Teal-700

    // Check if in background
    let inCard = true;
    if (!isMaskable) {
      const cornerR = width * 0.22;
      const left = cx - cardRadius, right = cx + cardRadius;
      const top = cy - cardRadius, bottom = cy + cardRadius;
      if (x < left || x > right || y < top || y > bottom) {
        return [0, 0, 0, 0];
      }
      // rounded corners
      const rx = Math.min(Math.max(x, left + cornerR), right - cornerR);
      const ry = Math.min(Math.max(y, top + cornerR), bottom - cornerR);
      const dist = Math.hypot(x - rx, y - ry);
      if (dist > cornerR) {
        return [0, 0, 0, 0];
      }
    }

    // Gradient background
    const gradFactor = y / height;
    const curBgR = Math.round(bgR * (1 - gradFactor * 0.25) + darkR * (gradFactor * 0.25));
    const curBgG = Math.round(bgG * (1 - gradFactor * 0.25) + darkG * (gradFactor * 0.25));
    const curBgB = Math.round(bgB * (1 - gradFactor * 0.25) + darkB * (darkB * 0.0 + darkG * 0.0 + darkB * 0.25));

    // Foreground icon: Medical cross + Calendar grid lines
    const normX = (x - cx) / (width * scale * 0.5);
    const normY = (y - cy) / (height * scale * 0.5);

    // Cross dimensions
    // Vertical bar: |x| < 0.22 and |y| < 0.65
    // Horizontal bar: |y| < 0.22 and |x| < 0.65
    const isVBar = Math.abs(normX) <= 0.20 && Math.abs(normY) <= 0.60;
    const isHBar = Math.abs(normY) <= 0.20 && Math.abs(normX) <= 0.60;
    
    // Heart rhythm pulse line in center of cross or clean cross:
    if (isVBar || isHBar) {
      // White cross
      return [255, 255, 255, 255];
    }

    return [curBgR, curBgG, curBgB, 255];
  };
}

// Generate icons
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#0f766e" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.2"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#medGrad)" />
  <!-- Medical Cross -->
  <g filter="url(#shadow)">
    <!-- Vertical Bar with rounded ends -->
    <rect x="206" y="96" width="100" height="320" rx="30" fill="#ffffff" />
    <!-- Horizontal Bar with rounded ends -->
    <rect x="96" y="206" width="320" height="100" rx="30" fill="#ffffff" />
  </g>
  <!-- Stethoscope / Pulse Accent in center -->
  <path d="M190 256h25l15-28 22 56 18-36 12 8h40" fill="none" stroke="#0d9488" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

// 2. PNGs
const sizes = [
  { file: 'pwa-192x192.png', size: 192, maskable: false },
  { file: 'pwa-512x512.png', size: 512, maskable: false },
  { file: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const { file, size, maskable } of sizes) {
  const buf = createPNG(size, size, makeMedicalIconPixel(size, size, maskable));
  fs.writeFileSync(path.join(publicDir, file), buf);
  console.log(`Created ${file} (${size}x${size})`);
}

console.log('All icons created successfully.');
