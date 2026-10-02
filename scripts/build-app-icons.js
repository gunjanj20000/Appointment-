import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// 1. Create App Icon SVG (512x512)
// Matches Appointment Buddy's brand: #0051C7 -> #007AFF -> #00A896
function getAppIconSvg(isMaskable = false) {
  const rx = isMaskable ? 0 : 116;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Deep Royal Blue -> Electric Blue -> Medical Teal -->
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0051C7" />
      <stop offset="50%" stop-color="#007AFF" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>

    <!-- Top Gloss Highlight -->
    <linearGradient id="glossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>

    <!-- Pulse Line Gradient -->
    <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0066E0" />
      <stop offset="50%" stop-color="#007AFF" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>

    <!-- Cross Shadow -->
    <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#002255" flood-opacity="0.32" />
    </filter>

    <!-- Inner Subtle Shadow -->
    <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Background squircle (or full bleed if maskable) -->
  <rect width="512" height="512" rx="${rx}" fill="url(#brandGrad)" />

  <!-- Top Glass Highlight Overlay -->
  <rect width="512" height="256" rx="${rx}" fill="url(#glossGrad)" />

  <!-- App Icon Content -->
  <g filter="url(#cardShadow)">
    <!-- White Medical Cross with soft rounded edges -->
    <rect x="206" y="96" width="100" height="320" rx="32" fill="#FFFFFF" />
    <rect x="96" y="206" width="320" height="100" rx="32" fill="#FFFFFF" />

    <!-- Center Pulse / Heartbeat Line Wave Accent -->
    <g filter="url(#subtleGlow)">
      <path d="M142 256 h54 l18 -36 l24 72 l22 -48 l16 12 h94" 
            fill="none" 
            stroke="url(#pulseGrad)" 
            stroke-width="15" 
            stroke-linecap="round" 
            stroke-linejoin="round" />
      <!-- Center subtle pulse dot indicator -->
      <circle cx="256" cy="256" r="6" fill="#00A896" />
    </g>
  </g>
</svg>`;
}

// 2. Create Open Graph 1200x630 Social Banner SVG
// Designed to look stunning when shared on WhatsApp, Telegram, Twitter, iMessage, LinkedIn, Slack
function getOpenGraphSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="60%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0B1528" />
    </linearGradient>

    <!-- Mesh Glow Spots -->
    <radialGradient id="glowBlue" cx="20%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#007AFF" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#007AFF" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowTeal" cx="80%" cy="70%" r="50%">
      <stop offset="0%" stop-color="#00A896" stop-opacity="0.30" />
      <stop offset="100%" stop-color="#00A896" stop-opacity="0" />
    </radialGradient>

    <!-- Icon Badge Gradient -->
    <linearGradient id="iconBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0051C7" />
      <stop offset="50%" stop-color="#007AFF" />
      <stop offset="100%" stop-color="#00A896" />
    </linearGradient>

    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#007AFF" />
      <stop offset="100%" stop-color="#00C2A8" />
    </linearGradient>

    <!-- Shadow for App Icon badge -->
    <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#007AFF" flood-opacity="0.4" />
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5" />
    </filter>

    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Dark Premium Canvas -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#glowBlue)" />
  <rect width="1200" height="630" fill="url(#glowTeal)" />

  <!-- Subtle Grid lines -->
  <g opacity="0.05" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="126" x2="1200" y2="126" />
    <line x1="0" y1="252" x2="1200" y2="252" />
    <line x1="0" y1="378" x2="1200" y2="378" />
    <line x1="0" y1="504" x2="1200" y2="504" />
    <line x1="240" y1="0" x2="240" y2="630" />
    <line x1="480" y1="0" x2="480" y2="630" />
    <line x1="720" y1="0" x2="720" y2="630" />
    <line x1="960" y1="0" x2="960" y2="630" />
  </g>

  <!-- Left: Big 3D App Icon Badge (240x240) -->
  <g transform="translate(100, 195)" filter="url(#iconShadow)">
    <!-- Icon Container Squircle -->
    <rect width="240" height="240" rx="54" fill="url(#iconBadgeGrad)" />
    <!-- Gloss -->
    <rect width="240" height="120" rx="54" fill="#ffffff" fill-opacity="0.18" />

    <!-- Medical Cross -->
    <rect x="97" y="45" width="46" height="150" rx="16" fill="#FFFFFF" />
    <rect x="45" y="97" width="150" height="46" rx="16" fill="#FFFFFF" />

    <!-- Pulse Line in Cross -->
    <path d="M66 120 h26 l8 -17 l12 34 l11 -23 l8 6 h43" 
          fill="none" 
          stroke="#007AFF" 
          stroke-width="7" 
          stroke-linecap="round" 
          stroke-linejoin="round" />
    <circle cx="120" cy="120" r="3" fill="#00A896" />
  </g>

  <!-- Right: App Branding and Details -->
  <g transform="translate(390, 160)">
    <!-- Category Pill -->
    <g>
      <rect width="220" height="34" rx="17" fill="#007AFF" fill-opacity="0.18" stroke="#007AFF" stroke-opacity="0.4" stroke-width="1.5" />
      <circle cx="20" cy="17" r="4" fill="#00C2A8" />
      <text x="32" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#3898FF" letter-spacing="1">PRACTICE &amp; CARE</text>
    </g>

    <!-- Main Title: Appointment Buddy -->
    <text x="0" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF" letter-spacing="-1.5">
      Appointment <tspan fill="url(#textGrad)">Buddy</tspan>
    </text>

    <!-- Subtitle -->
    <text x="0" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="500" fill="#94A3B8" letter-spacing="-0.3">
      Offline-Ready Clinical Appointment &amp; Queue Management
    </text>

    <!-- Feature Badges -->
    <g transform="translate(0, 215)">
      <!-- Badge 1: Offline First -->
      <g>
        <rect width="150" height="42" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <text x="75" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#E2E8F0">⚡ Offline First</text>
      </g>

      <!-- Badge 2: Queue System -->
      <g transform="translate(162, 0)">
        <rect width="180" height="42" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <text x="90" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#E2E8F0">📋 Live Queue &amp; Token</text>
      </g>

      <!-- Badge 3: Patient Records -->
      <g transform="translate(354, 0)">
        <rect width="170" height="42" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <text x="85" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#E2E8F0">👥 Patient Records</text>
      </g>

      <!-- Badge 4: WhatsApp Alerts -->
      <g transform="translate(536, 0)">
        <rect width="170" height="42" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1" />
        <text x="85" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#E2E8F0">💬 WhatsApp &amp; SMS</text>
      </g>
    </g>
  </g>

  <!-- Bottom Accent Line -->
  <rect x="0" y="624" width="1200" height="6" fill="url(#textGrad)" />
</svg>`;
}

