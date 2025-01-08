<template>
  <Navbar :isLogin="isLogin" :currentGroup="currentGroup" @groupSelect="groupSelect"></Navbar>
  <div id="app">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
  <router-view :isLogin="isLogin" @isLoginChange="isLoginChange" :key="currentGroup" @groupSelect="groupSelect"></router-view>
</template>

<script>
import Navbar from './components/NavBar.vue'
import { setLoadingCallback } from '@/js/axios'

export default {
  name: 'App',
  data() {
        return {
            isLogin: null,
            currentGroup: null,
            loading: false
        }
    },
    created() {
        this.isLogin = this.$cookies.get('accessToken') !== null;
        this.currentGroup = this.$cookies.get("group")
        setLoadingCallback((isLoading) => {
            this.loading = isLoading;
        });
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
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 6px solid #f3f3f3; /* 회색 테두리 */
  border-top: 6px solid #000000; /* 파란색 상단 테두리 */
  border-radius: 50%; /* 원형 */
  animation: spin 1s linear infinite; /* 회전 애니메이션 */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
