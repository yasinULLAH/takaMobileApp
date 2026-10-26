// PWA Service Worker Registration — loop-safe (single registration).
// Do not register the worker from anywhere else (no duplicate register() calls).
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                // When a newer worker finishes installing, activate it immediately.
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
            })
            .catch(() => {});
    });

    // Reload at most once per tab session after a new worker takes control,
    // so updates apply without ever looping.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (sessionStorage.getItem('sw-reloaded')) return;
        sessionStorage.setItem('sw-reloaded', '1');
        window.location.reload();
    });
}
