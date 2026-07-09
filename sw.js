/* Service Worker DA-Gestion — mode hors-ligne */
const CACHE = "da-gestion-v1";
const FICHIERS = [
  "./",
  "./index.html",
  "./app-v2.js",
  "./style.css",
  "./manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  // Réseau d'abord pour les fichiers de l'app (toujours à jour), cache en secours (hors-ligne)
  if(e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if(url.origin === location.origin){
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
    );
  }
});
