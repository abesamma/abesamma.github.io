
const version = '1.0.0-alpha';
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
            console.log('Installed sw.js version:', version);
        }).catch(function () {
            console.warn('Failed to install sw.js version', version);
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
            caches.open(CACHE).then(function (cache) {
                cache.put(event.request.url, res);
            });
            return res.clone();
        }).catch(function () {
            return caches.open(CACHE).then(function (cache) {
                return cache.match(event.request.url);
            });
        })
    )
});