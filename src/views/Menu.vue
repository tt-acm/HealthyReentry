<template>
<!-- <div class="mx-auto" style="transform: translateY(150%)"> -->
<div>
  <div  class="card mx-auto" id="statusCard" style="margin-top: 10px;">
    <div v-if="latestStatus" class="card-body p-2 text-white" id="statusCardBackground" :style="styleObject">
      <h6 class="mb-0">
        <b>Last Updated on:</b> {{showDisplayDate(new Date(latestStatus.date), 'll')}} as {{status[latestStatus.status]}}
      </h6>
    </div>

    <div v-if="vaccinationsToDisplay.length > 0" class="card-body p-2 d-flex" id="vacCardBackground" >
      <h6 class="mb-0">
        <b>Last Vaccinated on:</b> {{showDisplayDate(new Date(vaccinationsToDisplay[vaccinationsToDisplay.length-1].date), 'll')}}         
      </h6>
      <a class="ml-4" @click="launchVaccinationDetails = true" style="color:#1a0dab; cursor:pointer"><u>Click here for more details</u></a>
    </div>
  </div>


  <div class="mx-5 center" id="mainControls" style="margin-top: 15vh">
    <md-list v-if="user" id="controlButtons">
      <md-list-item>
        <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent" @click="showDialog=true; modalDismissable=true">
          Change Work Location
        </button>
      </md-list-item>
      <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'status', params: { id: user._id}}">
          <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent">
            Record Your Health Status
          </button>
          <!-- <md-button class="md-raised md-accent menu-button">
            <h6 class="my-3 text-white">Report Your Health Status</h6>
          </md-button> -->
        </router-link>
      </md-list-item>

      <!-- <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'encounter', params: { id: user._id}}">
          <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent">
          Record a TT Encounter
        </button>
        </router-link>
      </md-list-item> -->

      <!-- <md-list-item>
        <router-link class="mx-auto" :to="{ name: 'displayqr', params: { id: user._id}}">
          <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent">
          Display QR Code
        </button>
        </router-link>
      </md-list-item> -->

      <md-list-item>
          <button type="button" class="btn btn-lg btn-block text-center text-white my-2 md-accent" @click="launchVaccinationForm=true;vaccineTab=1">
            Record Your Vaccination Data
          </button>
      </md-list-item>
      <!-- </div> -->
    </md-list>
  </div>


  <!-- Reentry option modal -->
  <!-- <md-content> -->
    <md-dialog :md-active="showDialog" :md-fullscreen="true">
      <md-dialog-title class="pb-0 mb-2">
        Check in - Work Location
      </md-dialog-title>

      <md-dialog-content style="min-height: 350px">
        <span class="text-muted" v-if="latestPreference">
          Last submitted as <b>{{latestPreference.office}}</b> at {{showDisplayDate(latestPreference.createdAt, 'lll')}}
        </span>

        <h6 class="my-4">Select the appropriate response below:</h6>

        <md-content class="px-1">
          <span class="d-flex mt-3">Today I will be _______.</span>
          <md-radio v-model="reentryOpt" value="0" class="md-primary d-flex">Working Remotely <small>(Default)</small></md-radio>
          <md-radio v-model="reentryOpt" value="1" class="md-primary d-flex" :disabled="latestStatus && latestStatus.status!==0">
            Working in the office
            <md-tooltip v-if="latestStatus && latestStatus.status!==0" md-direction="bottom">Cannot select due to current health status.</md-tooltip>
            <div class="md-layout-item">
              <md-field>
                <md-select name="offices" id="offices" v-model="userOffice" placeholder="Choose your office">
                  <md-option v-for="o in offices" :key="o" :value="o">
                    {{o}}
                  </md-option>
                </md-select>
              </md-field>
            </div>
            <small>&#42; <b>Working in the office is ONLY permitted if you are Green;</b>
              this includes confirming that you do NOT have COVID-19 symptoms and your temperature is not more than 100.4 degrees F (38 degrees C).
              <br/>
              If you are Orange or Red, please refrain from coming into the office.
            </small>
          </md-radio>
        </md-content>
      </md-dialog-content>

      <md-dialog-actions>
        <!-- <button type="button" class="btn btn-md text-white" @click="showDialog = false">
          <router-link :to="{ name: 'home' }"> <p class="mb-0 text-muted">Close</p> </router-link>
        </button> -->
        <button v-show="modalDismissable" style="background-color:white; border:0px; font-size:16px; margin-right:15px" @click="showDialog=false; modalDismissable=false">Go Back</button>
        <button type="button" class="btn btn-md text-white md-accent" @click="showDialog = false;submit()" :disabled="userOffice===null&&reentryOpt!=0">
          Submit
        </button>
      </md-dialog-actions>
    </md-dialog>
  <!-- </md-content> -->

  <!-- Vaccination record modal -->
  <md-dialog :md-active.sync="launchVaccinationForm" :md-click-outside-to-close="false" :md-close-on-esc="false">
  <!-- <md-dialog :md-active.sync="launchVaccinationForm"> -->
      <md-dialog-title class="pb-0 mb-2">
        <span v-if="vaccineTab==1">Record Your Vaccination Data </span>
        <span v-else>Review Your Vaccination Data </span>
      </md-dialog-title>


      <md-dialog-content style="height: 70vh; max-width: 550px">
        <span v-if="vaccineTab==1" class="text-muted">
          Select your vaccine manufacturer from the dropdown, then select the date of your dose and click the <b>Add Date</b> button. 
          Repeat this step to add the dates of each dose, including booster shots (if applicable).
        </span>
        <span v-else class="text-muted">
          Review the details below then click <b>Submit</b>. To edit, click <b>Go Back</b>.
        </span>

        <md-content class="mt-3">
          <md-card v-if="vaccineTab == 1" id="add-vaccination-card" class="md-elevation-1">
            <md-card-header><h5 >Add New Vaccination</h5></md-card-header>
            <md-card-content>
              <div class="row align-items-center">
                <div class="col-12 col-sm-5">
                  <span>Vaccine Manufacturer:</span>
                </div>
                <div class="col-12 col-sm-7">             
                  <VaccinationDropDown v-on:vaccineSelected="overwriteVacinemanufacturer"/>
                </div>
              </div>

              <div class="row align-items-center mb-3">
                <div class="col-12 col-sm-5">
                  <span>Date:</span>                  
                </div>
                <div class="col-12 col-sm-7">
                  <md-datepicker v-model="curVaccineDate" class="mb-0" :md-disabled-dates="disabledVaccinationDates" md-immediately>
                    <label>Select a date</label>
                  </md-datepicker>
                </div>
              </div>

              <div class="d-flex">
                <button type="button" class="btn btn-md text-white md-accent ml-auto mt-3" @click="addVaccinateToRecord()" :disabled="curVaccineManufacturer==null || curVaccineDate== null">
                  Add Date
                </button>
              </div>
              

            </md-card-content>
          </md-card>


          <div id="vaccination-records">
            <md-table v-model="vaccinationsToDisplay" class="mt-5 md-elevation-1" md-card>
              <md-table-toolbar class="pl-3">
                <h1 class="md-title">Vaccination Records</h1>
              </md-table-toolbar>

              <md-table-row slot="md-table-row" slot-scope="{ item, index }">
                <md-table-cell md-label="Date">{{showDisplayDate(item.date, 'll')}}</md-table-cell>
                <md-table-cell md-label="Manufacturer">
                  {{ item.manufacturer }}
                  <!-- <small v-if="item.new == true"> [Pending...] </small> -->
                </md-table-cell>
                <md-table-cell md-label="">                  
                  <button v-show="item.new" type="button" class="btn btn-md" @click="deleteVaccineSelection(index)">                    
                    <md-icon class="fa fa-minus-circle" style="color:red"></md-icon>                    
                  </button>
                </md-table-cell>
              </md-table-row>
            </md-table>
          </div>

        </md-content>
      </md-dialog-content>

      <md-dialog-actions>
        <div v-if="vaccineTab == 1">
          <button style="background-color:white; border:0px; font-size:16px; margin-right:15px" @click="setVaccineTab()">Go Back</button>
          <button type="button" class="btn btn-md text-white md-accent" @click="vaccineTab = 2" :disabled="this.vaccinationsToDisplay.length < 1">
            Next
          </button>
        </div>
        <div v-else>
          <button style="background-color:white; border:0px; font-size:16px; margin-right:15px" @click="vaccineTab=1">Go Back</button>

          <button type="button" class="btn btn-md text-white" style="background-color:#00a3ad;" @click="launchVaccinationForm = false;submitVaccinationRecord()">
            Submit
          </button>

        </div>       
        
      </md-dialog-actions>
  </md-dialog>

  <!-- Vaccination edit modal -->
  <md-dialog :md-active.sync="launchVaccinationDetails" :md-fullscreen="true">
      <md-dialog-title class="pb-0 mb-2">
        <span v-if="editVaccination && vaccineEditTab == 2">Review Your Edited Vaccination Record</span>
        <span v-else>Your Vaccination Record</span>
        
      </md-dialog-title>


      <md-dialog-content style="height: 70vh; min-width: 900px">        
        <md-content v-if="vaccineEditTab==1" class="mt-3">
          
          <div id="vaccination-records">
            <button type="button" v-if="!editVaccination" class="btn btn-md md-accent" @click="editVaccination = true; formatVaccinationDate()">
              <!-- <md-icon class="fa fa-edit"></md-icon> -->
              <span style="color:white">Edit</span>
            </button>  

            <md-table v-if="editVaccination != true" v-model="vaccinationsToDisplay" class="mt-3 md-elevation-1" md-card>
              <!-- <md-table-toolbar >
                              
              </md-table-toolbar> -->

              <md-table-row slot="md-table-row" slot-scope="{ item }">
                <md-table-cell md-label="Date">
                  {{showDisplayDate(item.date, 'll')}}                
                </md-table-cell>
                <md-table-cell md-label="Manufacturer">
                  <span>{{ item.manufacturer }}</span>                
                </md-table-cell>                
              </md-table-row>

            </md-table>


            <md-table v-else v-model="vaccinationsToDisplay" class="mt-3 md-elevation-1" md-card>

              <md-table-row slot="md-table-row" slot-scope="{ item, index }">
                <md-table-cell md-label="Date">
                  <md-datepicker v-model="item.formattedDate" class="mb-3" :md-disabled-dates="disabledVaccinationDates" md-immediately>
                    <label>Select a date</label>
                  </md-datepicker>            
                </md-table-cell>

                <md-table-cell md-label="Manufacturer">
                  <VaccinationDropDown :existingVaccine="item.manufacturer" :curIndex="index" v-on:vaccineSelected="overwriteExistingVacinemanufacturer"/>
                </md-table-cell>

                <md-table-cell md-label="">                
                  <button v-show="editVaccination" type="button" class="btn btn-md" @click="deleteExistingVaccineSelection(index)">
                    <md-icon class="fa fa-minus-circle" style="color:red" ></md-icon>
                  </button>                  
                </md-table-cell>
              </md-table-row>            
              

            </md-table>
          </div>
        </md-content>



        <md-content v-if="vaccineEditTab==2" class="mt-3">          
          <div id="vaccination-records">
            <!-- <button type="button" class="btn btn-md" @click="editVaccination = true; formatVaccinationDate()">
              <md-icon class="fa fa-edit"></md-icon>
            </button>   -->

            <md-table v-model="vaccinationsToDisplay" class="mt-3 md-elevation-1" md-card>
              <md-table-toolbar>
                <h3 class="md-title">Vaccination to update</h3>
              </md-table-toolbar>
              <md-table-row slot="md-table-row" slot-scope="{ item }">
                <md-table-cell md-label="Date">
                  {{showDisplayDate(item.date, 'll')}}                
                </md-table-cell>
                <md-table-cell md-label="Manufacturer">
                  <span>{{ item.manufacturer }}</span>                
                </md-table-cell>                
              </md-table-row>    
            </md-table>

            <!-- Vaccination to delete -->
            <md-table v-if="vaccinationsToDelete && vaccinationsToDelete.length > 0" v-model="vaccinationsToDelete" class="mt-3 md-elevation-1" md-card>
              <md-table-toolbar>
                <h3 class="md-title">Vaccination to delete</h3>
              </md-table-toolbar>
              <md-table-row slot="md-table-row" slot-scope="{ item }">
                <md-table-cell md-label="Date">
                  {{showDisplayDate(item.date, 'll')}}                
                </md-table-cell>
                <md-table-cell md-label="Manufacturer">
                  <span>{{ item.manufacturer }}</span>                
                </md-table-cell>                
              </md-table-row>    
            </md-table>

            
          </div>
        </md-content>
      </md-dialog-content>

      <md-dialog-actions>
        <button v-show="vaccineEditTab != 2" style="background-color:white; border:0px; font-size:16px; margin-right:15px" @click="launchVaccinationDetails = false; clearUnsavedVaccinationEdit()">Go Back</button>
        <button v-show="editVaccination && vaccineEditTab == 1" type="button" class="btn btn-md text-white md-accent" @click="vaccineEditTab= 2;updateVaccinationChanges();">
          Next
        </button>
        <div v-show="editVaccination && vaccineEditTab == 2" >
          <button style="background-color:white; border:0px; font-size:16px; margin-right:15px" @click="vaccineEditTab=1">Go Back</button>

          <button type="button" class="btn btn-md text-white" style="background-color:#00a3ad;" :disabled="disableSubmittingRevisedVaccination" @click="launchVaccinationForm = false;submitReviewedVaccinationChagnes()">
            Submit
          </button>
        </div>
        
      </md-dialog-actions>
  </md-dialog>
