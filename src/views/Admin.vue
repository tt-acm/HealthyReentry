<template>
  <div class="px-2 pb-4">

    <!-- Status Update Modal -->
    <div class="modal fade" id="updateConfModal" tabindex="-1" role="dialog" aria-labelledby="updateConfModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="updateConfModalLabel">Updates</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="px-4">
              <b>Status to set: </b>
              <p>
                <i :class="'fas fa-circle fa-xs ' + enumStatusMap.filter(s => s.code === userUpdateData.statusCodeToSet)[0].css_key "></i>
                {{ enumStatusMap.filter(s => s.code === userUpdateData.statusCodeToSet)[0].label }}
              </p>
            </div>
            <b class="px-4">Persons selected: </b>
            <ul>
              <li v-for="usr in selectedUsers" :key="usr._id">{{ usr.name }}</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-secondary" @click="sendUpdateData">Submit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Graph Download Modal -->
    <div class="modal fade" id="graphDownloadModal" tabindex="-1" role="dialog" aria-labelledby="graphDownloadModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="graphDownloadModalLabel">Download Logged Interactions</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text" id="incubationDays">Incubation days:</span>
              </div>
              <input
                type="number"
                min="1"
                class="form-control"
                style="width: 60px;"
                v-model="incubationDays"
                aria-label="Number of days to check for encounters"
                aria-describedby="incubationDays"
              />
              <p>Encounters will be checked for so many days.</p>
            </div>
            <b class="px-4">Persons selected: </b>
            <ul>
              <li v-for="usr in selectedUsers" :key="usr._id">{{ usr.name }}</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="downloadGraphForSelectedAsCSV">Download</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update User Location Modal -->
    <div class="modal fade" id="updateUserLocationModal" tabindex="-1" role="dialog" aria-labelledby="updateUserLocationLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="updateUserLocationLabel">Update User Location</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="updInviewUserSelectedState(false); clearUpdateData()">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="selectedUsers.length > 0">
              <h6>
                <i :class="'fas fa-circle ' + selectedUsers[0].status.css_key"></i>
                {{ selectedUsers[0].name }}
              </h6>
              <p>{{ selectedUsers[0].email }}</p>
              <div class="dropdown">
                <button class="btn btn-secondary-outline dropdown-toggle" type="button" id="locDDMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {{ selectedUsers[0].officeCode }}
                </button>
                <div class="dropdown-menu overflow-auto mx-0" style="height:400px" aria-labelledby="locDDMenuButton">
                  <p class="dropdown-item" v-for="ofc in officesList" :key="ofc.LocationID" @click="userUpdateData.locationToSet = ofc.LocationName">
                    {{ ofc.LocationName }}
                  </p>
                </div>
                <p v-if="userUpdateData.locationToSet !== null">
                  <small><i>
                    Will be updated to: {{ userUpdateData.locationToSet }}
                  </i></small>
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-dismiss="modal" @click="updInviewUserSelectedState(false); clearUpdateData()">Close</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="sendUpdateData">Update</button>
          </div>
        </div>
      </div>
    </div>

    <h5 class="text-muted">Admin Dashboard</h5>

    <hr class="my-3"/>

    <div class="mb-2">

      <div class="row mb-1">

        <div class="col-lg-3 col-md-6 mb-1">

          <button class="btn btn-outline-tertiary btn-secondary dropdown-toggle" type="button" id="officeListMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Office List
          </button>
          <div class="dropdown-menu p-2 custom-dd-size" aria-labelledby="officeListMenu">

            <div class="row">
              <div class="col-12 pl-3">
                <button class="btn btn-outline-secondary" type="button" @click="setOfficeFilterForAll(true); updateUsersInView();">
                  Select All
                </button>
                <button class="btn btn-outline-secondary mx-2" type="button" @click="setOfficeFilterForAll(false); updateUsersInView();">
                  Select None
                </button>
              </div>
            </div>

            <hr />

            <div class="row overflow-auto mx-0" style="height:400px">
              <div class="col">
                <p v-for="ofc in officesList" :key="ofc.LocationID" class="pl-4">
                  <input class="form-check-input" type="checkbox" v-model="ofc.selected" @change="updateUsersInView">
                  {{ofc.LocationName}}
                </p>
              </div>
              <!-- <div class="col-6">
                <p v-for="ofc in officesList.slice(15)" :key="ofc.LocationID">
                  <input class="form-check-input" type="checkbox" v-model="ofc.selected" @change="updateUsersInView">
                  {{ofc.LocationName}}
                </p>
              </div> -->
            </div>

          </div>

          <small><i>
          <span class="text-muted ml-3">
            <span v-if="allOfficesSelected">
              All offices selected
            </span>
            <span v-else>
              {{ officesSelectedCount }} offices selected
            </span>
          </span>
          </i></small>

        </div>

        <div class="col-lg-3 col-md-6 mb-1">
          <input
            type="text"
            class="form-control"
            placeholder="Search by name"
            v-model="nameSearch"
            @keyup="refreshData"
            />
        </div>

        <div class="col-lg-3 col-md-6 mb-1">

          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="pageNav">Items per page:</span>
            </div>
            <select class="form-control" v-model="itemsOnPage" @change="setItemsOnPage(itemsOnPage)">
              <option>10</option>
              <option v-if="20 < totalUsersCount">20</option>
              <option v-if="50 < totalUsersCount">50</option>
              <option v-if="100 < totalUsersCount">100</option>
              <option>{{ totalUsersCount }}</option>
            </select>
          </div>

        </div>

        <div class="col-lg-3 col-md-6 mb-1">

          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="pageNav">Current page:</span>
            </div>
            <input
              type="number"
              min="1"
              class="form-control"
              v-model="pageNo"
              aria-label="Current page number"
              aria-describedby="pageNav"
            />
            <div class="input-group-append">
              <span
                :style="'cursor: ' + (((pageNo-1) < 1) ? 'not-allowed' : 'pointer') "
                @click="setPageNo(pageNo-1)"
                :class="'input-group-text ' + (((pageNo-1) < 1) ? 'disabled' : '') "
                id="pageNav"
              ><i class="fas fa-chevron-left"></i></span>
            </div>
            <div class="input-group-append">
              <span
                :style="'cursor: ' + (((pageNo) * itemsOnPage >= totalUsersCount) ? 'not-allowed' : 'pointer') "
                @click="setPageNo(pageNo+1)"
                :class="'input-group-text ' + (((pageNo) * itemsOnPage >= totalUsersCount) ? 'disabled' : '') "
                id="pageNav"
              ><i class="fas fa-chevron-right"></i></span>
            </div>
          </div>

        </div>

      </div>


      <div class="d-flex mb-2">

        <div class="mr-auto">

          <button id="actionDropdown" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Mark Status
          </button>
          <div class="dropdown-menu" aria-labelledby="actionDropdown">
            <span class="dropdown-item text-muted"><small><i>Applies to selected persons only</i></small></span>

            <div class="dropdown-divider"></div>

            <span class="dropdown-item" data-toggle="modal" data-target="#updateConfModal"
              @click="userUpdateData.statusCodeToSet = 0;"
            ><i class="fas fa-circle fa-xs en_green"></i> &nbsp;&nbsp; Mark green</span>
            <span class="dropdown-item" data-toggle="modal" data-target="#updateConfModal"
              @click="userUpdateData.statusCodeToSet = 1;"
            ><i class="fas fa-circle fa-xs en_orange"></i> &nbsp;&nbsp; Mark orange</span>
            <span class="dropdown-item" data-toggle="modal" data-target="#updateConfModal"
              @click="userUpdateData.statusCodeToSet = 2;"
            ><i class="fas fa-circle fa-xs en_red"></i> &nbsp;&nbsp; Mark red</span>

            <!-- <div class="dropdown-divider"></div> -->

            <!-- <span class="dropdown-item" data-toggle="modal" data-target="#updateConfModal"
              @click="userUpdateData.statusCodeToSet = 3;"
            ><i class="fas fa-circle fa-xs en_blue"></i> &nbsp;&nbsp; Mark blue</span> -->

          </div>

        </div>

        <div>
          <button id="downloadDropdown" type="button" class="btn btn-outline-secondary ml-2 dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Download
          </button>
          <div class="dropdown-menu" aria-labelledby="downloadDropdown">
            <span class="dropdown-item text-muted"><small><i>Applies to selected persons only</i></small></span>

            <div class="dropdown-divider"></div>

            <span class="dropdown-item" data-toggle="modal" data-target="#graphDownloadModal">
              Download Interactions
            </span>
            <span class="dropdown-item" @click="downloadSelectedAsCSV">
              Download Data
            </span>
            <span class="dropdown-item" @click="downloadOfficeStats">
              Download Office Stats
            </span>
          </div>
        </div>

      </div>

      <md-progress-bar md-mode="indeterminate" v-if="isLoading"></md-progress-bar>

      <table class="table table-striped table-hover table-sm">

        <thead>
          <tr>
            <th style="width: 15%" class="text-center">
              <small><i>
                <span
                  style="cursor: pointer;"
                  @click="updInviewUserSelectedState(true)"
                >
                All
                </span>
                |
                <span
                  style="cursor: pointer;"
                  @click="updInviewUserSelectedState(false)"
                >
                None
                </span>
                |
                <span
                  style="cursor: pointer;"
                  @click="updInviewUserSelectedState('invert')"
                >
                Invert
                </span>
              </i></small>
              <br />
              <span
                style="cursor: pointer"
                :class="(sortBy === 'selected' ? '' : ' disabled')"
                @click="sortUsers('selected', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Select
            </th>
            <th style="width: 5%" class="text-center">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'statusCode' ? '' : ' disabled')"
                @click="sortUsers('statusCode', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Status
            </th>
            <th style="width: 25%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'name' ? '' : ' disabled')"
                @click="sortUsers('name', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Name
            </th>
            <th style="width: 20%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'officeCode' ? '' : ' disabled')"
                @click="sortUsers('officeCode', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Office
            </th>
            <th style="width: 20%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'lastUpdated' ? '' : ' disabled')"
                @click="sortUsers('lastUpdated', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Last Updated
            </th>
            <th style="width: 15%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'dateOfConsent' ? '' : ' disabled')"
                @click="sortUsers('dateOfConsent', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Consent Date
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="user in usersInView" :key="user.id">
            <td style="width: 15%; cursor: pointer;" class="text-center" @click="user.selected = !user.selected">
              {{ (user.selected) ? '&#9745;' : '&#9744;' }}
            </td>
            <td style="width: 5%" class="text-center">
              <i :class="'fas fa-circle ' + user.status.css_key"></i>
            </td>
            <td style="width: 25%">
              {{ user.name }}
            </td>
            <td style="width: 20%">
              <span
                data-toggle="modal"
                data-target="#updateUserLocationModal"
                @click="updInviewUserSelectedState(false); clearUpdateData(); user.selected = true;"
                class="text-secondary">
                <i class="fas fa-pen-square" style="cursor: pointer;"></i>
              </span>
              {{ user.officeCode }}
            </td>
            <td style="width: 20%">
              {{ user.lastUpdatedFormatted }}
            </td>
            <td style="width: 15%">
              {{ user.dateOfConsentFormatted }}
            </td>
          </tr>
        </tbody>

      </table>

    </div>
  </div>
