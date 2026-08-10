const CACHE = 'gutter-grin-puzzle-panic-v17';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './config.js', './manifest.webmanifest',
  './assets/puzzles/starter/backyard-cookout.webp',
  './assets/puzzles/starter/chaotic-garage-sale.webp',
  './assets/puzzles/starter/laundromat-from-hell.webp',
  './assets/puzzles/starter/raccoon-eating-pizza.webp',
  './assets/puzzles/starter/the-dragons-pit.webp',
  './assets/puzzles/raccoon-adventures/raccoon-campfire.webp',
  './assets/puzzles/raccoon-adventures/raccoon-dumpster-fire.webp',
  './assets/puzzles/raccoon-adventures/raccoon-goes-camping.webp',
  './assets/puzzles/raccoon-adventures/raccoon-grocery-run.webp',
  './assets/puzzles/raccoon-adventures/raccoon-pirate-adventure.webp',
  './assets/puzzles/wild-n-groovy/disco-apocalypse.webp',
  './assets/puzzles/wild-n-groovy/groovy-shrooms.webp',
  './assets/puzzles/wild-n-groovy/groovy-van-vibes.webp',
  './assets/puzzles/wild-n-groovy/groovy-shrooms-2.webp',
  './assets/puzzles/wild-n-groovy/groovy-van-2.webp',
  './assets/puzzles/epic-fantasy/blacksmith-working.webp',
  './assets/puzzles/epic-fantasy/dragon-castle.webp',
  './assets/puzzles/epic-fantasy/dwarven-pub.webp',
  './assets/puzzles/epic-fantasy/miners-haven.webp',
  './assets/puzzles/epic-fantasy/overcast-forest.webp',
  './assets/icon-192.png', './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
