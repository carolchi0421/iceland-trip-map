/* Iceland Plan — service worker (offline support)
   Strategy:
   - navigation / app shell : network-first, fallback to cache (updates propagate, offline still works)
   - map tiles / Wikipedia photos / Leaflet CDN : cache-first (stale-while-revalidate)
   Bump VERSION to force clients onto a fresh cache. */
const VERSION = 'iceland-v3';
const SHELL   = VERSION + '-shell';
const RUNTIME = VERSION + '-runtime';

const SHELL_ASSETS = [
  './', './index.html', './manifest.webmanifest', './icon.svg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      .then(c => c.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {})   // don't fail install if a CDN asset is unreachable
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf(VERSION) !== 0).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isRuntimeAsset(url) {
  return /tile\.openstreetmap\.org|upload\.wikimedia\.org|\/api\/rest_v1\/|unpkg\.com/.test(url);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // App navigation → network-first, cache fallback (works offline)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(r => { const cp = r.clone(); caches.open(SHELL).then(c => c.put('./index.html', cp)).catch(() => {}); return r; })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  // Tiles / photos / CDN → cache-first, refresh in background
  if (isRuntimeAsset(req.url)) {
    e.respondWith(
      caches.match(req).then(cached => {
        const net = fetch(req)
          .then(r => { caches.open(RUNTIME).then(c => c.put(req, r.clone())).catch(() => {}); return r; })
          .catch(() => cached);
        return cached || net;
      })
    );
    return;
  }

  // Everything else → cache-first, then network
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
