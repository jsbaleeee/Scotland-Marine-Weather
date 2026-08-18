/* ==========================================================================
   PortCast — Service Worker
   --------------------------------------------------------------------------
   Caches the app SHELL only (HTML/JS/icons) so the app installs properly
   and opens instantly even on a poor connection. Deliberately does NOT
   cache API responses (weather, tides, AIS) here — that's already handled
   by the localStorage staleness system in app.js, and Admiralty's tide
   data specifically must never be cached at all (see the licensing note
   in app.js). This worker's only job is making the app installable and
   fast to open, not caching live data.
   ========================================================================== */
const CACHE_NAME = "portcast-shell-v1";
const SHELL_FILES = [
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin shell files this way — everything else
  // (weather APIs, Supabase, AIS websocket, map tiles) goes straight
  // to the network untouched.
  if (url.origin !== self.location.origin || !SHELL_FILES.some((f) => url.pathname.endsWith(f.replace("./", "")))) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
