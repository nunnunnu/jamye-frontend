<template>
  <Navbar :isLogin="isLogin" :currentGroup="currentGroup" @groupSelect="groupSelect"></Navbar>
  <router-view :isLogin="isLogin" @isLoginChange="isLoginChange" :key="currentGroup"></router-view>
</template>

<script>
import Navbar from './components/NavBar.vue'

export default {
  name: 'App',
  data() {
        return {
            isLogin: null,
            currentGroup: null
        }
    },
    created() {
        this.isLogin = this.$cookies.get('accessToken') !== null;
        this.currentGroup = this.$cookies.get("group")
    },
    methods: {
      isLoginChange(isLoginChange) {
        this.isLogin = isLoginChange
      },
      groupSelect(group) {
        this.currentGroup = group
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
