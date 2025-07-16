// public/service-worker.js

// Give your cache a NEW version name to ensure an update.
const CACHE_NAME = 'twenty-v3';

// List the essential files for your app shell.
// The duplicate entry has been removed.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logowhite.svg', // Ensure this file exists in your public folder
  '/alert.mp3'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event (This part is correct and remains the same)
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

// IMPROVED Fetch event: Network Falling Back to Cache
self.addEventListener('fetch', event => {
  // We only want to apply this strategy to GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // 1. Try to fetch from the network.
    fetch(event.request)
      .then(networkResponse => {
        // If the fetch is successful, we clone the response and cache it.
        // A response can only be consumed once.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        // Return the network response.
        return networkResponse;
      })
      .catch(() => {
        // 2. If the network fetch fails (offline), try to get it from the cache.
        return caches.match(event.request);
      })
  );
});