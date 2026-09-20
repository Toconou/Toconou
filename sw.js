// sw.js - Toconou PWA comme WeChat
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('toconou-v1').then(c => 
      c.addAll(['./', './index.html', './manifest.json', './style.css', './app.js'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
