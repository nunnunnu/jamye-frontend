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
                                                                <div class="card card-body">
                                                                    <div class="chat-room">
                                                                        <div v-for="[key, text] in Object.entries(messageResponse)" :key="key" class="message-me">                                                                        
                                                                            <!-- 내 매세지 -->
                                                                            <div v-if="text.myMessage" class="chat-message mt-3">
                                                                                <div class="info-container">
                                                                                    <div class="button-container">
                                                                                        <button class="circle-btn add" @click="addEmptyMessage(key)">
                                                                                            <i class="fas fa-plus"></i>
                                                                                        </button>
                                                                                        <button class="circle-btn up-arrow">
                                                                                            <i class="fas fa-arrow-up"></i>
                                                                                        </button>
                                                                                        <button class="circle-btn down-arrow">
                                                                                            <i class="fas fa-arrow-down"></i>
                                                                                        </button>
                                                                                        <button class="circle-btn edit" @click="editMessage(key)">
                                                                                            <i class="fas fa-pencil-alt"></i>
                                                                                        </button>
                                                                                        <button class="circle-btn delete" @click="removeMessageSeq(key, msg.seq)">
                                                                                            <i class="fas fa-trash"></i>
                                                                                        </button>
                                                                                    </div>
                                                                                    <span class="send-date">{{ text.sendDate }}</span>
                                                                                </div>
                                                                                <div v-for="msg in text.message" :key="msg.seq" class="message-container">
                                                                                    <p v-if="!isEditing[key]" class="from-me">{{ msg.message }}</p>
                                                                                    <p v-else class="from-me">
                                                                                        <input  type="text" v-model="msg.message" @blur="saveMessage(key, msg)" class="from-me">
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <!-- 상대 메세지 -->
                                                                            <div v-else class="chat-message-them mt-3">
                                                                                <div class="send-user">{{ text.sendUser }}</div>
                                                                                <div v-for="msg in text.message" :key="msg.seq" class="message-container">
                                                                                    <p v-if="!isEditing[key]" class="from-them">{{ msg.message }}</p>
                                                                                    <p v-else class="from-them">
                                                                                        <input  type="text" v-model="msg.message" @blur="saveMessage(key, msg)" class="from-them">
                                                                                    </p>
                                                                                    <div class="info-container-them">
                                                                                        <span class="send-date">{{ text.sendDate }}</span>
                                                                                        <div class="button-container">
                                                                                            <button class="circle-btn add" @click="addEmptyMessage(key)"><i class="fas fa-plus"></i></button>
                                                                                            <button class="circle-btn up-arrow"><i class="fas fa-arrow-up"></i></button>
                                                                                            <button class="circle-btn down-arrow"><i class="fas fa-arrow-down"></i></button>
                                                                                            <button class="circle-btn edit" @click="editMessage(key)"><i class="fas fa-pencil-alt"></i></button>
                                                                                            <button class="circle-btn delete" @click="removeMessageSeq(key, msg.seq)"><i class="fas fa-trash"></i></button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
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
            isEditing: {},
            messageResponse:  {
        "1": {
          "sendUser": "이송은",
          "sendUserInGroupSeq": null,
          "message": [
            { "seq": 1, "message": "호떡믹스 토스에 8개 이만원인데 공구할" },
            { "seq": 2, "message": "사람 없나" },
            { "seq": 3, "message": "한개 이천오백원" }
          ],
          "sendDate": "오후 5:23",
          "myMessage": false,
          "isReply": false,
          "replyMessage": null
        },
        "2": {
          "sendUser": null,
          "sendUserInGroupSeq": null,
          "message": [
            { "seq": 4, "message": "슬퍼" }, {"seq":5, "message":"test"}
          ],
          "sendDate": "오후 5:50",
          "myMessage": true,
          "isReply": false,
          "replyMessage": null
        },
        "3": {
          "sendUser": null,
          "sendUserInGroupSeq": null,
          "message": [
            { "seq": 5, "message": "근데사도안먹을듯" }
          ],
          "sendDate": "오후 5:51",
          "myMessage": true,
          "isReply": false,
          "replyMessage": null
        },
        "4": {
          "sendUser": "이송은",
          "sendUserInGroupSeq": null,
          "message": [
            { "seq": 1, "message": "난 호떡 좋아하니까 해먹을거같긴한데" },
            { "seq": 2, "message": "8개는 넘 많아" }
          ],
          "sendDate": "오후 5:52",
          "myMessage": false,
          "isReply": false,
          "replyMessage": null
        },
        "5": {
          "sendUser": null,
          "sendUserInGroupSeq": null,
          "message": [
            { "seq": 3, "message": "많긴 혀"}
          ],
          "sendDate": "오후 5:54",
          "myMessage": true,
          "isReply": false,
          "replyMessage": null
        }
      }
    }
        }
    ,
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
            
        },
        editMessage(key) {
            this.isEditing[key] = true;
        },
        saveMessage(key, msg) {
            console.log(msg)
            this.isEditing[key] = false;
        },
        removeMessageSeq(key, msgSeq) {
            if (this.messageResponse[key] && Array.isArray(this.messageResponse[key].message)) {
                this.messageResponse[key].message = this.messageResponse[key].message.filter(
                    (msg) => msg.seq !== msgSeq
                );
            }
        },
        addEmptyMessage(key) {
        if (this.messageResponse[key] && Array.isArray(this.messageResponse[key].message)) {
            const lastSeq = this.messageResponse[key].message.length > 0
                ? this.messageResponse[key].message[this.messageResponse[key].message.length - 1].seq + 1
                : 1;

            this.messageResponse[key].message.push({
                seq: lastSeq,
                message: ""
            });
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
    .message-container {
        display: flex;
        align-items: center; 
        gap: 8px;
    }

    .chat-room {
        flex-direction: column;
        overflow: hidden;
        display: inline-block; 
    }
    
    .chat-message {
        display: flex

    }

    .chat-room p::before,
    .chat-room p::after {
        bottom: -0.1rem;
        content: "";
        height: 1rem;
        position: absolute;
    }

    /* 말풍선꼬리 */
    .chat-room p.from-them::before { 
        border-bottom-right-radius: 0.8rem 0.7rem;
        border-left: 1rem solid #e5e5ea;
        left: -0.35rem;
        transform: translate(0, -0.1rem);
    }
    .chat-room p.from-me::before {
        border-bottom-left-radius: 0.8rem 0.7rem;
        border-right: 1rem solid #248bf5;
        right: -0.35rem;
        transform: translate(0, -0.1rem);
    }

    .chat-room p.from-them::after {
        background-color: #fff;
        border-bottom-right-radius: 0.5rem;
        left: 20px;
        transform: translate(-30px, -2px);
        width: 10px;
    }
    .chat-room p.from-me::after {
        background-color: #fff;
        border-bottom-left-radius: 0.5rem;
        right: -40px;
        transform: translate(-30px, -2px);
        width: 10px ;
    }


    .chat-room .message-content {
        display: flex;
        align-items: flex-end;
    }

    .chat-room p {
        border-radius: 1.15rem;
        line-height: 1.25;
        padding: 0.5rem 0.875rem;
        position: relative;
    }

    .chat-room {
        flex-direction: column; /* 세로로 쌓이게 설정 */
    }

    /* 내 메시지 스타일링 */
    p.from-me {
        background-color: #248bf5;
        color: #fff;
        text-align: right;
        font-size: 17px;
    }

    input.from-me {
        background-color: #248bf5;
        color: #fff;
        border: none;
    }

    /* 상대방 메시지 스타일링 */
    .chat-room p.from-them {
        background-color: #e5e5ea;
        color: #000;
        font-size: 17px;
        text-align: left;
    }

    input.from-them {
        background-color: #e5e5ea;
        color: #000;
        border: none;
    }

    /* 날짜와 버튼 컨테이너 설정 */
    .info-container {
        display: flex;
        align-items: center;
        margin-left: auto;
        gap: 5px;
    }

    .info-container-them {
        display: flex;
        align-items: center;
        gap: 5px;
    }


    .send-date {
        font-size: 0.75em;
        color: gray;
        white-space: nowrap; /* 줄 바꿈 방지 */
    }

    .button-container {
        display: flex;
        gap: 4px;
    }

    /* 작은 동그라미 버튼 스타일 */
    .circle-btn {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background-color: rgba(94, 94, 94, 0.2);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
    }

    .circle-btn:hover {
    background-color: rgba(128, 128, 128, 0.4);
    }

    .circle-btn:active {
    background-color: rgba(128, 128, 128, 0.6);
    }
    .send-user {
        font-size: 17px;
        margin-bottom: 5px;
        text-align: left;
    }

</style>