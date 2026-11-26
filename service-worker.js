/* Guarda todos os ficheiros necessários para abrir o projeto sem internet. */

const cacheName = 'time-offline-v4';
const filesRequiredForOfflineUse = [
  './',
  './index.html',
  './styles_css/style.css',
  './styles_css/responsive.css',
  './script_js/main.js',
  './script_js/time-language.js',
  './script_js/clock.js',
  './script_js/speech.js',
  './script_js/tabs.js',
  './script_js/practice.js',
  './script_js/lesson.js',
  './script_js/quiz.js'
];

// O cache só é ativado se cada módulo, a página e os estilos forem guardados.
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(filesRequiredForOfflineUse)));
  self.skipWaiting();
});

// Remove versões antigas e ativa o novo worker para as páginas já abertas.
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(cacheNames => Promise.all(cacheNames.filter(name => name.startsWith('time-offline-') && name !== cacheName).map(name => caches.delete(name)))),
    self.clients.claim()
  ]));
});

// Navegações tentam a rede primeiro; se estiver offline, abrem a página guardada.
// Os módulos e estilos usam o cache primeiro para funcionarem sem ligação.
self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          const responseCopy = networkResponse.clone();
          caches.open(cacheName).then(cache => cache.put(request, responseCopy));
        }
        return networkResponse;
      }).catch(async () => {
        const cachedPage = await caches.match(request);
        return cachedPage || caches.match(new URL('./index.html', self.registration.scope));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => cachedResponse || fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        const responseCopy = networkResponse.clone();
        caches.open(cacheName).then(cache => cache.put(request, responseCopy));
      }
      return networkResponse;
    }))
  );
});
