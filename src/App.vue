<template>
  <Navbar :isLogin="isLogin" :currentGroup="currentGroup" @groupSelect="groupSelect"></Navbar>
  <router-view :isLogin="isLogin" @isLoginChange="isLoginChange" :key="currentGroup" @groupSelect="groupSelect"></router-view>
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
.custom-btn {
    flex: 1; /* 버튼을 동일한 크기로 늘림 */
    margin: 0 10px; /* 버튼 간의 간격 */
    padding: 10px; /* 버튼 내부 여백 조정 */
    text-align: center; /* 텍스트 중앙 정렬 */
    border-radius: 5px; /* 모서리 둥글게 */
}
</style>
