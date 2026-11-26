// Service worker: guarda o app para ele abrir mesmo sem internet (útil no app da Tela de Início).
// Estratégia "rede primeiro": com internet, sempre usa a versão mais nova publicada e atualiza a cópia;
// sem internet, usa a cópia guardada.
const CACHE = "memento-mori-v1";
const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./lib/jspdf.umd.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

async function daRedeOuDaCopia(req) {
  try {
    const resp = await fetch(req);
    if (resp.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(req, resp.clone());
    }
    return resp;
  } catch (erro) {
    const copia = (await caches.match(req, { ignoreSearch: true })) ||
      (req.mode === "navigate" ? await caches.match("./index.html") : undefined);
    return copia || Response.error();
  }
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(daRedeOuDaCopia(req));
});
