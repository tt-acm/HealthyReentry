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



// reminder notifications

self.addEventListener('notificationclick', handleNotificationReaction);
self.addEventListener('notificationclose', handleNotificationReaction);


async function handleNotificationReaction(event) {
  clients.openWindow('/menu');
  event.notification.close();
}



self.addEventListener('push', function(event) {

  if (event.data) {
    if (event.data.text() === 'reminder') {
      let title = "HealthyReentry Reminder";
      let body = "Hello! This is a friendly reminder to report your work location and health status. Thank you!";
      let options = {
        body: body,
        badge: "/imgs/logo-256.png",
        icon: "/favicon.png",
        requireInteraction: true
      };
      self.registration.showNotification(title, options);
    }

  } else {
    console.log('Push event but no data')
  }
})