# Android signing key

`taka-release.jks` is the self-signed key used to sign the APK produced by the
GitHub Actions workflow.

Why is it in the repository? An Android update is only accepted when the new APK
is signed with the same key as the installed one. If every CI run created a new
key, you would have to uninstall the app (and lose all local data) before every
update. Committing the key makes builds reproducible and update-friendly.

## Security

This key is public because this repository is public. It is fine for a personal
app that you install yourself: somebody would need to get you to install their
malicious APK for the key to matter.

If you want the key to stay private:

1. Delete this folder.
2. Generate a keystore once and keep a backup.
3. Add these repository secrets (Settings → Secrets and variables → Actions):
   - `ANDROID_KEYSTORE_BASE64` — base64 of the `.jks` file
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS`
   - `ANDROID_KEY_PASSWORD`

The workflow automatically uses those secrets instead of the committed key when
they are present.

## Changing the key

Never change it after installing the app on your phone unless you are ready to
uninstall the old app first. The app's data lives in the WebView's local storage,
so uninstalling removes it. Export a backup from the app before reinstalling.
