import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

// ── OG-Image SVG (1200×630) ────────────────────────────────────────────────
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Coordinate grid pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,255,179,0.06)" stroke-width="1"/>
    </pattern>

    <!-- Teal glow filter -->
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Strong glow for logo -->
    <filter id="glow-strong" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Soft glow for decorative elements -->
    <filter id="glow-soft">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Camera vignette gradient -->
    <radialGradient id="cam-vignette" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(7,8,13,0.7)"/>
    </radialGradient>

    <!-- Background gradient: darker on right -->
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#07080d"/>
      <stop offset="55%" stop-color="#07080d"/>
      <stop offset="100%" stop-color="#060709"/>
    </linearGradient>

    <!-- Camera screen gradient -->
    <linearGradient id="cam-screen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0d1520"/>
      <stop offset="100%" stop-color="#060a10"/>
    </linearGradient>

    <!-- Teal fade for divider -->
    <linearGradient id="teal-fade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,255,179,0)"/>
      <stop offset="30%" stop-color="rgba(0,255,179,0.6)"/>
      <stop offset="70%" stop-color="rgba(0,255,179,0.6)"/>
      <stop offset="100%" stop-color="rgba(0,255,179,0)"/>
    </linearGradient>
  </defs>

  <!-- ── BACKGROUND ── -->
  <rect width="1200" height="630" fill="url(#bg-gradient)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Scan line overlay -->
  <rect width="1200" height="630" fill="none"
    style="background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,179,0.015) 3px,rgba(0,255,179,0.015) 4px)"/>

  <!-- Horizontal scan lines (simulated with thin rects) -->
  <g opacity="0.04">
    <rect y="0"   width="1200" height="1" fill="#00ffb3"/>
    <rect y="4"   width="1200" height="1" fill="#00ffb3"/>
    <rect y="8"   width="1200" height="1" fill="#00ffb3"/>
    <rect y="12"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="16"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="20"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="24"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="28"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="32"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="36"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="40"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="44"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="48"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="52"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="56"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="60"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="64"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="68"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="72"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="76"  width="1200" height="1" fill="#00ffb3"/>
    <rect y="80"  width="1200" height="1" fill="#00ffb3"/>
  </g>

  <!-- ── LEFT SECTION (content) ── -->

  <!-- REC indicator top-left -->
  <circle cx="64" cy="52" r="7" fill="#ff4455" filter="url(#glow-soft)"/>
  <text x="78" y="57" font-family="'Courier New',monospace" font-size="14" font-weight="700"
        fill="#ff4455" letter-spacing="2">REC LIVE</text>

  <!-- Cam ID top-right of left section -->
  <text x="580" y="57" text-anchor="end" font-family="'Courier New',monospace" font-size="13"
        fill="rgba(0,255,179,0.4)" letter-spacing="1">CAM.ID 00x47 / SRC GEO-WATCH</text>

  <!-- ── LOGO ── -->
  <text x="64" y="190" font-family="'Courier New',monospace" font-size="86" font-weight="900"
        fill="#00ffb3" letter-spacing="6" filter="url(#glow-strong)">GEO</text>
  <text x="64" y="270" font-family="'Courier New',monospace" font-size="86" font-weight="900"
        fill="#00ffb3" letter-spacing="6" filter="url(#glow-strong)">WATCH</text>

  <!-- Tagline -->
  <text x="68" y="318" font-family="'Courier New',monospace" font-size="18"
        fill="rgba(0,255,179,0.45)" letter-spacing="4">// GLOBAL SURVEILLANCE GAME</text>

  <!-- Divider -->
  <rect x="64" y="340" width="480" height="1" fill="rgba(0,255,179,0.2)"/>

  <!-- ── KEY FEATURES ── -->
  <!-- Feature 1 -->
  <text x="64" y="386" font-family="'Courier New',monospace" font-size="22" font-weight="700"
        fill="#c8d0d8">🌍  Erkenne Städte aus echten Live-Kameras</text>

  <!-- Feature 2 -->
  <text x="64" y="424" font-family="'Courier New',monospace" font-size="22" font-weight="700"
        fill="#c8d0d8">⚡  1.500+ Webcams · Täglich neue Challenge</text>

  <!-- Feature 3 -->
  <text x="64" y="462" font-family="'Courier New',monospace" font-size="22" font-weight="700"
        fill="#c8d0d8">🎮  Kostenlos · Kein Account · Sofort spielen</text>

  <!-- Divider -->
  <rect x="64" y="490" width="480" height="1" fill="rgba(0,255,179,0.15)"/>

  <!-- Domain -->
  <text x="64" y="530" font-family="'Courier New',monospace" font-size="20" font-weight="900"
        fill="rgba(0,255,179,0.7)" letter-spacing="2">geowatch-game.de</text>

  <!-- Score badge -->
  <rect x="64" y="548" width="200" height="28" rx="3"
        fill="rgba(0,255,179,0.08)" stroke="rgba(0,255,179,0.25)" stroke-width="1"/>
  <text x="74" y="567" font-family="'Courier New',monospace" font-size="13" font-weight="700"
        fill="#00ffb3" letter-spacing="1">MAX 1.000 PTS / RUNDE</text>

  <!-- ── VERTICAL DIVIDER ── -->
  <rect x="618" y="0" width="1" height="630" fill="url(#teal-fade)"/>

  <!-- ── RIGHT SECTION (camera frame) ── -->
  <!-- Camera screen background -->
  <rect x="640" y="40" width="520" height="550" rx="4" fill="url(#cam-screen)"/>

  <!-- Camera frame border -->
  <rect x="640" y="40" width="520" height="550" rx="4" fill="none"
        stroke="rgba(0,255,179,0.25)" stroke-width="1.5"/>

  <!-- Corner brackets TL -->
  <path d="M 648 48 L 648 80 M 648 48 L 680 48"
        stroke="#00ffb3" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Corner brackets TR -->
  <path d="M 1152 48 L 1152 80 M 1152 48 L 1120 48"
        stroke="#00ffb3" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Corner brackets BL -->
  <path d="M 648 582 L 648 550 M 648 582 L 680 582"
        stroke="#00ffb3" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Corner brackets BR -->
  <path d="M 1152 582 L 1152 550 M 1152 582 L 1120 582"
        stroke="#00ffb3" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- Camera HUD: top bar -->
  <rect x="640" y="40" width="520" height="44" rx="4" fill="rgba(0,0,0,0.5)"/>
  <circle cx="662" cy="62" r="6" fill="#ff4455" opacity="0.9"/>
  <text x="676" y="67" font-family="'Courier New',monospace" font-size="13" font-weight="700"
        fill="#ff4455" letter-spacing="1">● LIVE</text>
  <text x="1148" y="67" text-anchor="end" font-family="'Courier New',monospace" font-size="13"
        fill="rgba(0,255,179,0.6)" letter-spacing="1">00:42:17</text>

  <!-- City silhouette (stylized buildings) -->
  <g fill="rgba(0,255,179,0.08)" stroke="rgba(0,255,179,0.15)" stroke-width="1">
    <!-- Building 1 -->
    <rect x="660" y="300" width="60" height="250"/>
    <!-- Building 2 -->
    <rect x="730" y="260" width="80" height="290"/>
    <!-- Building 3 (tallest, center) -->
    <rect x="820" y="200" width="70" height="350"/>
    <!-- Antenna on Building 3 -->
    <rect x="852" y="170" width="4" height="35"/>
    <!-- Building 4 -->
    <rect x="900" y="280" width="90" height="270"/>
    <!-- Building 5 -->
    <rect x="1000" y="320" width="60" height="230"/>
    <!-- Building 6 small -->
    <rect x="1070" y="360" width="50" height="190"/>
    <!-- Small buildings front -->
    <rect x="660" y="400" width="40" height="150" fill="rgba(0,255,179,0.12)"/>
    <rect x="710" y="380" width="30" height="170" fill="rgba(0,255,179,0.12)"/>
    <rect x="950" y="390" width="40" height="160" fill="rgba(0,255,179,0.12)"/>
    <rect x="1040" y="410" width="35" height="140" fill="rgba(0,255,179,0.12)"/>
  </g>

  <!-- Ground line -->
  <rect x="640" y="548" width="520" height="1" fill="rgba(0,255,179,0.2)"/>

  <!-- Grid overlay on camera -->
  <g opacity="0.08" stroke="#00ffb3" stroke-width="0.5">
    <line x1="640" y1="210" x2="1160" y2="210"/>
    <line x1="640" y1="315" x2="1160" y2="315"/>
    <line x1="640" y1="420" x2="1160" y2="420"/>
    <line x1="757" y1="84" x2="757" y2="548"/>
    <line x1="900" y1="84" x2="900" y2="548"/>
    <line x1="1043" y1="84" x2="1043" y2="548"/>
  </g>

  <!-- Crosshair (center of camera) -->
  <g filter="url(#glow-soft)">
    <!-- Outer circle -->
    <circle cx="900" cy="315" r="72" fill="none" stroke="rgba(0,255,179,0.35)" stroke-width="1.5"/>
    <!-- Inner circle -->
    <circle cx="900" cy="315" r="28" fill="none" stroke="rgba(0,255,179,0.5)" stroke-width="1.5"/>
    <!-- Center dot -->
    <circle cx="900" cy="315" r="4" fill="#00ffb3" opacity="0.8"/>
    <!-- Cross lines -->
    <line x1="900" y1="237" x2="900" y2="281" stroke="rgba(0,255,179,0.5)" stroke-width="1.5"/>
    <line x1="900" y1="349" x2="900" y2="393" stroke="rgba(0,255,179,0.5)" stroke-width="1.5"/>
    <line x1="822" y1="315" x2="866" y2="315" stroke="rgba(0,255,179,0.5)" stroke-width="1.5"/>
    <line x1="934" y1="315" x2="978" y2="315" stroke="rgba(0,255,179,0.5)" stroke-width="1.5"/>
  </g>

  <!-- Question overlay -->
  <rect x="700" y="450" width="400" height="70" rx="4"
        fill="rgba(7,8,13,0.85)" stroke="rgba(0,255,179,0.3)" stroke-width="1"/>
  <text x="900" y="480" text-anchor="middle" font-family="'Courier New',monospace"
        font-size="15" fill="rgba(0,255,179,0.6)" letter-spacing="2">WO IST DIESE KAMERA?</text>
  <!-- Answer options -->
  <text x="900" y="506" text-anchor="middle" font-family="'Courier New',monospace"
        font-size="14" fill="rgba(200,208,216,0.7)">○ Tokyo  ○ Berlin  ● Sydney  ○ Dubai</text>

  <!-- Vignette on camera -->
  <rect x="640" y="40" width="520" height="550" rx="4" fill="url(#cam-vignette)"/>

  <!-- Camera coordinates bottom -->
  <text x="900" y="575" text-anchor="middle" font-family="'Courier New',monospace"
        font-size="12" fill="rgba(0,255,179,0.3)" letter-spacing="1">48°N 16°E · ALT 312m · ZOOM 1.0x</text>
</svg>`;

// Convert SVG → PNG 1200×630
sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png({ quality: 95, compressionLevel: 8 })
  .toFile('public/og-image.png')
  .then(info => {
    console.log(`✓ og-image.png created — ${(info.size / 1024).toFixed(0)} KB`);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
