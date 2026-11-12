/* オフライン用：一度ひらいたら端末に保存して、電波がなくても動くようにする */
var CACHE = 'densha-oto-v1';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* 保存してあるものをすぐ返す（車の中で電波が弱くても待たない）。裏で新しい版があれば取っておく */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok && req.url.indexOf(self.location.origin) === 0) c.put(req, res.clone());
        return res;
      });
      if (hit) { net['catch'](function () {}); return hit; }
      return net['catch'](function () { return c.match('index.html'); });
    });
  }));
});
