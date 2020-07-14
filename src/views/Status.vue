<template>
<div>
  <!-- <div class="d-flex"> -->
  <h4 class="text-muted">Report Your Health Status</h4>
  <p v-if="latestStatus" class="ml-auto mt-auto mb-0"> <b>Last Updated on:</b> {{showDisplayDate(new Date(latestStatus.date))}} as {{status[latestStatus.status]}}</p>
  <!-- </div> -->

  <!-- <hr class="mt-2 mb-0" /> -->

  <div class="card mt-2 mb-0">
    <div class="card-body bg-info p-2 text-white">
      <p class="mb-2">
        Click on a color to see the definition, then select the appropriate color that matches your current status in regards to COVID-19. Click <b>Next</b>.
      </p>
      <p class="mb-0">
        <i>If you are seeing colors with a strike through, you are unable to select them due to your previously selected status.</i>
      </p>
    </div>
  </div>

  <!-- <small>Please be sure to update your status color at least once per week, or more often if necessary.</small> -->

  <md-tabs class="mt-3" md-alignment="fixed" :md-active-tab="activeTab" style="min-height: 270px">
    <md-tab class="px-0" id="tab-green" md-label="Green" :md-icon="iconPath[0]" @click="selectedStatus=0">
      <div v-if="latestStatus.status === 0 || latestStatus.status === 3">
        <h5 class="mt-2">No Signs or Symptoms</h5>
        <ul class="pl-3 mb-2">
          <li>Not sick (asymptomatic), <b>AND</b></li>
          <li>No known exposure to any symptomatic or COVID-positive individuals.</li>
          <hr class="my-2">
          <li>Fully recovered and cleared by a healthcare provider, or tested negative after possible exposure.</li>
        </ul>

        <div class="card mt-2">
          <div class="card-body bg-light p-1">
            <small class="mb-1">
              Click on <b>Orange</b> to see a list of COVID-19 symptoms.
            </small>
          </div>
        </div>
      </div>
      <div v-else>
        <h5 class="text-muted mt-2">No Signs or Symptoms</h5>
        <ul class="pl-3 mb-0 text-muted">
          <li>Not sick (asymptomatic), <b>AND</b></li>
          <li>No known exposure to any symptomatic or COVID-positive individuals.</li>
          <hr class="my-2">
          <li>Fully recovered and cleared by a healthcare provider, or tested negative after possible exposure.</li>
        </ul>

        <div class="card mt-2">
          <div class="card-body bg-light p-1">
            <small class="mb-1">
              Click on <b>Orange</b> to see a list of COVID-19 symptoms.
            </small>
          </div>
        </div>
      </div>



    </md-tab>
    <md-tab class="px-0" id="tab-orange" md-label="Orange" :md-icon="iconPath[1]" @click="selectedStatus=1">
      <div v-if="latestStatus.status < 2 || latestStatus.status === 3">
        <h5 class="mt-2">Possible Exposure</h5>
        <ul class="pl-3 mb-0">
          <li>Symptomatic of COVID-19, <b>OR</b></li>
          <li>Awaiting personal test results of COVID-19, <b>OR</b></li>
          <li>Had in-person contact with symptomatic individuals or someone who has tested positive for COVID-19, <b>OR</b></li>
          <li>Travel quarantine requirement.</li>
        </ul>
        <!-- <div class="card mt-2">
          <div class="card-body bg-light p-1">
            <small class="mb-0 d-flex">
              <b style="margin-top:2px">Symptoms of COVID-19</b>
              <a class="m-0 p-0 ml-2" href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html" target="blank">
                <md-icon class="md-size-1x m-0" md-src="/imgs/info-circle-solid-small.svg"></md-icon>
              </a>
            </small>
            <small class="mb-0">
              <ul class="pl-3 mb-0">
                <li>Fever or chills</li>
                <li>Cough</li>
                <li>Shortness of breath or difficulty breathing</li>
                <li>Fatigue</li>
                <li>Muscle or body aches</li>
                <li>Headache</li>
                <li>New loss of taste or smell</li>
                <li>Sore throat</li>
                <li>Congestion or runny nose</li>
                <li>Nausea or vomiting</li>
                <li>Diarrhea</li>
              </ul>
            </small>
          </div>
        </div> -->
      </div>
      <div v-else>
        <h5 class="text-muted mt-2">Possible Exposure</h5>
        <ul class="pl-3 mb-0 text-muted">
          <li>Symptomatic of COVID-19, <b>OR</b></li>
          <li>Awaiting personal test results of COVID-19, <b>OR</b></li>
          <li>Had in-person contact with symptomatic individuals or someone who has tested positive for COVID-19, <b>OR</b></li>
          <li>Travel quarantine requirement.</li>
        </ul>
        <!-- <div class="card mt-2">
          <div class="card-body bg-light p-1">
            <small class="mb-0 d-flex">
              <b style="margin-top:2px">Symptoms of COVID-19</b>
              <a class="m-0 p-0 ml-2" href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html" target="blank">
                <md-icon class="md-size-1x m-0" md-src="/imgs/info-circle-solid-small.svg"></md-icon>
              </a>
            </small>
            <small class="mb-0">
              <ul class="pl-3 mb-0">
                <li>Cough</li>
                <li>Shortness of breath or difficulty breathing</li>
                <li>Fever</li>
                <li>Chills</li>
                <li>Muscle pain</li>
                <li>Sore throat</li>
                <li>New loss of taste or smell</li>
              </ul>
            </small>
          </div>
        </div> -->
      </div>



    </md-tab>
    <md-tab class="px-0" id="tab-red" md-label="Red" :md-icon="iconPath[2]" @click="selectedStatus=2">
      <h5 class="mt-2">Positive Diagnosis</h5>
      <ul class="pl-3 mb-0">
        <li>Taken a COVID-19 test and received a positive result, <b>OR</b></li>
        <li>Received an isolation order from your country, state or local government, or a public health authority.</li>
      </ul>
    </md-tab>
    <!-- <md-tab class="px-0" id="tab-blue" md-label="Blue" :md-icon="iconPath[3]" @click="selectedStatus=3">
      <h5 class="text-muted mt-2">Recovered (disbled)</h5>
      <ul class="pl-3 mb-2 text-muted">
        <li>Has fully recovered, <b>AND</b></li>
        <li>Cleared by a healthcare provider. </li>
      </ul>
    </md-tab> -->
  </md-tabs>

  <!-- Button trigger modal -->
  <md-list>
    <md-list-item class="mx-auto">
      <!-- <md-button class="md-primary md-raised" @click="showDialog=!showDialog" :disabled="disableSubmit" id="nextBtn" style="width:240px">
        <h6 class="mb-0">Next</h6>
      </md-button> -->
      <button type="button" class="btn btn-lg btn-block text-white md-accent" @click="showDialog=!showDialog" :disabled="disableSubmit" id="nextBtn" style="width:240px">
        Next
      </button>
    </md-list-item>

    <md-list-item class="mx-auto">
      <router-link :to="{ name: 'menu' }">
        <p class="text-muted">Back</p>
      </router-link>
    </md-list-item>
  </md-list>

  <!-- <button v-if="disableSubmit===false" type="button" class="btn btn-primary btn-lg btn-block text-white" data-toggle="modal" data-target="#exampleModalLong">
    Next
  </button> -->
  <!-- <div v-else class="btn btn-lg btn-block text-white" style="backgroundColor:#b8b8b8">
    <md-tooltip md-direction="top" class="bg-danger">Cannot select this color; contact Lizette Agostini.</md-tooltip>
    Next (disabled)
  </div> -->

  <!-- <div class="text-center mt-0 mb-5pr-2 btn btn-lg btn-block">
    <router-link :to="{ name: 'menu' }">Back</router-link>
  </div> -->

  <br>
  <br>



  <!-- Modal -->
  <md-dialog :md-active.sync="showDialog" :md-fullscreen="false">
    <md-dialog-title>Review Your Health Status</md-dialog-title>
    <md-subheader class="mx-2 mb-0">
      Review the details below then click <b class="ml-1 mr-0 px-0">Submit</b>. To edit, click <b class="ml-1 mr-0 px-0">Go Back</b>.
    </md-subheader>
    <md-content class="mx-4">

      <div class="card mx-auto">
        <div class="card-header">
          <h6>Status Detail</h6>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><b class="mr-2">Name:</b> {{user.name}}</li>
          <li class="list-group-item"><b>Status:</b>
            <div class="col mt-2 text-center">
              <md-icon :md-src="iconPath[selectedStatus]" />
              <p class="my-2">{{status[selectedStatus]}}</p>
            </div>
          </li>
        </ul>
      </div>
    </md-content>



    <md-dialog-actions class="mx-4 my-2">
      <md-button @click="showDialog=false">Go Back</md-button>
      <md-button class="md-accent md-raised text-white" @click="showDialog=false; submitEncounter()">Submit</md-button>
    </md-dialog-actions>
  </md-dialog>

  <!-- notifications -->

