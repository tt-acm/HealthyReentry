<template>
  <div>
    <h1>Profile</h1>
    <img :src="$auth.userDB.picture" />
    <p>
      Name: {{ $auth.userDB.name }}
    </p>
    <p>
      Email: {{ $auth.userDB.email }}
    </p>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>

</style>