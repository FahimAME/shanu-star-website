/* Shanu Star service worker.
   - Pages: network first, fall back to cache when offline.
   - Images and shared scripts: serve from cache, refresh in background.
   - Never touches /api (live prices) or other websites. */
var VERSION = 'shanu-v1';
var PAGES = ['/', '/index.html', '/products.html', '/about.html', '/blog.html', '/custom-order.html', '/contact.html', '/privacy.html', '/terms.html', '/404.html', '/rate-strip.js', '/site-extras.js', '/images/logo.webp'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(PAGES.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/api/') === 0) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('/index.html'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
