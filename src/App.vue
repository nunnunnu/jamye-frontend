<template>
  <div id="app">
    <Navbar :isLogin="isLogin" @groupSelect="groupSelect" :unreadCount="unreadCount"></Navbar>
    <VoteStatusBar v-if="isLogin && this.deleteVote != null && Object.keys(this.deleteVote).length > 0" :isLogin="isLogin" :deleteVote="deleteVote"></VoteStatusBar>
    <div id="content">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
      <router-view :isLogin="isLogin" @isLoginChange="isLoginChange" @groupSelect="groupSelect" @handleLogout="handleLogout" @connectWebSocket="connectWebSocket"></router-view>
    </div>
  </div>
  <FooterView />
</template>

<script>
import Navbar from './components/NavBar.vue'
import FooterView from './components/FooterView.vue';
import { setLoadingCallback } from '@/js/axios'
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from '@/js/axios';
import { BASE_URL } from './js/config';
import VoteStatusBar from './components/group/VoteStatusBar.vue';
import { cordovaSetFcmToken } from './js/cordova-fcm'

export default {
  name: 'App',
  data() {
        return {
            isLogin: null,
            loading: false,
            unreadCount: 0,
            deleteVote: {}
        }
    },
    watch: {
      isLogin(newVal) {
        if (newVal) {
          console.log("1차 테스트")
          this.connectWebSocket()
          this.socketRead()
          console.log("1차 테스트 - firebase")
          const accessToken = localStorage.getItem('accessToken')
          const fcmToken = localStorage.getItem("fcmToken")
          cordovaSetFcmToken(accessToken, fcmToken)
        } else {
          if (this.stompClient && this.stompClient.connected) {
            this.stompClient.disconnect(() => {
              console.log("🔌 WebSocket 연결 해제 완료")
              this.connected = false
            })
          }
        }
      }
    },
    created() {
        this.isLogin = localStorage.getItem('accessToken') !== null;
        if(this,this.isLogin) {
          this.socketRead()

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
      socketRead() {
        axios.get('/api/user/no-read', {
              headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
          })
          .then(response => {
              this.unreadCount = response.data.data;
          })
          .catch(error => {
              console.error('안 읽은 쪽지 수 가져오기 실패:', error);
          });
          axios.get('/api/group/all/delete-vote-info', {
              headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
          })
          .then(r => {
              this.deleteVote = r.data.data
              
              console.log("deleteVote"+ JSON.stringify(this.deleteVote))
          })
          .catch(error => {
              console.error('안 읽은 쪽지 수 가져오기 실패:', error);
          });
      },
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
        const userSeq = localStorage.getItem('sequence');
        this.stompClient.connect(
          {},
          () => {
            try {
              this.connected = true;
              this.stompClient.subscribe(`/alarm/receive/${userSeq}`, (message) => {
                  console.log("unreadCount:" + message.body)
                  const data = JSON.parse(message.body);
                  this.unreadCount = data;
              });
              this.stompClient.subscribe(`/alarm/group/delete/${userSeq}`, (message) => {
                console.log("groupDelete")
                  const data = JSON.parse(message.body);
                  this.deleteVote = data.data
              });
            } catch (error) {
              console.error("❌ WebSocket 연결 처리 중 오류 발생:", error);
            }
          },
          (error) => {
            console.error("❌ WebSocket 연결 실패:", error);
            console.error("BASEURL:", BASE_URL);
          }
        );

        this.stompClient.activate();  
      },
      handleLogout() {
          if (this.stompClient && this.stompClient.connected) {
              this.stompClient.disconnect(() => {
                  console.log("🔌 WebSocket 연결 해제 완료");
                  this.connected = false;
                  this.unreadCount = 0
                  this.deleteVote = {}
              });
          }
      }
    },
  components: {
    Navbar,
    FooterView,
    VoteStatusBar
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
#content {
  min-height: 80vh; /* 화면 전체 높이 유지 */
}
.btn-area {
    margin-right: 5px;
}
</style>
