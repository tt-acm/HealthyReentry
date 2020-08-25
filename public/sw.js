// CACHE
const staticCacheName = 'site-static-v1';
const assets = [
  // "",
  // "",
  "/logo-256.png"
];
// install event
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});
// activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});
// fetch event
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});




self.addEventListener('notificationclick', function(event) {
  console.log(event);
  const clickedNotification = event.notification;
  clickedNotification.close();
  window.open('https://google.com');
  // window.open(`${window.location.href}/${store.state.user._id}/status`);
  event.waitUntil(notifReact);
  // scheduleNextNotification();
});
async function notifReact() {
  console.log('joo');
}