#!/usr/bin/env node
/**
 * Applies the native customisations to the freshly generated Capacitor Android project.
 *
 * `npx cap add android` regenerates android/ from a template, so everything that must
 * survive a fresh checkout is applied here (and only here).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ANDROID = path.join(ROOT, 'android');
const MOBILE = path.join(ROOT, 'mobile');
const APP = path.join(ANDROID, 'app');

function log(message) {
  console.log('[configure-android]', message);
}

function fail(message) {
  console.error(`[configure-android] ERROR: ${message}`);
  process.exit(1);
}

function ensure(condition, message) {
  if (!condition) fail(message);
}

function replaceOnce(content, search, replacement, label) {
  if (!content.includes(search)) {
    fail(`could not find ${label}. The Capacitor template may have changed.`);
  }
  return content.replace(search, replacement);
}

async function main() {
  await fs.access(ANDROID).catch(() => fail('android/ does not exist. Run `npx cap add android` first.'));

  const config = JSON.parse(await fs.readFile(path.join(ROOT, 'capacitor.config.json'), 'utf8'));
  const appId = config.appId;
  ensure(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(appId), `invalid appId "${appId}"`);

  // -------------------------------------------------------------------------
  // MainActivity: full screen, downloads, printing, external links, back button
  // -------------------------------------------------------------------------
  const javaDir = path.join(APP, 'src', 'main', 'java', ...appId.split('.'));
  await fs.mkdir(javaDir, { recursive: true });
  const activityTemplate = await fs.readFile(path.join(MOBILE, 'android', 'MainActivity.java'), 'utf8');
  await fs.writeFile(path.join(javaDir, 'MainActivity.java'), activityTemplate.replaceAll('__PACKAGE_NAME__', appId));
  log('installed MainActivity.java');

  // -------------------------------------------------------------------------
  // strings.xml
  // -------------------------------------------------------------------------
  const stringsPath = path.join(APP, 'src', 'main', 'res', 'values', 'strings.xml');
  let strings = await fs.readFile(stringsPath, 'utf8');
  strings = strings.replace(
    /<string name="app_name">[\s\S]*?<\/string>/,
    '<string name="app_name">KPK Tekedar</string>'
  );
  strings = strings.replace(
    /<string name="title_activity_main">[\s\S]*?<\/string>/,
    '<string name="title_activity_main">KPK Tekedar</string>'
  );
  strings = strings.replace(
    /<string name="package_name">[\s\S]*?<\/string>/,
    `<string name="package_name">${appId}</string>`
  );
  strings = strings.replace(
    /<string name="custom_url_scheme">[\s\S]*?<\/string>/,
    `<string name="custom_url_scheme">${appId}</string>`
  );
  await fs.writeFile(stringsPath, strings);
  log('updated strings.xml');

  // -------------------------------------------------------------------------
  // AndroidManifest.xml
  // -------------------------------------------------------------------------
  const manifestPath = path.join(APP, 'src', 'main', 'AndroidManifest.xml');
  let manifest = await fs.readFile(manifestPath, 'utf8');

  if (!manifest.includes('android:largeHeap="true"')) {
    manifest = replaceOnce(manifest, '<application\n', '<application\n        android:largeHeap="true"\n', 'application tag');
  }
  if (!manifest.includes('android:usesCleartextTraffic')) {
    manifest = replaceOnce(
      manifest,
      '<application\n',
      '<application\n        android:usesCleartextTraffic="false"\n',
      'application tag'
    );
  }
  if (!manifest.includes('android:screenOrientation')) {
    const activityPattern = /(<activity\b[\s\S]*?android:name="\.MainActivity")/;
    ensure(activityPattern.test(manifest), 'MainActivity entry in AndroidManifest.xml');
    manifest = manifest.replace(
      activityPattern,
      '$1\n            android:screenOrientation="portrait"\n            android:windowSoftInputMode="adjustResize"'
    );
  }
  if (!manifest.includes('WRITE_EXTERNAL_STORAGE')) {
    manifest = replaceOnce(
      manifest,
      '</manifest>',
      '    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />\n</manifest>',
      '</manifest>'
    );
  }
  await fs.writeFile(manifestPath, manifest);
  log('patched AndroidManifest.xml');

  // -------------------------------------------------------------------------
  // styles.xml: use the whole screen, including display cutouts
  // -------------------------------------------------------------------------
  const stylesPath = path.join(APP, 'src', 'main', 'res', 'values', 'styles.xml');
  let styles = await fs.readFile(stylesPath, 'utf8');
  if (!styles.includes('windowLayoutInDisplayCutoutMode')) {
    styles = replaceOnce(
      styles,
      '<style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">',
      '<style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">\n        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>',
      'AppTheme.NoActionBar style'
    );
  }
  await fs.writeFile(stylesPath, styles);
  log('patched styles.xml');

  // -------------------------------------------------------------------------
  // app/build.gradle: version numbers + stable release signing
  // -------------------------------------------------------------------------
  const gradlePath = path.join(APP, 'build.gradle');
  let gradle = await fs.readFile(gradlePath, 'utf8');

  let versionCode = process.env.APP_VERSION_CODE || '';
  let versionName = process.env.APP_VERSION_NAME || '';
  if (!versionCode) {
    try {
      versionCode = String(Math.max(1, Number(execSync('git rev-list --count HEAD', { cwd: ROOT }).toString().trim()) || 1));
    } catch {
      versionCode = '1';
    }
  }
  if (!versionName) versionName = `1.0.${versionCode}`;
  ensure(/^\d+$/.test(versionCode), `invalid version code "${versionCode}"`);

  if (!gradle.includes('buildToolsVersion')) {
    gradle = gradle.replace(
      'compileSdk = rootProject.ext.compileSdkVersion',
      'compileSdk = rootProject.ext.compileSdkVersion\n    buildToolsVersion = "36.0.0"'
    );
  }

  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  gradle = gradle.replace(/versionName\s+["'][^"']*["']/, `versionName "${versionName}"`);

  if (!gradle.includes('keystoreProperties')) {
    gradle = replaceOnce(
      gradle,
      'android {',
      `def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file("../android-signing/keystore.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {`,
      'android block'
    );

    gradle = replaceOnce(
      gradle,
      `    namespace = "${appId}"`,
      `    namespace = "${appId}"

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists() && keystoreProperties['storeFile']) {
                storeFile rootProject.file("../android-signing/" + keystoreProperties['storeFile'])
                storeType keystoreProperties['storeType'] ?: 'PKCS12'
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }`,
      'namespace line'
    );

    gradle = replaceOnce(
      gradle,
      '        release {\n            minifyEnabled false',
      `        release {
            if (keystorePropertiesFile.exists() && keystoreProperties['storeFile']) {
                signingConfig signingConfigs.release
            }
            minifyEnabled false
            shrinkResources false`,
      'release build type'
    );
  }

  await fs.writeFile(gradlePath, gradle);
  log(`patched app/build.gradle (versionCode ${versionCode}, versionName ${versionName})`);

  // -------------------------------------------------------------------------
  // gradle.properties: a little more memory for D8/R8 on CI
  // -------------------------------------------------------------------------
  const gradlePropertiesPath = path.join(ANDROID, 'gradle.properties');
  let gradleProperties = await fs.readFile(gradlePropertiesPath, 'utf8');
  gradleProperties = gradleProperties.replace(/org\.gradle\.jvmargs=.*/, 'org.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8');
  await fs.writeFile(gradlePropertiesPath, gradleProperties);
  log('patched gradle.properties');

  log('done');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
