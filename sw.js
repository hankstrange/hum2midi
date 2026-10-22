// App shell + model precached at install; piano samples (smpldsnds.github.io) cached cache-first on first load, then offline.
const C = 'hum2midi-v2', PIANO = 'hum2midi-piano-sw';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './model/model.json', './model/group1-shard1of1.bin']))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== PIANO && !k.startsWith('hum2midi-piano')).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url), piano = u.hostname === 'smpldsnds.github.io' || u.hostname === 'gleitz.github.io', same = u.origin === location.origin;
  if (!piano && !same) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) { const cp = res.clone(); caches.open(piano ? PIANO : C).then(c => c.put(e.request, cp)); } return res; }))); });
