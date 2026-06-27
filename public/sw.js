// Malika Bozor — Service Worker (oddiy offline kesh)
const CACHE = 'malika-bozor-v1'
const KESHLANADIGAN = ['/', '/dokonlar', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(KESHLANADIGAN)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // API so'rovlari: doim tarmoqdan (kesh emas)
  if (url.pathname.startsWith('/api/')) return

  // Sahifalar: tarmoq birinchi, ishlamasa keshdan
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const nusxa = res.clone()
          caches.open(CACHE).then((c) => c.put(request, nusxa))
          return res
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/'))),
    )
    return
  }

  // Statik fayllar: kesh birinchi
  event.respondWith(
    caches.match(request).then(
      (kesh) =>
        kesh ||
        fetch(request).then((res) => {
          const nusxa = res.clone()
          caches.open(CACHE).then((c) => c.put(request, nusxa))
          return res
        }),
    ),
  )
})
