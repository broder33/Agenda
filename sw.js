const CACHE_NAME = 'agenda-v0573';

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const STATIC_ASSETS = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;600&display=swap'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.url.includes('api.anthropic.com')) return;
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('fonts.gstatic.com')) return;
  if (event.request.url.includes('unpkg.com')) return;
  if (event.request.url.includes('jsdelivr.net')) return;
  if (event.request.url.includes('accounts.google.com')) return;

  if (event.request.mode === 'navigate' || event.request.url.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return new Response('<h1>Offline</h1><p>Conecte-se para usar o app.</p>', {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});
