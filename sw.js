const CACHE_NAME = 'love-app-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './config.js',
  './manifest.json',
  './assets/retro-love-poster.svg'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for API, Cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Network-first for Supabase API and external resources
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('cloudinary') ||
      url.hostname.includes('unsplash') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('gstatic')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses from CDNs
          if (response.ok && (url.hostname.includes('googleapis') || url.hostname.includes('gstatic') || url.hostname.includes('cdnjs'))) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for local static assets
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) {
          // Background refresh
          fetch(event.request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
  );
});
