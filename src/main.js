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
