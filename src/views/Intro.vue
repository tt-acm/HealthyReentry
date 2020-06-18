<template>
  <div>
    <div class="row mt-4 home-intro">
      <div class="col">
        <div>
          <img src="/imgs/logo-256.png" alt="healthy reentry logo" style="margin-bottom: 30px">
          <!-- <h3>Welcome to Encounter!</h3> -->
          <p>At {{company}}, our first priority – now and always – is the health and safety of our employees.
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
          <div><a class="btn btn-link" :href="url" target="_blank">Directions</a> </div>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  created() {
  },
  data() {
    return {
        url: process.env.VUE_APP_DOC_URL,
        company: process.env.VUE_APP_COMPANY
    }
},
  methods: {
    login() {
      window.location.href= (process.env.VUE_APP_LOCALBACKEND_URL || "") + "/login"
    }
  }
};
</script>

<style scoped>
.home-intro {
  text-align: center;
}
</style>
