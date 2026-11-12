package __PACKAGE_NAME__;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Native shell for the KPK Tekedar app.
 *
 * Adds what a WebView cannot do by itself:
 *  - immersive full screen
 *  - saving PDF / Excel / CSV / PNG exports and JSON backups into the Downloads folder
 *  - the Android print dialog for the app's print preview
 *  - opening WhatsApp / browser links outside the app
 *  - predictable hardware-back behaviour (keep the app alive in the background)
 */
public class MainActivity extends BridgeActivity {

    private static final int STORAGE_PERMISSION_REQUEST = 4101;

    private static class PendingFile {

        final File tempFile;
        final String name;
        final String mime;

        PendingFile(File tempFile, String name, String mime) {
            this.tempFile = tempFile;
            this.name = name;
            this.mime = mime;
        }
    }

    private final Map<String, PendingFile> pendingFiles = new HashMap<>();

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.addJavascriptInterface(new NativeBridge(), "AndroidBridge");

            // Fallback for plain http(s) file links (the app normally uses blob: URLs,
            // which are handled by native.js through the bridge above).
            webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    openExternal(url);
                }
            });
        }

        configureFullscreen();

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView current = getBridge() != null ? getBridge().getWebView() : null;
                if (current != null && current.canGoBack()) {
                    current.goBack();
                } else {
                    // Keep the app (and its localStorage database) in memory instead of
                    // destroying the activity. Swipe the app away to really close it.
                    moveTaskToBack(true);
                }
            }
        });

        requestLegacyStoragePermission();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            configureFullscreen();
        }
    }

    private void configureFullscreen() {
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }

    private void requestLegacyStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) return;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
            return;
        }
        ActivityCompat.requestPermissions(this, new String[] { Manifest.permission.WRITE_EXTERNAL_STORAGE }, STORAGE_PERMISSION_REQUEST);
    }

    private void toast(final String message) {
        runOnUiThread(() -> Toast.makeText(getApplicationContext(), message, Toast.LENGTH_LONG).show());
    }

    private void openExternal(final String url) {
        if (url == null) return;
        final String value = url.trim();
        if (!(value.startsWith("http://") || value.startsWith("https://") || value.startsWith("mailto:") || value.startsWith("tel:") || value.startsWith("sms:"))) {
            return;
        }
        runOnUiThread(() -> {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(value));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception ignored) {
                toast("No app can open this link");
            }
        });
    }

    private static String sanitizeFileName(String name) {
        String clean = name == null ? "" : name.replaceAll("[\\\\/:*?\"<>|\\r\\n]+", "_").trim();
        if (clean.isEmpty()) clean = "download";
        if (clean.length() > 120) {
            String extension = "";
            int dot = clean.lastIndexOf('.');
            if (dot > 0 && clean.length() - dot <= 10) {
                extension = clean.substring(dot);
                clean = clean.substring(0, dot);
            }
            clean = clean.substring(0, Math.max(1, 120 - extension.length())) + extension;
        }
        return clean;
    }

    private String saveToDownloads(File source, String name, String mime) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentResolver resolver = getContentResolver();
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, name);
            values.put(MediaStore.Downloads.MIME_TYPE, mime);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            values.put(MediaStore.Downloads.IS_PENDING, 1);

            Uri uri = null;
            try {
                uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri == null) return null;

                try (InputStream in = new FileInputStream(source); OutputStream out = resolver.openOutputStream(uri)) {
                    if (out == null) throw new IOException("No output stream");
                    copy(in, out);
                }

                values.clear();
                values.put(MediaStore.Downloads.IS_PENDING, 0);
                resolver.update(uri, values, null, null);
                return "Downloads/" + name;
            } catch (Exception error) {
                if (uri != null) {
                    try {
                        resolver.delete(uri, null, null);
                    } catch (Exception ignored) {
                        /* ignore */
                    }
                }
                return null;
            }
        }

        boolean canWritePublic =
            ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        File directory = canWritePublic
            ? Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            : getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);

        if (directory == null) return null;
        if (!directory.exists() && !directory.mkdirs()) return null;

        File destination = uniqueFile(directory, name);
        try (FileInputStream in = new FileInputStream(source); FileOutputStream out = new FileOutputStream(destination)) {
            copy(in, out);
        } catch (Exception error) {
            return null;
        }

        if (canWritePublic) {
            MediaScannerConnection.scanFile(this, new String[] { destination.getAbsolutePath() }, new String[] { mime }, null);
            return "Downloads/" + destination.getName();
        }
        return destination.getAbsolutePath();
    }

    private static File uniqueFile(File directory, String name) {
        File candidate = new File(directory, name);
        if (!candidate.exists()) return candidate;

        String base = name;
        String extension = "";
        int dot = name.lastIndexOf('.');
        if (dot > 0) {
            base = name.substring(0, dot);
            extension = name.substring(dot);
        }
        for (int i = 1; i < 1000; i += 1) {
            candidate = new File(directory, base + " (" + i + ")" + extension);
            if (!candidate.exists()) return candidate;
        }
        return new File(directory, base + "-" + System.currentTimeMillis() + extension);
    }

    private static void copy(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[16 * 1024];
        int read;
        while ((read = in.read(buffer)) > 0) {
            out.write(buffer, 0, read);
        }
        out.flush();
    }

    /** API exposed to mobile/native.js as window.AndroidBridge. */
    public class NativeBridge {

        @JavascriptInterface
        public String beginFile(String fileName, String mimeType) {
            try {
                File directory = new File(getCacheDir(), "native-downloads");
                if (!directory.exists() && !directory.mkdirs()) return "";

                String token = UUID.randomUUID().toString();
                File temp = new File(directory, token + ".part");
                if (!temp.createNewFile()) return "";

                String name = sanitizeFileName(fileName);
                String mime = mimeType == null || mimeType.isEmpty() ? "application/octet-stream" : mimeType;
                synchronized (pendingFiles) {
                    pendingFiles.put(token, new PendingFile(temp, name, mime));
                }
                return token;
            } catch (Exception error) {
                return "";
            }
        }

        @JavascriptInterface
        public boolean appendChunk(String token, String base64Chunk) {
            PendingFile pending;
            synchronized (pendingFiles) {
                pending = pendingFiles.get(token);
            }
            if (pending == null || base64Chunk == null || base64Chunk.isEmpty()) return false;

            byte[] bytes;
            try {
                bytes = Base64.decode(base64Chunk, Base64.DEFAULT);
            } catch (IllegalArgumentException error) {
                return false;
            }

            try (FileOutputStream out = new FileOutputStream(pending.tempFile, true)) {
                out.write(bytes);
                return true;
            } catch (Exception error) {
                return false;
            }
        }

        @JavascriptInterface
        public void endFile(String token) {
            PendingFile pending;
            synchronized (pendingFiles) {
                pending = pendingFiles.remove(token);
            }
            if (pending == null) return;

            try {
                if (!pending.tempFile.exists() || pending.tempFile.length() == 0) {
                    toast("Could not save the file: it is empty");
                    return;
                }
                String location = saveToDownloads(pending.tempFile, pending.name, pending.mime);
                toast(location != null ? "Saved: " + location : "Could not save the file");
            } finally {
                //noinspection ResultOfMethodCallIgnored
                pending.tempFile.delete();
            }
        }

        @JavascriptInterface
        public void abortFile(String token) {
            PendingFile pending;
            synchronized (pendingFiles) {
                pending = pendingFiles.remove(token);
            }
            if (pending != null) {
                //noinspection ResultOfMethodCallIgnored
                pending.tempFile.delete();
            }
        }

        @JavascriptInterface
        public void printPage() {
            runOnUiThread(() -> {
                try {
                    WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                    if (webView == null) return;

                    PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
                    String jobName = getString(R.string.app_name) + " document";
                    PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(jobName);
                    printManager.print(jobName, adapter, new PrintAttributes.Builder().build());
                } catch (Exception error) {
                    toast("Printing is not available on this device");
                }
            });
        }

        @JavascriptInterface
        public void openExternal(String url) {
            MainActivity.this.openExternal(url);
        }
    }
}
