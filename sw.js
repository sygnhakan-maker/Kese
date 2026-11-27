/* Kese service worker: çevrimdışı çalışma. Verilere (localStorage) dokunmaz; yalnızca uygulama dosyalarını önbelleğe alır.
 * Yeni sürüm yayınlarken SADECE aşağıdaki VERSION değerini artırın. */
const VERSION = 'kese-v32';
const SHELL = ['./', 'index.html', 'style.css', 'ui.css', 'ui-pages.css', 'ui-forms.css', 'ui-panels.css', 'ui-fix.css', 'dock.js', 'pet-games.js', 'pet-games.css', 'push-client.js', 'kese-pet.js', 'fonts/inter-latin.woff2', 'fonts/inter-latin-ext.woff2', 'icons/mascot-96.png', 'icons/mascot-400.png', 'ai.js', 'app.js', 'live.js', 'calc.js', 'import.js', 'store.js', 'sync.js', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png', 'rates.json'];

self.addEventListener('install', (e) => {
  // Tek bir dosya eksik/hatalıysa tüm kurulum başarısız olmasın (addAll hepsini iptal eder): dosyaları tek tek önbelleğe al.
  e.waitUntil(caches.open(VERSION).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  const networkFirst = req.mode === 'navigate' || url.pathname.endsWith('/rates.json');
  if (networkFirst) {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
    return;
  }
  // diğer dosyalar: önce önbellek, arkadan güncelle
  e.respondWith(caches.match(req).then((hit) => {
    const fresh = fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || fresh;
  }));
});

const notificationViews = new Map([
  ['daily', 'butce'], ['weekly', 'butce'], ['due', 'takvim'], ['complete', 'borclar']
]);

self.addEventListener('push', event => {
  let data;
  try { data = event.data?.json(); } catch { /* Bilinmeyen iletiler için genel bildirim. */ }
  event.waitUntil(self.registration.showNotification('Kese', {
    body: typeof data?.body === 'string' ? data.body : 'Kese’de yeni bir bildirimin var.',
    icon: new URL('icons/icon-192.png', self.registration.scope).href,
    tag: data?.tag,
    data: {kind: notificationViews.has(data?.kind) ? data.kind : ''}
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const kind = event.notification.data?.kind;
  const target = new URL(self.registration.scope);
  target.hash = notificationViews.get(kind) || 'ozet';
  if (notificationViews.has(kind)) target.searchParams.set('reminder', kind);
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:'window'});
    const app = windows.find(client => {
      const url = new URL(client.url);
      return url.origin === target.origin && [target.pathname, target.pathname + 'index.html'].includes(url.pathname);
    });
    if (!app) return self.clients.openWindow(target.href);
    await app.focus();
    app.postMessage({type:'kese-notification', kind});
  })());
});
