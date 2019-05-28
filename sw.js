
const version = '0.0.5';
const CACHE = 'looping-cache-v0.1';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE).then(function (cache) {
            cache.addAll([
                '/manifest.json',
                '/images/app_icon.png',
                '/favicon.ico',
                '/version.json',
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
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET') return;
    if (url.pathname === '/' && event.request.method === 'GET') {
        event.respondWith(
            caches.match('/version.json').then(function (result) {
                return result.json().then(function (old) {
                    return fetch('/version.json').then(function (res) {
                        return res.json().then(function (_new) {
                            if (_new.version === old.version) {
                                console.log('match');
                                return caches.match(event.request);
                            }
                            console.log('do not match')
                            return fetch(event.request).then(function (res) {
                                caches.open(CACHE).then(function (cache) {
                                    cache.addAll([
                                        '/version.json',
                                        '/'
                                    ]);
                                });
                                return res;
                            });
                        })
                    })
                });
            })
        )
    } else {
        event.respondWith(
            caches.match(event.request).then(function (result) {
                if (!result) return fetch(event.request).then(function (res) {
                    caches.open(CACHE).then(function (cache) {
                        cache.put(event.request, res);
                    });
                    return res.clone();
                });
                return result;
            })
        )
    }
});