</div>
</template>
<script>
// import store from "store/index.js";
import Vuex from 'vuex';

var tabIds = ["tab-green", "tab-orange", "tab-red", "tab-blue"]
export default {
  created() {
    this.$api.get("/api/status/get-current").then(returnedStatus => {
      var curStatus = returnedStatus.data;
      if (curStatus) {
        this.latestStatus = curStatus;

        if (curStatus.status !== null) {
          this.activeTab = tabIds[curStatus.status];
          this.selectedStatus = curStatus.status;

          if (this.latestStatus.status === 3 || this.latestStatus.status === 0) this.disableSubmit = false; //always disabled for blue

          if (this.latestStatus.status !== 3) { //hahs status and not blue
            if (this.latestStatus.status > 0) { //either orange or red
              this.iconPath[0] = "/imgs/lens-green-disabled2.svg"
              if (this.latestStatus.status === 2) this.iconPath[1] = "/imgs/lens-orange-disabled2.svg" //red
            }
          }
        }
      } else {
        this.selectedStatus = 0; //default to green
      }
    });
  },
  mounted() {

    // TEST TEST TEST
    // use this when status submitted -- this saves number
    // $.post("/api/encounters/get-graph", { status: "yellow"}).then(getEncounters => {
    //  console.log("encounters in last 14 days", getEncounters);
    // });
    // use this when status change to yellow and up critical ones... this need string
    // $.post("/api/status/report", { status: 1 }).then(savedStatus => {
    //  console.log("status Saved", savedStatus);
    // });
    const buttonWidth = screen.width * 0.6 > 280 ? screen.width * 0.7 : 280;

    // window.$("#nextBtn").css("width", buttonWidth + 'px');


  },
  data() {
    return {
      showDialog: false,
      submitSuccess: false,
      notificationDuration: 4000,
      selectedStatus: null,
      latestStatus: {
        status: 0
      },
      enableBlue: false,
      disableSubmit: false,
      status: ["Green - No Signs or Symptoms",
        "Orange - Possible Exposure",
        "Red - Positive Diagnosis"
      ],
      activeTab: "tab-green",
      iconPath: [
        "/imgs/lens-green.svg",
        "/imgs/lens-orange.svg",
        "/imgs/lens-red.svg"
      ]
    };
  },
  watch: {
    selectedStatus() {
      this.disableSubmit = true;
      if (typeof this.selectedStatus === "number") {

        if (this.latestStatus.status === 3 || this.latestStatus.status === 0) this.disableSubmit = false; //always disabled for blue
        else { //selected green, orange, and red
          if (this.latestStatus.status === 0) this.disableSubmit = false;
          else if (this.latestStatus.status === 1) { //cur status is orange
            if (this.selectedStatus === 1 || this.selectedStatus === 2) this.disableSubmit = false
          } else if (this.latestStatus.status === 2) { //cur status is red
            if (this.selectedStatus === 2) this.disableSubmit = false
          }
        }
      }
    }
  },
  computed: Vuex.mapState({
    user: state => state.user,
  }),
  methods: {
    showDisplayDate(date) {
      return this.moment(date).format('ll');
    },
    submitEncounter() {
      // use this when status submitted -- this saves number
      const body = {
        status: this.selectedStatus
      }
      this.$api.post("/api/status/report", body).then(savedStatus => {
        this.latestStatus = savedStatus;

        if (savedStatus) {
          this.$emit("statusMsg");

          this.$router.push({
            name: 'menu'
          }); //return back to menu after saving

        }
      });
    }
  }
};
</script>

<style scoped>
.md-tabs+.md-tabs {
  margin-top: 24px;
}
.md-dialog /deep/ .md-dialog-container {
  transform: none;
}
</style>
