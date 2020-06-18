<template>
<div class="md-layout">
  <md-content>
    <md-dialog :md-active="showDialog">
      <md-dialog-title class="mb-3 pb-3">Disclosure &amp; Consent</md-dialog-title>
      <md-dialog-content>
        <h6>Disclosure:</h6>

        <md-content class="p-3">
          <p class="mb-2">
            We respect your privacy. As we continue to monitor COVID-19 and its impact on our people and offices, it is important that designated members of our Talent Team are aware of COVID-19 related cases at our firm. To protect all of our
            employees, the {{appName}} application will allow you to securely and confidentially record:
          </p>
          <p class="text-muted mb-2">
            1. your personal COVID-19 status through a series of colors (green, orange and red).
            <br>
            2. your in-person interactions with fellow employees at work and/or during work events that do not adhere to the firm’s guidance on social distancing.
          </p>
          <p class="mb-2">
            We ask that you share your COVID-19 health status and potential exposures with designated members of our Talent Team so we can continue to make decisions based on what is best for all employees’ safety and our business. The information
            will <b>ONLY</b> be viewed by Lizette Agostini (Benefits Manager), Sarina Singh (Senior Talent Partner) and Dan Stauthamer (Chief Human Resources Officer).
          </p>
        </md-content>

        <hr>

        <h6>Consent:</h6>

        <md-content class="p-3">
          <p class="mb-1">
            Your consent is required to report your status on Encounter. Please read and accept the terms below.
            <br>
            <small><i>The information you provide should strictly relate to COVID-19 and will be used for the sole purpose of protecting you and your colleagues.</i>
            </small>
          </p>

          <p class="card-text p-1">
            I hereby authorize the previously mentioned Talent Team employees to have access to my COVID-19 status.
            <br>
            <br>
            I understand that my status will be kept confidential and is being used solely to reduce and prevent the spread of COVID-19. Further, I understand that by acknowledging this statement, I am sharing this information confidentially with
            the Talent Team personnel previously listed.
            <br>
            <br>
            I certify that my consent for the release of this information is voluntary. I also understand the following:
            <ul class="pl-3 mb-1">
              <li>Information about the spread of COVID-19 is in the firm’s legitimate interest.</li>
              <li>I have the right to revoke this authorization at any time. In order to revoke this authorization, I must do so in writing and submit it to Lizette Agostini.</li>
              <li>The company may use the confidential disclosure of my COVID-19 status to make key decisions in order to keep our offices safe. My name will remain confidential unless I provide written consent.</li>
              <li>I will receive an email acknowledgement of this consent.</li>
            </ul>
          </p>

          <small>
            Note: Using the application is not in any way a condition of your employment at {{company}}.
            However, it is your duty to report infectious disease to the firm. On the grounds of containing the virus and for the safety of other employees, we require disclosure. If you choose not to report using the app, contact Lizette Agostini
            directly.
          </small>

          <div class="form-check mt-4 ml-1">
            <input class="form-check-input" type="checkbox" id="defaultCheck1" v-model="consentBool">
            <label class="form-check-label" for="defaultCheck1">
              I agree with the terms listed above.
            </label>
          </div>

        </md-content>




      </md-dialog-content>

      <md-dialog-actions>
        <!-- <md-button class="md-primary text-muted" @click="showDialog = false">
          <router-link :to="{ name: 'home' }"> <p class="mb-0 text-muted">Close</p> </router-link>
        </md-button> -->
        <button type="button" class="btn btn-md text-white" @click="showDialog = false">
          <router-link :to="{ name: 'home' }"> <p class="mb-0 text-muted">Close</p> </router-link>
        </button>
        <button type="button" class="btn btn-md text-white md-accent" @click="showDialog = false;submit()" :disabled="!consentBool">
          Submit
        </button>
        <!-- <md-button class="md-primary text-white" @click="showDialog = false;submit()" :disabled="!consentBool">Submit</md-button> -->
      </md-dialog-actions>
    </md-dialog>
  </md-content>

  <!-- <md-button class="md-primary md-raised" @click="showDialog = true">Show Dialog</md-button> -->

</div>
</template>
<script>
export default {
  props: ["user"],
  created() {},
  mounted() {
    // $(window).on('load',function(){
    //     $('#exampleModalLong').modal('show');
    // });
    // window.$('#disclosure').modal('show');
  },
  data() {
    return {
      consentBool: false,
      showDialog: true,
      fullScreen: false,
      company: process.env.VUE_APP_COMPANY,
      appName: process.env.VUE_APP_NAME
    };
  },
  methods: {
    submit: function() {
      // console.log("submitting");
      this.$api.get("/api/user/consent-signed").then(consent => {
        this.$emit("disclosureMsg");
        this.$router.push({ name: 'menu' });
      });


    }
  }
};
</script>

<style scoped>
.home-intro {
  text-align: center;
}

/* .md-dialog{ -webkit-transform: translate(0%,0%); transform: translate(0%,0%); } */
.md-dialog /deep/ .md-dialog-container {
  transform: none;
}

.md-card {
  border-style: solid;
  border-width: 1px;
  border-color: lightgray;
}

/* .md-card-header {
  background-color: #f2f2f2;
} */

.md-dialog-title {
  background-color: #f2f2f2;
}
</style>
