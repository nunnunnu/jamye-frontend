<template>
    <div class="b-container">
        <h1 class="title">{{ message.title }}</h1>
        <div class="create-user">작성자: {{ message.createdUserNickName }}</div>
        <div class="editModeOpen" v-if="isEditing == null && message.createdUserSequence == $cookies.get('sequence')">
            <button @click="editMode" class="btn btn-dark">수정하기</button>
        </div>
        <div class="editMode" v-if="isEditing != null && message.createdUserSequence == $cookies.get('sequence')">
            <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
                <image-box :type="'MSG'" :imageKey="this.imageAddKey" :imageSeq="this.imageAddSeq" :message="this.messageResponse" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @messageImage="messageUpdate"></image-box>
                <button class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#nickNameMapping" @click="groupNickNameInfo()">닉네임</button>
                    <div class="modal fade" id="nickNameMapping" tabindex="-1" aria-labelledby="nickNameMapping" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h1 class="modal-title fs-5" id="nickNameMapping">닉네임</h1>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                            <div class="modal-body">
                                <div v-for="[key, value] in Object.entries(this.nickNameMap)" :key = key>
                                    <div v-if="value != null && value.nickName != null">
                                        {{ value.nickName }} : 
                                        <button v-if="value.userSeqInGroup == null" class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                해당 회원과 매핑할 그룹 내 유저가 있다면 선택해주세요
                                                </button>
                                                <button v-else class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                    {{ value.userNameInGroup }}
                                                </button>
                                                <ul 
                                                    class="dropdown-menu" 
                                                    style="max-height: 200px; overflow-y: auto;"
                                                >
                                                    <li 
                                                        v-for="user in userInGroup" 
                                                        :key="user.groupUserSequence"
                                                        @click="userInGroupSet(key, user)"
                                                        style="padding: 8px; cursor: pointer;"
                                                    >
                                                        {{ user.nickname }}
                                                    </li>
                                                </ul>
                                        <span class="remove-butto" @click="removeNickname(key)">X</span>
                                    </div>
                                </div>
                                <div class="nickNameAdd" v-if="nickNameEditMod">
                                    <input v-model="nicknameInput" placeholder="닉네임 입력" />
                                    <button
                                        class="btn btn-dark btn-sm dropdown-toggle"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {{ selectedUser?.nickname || "사용자 선택" }}
                                    </button>
                                    <ul class="dropdown-menu" style="max-height: 200px; overflow-y: auto;">
                                        <li
                                        v-for="user in userInGroup"
                                        :key="user.groupUserSequence"
                                        @click="selectedUser = user"
                                        style="padding: 8px; cursor: pointer;"
                                        >
                                        {{ user.nickname }}
                                        </li>
                                    </ul>
                                    <button class="btn btn-dark btn-sm" @click="nickNameAddComplate">
                                        저장
                                    </button>
                                </div>
                                <button class="btn btn-dark" @click="nickNameAdd">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
                                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                                    </svg>
                                    닉네임 추가
                                </button>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-dark" @click="updateNickNameInfo">반영하기</button>
                                <button type="button" class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close">닫기</button>
                            </div>
                        </div>
                    </div>
                </div>
            <button  @click="editModeClose" class="btn btn-dark">수정완료</button>
        </div>
        <div class="card card-body">
                    <div class="chat-room">
                        <div v-for="[key, text] in Object.entries(this.messageResponse)" :key="key">                                                                        
                            <!-- 내 매세지 -->
                            <div v-if="text.myMessage" class="chat-message mt-3">
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container-me"  @click="scrollToMessage(msg)"   :id="'message-' + key + '_' + msg.seq" >
                                    <div class="info-container">
                                        <div class="button-container" v-if="this.isEditing != null">
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
                                            <button class="circle-btn delete" @click="removeMessageSeq(key, msg.seq, msg.messageSeq)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                            <button class="circle-btn camera" data-bs-toggle="modal" data-bs-target="#imageModal" @click="selectImageKey(key, msg.seq)">
                                                <i class="fas fa-camera"></i>
                                            </button>
                                        </div>
                                        <span class="send-date">{{ text.sendDate }}</span>
                                    </div>
                                    <p v-if="this.isEditing != null && this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-me" @blur="saveMessage(key)">
                                        <template v-if="msg.isReply">
                                            <input class="reply-header" v-model="msg.replyTo"><br />
                                            <input class="reply-message" v-model="msg.replyMessage">
                                            <hr />
                                        </template>
                                        <input  type="text" v-model="msg.message" class="from-me">
                                        <span class="image-gallery">
                                            <img
                                                v-for="(image, index) in msg.imageUri"
                                                :key="index"
                                                :src="`http://localhost:8080/api/file/${image.second}`"
                                                class="small-image"
                                                @click="openPreview(image.second)"
                                                alt="Uploaded Image"
                                            />
                                            <img
                                                v-for="(image, index) in msg.imageKey"
                                                :key="index"
                                                :src="this.imageMap[image]"
                                                class="small-image"
                                                @click="openPreview(image)"
                                                alt="Uploaded Image"
                                            />
                                        </span>
                                    </p>
                                    <p v-else class="from-me">
                                        <input 
                                            v-if="replyMode" 
                                            type="radio" 
                                            name="replySelect" 
                                            :value="key || ',' || msg.seq" 
                                            @input="updateReplySeq(key, msg.seq)"
                                            class="form-check-input mt-1"
                                        />
                                        <template v-if="msg.isReply">
                                            <button v-if="this.isEditing != null"
                                            class="btn btn-sm btn-link me-2" 
                                            @click="toggleReplyMode(msg)"
                                            title="답장 연결"
                                            >
                                            🔗
                                            </button>
                                            <span class="reply-header">{{ msg.replyTo }}</span><br />
                                            <span class="reply-message">{{ msg.replyMessage }}</span>
                                            <hr />
                                        </template>
                                        {{ msg.message }}
                                        <span class="image-gallery">
                                            <img
                                                v-for="(image, index) in msg.imageUri"
                                                :key="index"
                                                :src="`http://localhost:8080/api/file/${image.second}`"
                                                class="small-image"
                                                @click="openPreview(image.second)"
                                                alt="Uploaded Image"
                                            />
                                            <img
                                                v-for="(image, index) in msg.imageKey"
                                                :key="index"
                                                :src="this.imageMap[image]"
                                                class="small-image"
                                                @click="openPreview(image)"
                                                alt="Uploaded Image"
                                            />
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <!-- 상대 메세지 -->
                            <div v-else class="chat-message mt-3">
                                <div v-if="this.nickNameMap[text.sendUserSeq] != null">
                                    <div v-if="this.nickNameMap[text.sendUserSeq].userNameInGroup != null">
                                        <div class="send-user">{{ this.nickNameMap[text.sendUserSeq].userNameInGroup }}</div>
                                    </div>
                                    <div v-else>
                                        <div class="send-user">{{ this.nickNameMap[text.sendUserSeq].nickName }}</div>
                                    </div>
                                </div>
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container" :id="'message-' + key + '_' + msg.seq" @click="scrollToMessage(msg)">
                                    <p v-if="this.isEditing != null && this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-them" @blur="saveMessage(key, msg)">
                                        <template v-if="msg.isReply">
                                            <input class="reply-header-them" v-model="msg.replyTo"><br />
                                            <input class="reply-message-them" v-model="msg.replyMessage">
                                            <hr />
                                        </template>
                                        <input  type="text" v-model="msg.message" @blur="saveMessage(key, msg)" class="from-them">
                                        <span class="image-gallery">
                                            <img
                                                v-for="(image, index) in msg.imageKey"
                                                :key="index"
                                                :src="`http://localhost:8080/api/file/${image}`"
                                                class="small-image"
                                                @click="openPreview(image)"
                                                alt="Uploaded Image"
                                            />
                                            <img
                                                v-for="(image, index) in msg.imageKey"
                                                :key="index"
                                                :src="this.imageMap[image]"
                                                class="small-image"
                                                @click="openPreview(image)"
                                                alt="Uploaded Image"
                                            />
                                        </span>
                                    </p>
                                    <p v-else class="from-them">
                                        <template v-if="msg.isReply">
                                            <span class="reply-header-them">{{ msg.replyTo }}</span>
                                            <button 
                                            class="btn btn-sm btn-link me-2" 
                                            v-if="this.isEditing != null"
                                            @click="toggleReplyMode(msg)"
                                            title="답장 연결"
                                            >
                                            🔗
                                            </button>
                                            <br />
                                            <span class="reply-message-them">{{ msg.replyMessage }}</span>
                                            <hr />
                                        </template>
                                        <input 
                                            v-if="replyMode" 
                                            type="radio" 
                                            name="replySelect" 
                                            :value="key || ',' || msg.seq" 
                                            @input="updateReplySeq(key, msg.seq)"
                                            class="form-check-input mt-1"
                                        />
                                        {{ msg.message }}
                                        <span class="image-gallery">
                                            <img
                                                v-for="(image, index) in msg.imageKey"
                                                :key="index"
                                                :src="`http://localhost:8080/api/file/${image}`"
                                                class="small-image"
                                                @click="openPreview(image)"
                                                alt="Uploaded Image"
                                            />
                                            <img
                                                v-for="(image, index) in msg.imageKey"
                                                :key="index"
                                                :src="this.imageMap[image]"
                                                class="small-image"
                                                @click="openPreview(image)"
                                                alt="Uploaded Image"
                                            />
                                        </span>
                                    </p>
                                    <div class="info-container-them">
                                        <span class="send-date">{{ text.sendDate }}</span>
                                        <div class="button-container" v-if="this.isEditing != null">
                                            <button class="circle-btn add" @click="addEmptyMessage(key, msg.seq)"><i class="fas fa-plus"></i></button>
                                            <button class="circle-btn up-arrow" @click="moveMessageUp(key, msg.seq)"><i class="fas fa-arrow-up"></i></button>
                                            <button class="circle-btn down-arrow" @click="moveMessageDown(key, msg.seq)"><i class="fas fa-arrow-down"></i></button>
                                            <button class="circle-btn edit" @click="editMessage(key, msg.seq)"><i class="fas fa-pencil-alt"></i></button>
                                            <button class="circle-btn delete" @click="removeMessageSeq(key, msg.seq, msg.messageSeq)"><i class="fas fa-trash"></i></button>
                                            <button class="circle-btn camera"  data-bs-toggle="modal" data-bs-target="#imageModal" @click="selectImageKey(key, msg.seq)"><i class="fas fa-camera"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="isPreviewOpen" class="image-preview-overlay" @click="closePreview">
                    <div class="image-preview-container">
                        <img 
                            v-if="imageMap[previewImage]" 
                            :src="this.imageMap[previewImage]" 
                            alt="Preview Image" 
                            class="large-image" 
                            />
                        <img v-else :src="`http://localhost:8080/api/file/${previewImage}`" alt="Preview Image" class="large-image" />  
                    </div>
                </div>
    </div>    
