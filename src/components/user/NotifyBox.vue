<template>
    <div class="b-container">
        <div class="title">쪽지함</div>
        <div class="descript">모든 알람은 한달 뒤 삭제됩니다</div>
        <button class="btn btn-dark notifyBox " @click="discordLogin">디스코드 연동
            <span class="tooltip-text">디스코드 연동시 jamye bot이 알림을 전송해 드립니다.</span>
        </button>
        <button v-if="isNoRead" class="btn btn-dark notifyBox" @click="allNotifyRead">모두 읽기</button>
        <button v-else class="btn btn-dark notifyBox" disabled>모두 읽기</button>
        <button class="btn btn-dark notifyBox" @click="allReadNotifyDelete">읽은 쪽지 삭제</button>
            <div v-for="notify in notifyList" :key="notify.notifySeq" class="message-item">
                <button class="close-btn" @click="deleteNotify(notify.notifySeq)">✖</button>
                <button v-if="notify.isRead" class="btn btn-dark read-button btn-sm" disabled>읽기</button>
                <button v-else class="btn btn-dark read-button btn-sm" @click="readNotify(notify)">읽기</button>
                <div class="message-content">{{ notify.message }}</div>
                <div class="message-date">{{ notify.createDate }}</div>
                <div class="action-buttons">
                    <button v-if="notify.groupSeq != null" class="btn btn-dark group-button btn-sm" @click="goToGroup(notify.groupSeq)">그룹 가기</button>
                    <button v-if="notify.postSeq != null" class="btn btn-dark post-button btn-sm" @click="goToPost(notify.groupSeq, notify.postSeq)">게시글 가기</button>
                </div>
            </div>
            <div v-if="notifyList.length == 0"></div>
    </div>
</template>
<script>
import axios from '@/js/axios';
import { redirect_uri } from '@/js/config';
export default {
    data() {
        return {
            notifyList: [],
            isNoRead: false,
        }
    },
    created() {
        this.getNotiftList()
    },
    methods: {
        getNotiftList() {
            axios.get("/api/user/notify", {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken'),
                    }
            }).then(r => {
                this.notifyList = r.data.data
                if(this.notifyList.length == 0) {
                    this.isNoRead = false
                } else {
                    this.notifyList.forEach(element => {
                        if(!element.isRead) {
                            this.isNoRead = true
                        }
                    }); 
                }
            })
        },
        readNotify(notify) {
            axios.post("/api/user/notify/" + notify.notifySeq, {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }
        }).then(() => {
            notify.isRead = true
        })
        },
        goToGroup(groupSeq) {
            this.$router.push("/group" + groupSeq)
        },
        goToPost(groupSeq, postSeq) {
            axios.get(`/api/post/title/${groupSeq}/${postSeq}`, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }}
            ).then(r => {
                const postInfo = r.data.data
                if (postInfo.type == "MSG") {
                    this.$router.push({ 
                        name: 'messageJamye',
                        params: { postSeq: postInfo.postSequence },
                        query: { groupSeq: groupSeq }
                    })
                } else {
                    this.$router.push({ 
                        name: 'boardJamye',
                        params: { postSeq: postInfo.postSequence },
                        query: { groupSeq: groupSeq }
                    })
                }
            }).catch(() => {
                this.$toastr.error("이미 삭제된 게시글입니다.")
                this.$router.push("/notify-box")
            })
            this.$router.push("/post" + postSeq)
        },
        allNotifyRead() {
            axios.post("/api/user/notify/read/all", {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }})
                .then(() => {
                    this.isNoRead = false
                    this.getNotiftList()
                })
            
        },
        allReadNotifyDelete() {
            axios.delete("/api/user/notify/read/delete", {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }})
                .then(() => {
                    this.getNotiftList()
                })
        },
        deleteNotify(notifySeq) {
            axios.delete("/api/user/notify/delete/" + notifySeq, {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }})
                .then(() => {
                    this.getNotiftList()
                })
        },
        async discordLogin() {
            const authUrl = "https://discord.com/oauth2/authorize"

            const response_type = "code"
            
            const scope = "identify"
            console.log("window.cordova:"+window.cordova)
            if (typeof window.cordova !== 'undefined') {
                const state = 'app';
                axios.get("/discord/client-id").then(r => {
                    const url = `${authUrl}?client_id=${r.data.data}&response_type=${response_type}&redirect_uri=${redirect_uri}&scope=${scope}&sstate=${state}`;
                    var inAppBrowser = window.cordova.InAppBrowser.open(url, "_blank", "location=no,fullscreen=yes");

                    inAppBrowser.addEventListener("loadstart", function(event) {
                                console.log("인앱브라우저 종료 로직 확인")
                                if (event.url.startsWith("https://jamye.p-e.kr/oauth/redirect")) {
                                    const url = new URL(event.url);
                                    const code = url.searchParams.get('code');
                                    const state = url.searchParams.get('state');
    
                                        if(code == null || code == undefined) {
                                            this.$toastr.error("정상적인 접근이 아닙니다")
                                            this.$router.push("/")
                                            return
                                        }

                                        axios.get("/discord/oauth/callback?code="+code, {
                                            headers: {
                                                Authorization: `Bearer `+this.$cookies.get('accessToken')
                                            }
                                    })
                                        .then((r)=>{
                                            console.log(r)
                                        })
                                        if (state == 'app') {
                                                console.log("app close")
                                                inAppBrowser.close();
                                                console.log("app close2")
                                                self.$router.push("/notify-box")
                                            } else {
                                                console.log("디스코드 redirect 웹 ver")
                                                self.$router.push("/notify-box")
                                            }
                                    }
                                });
                }).catch(() => this.$toastr.error("현재 디스코드 연동을 사용할 수 없습니다. 운영자에게 문의해주세요."))
            } else {
                axios.get("/discord/client-id").then(r => {
                    const url = `${authUrl}?client_id=${r.data.data}&response_type=${response_type}&redirect_uri=${redirect_uri}&scope=${scope}`;
                    window.location.href=url
                }).catch(() => this.$toastr.error("현재 디스코드 연동을 사용할 수 없습니다. 운영자에게 문의해주세요."))
            }
                
            
        }
    }
}
</script>
<style>

.message-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  position: relative; /* 자식의 absolute 위치를 기준으로 함 */
}

.message-content {
  font-size: 16px;
  color: #333;
}

.message-date {
  font-size: 14px;
  color: #666;
  text-align: center;
}
.close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #090909;
  outline: none;
}
.close-btn:hover {
  color: #333;
}
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.descript {
    margin-bottom: 10px;
}
.notifyBox{
    margin-right: 10px
}
</style>