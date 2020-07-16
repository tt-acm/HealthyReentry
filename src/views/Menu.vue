<template>
<!-- <div class="mx-auto" style="transform: translateY(150%)"> -->
<div>
  <div v-if="latestStatus" class="card mx-auto" id="statusCard" style="margin-top: 10px;">
    <div class="card-body p-2 text-white" id="statusCardBackground" :style="styleObject">
      <h6 class="ml-auto mt-auto mb-0">
        <b>Last Updated on:</b> {{showDisplayDate(new Date(latestStatus.date), 'll')}} as {{status[latestStatus.status]}}
      </h6>
    </div>
  </div>
  <div class="mx-5 center" id="mainControls">
    <md-list v-if="user" id="controlButtons">
      <md-list-item>
        <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent" @click="showDialog = true">
          Change Work Location Status
        </button>
      </md-list-item>
      <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'status', params: { id: user._id}}">
          <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent">
            Report Your Status
          </button>
          <!-- <md-button class="md-raised md-accent menu-button">
            <h6 class="my-3 text-white">Report Your Health Status</h6>
          </md-button> -->
        </router-link>
      </md-list-item>

      <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'encounter', params: { id: user._id}}">
          <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent">
          Record a TT Encounter
        </button>
          <!-- <md-button class="md-raised md-accent menu-button" style="margin-top: 16px;">
            <h6 class="mb-0 text-white">Record a TT Encounter</h6>
          </md-button> -->
        </router-link>
      </md-list-item>

      <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'displayqr', params: { id: user._id}}">
          <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent">
          Display QR Code
        </button>
          <!-- <md-button class="md-raised md-accent menu-button" style="margin-top: 16px;">
            <h6 class="mb-0 text-white">Display QR Code</h6>
          </md-button> -->
        </router-link>
      </md-list-item>
      <!-- </div> -->
    </md-list>
  </div>


  <!-- Reentry option modal -->
  <md-content>
    <md-dialog :md-active="showDialog">
      <md-dialog-title class="pb-0 mb-2">
        Check in - Work Location
      </md-dialog-title>

      <md-dialog-content>
        <span class="text-muted" v-if="latestPreference">
          Last submitted as <b>{{latestPreference.office}}</b> at {{showDisplayDate(latestPreference.createdAt, 'lll')}}
        </span>

        <h6 class="my-4">Complete the sentence below by selecting the appropriate response.</h6>

        <md-content class="px-1">
          <span class="d-flex mt-3">Today I will be _______.</span>
          <md-radio v-model="reentryOpt" value="0" class="md-primary d-flex">Working Remotely <small>(Default)</small></md-radio>
          <md-radio v-model="reentryOpt" value="1" class="md-primary d-flex">
            Working in the office
            <div v-show="reentryOpt == 1" class="md-layout-item">
              <md-field>
                <md-select name="offices" id="offices" v-model="userOffice">
                  <md-option v-for="o in offices" :key="o" :value="o">
                    {{o}}
                  </md-option>
                </md-select>
              </md-field>
            </div>
          </md-radio>

          <div class="form-check ml-1" style="margin-top: 70px">
            <input class="form-check-input" type="checkbox" id="defaultCheck1" v-model="confirmOffice">
            <label class="form-check-label" for="defaultCheck1">
              I agree with my selection above.
            </label>
          </div>
        </md-content>
      </md-dialog-content>

      <md-dialog-actions>
        <!-- <button type="button" class="btn btn-md text-white" @click="showDialog = false">
          <router-link :to="{ name: 'home' }"> <p class="mb-0 text-muted">Close</p> </router-link>
        </button> -->
        <button type="button" class="btn btn-md text-white md-accent" @click="showDialog = false;submit()" :disabled="!confirmOffice">
          Submit
        </button>
      </md-dialog-actions>
    </md-dialog>
  </md-content>
</div>
</template>
<script>
// import store from "store/index.js";
const statusColors = ["#00C851", "#FF9800", "#DC3545"]

import Vuex from 'vuex';

export default {
  // props: ["user"],
  created() {
    this.$api.get("/api/status/get-current").then(returnedStatus => {
      this.latestStatus = returnedStatus.data;
      this.styleObject.backgroundColor = statusColors[returnedStatus.data.status];
    });

    this.$api.get("/api/user/get-available-offices").then(offices => {
      this.offices = offices.data;
      if (this.offices && this.offices.length > 0) {
        const officeIndex = this.offices.indexOf(this.user.location);
        if (officeIndex !== -1) this.userOffice = this.offices[officeIndex];
      }
    });

    this.$api.get("/api/workPreference/get-latest").then(preference => {
      if (preference.data === null) this.showDialog = true;//if no preference, then show modal
      this.latestPreference = preference.data;
    });
  },
  mounted() {
    this.mapButtonCSS();

    this.userOffice = this.user.location;
  },
  updated() {
    this.mapButtonCSS();
  },
  data() {
    return {
      latestStatus: null,
      styleObject: {
        backgroundColor: 'lightgray'
        // fontSize: '13px'
      },
      status: ["Green - No Signs or Symptoms",
        "Orange - Possible Exposure",
        "Red - Positive Diagnosis"
      ],
      showDialog: false,
      reentryOpt: "0",
      country: null,
      userOffice: null,
      offices: [],
      confirmOffice: false,
      latestPreference: null
    };
  },
  computed: Vuex.mapState({
    user: state => state.user,
  }),
  methods: {
    submit() {
      let reqBody = {
        "office": this.userOffice
      };

      if (this.reentryOpt == 0) reqBody.office = "Remote";

      this.$api.post("/api/workPreference/add", reqBody).then(offices => {
        if (offices.data) this.showDialog = false;
        this.latestPreference = offices.data;
      });
    },
    mapButtonCSS() {
      const buttonWidth = screen.width * 0.6 > 310 ? screen.width * 0.7 : 310;
      window.$(".btn-lg").css("width", buttonWidth + 'px');
      window.$("#statusCard").css("width", buttonWidth + 'px');
    },
    showDisplayDate(date, format) {
      return this.moment(date).format(format);
    }
  }
};
</script>

<style scoped>
.md-button {
  height: 7vh;
  /* background-color: #72DDF7; */
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 65vh;
  /* border: 3px solid green; */
}
</style>
