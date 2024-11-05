<template>
    <b-container>
      <header class="masthead">
            <div class="container px-5">
                <div class="row gx-5 align-items-center">
                    <div class="col-lg-6">
                        <!-- Mashead text and app badges-->
                        <div class="mb-5 mb-lg-0 text-center text-lg-start">
                            <h1 class="display-1 lh-1 mb-3" style="font-weight: bold;">잼얘 가챠</h1>
                            <p class="lead fw-normal text-muted mb-5">Talk Funny(잼얘해봐)<br>U GO GIRL(님선하세요 소녀여)</p>
                            <div v-if="!this.isLogin">
                                <button type="button" class="btn btn-dark" @click="login">로그인 후 뽑기</button>
                            </div>
                            <div v-if="this.isLogin">
                                <div v-if="currentGroup != null" class="mt-3 d-flex justify-content-between">
                                    <button type="button" class="btn btn-dark custom-btn">뽑기</button>
                                    <button type="button" class="btn btn-dark custom-btn"  data-bs-toggle="modal" data-bs-target="#jamye-create">잼얘 넣기</button>
                                        <div class="modal fade" id="jamye-create" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                            <div class="modal-dialog modal-dialog-centered">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h1 v-if="step === 1" class="modal-title fs-5" id="jamye-create1">잼얘 생성 - 기본 정보 생성</h1>
                                                        <h1 v-if="step === 2" class="modal-title fs-5" id="jamye-create2">잼얘 생성</h1>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click.stop></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <template v-if="step === 1">
                                                            <!-- 게시글 정보 입력 화면 -->
                                                            <div class="form-group">
                                                                <input type="text" class="form-control" name="post-title" id="post-title" placeholder="게시글 제목">
                                                            </div>
                                                            <div class="mt-3 d-flex justify-content-between">
                                                                <button class="btn btn-dark custom-btn" data-bs-toggle="collapse" href="#board-float">게시글 형식</button>
                                                                <button class="btn btn-dark custom-btn" data-bs-toggle="collapse" href="#message-float">메세지 형식</button>
                                                            </div>
                                                            <div class="collapse" id="board-float">
                                                                <br>
                                                                <textarea class="form-control detail-input" aria-label="With textarea"></textarea>
                                                            </div>
                                                            <div class="collapse" id="message-float">
                                                                <br>
                                                                <div class="row g-3">
                                                                    <div class="col-auto">
                                                                        <input type="text" readonly class="form-control-plaintext" id="staticEmail2" value="닉네임">
                                                                    </div>
                                                                    <div class="col-auto">
                                                                        <input type="text" class="form-control" id="inputPassword2" placeholder="닉네임" v-model="name">
                                                                    </div>
                                                                    <div class="col-auto">
                                                                        <button type="submit" class="btn btn-dark mb-3" @click="nicknameAdd(name)">추가</button>
                                                                    </div>
                                                                </div>
                                                                <div class="nicknames-container">
                                                                    <div
                                                                    v-for="nickname in nicknames"
                                                                    :key="nickname"
                                                                    class="nickname"
                                                                    >
                                                                    {{ nickname }}
                                                                    <span class="remove-button" @click="removeNickname(nickname)">X</span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div class="row g-2">
                                                                    <div class="col-auto">
                                                                        <input type="file" class="form-control" id="inputPassword2" placeholder="" @change="messageImageChange">
                                                                    </div>
                                                                    <div class="col-auto">
                                                                        <button type="submit" class="btn btn-dark mb-3" @click="messageListGet">메세지 변환</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                                    <div class="card card-body">
                                                                        <div class="chat-room">
                                                                            <div v-for="text in messageResponse" :key="text" class="message-me">
                                                                                <div class="send-user">{{ text.sendUser }}</div>
                                                                                <div v-if="text.myMessage" class="chat-message">
                                                                                           <div v-for="(msg, index) in text.message" :key="index">
                                                                                        <p class="from-me">{{ msg }}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div v-else>
                                                                                    <div v-for="(msg, index) in text.message" :key="index">
                                                                                        <p class="from-them">{{ msg }}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                        </template>
                                                        <template v-if="step === 2">
                                                            <!-- 내 프로필 생성 화면 -->
                                                            
                                                        </template>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <div v-if="step == 1" class="mt-3 d-flex justify-content-between">
                                                            <button class="btn btn-dark custom-btn">생성</button>
                                                        </div>
                                                        <button v-if="step === 2" type="button" class="btn btn-dark btn-block" @click="create">생성</button>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                                <div v-if="currentGroup == null">
                                    <button type="button" class="btn btn-dark" disabled>뽑기</button>
                                    <button type="button" class="btn btn-dark" disabled>잼얘 넣기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <!-- Masthead device mockup feature-->
                        <div class="masthead-device-mockup">
                            <svg class="circle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="circleGradient" gradientTransform="rotate(45)">
                                        <stop class="gradient-start-color" offset="0%"></stop>
                                        <stop class="gradient-end-color" offset="100%"></stop>
                                    </linearGradient>
                                </defs>
                                <circle cx="50" cy="50" r="50"></circle>
                            </svg>
                                <svg class="shape-1 d-none d-sm-block" viewBox="0 0 240.83 240.83" xmlns="http://www.w3.org/2000/svg">
                                <rect x="-32.54" y="78.39" width="305.92" height="84.05" rx="42.03" transform="translate(120.42 -49.88) rotate(45)"></rect>
                                <rect x="-32.54" y="78.39" width="305.92" height="84.05" rx="42.03" transform="translate(-49.88 120.42) rotate(-45)"></rect>
                            </svg>
                            <svg class="shape-2 d-none d-sm-block" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="50"></circle>
                            </svg>
                            <div class="device-wrapper">
                                <div class="device" data-device="iPhoneX" data-orientation="portrait" data-color="black">
                                    <div class="screen bg-black">
                                        <video muted="muted" autoplay="" loop="" style="max-width: 100%; height: 100%"><source src="@/assets/img/demo-screen.mp4" type="video/mp4" /></video>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

    </b-container>
  </template>
  
  <script>
