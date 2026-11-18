// CoolCalc Pro – offline önbellek
// Programı güncellediğinizde aşağıdaki sürüm numarasını artırın (cc-v1 -> cc-v2 ...)
const CACHE = 'cc-v1';
const FILES = ['./', './index.html', './manifest.webmanifest',
  './apple-touch-icon.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Sadece kendi dosyalarımız önbelleğe alınır
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // Önce önbellek (internetsiz çalışır), arka planda internet varsa günceller
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || c.match('./index.html');
  }));
});
