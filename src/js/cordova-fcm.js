import axios from '@/js/axios';

export function cordovaSetFcmToken(accessToken, cookieToken) {
    console.log("firebase - function start")
    if (typeof window.cordova !== 'undefined') {
        console.log("firebase - cordova check")
        document.addEventListener('deviceready', () => {
            if (window.cordova.plugins && window.cordova.plugins.permissions) {
                console.log("firebase - 알림수신 제발 실행되어라")
                const permissions = window.cordova.plugins.permissions
                const notificationPermission = permissions.POST_NOTIFICATIONS
              
                permissions.checkPermission(notificationPermission, (status) => {
                  if (!status.hasPermission) {
                    permissions.requestPermission(notificationPermission,
                      (status) => {
                        if (status.hasPermission) {
                          console.log('알림 권한 허용됨')
                        } else {
                          console.log('알림 권한 거부됨')
                        }
                      },
                      (error) => {
                        console.error('권한 요청 중 오류:', error)
                      }
                    )
                  } else {
                    console.log('이미 권한 있음')
                  }
                }, (err) => {
                  console.error('권한 체크 실패:', err)
                })
              } else {
                console.warn('Cordova 플러그인을 찾을 수 없습니다.')
              }
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
          alert(data.title, data.body)
        })
      } else if(cookieToken != null) {
        axios.post("/api/fcm/alarm?token=" + cookieToken, {}, {
            headers: {
                Authorization: `Bearer `+ accessToken
            }
        })
      } else {
        console.warn("FirebasePlugin is not available.")
      }
}

export function getFcmToken() {
    if (typeof window.cordova !== 'undefined') {
        console.log("firebase - cordova check")
        document.addEventListener('deviceready', () => {
          window.FirebasePlugin.getToken(token => {
            console.log("FCM token:", token)
            return token
          }
        )}, false)
      }
}