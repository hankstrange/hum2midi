// v3: never cache/serve opaque or non-OK responses; old v2 caches are deleted on activate.
const V = 'v6', C = 'hum2midi-' + V, SAMPLES = 'hum2midi-samples-pd1'; // v6: samples + model bundled same-origin (offline), kept across app updates
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './model/model.json', './model/group1-shard1of1.bin', './splash.jpg']))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== SAMPLES).map(k => caches.delete(k)))).then(() => self.clients.claim())));
const good = r => r && r.ok && r.type !== 'opaque' && r.status === 200;
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url), same = u.origin === location.origin, sample = same && /\/(sounds|model)\//.test(u.pathname);
  if (!same) return;
  // App HTML: network-first so a new deploy is picked up on the next launch (cache only as offline fallback).
  if (same && (e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html'))) {
    e.respondWith(fetch(e.request).then(res => { if (good(res)) { const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return res; }).catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith((async () => {
    const hit = await caches.match(e.request);
    if (good(hit)) return hit;
    const res = await fetch(e.request);
    if (good(res)) { const cp = res.clone(); caches.open(sample ? SAMPLES : C).then(c => c.put(e.request, cp)); }
    return res;
  })());
});
