const CACHE_NAME = 'atraa-v2.2-b36';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/favicon.ico',
  '/manifest.json',
  '/placeholder.svg',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - stale-while-revalidate for pages, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API calls
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/v1/') || url.hostname !== location.hostname) {
    // For external APIs (prayer times, weather), use network-first with cache fallback
    if (url.hostname !== location.hostname) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match(request).then(r => r || new Response('{"offline":true}', {
            headers: { 'Content-Type': 'application/json' }
          })))
      );
    }
    return;
  }

  // Static assets (JS, CSS, images, fonts) - cache first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => caches.match('/'));
      })
    );
    return;
  }

  // HTML navigation - network first, fallback to cache (SPA)
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then(r => r || caches.match('/')))
  );
});
