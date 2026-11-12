#!/usr/bin/env node
/**
 * Creates the source image used by @capacitor/assets (launcher icon + splash screens).
 * The source artwork is the existing PWA icon-512.png, so the APK matches the website.
 *
 * Only `logo.png` is produced on purpose: @capacitor/assets then runs in its
 * "Easy Mode" and generates the adaptive icon, the legacy icons and both splash
 * screens (light/dark) from this single file, scaling the logo correctly for
 * every screen density.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'icon-512.png');
const ASSETS = path.join(ROOT, 'assets');

async function main() {
  await fs.mkdir(ASSETS, { recursive: true });

  // 1024x1024 transparent logo. @capacitor/assets adds the navy background and
  // the adaptive-icon safe-zone padding itself.
  await sharp(SOURCE)
    .resize(1024, 1024, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(ASSETS, 'logo.png'));

  console.log('[build-icons] wrote assets/logo.png');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
