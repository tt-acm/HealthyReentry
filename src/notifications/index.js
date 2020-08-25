import store from "@/store/index.js";


async function registerNotification() {
  if(!('Notification' in window)){
    return;
  }

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

  let reg = await navigator.serviceWorker.register('/sw.js');
  reg.showNotification(title, options);

}


export default {
  registerNotification
}