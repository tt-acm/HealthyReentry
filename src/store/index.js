import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    // gotSession: false,
    user: null
  },
  mutations: {
    setUser(state, user) {
      // state.gotSession = true;
      state.user = user;

      // if (user) {
      //     state.userIsTT = user.sso.isTT;
      //     state.userIsMaster = user.sso.masterStatus;
      // } else {
      //     state.userIsTT = false;
      //     state.userIsMaster = false;
      // }
    }
  }
});

export default store;