</template>
<script>
import axios from 'axios';
import ImageBox from './ImageBox.vue';
import { base64ToFile } from '@/js/fileScripts';

export default {
    components: {
        ImageBox
    },
    data() {
        return {
            message: {},
            messageResponse: {},
            isEditing: null,
            previewImage: null,
            isPreviewOpen: false,
            imageMap: {},
            imageAddKey: null,
            imageAddSeq: null,
            nickNameMap: {},
            deleteSeqs: new Set,
            userInGroup: {},
            nickNameEditMod: false,
            nicknameInput: '',
            selectedUser: null,
            deleteNickNames: new Set
        }
    },
    props: {
        postSeq: Number,
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        var group = this.$cookies.get("group")
        if(!this.isLogin) {
            alert("로그인 후 게시글 작성이 가능합니다.")
            this.$router.push("/login")
        } else if(group == null) {
            alert("메세지를 작성할 그룹을 먼저 선택해주세요")
            this.$router.push("/")
        } else {
            axios.get(`/api/post/${group.groupSequence}/${this.postSeq}`, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                this.message = r.data.data
                this.messageResponse = r.data.data.content.message
                this.nickNameMap = r.data.data.content.nickName
            })
        }

    },
    methods: {
        editMode() {
            this.isEditing = {}
        },
        editModeClose() {
            const formdata = new FormData()
            Object.entries(this.imageMap).forEach(([key, value]) => {
                if (value instanceof File) {
                    formdata.append(key, value);
                } else {
                    formdata.append(key, base64ToFile(value));
                }
            });
            const groupSeq = this.$cookies.get("group").groupSequence;
            const data = {
                message: this.messageResponse,
                nickName: this.nickNameMap,
                deleteMessage: Array.from(this.deleteSeqs)
            }

            formdata.append('data', JSON.stringify(data));
            axios.post(`/api/post/message/${groupSeq}/${this.postSeq}`,
            formdata
            ,
                {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
                }
            )

            this.isEditing = null
        },
        editMessage(key, seq) {
            if (!this.isEditing[key]) {
                this.isEditing[key] = {}; 
            }
            if(this.isEditing[key][seq]) {
                this.isEditing[key][seq] = false; 
            } else {
                this.isEditing[key][seq] = true; 
            }
            
        },
        saveMessage(key) {
            this.isEditing[key] = false;
        },
        removeMessageSeq(key, msgSeq, messageSeq) {
            if(messageSeq != null) {
                this.deleteSeqs.add(messageSeq)
            }
            
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
                var tempKey = 1
                var tempMap = new Map
                for(let [index, value] of Object.entries(this.messageResponse)) {
                    if(value.message.length != 0) {
                        console.log(index)
                        tempMap[tempKey++] = value
                    }
                }
                this.messageResponse = tempMap
        },
        addEmptyMessage(key, msgSeq) {
            if (this.messageResponse[key] && Array.isArray(this.messageResponse[key].message)) {
                this.messageResponse[key].message.forEach(it => {
                    if(it.seq > msgSeq) {
                        it.seq = it.seq + 1
                    }
                });
                for(let[id, value] of Object.entries(this.messageResponse)) {
                    if(id > key) {
                        value.message.forEach(it => {
                            it.seq = it.seq + 1
                });
                    }
                }
                

                this.messageResponse[key].message.push({
                    seq: msgSeq + 1,
                    message: "."
                });    
                this.messageResponse[key].message.sort((a, b) => a.seq - b.seq);
                
                if(this.isEditing[key, msgSeq + 1]) {
                    this.editMessage(key, msgSeq + 1 + 1)
                }
                this.editMessage(key, msgSeq + 1)
            }    
        },
        moveMessageUp(key, seq) {
            const minSeq = this.messageResponse[key].message.reduce((min, msg) => {
                        return msg.seq < min ? msg.seq : min;
                    }, Infinity);

            if(key==1 && seq == minSeq) {
                return
            }
            const messageArray = this.messageResponse[key].message;
            
            if (seq === minSeq) {
                var thisMessage = this.messageResponse[key]
                var messageText = JSON.parse(JSON.stringify(thisMessage.message.filter(msg => msg.seq == minSeq)));
                console.log("why:"+ JSON.stringify(messageText))
                thisMessage.message = thisMessage.message.filter(msg => msg.seq != seq)
                var orderSeq = 1
                if(thisMessage.message.length != 0) {
                    thisMessage.message.forEach(msg => {
                        msg.seq = orderSeq++
                    })
                }
                
                var messageNewObject = JSON.parse(JSON.stringify(thisMessage));
                var preMessageCut = JSON.parse(JSON.stringify(this.messageResponse[key-1]))
                if(preMessageCut.sendUserSeq == thisMessage.sendUserSeq) {
                    const maxSeq = preMessageCut.message.reduce((max, msg) => {
                        return msg.seq > max ? msg.seq : max;
                    }, 0);

                    var maxMsg = preMessageCut.message.pop()
                    var lastMessage = messageText.pop()
                    console.log(JSON.stringify(messageText))
                    preMessageCut.message.push({
                        seq: maxSeq,
                        message: lastMessage.message,
                        imageKey: lastMessage.imageKey,
                        imageUri: lastMessage.imageUri,
                        isReply: lastMessage.isReply,
                        replyMessage: lastMessage.replyMessage,
                        replyTo: lastMessage.replyTo,
                        sendUserSeq: lastMessage.sendUserSeq
                    })
                    preMessageCut.message.push({
                        seq: maxSeq + 1,
                        message: maxMsg.message,
                        imageKey: maxMsg.imageKey,
                        imageUri: maxMsg.imageUri,
                        isReply: maxMsg.isReply,
                        replyMessage: maxMsg.replyMessage,
                        replyTo: maxMsg.replyTo,
                        sendUserSeq: maxMsg.sendUserSeq
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
                
                var tempMapUser = new Map
                var preUser = null
                tempKey = 1
                for(let [id, value] of Object.entries(tempMap)) {
                    if(id == 1) {
                        preUser = value.sendUserSeq
                        tempMapUser[tempKey++] = value
                        continue
                    }
                    if (value.sendUserSeq == preUser) {
                        var maxNum = tempMapUser[tempKey - 1].message.reduce((max, msg) => {
                            return msg.seq > max ? msg.seq : max;
                        }, 0);
                        value.message.forEach(msg => tempMapUser[tempKey - 1].message.push({
                            seq: ++maxNum,
                            message: msg.message,
                            imageKey: msg.imageKey,
                            imageUri: msg.imageUri,
                            isReply: msg.isReply,
                            replyMessage: msg.replyMessage,
                            replyTo: msg.replyTo
                        }))
                    } else {
                        tempMapUser[tempKey++] = value
                    }
                    preUser = value.sendUserSeq
                }
                this.messageResponse = JSON.parse(JSON.stringify(tempMapUser))
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

            if(key == maxKey && seq == maxSeq) {
                return
            }


            const messageArray = this.messageResponse[key].message;
            const editMapMaxSeq = messageArray.reduce((max, msg) => {
                        return msg.seq > max ? msg.seq : max;
                    }, 0);

            console.log("editMapMaxSeq:" + editMapMaxSeq)
            if (seq === editMapMaxSeq) {
                var messageText = JSON.parse(JSON.stringify(this.messageResponse[key]))
                messageText.message = []
                var lastMessage = this.messageResponse[key].message.pop()
                messageText.message.push({
                    seq: 1,
                    message: lastMessage.message,
                    imageKey: lastMessage.imageKey,
                    imageUri: lastMessage.imageUri,
                    isReply: lastMessage.isReply,
                    replyMessage: lastMessage.replyMessage,
                    replyTo: lastMessage.replyTo,
                    sendUserSeq: lastMessage.sendUserSeq
                
                })
                var nextKey = Number(key) + 1
                var upMessage = JSON.parse(JSON.stringify(this.messageResponse[nextKey]))
                upMessage.message = this.messageResponse[nextKey].message.filter(msg => msg.seq == 1)
                this.messageResponse[nextKey].message = this.messageResponse[nextKey].message.filter(msg => msg.seq != 1)
                var orderSeq = 1
                if(this.messageResponse[nextKey].message.length != 0) {
                    this.messageResponse[nextKey].message.forEach(msg => {
                        msg.seq = orderSeq++
                    })
                }
                var tempMap = new Map
                var tempKey = 1
                for(let [id, value] of Object.entries(this.messageResponse)) {
                    if(id == key) {
                        if(value.message.length != 0) {
                            tempMap[tempKey++] = value
                        }
                        if(upMessage.message.length != 0) {
                            tempMap[tempKey++] = upMessage
                        }
                        if(messageText.message.length != 0) {
                            tempMap[tempKey++] = messageText
                        }
                    } else if(value.message.length != 0){
                        tempMap[tempKey++] = value
                    }
                }
                var tempMapUser = new Map
                var preUser = null
                tempKey = 1
                for(let [id, value] of Object.entries(tempMap)) {
                    if(id == 1) {
                        preUser = value.sendUserSeq
                        tempMapUser[tempKey++] = value
                        continue
                    }
                    if (value.sendUserSeq == preUser) {
                        var maxNum = tempMapUser[tempKey - 1].message.reduce((max, msg) => {
                            return msg.seq > max ? msg.seq : max;
                        }, 0);
                        value.message.forEach(msg => tempMapUser[tempKey - 1].message.push({
                            seq: ++maxNum,
                            message: msg.message,
                            imageKey: msg.imageKey,
                            imageUri: msg.imageUri,
                            isReply: msg.isReply,
                            replyMessage: msg.replyMessage,
                            replyTo: msg.replyTo
                        }))
                    } else {
                        tempMapUser[tempKey++] = value
                    }
                    preUser = value.sendUserSeq
                }
                this.messageResponse = JSON.parse(JSON.stringify(tempMapUser))

            } else {
                console.log("else")
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
        scrollToMessage(msg) {
            if(msg.replyToKey == undefined || msg.replyToKey == null || msg.replyToSeq == undefined || msg.replyToSeq == null) {
                return
            }
            const targetMessageId = `message-${msg.replyToKey}_${msg.replyToSeq}`
            const targetMessage = document.getElementById(targetMessageId)          
            if(targetMessage) {
                targetMessage.scrollIntoView({ behavior: "smooth", block: "start" })
                targetMessage.classList.add('shake');

                // 애니메이션 종료 후 클래스 제거
                setTimeout(() => {
                targetMessage.classList.remove('shake');
                }, 500);
            }  
            
        },
        openPreview(image) {
            this.previewImage = image
            this.isPreviewOpen = true;
        },
        closePreview() {
            this.isPreviewOpen = false;
            this.previewImage = null;
        },
        selectImageKey(key, seq) {
            this.imageAddKey = key
            this.imageAddSeq = seq
        },
        nickNameAdd(){
            this.nickNameEditMod = true
            
        },
        nickNameAddComplate() {
            const groupSeq = this.$cookies.get("group").groupSequence;
            axios.post(`/api/post/message/${groupSeq}/${this.postSeq}/nickNameAdd?nickName=${this.nicknameInput}&userSeqInGroup=${this.selectedUser.groupUserSequence}`, {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                console.log(r)
                console.log(this.selectedUser)
                this.nickNameMap[r.data.data] = {
                    "nickName": this.nicknameInput,
                    "userSeqInGroup": this.selectedUser.groupUserSequence,
                    "userNameInGroup": this.selectedUser.nickname,
                    "imageUrl": this.selectedUser.imageUrl
                }
                this.nicknameInput = null
                this.selectedUser = null
            })
            this.nickNameEditMod = false
            
        },
        groupNickNameInfo() {
            axios.get("/api/group/users/" + this.$cookies.get("group").groupSequence, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                this.userInGroup = r.data.data
            })
        },
        userInGroupSet(nickNameSeq, userInGroupInfo) {
            console.log(userInGroupInfo)
            this.nickNameMap[nickNameSeq] = {
                "nickName": this.nickNameMap[nickNameSeq].nickName,
                "userSeqInGroup": userInGroupInfo.groupUserSequence,
                "userNameInGroup":userInGroupInfo.nickname,
                "imageUri": userInGroupInfo.imageUrl
            }
        },
        updateNickNameInfo() {
            const groupSeq = this.$cookies.get("group").groupSequence;
            var tempMap = new Map
            for(let [id, value] of Object.entries(this.nickNameMap)) {
                if(value.nickName != null) {
                    tempMap[id] = value
                }
            }
            axios.post(`/api/post/message/${groupSeq}/${this.postSeq}/nickName`, {
                "updateInfo" : tempMap,
                "deleteMessageNickNameSeqs" : Array.from(this.deleteNickNames)
            }, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                console.log(r)
                this.deleteNickNames = new Set
            })
        },
        removeNickname(key) {
            this.deleteNickNames.add(key)
            this.nickNameMap[key] = {"userNameInGroup": this.nickNameMap[key].nickName }
        }
    }
}
</script>
<style>
@import url("/src/css/message.css");
.menu-title {
    margin-top: 60px;
}
.post-title{
    font-weight: bold;
    font-size: 30px;
}
.editModeOpen {
    margin-bottom: 10px;
}
.editMode {
    margin-bottom: 10px;
}
.remove-button {
    margin-left: 8px;
    color: rgb(0, 0, 0); 
    font-size: 12px; 
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
}
</style>