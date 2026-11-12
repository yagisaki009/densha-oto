/* オフライン用：一度ひらいたら端末に保存して、電波がなくても動くようにする */
var CACHE = 'densha-oto-v2';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png',
  'sounds/01_kiteki.m4a',
  'sounds/02_shushu.m4a',
  'sounds/03_gatan.m4a',
  'sounds/04_shinkansen.m4a',
  'sounds/05_hassha.m4a',
  'sounds/06_door.m4a',
  'sounds/07_chinchin.m4a',
  'sounds/08_announce.m4a',
  'sounds/09_motor.m4a',
  'sounds/10_fune.m4a',
  'sounds/11_hikouki.m4a',
  'sounds/12_heli.m4a',
  'sounds/13_rocket.m4a',
  'sounds/14_fuusen.m4a',
  'sounds/15_hanabi.m4a',
  'sounds/16_rappa.m4a',
  'sounds/17_doremi.m4a',
  'sounds/18_hiyoko.m4a',
  'sounds/19_kaeru.m4a',
  'sounds/20_ufo.m4a'];

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
