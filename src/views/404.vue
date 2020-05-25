<template>
  <div>
    <md-list>
      <md-icon class="md-size-5x far fa-eye-slash mx-auto mt-5"></md-icon>
      <md-empty-state
        md-label="404 Page not Found"
        md-description="The page you are trying to access does not exist.">
        <router-link :to="{ name: '/' }">
          <md-button class="md-primary md-raised">
             Go to home page
          </md-button>
        </router-link>
      </md-empty-state>
    </md-list>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.text-center {
    padding-top: 20px;
}
</style>
