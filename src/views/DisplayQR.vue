<template>
<div>
  <div class="px-2">
    <h4 class="text-muted">Display QR Code</h4>
    <!-- <hr class="my-2"/> -->
    <div class="card mt-2">
      <div class="card-body bg-info p-2 text-white">
        <p class="mb-0">Show your below QR code to a {{companyInitials}} employee in order for them to locate your name in the app. When done, click <b>Back</b> to return to the homepage.</p>
      </div>
    </div>
  </div>

  <div class="d-flex">
    <canvas class="mx-auto" id="canvas"></canvas>
  </div>

  <md-list>
    <md-list-item class="mx-auto py-0">
      <md-button class="mx-auto">
        <router-link :to="{ name: 'menu' }"> <p class="text-muted mb-0">Back</p> </router-link>
      </md-button>
    </md-list-item>
  </md-list>


  <!-- <div class="text-center mt-0 pr-0 btn btn-lg btn-block">
    <router-link :to="{ name: 'menu' }"> Back </router-link>
  </div>-->

</div>
</template>
<script>
import QRCode  from 'qrcode';
import Vuex from 'vuex';
// import store from "store/index.js";

export default {
  // props: ["user"],
  created() {
  },
  mounted() {
    // $(window).on('load',function(){
    //     $('#exampleModalLong').modal('show');
    // });
    // $('#disclosure').modal('show');

    const screenSize = screen.width > screen.height? screen.height : screen.width;
    var viewScale = 4;
    if (screenSize > 300) viewScale = screenSize/60;
    // if (viewScale > 11) viewScale = 11;
    // console.log("scale", Math.trunc((screen.width-30)/ 29));
    // console.log("scale", Math.trunc((screen.height-30)/ 29));
    // const largeScreenScale = 10;
    // const viewScale = Math.trunc((screen.width-30)/ 29) > largeScreenScale? largeScreenScale : Math.trunc((screen.width-30)/ 29);

    QRCode.toCanvas(document.getElementById('canvas'), process.env.VUE_APP_URL + "encounter/" + this.user.email, {"scale": viewScale}, function (error) {
      if (error) console.error(error)
      console.log('success!');
    })
  },
  data() {
    return {
      companyInitials: process.env.VUE_APP_COMPANY_INITIALS
    };
  },
  computed: Vuex.mapState({
    user: state => state.user,
  }),
  methods: {

  }
};
</script>

<style scoped>
</style>
