import store from "@/store/index.js";



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


async function scheduleNextNotification() {
  let reg = await navigator.serviceWorker.register('/sw.js');

  let currTime = new Date();
  // let nextNotifTime = getNextValidNotifDate(currTime);
  let nextNotifTime = new Date();
  nextNotifTime.setSeconds(currTime.getSeconds() + 5);
  console.log(currTime);
  console.log(nextNotifTime);

  let title = "HealthyReentry Reminder";
  let body = "Hello! This is a friendly reminder to report your work location and health status. Thank you!";
  let options = {
    body: body,
    showTrigger: new TimestampTrigger(nextNotifTime),
    badge: "/imgs/logo-256.png",
    icon: "/favicon.png"
    // requireInteraction: true
  };

  reg.showNotification(title, options);
  
}


async function registerNotification() {

  let result = await Notification.requestPermission();

  if (result !== "granted") {
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