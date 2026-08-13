const CACHE_NAME = 'lsa-translator-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/robotina.png',
  '/manifest.json'
];

// Instalar Service Worker y cachear recursos iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Abriendo caché y guardando recursos estáticos');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones para servir contenido desde caché
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Devolver la respuesta en caché
        return cachedResponse;
      }

      // Si no está en caché, hacer la petición de red y guardarla dinámicamente
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Clonamos la respuesta para guardarla en la caché
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Guardar en caché estáticos, assets y archivos de MediaPipe CDN
            const url = event.request.url;
            if (
              url.includes('cdn.jsdelivr.net') ||
              url.includes('storage.googleapis.com') ||
              url.includes('.js') ||
              url.includes('.css') ||
              url.includes('/assets/')
            ) {
              cache.put(event.request, responseToCache);
            }
          });

          return networkResponse;
        })
        .catch(() => {
          // Si falla la red y no está en caché (offline)
          console.warn('Petición fallida y sin copia en caché:', event.request.url);
        });
    })
  );
});