import axios from 'axios';


export default {
    name: 'MainHome',
    data() {
        return {
            currentGroup: null,
            step: 1,
            nicknames: new Set,
            name: null,
            messageImage: null,
            messageResponse: [{"sendUser":"이송은","message":["호떡믹스 토스에 8개 이만원인데 공구할","사람 없나","한개 이천오백원"],"sendDate":"오후 5:23","myMessage":false,"isReply":false,"replyMessage":null},{"sendUser":null,"message":["슬퍼"],"sendDate":"오후 5:50","myMessage":true,"isReply":false,"replyMessage":null},{"sendUser":null,"message":["근데사도안먹을듯"],"sendDate":"오후 5:51","myMessage":true,"isReply":false,"replyMessage":null},{"sendUser":"이송은","message":["난 호떡 좋아하니까 해먹을거같긴한데","8개는 넘 많아"],"sendDate":"오후 5:52","myMessage":false,"isReply":false,"replyMessage":null},{"sendUser":null,"message":["많긴 혀"],"sendDate":"오후 5:54","myMessage":true,"isReply":false,"replyMessage":null}]
        }
    },
    methods: {
        login() {
            this.$router.push("/login")
        },
        nicknameAdd(name) {
            this.nicknames.add(name)
        },
        removeNickname(nickname) {
            this.nicknames.delete(nickname);
            this.nicknames = new Set([...this.nicknames]);
        },
        messageListGet() {
            const formdata = new FormData()
            formdata.append("image", this.messageImage)
            const nicknameParam = [...this.nicknames].join(',');
            axios.post("/api/post/message-text?sendUser=" + nicknameParam, formdata, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                this.messageResponse = r.data.data
            })
            .catch(e => {
                alert(e.data.message)
            })
        },
        messageImageChange(event){
                const imgbox = this.$refs.imgbox //imgbox ref를 가진 div
                if(event.target.files && event.target.files[0]){ //파일있는지 검사
                    this.messageImage = event.target.files[0]
                }else{
                    imgbox.style.backgroundImage = ""
                }
                
            }
    },
    props: {
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        this.currentGroup = this.$cookies.get("group")
    }
}

</script>
  <style>
    a {
      text-decoration: none;
      color: black
    }
  
    .col-6 {
      display: flex;
      float: right;
      width: 100%;
    }
    .home{
      padding-bottom: 102px;
    }
    .chat-room {
  border: 1px solid #000;
  background-color: #fff;
  border: 1px solid #e5e5ea;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  font-family: "SanFrancisco";
  font-size: 1.25rem;
  margin: 0 auto 1rem;
  max-width: 600px;
  padding: 0.5rem 1.5rem;
}
.chat-room p {
  border-radius: 1.15rem;
  line-height: 1.25;
  max-width: 75%;
  padding: 0.5rem 0.875rem;
  position: relative;
  word-wrap: break-word;
    display: inline-block; /* 텍스트 길이에 맞게 박스 길이 조정 */
}
.chat-room p::before,
.chat-room p::after {
  bottom: -0.1rem;
  content: "";
  height: 1rem;
  position: absolute;
}

/* 상대방 */
.chat-room p.from-them {
  align-items: flex-start;
  background-color: #e5e5ea;
  color: #000;
  width: fit-content;
  font-size: 17px;
}
.chat-room p.from-them::after {
  background-color: #fff;
  border-bottom-right-radius: 0.5rem;
  left: 20px;
  transform: translate(-30px, -2px);
  width: 10px;
}
.chat-room p.from-them::before {
  border-bottom-right-radius: 0.8rem 0.7rem;
  border-left: 1rem solid #e5e5ea;
  left: -0.35rem;
  transform: translate(0, -0.1rem);
}

/* 나 */
.chat-room p.from-me {
  align-self: flex-end;
  background-color: #248bf5;
  color: #fff;
  margin-left: 100px;
  text-align: right;
  float: right;
  font-size: 17px;
}
.chat-room p.from-me::after {
  background-color: #fff;
  border-bottom-left-radius: 0.5rem;
  right: -40px;
  transform: translate(-30px, -2px);
  width: 10px;
}
.chat-room p.from-me::before {
  border-bottom-left-radius: 0.8rem 0.7rem;
  border-right: 1rem solid #248bf5;
  right: -0.35rem;
  transform: translate(0, -0.1rem);
}

.nicknames-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.nickname {
  background-color: black;
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  position: relative;
  transition: all 0.3s;
}

.remove-button {
  margin-left: 8px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  display: none;
}

.nickname:hover .remove-button {
  display: inline;
}
.message-me, message-them {
    display: inline;
    
}
.send-user {
    font-size: 17px;
}
.detail-input {
    height: 500px;
}
  </style>