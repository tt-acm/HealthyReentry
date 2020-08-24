import store from "@/store/index.js";


async function scheduleNextNotification() {
  let reg = await navigator.serviceWorker.register('/sw.js');

  let currTime = new Date();
  // let nextNotifTime = getNextValidNotifDate(currTime);
  let nextNotifTime = new Date();
  nextNotifTime.setSeconds(currTime.getSeconds() + 20);
  console.log(currTime);
  console.log(nextNotifTime);

  let title = "HealthyReentry Reminder";
  let body = "Hello! This is a friendly reminder to report your work location and health status. Thank you!";
  let options = {
    body: body,
    showTrigger: new TimestampTrigger(nextNotifTime),
    data: {
      url: `${window.location.href}/${store.state.user._id}/status`,
    },
    badge: "/imgs/logo-256.png",
    icon: "/favicon.png"
    // requireInteraction: true
  };

  let notif = await reg.showNotification(title, options);
  
  // let notif = new Notification(title, options);
  console.log(notif);
}


async function registerNotification() {
  if (Notification.permission === "denied") {
    return;
  }

  let title = "HealthyReentry Reminder Signup";
  let body = "Great! You're signed up for reminders to submit your location and health status every weekday";
  let options = {
    body: body,
    badge: "/imgs/logo-256.png",
    icon: "/favicon.png"
  };
  new Notification(title, options);

  scheduleNextNotification();

}


export default {
  registerNotification
}





// if('Notification' in window){
//   try {
//     registerNotification();
//   } catch(err) {
//     console.log('service worker not registered');
//     console.log(err);
//   }
// }