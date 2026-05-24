const CACHE_NAME = 'jornada-fin-v1';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições de API
  if (event.request.url.includes('/api')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      // Se a navegação à página falhar (offline), serve o index.html cacheado para cumprir a regra de PWA do Chrome
      if (event.request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }
      return caches.match(event.request);
    })
  );
});

// Abre ou foca o aplicativo quando o usuário clica na notificação do expediente
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se a janela já estiver aberta, foca nela
      for (const client of clientList) {
        if (client.url === '/' || client.url.includes(self.location.origin)) {
          return client.focus();
        }
      }
      // Caso contrário, abre o aplicativo
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
