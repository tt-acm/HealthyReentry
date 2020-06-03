<template>
<!-- <div class="mx-auto" style="transform: translateY(150%)"> -->
<div>
  <div v-if="latestStatus" class="card mx-auto" id="statusCard" style="margin-top: 10px;">
    <div class="card-body p-2 text-white" id="statusCardBackground" :style="styleObject">
      <h6 class="ml-auto mt-auto mb-0">
        <b>Last Updated on:</b> {{showDisplayDate(new Date(latestStatus.date))}} as {{status[latestStatus.status]}}
      </h6>
    </div>
  </div>
  <div class="mx-5 center" id="mainControls">
    <md-list v-if="user" id="controlButtons">
      <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'status', params: { id: user._id}}">
          <!-- <button type="button" class="btn btn-lg btn-block btn-outline-primary text-center my-2">
          Report Your Health Status
        </button> -->
          <md-button class="md-raised md-accent menu-button">
            <h6 class="my-3 text-white">Report Your Health Status</h6>
          </md-button>
        </router-link>
      </md-list-item>

      <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'encounter', params: { id: user._id}}">
          <!-- <button type="button" class="btn btn-lg btn-block btn-outline-primary text-center my-2">
          Record a TT Encounter
        </button> -->
          <md-button class="md-raised md-accent menu-button" style="margin-top: 16px;">
            <h6 class="mb-0 text-white">Record a TT Encounter</h6>
          </md-button>
        </router-link>
      </md-list-item>

      <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'displayqr', params: { id: user._id}}">
          <!-- <button type="button" class="btn btn-lg btn-block btn-outline-primary text-center my-2">
          Display QR Code
        </button> -->
          <md-button class="md-raised md-accent menu-button" style="margin-top: 16px;">
            <h6 class="mb-0 text-white">Display QR Code</h6>
          </md-button>
        </router-link>
      </md-list-item>
      <!-- </div> -->
    </md-list>
  </div>
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
    })
  },
  mounted() {
    this.mapButtonCSS();
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
    };
  },
  computed: Vuex.mapState({
    user: state => state.user,
  }),
  methods: {
    mapButtonCSS() {
      const buttonWidth = screen.width * 0.6 > 310 ? screen.width * 0.7 : 310;

      // window.$("#mainControls").css("transform", 'translateY(' + (screen.height /7) + 'px)');
      // window.$("#controlButtons").css("transform", 'translatex(-8px)');
      window.$(".menu-button").css("width", buttonWidth + 'px');
      window.$("#statusCard").css("width", buttonWidth + 'px');

      // window.$("#statusCard").css("max-width", buttonWidth + 'px');
    },
    showDisplayDate(date) {
      return this.moment(date).format('ll');
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
