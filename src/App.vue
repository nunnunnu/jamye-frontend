<template>
  <Navbar :isLogin="isLogin"></Navbar>
  <router-view :isLogin="isLogin"></router-view>
</template>

<script>
import Navbar from './components/NavBar.vue'

export default {
  name: 'App',
  data() {
        return {
            isLogin: null
        }
    },
    mounted() {
      console.log(this.$cookies.get('accessToken') !== null)
        this.isLogin = this.$cookies.get('accessToken') !== null;
    },
  components: {
    Navbar
  }
}
</script>

<style>
@import "@/css/styles.css";
</style>