</div>
</template>
<script>

const statusColors = ["#00C851", "#FF9800", "#DC3545"]

import { mapState } from 'vuex'
import VaccinationDropDown from '@/partials/VaccinationDropdown.vue'

export default {
  components: {
    VaccinationDropDown
  },
  created() {
    this.$api.get("/api/status/get-current").then(returnedStatus => {
      this.latestStatus = returnedStatus.data;
      this.styleObject.backgroundColor = statusColors[returnedStatus.data.status];
    });

    this.getAllVaccination();

    this.$api.get("/api/workPreference/get-latest-preference").then(preference => {
      this.showDialog = true;
      if (this.offices.indexOf(preference.data.latestOffice) > -1) {
        // old selection still exists in current list
        this.userOffice = preference.data.latestOffice;
      }

      if (preference.data.statusToday) {
        this.showDialog = false;
        this.latestPreference = preference.data.statusToday;
      }

    });
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
      showDialog: false,
      reentryOpt: "0",
      country: null,
      userOffice: null,
      offices: [
        "Aberdeen",
        "Albuquerque",
        "Atlanta",
        "Austin",
        "Beijing",
        "Boston",
        "Bristol",
        "Chicago",
        "Copenhagen",
        "Dallas",
        "Denver",
        "Dubai",
        "Edinburgh",
        "Edinburgh - Limehillock",
        "Fort Lauderdale",
        "Halifax",
        "Ho Chi Minh City",
        "Hong Kong",
        "Houston",
        "Kansas City",
        "London",
        "Los Angeles",
        "Miami",
        "Milwaukee",
        "Mississauga",
        "Moscow",
        "Mumbai",
        "New York - 120 Broadway",
        "New York - Downtown",
        // "New York - Madison",
        "Newark",
        "Ottawa",
        "Perth",
        "Philadelphia",
        "Phoenix",
        "Portland",
        "Romsey",
        "San Diego",
        'San Francisco',
        "Santa Clara",
        "Seattle",
        "Tampa",
        "Toronto",
        "Warrington",
        'Washington',
        "West Hartford",
        'Wellington',
        "Shanghai",
        "Sydney",
      ],
      confirmOffice: false,
      latestPreference: null,
      modalDismissable: false,
      launchVaccinationForm: false,
      curVaccineManufacturer: null,
      curVaccineDate: null,
      disabledVaccinationDates: date => {
        const today = new Date();
        return date >= today;
      },
      vaccinationsToDisplay:[],
      vaccinationsToDelete:[],
      vaccineTab:1,
      vaccineEditTab:1,
      launchVaccinationDetails: false,
      editVaccination:false,
      disableSubmittingRevisedVaccination : false
    };
  },
  // computed: Vuex.mapState({
  //   user: state => state.user,
  // }),  
  watch: {
    dataReadyForSave: function () {
      const notAllowedItem = this.vaccinationsToDisplay.filter(vac => {
        if (!vac.date || !vac.manufacturer) return true;
      })

      if (notAllowedItem.length == 0) return true;
      else return false;
    },
  },
  computed: {
    ...mapState({
      user: state => state.user,
    })
  },
  methods: {
    submit() {
      let reqBody = {
        "office": this.userOffice
      };

      if (this.reentryOpt == 0) reqBody.office = "Remote";

      this.$api.post("/api/workPreference/add", reqBody).then(offices => {
        if (offices.data) this.showDialog = false;
        this.latestPreference = offices.data;
        if (offices.data.office !== "Remote") this.userOffice = offices.data.office;
      });
    },
    mapButtonCSS() {
      const buttonWidth = screen.width * 0.6 > 310 ? screen.width * 0.7 : 310;
      window.$(".btn-lg").css("width", buttonWidth + 'px');
      window.$("#statusCard").css("width", buttonWidth + 'px');
    },
    showDisplayDate(date, format) {
      return this.moment(date).format(format);
    },
    addVaccinateToRecord() {
      this.vaccinationsToDisplay.push({
        manufacturer: this.curVaccineManufacturer,
        date: this.curVaccineDate,
        new: true
      });

      this.curVaccineDate = null;
    },
    setVaccineTab() {
      if (this.vaccineTab == 1) this.launchVaccinationForm = false;
      else this.vaccineTab = 1;

      this.vaccinationsToDisplay = this.vaccinationsToDisplay.filter(v=> {
        return v.new != true;
      });
      this.curVaccineDate = null;
      this.curVaccineManufacturer = null;
    },
    deleteVaccineSelection(index) {
      this.vaccinationsToDisplay.splice(index, 1);
    },
    deleteExistingVaccineSelection(index) {    
      let curItem = this.vaccinationsToDisplay.splice(index, 1)[0];
      curItem.delete = true;

      this.vaccinationsToDelete.push(curItem);
    },
    submitVaccinationDeletion() {
      if (!this.vaccinationsToDelete || this.vaccinationsToDelete.length == 0) return; //skipping
      this.$api.post("/api/vaccination/delete-vaccination-record", this.vaccinationsToDelete).then(record => {
        this.vaccinationsToDelete = [];        
      });
    },
    submitVaccinationRecord() {
      const reqBody = {
        sender: "User",
        userId: this.user._id,
        target: this.user.email,
        content: this.vaccinationsToDisplay
      };

      this.$api.post("/api/vaccination/update-vaccination-records", reqBody).then(record => {
        this.vaccinationsToDisplay = record.data;
        this.$emit("vaccinationMsg");
      });
    },
    overwriteVacinemanufacturer(item) {
      this.curVaccineManufacturer = item;
    },
    overwriteExistingVacinemanufacturer(newVal, index) {
      this.vaccinationsToDisplay[index].manufacturer = newVal;
    },
    formatVaccinationDate() {
      this.vaccinationsToDisplay.forEach(vac=> {
        vac.formattedDate = new Date(vac.date);
      });
    },
    clearUnsavedVaccinationEdit() {
      this.getAllVaccination();
      this.editVaccination = false;
      this.vaccineEditTab = 1;
      this.vaccinationsToDelete = [];
    },
    getAllVaccination() {
      this.$api.get("/api/vaccination/get-all").then(returnedVac => {
        this.vaccinationsToDisplay = returnedVac.data;
      });
    },
    updateVaccinationChanges() {
      this.vaccinationsToDisplay.forEach(vac=> {
        if (!vac.formattedDate) {
          this.disableSubmittingRevisedVaccination = true;
          vac.date = null;
          // vac.date = "Invalid Date, please go back and select a different one";
        }
        else {
          vac.date = vac.formattedDate;
        }        
      });
    },
    submitReviewedVaccinationChagnes() {
      this.submitVaccinationRecord();
      this.submitVaccinationDeletion();
      this.launchVaccinationDetails = false;
      this.editVaccination = false;
      this.vaccineEditTab = 1;
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
  /* height: 65vh; */
  /* border: 3px solid green; */
}

.md-dialog /deep/ .md-dialog-container {
  transform: none;
}
</style>
