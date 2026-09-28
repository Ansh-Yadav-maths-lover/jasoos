/* JASOOS service worker — offline-first shell */
const V = 'jasoos-v3';
const SHELL = ['/', '/index.html', '/baloo.woff2', '/manifest.webmanifest', '/icon-192.png', '/peerjs.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/ws/')) return;

  // Navigations: serve cached shell instantly, refresh in background.
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('/index.html').then(hit => {
        const net = fetch(req).then(r => {
          if (r && r.ok) caches.open(V).then(c => c.put('/index.html', r.clone()));
          return r;
        });
        return hit || net;
      }).catch(() => fetch(req))
    );
    return;
  }

  // Assets: cache-first, fill on miss.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && r.ok && r.type === 'basic') caches.open(V).then(c => c.put(req, r.clone()));
      return r;
    }).catch(() => hit))
  );
});
