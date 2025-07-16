// public/service-worker.js

// 1. Give your cache a version name. Start with v2.
const CACHE_NAME = 'twenty-v2';

// 2. List the essential files for your app shell to be cached.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logowhite.svg',
  '/logowhite.svg',
  '/alert.mp3'
];

// 3. Install event: This runs when a new service worker is installed.
self.addEventListener('install', event => {
  // We wait until the cache is opened and all our essential files are cached.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// 4. Activate event: This runs when the new service worker becomes active.
// This is the perfect place to clean up old, outdated caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache's name is not our current CACHE_NAME, we delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 5. Fetch event: This runs for every network request the page makes.
// It tries to serve a file from the cache first before going to the network.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we find a matching response in the cache, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch the request from the network.
        return fetch(event.request);
      })
  );
});