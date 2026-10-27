/**
 * Service Worker — Resimen Mahasiswa UNJ
 * Versi Cache: menwa-v1-tactical
 * Fitur:
 * - Precache halaman darurat offline (/offline.html) & logo resmi
 * - Mode navigasi Network First dengan fallback ke offline.html saat tanpa sinyal
 * - Stale-While-Revalidate untuk aset visual & CSS
 */

const CACHE_NAME = 'menwa-v1-tactical';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo-menwa-unj.png',
  '/foto-kampus-unj.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan cache request API serverless atau eksternal Firebase/Google APIs
  if (
    url.pathname.startsWith('/api/') || 
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('identitytoolkit.googleapis.com') ||
    url.origin.includes('generativelanguage.googleapis.com')
  ) {
    return;
  }

  // Permintaan Navigasi HTML (Halaman Web)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Offline — Menwa UNJ', { headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // Aset Statis (Gambar, CSS, JS, Fonts)
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default passthrough
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
