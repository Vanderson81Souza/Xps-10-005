/**
 * Service Worker - XPS-8 Pocket Control
 * Estratégia: Cache-First estrito para funcionamento 100% Offline (Modo Avião)
 * Atualizado para arquitetura de arquivo único e ícone de alta resolução.
 */

const CACHE_NAME = 'xps8-assets-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-1024.png'
];

// Instalação do Service Worker e armazenamento no cache local
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza automática de caches antigos para evitar conflitos de versão
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
  self.clients.claim();
});

// Interceptação de requisições de rede (Engine Offline)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const req = event.request;
  const url = new URL(req.url);

  // Tratamento otimizado para navegação na página principal (index.html)
  const isNavigation = req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html');

  if (isNavigation) {
    event.respondWith(
      caches.match('./index.html').then(cached => {
        return cached || fetch(req).then(response => {
          if (!response || !response.ok) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', clone));
          return response;
        });
      })
    );
    return;
  }

  // Interceptação e Cache-First para os ícones e arquivo de manifesto
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        if (!response || !response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return response;
      }).catch(() => {
        // Se falhar a rede por falta de sinal, retorna a casca do app imediatamente
        return caches.match('./index.html');
      });
    })
  );
});
