<template>
  <div id="app">
    <Navbar :isLogin="isLogin" @groupSelect="groupSelect" :unreadCount="unreadCount"></Navbar>
    <VoteStatusBar v-if="isLogin && this.deleteVote != null && Object.keys(this.deleteVote).length > 0" :isLogin="isLogin" :deleteVote="deleteVote"></VoteStatusBar>
    <div id="content">
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
      <router-view :key="$route.fullPath" :isLogin="isLogin" @isLoginChange="isLoginChange" @groupSelect="groupSelect" @handleLogout="handleLogout"></router-view>
    </div>
  </div>
  <FooterView />
</template>

<script>
import Navbar from './components/NavBar.vue'
import FooterView from './components/FooterView.vue';
import { setLoadingCallback } from '@/js/axios'
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from '@/js/axios';
import VoteStatusBar from './components/group/VoteStatusBar.vue';
import { cordovaSetFcmToken } from './js/cordova-fcm'

export default {
  name: 'App',
  data() {
    return {
      isLogin: null,
      loading: false,
      unreadCount: 0,
      deleteVote: {},
      stompClient: null,
      connected: false,
      connecting: false,
      websocketInitialized: false // 🔑 WebSocket 초기화 플래그 추가
    }
  },
  watch: {
    isLogin(newVal, oldVal) {
      console.log("isLogin 변경:", oldVal, "->", newVal);
      
      if (newVal) {
        console.log("1차 테스트")
        
        // 🔑 WebSocket은 한 번만 초기화
        if (!this.websocketInitialized) {
          this.connectWebSocket()
          this.websocketInitialized = true
        }
        
        this.socketRead()
        console.log("1차 테스트 - firebase")
        const accessToken = localStorage.getItem('accessToken')
        const fcmToken = localStorage.getItem("fcmToken")
        cordovaSetFcmToken(accessToken, fcmToken)
      } else {
        // 로그아웃 시 WebSocket 연결 해제
        this.disconnectWebSocket()
        this.websocketInitialized = false
      }
    }
  },
  created() {
    this.isLogin = localStorage.getItem('accessToken') !== null;
    // 🔑 created에서는 socketRead만 호출 (오타 수정: this,this.isLogin -> this.isLogin)
    if (this.isLogin) {
      this.socketRead()
    }
    setLoadingCallback((isLoading) => {
      this.loading = isLoading;
    });
  },
  mounted() {
    console.log("Vue 컴포넌트 마운트됨");
    
    // 🔑 로그인 상태이고 WebSocket이 초기화되지 않았을 때만 연결
    if (this.isLogin && !this.websocketInitialized) {
      // Cordova 환경에서는 deviceready 이벤트 대기
      if (window.cordova) {
        if (document.readyState === 'complete') {
          setTimeout(() => {
            console.log("📱 Cordova 이미 준비됨, WebSocket 연결 시작");
            this.connectWebSocket();
            this.websocketInitialized = true;
          }, 2000);
        } else {
          document.addEventListener('deviceready', () => {
            console.log('📱 Cordova deviceready 이벤트 수신');
            setTimeout(() => {
              this.connectWebSocket();
              this.websocketInitialized = true;
            }, 2000);
          }, false);
        }
      } else {
        // 웹 환경
        console.log('🌐 웹 환경에서 실행');
        setTimeout(() => {
          this.connectWebSocket();
          this.websocketInitialized = true;
        }, 1000);
      }
    }
  },
  beforeUnmount() {
    this.disconnectWebSocket();
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
        console.log("deleteVote" + JSON.stringify(this.deleteVote))
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
  // 🔑 더 강력한 중복 연결 방지
  if (this.connecting || this.connected) {
    console.log("이미 연결되어 있거나 연결 중입니다.");
    return;
  }

  // STOMP 클라이언트가 이미 활성화되어 있는지 확인
  if (this.stompClient && this.stompClient.active) {
    console.log("STOMP 클라이언트가 이미 활성화되어 있습니다.");
    this.connected = true;
    return;
  }
  
  // 로그인 상태가 아니면 연결하지 않음
  if (!this.isLogin) {
    console.log("로그인 상태가 아니므로 WebSocket 연결을 시도하지 않습니다.");
    return;
  }

  console.log("🔹 WebSocket 연결 시도...");
  this.connecting = true;

  // 기존 연결 완전히 정리
  this.disconnectWebSocket();
  
  // disconnect에서 플래그가 리셋되므로 다시 설정
  this.connecting = true;

  const isCordova = !!window.cordova;
  console.log("Cordova 환경:", isCordova);

  // 네트워크 상태 확인 (Cordova에서만)
  if (isCordova && navigator.connection) {
    console.log("네트워크 연결 상태:", navigator.connection.type);
    if (navigator.connection.type === 'none') {
      console.error("네트워크 연결이 없습니다.");
      this.connecting = false;
      return;
    }
  }

  const userSeq = localStorage.getItem('sequence');
  if (!userSeq) {
    console.error("사용자 시퀀스가 없습니다.");
    this.connecting = false;
    return;
  }

  // WebSocket URL 설정
  const wsUrl = ' https://people-transportation-namely-adams.trycloudflare.com/ws';
  console.log("WebSocket URL:", wsUrl);
  console.log("사용자 시퀀스:", userSeq);

  // SockJS 설정
  const socketFactory = () => {
    const socket = new SockJS(wsUrl, null, {
      transports: ['websocket', 'xhr-polling'],
      timeout: 15000,
      server_heartbeat_interval: 0
    });
    
    socket.onopen = () => {
      console.log("✅ SockJS 연결 성공");
    };
    
    socket.onclose = (e) => {
      console.log("❌ SockJS 연결 종료:", e.code, e.reason);
      this.connected = false;
      this.connecting = false;
    };
    
    socket.onerror = (e) => {
      console.error("🚨 SockJS 오류:", e);
      this.connected = false;
      this.connecting = false;
    };
    
    return socket;
  };

  // 🔑 새로운 STOMP 클라이언트 생성 (기존 것을 재사용하지 않음)
  this.stompClient = new Client({
    webSocketFactory: socketFactory,
    reconnectDelay: 10000,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0,
    debug: str => {
      if (str.includes('CONNECT') || str.includes('CONNECTED') || str.includes('ERROR')) {
        console.log("STOMP:", str);
      }
    },
  });

  // 연결 성공 핸들러
  this.stompClient.onConnect = (frame) => {
    console.log("🎉 WebSocket 연결 성공!" + frame);
    this.connected = true;
    this.connecting = false;

    try {
      // 알림 구독
      this.stompClient.subscribe(`/alarm/receive/${userSeq}`, (message) => {
        console.log("📢 알림 수신:", message.body);
        try {
          const data = JSON.parse(message.body);
          this.unreadCount = data;
        } catch (parseError) {
          console.error("알림 데이터 파싱 오류:", parseError);
        }
      });

      // 그룹 삭제 알림 구독
      this.stompClient.subscribe(`/alarm/group/delete/${userSeq}`, (message) => {
        console.log("🗑️ 그룹 삭제 알림:", message.body);
        try {
          const data = JSON.parse(message.body);
          this.deleteVote = data.data;
        } catch (parseError) {
          console.error("삭제 알림 데이터 파싱 오류:", parseError);
        }
      });
      
      console.log("✅ 구독 설정 완료");
      
    } catch (error) {
      console.error("❌ 구독 설정 중 오류:", error);
    }
  };

  // STOMP 오류 핸들러
  this.stompClient.onStompError = (frame) => {
    console.error('🚨 STOMP 오류:', frame.headers['message']);
    console.error('오류 세부사항:', frame.body);
    this.connected = false;
    this.connecting = false;
  };

  // WebSocket 오류 핸들러
  this.stompClient.onWebSocketError = (error) => {
    console.error('🚨 WebSocket 오류:', error);
    this.connected = false;
    this.connecting = false;
  };

  // 연결 해제 핸들러
  this.stompClient.onDisconnect = (frame) => {
    console.log('🔌 WebSocket 연결 해제:', frame);
    this.connected = false;
    this.connecting = false;
  };

  // 연결 시작
  try {
    console.log("STOMP 클라이언트 활성화 시작...");
    this.stompClient.activate();
  } catch (error) {
    console.error("❌ STOMP 클라이언트 활성화 실패:", error);
    this.connecting = false;
  }
},

disconnectWebSocket() {
  if (this.stompClient) {
    console.log("WebSocket 연결 해제 중...");
    try {
      if (this.stompClient.active) {
        this.stompClient.deactivate();
      }
    } catch (error) {
      console.log("연결 해제 중 오류 (무시됨):", error);
    }
    // 🔑 클라이언트 객체를 완전히 제거
    this.stompClient = null;
    this.connected = false;
    this.connecting = false;
  }
},
    handleLogout() {
      // 로그아웃 처리
      this.isLogin = false;
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
@import "/src/css/styles.css";
@import "/src/css/tour.css";
@import "/src/css/font.css";

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

#toast-container > .toast {
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  padding: 15px 20px 15px 50px !important; /* 아이콘을 위한 왼쪽 여백 추가 */
  opacity: 0.95 !important;
  border: none !important;
  font-family: 'Pretendard-Regular', sans-serif !important;
  position: relative !important; /* 아이콘 위치 지정을 위해 */
}

#toast-container > .toast::before {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  font-weight: bold;
}

#toast-container > .toast:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
  opacity: 1 !important;
}

#toast-container > .toast-success {
  background-color: #E6F4EA !important;
  color: #1E4620 !important;
}

#toast-container > .toast-success::before {
  content: '✔';
  color: #2E7D32 !important;
}

#toast-container > .toast-warning {
  background-color: #FFFBEA !important;
  color: #614700 !important;
}

#toast-container > .toast-warning::before {
  content: '⚠';
  color: #F57C00 !important;
}

#toast-container > .toast-error {
  background-color: #FBEBEA !important;
  color: #611A15 !important;
}

#toast-container > .toast-error::before {
  content: '✖';
  color: #D32F2F !important;
}

.toast-title {
  font-weight: bold !important;
}

.toast-message {
  font-size: 14px !important;
}
#content {
  min-height: 80vh; /* 화면 전체 높이 유지 */
}
.btn-area {
    margin-right: 5px;
}

.tour-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 9998;
    cursor: not-allowed;
}

:deep(.v-tour) {
    z-index: 10000;
}

:deep(.v-tour__target--highlighted) {
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.4);
    position: relative;
    z-index: 9999;
}
</style>
