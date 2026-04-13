/**
 * service-worker.js — Cache-first para assets estáticos.
 * Estratégia: instala cache na primeira visita, responde do cache quando offline.
 */

const CACHE_NAME = 'calorie-counter-v1';

const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/styles.css',
    './css/components.css',
    './js/app.js',
    './js/data-loader.js',
    './js/search.js',
    './js/ui.js',
    './data/foods.json',
    './assets/icons/icon.svg',
];

// Instala e pré-cacheia todos os assets estáticos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Remove caches antigos ao ativar nova versão
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Cache-first: serve do cache se disponível, senão busca na rede
self.addEventListener('fetch', event => {
    // Ignora requisições cross-origin (Google Fonts, etc.)
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request)
            .then(cached => cached ?? fetch(event.request))
    );
});
