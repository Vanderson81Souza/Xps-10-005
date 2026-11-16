const CACHE_NAME = 'xps8-pocket-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-1024.png'
];

// Instalação: baixa os novos arquivos e força a ativação imediata
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// Ativação: apaga caches antigos e assume o controle da página na hora
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
        }).then(() => self.clients.claim())
    );
});

// Estratégia Network-First: prioriza código atualizado e usa cache se estiver offline
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            })
            .catch(() => caches.match(event.request))
    );
});
