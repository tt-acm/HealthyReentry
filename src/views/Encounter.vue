<template>
<div>
  <!-- <appAlerts v-bind:alerts="alerts"/> -->
  <h4 class="text-muted">Record a TT Encounter</h4>
  <!-- <hr class="my-2" /> -->
  <div class="card mt-2">
    <div class="card-body bg-info p-2 text-white">
      <p class="mb-2">
        Search for colleagues by typing their name(s) or scanning their QR code.
      </p>
      <div class="d-flex mb-2 mx-0 align-items-center">
        <p class="mb-0">
          Log ALL encounters with TT colleagues where there is a breach of our current protocol.
        </p>
        <a class="ml-1" href="https://spark.thorntontomasetti.com/docs/DOC-17243" target="blank">
          <md-icon class="md-size-1x m-0" md-src="/imgs/info-circle-solid-small.svg" style="color:white"></md-icon>
        </a>
      </div>
      <p class="mb-0">
        For a group encounter, check the <i>Group</i> box (only one person needs to submit to account for everyone in the group).
      </p>
    </div>
  </div>

  <p v-if="encountersToday && encountersToday.length > 0" class="mb-1 mt-3">Today's Recorded Encounter(s):</p>
  <div v-if="encountersToday  && encountersToday.length > 0" class="row mx-0 mb-2">
    <div v-for="encounter in encountersToday">
      <span class="badge badge-pill badge-info mx-1">{{encounter.name}}</span>
    </div>
  </div>

  <div class="d-flex align-items-end">
    <b class="mt-3 mb-0">Your New Encounter(s):</b>
    <a class="ml-1" href="https://core-studio.gitbook.io/healthy-reentry/faq#what-counts-as-an-encounter-that-should-be-logged" target="blank">
      <md-icon class="md-size-1x m-0" md-src="/imgs/info-circle-solid-small.svg" ></md-icon>
    </a>
  </div>

  <div v-if="encountered" class="row mx-0 mt-2">
    <div v-for="encounter in encountered">
      <span class="badge badge-pill badge-info mx-1">{{encounter.name}}</span>
      <button type="button" class="close text-center" aria-label="Close" v-on:click="removeUser(encounter)" data-toggle="modal" data-target="#deleteUserModal">
        <span class="text-center" aria-hidden="true">&times;</span>
      </button>
    </div>
  </div>

  <div class="mb-0 d-flex align-items-center">
    <div class="mt-1 px-0 mr-2 col" style="min-width:18rem;">
      <!-- <autocomplete v-if="minUsers.length > 0" label="Encounters:" v-bind:items="minUsers" v-bind:split="splitChar" :frequentEncounters="frequentEncounters" placeholder="Search by email or name" @sendBack="getAutoFillUser"></autocomplete> -->

      <md-autocomplete v-model="selectedEmployee" :md-options="minUsers" :md-fuzzy-search="true" :md-open-on-focus="false" @md-selected="nameSelected()">
        <label>Search by email or name</label>

        <template slot="md-autocomplete-item" slot-scope="{ item, term }">
          <md-highlight-text :md-term="term">{{ item }}</md-highlight-text>
        </template>

        <template slot="md-autocomplete-empty" slot-scope="{ term }">
          No user matching "{{ term }}" were found.
        </template>
      </md-autocomplete>

      <!-- <p v-else class="text-muted"> No other user is available at this moment, please check again later.</p> -->
    </div>
    <div class="col px-0">
      <div v-if="disableQRScanning" class="mr-auto">
        <md-tooltip md-direction="top">Scanning QR code is not available on current browser</md-tooltip>
        <i class="fas fa-qrcode fa-2x text-muted"></i>
      </div>
      <div v-else class="mr-auto" @click="preLaunchCamera()">
        <md-tooltip md-direction="top">Open camera to scan QR code</md-tooltip>
        <i class="fas fa-qrcode fa-2x"></i>
      </div>
    </div>

  </div>
  <small>NOTE: You will only be able to search for employees who have opted into the app.</small>



  <div class="form-check my-2">
    <input v-if="encountered.length > 1" class="mt-2 form-check-input" type="checkbox" v-model="isGroup" id="defaultCheck1">
    <input v-else class="mt-2 form-check-input" type="checkbox" v-model="isGroup" id="defaultCheck1" disabled>
    <div class="d-flex align-items-end">
      <label class="form-check-label d-flex" for="defaultCheck1">
        Group
      </label>
      <a class="mb-0 ml-1" href="https://core-studio.gitbook.io/healthy-reentry/faq#when-should-i-use-the-group-checkbox" target="blank">
        <md-icon class="md-size-1x m-0" md-src="/imgs/info-circle-solid-small.svg" ></md-icon>
      </a>
    </div>

  </div>
  <qrcode-stream v-if="camera!=='off'" @decode="onDecode" :camera="camera"></qrcode-stream>

  <div class="row mt-3">
    <legend class="col-form-label col-sm-1 pt-0">Date:</legend>
    <div class="col-sm-11">
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gridRadios" id="today" value="option1" @click="todaySelected=true;" checked>
        <label class="form-check-label" for="gridRadios1">
          Today
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gridRadios" id="customDate" value="option2" @click="todaySelected=false;showDatePicker=true">
        <label class="form-check-label" for="gridRadios2">
          Pick a Date
        </label>
        <md-datepicker v-if="showDatePicker" v-model="date" :md-disabled-dates="checkFuture">
          <label>Select date</label>
        </md-datepicker>
      </div>
    </div>
  </div>

  <br>
  <md-list>
    <md-list-item class="mx-auto">
      <md-tooltip md-direction="top" v-if="disableSubmitUser">Please select at least one encounter.</md-tooltip>
      <!-- <md-button class="md-primary md-raised" @click="showDialog=!showDialog" :disabled="disableSubmitUser" id="nextBtn" style="width:240px">
        <h6 class="mb-0">Next</h6>
      </md-button> -->
      <button type="button" class="btn btn-lg btn-block text-white md-accent" @click="showDialog=!showDialog" :disabled="disableSubmitUser" id="nextBtn" style="width:240px">
        Next
      </button>
    </md-list-item>

    <md-list-item class="mx-auto">
      <md-button class="md-primary mx-auto">
        <router-link :to="{ name: 'menu' }"> <p class="text-muted mb-0">Back</p> </router-link>
      </md-button>
    </md-list-item>
  </md-list>


  <!-- Modal -->
  <md-dialog :md-active.sync="showDialog" :md-fullscreen="false">
      <md-dialog-title>Review Your Encounter</md-dialog-title>
      <md-subheader class="mx-2 mb-0">
        Review the details below then click <b class="ml-1 mr-0 px-0">Submit</b>. To edit, click <b class="ml-1 mr-0 px-0">Go Back</b>.
      </md-subheader>
      <md-content class="mx-4">

        <div class="card mx-auto">
          <div class="card-header">
            <h6>Encounter Details<span v-if="isGroup" class="badge badge-warning ml-2">Group Encounter</span></h6>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><b>Name(s):</b>
              <div v-if="encountered.length>0">
                <div v-for="encounter in encountered">
                  <span class="mx-1">{{encounter.name}}</span>
                </div>
              </div>
            </li>
            <li class="list-group-item"><b>Date:</b>
              <p class="mb-0">{{showDisplayDate(date)}}</p>
              <!-- <p v-else> Custom Date</p> -->
            </li>
          </ul>
        </div>
      </md-content>



      <md-dialog-actions class="mx-4 my-2">
        <md-button class="md-primary" @click="showDialog = false">Go Back</md-button>
        <md-button class="md-accent md-raised text-white" @click="showDialog = false;saveEncounters()">Submit</md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Notifications -->
    <md-snackbar md-position="center" :md-duration="notificationDuration" :md-active.sync="userAdded" md-persistent style="margin-bottom:55px; background-color: #004050">
      <span> Encounter added.</span>
    </md-snackbar>
    <md-snackbar md-position="center" :md-duration="notificationDuration" :md-active.sync="dupUser" md-persistent style="margin-bottom:55px; background-color: orange">
      <span> Duplicated user found in your selection</span>
    </md-snackbar>
    <md-snackbar md-position="center" :md-duration="notificationDuration" :md-active.sync="selfScan" md-persistent style="margin-bottom:55px; background-color: orange">
      <span> Cannot add yourself as an encounter.</span>
    </md-snackbar>
    <md-snackbar md-position="center" :md-duration="notificationDuration" :md-active.sync="scanSucceed" md-persistent style="margin-bottom:55px; background-color: #004050">
      <span> QR code scanned successfully.</span>
    </md-snackbar>