async function run() {
  const publicDir = path.resolve('public');
  const srcAssetsDir = path.resolve('src/assets');

  // 1. Write public/icon.svg
  const standardSvg = getAppIconSvg(false);
  const maskableSvg = getAppIconSvg(true);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg, 'utf8');
  console.log('✓ Wrote public/icon.svg');

  // 2. Generate PNG sizes
  const svgBuffer = Buffer.from(standardSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 512x512
  await sharp(svgBuffer).resize(512, 512).png({ quality: 95 }).toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(svgBuffer).resize(512, 512).png({ quality: 95 }).toFile(path.join(publicDir, 'app-icon.png'));
  await sharp(svgBuffer).resize(512, 512).png({ quality: 95 }).toFile(path.join(publicDir, 'logo.png'));
  await sharp(svgBuffer).resize(512, 512).png({ quality: 95 }).toFile(path.join(srcAssetsDir, 'app-icon.png'));
  console.log('✓ Generated 512x512 icons (pwa-512x512.png, app-icon.png, logo.png)');

  // 512x512 maskable
  await sharp(maskableBuffer).resize(512, 512).png({ quality: 95 }).toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ Generated 512x512 maskable icon (pwa-maskable-512x512.png)');

  // 192x192
  await sharp(svgBuffer).resize(192, 192).png({ quality: 95 }).toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ Generated 192x192 icon (pwa-192x192.png)');

  // 180x180 Apple Touch Icon
  await sharp(svgBuffer).resize(180, 180).png({ quality: 95 }).toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated 180x180 icon (apple-touch-icon.png)');

  // 32x32 & 16x16 Favicons
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(svgBuffer).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));
  await sharp(svgBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.png'));
  console.log('✓ Generated favicons');

  // 3. Generate Open Graph banner 1200x630
  const ogSvg = getOpenGraphSvg();
  const ogBuffer = Buffer.from(ogSvg);
  await sharp(ogBuffer).resize(1200, 630).png({ quality: 90, compressionLevel: 8 }).toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ Generated 1200x630 Open Graph banner (og-image.png)');

  // Check file size of og-image.png (WhatsApp requires < 300KB)
  const ogStats = fs.statSync(path.join(publicDir, 'og-image.png'));
  console.log(`Open Graph banner size: ${(ogStats.size / 1024).toFixed(1)} KB (WhatsApp limit is 300 KB)`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
