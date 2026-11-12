# Android APK (fully offline)

A GitHub Actions workflow builds a standalone, full-screen Android APK from this
repository on **every commit**. The APK contains the app, all JavaScript/CSS
libraries and all fonts, so it works with no internet connection at all.

## Download and install

After the workflow succeeds, use either:

- **Direct link (default branch):**
  [KPK-Tekedar.apk](https://github.com/yasinULLAH/takaMobileApp/releases/download/apk-latest/KPK-Tekedar.apk)
- **Actions → Build Android APK → latest run → Artifacts → `KPK-Tekedar-APK`**

On your phone, open the link, download the APK and tap it. Android will ask you
to allow installing from your browser/file manager ("Install unknown apps").

> The APK is signed with the committed key in `android-signing/`. Keep that key,
> because Android only installs updates over an existing app when the signing key
> is the same. Data is kept when you install a newer APK over the old one.

## What the workflow does

`.github/workflows/android-apk.yml`:

1. Checks out the repository and installs Node.js 22, Java 21 and Android SDK 36.
2. `npm run build:web` — creates a self-contained `www/` folder:
   - downloads every remote `<script>` and stylesheet used by `index.html`;
   - downloads the Google Fonts files and every font referenced by Font Awesome;
   - rewrites all URLs to local files;
   - removes the PWA service-worker registration (not needed inside an APK).
3. `npx cap add android` — generates a fresh Capacitor Android project.
4. `npx cap sync android` — copies the offline web bundle into the APK.
5. `npm run configure:android` — applies the native settings:
   - immersive **full-screen** mode (status and navigation bars hidden);
   - portrait orientation, display-cutout support, `adjustResize` for the keyboard;
   - release signing, `versionCode` from the commit count;
   - `MainActivity` additions: save exports to Downloads, Android print dialog,
     open WhatsApp/LinkedIn links outside the app, keep the app alive on Back.
6. Generates the launcher icon and splash screen from `icon-512.png`.
7. Builds and signs the release APK with Gradle.
8. Uploads the APK as a build artifact and updates the `apk-latest` release.

If you add a new CDN `<script>`/stylesheet to `index.html`, the build picks it up
automatically — no workflow changes needed. The build fails if anything that is
loaded at runtime still points at the internet.

## Inside the app

| Feature | Behaviour in the APK |
| --- | --- |
| Data storage | Local to the app (`localStorage`), exactly like the website. No server needed. |
| CSV / Excel / PDF / PNG exports | Saved to your phone's **Downloads** folder. |
| Print preview | Opens the Android print dialog (can also "Save as PDF"). |
| JSON backup / restore | Works; download goes to Downloads. |
| WhatsApp share button | Opens the WhatsApp app (internet needed only for that action). |
| Logo upload (Settings) | Works offline: the logo is stored on the device and applied to the header/favicon. |
| App updates | Download the new APK and install it over the old one — data is preserved. |

> The data is tied to the app installation. If you uninstall the app or clear its
> storage, the local database is deleted. Use **Settings → Backup** regularly.
> To move existing website/PWA data into the APK, export a backup on the website
> and restore it in the APK.

## Changing app identity

| What | Where |
| --- | --- |
| App name shown on the phone | `scripts/configure-android.mjs` (`KPK Tekedar`) |
| Package ID | `capacitor.config.json` → `appId` (**do not change after installing**) |
| Icon / splash source | `icon-512.png` (re-run the workflow) |
| Orientation | `scripts/configure-android.mjs` (`screenOrientation`) |
| Full screen on/off | `capacitor.config.json` → `plugins.SystemBars.hidden` |

## Signing

The workflow uses `android-signing/taka-release.jks` by default so that builds are
installable over each other. See `android-signing/README.md` for using private
GitHub secrets instead.

## Troubleshooting

- **"App not installed"** — an APK signed with a different key is already
  installed. Uninstall the old app (this deletes its data) and install again.
- **Play Protect warning** — normal for sideloaded apps. Tap "Install anyway".
- **Build failed downloading a CDN file** — a CDN was temporarily unavailable or
  a pinned library URL changed. Re-run the workflow; update the URL in
  `index.html` if that library version was removed.
- **APK does not appear** — the workflow only publishes the release for the
  default branch; other branches still produce an Actions artifact.
