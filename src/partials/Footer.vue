<template>
  <div>
    <md-toolbar class="md-primary md-dense md-layout md-alignment-bottom-right pb-2" id="appFooter">
        <div class="md-layout-item md-xsmall-hide">
          <a href="https://coresso.thorntontomasetti.com/eula" target="_blank">
            <span style="color:white;">License</span>
          </a>
        </div>
        <div class="md-layout-item md-large-size-90 md-medium-size-90 md-small-size-55 md-xsmall-size-100">
          <a href="http://core.thorntontomasetti.com" id="core-logo-import" target="_blank">
            <!-- <md-icon md-src="companyLogo" style="width:300px" /> -->
          </a>
        </div>
        <div class="md-layout-item md-xsmall-hide">
          <span class="row">
            &nbsp;&nbsp;&copy; {{new Date().getFullYear()}}
          </span>
        </div>

    </md-toolbar>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'Footer',
    data() {
    return {
      companyLogo: process.env.VUE_APP_COMPANY_LOGO,
    };
  },
  mounted() {
     console.log(process.env.VUE_APP_COMPANY_LOGO);
    $.get(process.env.VUE_APP_COMPANY_LOGO, function(data) {
      $("#core-logo-import").html(data);
    });
  },
  methods: {
  }
}
</script>

<style scoped>
#appFooter {
  position: fixed;
  left: 0;
  top: auto;
  bottom: 0;
  width: 100%;
  background-color: rgb(52, 58, 64);
  /* color: white; */
  /* text-align: center; */
}

</style>
