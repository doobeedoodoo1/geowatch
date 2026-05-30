// Post-build: Landing page becomes root, React app moves to /play
import { copyFileSync, existsSync } from 'fs';

const distIndex   = 'dist/index.html';
const distPlay    = 'dist/play.html';
const distLanding = 'dist/landing.html';

if (!existsSync(distLanding)) {
  console.error('ERROR: dist/landing.html not found — did the build copy public/?');
  process.exit(1);
}

// 1. React app → play.html
copyFileSync(distIndex, distPlay);
console.log('✓ dist/index.html  →  dist/play.html');

// 2. Landing page → index.html (serves at /)
copyFileSync(distLanding, distIndex);
console.log('✓ dist/landing.html  →  dist/index.html');

console.log('✓ Post-build complete — landing page now at /');
