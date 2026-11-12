/*
 * Native (Capacitor Android) compatibility shim.
 *
 * Injected into the built www/index.html only. It is a no-op in a normal browser
 * because window.AndroidBridge does not exist there.
 *
 * Responsibilities:
 *  - save blob:/data: downloads (CSV, Excel, PDF, PNG, JSON backup) into Android Downloads
 *  - route window.print() to the Android print dialog
 *  - open WhatsApp / external links in the matching app instead of inside the WebView
 *  - keep the "upload logo" setting working offline by storing the logo in localStorage
 */
(function () {
  'use strict';

  var bridge = window.AndroidBridge;
  if (!bridge) return;

  var LOGO_KEY = 'KPK_TEKEDAR_APP_LOGO_V1';

  /*
   * The app revokes a blob URL immediately after clicking the download link, but the
   * save handler reads the blob asynchronously. Postpone the revoke so the export is
   * not destroyed before it has been read.
   */
  try {
    var nativeRevokeObjectURL = URL.revokeObjectURL;
    URL.revokeObjectURL = function (url) {
      setTimeout(function () {
        nativeRevokeObjectURL.call(URL, url);
      }, 30000);
    };
  } catch (error) {
    /* ignore */
  }

  function isExternalUrl(value) {
    if (!value) return false;
    var text = String(value).trim();
    if (text.indexOf('//') === 0) text = 'https:' + text;
    if (/^https?:/i.test(text)) {
      try {
        var parsed = new URL(text, window.location.href);
        var host = parsed.hostname;
        return host !== 'localhost' && host !== '127.0.0.1' && host !== '::1';
      } catch (error) {
        return true;
      }
    }
    return /^(mailto|tel|sms|whatsapp):/i.test(text);
  }

  // ---------------------------------------------------------------------------
  // Open external links outside the WebView (WhatsApp, LinkedIn, ...)
  // ---------------------------------------------------------------------------
  var originalOpen = window.open;
  window.open = function (url, target, features) {
    if (url && isExternalUrl(url)) {
      try {
        bridge.openExternal(String(url));
      } catch (error) {
        /* ignore */
      }
      return null;
    }

    /*
     * DataTables' Print button calls window.open('', '_blank'), writes markup into the
     * new window and then calls print(). The WebView cannot create child windows, so a
     * tiny stub is returned: printing it prints the current page (the app already has
     * @media print rules that hide navigation and show the report).
     */
    var noop = function () {};
    var stub = {
      document: {
        write: noop,
        writeln: noop,
        open: noop,
        close: noop,
        createElement: function () {
          return { style: {}, setAttribute: noop, appendChild: noop };
        },
        head: { appendChild: noop },
        body: { appendChild: noop, removeChild: noop },
        documentElement: {},
        getElementById: function () {
          return null;
        },
        querySelector: function () {
          return null;
        },
        querySelectorAll: function () {
          return [];
        },
        addEventListener: noop
      },
      focus: noop,
      blur: noop,
      close: noop,
      print: function () {
        window.print();
      },
      addEventListener: noop,
      removeEventListener: noop,
      location: { href: url || 'about:blank', replace: noop },
      opener: null
    };
    return stub;
  };

  document.addEventListener(
    'click',
    function (event) {
      var target = event.target;
      var anchor = target && target.closest ? target.closest('a[href]') : null;
      if (!anchor) return;
      var href = anchor.getAttribute('href') || '';
      if (href && isExternalUrl(href)) {
        event.preventDefault();
        try {
          bridge.openExternal(anchor.href);
        } catch (error) {
          /* ignore */
        }
      }
    },
    true
  );

  // ---------------------------------------------------------------------------
  // Printing
  // ---------------------------------------------------------------------------
  try {
    window.print = function () {
      try {
        bridge.printPage();
      } catch (error) {
        /* ignore */
      }
    };
  } catch (error) {
    /* ignore */
  }

  // ---------------------------------------------------------------------------
  // File downloads (blob: and data: URLs)
  // ---------------------------------------------------------------------------
  function sanitizeFileName(name) {
    var clean = String(name || 'download')
      .replace(/[\\/:*?"<>|\r\n]+/g, '_')
      .replace(/^\s+|\s+$/g, '')
      .slice(0, 120);
    return clean || 'download';
  }

  function saveBlob(blob, fileName) {
    var chunkSize = 512 * 1024;
    var token;

    try {
      token = bridge.beginFile(sanitizeFileName(fileName), blob.type || 'application/octet-stream');
    } catch (error) {
      return Promise.reject(error);
    }
    if (!token) return Promise.reject(new Error('Could not open the destination file'));

    return new Promise(function (resolve, reject) {
      function readFrom(offset) {
        if (offset >= blob.size) {
          try {
            bridge.endFile(token);
            resolve();
          } catch (error) {
            reject(error);
          }
          return;
        }

        var slice = blob.slice(offset, Math.min(offset + chunkSize, blob.size));
        var reader = new FileReader();

        reader.onload = function () {
          var result = String(reader.result || '');
          var comma = result.indexOf(',');
          var base64 = comma >= 0 ? result.slice(comma + 1) : '';

          try {
            bridge.appendChunk(token, base64);
          } catch (error) {
            try {
              bridge.abortFile(token);
            } catch (ignored) {
              /* ignore */
            }
            reject(error);
            return;
          }
          readFrom(offset + chunkSize);
        };

        reader.onerror = function () {
          try {
            bridge.abortFile(token);
          } catch (ignored) {
            /* ignore */
          }
          reject(reader.error || new Error('Could not read the file'));
        };

        reader.readAsDataURL(slice);
      }

      readFrom(0);
    });
  }

  document.addEventListener(
    'click',
    function (event) {
      var target = event.target;
      var anchor = target && target.closest ? target.closest('a[download]') : null;
      if (!anchor) return;

      var href = anchor.getAttribute('href') || '';
      if (!/^(blob:|data:)/i.test(href)) return;

      event.preventDefault();
      event.stopPropagation();

      var fileName = anchor.getAttribute('download') || 'download';
      fetch(href)
        .then(function (response) {
          return response.blob();
        })
        .then(function (blob) {
          return saveBlob(blob, fileName);
        })
        .catch(function () {
          /* the native side shows an error toast */
        });
    },
    true
  );

  // ---------------------------------------------------------------------------
  // Offline app-logo upload (replaces the PHP endpoint used on the website)
  // ---------------------------------------------------------------------------
  function applyLogo(dataUrl) {
    var images = document.querySelectorAll('.app-logo-img');
    for (var i = 0; i < images.length; i += 1) {
      if (images[i].src !== dataUrl) images[i].src = dataUrl;
    }

    var favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = dataUrl;

    var appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleIcon) appleIcon.href = dataUrl;
  }

  function readStoredLogo() {
    try {
      return localStorage.getItem(LOGO_KEY);
    } catch (error) {
      return null;
    }
  }

  function restoreLogo() {
    var stored = readStoredLogo();
    if (stored) applyLogo(stored);
  }

  function resizeLogo(file) {
    return new Promise(function (resolve, reject) {
      var objectUrl = URL.createObjectURL(file);
      var image = new Image();

      image.onload = function () {
        URL.revokeObjectURL(objectUrl);
        var maxSide = 512;
        var scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        var width = Math.max(1, Math.round(image.width * scale));
        var height = Math.max(1, Math.round(image.height * scale));

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };

      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not read the selected image'));
      };

      image.src = objectUrl;
    });
  }

  var originalFetch = window.fetch;
  if (typeof originalFetch === 'function') {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : input && input.url ? input.url : '';
      if (!/upload_logo\.php(?:[?#]|$)/i.test(url)) {
        return originalFetch.apply(window, arguments);
      }

      var body = init && init.body;
      var file = body && typeof body.get === 'function' ? body.get('logo_file') : null;
      if (!file) {
        return Promise.resolve(
          new Response(JSON.stringify({ success: false, error: 'No image selected' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        );
      }

      return resizeLogo(file)
        .then(function (dataUrl) {
          try {
            localStorage.setItem(LOGO_KEY, dataUrl);
          } catch (error) {
            /* storage may be full; still show the logo for this session */
          }
          applyLogo(dataUrl);
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Logo saved on this device',
              timestamp: Date.now()
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        })
        .catch(function (error) {
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        });
    };
  }

  var pending = false;
  function scheduleLogoRestore() {
    if (pending) return;
    pending = true;
    setTimeout(function () {
      pending = false;
      restoreLogo();
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleLogoRestore);
  } else {
    scheduleLogoRestore();
  }
  window.addEventListener('load', scheduleLogoRestore);

  // The app swaps views (login <-> shell) and may re-render <img> tags.
  try {
    var observer = new MutationObserver(function (mutations) {
      var stored = readStoredLogo();
      if (!stored) return;

      for (var i = 0; i < mutations.length; i += 1) {
        var mutation = mutations[i];
        if (mutation.type === 'attributes' && mutation.target && mutation.target.classList) {
          if (mutation.target.classList.contains('app-logo-img') && mutation.target.src !== stored) {
            mutation.target.src = stored;
          }
        } else if (mutation.type === 'childList' && mutation.addedNodes) {
          for (var j = 0; j < mutation.addedNodes.length; j += 1) {
            var node = mutation.addedNodes[j];
            if (!node || node.nodeType !== 1) continue;
            if (node.classList && node.classList.contains('app-logo-img') && node.src !== stored) {
              node.src = stored;
            }
            if (node.querySelectorAll) {
              var nested = node.querySelectorAll('.app-logo-img');
              for (var k = 0; k < nested.length; k += 1) {
                if (nested[k].src !== stored) nested[k].src = stored;
              }
            }
          }
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });
  } catch (error) {
    /* MutationObserver is available on every WebView we support */
  }
})();
