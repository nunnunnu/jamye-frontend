<template>
    <div class="b-container">
        <br><br><br>
                <h1 class="modal-title fs-5" id="jamye-create1">잼얘 생성 - 메세지 타입</h1>
                                                    <!-- <div class="modal-body"> -->
                                                            <!-- 게시글 정보 입력 화면 -->
                <div class="form-group">
                    <input type="text" class="form-control" name="post-title" id="post-title" v-model="postTitle" placeholder="게시글 제목">
                </div>
                    <br>
                    <div class="col-auto">
                        <button type="button" class="btn btn-dark mb-3"  data-bs-toggle="modal" data-bs-target="#nicknameAdd" @click="groupUserList()">프로필 닉네임 추가</button>
                    </div>
                    <div class="modal fade" id="nicknameAdd" tabindex="-1" aria-labelledby="nicknameAdd" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h1 class="modal-title fs-5" id="jamye-create1">프로필 닉네임 추가</h1>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click.stop></button>
                                    </div>
                                    <div class="modal-body">
                                        <input type="text" class="form-control" placeholder="업로드할 메세지 이미지에 캡쳐된 상대의 이름을 모두 입력해주세요">
                                        <div v-if="userInGroup != 0">
                                            <br>
                                            <button class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            해당 회원과 매핑할 그룹 내 유저가 있다면 선택해주세요
                                        </button>
                                            <ul class="dropdown-menu" v-for="user in userInGroup" :key="user.groupUserSequence">
                                                {{ user.nickname }}
                                            </ul>
                                        
                                        </div>
                                    </div>
                                </div>
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
                        <div v-for="[key, text] in Object.entries(messageResponse)" :key="key">                                                                        
                            <!-- 내 매세지 -->
                            <div v-if="text.myMessage" class="chat-message mt-3">
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container-me">
                                    <div class="info-container">
                                        <div class="button-container">
                                            <button class="circle-btn add" @click="addEmptyMessage(key, msg.seq)">
                                                <i class="fas fa-plus"></i>
                                            </button>
                                            <button class="circle-btn up-arrow" @click="moveMessageUp(key, msg.seq)">
                                                <i class="fas fa-arrow-up"></i>
                                            </button>
                                            <button class="circle-btn down-arrow" @click="moveMessageDown(key, msg.seq)">
                                                <i class="fas fa-arrow-down"></i>
                                            </button>
                                            <button class="circle-btn edit" @click="editMessage(key, msg.seq)">
                                                <i class="fas fa-pencil-alt"></i>
                                            </button>
                                            <button class="circle-btn delete" @click="removeMessageSeq(key, msg.seq)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                        <span class="send-date">{{ text.sendDate }}</span>
                                </div>
                                    <p v-if="this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-me">
                                        <input  type="text" v-model="msg.message" @blur="saveMessage(key, msg)" class="from-me">
                                    </p>
                                    <p v-else class="from-me">{{ msg.message }}</p>
                                    
                                </div>
                            </div>
                            <!-- 상대 메세지 -->
                            <div v-else class="chat-message mt-3">
                                <div class="send-user">{{ text.sendUser }}</div>
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container">
                                    <p v-if="this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-them">
                                        <input  type="text" v-model="msg.message" @blur="saveMessage(key, msg)" class="from-them">
                                    </p>
                                    <p v-else class="from-them">{{ msg.message }}</p>
                                    <div class="info-container-them">
                                        <span class="send-date">{{ text.sendDate }}</span>
                                        <div class="button-container">
                                            <button class="circle-btn add" @click="addEmptyMessage(key, msg.seq)"><i class="fas fa-plus"></i></button>
                                            <button class="circle-btn up-arrow" @click="moveMessageUp(key, msg.seq)"><i class="fas fa-arrow-up"></i></button>
                                            <button class="circle-btn down-arrow" @click="moveMessageDown(key, msg.seq)"><i class="fas fa-arrow-down"></i></button>
                                            <button class="circle-btn edit" @click="editMessage(key, msg.seq)"><i class="fas fa-pencil-alt"></i></button>
                                            <button class="circle-btn delete" @click="removeMessageSeq(key, msg.seq)"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="btn btn-dark btn-block" @click="createPost()">생성</button>
            </div>
