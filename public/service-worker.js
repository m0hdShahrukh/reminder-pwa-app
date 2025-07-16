// public/service-worker.js

const CACHE_NAME = 'twenty-v4'; // IMPORTANT: Increment the version!

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logowhite.svg',
  '/alert.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// This fetch listener is for offline capability. It remains the same.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ✅ NEW: Listen for when a notification is clicked.
self.addEventListener('notificationclick', (event) => {
  // For now, we just close the notification. We could also open the app.
  event.notification.close();

  // Open the app window
  event.waitUntil(
    clients.openWindow('/')
  );
});