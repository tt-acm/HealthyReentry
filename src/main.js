import Vue from 'vue';
import App from '@/App.vue';
import axios from 'axios';
Vue.prototype.$api = axios.create();

import router from '@/router';
import store from '@/store';

import moment from 'moment';
import VueQrcodeReader from "vue-qrcode-reader";
import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

import 'bootstrap';
import './css/app.scss';


import VueMaterial from 'vue-material'
// import { MdButton, MdContent, MdTabs } from 'vue-material/dist/components'
// import 'vue-material/dist/vue-material.min.css'
// import 'vue-material/dist/vue-material.css'
// import 'vue-material/dist/theme/default.css'
// import 'vue-material/dist/components/index.css'

window.$ = window.jQuery = require('jquery');

Vue.use(VueMaterial);
Vue.use(VueQrcodeReader);
// Vue.use(MdButton)
// Vue.use(MdContent)
// Vue.use(MdTabs)

Vue.prototype.moment = moment;



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


async function sendReminderNotification() {
  let title = "HealthyReentry Reminder";
  let body = "Hello! This is a friendly reminder to report your work location and health status. Thank you!";
  let options = {
    body: body,
    icon: "/imgs/logo-256.png",
    requireInteraction: true
  };
  let notif = new Notification(title, options);
  console.log(notif);
}


async function registerNotification() {
  if (Notification.permission === "denied") {
    return;
  }
  else if (Notification.permission === "default") {
    await Notification.requestPermission();
    registerNotification();

    let title = "HealthyReentry Reminder Signup";
    let body = "Great! You're signed up for reminders to submit your location and health status every weekday";
    let options = {
      body: body,
      icon: "/imgs/logo-256.png"
    };
    new Notification(title, options);
    
  }

  // let storedScheduledNotifs = localStorage.getItem('scheduledNotifs');
  // console.log(storedScheduledNotifs);
  
  let currTime = new Date();
  // let nextNotifTime = getNextValidNotifDate(currTime);
  let nextNotifTime = new Date();
  nextNotifTime.setMinutes(currTime.getMinutes() + 1);
  let gap = nextNotifTime - currTime;
  console.log(currTime);
  console.log(nextNotifTime);
  console.log(gap);
  setTimeout(sendReminderNotification, gap);
}


import browserDetect from "vue-browser-detect-plugin";
Vue.use(browserDetect);

async function main() {


  if('serviceWorker' in navigator){
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('service worker registered');
    } catch(err) {
      console.log('service worker not registered');
      console.log(err);
    }
  }

  if('Notification' in window){
    try {
      registerNotification();
    } catch(err) {
      console.log('service worker not registered');
      console.log(err);
    }
  }

  router.beforeEach((to, from, next) => {
      // if (to.meta && to.meta.title) {
      //     document.title = to.meta.title(to);
      // }
      // session.clearAlerts();
      //

      function routeUserFunction(user) {
        //authenticated
        if (user.dateOfConsent) {//consent signed
          if (to.name === "home" || to.name === "disclosure") return next("/menu");//route signed user to menu
          else return next();
        }
        else{//authenticated, but haven't signed consent
          if (to.name === "disclosure") return next();
          else return next("/disclosure");//route signed user to sign
        }

      }

      Vue.prototype.$api.get("/api/session").then(session => {
        if (session.data.user) {
          store.commit('setUser', session.data.user);
          routeUserFunction(session.data.user);
        }
        else return next('/');
          // keepGoing();
      }).catch(() => {
          store.commit('setUser', null);
          // keepGoing();
          if (to.name === 'home' || to.name ==='NotFound') return next();
          return next("/");
      })
  });

  Vue.config.productionTip = false;

  new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App),
  });

}


main();
