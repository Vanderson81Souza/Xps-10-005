const CACHE_NAME = 'pwa-cache-v1';
const ASSETS = [
    '/index.html',
    '/manifest.json',
    '/icons/icon-1024.png'
];

// Instalação do Service Worker e armazenamento de arquivos estáticos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// OBRIGATÓRIO PARA ANDROID: Responder mesmo em modo offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});
