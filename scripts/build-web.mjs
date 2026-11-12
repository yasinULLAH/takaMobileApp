#!/usr/bin/env node
/**
 * Builds a fully self-contained copy of the app in ./www for the Android (Capacitor) build.
 *
 * Everything the app needs at runtime is downloaded once during the build and rewritten to
 * local paths, so the installed APK never needs an internet connection:
 *   - every remote <script src> and <link rel="stylesheet"> in index.html
 *   - every font/image referenced from those stylesheets (including Google Fonts)
 *
 * The service worker registration is removed because the assets live inside the APK and
 * there is no remote origin to revalidate against.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'www');
const MOBILE = path.join(ROOT, 'mobile');

const CORE_FILES = [
  'index.html',
  'manifest.json',
  'offline.html',
  'logo.png',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'icon-72.png',
  'icon-96.png',
  'icon-128.png',
  'icon-144.png',
  'icon-152.png',
  'icon-192.png',
  'icon-384.png',
  'icon-512.png',
];

// A current desktop Chrome UA makes Google Fonts serve woff2 instead of legacy formats.
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const fetched = new Map(); // remote URL -> local absolute path
const cssJobs = []; // { url, local }

function log(...args) {
  console.log('[build-web]', ...args);
}

function fail(message) {
  console.error(`[build-web] ERROR: ${message}`);
  process.exit(1);
}

function shortHash(value) {
  return createHash('sha1').update(value).digest('hex').slice(0, 8);
}

/** Keep generated files inside www/ and make filenames filesystem-safe. */
function safeSegments(pathname) {
  return pathname
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .map((part) => part.replace(/[<>:"|?*\\]/g, '_'));
}

/**
 * Deterministic local path for a remote asset, e.g.
 * https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js
 *   -> www/vendor/cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js
 */
function localPathForUrl(remoteUrl, extension) {
  const url = new URL(remoteUrl);
  const segments = safeSegments(decodeURIComponent(url.pathname));
  let filename = segments.pop() || 'index';

  if (url.search) {
    const ext = path.extname(filename);
    const base = ext ? filename.slice(0, -ext.length) : filename;
    filename = `${base}-${shortHash(url.search)}${ext}`;
  }

  if (extension && path.extname(filename).toLowerCase() !== extension) {
    filename += extension;
  }

  const host = `${url.hostname}${url.port ? `_${url.port}` : ''}`;
  const dir = path.join(OUT, 'vendor', ...safeSegments(host));

  const target = path.join(dir, ...segments, filename);
  const relative = path.relative(OUT, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside www/: ${target}`);
  }
  return target;
}

function toPosixRelative(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

async function download(remoteUrl, localFile, attempt = 1) {
  const accept = localFile.endsWith('.css')
    ? 'text/css,*/*;q=0.1'
    : localFile.endsWith('.js')
      ? 'application/javascript,*/*;q=0.1'
      : '*/*';

  try {
    const response = await fetch(remoteUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT, Accept: accept },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) throw new Error('empty response');
    await fs.mkdir(path.dirname(localFile), { recursive: true });
    await fs.writeFile(localFile, buffer);
    return buffer;
  } catch (error) {
    if (attempt < 3) {
      log(`retry ${attempt} for ${remoteUrl} (${error.message})`);
      return download(remoteUrl, localFile, attempt + 1);
    }
    throw new Error(`Could not download ${remoteUrl}: ${error.message}`);
  }
}

async function registerDownload(remoteUrl, extension, kind) {
  if (fetched.has(remoteUrl)) return fetched.get(remoteUrl);
  const localFile = localPathForUrl(remoteUrl, extension);
  fetched.set(remoteUrl, localFile);
  log(`download ${remoteUrl}`);
  await download(remoteUrl, localFile);
  if (kind === 'css') cssJobs.push({ url: remoteUrl, local: localFile });
  return localFile;
}

async function mapLimit(items, limit, worker) {
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await worker(current);
    }
  });
  await Promise.all(runners);
}

async function localizeCss(job) {
  const seen = new Set();
  let css = await fs.readFile(job.local, 'utf8');
  const replacements = [];

  // Matches url(...) in both plain and quoted form. data:, blob:, #fragment are kept as-is.
  const urlPattern = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
  for (const match of css.matchAll(urlPattern)) {
    const reference = match[2].trim();
    if (/^(data:|blob:|#|about:|javascript:)/i.test(reference)) continue;

    let absolute;
    try {
      absolute = new URL(reference, job.url).href;
    } catch {
      continue;
    }
    if (!/^https?:/i.test(absolute)) continue;

    const isCssImport = /\.css(?:[?#]|$)/i.test(absolute);
    const localFile = await registerDownload(absolute, isCssImport ? '.css' : null, isCssImport ? 'css' : 'asset');
    if (seen.has(match[0])) continue;
    seen.add(match[0]);
    replacements.push([match[0], `url("${toPosixRelative(job.local, localFile)}")`]);
  }

  for (const [from, to] of replacements) {
    css = css.split(from).join(to);
  }
  await fs.writeFile(job.local, css, 'utf8');
  log(`localized ${path.relative(ROOT, job.local)} (${replacements.length} references)`);
}

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;');
}

const NATIVE_CSS = `
/* --- injected by scripts/build-web.mjs for the installable Android app --- */
.theme-header {
  padding-top: calc(var(--safe-area-inset-top, env(safe-area-inset-top, 0px)) + 0.625rem) !important;
}
#main-app-nav {
  padding-bottom: calc(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 0.375rem) !important;
}
#auth-view {
  padding-top: calc(var(--safe-area-inset-top, env(safe-area-inset-top, 0px)) + 0.75rem) !important;
  padding-bottom: calc(var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 0.75rem) !important;
}
html, body { overscroll-behavior-y: contain; }
`;

async function main() {
  log('cleaning www/');
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  // 1. Copy the static app shell.
  for (const file of CORE_FILES) {
    const source = path.join(ROOT, file);
    try {
      await fs.copyFile(source, path.join(OUT, file));
    } catch (error) {
      if (file === 'index.html') fail(`missing ${file}`);
      log(`skipped optional file ${file} (${error.code || error.message})`);
    }
  }

  // Native-side JS shim (downloads, printing, external links, offline logo upload).
  await fs.copyFile(path.join(MOBILE, 'native.js'), path.join(OUT, 'native-bridge.js'));

  // 2. Find every remote script / stylesheet referenced by index.html.
  const indexPath = path.join(OUT, 'index.html');
  let html = await fs.readFile(indexPath, 'utf8');

  const decodeUrl = (value) => value.replace(/&amp;/g, '&').trim();
  const scriptUrls = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>/gi)].map((m) => decodeUrl(m[1]));
  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const stylesheetUrls = [];
  const preloadUrls = [];
  for (const tag of linkTags) {
    const rel = /\brel\s*=\s*["']([^"']+)["']/i.exec(tag);
    const href = /\bhref\s*=\s*["'](https?:\/\/[^"']+)["']/i.exec(tag);
    if (!rel || !href) continue;
    const relations = rel[1].toLowerCase().split(/\s+/);
    if (relations.includes('stylesheet')) stylesheetUrls.push(decodeUrl(href[1]));
    if (relations.includes('preload') && !relations.includes('preconnect')) preloadUrls.push(decodeUrl(href[1]));
  }

  const jobs = [
    ...scriptUrls.map((url) => registerDownload(url, '.js', 'js')),
    ...stylesheetUrls.map((url) => registerDownload(url, '.css', 'css')),
    ...preloadUrls.map((url) => registerDownload(url, path.extname(new URL(url).pathname) || null, 'asset')),
  ];
  await Promise.all(jobs);

  // 3. Localize url() references inside every downloaded stylesheet (fonts, icons, ...).
  //    Newly discovered stylesheets (e.g. @import) get appended to cssJobs while iterating.
  for (let i = 0; i < cssJobs.length; i += 1) {
    await localizeCss(cssJobs[i]);
  }

  // 4. Rewrite the HTML to use the local files.
  for (const [remoteUrl, localFile] of fetched) {
    const relative = toPosixRelative(indexPath, localFile);
    html = html.split(remoteUrl).join(relative);
    html = html.split(escapeAttribute(remoteUrl)).join(relative);
  }

  // 5. Trim network-only markup and inject the native shim.
  html = html.replace(/<link\b[^>]*\brel\s*=\s*["']preconnect["'][^>]*>\s*/gi, '');
  html = html.replace(/<link\b[^>]*\brel\s*=\s*["']dns-prefetch["'][^>]*>\s*/gi, '');
  html = html.replace(/<script\b[^>]*\bsrc\s*=\s*["']\.?\/?pwa-register\.js["'][^>]*>\s*<\/script>\s*/gi, '');

  if (!html.includes('</head>')) fail('index.html has no </head>; cannot inject native shim');
  html = html.replace(
    '</head>',
    `    <link href="native-bridge.js" rel="preload" as="script"/>\n    <script src="native-bridge.js"></script>\n    <style id="native-shell-css">${NATIVE_CSS}</style>\n</head>`,
  );

  await fs.writeFile(indexPath, html, 'utf8');

  // 6. Sanity check: nothing that is fetched at runtime may still point at the internet.
  const remaining = [
    ...html.matchAll(/<(?:script|img)\b[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)["']/gi),
    ...html.matchAll(/<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*\bhref\s*=\s*["'](https?:\/\/[^"']+)["']/gi),
  ].map((m) => m[1]);

  if (remaining.length > 0) {
    fail(`index.html still loads remote assets:\n  ${[...new Set(remaining)].join('\n  ')}`);
  }

  const totalFiles = (await countFiles(OUT)).files;
  const totalBytes = (await countFiles(OUT)).bytes;
  log(`done: ${totalFiles} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MB in www/`);
  log('all runtime assets are bundled; the APK works with no internet connection');
}

async function countFiles(dir) {
  let files = 0;
  let bytes = 0;
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await countFiles(full);
      files += nested.files;
      bytes += nested.bytes;
    } else {
      files += 1;
      bytes += (await fs.stat(full)).size;
    }
  }
  return { files, bytes };
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
