/* Soft Designer trainer — lightweight app-shell cache for GitHub Pages */
const BASE = "/ruanshe-8weeks";
const CACHE = "ruanshe-8weeks-shell-v1";

const PRECACHE = [
  `${BASE}/`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/icon-192.png`,
  `${BASE}/icon-512.png`,
  `${BASE}/apple-touch-icon.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ruanshe-8weeks-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isAppShellRequest(url) {
  if (url.origin !== self.location.origin) return false;
  if (!url.pathname.startsWith(`${BASE}/`) && url.pathname !== BASE) return false;
  // Static Next assets + shell pages + icons/manifest
  if (url.pathname.startsWith(`${BASE}/_next/static/`)) return true;
  if (/\.(?:js|css|png|svg|ico|webmanifest|woff2?)$/i.test(url.pathname)) return true;
  // HTML navigations under basePath
  return true;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  if (!isAppShellRequest(url)) return;

  // Network-first for navigations so content stays fresh when online;
  // fall back to cache for offline shell. Cache-first for hashed static assets.
  const isStatic =
    url.pathname.startsWith(`${BASE}/_next/static/`) ||
    /\.(?:png|svg|ico|webmanifest|woff2?)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              void caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
      }),
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          void caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match(`${BASE}/`)),
      ),
  );
});
