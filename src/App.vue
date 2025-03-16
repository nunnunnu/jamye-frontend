<template>
  <Navbar :isLogin="isLogin" :currentGroup="currentGroup" @groupSelect="groupSelect" :unreadCount="unreadCount"></Navbar>
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
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from '@/js/axios';
import { BASE_URL } from './js/config';

export default {
  name: 'App',
  data() {
        return {
            isLogin: null,
            currentGroup: null,
            loading: false,
            unreadCount: 0
        }
    },
    created() {
        this.isLogin = this.$cookies.get('accessToken') !== null;
        this.currentGroup = this.$cookies.get("group")
        if(this,this.isLogin) {
          axios.get('/api/user/no-read', {
              headers: {
              Authorization: `Bearer ${this.$cookies.get('accessToken')}`
              }
          })
          .then(response => {
              this.unreadCount = response.data.data;
          })
          .catch(error => {
              console.error('안 읽은 쪽지 수 가져오기 실패:', error);
          });
        }
        setLoadingCallback((isLoading) => {
            this.loading = isLoading;
        });
    },
    mounted() {
      if (!this.stompClient || !this.stompClient.active) {
          this.connectWebSocket();
      }
    },
    beforeUnmount() {
      if (this.stompClient) {
          this.stompClient.deactivate();
      }
    },
    methods: {
      isLoginChange(isLoginChange) {
        this.isLogin = isLoginChange
      },
      groupSelect(group) {
        this.currentGroup = group
      },
      connectWebSocket() {
        console.log("🔹 WebSocket 연결 시도...");
        const socket = new SockJS(BASE_URL + '/ws');  
        this.stompClient = Stomp.over(socket)
        const userSeq = this.$cookies.get('sequence');
        this.stompClient.connect(
          {},
          () => {
            try {
              this.connected = true;
              this.stompClient.subscribe(`/alarm/receive/${userSeq}`, (message) => {
                  const data = JSON.parse(message.body);
                  this.unreadCount = data;
              });
            } catch (error) {
              console.error("❌ WebSocket 연결 처리 중 오류 발생:", error);
            }
          },
          (error) => {
            console.error("❌ WebSocket 연결 실패:", error);
          }
        );

        this.stompClient.activate();  
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

#toast-container > .toast-warning {
  background-color: #f6ffa2 !important; /* 노란색 배경 */
  color: #000 !important;               /* 검은색 글씨 */
}
#toast-container > .toast-success {
  background-color: #cbfcd1 !important; /* 노란색 배경 */
  color: #000 !important;               /* 검은색 글씨 */
}
#toast-container > .toast-error {
  background-color: #fccbcb !important; /* 노란색 배경 */
  color: #000 !important;               /* 검은색 글씨 */
}

</style>
