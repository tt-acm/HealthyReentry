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
                <span :class="enumStatusMap.filter(s => s.code === userUpdateData.statusCodeToSet)[0].css_key">
                  <i class="fas fa-circle fa-xs"></i>
                </span>
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

                  <div class="dropdown-item">

                    <div v-for="region in regions" :key="region.name">

                      <ul v-for="ofc in region.offices" :key="ofc.LocationName" class="pl-4">
                        <li @click="userUpdateData.locationToSet = ofc.LocationName">
                          {{ ofc.LocationName }}
                        </li>
                      </ul>

                    </div>

                  </div>

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

    <!-- Office Stats Download Modal -->
    <div class="modal fade" id="downloadOfficeStatsModal" tabindex="-1" role="dialog" aria-labelledby="downloadOfficeStatsLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="downloadOfficeStatsLabel">Download Stats for Offices</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div>
              <h6>
                Download Office Stats
              </h6>

              <span>
                <small><i>
                  <span
                    style="cursor: pointer;"
                    @click="setOfficeFilterForAllRegionsForDownload(true);"
                  >All</span>
                </i></small>
                |
                <small><i>
                  <span
                    style="cursor: pointer;"
                    @click="setOfficeFilterForAllRegionsForDownload(false);"
                  >None</span>
                </i></small>
              </span>

              <div class="row overflow-auto mx-0" style="height:400px">
                <div class="col">
                  <div v-for="region in regionsForDownloadSelections" :key="region.name">

                    <div class="pt-2">
                      <i class="fas fa-angle-right"></i>
                      {{ region.name }}
                      <small><i>
                        (
                        <span
                          style="cursor: pointer;"
                          @click="setRegionForDownloadSelection(region.name, true);"
                        >All</span>
                      </i></small>
                      |
                      <small><i>
                        <span
                          style="cursor: pointer;"
                          @click="setRegionForDownloadSelection(region.name, false);"
                        >None</span>
                        )
                      </i></small>
                    </div>

                    <div v-for="ofc in region.offices" :key="ofc.LocationName" class="pl-4">
                      <input class="form-check-input" type="checkbox" v-model="ofc.selected">
                      {{ofc.LocationName}}
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="downloadOfficeStats">Download</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Office Status Updates Download Modal -->
    <div class="modal fade" id="downloadOfficeStatusUpdatesModal" tabindex="-1" role="dialog" aria-labelledby="downloadOfficeStatusUpdatesLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="downloadOfficeStatusUpdatesLabel">Download Status Updates for Offices</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div>
              <h6>
                Download Office Status Updates
              </h6>

              <span>
                <small><i>
                  <span
                    style="cursor: pointer;"
                    @click="setOfficeFilterForAllRegionsForDownload(true);"
                  >All</span>
                </i></small>
                |
                <small><i>
                  <span
                    style="cursor: pointer;"
                    @click="setOfficeFilterForAllRegionsForDownload(false);"
                  >None</span>
                </i></small>
              </span>

              <div class="row overflow-auto mx-0" style="height:400px">
                <div class="col">
                  <div v-for="region in regionsForDownloadSelections" :key="region.name">

                    <div class="pt-2">
                      <i class="fas fa-angle-right"></i>
                      {{ region.name }}
                      <small><i>
                        (
                        <span
                          style="cursor: pointer;"
                          @click="setRegionForDownloadSelection(region.name, true);"
                        >All</span>
                      </i></small>
                      |
                      <small><i>
                        <span
                          style="cursor: pointer;"
                          @click="setRegionForDownloadSelection(region.name, false);"
                        >None</span>
                        )
                      </i></small>
                    </div>

                    <div v-for="ofc in region.offices" :key="ofc.LocationName" class="pl-4">
                      <input class="form-check-input" type="checkbox" v-model="ofc.selected">
                      {{ofc.LocationName}}
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="downloadOfficeStatusUpdates">Download</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete User Modal -->
    <md-dialog :md-active.sync="deleteActive">
      <md-dialog-title>Delete User</md-dialog-title>
      <md-dialog-content v-if="userToDelete">Are you sure to delete <b>{{userToDelete.name}}</b>?</md-dialog-content>

      <md-dialog-actions>
        <md-button @click="deleteActive = false">Go Back</md-button>
        <md-button class="md-accent md-raised text-white" @click="submitDeleteUser">Submit</md-button>
      </md-dialog-actions>
    </md-dialog>

    <!-- Vaccination detail modal -->
    <md-dialog :md-active.sync="showSelectedVaccination">
        <md-dialog-title class="pb-0 mb-2">
          Your Vaccination Record
        </md-dialog-title>


        <md-dialog-content v-if="vaccineEditTab==1" style="height: 70vh; min-width: 50vw">        
          <md-content class="mt-3">          
            <div id="vaccination-records">
              <button type="button" class="btn btn-md" @click="allowEditVaccination = true;">
                <md-icon class="fa fa-edit"></md-icon>
              </button>  

              <span v-if="curSelectedVaccinations.length == 0" class="d-flex ml-2 text-muted">There is no vaccination record for this user,
                <br/> 
                use the button on the above to add a new vaccination entry.
              </span>



              <!-- Add new vaccination card -->
              <div v-if="allowEditVaccination == true" class="mt-3" style="max-width: 500px">
                <md-card id="add-vaccination-card" class="md-elevation-1">
                  <md-card-header><h5 >Add New Vaccination</h5></md-card-header>
                  <md-card-content>
                    <div class="row align-items-center">
                      <div class="col-12 col-sm-5">
                        Vaccine Manufacturer:
                      </div>
                      <div class="col-12 col-sm-7">        
                        <VaccinationDropDown v-on:vaccineSelected="setNewVaccineManuFacturer"/>
                      </div>
                    </div>

                    <div class="row align-items-center mb-3">
                      <div class="col-12 col-sm-5">
                        Date:
                      </div>
                      <div class="col-12 col-sm-7">
                        <md-datepicker v-model="newVaccine.date" class="mb-0" :md-disabled-dates="disabledVaccinationDates" md-immediately>
                          <label>Select a date</label>
                        </md-datepicker>
                      </div>
                    </div>

                    <div class="d-flex">
                      <button type="button" class="btn btn-md text-white md-accent mt-1 ml-auto" @click="addNewVaccinateToRecord()" :disabled="newVaccine.manufacturer == null || newVaccine.date == null">
                        Add Date
                      </button>
                    </div>                    

                  </md-card-content>
                </md-card>

              </div>



              <md-table v-if="allowEditVaccination != true" v-model="curSelectedVaccinations" class="mt-5 md-elevation-1" md-card>
                <!-- <md-table-toolbar >
                                
                </md-table-toolbar> -->

                <md-table-row slot="md-table-row" slot-scope="{ item, index }">
                  <md-table-cell md-label="Date">
                    {{showDisplayDate(item.date, 'll')}}                
                  </md-table-cell>
                  <md-table-cell md-label="Manufacturer">
                    <span>{{ item.manufacturer }}</span>  
                    <!-- <small v-if="item.new == true"> [Pending...] </small>               -->
                  </md-table-cell>                
                </md-table-row>
              </md-table>




              <md-table v-else v-model="curSelectedVaccinations" class="mt-5 md-elevation-1" md-card>

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
                    <button v-show="allowEditVaccination" type="button" class="btn btn-md" @click="deleteExistingVaccineSelection(index)">
                      <md-icon class="fa fa-minus-circle" style="color:red"></md-icon>
                    </button>                  
                  </md-table-cell>
                </md-table-row>      
              </md-table>
            </div>
            
          </md-content>
        </md-dialog-content>


        <md-dialog-content v-if="vaccineEditTab==2" class="mt-3">          
          <div id="vaccination-records">
            <button type="button" class="btn btn-md" @click="editVaccination = true; formatVaccinationDate()">
              <md-icon class="fa fa-edit"></md-icon>
            </button>  

            <md-table v-model="curSelectedVaccinations" class="mt-3 md-elevation-1" md-card>
              <md-table-toolbar>
                <h3 class="md-title">Vaccination to update</h3>
              </md-table-toolbar>
              <md-table-row slot="md-table-row" slot-scope="{ item }">
                <md-table-cell md-label="Date">
                  {{showDisplayDate(item.date, 'll')}}                
                </md-table-cell>
                <md-table-cell md-label="Manufacturer">
                  <span>{{ item.manufacturer }}</span>   
                  <!-- <small v-if="item.new == true"> [Pending...] </small>              -->
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
        </md-dialog-content >

        <md-dialog-actions>
          <button v-if="vaccineEditTab != 2" style="background-color:white; border:0px; font-size:16px; margin-right:15px" @click="dismissResetVaccinationDetails()">Go Back</button>

          <div v-if="vaccineEditTab == 1 && allowEditVaccination">
            <button type="button" class="btn btn-md text-white md-accent"  @click="vaccineEditTab = 2">
              Next
            </button>
          </div>
          <div v-if="vaccineEditTab == 2">
            <button style="background-color:white; border:0px; font-size:16px; margin-right:15px" @click="vaccineEditTab=1">Go Back</button>
            <button v-show="allowEditVaccination" type="button" class="btn btn-md text-white" style="background-color:#00a3ad;" @click="updateVaccinationChanges();">
              Submit
            </button>
          </div>
          
        </md-dialog-actions>
    </md-dialog>

    <div class="text-muted d-flex align-items-end">
      <h5>Admin Dashboard</h5>

      <md-button class="md-icon-button" @click="setUserStatus = true">
        <md-icon class="fa fa-download">
          <md-tooltip md-direction="bottom">Download data by user status</md-tooltip>
        </md-icon>
      </md-button>

      <h5 class="ml-auto">
            Orange: {{overviewData.orange}} || Red: {{overviewData.red}} || Fully Vaccinated: {{overviewData.fullyVaccinated}}            
      </h5>
    </div>
    
            

    <md-dialog :md-active.sync="setUserStatus">
      <md-dialog-title>Download user data by status</md-dialog-title>
      <md-dialog-content>
        <md-checkbox v-model="userStatusToDownload.green" value=true>Green</md-checkbox>
        <md-checkbox v-model="userStatusToDownload.orange" value=true>Orange</md-checkbox>
        <md-checkbox v-model="userStatusToDownload.red" value=true>Red</md-checkbox>
      </md-dialog-content>


      <md-dialog-actions>
        <md-button class="md-primary" @click="setUserStatus = false">Close</md-button>
        <md-button class="md-primary" @click="setUserStatus = false; downloadUserStatusAsCSV()">Download</md-button>
      </md-dialog-actions>
    </md-dialog>

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
                <button class="btn btn-outline-secondary" type="button" @click="setOfficeFilterForAllRegionsForFilter(true); refreshData(true);">
                  Select All
                </button>
                <button class="btn btn-outline-secondary mx-2" type="button" @click="setOfficeFilterForAllRegionsForFilter(false); refreshData();">
                  Select None
                </button>
              </div>
            </div>

            <hr />

            <div class="row overflow-auto mx-0" style="height:400px">
              <div class="col">

                <div v-for="region in regions" :key="region.name">

                  <div class="pt-2">
                    <i class="fas fa-angle-right"></i>
                    {{ region.name }}
                    <small><i>
                      (
                      <span
                        style="cursor: pointer;"
                        @click="setRegionSelection(region.name, true); refreshData();"
                      >All</span>
                    </i></small>
                    |
                    <small><i>
                      <span
                        style="cursor: pointer;"
                        @click="setRegionSelection(region.name, false); refreshData();"
                      >None</span>
                      )
                    </i></small>
                  </div>

                  <div v-for="ofc in region.offices" :key="ofc.LocationName" class="pl-4">
                    <input class="form-check-input" type="checkbox" v-model="ofc.selected" @change="refreshData();">
                    {{ofc.LocationName}}
                  </div>

                </div>

              </div>
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
              <option v-if="300 < totalUsersCount">300</option>
              <option v-if="500 < totalUsersCount">500</option>
              <option v-if="700 < totalUsersCount">700</option>
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
                :style="'cursor: ' + (((pageNo) * itemsOnPage >= filteredUsersCount) ? 'not-allowed' : 'pointer') "
                @click="setPageNo(pageNo+1)"
                :class="'input-group-text ' + (((pageNo) * itemsOnPage >= filteredUsersCount) ? 'disabled' : '') "
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
          </div>
        </div>


        <!-- Download Entire Admin Table Modal -->
        <md-dialog :md-active.sync="downloadAdminTableModal">
          <md-dialog-title>Download Entire Admin Table</md-dialog-title>
          <md-dialog-content>
            Once the <b>Generate</b> button is clicked, the entire table will be generated and sent to the specified email address.
            <md-field>
              <label>Enter your email:</label>
              <md-input v-model="tableRecipient"></md-input>
            </md-field>
          </md-dialog-content>


          <md-dialog-actions>
            <md-button class="md-primary" @click="downloadAdminTableModal = false">Close</md-button>
            <md-button class="md-primary" :disabled="!tableRecipient"  @click="downloadAdminTableModal = false; downloadEntireTable()">Generate</md-button>
          </md-dialog-actions>
        </md-dialog>

        <div>
          <button id="tableDownload" type="button" class="btn btn-outline-secondary ml-2" @click="downloadAdminTableModal = true">
            Download Entire Admin Table
          </button>
          <button id="downloadDropdown" type="button" class="btn btn-outline-secondary ml-2 dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Download Selected User Data
          </button>
          <div class="dropdown-menu" aria-labelledby="downloadDropdown">
            <span class="dropdown-item text-muted"><small><i>Applies to selected persons only</i></small></span>

            <div class="dropdown-divider"></div>

            <span class="dropdown-item" data-toggle="modal" data-target="#graphDownloadModal">
              Download Interactions
            </span>
            <span class="dropdown-item" @click="downloadSelectedAsCSV">
              Download Encounter Data
            </span>
            <span class="dropdown-item" data-toggle="modal" data-target="#downloadOfficeStatsModal">
              Download Office Stats
            </span>
            <span class="dropdown-item" data-toggle="modal" data-target="#downloadOfficeStatusUpdatesModal">
              Download Office Status Updates
            </span>
          </div>
        </div>

      </div>

      <md-progress-bar md-mode="indeterminate" v-if="isLoading"></md-progress-bar>

      <table class="table table-striped table-hover table-sm">

        <thead>
          <tr>
            <th style="width: 7%" class="text-center">
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
            <th style="width: 15%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'name' ? '' : ' disabled')"
                @click="sortUsers('name', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Name
            </th>
            <th style="width: 10%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'officeCode' ? '' : ' disabled')"
                @click="sortUsers('officeCode', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Office
            </th>
            <th style="width: 10%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'lastUpdated' ? '' : ' disabled')"
                @click="sortUsers('lastUpdated', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Last Updated
            </th>
            <th style="width: 12%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'lastVaccinated' ? '' : ' disabled')"
                @click="sortUsers('lastVaccinated', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Last Vaccinated
            </th>
            <th style="width: 10%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'vaccinationCount' ? '' : ' disabled')"
                @click="sortUsers('vaccinationCount', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Vaccination Count
            </th>



            <th style="width: 10%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'fullyVaccinated' ? '' : ' disabled')"
                @click="sortUsers('fullyVaccinated', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Fully Vaccinated
            </th>

            <th style="width: 11.5%">
              <span
                style="cursor: pointer"
                :class="(sortBy === 'vaccinationManufacturers' ? '' : ' disabled')"
                @click="sortUsers('vaccinationManufacturers', !sortAsc)"
              >
                {{ (sortAsc) ? '&#11205;' : '&#11206;' }}
              </span>
              Vaccine Manufacturer
            </th>

            <th style="width: 10%">
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
          <tr v-for="(user,index) in users" :key="user.id">
            <td style="width: 7%; cursor: pointer;" class="text-center" @click="user.selected = !user.selected">
              {{ (user.selected) ? '&#9745;' : '&#9744;' }}
            </td>
            <td style="width: 5%" class="text-center">
              <i :class="'fas fa-circle ' + user.status.css_key"></i>
            </td>
            <td style="width: 15%">
              <span class="pr-1" @click="deleteUser(user)">
                <i class="fas fa-times-circle text-secondary" style="cursor: pointer;"></i>
                <md-tooltip md-direction="top">Delete this user</md-tooltip>
              </span>

              {{ user.name }} <small>({{user.email}})</small>
            </td>
            <td style="width: 10%">
              <span
                data-toggle="modal"
                data-target="#updateUserLocationModal"
                @click="updInviewUserSelectedState(false); clearUpdateData(); user.selected = true;"
                class="text-secondary">
                <i class="fas fa-pen-square" style="cursor: pointer;"></i>
              </span>
              {{ user.officeCode }}
            </td>
            <td style="width: 10%">
              <small>{{ user.lastUpdatedFormatted }}</small>
            </td>
            <td style="width: 12%;text-align: center;">
              <!-- {{ user.lastVaccinated }} -->
              <button type="button" class="btn btn-sm btn-block py-0" style="color:white;background-color:gray" @click="curSelectedUserIndex = index">
                <small>{{ user.lastVaccinated }}</small>
              </button>
            </td>
            <td style="width: 10%;">
              <!-- <a style="color:#1a0dab; cursor:pointer" class="mx-auto" @click="curSelectedUserIndex = index">{{ user.vaccinationCount }}</a> -->
              <button type="button" class="btn btn-sm btn-block py-0" style="color:white;background-color:gray" @click="curSelectedUserIndex = index">
                <small>{{ user.vaccinationCount }}</small>
              </button>
            </td>

            <td class="text-center" style="width: 10%;">
              <!-- <small>{{ user.fullyVaccinated }}</small> -->
              <i v-if="user.fullyVaccinated" class="fas fa-check-square" style="cursor: pointer;"></i>
              <i v-else class="fas fa-times text-muted" style="cursor: pointer;"></i>
            </td>
            <td style="width: 11.5%;">
              <!-- <a style="color:#1a0dab; cursor:pointer" class="mx-auto" @click="curSelectedUserIndex = index">{{ user.vaccinationCount }}</a> -->
              <button v-show="user.vaccinationManufacturers" type="button" class="btn btn-sm btn-block py-0" style="color:white;background-color:gray" @click="curSelectedUserIndex = index">
                <small>{{ user.vaccinationManufacturers }}</small>
              </button>
            </td>
            


            <td style="width: 10%">
              <small>{{ user.dateOfConsentFormatted }}</small>
            </td>
          </tr>
        </tbody>

      </table>

    </div>
  </div>