</template>



<script>
import enumStatusMap from "../../server/util/enumStatusMap.js";
import graphToCsv from "../../server/util/csvUtils.js";

function downloadCSV(content, fileName) {
  let dlTrigger = document.createElement('a');
  dlTrigger.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  dlTrigger.setAttribute('download', fileName);
  dlTrigger.style.display = 'none';
  document.body.appendChild(dlTrigger);
  dlTrigger.click();
  document.body.removeChild(dlTrigger);
}

// ref: https://stackoverflow.com/questions/7641791/javascript-library-for-human-friendly-relative-date-formatting
function fuzzyTime(date) {

  var delta = Math.round((+new Date - date) / 1000);

  var minute = 60,
      hour = minute * 60,
      day = hour * 24,
      week = day * 7;

  var fuzzy;

  if (isNaN(delta)) {
    fuzzy = '---';
  } else if (delta < 30) {
    fuzzy = 'just now';
  } else if (delta < minute) {
    fuzzy = `${delta} seconds ago`;
  } else if (delta < 2 * minute) {
    fuzzy = 'a minute ago'
  } else if (delta < hour) {
    fuzzy = `${Math.floor(delta / minute)} minutes ago`;
  } else if (Math.floor(delta / hour) == 1) {
    fuzzy = '1 hour ago'
  } else if (delta < day) {
    fuzzy = `${Math.floor(delta / hour)} hours ago`;
  } else if (delta < day * 2) {
    fuzzy = 'yesterday';
  } else if (delta < day * 10) {
    fuzzy = `${Math.floor(delta / day)} days ago`;
  } else {
    fuzzy = `${date.toDateString()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return fuzzy;
}

export default {
  beforeMount() {
    this.refreshData();

  },
  created() {},
  mounted() {
  },
  data() {
    return {
      isLoading: false,
      pageNo: 1,
      itemsOnPage: 10,
      nameSearch: "",
      sortBy: null,
      sortAsc: true,
      officesList: [],
      usersInView: [],
      users: [],
      totalUsersCount: 0,
      incubationDays: 2,
      enumStatusMap: enumStatusMap,
      userUpdateData: {
        statusCodeToSet: -1,
        selectedUserIds: [],
        locationToSet: null
      }
    };
  },
  computed: {
    officesSelectedCount() {
      return this.officesList.reduce((a, c) => a + (c.selected ? 1 : 0), 0);
    },
    allOfficesSelected() {
      return this.officesList.every(o => o.selected);
    },
    selectedUsers() {
      return this.usersInView
                  .filter(u => u.selected);
    }
  },
  methods: {
    async downloadGraphForSelectedAsCSV() {
      let userEmails = this.selectedUsers.map(u => u.email);  
      if (userEmails.length < 1) return;
      this.isLoading = true;
      let postBody = {
        emails: userEmails,
        incubationDays: this.incubationDays
      };
      let res = await this.$api.post(`/api/admin/get-graph`, postBody);
      let allGraphs = res.data;
      let fileTxt = "";
      let c = 0;
      allGraphs.forEach(graph => {
        let gCSV = graphToCsv(graph);
        let u = this.selectedUsers[c];
        fileTxt += `Name,${u.name}\r\nStatus,${u.status.label}\r\nUpdated,${u.lastUpdated}\r\n${gCSV}\r\n`;
        c++;
      });
      downloadCSV(fileTxt, `encounters(graph)_${new Date().toLocaleDateString()}:${new Date().getHours()}:${new Date().getMinutes()}.csv`);
      this.isLoading = false;
    },
    downloadSelectedAsCSV() {
      let tot = "Name,Status,Office,LastUpdated";
      let csv = this.selectedUsers
                    .map(u => `${u.name},${u.status.label},${u.officeCode},${String(this.moment(u.lastUpdated).format('lll')).replace(/\,/g, '')}`)
                    .reduce((tot, cur) => tot + "\n" + cur, tot);
      downloadCSV(csv, `encounters_${new Date().toLocaleDateString()}:${new Date().getHours()}:${new Date().getMinutes()}.csv`);
    },
    downloadOfficeStats() {
      let csv = "Office,Orange,Red,Total Signups\r\n";
      this.officesList.forEach(o => {
        let locUsers = this.users.filter(u => u.location === o.LocationName);
        let rCount = locUsers.filter(u => u.status.status === 2).length;
        let oCount = locUsers.filter(u => u.status.status === 1).length;
        csv += `${o.LocationName},${oCount},${rCount},${locUsers.length}\r\n`;
      }),
      downloadCSV(csv, `office-stats_${new Date().toLocaleDateString()}:${new Date().getHours()}:${new Date().getMinutes()}.csv`);
    },
    updateUsersInView() {

      let officeArr = this.officesList
                            .filter(o => o.selected)
                            .map(o => o.LocationName);
      let officeFilteredUsers = this.users.filter(u => officeArr.includes(u.location));

      this.usersInView = officeFilteredUsers.map(u => {
        let hasStatus = u.status && u.status.status !== null && u.status.status !== undefined;
        let code = (hasStatus) ? u.status.status : -1;
        let status = enumStatusMap.filter(i => i.code === code)[0];
        let updateDate = (hasStatus) ? fuzzyTime(new Date(u.status.date)) : '---';
        let user = {
          id: u._id,
          selected: false,
          name: u.name,
          email: u.email,
          officeCode: u.location,
          status: status,
          statusCode: status.code,
          lastUpdatedFormatted: updateDate,
          lastUpdated: hasStatus ? new Date(u.status.date) : null,
          dateOfConsent: u.dateOfConsent ? new Date(u.dateOfConsent) : 0,
          dateOfConsentFormatted: u.dateOfConsent ? new Date(u.dateOfConsent).toDateString() : 'Not Available'
        };
        return user;
      });

    },
    async refreshData() {

      this.isLoading = true;
      let officesSet = new Set();

      this.totalUsersCount = (await this.$api.get("/api/admin/get-total-users-stats")).data.total;

      let postData = {
        skip: (this.pageNo-1)*this.itemsOnPage,
        limit: this.itemsOnPage,
        nameSearch: this.nameSearch
      };

      let userData = await this.$api.post('/api/admin/get-users-by-filters', postData);
      var users = userData.data;
      users.sort((a, b) => (a.name < b.name) ? -1 : 1)
      this.users = users;
      this.users.forEach(u => {
        let loc = u.location || 'unknown';
        officesSet.add(loc);
      });
      this.officesList = Array.from(officesSet).map(o => { return { LocationName:o, selected: true } });
      this.officesList.sort((a, b) => a.LocationName < b.LocationName ? -1 : 1);
      this.updateUsersInView();
      this.isLoading = false;

    },
    async sendUpdateData() {

      this.userUpdateData.selectedUserIds = this.selectedUsers
                                                .map(u => { return { userId: u.id }});

      this.isLoading = true;
      let res = await this.$api.post("/api/admin/update-users", this.userUpdateData);
      let updatedUsers = res.data;
      updatedUsers.forEach(nu => {
        let idx = this.users.findIndex(u => u._id === nu._id);
        this.users[idx] = nu;
        this.updateUsersInView();
      });

      this.clearUpdateData();
      this.updInviewUserSelectedState(false);

      $(function () {
        $('#updateConfModal').modal('hide');
      });
      
      this.isLoading = false;

    },
    updInviewUserSelectedState(val) {
      this.usersInView.forEach(u => u.selected = (val === 'invert') ? !u.selected : val);
    },
    async clearUpdateData() {
      this.userUpdateData.statusCodeToSet = -1;
      this.userUpdateData.selectedUserIds = [];
      this.userUpdateData.locationToSet = null;
    },
    sortUsers(key, inAsc) {
      this.sortBy = key;
      this.sortAsc = inAsc;
      let i = this.sortAsc ? 1 : -1;
      this.usersInView.sort((a, b) => {
        return (a[this.sortBy] < b[this.sortBy])
        ? -i : (a[this.sortBy] > b[this.sortBy])
        ?  i : 0;
      });
    },
    async setPageNo(newNo) {
      if (newNo < 1 || ((newNo-1) * this.itemsOnPage) > this.totalUsersCount) return;
      this.pageNo = parseInt(newNo);
      await this.refreshData();
      this.updateUsersInView();
    },
    async setItemsOnPage(newNo) {
      if (newNo < 1) return;
      this.itemsOnPage = parseInt(newNo);
      await this.refreshData();
      this.updateUsersInView();
    },
    setOfficeFilterForAll(val) {
      this.officesList.forEach(o => o.selected = val);
    }
  }
};
</script>

<style scoped>
.custom-dd-size {
  padding-left: 40px;
  width: 400px !important;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

.disabled {
  color: #DEDEDE;
}

.en_green {
  color: #00C851;
}

.en_orange {
  color: #FF9800;
}

.en_red {
  color: #DC3545;
}

.en_blue {
  color: #007BFF;
}

.unknown {
  color: #898989;
}
</style>