</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            nicknames: new Set,
            name: null,
            messageImage: null,
            isEditing: {},
            postType: null,
            postTitle: null,
            detail: null,
            userInGroup: [],
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
            { "seq": 1, "message": "슬퍼" }, {"seq":2, "message":"test"}, {"seq":3, "message":"sss"}
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
            { "seq": 1, "message": "근데사도안먹을듯" }
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
            { "seq": 1, "message": "많긴 혀"}
          ],
          "sendDate": "오후 5:54",
          "myMessage": true,
          "isReply": false,
          "replyMessage": null
        }
      }
        }
    },
    props: {
        seq: Number
    },
    methods: {
        nicknameAdd(name) {
            this.nicknames.add(name)
        },
        removeNickname(nickname) {
            this.nicknames.delete(nickname);
            this.nicknames = new Set([...this.nicknames]);
        },
        messageListGet() {
            if(this.messageImage == null) {
                alert("메세지 변환할 이미지를 첨부해주세요")
                return
            }
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
        editMessage(key, seq) {
            if (!this.isEditing[key]) {
                this.isEditing[key] = {}; 
            }
            this.isEditing[key][seq] = true; 
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
                this.messageResponse[key].message.forEach(it => {
                    if(it.seq > msgSeq) {
                        it.seq = it.seq - 1
                    }
                });
                if (!this.isEditing[key]) {
                    this.isEditing[key] = {}; 
                }
                this.isEditing[key][msgSeq] = false 
                }
        },
        addEmptyMessage(key, msgSeq) {
            if (this.messageResponse[key] && Array.isArray(this.messageResponse[key].message)) {
                this.messageResponse[key].message.forEach(it => {
                    if(it.seq > msgSeq) {
                        it.seq = it.seq + 1
                    }
                });
                this.messageResponse[key].message.push({
                    seq: msgSeq + 1,
                    message: "."
                });    
                this.messageResponse[key].message.sort((a, b) => a.seq - b.seq);
                
                if(this.isEditing[key, msgSeq + 1]) {
                    console.log(true)
                    this.editMessage(key, msgSeq + 1 + 1)
                }
                this.editMessage(key, msgSeq + 1)
            }    
        },
        moveMessageUp(key, seq) {
            if(key==1 && seq ==1) {
                return
            }
            const messageArray = this.messageResponse[key].message;
            console.log(key + "," + seq)
            // seq가 1인 경우 새로운 key로 객체 생성
            if (seq === 1) {
                var messageText = JSON.parse(JSON.stringify(this.messageResponse[key].message.filter(msg => msg.seq == seq)));
                this.messageResponse[key].message = this.messageResponse[key].message.filter(msg => msg.seq != seq)
                var orderSeq = 1
                if(this.messageResponse[key].message.length != 0) {
                    this.messageResponse[key].message.forEach(msg => {
                        msg.seq = orderSeq++
                    })
                }
                
                var messageNewObject = JSON.parse(JSON.stringify(this.messageResponse[key]));
                
                var preMessageCut = JSON.parse(JSON.stringify(this.messageResponse[key-1]))
                if(preMessageCut.sendUser == messageText.sendUser) {
                    const maxSeq = preMessageCut.message.reduce((max, msg) => {
                        return msg.seq > max ? msg.seq : max;
                    }, 0);

                    var maxMsg = preMessageCut.message.pop()
                    preMessageCut.message.push({
                        seq: maxSeq,
                        message: messageText.pop().message
                    })
                    preMessageCut.message.push({
                        seq: maxSeq + 1,
                        message: maxMsg.message
                    })
                    this.messageResponse[key - 1].message = []
                } else {
                    preMessageCut.message = [preMessageCut.message.pop()]
                    messageNewObject.message = messageText
                    messageNewObject.sendDate = null
                }
                const lastSeq = preMessageCut.message.reduce((max, msg) => {
                    return msg.seq > max ? msg.seq : max;
                    }, 0);
                this.messageResponse[key - 1].message = this.messageResponse[key - 1].message.filter(msg => msg.seq != lastSeq)

                var tempMap = new Map
                var tempKey = 1
                for(let [id, value] of Object.entries(this.messageResponse)) {
                    if(id == key) {
                        if(messageNewObject.message.length != 0) {
                            tempMap[tempKey++] = messageNewObject
                        }
                        
                        if(preMessageCut.message.length != 0) {
                            tempMap[tempKey++] = preMessageCut
                        }
                        
                        if(value.message.length != 0) {
                            tempMap[tempKey++] = value
                        }

                    } else if(value.message.length != 0){
                        tempMap[tempKey++] = value
                    }
                }
                console.log("result1:" + JSON.stringify(tempMap))
                
                var tempMapUser = new Map
                var preUser = null
                tempKey = 1
                for(let [id, value] of Object.entries(tempMap)) {
                    console.log(value)
                    if(id == 1) {
                        preUser = value.sendUser
                        tempMapUser[tempKey++] = value
                        continue
                    }
                    if (value.sendUser == preUser) {
                        console.log(preUser)
                        console.log(value.sendUser)
                        var maxNum = tempMapUser[tempKey - 1].message.reduce((max, msg) => {
                            return msg.seq > max ? msg.seq : max;
                        }, 0);
                        value.message.forEach(msg => tempMapUser[tempKey - 1].message.push({
                            seq: ++maxNum,
                            message: msg.message
                        }))
                    } else {
                        tempMapUser[tempKey++] = value
                    }
                    preUser = value.sendUser
                    console.log("result2:" + JSON.stringify(tempMapUser))
                }
                console.log("result2-1:" + JSON.stringify(tempMapUser))
                this.messageResponse = JSON.parse(JSON.stringify(tempMapUser))

                console.log("result3:" + JSON.stringify(this.messageResponse))
            } else {
                // seq가 1이 아닌 경우 배열 내에서 순서 변경
                const index = messageArray.findIndex(msg => msg.seq === seq);
                if (index > 0) {
                // 현재 메시지를 한 단계 위로 올림
                [messageArray[index - 1], messageArray[index]] = [messageArray[index], messageArray[index - 1]];
                
                // seq 값을 업데이트
                messageArray[index - 1].seq -= 1;
                messageArray[index].seq += 1;
                }
            }

        },
        moveMessageDown(key, seq) {
            const maxKey = Math.max(...Object.keys(this.messageResponse).map(Number));
            const maxSeq = this.messageResponse[maxKey].message.reduce((max, msg) => {
                        return msg.seq > max ? msg.seq : max;
                    }, 0);

            if(key==maxKey && seq ==maxSeq) {
                return
            }


            const messageArray = this.messageResponse[key].message;
            const editMapMaxSeq = messageArray.reduce((max, msg) => {
                        return msg.seq > max ? msg.seq : max;
                    }, 0);
            console.log(key + "," + seq)

            if (seq === editMapMaxSeq) {
                var messageText = JSON.parse(JSON.stringify(this.messageResponse[key]))
                messageText.message = []
                messageText.message.push({
                    seq: 1,
                    message: this.messageResponse[key].message.pop().message
                })
                console.log("1:" + JSON.stringify(messageText))
                console.log(this.messageResponse[key])
                var nextKey = Number(key) + 1
                var upMessage = JSON.parse(JSON.stringify(this.messageResponse[nextKey]))
                upMessage.message = this.messageResponse[nextKey].message.filter(msg => msg.seq == 1)
                console.log("2")
                this.messageResponse[nextKey].message = this.messageResponse[nextKey].message.filter(msg => msg.seq != 1)
                console.log("3")
                var orderSeq = 1
                if(this.messageResponse[nextKey].message.length != 0) {
                    console.log("4")
                    this.messageResponse[nextKey].message.forEach(msg => {
                        msg.seq = orderSeq++
                    })
                }
                console.log("thisCut:" + JSON.stringify(messageText))
                console.log("nextCut:" + JSON.stringify(upMessage))
                console.log("origin:" + JSON.stringify(this.messageResponse[nextKey]))
                var tempMap = new Map
                var tempKey = 1
                for(let [id, value] of Object.entries(this.messageResponse)) {
                    if(id == key) {
                        if(value.message.length != 0) {
                            console.log("origin")
                            tempMap[tempKey++] = value
                        }
                        if(upMessage.message.length != 0) {
                            console.log("up")
                            tempMap[tempKey++] = upMessage
                        }
                        if(messageText.message.length != 0) {
                            console.log("down")
                            tempMap[tempKey++] = messageText
                        }
                    } else if(value.message.length != 0){
                        tempMap[tempKey++] = value
                    }
                }
                console.log("result1:" + JSON.stringify(tempMap))
                var tempMapUser = new Map
                var preUser = null
                tempKey = 1
                for(let [id, value] of Object.entries(tempMap)) {
                    console.log(value)
                    if(id == 1) {
                        preUser = value.sendUser
                        tempMapUser[tempKey++] = value
                        continue
                    }
                    if (value.sendUser == preUser) {
                        console.log(preUser)
                        console.log(value.sendUser)
                        var maxNum = tempMapUser[tempKey - 1].message.reduce((max, msg) => {
                            return msg.seq > max ? msg.seq : max;
                        }, 0);
                        value.message.forEach(msg => tempMapUser[tempKey - 1].message.push({
                            seq: ++maxNum,
                            message: msg.message
                        }))
                    } else {
                        tempMapUser[tempKey++] = value
                    }
                    preUser = value.sendUser
                    console.log("result2:" + JSON.stringify(tempMapUser))
                }
                console.log("result2-1:" + JSON.stringify(tempMapUser))
                this.messageResponse = JSON.parse(JSON.stringify(tempMapUser))

                console.log("result3:" + JSON.stringify(this.messageResponse))
            } else {
                console.log("배열 내 이동")
                // seq가 최대값이 아닌 경우 배열 내에서 순서 변경
                const index = messageArray.findIndex(msg => msg.seq === seq);
                if (index < messageArray.length - 1) {
                    // 현재 메시지를 한 단계 아래로 내림
                    [messageArray[index], messageArray[index + 1]] = [messageArray[index + 1], messageArray[index]];

                    // seq 값을 업데이트
                    messageArray[index].seq -= 1;
                    messageArray[index + 1].seq += 1;

                }
            }
        },
        createPost() {
            var groupSeq = this.$cookies.get("group").groupSequence
                axios.post("/api/post/message", {
                    title: this.postTitle,
                    groupSeq: groupSeq,
                    content: this.messageResponse
                }, {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
                })
            // else 
            //     axios.post("/api/post/board", {
            //             title: this.postTitle,
            //             groupSeq: groupSeq,
            //             content: {
            //                 content: this.detail
            //             }
            //         }, {
            //             headers: {
            //                 Authorization: `Bearer `+this.$cookies.get('accessToken')
            //             }
            //         })
        },
        postTypeChange(type) {
            this.postType = type
        },
        groupUserList() {
            axios.get("/api/group/users/" + this.$cookies.get("group").groupSequence, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                this.userInGroup = r.data.data
            })
        }
    },
}
</script>
<style>
@import url("/src/css/message.css");

.nicknames-container {
    display: flex;
}
</style>