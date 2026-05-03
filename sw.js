/* Simple SW for faster repeat loads (cache shell + runtime assets). */
const CACHE_VERSION = "v1";
const SHELL_CACHE = `calcem-bal-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `calcem-bal-runtime-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./assets/css/style.css",
  "./assets/js/script.js",
  "./assets/images/logo-circular.png",
  "./assets/images/favicon.ico?v=2",
  "./assets/images/favicon.png?v=2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("calcem-bal-") && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      ).then(() => self.clients.claim())
    )
  );
});

function isHtmlRequest(request) {
  return request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (isHtmlRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy)));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          const copy = response.clone();
          event.waitUntil(caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)));
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

