import { getInstance } from "./index";
import store from '@/store/index.js';

export const authGuard = (to, from, next) => {
  const authService = getInstance();

  const fn = () => {
    console.log(window.location);
    if (window.location.protocol !== 'https:') window.location.href = `https://${window.location.host}`;
    console.log(window.location);
    console.log('-----------------------');
    // If the user is authenticated, continue with the route
    if (authService.isAuthenticated) {
      if (authService.userDB) {
        store.commit('setUser', authService.userDB);
        routeUserFunction(authService.userDB);
      }
      else {
        authService.$api.post('/api/user', authService.user).then(returnedUser => {
          authService.userDB = returnedUser.data;
          store.commit('setUser', authService.userDB);
          routeUserFunction(returnedUser.data);
        });
      }
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
    }
    return next();

    // Otherwise, log in
    // authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
  };

  // If loading has already finished, check our auth state using `fn()`
  if (!authService.loading) {
    return fn();
  }

  // Watch for the loading property to change before we check isAuthenticated
  authService.$watch("loading", loading => {
    if (loading === false) {
      return fn();
    }
  });
};
