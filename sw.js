/* Notificaciones: Firebase Cloud Messaging */
try {
  importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js", "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
  firebase.initializeApp({ apiKey: "AIzaSyAg3GyJuGZF6Fhw_SLDEhsJCBJLhezZwQs", authDomain: "tepi-control.firebaseapp.com", projectId: "tepi-control", storageBucket: "tepi-control.firebasestorage.app", messagingSenderId: "852187057647", appId: "1:852187057647:web:14e34c4c60801b72673a1a" });
  firebase.messaging();
} catch (e) {}
/* Tepi Control VLV · trabajador sin señal
   Guarda la app en el celular para que abra aunque no haya señal. */
const VERSION = "v2-9b5e0bedd9";
const APP = ["./", "index.html", "manifest.json", "perro-192.png", "perro-512.png"];
const EXT = ["https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(APP))
    .then(() => caches.open("tepi-ext")).then(c => Promise.all(EXT.map(u => c.match(u).then(x => x || c.add(u).catch(() => {}))))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== "tepi-ext").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", e => { if (e.data === "activar") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  // la app misma: primero la red (para recibir mejoras), si no hay señal, lo guardado
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r).then(x => x || caches.match("index.html"))));
    return;
  }
  // librerías, letras y miniaturas de fotos: lo guardado primero, y se actualiza por detrás
  if (/cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|drive\.google\.com\/thumbnail|googleusercontent\.com/.test(u.href)) {
    e.respondWith(caches.open("tepi-ext").then(c => c.match(r).then(x => {
      const red = fetch(r).then(res => { if (res.ok || res.type === "opaque") c.put(r, res.clone()); return res; }).catch(() => x);
      return x || red;
    })));
  }
});
