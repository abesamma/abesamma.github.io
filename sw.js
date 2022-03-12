
const VERSION = '1.0.0-alpha-1';
const CACHE = 'abesamma-cache';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE).then(function (cache) {
            cache.addAll([
                '/manifest.json',
                '/images/app_icon.png',
                '/favicon.ico',
                '/'
            ]);
        }).then(function () {
            console.log('Installed sw.js VERSION:', VERSION);
        }).catch(function () {
            console.warn('Failed to install sw.js VERSION', VERSION);
        })
    )
});

self.addEventListener('activate', function (event) {
    const cacheWhitelist = [CACHE];
    event.waitUntil(
        caches.keys().then(function (keyList) {
            clients.claim(); // sieze control of all pages in scope without a reload
            return Promise.all(keyList.map(function (key) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request).then(function (res) {
            if (event.request.method === 'POST') return res;
            if (event.request.method == 'OPTIONS') return res;
            if (event.request.method == 'HEAD') return res;
            if (url.pathname.match(/^\/changefeed$/)) return res;
            // Chrome DevTools opening will trigger these o-i-c requests, which this SW can't handle.
            if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return res;
            caches.open(CACHE).then(function (cache) {
                cache.put(event.request, res);
            });
            return res.clone();
        }).catch(function () {
            return caches.open(CACHE).then(function (cache) {
                return cache.match(event.request.url);
            });
        })
    )
});