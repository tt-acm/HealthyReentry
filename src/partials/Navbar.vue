<template>
  <div>
    <md-toolbar class="md-primary" id="appHeader">
      <router-link class="md-title" :to="{ name: 'menu' }">
        <span>Healthy Reentry</span>
        <small style="color:lightblue;margin-left:4px"><i>beta</i></small>
      </router-link>
      <!-- <a  href="/">
        <span>Healthy Reentry</span>
        <small style="color:lightblue;margin-left:4px"><i>beta</i></small>
      </a> -->

      <md-badge v-if="$auth.isAuthenticated && $auth.userDB" class="md-accent" style="margin-left:auto;margin-top:2px;">
        <md-menu md-size="small" md-align-trigger>
          <md-button class="md-icon-button" style="width=32px" md-menu-trigger>
            <md-avatar style="transform: scale(0.8);">
              <!-- <img src="https://gravatar.com/avatar/4dacc85086497a31cf2c646031d2cb01?d=retro" alt="Avatar"> -->
              <img :src="$auth.userDB.picture" alt="Avatar">
            </md-avatar>
          </md-button>

          <md-menu-content>
            <md-menu-item disabled>{{$auth.userDB.name}}</md-menu-item>
            <md-menu-item>
              <router-link :to="{ name: 'admin' }">
                Admin View
              </router-link>
            </md-menu-item>
            <!-- <md-menu-item>Profile</md-menu-item> -->
            <md-menu-item @click="logout()">Log out</md-menu-item>
          </md-menu-content>
        </md-menu>
      </md-badge>
      <a v-else class="md-title md-dense mr-2" style="margin-left:auto" @click="login()" href="#!">
        Login
      </a>

    </md-toolbar>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  methods: {
    login() {
      // console.log(this.$route.fullPath);
      // this.$auth.loginWithRedirect();
      // this.$auth.loginWithRedirect({ appState: { targetUrl: this.$route.fullPath }});
      if (this.$auth.isAuthenticated === false) this.$auth.loginWithRedirect();
    },
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
    }
  }
}
</script>

<style scoped>
#appHeader {
  position: fixed;
  width: 100%;
  background-color: rgb(52, 58, 64);
}
</style>
