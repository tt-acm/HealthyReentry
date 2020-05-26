import Vue from "vue";
import createAuth0Client from "@auth0/auth0-spa-js";
import store from '@/store/index.js';

/** Define a default action to perform after authentication */
const DEFAULT_REDIRECT_CALLBACK = async () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

let instance;

/** Returns the current instance of the SDK */
export const getInstance = () => instance;

/** Creates an instance of the Auth0 SDK. If one has already been created, it returns that instance */
export const useAuth0 = ({
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  redirectUri = window.location.origin,
  ...options
}) => {
  if (instance) return instance;

  // The 'instance' is simply a Vue object
  instance = new Vue({
    data() {
      return {
        loading: true,
        isAuthenticated: false,
        user: {},
        userDB: null,
        token: null,
        jwt: null,
        auth0Client: null,
        popupOpen: false,
        error: null
      };
    },
    methods: {
      /** Authenticates the user using a popup window */
      async loginWithPopup(o) {
        this.popupOpen = true;

        try {
          await this.auth0Client.loginWithPopup(o);
        } catch (e) {
          // eslint-disable-next-line
          console.error(e);
        } finally {
          this.popupOpen = false;
        }

        this.user = await this.auth0Client.getUser();
        this.isAuthenticated = true;
        if (this.isAuthenticated) {
          this.token = await this.auth0Client.getTokenSilently();
          this.jwt = await this.auth0Client.getIdTokenClaims();
          this.$api.defaults.headers.common['Authorization'] = `Bearer ${this.jwt.__raw}`;
          this.$api.defaults.headers.common['Email'] = this.user.email;
        } else {
          this.token = null;
          this.jwt = null;
          this.$api.defaults.headers.common['Authorization'] = null;
          this.$api.defaults.headers.common['Username'] = null;
          this.$api.defaults.headers.common['Email'] = null;
        }
      },
      /** Handles the callback when logging in using a redirect */
      async handleRedirectCallback() {
        this.loading = true;
        try {
          await this.auth0Client.handleRedirectCallback();
          this.user = await this.auth0Client.getUser();
          this.isAuthenticated = true;
        } catch (e) {
          this.error = e;
        } finally {
          this.loading = false;
        }
      },
      /** Update state vars as per auth state */
      async updateStateVars() {
        this.isAuthenticated = await this.auth0Client.isAuthenticated();
        this.user = await this.auth0Client.getUser();
        if (this.isAuthenticated) {
          this.token = await this.auth0Client.getTokenSilently();
          this.jwt = await this.auth0Client.getIdTokenClaims();
          this.$api.defaults.headers.common['Authorization'] = `Bearer ${this.jwt.__raw}`;
          this.$api.defaults.headers.common['Username'] = this.user.nickname;
          this.$api.defaults.headers.common['Email'] = this.user.email;
        } else {
          this.token = null;
          this.jwt = null;
          this.$api.defaults.headers.common['Authorization'] = null;
          this.$api.defaults.headers.common['Username'] = null;
          this.$api.defaults.headers.common['Email'] = null;
        }
      },
      /** Authenticates the user using the redirect method */
      loginWithRedirect(o) {
        return this.auth0Client.loginWithRedirect({connection: 'TT-SSO'});
      },
      /** Returns all the claims present in the ID token */
      getIdTokenClaims(o) {
        return this.auth0Client.getIdTokenClaims(o);
      },
      /** Returns the access token. If the token is invalid or missing, a new one is retrieved */
      getTokenSilently(o) {
        return this.auth0Client.getTokenSilently(o);
      },
      /** Gets the access token using a popup window */

      getTokenWithPopup(o) {
        return this.auth0Client.getTokenWithPopup(o);
      },
      /** Logs the user out and removes their session on the authorization server */
      logout(o) {
        return this.auth0Client.logout(o);
      }
    },
    /** Use this lifecycle method to instantiate the SDK client */
    async created() {
      // Create a new instance of the SDK client using members of the given options object
      this.auth0Client = await createAuth0Client({
        domain: options.domain,
        client_id: options.clientId,
        audience: options.audience,
        redirect_uri: redirectUri,
        cacheLocation: 'localstorage'
      });

      try {
        // If the user is returning to the app after authentication...
        if (
          window.location.search.includes("code=") &&
          window.location.search.includes("state=")
          ) {
          // handle the redirect and retrieve tokens
          const { appState } = await this.auth0Client.handleRedirectCallback();

          await this.updateStateVars();

          if (this.isAuthenticated) {
            await this.$api.post('/api/user', this.user).then(returnedUser => {
              this.userDB = returnedUser.data;
              store.commit('setUser', this.userDB);
            });
          }

          // Notify subscribers that the redirect callback has happened, passing the appState
          // (useful for retrieving any pre-authentication state)
          await onRedirectCallback(appState);
        }
      } catch (e) {
        console.log(e);
        this.error = e;
      } finally {
        await this.updateStateVars();
        this.loading = false;
      }
    }
  });

  return instance;
};

// Create a simple Vue plugin to expose the wrapper object throughout the application
export const Auth0Plugin = {
  install(Vue, options) {
    Vue.prototype.$auth = useAuth0(options);
  }
};
