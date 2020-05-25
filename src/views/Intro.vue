<template>
  <div>
    <div class="row mt-4 home-intro">
      <div class="col">
        <div>
          <!-- <h3>Welcome to Encounter!</h3> -->
          <p>At Thornton Tomasetti, our first priority – now and always – is the health and safety of our employees.
            <br>
            <br>
            The COVID-19 outbreak has challenged us to find creative ways to <b>best protect our employees.</b>
          </p>
          <!-- <a class="btn btn-primary btn-lg text-white mb-4" align="center" style="width: 300px; border-radius: 10px; margin-top: 125px;">

            Get Started &raquo;
          </a> -->
          <!-- <router-link :to="{ name: 'menu' }"> -->
            <md-button class="md-primary md-raised" style="width:280px" @click="login()">
               Get Started &raquo;
            </md-button>
          <!-- </router-link> -->
          <!-- <a class="btn btn-primary" href="/users/login-tt">Get Started</a> -->
          <div><a class="btn btn-link" href="https://core-studio.gitbook.io/healthy-reentry/testing-guidence/guide" target="_blank">Directions</a> </div>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  // props: ["user"],
  created() {
  },
  data() {
    return {
    };
  },
  methods: {
    login() {
      if (this.$auth.isAuthenticated === false) this.$auth.loginWithRedirect();
      // console.log("this.$auth", this.$auth);
      // console.log(this.$route.fullPath);
      // this.$auth.loginWithRedirect();
      //
    }
  }
};
</script>

<style scoped>
.home-intro {
  text-align: center;
}
</style>
