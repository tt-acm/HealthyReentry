

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

  let currTime = new Date();
  // let nextNotifTime = getNextValidNotifDate(currTime);
  let nextNotifTime = new Date();
  nextNotifTime.setSeconds(currTime.getSeconds() + 10);
  // console.log(currTime);
  // console.log(nextNotifTime);

  let title = "HealthyReentry Reminder";
  let body = "Hello! This is a friendly reminder to report your work location and health status. Thank you!";
  let options = {
    body: body,
    showTrigger: new TimestampTrigger(nextNotifTime),
    badge: "/imgs/logo-256.png",
    icon: "/favicon.png",
    requireInteraction: true
  };

  self.registration.showNotification(title, options);

  event.notification.close();
}





function getNextValidNotifDate(startDate = new Date()) {
  let currTime = new Date(startDate.getTime());
  let nextNotifTime = new Date(currTime.getTime());
  nextNotifTime.setHours(9, 0, 0, 0);
  nextNotifTime.setDate(currTime.getDate() + 1);
  let nxtDay = nextNotifTime.getDay();
  if (nxtDay === 6) {
    nextNotifTime.setDate(currTime.getDate() + 3);
  }
  else if (nxtDay === 0) {
    nextNotifTime.setDate(currTime.getDate() + 2);
  }
  return nextNotifTime;
}