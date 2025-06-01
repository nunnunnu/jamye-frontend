<template>
    <div class="b-container">
        <h2 class="title pb-4 mb-4 fst-italic border-bottom">로그인</h2>
        <form @submit.prevent="submitForm">
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">아이디</span>
                <input type="text" class="form-control" v-model="id" aria-describedby="basic-addon1">
            </div>
            <div class="input-group mb-3">
                <span class="input-group-text" id="basic-addon1">비밀번호</span>
                <input type="password" class="form-control" v-model="pwd" aria-describedby="basic-addon1">
            </div>
                <button type="submit" class="btn btn-dark btn-block">로그인</button>
                <br>
        </form>     
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <input type="checkbox" id="saveId" class="form-check-input me-2" v-model="idSave">
                <label for="saveId">아이디 저장</label>
            </div>
            <div>
                <router-link
                    :to="{ name: 'findId', params:{activeTab: 'id'} }"
                    class="clickable-text mx-3"
                    >
                    아이디 찾기
                </router-link>
                <router-link
                    :to="{ name: 'findId',  params:{activeTab: 'pw'} }"
                    class="clickable-text"
                    >
                    비밀번호 찾기
                </router-link>

            </div>
        </div>
        <div class="d-flex align-items-center">
            <span class="clickable-text join" @click="join">회원 가입</span>
        </div>
        <div>
            <img class="socialLogin clickable" @click="loginWithKakao" src="@/assets/img/kakao_login_medium_wide.png" style="width: 100%" height="60px">
            <!-- <div class="socialLogin" id="googleBtn" style="width: 100%; display: block;">Google Login</div> -->
        </div>

    </div>
</template>
<script>
import { redirectBaseUrl } from '@/js/config';
import axios from 'axios'

