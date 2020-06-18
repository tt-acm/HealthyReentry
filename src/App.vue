<template>
<div class="page-container" id="app">
  <Navbar />
  <!-- <hr /> -->
  <!-- <md-content class="mx-3" style="max-width:600px"> -->
  <md-content class="mx-auto" style="padding-top:75px;padding-bottom:40px;">
    <router-view class="px-3" @disclosureMsg="disclosureMsg" @statusMsg="statusMsg" @encounterMsg="encounterMsg"/>
  </md-content>

  <!-- Notifications -->
  <md-snackbar md-position="center" :md-duration="notificationDuration" :md-active.sync="showDisclosureMsg" md-persistent class="px-2" style="margin-bottom:55px; background-color: #004050">
    <span> Your consent has been submitted. A copy of the disclosure and consent has been sent to your {{companyInitials}} email for reference (keep an eye out for an email from {{sender}}).</span>
  </md-snackbar>
  <md-snackbar md-position="center" :md-duration="notificationDuration" :md-active.sync="showStatusMsg" md-persistent style="margin-bottom:55px; background-color: #004050">
    <span> Status successfully recorded.</span>
  </md-snackbar>
  <md-snackbar md-position="center" :md-duration="notificationDuration" :md-active.sync="showEncounterMsg" md-persistent style="margin-bottom:55px; background-color: #004050">
    <span> Encounter submitted successfully.</span>
  </md-snackbar>

  <Footer />
</div>
</template>

<script>
import Navbar from '@/partials/Navbar.vue'
import Footer from '@/partials/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      notificationDuration: 4000,
      showDisclosureMsg: false,
      showStatusMsg: false,
      showEncounterMsg: false,
      companyInitials: process.env.VUE_APP_COMPANY_INITIALS,
      sender:process.env.SENDGRID_EMAIL
    };
  },
  mounted() {
  },
  methods: {
    statusMsg: function(alerts) { this.showStatusMsg = true; },
    disclosureMsg: function() { this.showDisclosureMsg = true; },
    encounterMsg: function() { this.showEncounterMsg = true; },
  }
}
</script>

<style>
#appFooter {
  position: fixed;
  left: 0;
  top: auto;
  bottom: 0;
  width: 100%;
  background-color: rgb(52, 58, 64);
  /* color: white; */
  /* text-align: center; */
}

/* #app {
  height: 100vh-80px;
} */
.md-dialog /deep/ .md-dialog-container {
  transform: none;
}

</style>
