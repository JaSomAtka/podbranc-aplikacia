/*
 * Service worker – vďaka nemu aplikácia funguje aj bez internetu.
 *  - údaje (data/*.json): najprv zo siete, pri výpadku z pamäte
 *  - ostatné súbory: hneď z pamäte, na pozadí sa stiahne novšia verzia
 * Pri zmene zoznamu SHELL zvýšte VERSION.
 */
const VERSION = 'podbranc-v1';
const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'fonts/fonts.css',
  'fonts/atkinson-next-latin.woff2',
  'fonts/atkinson-next-latin-ext.woff2',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/favicon-32.png',
  'icons/apple-touch-icon.png',
  'data/obec.json',
  'data/feed.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // počasie, obrázky z webu obce – bez zásahu

  if (url.pathname.includes('/data/')) {
    event.respondWith(networkFirst(req));
  } else if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, 'index.html'));
  } else {
    event.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirst(req, fallback) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(req, { ignoreSearch: true })) || (fallback && (await cache.match(fallback)));
    if (hit) return hit;
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  const fresh = fetch(req)
    .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
    .catch(() => hit);
  return hit || fresh;
}