export default {
        name: 'loginPage',
        data() {
            return {
                id:null,
                pwd:null,
                returnUrl:null,
                idSave:null
            }
        },
        created() {
            if(this.$cookies.get("accessToken")!=null){
                this.$toastr.warning("이미 로그인되었습니다.")
                this.$router.go(-1);
            }
            if(this.$cookies.get("saveId") !==null) {
                this.idSave=true
                this.id = this.$cookies.get("saveId")
            }
            
        },
        mounted() {
            // axios.get("/oauth/google/client-id")
            // .then(response => {
            //     const clientId = response.data.data
            //     setTimeout(() => {
            //         window.google.accounts.id.initialize({
            //             client_id: clientId,
            //             callback: this.handleCredentialResponse
            //         })
            //         window.google.accounts.id.renderButton(
            //             document.getElementById("googleBtn"),
            //             { theme: "outline", size: "large" }
            //         )
            //         const iframe = document.querySelector('#googleBtn iframe')
            //             if (iframe) {
            //                 iframe.style.width = '100%'
            //             }
            //     }, 500); // 0.5초 지연 후 실행
            // }).catch(e => {
            //     this.$toastr.error("현재 구글 로그인을 사용할 수 없습니다.")
            // })
        },
        methods: {
            submitForm() {
                if (this.id == null || this.id === undefined || this.pwd == null || this.pwd === undefined) {
                    this.$toastr.warning("아이디 혹은 비밀번호를 입력하지 않으셨습니다.");
                } else {
                    const param = {
                        id: this.id,
                        password: this.pwd
                    }
                    console.log("무ㅓ지?")
                    axios.post('/api/user/login', param)
                    .then(response => {
                        const token = response.data.data.token;
                        const accessToken = token.accessToken; 
                        const refreshToken = token.refreshToken; 
                        
                        if (!accessToken || !refreshToken) {
                            this.$toastr.warning("토큰을 받아오는 데 실패했습니다.");
                            return;
                        }
                        
                        this.$cookies.set('accessToken', accessToken);
                        this.$cookies.set('refreshToken', refreshToken);
                        this.$cookies.set('id', response.data.data.id);
                        this.$cookies.set('sequence', response.data.data.sequence);
                        if(this.idSave) {
                            this.$cookies.set("saveId", response.data.data.id)
                        } else {
                            this.$cookies.remove("saveId")
                        }
                        this.$emit("isLoginChange", true)
                        this.id = null
                        this.pwd = null
                        if (this.$cookies.get('beforePage') != null) {
                            this.$cookies.remove('beforePage');
                            this.$router.push("/");
                        } else {
                            this.$router.go(-1);
                        }
                    })
                    .catch(error => {
                        if (error.response) {
                            this.$toastr.error(error.response.data.message);
                            this.id = this.$cookies.get("saveId")
                            this.pwd = null
                        } else {
                            console.log("login error:", JSON.stringify(error));
                            this.$toastr.warning("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
                        }
                    });
                }
            },
            join() {
                this.$router.push("/join")
            },
            loginWithKakao() {
                const authUrl = "https://kauth.kakao.com/oauth/authorize";
                const responseType = "code";
                const redirectUrl = redirectBaseUrl + "/oauth/kakao"

                axios.get("/oauth/kakao/client-id").then(r => {
                    if (typeof window.cordova !== 'undefined') {
                        const state = 'app';
                        const url = `${authUrl}?client_id=${r.data.data}&redirect_uri=${redirectUrl}&response_type=${responseType}&state=${state}`;

                        const self = this // Vue context 저장

                        document.addEventListener('deviceready', function() {
                            console.log("코도바 앱 ver");
                            // fetchFcmToken()
                            console.log("InAppBrowser:" + window.cordova.InAppBrowser);
                            var inAppBrowser = window.cordova.InAppBrowser.open(url, "_blank", "location=no,fullscreen=yes");
                                
                            inAppBrowser.addEventListener("loadstart", function(event) {
                                console.log("인앱브라우저 종료 로직 확인")
                                if (event.url.startsWith("https://jamye.p-e.kr/oauth/kakao")) {
                                    const url = new URL(event.url);
                                    // code 파라미터 추출
                                    const code = url.searchParams.get("code");
                                    const state = url.searchParams.get("state");

                                    console.log("code:", code)
                                    console.log("state:", state)

                                    if(code == null || code == undefined) {
                                        self.$toastr.error("정상적인 접근이 아닙니다")
                                        self.$router.push("/")
                                        return
                                    }
                                    console.log("카카오 인증코드 정상 수신 확인")

                                    axios.get("/oauth/kakao/callback?code="+code)
                                    .then((response)=>{
                                        console.log("kakao callback api 호출")
                                        const token = response.data.data.token;
                                        const accessToken = token.accessToken; 
                                        const refreshToken = token.refreshToken; 
                                        
                                        if (!accessToken || !refreshToken) {
                                            self.$toastr.warning("토큰을 받아오는 데 실패했습니다.");
                                            return;
                                        }
                                        
                                        self.$cookies.set('accessToken', accessToken);
                                        self.$cookies.set('refreshToken', refreshToken);
                                        self.$cookies.set('id', response.data.data.id);
                                        self.$cookies.set('sequence', response.data.data.sequence);
                                        self.$emit("isLoginChange", true)
                                        console.log("status:" + state)
                                        // setTimeout(() => {
                                            console.log("setTimeout 실행됨")
                                            if (state == 'app') {
                                                console.log("app close")
                                                inAppBrowser.close();
                                                console.log("app close2")
                                                self.$router.push("/");
                                            } else {
                                                console.log("kakao redirect 웹 ver")
                                                self.$router.push("/");
                                            }
                                        // }, 0)
                                        self.$toastr.success("카카오 로그인 성공")
                                });
                            }
                        })
                        })
                    } else {
                        const state = "web";
                        const url = `${authUrl}?client_id=${r.data.data}&redirect_uri=${redirectUrl}&response_type=${responseType}&state=${state}`;
                        console.log("웹 ver");
                        window.location.href=url
                    }
                }).catch(e => {
                    this.$toastr.error(e)
                    this.$toastr.error("현재 카카오 로그인을 사용할 수 없습니다. 운영자에게 문의해주세요.")
                    this.$toastr.error(e.response.data.message)
                })
            },
            async handleCredentialResponse(response) {
                const token = response.credential

                axios.post("/oauth/google", { token }).then(response => {
                    const token = response.data.data.token;
                    const accessToken = token.accessToken; 
                    const refreshToken = token.refreshToken; 
                    
                    if (!accessToken || !refreshToken) {
                        this.$toastr.warning("토큰을 받아오는 데 실패했습니다.");
                        return;
                    }
                    
                    this.$cookies.set('accessToken', accessToken);
                    this.$cookies.set('refreshToken', refreshToken);
                    this.$cookies.set('id', response.data.data.id);
                    this.$cookies.set('sequence', response.data.data.sequence);
                    this.$emit("isLoginChange", true)
                    setTimeout(() => {
                        this.$router.push("/");
                    }, 0)
                }).catch(e => {
                    console.log(JSON.stringify(e))
                    this.$toastr.error("구글 로그인에 실패하였습니다. 운영자에게 문의해주세요.")
                    this.$router.push("/")
                })
            }
        }
    }

</script>
<style>
.clickable:hover {
  cursor: pointer;
}
.clickable-text {
    cursor: pointer; /* 클릭 가능한 커서로 변경 */
    color: #000000; /* 링크 색상 (부트스트랩의 기본 링크 색상) */
}

.clickable-text:hover {
    color: #696969; /* 호버 시 색상 변경 */
}
.join {
    margin-top: 20px; /* 위쪽 여백을 추가 */
    text-align: center;
    width: 100%; /* 중앙 정렬을 위한 전체 너비 */
}
.socialLogin {
    margin-bottom: 5px;
}

</style>