</template>



<script>
import enumStatusMap from "../../server/util/enumStatusMap.js";
import storedRegions from "../../server/util/officeList.js";
import csvUtil from "../../server/util/csvUtils.js";
import VaccinationDropDown from '@/partials/VaccinationDropdown.vue'

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
  created() {
    this.$api.get("/api/admin/get-total-users-stats").then(data => {
      this.totalUsersCount = data.data.total;
      console.log("totalUsersCount", this.totalUsersCount);
    })
    this.$api.get("/api/admin/get-overview-stats").then(data => {
      this.overviewData = data.data;
      console.log("this.overviewData", this.overviewData);
    })
  },
  components: {
    VaccinationDropDown
  },
  async mounted() {
    Object.keys(storedRegions).forEach(region => {
      this.regions.push({
        name: region,
        offices: storedRegions[region].map(o => { return { LocationName:o, selected: true } })
      });
    });
    let resp = await this.$api.get("/api/admin/get-uncategorized-offices");
    let uncategorizedLocations = resp.data;
    let oth = {
      name: "Other",
      offices: []
    };
    oth.offices = uncategorizedLocations.map(l => { return {LocationName: l, selected: true} });
    this.regions.push(oth);
    this.regionsForDownloadSelections = JSON.parse(JSON.stringify(this.regions));
    this.refreshData(true);
  },
  data() {
    return {
      userToDelete: null,
      deleteActive: false,
      isLoading: false,
      pageNo: 1,
      itemsOnPage: 10,
      nameSearch: "",
      sortBy: null,
      sortAsc: true,
      regions: [],
      regionsForDownloadSelections: [],
      users: [],
      totalUsersCount: 0,
      filteredUsersCount: 0,
      incubationDays: 2,
      enumStatusMap: enumStatusMap,
      userUpdateData: {
        statusCodeToSet: -1,
        selectedUserIds: [],
        locationToSet: null
      },
      setUserStatus: false,
      userStatusToDownload: {
        green: null,
        orange: null,
        red: null,
      },
      curSelectedUserIndex:null,
      allowEditVaccination: false,
      disabledVaccinationDates: date => {
        const today = new Date();
        return date >= today;
      },
      newVaccine: {
        manufacturer: null,
        date: new Date(),
        new: true
      },
      vaccineEditTab: 1,
      vaccinationsToDelete: [],
      curSelectedVaccinations: [],
      overviewData:{
        orange:0,
        red:0,
        fullyVaccinated:0
      },
      downloadAdminTableModal: false,
      tableRecipient: null
    };
  },
  watch: {
    curSelectedUserIndex: function () {
      if (this.curSelectedUserIndex == null) return [];

      let vacs = this.users[this.curSelectedUserIndex].vaccination? this.users[this.curSelectedUserIndex].vaccination: null;
      if (vacs == null) return [];

      vacs.forEach(vac=> {
        vac.formattedDate = new Date(vac.date);

        if (vac.hasOwnProperty("new")) delete vac.new;
      });

      vacs.sort((a, b) => a.formattedDate - b.formattedDate);
      this.curSelectedVaccinations = vacs;
    }
  },
  computed: {
    officesSelectedCount() {
      let i = 0;
      this.regions.forEach(r => {
        r.offices.forEach(o => {
          if (o.selected) i++;
        })
      })
      return i;
    },
    allOfficesSelected() {
      let ret = true;
      this.regions.forEach(r => {
        r.offices.forEach(o => {
          if (!o.selected) ret = false;
        })
      })
      return ret;
    },
    selectedUsers() {
      return this.users
                  .filter(u => u.selected);
    },
    showSelectedVaccination() {
      return this.curSelectedUserIndex != null;
    }
  },
  methods: {
    downloadEntireTable() {
      this.$api.post("/api/admin/download-admin-table", {recipient: this.tableRecipient})
    },
    downloadUserStatusAsCSV() {
      this.$api.post("/api/admin/download-status", {selection: this.userStatusToDownload}).then(msg => {
        if (msg.data) {
          downloadCSV(msg.data, `User Status_${new Date().toLocaleDateString()}:${new Date().getHours()}:${new Date().getMinutes()}.csv`);
        }
      });
    },
    submitDeleteUser() {
      this.deleteActive = false;

      const body = {"email": this.userToDelete.email};

      this.$api.post("/api/user/delete", body).then(msg => {
        if (msg.data) {
          //remove user from List
          const userIndex = this.users.findIndex(u => u.email === this.userToDelete.email);

          if (userIndex !== -1) this.users.splice(userIndex, 1);
        }
      });
    },
    deleteUser(u) {
      this.deleteActive = true;
      this.userToDelete = u;
    },
    async downloadGraphForSelectedAsCSV() {
      let userEmails = this.users.filter(u => u.selected).map(u => u.email);
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
        let gCSV = csvUtil.graphToCsv(graph);
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
    async downloadOfficeStats() {
      let selectedLocations = [];
      this.regionsForDownloadSelections.forEach(r => {
        selectedLocations = selectedLocations.concat(r.offices.filter(o => o.selected).map(o => o.LocationName));
      });
      let postData = {
        selectedLocations: selectedLocations
      };
      let resp = await this.$api.post("/api/admin/get-office-stats", postData);
      let data = resp.data;
      let csv = "Office,Green,Orange,Red,Total\n";
      data.forEach(d => { csv += `${d.office},${d.stats.green},${d.stats.orange},${d.stats.red},${d.stats.total}\n`; });
      downloadCSV(csv, `office-stats_${new Date().toLocaleDateString()}:${new Date().getHours()}:${new Date().getMinutes()}.csv`);
    },
    async downloadOfficeStatusUpdates() {
      let selectedLocations = [];
      this.regionsForDownloadSelections.forEach(r => {
        selectedLocations = selectedLocations.concat(r.offices.filter(o => o.selected).map(o => o.LocationName));
      });
      let postData = {
        selectedLocations: selectedLocations
      };
      let resp = await this.$api.post("/api/admin/get-office-status-updates", postData);
      let reports = resp.data;
      let csv = "";
      for(let report of reports) {
        csv += `Office,${report.office}\n`;
        csv += `Date,${new Date().toLocaleDateString()}\n`;
        csv += `Cuttoff Days,7\n`;
        csv += `Name,Email,Status,Last Updated\n`;
        for(let u of report.users) {
          let status = enumStatusMap.filter(s => s.code === u.status.status)[0];
          csv += `${u.name},${u.email},${status.label},${u.status.date}\n`;
        }
        csv += '\n';
      }
      downloadCSV(csv, `office-status-reports_${new Date().toLocaleDateString()}:${new Date().getHours()}:${new Date().getMinutes()}.csv`);
    },
    async refreshData(ignoreOfcFilters) {

      ignoreOfcFilters = !!ignoreOfcFilters;

      this.isLoading = true;

      let selectedLocations = null;
      if(!ignoreOfcFilters) {
        selectedLocations = [];
        this.regions.forEach(r => {
          selectedLocations = selectedLocations.concat(r.offices.filter(o => o.selected).map(o => o.LocationName));
        });
      }
      

      let postData = {
        skip: (this.pageNo-1)*this.itemsOnPage,
        limit: this.itemsOnPage,
        nameSearch: this.nameSearch,
        offices: selectedLocations
      };

      let userData = await this.$api.post('/api/admin/get-users-by-filters', postData);
      this.filteredUsersCount = userData.data.filteredCount;
      let users = userData.data.users;

      this.users = users.map(u => {
        let hasStatus = u.status && u.status.status !== null && u.status.status !== undefined;
        let code = (hasStatus) ? u.status.status : -1;
        let status = enumStatusMap.filter(i => i.code === code)[0];
        let updateDate = (hasStatus) ? fuzzyTime(new Date(u.status.date)) : '---';

        let uniqueVacManufacturer = [];

        if (u.vaccination) {
          u.vaccination.forEach(vac=> {
            if (!uniqueVacManufacturer.includes(vac.manufacturer)) uniqueVacManufacturer.push(vac.manufacturer);
          })
        }


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
          lastVaccinated: u.vaccination.length > 0 ? new Date(u.vaccination[u.vaccination.length-1].date).toDateString() : 'Not Available',
          vaccinationCount: u.vaccination.length,
          vaccinationManufacturers: uniqueVacManufacturer.length > 0? uniqueVacManufacturer.join(" & "): null,
          fullyVaccinated: u.fullyVaccinated,
          vaccination: u.vaccination,
          dateOfConsent: u.dateOfConsent ? new Date(u.dateOfConsent) : 0,
          dateOfConsentFormatted: u.dateOfConsent ? new Date(u.dateOfConsent).toDateString() : 'Not Available'
        };
        return user;
      });

      this.isLoading = false;

    },
    async sendUpdateData() {

      this.userUpdateData.selectedUserIds = this.selectedUsers.map(u => { return { userId: u.id }});

      this.isLoading = true;
      let res = await this.$api.post("/api/admin/update-users", this.userUpdateData);
      let updatedUsers = res.data;
      updatedUsers.forEach(nu => {
        let idx = this.users.findIndex(u => u.id === nu._id);
        this.users[idx] = nu;
      });
      this.refreshData();

      this.clearUpdateData();
      this.updInviewUserSelectedState(false);

      $(function () {
        $('#updateConfModal').modal('hide');
      });

      this.isLoading = false;

    },
    async clearUpdateData() {
      this.userUpdateData.statusCodeToSet = -1;
      this.userUpdateData.selectedUserIds = [];
      this.userUpdateData.locationToSet = null;
    },
    updInviewUserSelectedState(val) {
      this.users.forEach(u => u.selected = (val === 'invert') ? !u.selected : val);
    },
    sortUsers(key, inAsc) {
      this.sortBy = key;
      this.sortAsc = inAsc;
      let i = this.sortAsc ? 1 : -1;
      this.users.sort((a, b) => {
        return (a[this.sortBy] < b[this.sortBy])
        ? -i : (a[this.sortBy] > b[this.sortBy])
        ?  i : 0;
      });
    },
    async setPageNo(newNo) {
      let nxtNo = newNo-1;
      if (nxtNo < 0) return;
      if (((this.pageNo * this.itemsOnPage) <= this.filteredUsersCount) &&
          ((nxtNo * this.itemsOnPage) > this.filteredUsersCount)) return;
      this.pageNo = parseInt(newNo);
      await this.refreshData();
    },
    async setItemsOnPage(newNo) {
      if (newNo < 1) return;
      this.itemsOnPage = parseInt(newNo);
      await this.refreshData();
    },
    setRegionSelection(name, val) {
      this.regions.filter(r => r.name === name)[0].offices.forEach(o => o.selected = val);
    },
    setOfficeFilterForAllRegionsForFilter(val) {
      this.regions.forEach(r => {
        this.setRegionSelection(r.name, val);
      });
    },
    setRegionForDownloadSelection(name, val) {
      this.regionsForDownloadSelections.filter(r => r.name === name)[0].offices.forEach(o => o.selected = val);
    },
    setOfficeFilterForAllRegionsForDownload(val) {
      this.regionsForDownloadSelections.forEach(r => {
        this.setRegionForDownloadSelection(r.name, val);
      });
    },
    showDisplayDate(date, format) {
      return this.moment(date).format(format);
    },
    overwriteExistingVacinemanufacturer(newVal, index) {
      // console.log("ovwerwriting...", newVal, index);
      this.curSelectedVaccinations[index].manufacturer = newVal;
    },
    deleteExistingVaccineSelection(index) {    
      let curItem = this.curSelectedVaccinations.splice(index, 1)[0];
      curItem.delete = true;
      this.vaccinationsToDelete.push(curItem);
    },
    submitVaccinationDeletion() {
      if (!this.vaccinationsToDelete || this.vaccinationsToDelete.length == 0) return; //skipping
      this.$api.post("/api/vaccination/delete-vaccination-record", this.vaccinationsToDelete).then(record => {
        this.vaccinationsToDelete = null;
      });
    },
    dismissResetVaccinationDetails() {
      // this.users[this.curSelectedUserIndex].vaccination = curSelectedVaccinations; //update to global users
      // this.curSelectedVaccinations = this.curSelectedVaccinations.concat(this.vaccinationsToDelete).sort((a, b) => b.date - a.date);

      var sortedSelectedVaccines;
      if (this.vaccinationsToDelete.length > 0) {
        sortedSelectedVaccines = this.curSelectedVaccinations.concat(this.vaccinationsToDelete).sort((a, b) => a.formattedDate - b.formattedDate);
      }
      else {
        sortedSelectedVaccines = this.curSelectedVaccinations;
      }      



      this.users[this.curSelectedUserIndex].vaccination = sortedSelectedVaccines; // reset this in global

      // const curIndex = this.curSelectedUserIndex;
      // this.curSelectedUserIndex = curIndex;// re-trigger curSelectedVaccinations
      this.vaccinationsToDelete = [];
      this.curSelectedUserIndex = null; // turnoff dialog
    },
    reformatVaccineMeta() {

      // update cur user vaccine info to this.users
      if (!this.curSelectedUserIndex) return;
      const vacCount = this.curSelectedVaccinations.length;
      this.users[this.curSelectedUserIndex].vaccinationCount = vacCount;
      this.users[this.curSelectedUserIndex].lastVaccinated = vacCount > 0 ? new Date(this.curSelectedVaccinations[vacCount-1].date).toDateString() : 'Not Available';
    },
    updateVaccinationChanges() {
      this.curSelectedVaccinations.forEach(vac=> {
        vac.date = vac.formattedDate;
      });

      this.reformatVaccineMeta();
      this.submitVaccinationDeletion();
      this.submitVaccinationRecord();
      this.allowEditVaccination = false;      
      this.vaccineEditTab = 1;


      

     
      this.curSelectedUserIndex = null;//dismiss modal
    },
    submitVaccinationRecord() {
      const reqBody = {
        sender: "Admin",
        target: this.users[this.curSelectedUserIndex].email,
        content: this.curSelectedVaccinations
      }
      this.$api.post("/api/vaccination/update-vaccination-records", reqBody).then(record => {
        // this.curSelectedVaccinations = record.data; 
      });
    },    
    addNewVaccinateToRecord() {
      this.newVaccine.formattedDate = new Date(this.newVaccine.date);
      this.curSelectedVaccinations.push(this.newVaccine);
    },
    setNewVaccineManuFacturer(manufacturer) {
      this.newVaccine.manufacturer = manufacturer;
    }
    
  }
};
</script>

<style scoped>
.custom-dd-size {
  padding-left: 40px;
  width: 400px !important;
}

.md-dialog /deep/ .md-dialog-container {
  transform: none;
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