</div>
</template>
<script src="./vue-browser-detect-plugin.umd.js"></script>
<script src="vue-qrcode-reader.browser.js"></script>

<script>
import Vue from 'vue';
import Vuex from 'vuex';
import {
  QrcodeStream
} from 'vue-qrcode-reader'


export default {
  name: "encounter",
  components: {
    QrcodeStream
    // appAlerts
  },
  created() {},
  beforeMount() {
    this.$api.get("/api/user/get-all").then(all => {

      console.log("getalluser", all);

      const arrayToObject = (array) =>
        array.reduce((obj, item) => {
          // obj[item.name + "_" + item.email] = item
          // console.log("item", item.email);
          obj[item.name] = item
          return obj
        }, {})

      const dictionary = arrayToObject(all.data);
      Vue.set(this, "userDictionary", dictionary);
      Vue.set(this, "minUsers", Object.keys(dictionary));
    });

    this.$api.get("/api/encounters/find-frequent-encounters").then(mostEncountered => {
      const userToday = mostEncountered.data.filter(u=>u.encounteredToday===true);
      this.encountersToday = userToday;
      // Vue.set(this, "frequentEncounters", mostEncountered.data.map(item=>item.name + "_" + item.email));
      Vue.set(this, "encountersToday", mostEncountered.data.filter(u=>u.encounteredToday===true));

      if (this.$route.params.scannedUser) {
        console.log("coming here");
        this.searchUserByEmail(this.$route.params.scannedUser);
      }
    });


  },
  mounted() {
    const buttonWidth = screen.width*0.6 > 280? screen.width*0.7 : 280;
  },
  data() {
    return {
      userAdded: false,
      dupUser: false,
      scanSucceed: false,
      notificationDuration: 4000,
      showEncounterMsg: false,
      selfScan: false,
      selectedEmployee: null,
      splitChar: "",
      encountered: [],
      userDictionary: [],
      minUsers: [],
      //mostEncountered: [],
      todaySelected: true,
      date: new Date(),
      alerts: null,
      // disableSubmitDate: false,
      disableSubmitUser: true,
      camera: 'off',
      encountersToday: null,
      isGroup: false,
      showDatePicker: false,
      // frequentEncounters: null,
      showDialog: false,
      disableQRScanning: false
    };
  },
  watch: {
    // selectedEmployee() {
    //
    //   if (this.selectedEmployee) {
    //     var u = this.userDictionary[this.selectedEmployee];
    //     if (!u) return;
    //     if (this.encountered.length === 0){
    //       let newList = [];
    //       newList.push(u);
    //       this.encountered = newList;
    //     }
    //     else if (this.encountered.map(e=>e._id).indexOf(u._id) === -1) {
    //       this.encountered.push(u);
    //     }
    //     else{
    //       //user already added as encounter
    //       // this.$emit("getNotification", [{
    //       //   message: "This user has already been added as your encounter.",
    //       //   type: "warning"
    //       // }]);
    //     }
    //   }
    //   this.selectedEmployee = '';
    // },
    encountered() {
      this.disableSubmitUser = true;
      if (this.encountered.length > 0) {
        // this.$emit("getNotification", [{
        //   message: "Please selector at least one TT employee as your encounter.",
        //   type: "warning"
        // }]);
        this.disableSubmitUser = false;
      }
    }
  },
  computed: Vuex.mapState({
    user: state => state.user,
  }),
  methods: {
    nameSelected() {
      console.log("got selected");
      if (this.selectedEmployee) {
        var u = this.userDictionary[this.selectedEmployee];
        if (this.encountered.length === 0){
          let newList = [];
          newList.push(u);
          this.encountered = newList;
          this.userAdded = true;
        }
        else if (this.encountered.map(e=>e._id).indexOf(u._id) === -1) {
          this.encountered.push(u);
          this.userAdded = true;
        }
        else{
          this.dupUser = true;//user already added as encounter
        }
        // this.selectedEmployee = null;
      }

    },
    checkFuture(date) {
      return new Date() <= date;
    },
    preLaunchCamera() {
      if (this.$browserDetect.isChromeIOS) {
        // this.$api.$emit("getNotification", [{
        //   message: "This function cannot be used on Chrome IOS. Please scan the QR code using your device's native camera.",
        //   type: "warning"
        // }]);
        this.disableQRScanning = true;
      }
      else {
        this.disableQRScanning = false;
        this.camera = "auto";
      }
    },
    onDecode(incomingStr) {
      const decodedString = incomingStr.split("/").slice(-1)[0];
      console.log("decodedString", decodedString);
      this.searchUserByEmail(decodedString);
    },
    searchUserByEmail(emailStr){
      if (emailStr === this.user.email.toLowerCase()) {
        this.$emit("noDupUser");
      } else if (emailStr) {
        var body = {
          "email": emailStr
        }
        this.$api.post("/api/user/user-by-email", body).then(res => {
          const encountered = this.encountered.map(en=>en._id);

          if (res.data && res.data._id) {
            if (res.data.email.toLowerCase() === this.user.email.toLowerCase()) {
              this.selfScan = true;
              this.camera = 'off';
            }
            else if (encountered.includes(res.data._id)){//encounter already exists
              // this.$emit("encounterExists", [{
              //   message: "Encounter already exists.",
              //   type: "warning"
              // }]);
              this.dupUser = true;
              this.camera = 'off';
            }
            else {
              this.encountered.push(res.data);//adding scanned user to encounter
              this.scanSucceed = true;

              this.camera = 'off';
            }
          }

        });
      }
    },
    showDisplayDate(date) {
      return this.moment(date).format('ll');
    },
    getAutoFillUser(k) {
      if (k.index != -1) {
        var u = this.userDictionary[k.match];
        if (this.encountered.length === 0){
          let newList = [];
          newList.push(u);
          this.encountered = newList;
        }
        else if (this.encountered.map(e=>e._id).indexOf(u._id) === -1) {
          this.encountered.push(u);
        }
        else{
          //user already added as encounter
          this.$emit("getNotification", [{
            message: "This user has already been added as your encounter.",
            type: "warning"
          }]);
        }
      }
    },
    formatDate() {
      var formattedDate = this.moment(this.date).format('YYYY/MM/DD');
      // Vue.set(this, "date", formattedDate);
      return formattedDate;
    },
    removeUser(e) {
      this.encountered.splice(
        this.encountered.indexOf(e),
        1
      );
    },
    saveEncounters() {

      var body = {
        encounters: this.encountered,
        date: this.date,
        isGroup: this.isGroup
      };
      this.$api.post("/api/encounters/add-many", body).then(result => {
        if (result) {
          this.$emit("encounterMsg");
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
/* .wrapper {
  position:absolute;
  top:0;
  right:0;
  height:25px;
  background:green;
} */
/* .d-flex {
  max-width: 350px;
} */
/* .md-theme-default{
  height: 400px;
} */
/* .md-list-item-content {
  padding-top: 0px;
  padding-bottom: 0px;
} */
.md-dialog /deep/ .md-dialog-container {
  transform: none;
}


</style>
