<template>
<div class="md-layout">
  <md-content>
    <md-dialog :md-active="showDialog" :md-fullscreen="true">
      <md-dialog-title class="mb-3 pb-3">Disclosure &amp; Consent</md-dialog-title>
      <md-dialog-content>
        <h6>Disclosure:</h6>

        <md-content class="p-3">
          <p class="mb-2">
            At Thornton Tomasetti, our first priority – now and always – is the health and safety of our employees.
            <br>
            <br>
            The COVID-19 outbreak has challenged us to find creative ways to best protect our employees.
            <br>
            <br>
            We respect your privacy. As we continue to monitor COVID-19 and its impact on our people and offices, it is important that designated members of the firm are aware of your work location and COVID-19 status. In order to continue to make decisions based on what is best for all employees’ safety and our business, we ask that you record the items listed below securely and confidentially within the application:
          </p>
          <ol class="text-muted mb-2 pl-3">
            <li>your personal COVID-19 status through a series of colors (green, orange and red).</li>
            <li>your current work location.</li>
            <li>your vaccination record.</li>
          </ol>
          <i class="mb-2">
            Note: All of the items above will be viewed by designated members of our Talent Team [Dan Stauthamer (Chief Human Resources Officer), Sarina Singh (Director, Talent Partner) and Gwendolyn Dowdy (Senior Talent Operations Coordinator)] while management will only have access to items #2 and #3.
          </i>
        </md-content>

        <hr>

        <h6>Consent:</h6>

        <md-content class="p-3">
          <p class="mb-1">
            Your consent is requested to record your status on Healthy Reentry. Please read and accept the terms below.
            <br>
            <i class="text-muted">
              The information you provide should strictly relate to COVID-19 and will be used for the purpose of protecting you and your colleagues while continuing to run the business.
            </i>
          </p>

          <p class="card-text p-1 mt-4">
            I hereby authorize the previously mentioned individuals to have access to my COVID-19 status.
            <br>
            <br>
            I understand that my status will be kept confidential and is being used only to reduce and prevent the spread of COVID-19 while successfully running the business. Further, I understand that by acknowledging this statement, I am sharing this information confidentially with the personnel previously listed.
            <br>
            <br>
            I certify that my consent for the release of this information is voluntary. I also understand the following:
            <ul class="pl-3 my-1">
              <li>Information about the spread of COVID-19 is in the firm’s legitimate interest.</li>
              <li>I have the right to revoke this authorization at any time. In order to revoke this authorization, I must do so in writing and submit it to Dan Stauthamer.</li>
              <li>The company may use the confidential disclosure of my COVID-19 health status to make key decisions in order to keep our offices safe. My name will remain confidential unless I provide written consent.</li>
              <li>The company may use the confidential disclosure of my vaccinated status to make key business decisions including sharing my name and vaccination status with a project manager/office director/client if (1) my role requires site visits, in-person client meetings or similar in-person duties and (2) a client requests only fully vaccinated employees for in-person activities.</li>
              <li>I will receive an email acknowledgement of this consent.</li>
            </ul>
          </p>

          <i>
            <b>Note:</b>
            Using the application is not in any way a condition of your employment at Thornton Tomasetti. However, it is your duty to report infectious disease to the firm. On the grounds of containing the virus and for the safety of other employees, we require disclosure of your health status as it pertains to COVID-19. Additionally, we encourage you to record your vaccination data within the application.
            <br/>
            If you choose not to report using the app, contact Gwendolyn Dowdy directly.
          </i>

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
