<template>
  <Navbar :isLogin="isLogin"></Navbar>
  <router-view :isLogin="isLogin" @isLoginChange="isLoginChange"></router-view>
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
        this.isLogin = this.$cookies.get('accessToken') !== null;
    },
    methods: {
      isLoginChange(isLoginChange) {
        this.isLogin = isLoginChange
      }
    },
  components: {
    Navbar
  }
}
</script>

<style>
@import "@/css/styles.css";

.b-container {
    max-width: 600px;
    margin: 0 auto; /* 중앙 정렬 */
    padding: 20px; /* 위아래 여백 */
}
.btn-block {
    width: 100%;
}
</style>
