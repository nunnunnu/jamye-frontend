import axios from '@/js/axios';

export function cordovaSetFcmToken(accessToken) {
    console.log("firebase - function start")
    if (typeof window.cordova !== 'undefined') {
        console.log("firebase - cordova check")
        document.addEventListener('deviceready', () => {
          window.FirebasePlugin.getToken(token => {
            console.log("FCM token:", token)
            axios.post("/api/fcm/alarm?token=" + token, {}, {
                headers: {
                    Authorization: `Bearer `+ accessToken
                }
            })
          }, error => {
            console.error("FCM token error:", error)
          })
        }, false)

        window.FirebasePlugin.onMessageReceived(data => {
          console.log("푸시 메시지 수신", data)
          // 예시: 알림 표시
          alert(data.body)
        })
      } else {
        console.warn("FirebasePlugin is not available.")
      }
}