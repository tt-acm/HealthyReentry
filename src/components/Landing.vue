<template>
  <div>
    <h1>Healthy Reentry</h1>
    <img src="/imgs/img.png" id="img" />
    <br />
    <button @click="onDecrLcl">Decrement Local</button>
    &nbsp;&nbsp;
    <span>{{ num }}</span>
    &nbsp;&nbsp;
    <button @click="onIncrLcl">Increment Local</button>
    <br />
    <button @click="onDecrVuex">Decrement Vuex</button>
    &nbsp;&nbsp;
    <span>{{ $store.state.count }}</span>
    &nbsp;&nbsp;
    <button @click="onIncrVuex">Increment Vuex</button>
    <br />
    <button @click="onTestRoute">Test public API route</button>
    &nbsp;&nbsp;
    <button @click="onTestUserRoute">Test protected User API route</button>
  </div>
</template>

<script>

export default {
  data() {
    return {
      num: 0,
    }
  },
  methods: {
    async onIncrLcl() {
      this.num++;
    },
    async onDecrLcl() {
      this.num--;
    },
    async onIncrVuex() {
      this.$store.commit('increment');
    },
    async onDecrVuex() {
      this.$store.commit('decrement');
    },
    async onTestRoute() {
      let res = await this.$api.get('/api/test');
      console.log(res.data);
    },
    async onTestUserRoute() {
      let res = await this.$api.get('/api/user/test');
      console.log(res.data);
    }
  }
}
</script>

<style scoped>

#img {
  width: 400px;
}

</style>
