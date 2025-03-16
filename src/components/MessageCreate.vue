<template>
    <div class="b-container">
                <h1 class="title fs-5" id="jamye-create1">{{ groupName }}가챠 잼얘 넣기 - 메세지 타입</h1>
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
                                        <input type="text" class="form-control" placeholder="업로드할 메세지 이미지에 캡쳐된 상대의 이름을 입력해주세요" v-model="nickname">
                                        <div v-if="userInGroup != 0">
                                            <br>
                                            <button v-if="userInGroupInfo == null" class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            해당 회원과 매핑할 그룹 내 유저가 있다면 선택해주세요
                                            </button>
                                            <button v-else class="btn btn-dark btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                {{ userInGroupInfo.nickname }}
                                            </button>
                                            <ul 
                                                class="dropdown-menu" 
                                                style="max-height: 200px; overflow-y: auto;"
                                            >
                                                <li 
                                                    v-for="user in userInGroup" 
                                                    :key="user.groupUserSequence"
                                                    @click="userInGroupSet(user)"
                                                    style="padding: 8px; cursor: pointer;"
                                                >
                                                    {{ user.nickname }}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                        <button class="btn btn-dark" @click="nicknameAdd">추가</button>
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
                            <input type="file" accept="image/*" class="form-control" id="inputPassword2" placeholder="" @change="messageImageChange">
                        </div>
                        <div class="col-auto">
                            <button type="submit" class="btn btn-dark mb-3" @click="messageListGet">메세지 변환</button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-dark mb-3" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
                    <image-box :type="'MSG'" :imageKey="this.imageAddKey" :imageSeq="this.imageAddSeq" :message="this.messageResponse" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @messageImage="messageUpdate"></image-box>
                    <p class="d-inline-flex gap-1">
                        <a class="btn btn-dark" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                            문자일괄제거
                        </a>
                    </p>
                    <div class="collapse" id="collapseExample">
                        <div class="card card-body">
                            <div class="verification-group">
                                <input type="text" id="removeText" v-model="removeText" class="form-control" />
                                <button @click="deleteText" class="btn btn-dark">제거</button>
                            </div>
                        </div>
                    </div>
                </div>
                <button 
                    v-if="replyMode" 
                    class="btn btn-dark mt-3" 
                    @click="saveReplyTarget">
                    저장
                </button>
                <div class="card card-body">
                    <div class="chat-room">
                        <div v-for="[key, text] in Object.entries(messageResponse)" :key="key">                                                                        
                            <!-- 내 매세지 -->
                            <div v-if="text.myMessage" class="chat-message mt-3">
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container-me"  @click="scrollToMessage(key, msg)"   :id="'message-' + key + '_' + msg.seq" >
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
                                            <button class="circle-btn camera" data-bs-toggle="modal" data-bs-target="#imageModal" @click="selectImageKey(key, msg.seq)">
                                                <i class="fas fa-camera"></i>
                                            </button>
                                            <button class="circle-btn left" @click="moveLeft(key, msg.seq)">
                                                <i class="fas fa-arrow-left"></i>
                                            </button>
                                        </div>
                                        <span class="send-date">{{ text.sendDate }}</span>
                                    </div>
                                    <p v-if="this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-me" @blur="saveMessage(key)">
                                        <template v-if="msg.isReply">
                                             <span>답장</span><br>
                                            <input class="reply-message" v-model="msg.replyMessage">
                                            <hr />
                                        </template>
                                        <input  type="text" v-model="msg.message" class="from-me">
                                        <span class="image-gallery">
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
                                            <button 
                                            class="btn btn-sm btn-link me-2" 
                                            @click="toggleReplyMode(msg)"
                                            title="답장 연결"
                                            >
                                            🔗
                                            </button>
                                            <span class="reply-header">답장</span><br />
                                            <span class="reply-message">{{ msg.replyMessage }}</span>
                                            <hr />
                                        </template>
                                        {{ msg.message }}
                                        <span class="image-gallery">
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
                                <div class="info-container">
                                    <div v-if="nickNameEdit[key]">
                                        <button v-if="userNameMap[text.sendUser] != null" class="btn btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            {{ userNameMap[text.sendUser].nickname }}
                                            </button>
                                        <button v-else class="btn btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            {{ text.sendUser }}
                                        </button>
                                            <ul 
                                                class="dropdown-menu" 
                                                style="max-height: 200px; overflow-y: auto;"
                                            >
                                                <li 
                                                    v-for="nickName in nicknames" 
                                                    :key="nickName"
                                                    @click="editNickNameComplate(key, nickName)"
                                                    style="padding: 8px; cursor: pointer;"
                                                >
                                                    {{ nickName }} <span v-if="userNameMap[nickName]">| {{ userNameMap[nickName].nickname }}</span>
                                                </li>
                                            </ul>
                                    </div>
                                    <div v-else>
                                        <div v-if="userNameMap[text.sendUser] != null">
                                            <div class="send-user">{{ userNameMap[text.sendUser].nickname }}</div>
                                        </div>
                                        <div v-else class="send-user">{{ text.sendUser }}</div>
                                    </div>
                                    <div class="button-container">
                                            <button class="circle-btn up-arrow" @click="moveSendUserUp(key)"><i class="fas fa-arrow-up"></i></button>
                                            <button class="circle-btn down-arrow" @click="moveSendUserDown(key)"><i class="fas fa-arrow-down"></i></button>
                                            <button class="circle-btn edit" @click="editNickName(key)"><i class="fas fa-pencil-alt"></i></button>
                                            <button class="circle-btn delete" @click="removeSendUser(key)"><i class="fas fa-trash"></i></button>
                                            <button class="circle-btn right" @click="moveRight(key)">
                                                <i class="fas fa-arrow-right"></i>
                                            </button>
                                    </div>
                                </div>
                                
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container" :id="'message-' + key + '_' + msg.seq" @click="scrollToMessage(key, msg)">
                                    <p v-if="this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-them" @blur="saveMessage(key, msg)">
                                        <template v-if="msg.isReply">
                                            <span>답장</span><br>
                                            <input class="reply-message-them" v-model="msg.replyMessage">
                                            <hr />
                                        </template>
                                        <input  type="text" v-model="msg.message" @blur="saveMessage(key, msg)" class="from-them">
                                        <span class="image-gallery">
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
                                            <span class="reply-header-them">답장</span>
                                            <button 
                                            class="btn btn-sm btn-link me-2" 
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
                                                :src="this.imageMap[image]"
                                                class="small-image"
                                                @click="openPreview(image)"
                                                alt="Uploaded Image"
                                            />
                                        </span>
                                    </p>
                                    <div class="info-container-them">
                                        <span class="send-date">{{ text.sendDate }}</span>
                                        <div class="button-container">
                                            <button class="circle-btn add" @click="addEmptyMessage(key, msg.seq)"><i class="fas fa-plus"></i></button>
                                            <button class="circle-btn up-arrow" @click="moveMessageUp(key, msg.seq)"><i class="fas fa-arrow-up"></i></button>
                                            <button class="circle-btn down-arrow" @click="moveMessageDown(key, msg.seq)"><i class="fas fa-arrow-down"></i></button>
                                            <button class="circle-btn edit" @click="editMessage(key, msg.seq)"><i class="fas fa-pencil-alt"></i></button>
                                            <button class="circle-btn delete" @click="removeMessageSeq(key, msg.seq)"><i class="fas fa-trash"></i></button>
                                            <button class="circle-btn camera"  data-bs-toggle="modal" data-bs-target="#imageModal" @click="selectImageKey(key, msg.seq)"><i class="fas fa-camera"></i></button>
                                            <button class="circle-btn right" @click="moveLeft(key, msg.seq)">
                                                <i class="fas fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="originMsg != null" class="return-btn-wrapper">
                        <button @click="scrollToReply" class="return-btn">원본메세지로 돌아가기</button>
                    </div>
                </div>
                <div v-if="isPreviewOpen" class="image-preview-overlay" @click="closePreview">
                    <div class="image-preview-container">
                        <img :src="this.imageMap[previewImage]" alt="Preview Image" class="large-image" />
                    </div>
                </div>
                <button class="btn btn-dark btn-block" @click="createPost()">생성</button>
            </div>
</template>
<script>
import axios from '@/js/axios';
import ImageBox from './ImageBox.vue';
import { base64ToFile } from '@/js/fileScripts'

export default {
    components: {
        ImageBox
    },
    data() {
        return {
            groupName: null,
            nickname: null,
            nicknames: [],
            name: null,
            messageImage: null,
            isEditing: {},
            nickNameEdit: {},
            postType: null,
            postTitle: null,
            detail: null,
            userInGroup: [],
            userInGroupInfo: null,
            userNameMap: new Map,
            replyMode: false, 
            selectedReplyKey: null, 
            selectedReplySeq: null, 
            replyOriginMessage: null,
            selectedImages: [],
            imageAddKey: null,
            imageAddSeq: null,
            isPreviewOpen: false, // 미리보기 상태
            previewImage: null,   // 현재 미리보기 이미지.
            imageMap: {},
            messageResponse: {},
            removeText: null,
            originMsg: null,
            returnButtonTimeout: null
        }
    },
    props: {
        seq: Number,
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        var group = this.$cookies.get("group")
        if(!this.isLogin) {
            this.$toastr.warning("로그인 후 게시글 작성이 가능합니다.")
            this.$router.push("/login")
        } else if(group == null) {
            this.$toastr.warning("메세지를 작성할 그룹을 먼저 선택해주세요")
            this.$router.push("/")
        } else {
            this.groupName = group.name
        }
    },
    methods: {
        nicknameAdd() {
            if(this.nickname == null) {
                this.$toastr.warning("프로필 이름을 먼저 입력해주세요")
                return
            }
            this.nicknames.push(this.nickname)
            this.userNameMap[this.nickname] = this.userInGroupInfo
            this.nickname = null
            this.userInGroupInfo = null 
        },
        removeNickname(nickname) {
            this.nicknames = this.nicknames.filter(value => value !== nickname);
        },
        messageListGet() {
            if(this.messageImage == null) {
                this.$toastr.warning("메세지 변환할 이미지를 첨부해주세요")
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
                if(this.messageResponse !=null && Object.keys(this.messageResponse).length != 0) {
                    const maxKey = Math.max(...Object.keys(this.messageResponse).map(Number));
                    for(let [id, value] of Object.entries(r.data.data)) {
                        this.messageResponse[Number(maxKey) + Number(id)] = value
                    }
                } else {
                    this.messageResponse = r.data.data
                }
                
            })
            .catch(e => {
                this.$toastr.error(e.data.message)
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
            if(this.isEditing[key][seq]) {
                this.isEditing[key][seq] = false; 
            } else {
                this.isEditing[key][seq] = true; 
            }
            
        },
        saveMessage(key) {
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
                var tempKey = 1
                var tempMap = new Map
                for(let [, value] of Object.entries(this.messageResponse)) {
                    if(value.message.length != 0) {
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
        moveLeft(key, seq) {
            console.log(`start - key=${key}, seq=${seq}`)
            const messages = this.messageResponse[key]?.message || [];
            const targetIndex = messages.findIndex((msg) => msg.seq === seq);

            if (targetIndex === -1) {
                console.error("해당 seq를 가진 메시지가 없습니다.");
                return;
            }

            const [removedMessage] = messages.splice(targetIndex, 1);
            console.log(removedMessage)

            var tempMap = new Map
            var tempKey = 1
            for (let [id, value] of Object.entries(this.messageResponse)) {
                if(id==key) {
                    var downMsg = []
                    var downSeq = 1
                    var originMsg = []
                    if(value.message.length == 0) {
                        tempKey = tempKey + 2
                    }
                    for(const msg of value.message) {
                        if(msg.seq > seq) {
                            console.log("downCheck" + msg.message)
                           downMsg.push({
                                ...msg,
                                seq: downSeq++
                           })
                           console.log("addCheck" + JSON.stringify(downMsg))
                        } else {
                            console.log("originCheck" + JSON.stringify(msg.message))
                            originMsg.push(msg)
                        }
                    }
                    if(originMsg.length != 0) {
                        tempMap[tempKey++] = {
                            ...value,
                            message: originMsg
                        }
                        console.log("origin" + JSON.stringify(originMsg))
                    }
                    if(downMsg.length != 0) {
                        tempKey = tempKey + 2
                        tempMap[tempKey++] = {
                            ...value,
                            message: downMsg
                        }
                        console.log("down:" + JSON.stringify(downMsg))
                    }
                } else if(Number(id) > Number(key)) {
                    console.log(`id=${id}, key=${key}`)
                    console.log("2down" + JSON.stringify(value))
                    tempKey = tempKey + 2
                    tempMap[tempKey++] = value
                } else {
                    console.log("std" + tempKey + JSON.stringify(value))
                    tempMap[tempKey++] = value 
                }
            }
            console.log(JSON.stringify(tempMap))
            this.messageResponse = tempMap

            const nextKey = Number(key) + 1
            removedMessage.seq = 1
            var randomUser = "임시"
            console.log(this.nicknames)
            console.log(this.nicknames.length)
            if(this.nicknames != null && this.nicknames.length != undefined && this.nicknames.length != 0) {
                console.log("??")
                randomUser = this.nicknames[0]
                console.log(randomUser)
                console.log(this.userNameMap[randomUser])
            }
            console.log(nextKey)
            this.messageResponse[nextKey] = { sendUserSeq: this.userNameMap[randomUser], sendUser: randomUser, message: [] };
            this.messageResponse[nextKey].message.unshift(removedMessage);
            this.messageResponseTempRemove(this.messageResponse)
        },
        moveMessageUp(key, seq) {
            if(key==1 && seq ==1) {
                return
            }
            const messageArray = this.messageResponse[key].message;

            if (seq === 1) {
                var preMessageCut = JSON.parse(JSON.stringify(this.messageResponse[key-1]))
                if(preMessageCut.message.length == 1) {
                    var editMessage = JSON.parse(JSON.stringify(this.messageResponse[key]))
                    var upMessage = editMessage.message.shift()
                    this.messageResponse[key - 1] = {
                        ...this.messageResponse[key],
                        message: [upMessage]
                    };
                    this.messageResponse[key] = preMessageCut 
                    var downMap = new Map
                    var downKey = 1
                    for(let [id, value] of Object.entries(this.messageResponse)) {
                        console.log(downKey)
                        if(editMessage.message.length != 0 && id == (Number(key) + 1)) {
                            downMap[downKey++] = editMessage
                        } 
                        downMap[downKey++] = value
                    }
                    this.messageResponseTempRemove(downMap)
                    return
                }

                var messageText = JSON.parse(JSON.stringify(this.messageResponse[key].message.filter(msg => msg.seq == seq)));
                this.messageResponse[key].message = this.messageResponse[key].message.filter(msg => msg.seq != seq)
                console.log(JSON.parse(JSON.stringify(messageText)))
                var orderSeq = 1
                if(this.messageResponse[key].message.length != 0) {
                    this.messageResponse[key].message.forEach(msg => {
                        msg.seq = orderSeq++
                    })
                }
                console.log(JSON.parse(JSON.stringify(this.messageResponse[key])))
                
                var messageNewObject = JSON.parse(JSON.stringify(this.messageResponse[key]));
                
                console.log(JSON.parse(JSON.stringify(preMessageCut)))
                if(preMessageCut.sendUser == messageText.sendUser) {
                    const maxSeq = preMessageCut.message.reduce((max, msg) => {
                        return msg.seq > max ? msg.seq : max;
                    }, 0);

                    var maxMsg = preMessageCut.message.pop()
                    console.log("maxMsg")
                    console.log(JSON.parse(JSON.stringify(maxMsg)))
                    var lastMessage = messageText.pop()
                    console.log("lastMessage")
                    console.log(JSON.parse(JSON.stringify(lastMessage)))
                    preMessageCut.message.push({
                        seq: maxSeq,
                        message: lastMessage.message,
                        imageKey: lastMessage.imageKey,
                        imageUri: lastMessage.imageUri,
                        isReply: lastMessage.isReply,
                        replyMessage: lastMessage.replyMessage,
                        replyTo: lastMessage.replyTo
                    })
                    preMessageCut.message.push({
                        seq: maxSeq + 1,
                        message: maxMsg.message,
                        imageKey: maxMsg.imageKey,
                        imageUri: maxMsg.imageUri,
                        isReply: maxMsg.isReply,
                        replyMessage: maxMsg.replyMessage,
                        replyTo: maxMsg.replyTo
                    })
                    console.log("mm")
                    console.log(JSON.parse(JSON.stringify(preMessageCut)))
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
                console.log(JSON.parse(JSON.stringify(messageNewObject)))
                for(let [id, value] of Object.entries(this.messageResponse)) {
                    if(id == key) {
                        if(messageNewObject.message.length != 0 && key == tempKey) {
                            tempMap[tempKey++] = messageNewObject
                            console.log("new")
                            console.log(tempKey)
                            console.log(JSON.parse(JSON.stringify(tempMap)))
                        }
                        
                        if(preMessageCut.message.length != 0) {
                            tempMap[tempKey++] = preMessageCut
                            console.log("pre")
                            console.log(tempKey)
                            console.log(JSON.parse(JSON.stringify(tempMap)))
                        }
                        
                        if(value.message.length != 0) {
                            tempMap[tempKey++] = value
                            console.log("length")
                            console.log(tempKey)
                            console.log(JSON.parse(JSON.stringify(tempMap)))
                        }

                    } else if(value.message.length != 0){
                        tempMap[tempKey++] = value
                    }
                }
                console.log("last")
                console.log(JSON.parse(JSON.stringify(tempMap)))
                this.messageResponseTempRemove(tempMap)
            } else {
                const index = messageArray.findIndex(msg => msg.seq === seq);
                if (index > 0) {
                    [messageArray[index - 1], messageArray[index]] = [messageArray[index], messageArray[index - 1]];
                    
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
                    replyTo: lastMessage.replyTo
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
                this.messageResponseTempRemove(tempMap)

            } else {
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
            if(this.postTitle == null) {
                this.$toastr.warning("게시글 제목을 입력해주세요")
                const title = document.getElementById("post-title")          
                if(title) {
                    title.scrollIntoView({ behavior: "smooth", block: "start" })
                }  
                return
            }
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
                title: this.postTitle,
                groupSeq: groupSeq,
                content: this.messageResponse
            };

            formdata.append('data', JSON.stringify(data));
            var nickNameMap = new Map
            console.log(this.userNameMap)
            for(let [id, value] of Object.entries(this.userNameMap)) {
                if(value != null) {
                    nickNameMap[id] = value.groupUserSequence
                } else {
                    nickNameMap[id] = null
                }
            }
            formdata.append('nickNameMap', JSON.stringify(nickNameMap))
            
                axios.post("/api/post/message", formdata, {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
                }).then((r) => {
                    this.$router.push("/jamye/message" + r.data.data)
                })
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
        },
        userInGroupSet(userInfo) {
            this.userInGroupInfo = userInfo
        },
        removeImage() {
        },
        toggleReplyMode(msg) {
            this.replyMode = !this.replyMode;
                if (!this.replyMode) {
                    this.selectedReplyKey = null
                    this.selectedReplySeq = null; // 모드 비활성화 시 선택 초기화
                    this.replyOriginMessage = null
                } else 
                    this.replyOriginMessage = msg
        },
        // 답장 대상 저장
        saveReplyTarget() {
            if(this.selectedReplyKey == null || this.selectedReplySeq == null) {
                this.$toastr.warning("연결할 메세지를 선택해주세요")
                return
            }

            this.replyOriginMessage.replyToKey = this.selectedReplyKey
            this.replyOriginMessage.replyToSeq = this.selectedReplySeq
            this.replyOriginMessage.replyMessage = this.messageResponse[this.selectedReplyKey].message.filter(
                    (msg) => msg.seq == this.selectedReplySeq
                )[0].message;
            this.replyMode = false;
            this.selectedReplySeq = null;
            this.selectedReplyKey = null;
        },
        scrollToMessage(key, msg) {
            if(msg.replyToKey == undefined || msg.replyToKey == null || msg.replyToSeq == undefined || msg.replyToSeq == null) {
                return
            }
            const targetMessageId = `message-${msg.replyToKey}_${msg.replyToSeq}`
            const targetMessage = document.getElementById(targetMessageId)          
            if(targetMessage) {
                targetMessage.scrollIntoView({ behavior: "auto", block: "start" })
                targetMessage.classList.add('shake');

                // 애니메이션 종료 후 클래스 제거
                setTimeout(() => {
                    targetMessage.classList.remove('shake');
                    }, 500);
                    this.originMsg = 'message-' + key + '_' + msg.seq
                    this.returnButtonTimeout = setTimeout(() => {
                        this.originMsg = null;
                    }, 10000); // 60,000ms = 1분
            }  
            
        },
        updateReplySeq(key, seq) {
            this.selectedReplyKey = key
            this.selectedReplySeq = seq
        },
        selectImageKey(key, seq) {
            this.imageAddKey = key
            this.imageAddSeq = seq
        },
        openPreview(image) {
            this.previewImage = image;
            this.isPreviewOpen = true;
        },
        closePreview() {
            this.isPreviewOpen = false;
            this.previewImage = null;
        },
        handleImageMapUpdate(imageUidMap) {
            this.imageMap = imageUidMap
        },
        messageUpdate(message) {
            this.messageResponse = message
        },
        messageResponseTempRemove(messageMap) {
            var tempMapUser = new Map
                var preUser = null
                var tempKey = 1
                for(let [id, value] of Object.entries(messageMap)) {
                    if(id == 1) {
                        preUser = value.sendUser
                        tempMapUser[tempKey++] = value
                        continue
                    }
                    if (value.sendUser == preUser) {
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
                    preUser = value.sendUser
                }
                this.messageResponse = JSON.parse(JSON.stringify(tempMapUser))
        },
        moveSendUserUp(key) {
            if(key == 1) {
                return
            } 
            const moveKey = Number(key) - Number(1)
            const upMessage = JSON.parse(JSON.stringify(this.messageResponse[key]))
            const downMessage = JSON.parse(JSON.stringify(this.messageResponse[moveKey]))
            this.messageResponse[key] = downMessage
            this.messageResponse[moveKey] = upMessage
            this.messageResponseTempRemove(this.messageResponse)
        },
        moveSendUserDown(key) {
            const maxKey = Math.max(...Object.keys(this.messageResponse).map(Number));
            if(key == maxKey) {
                return
            } 
            const moveKey = Number(key) + Number(1)
            const upMessage = JSON.parse(JSON.stringify(this.messageResponse[moveKey]))
            const downMessage = JSON.parse(JSON.stringify(this.messageResponse[key]))
            this.messageResponse[key] = upMessage
            this.messageResponse[moveKey] = downMessage
            this.messageResponseTempRemove(this.messageResponse)
        },
        removeSendUser(key) {
            delete this.messageResponse[key];
            this.messageResponseTempRemove(this.messageResponse)
        },
        moveRight(key) {
            this.messageResponse[key] = {
                ...this.messageResponse[key],
                sendUser: null,
                myMessage: true
            };
            this.messageResponseTempRemove(this.messageResponse)
        },
        editNickName(key) {
            this.nickNameEdit[key] = true
        },
        editNickNameComplate(key, nickName) {
            this.nickNameEdit[key] = false
            this.messageResponse[key].sendUser = nickName
            if(this.userNameMap[nickName] != null) {
                this.messageResponse[key].sendUserSeq = this.userNameMap[nickName]
            }
            
        },
        deleteText() {
            for(let [, value] of Object.entries(this.messageResponse)) {
                value.message.forEach(text => {
                    const changeText = text.message.replaceAll(this.removeText, '')
                    text.message = changeText
                })
            }
            this.removeText = null
        },
        scrollToReply() {
            // 답장이 있는 메시지로 부드럽게 스크롤
            const targetMessage = document.getElementById(this.originMsg)
                if(targetMessage) {
                    targetMessage.scrollIntoView({ behavior: "auto", block: "start" })
                    targetMessage.classList.add('shake');

                    // 애니메이션 종료 후 클래스 제거
                    setTimeout(() => {
                    targetMessage.classList.remove('shake');
                    }, 500);
                }  
                this.originMsg = null
                this.returnButtonTimeout = null
        }
    }
}
</script>
<style>
@import url("/src/css/message.css");

.nicknames-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px; /* 닉네임 간격 */
    margin-bottom: 5px;
}

.nickname {
    background-color: black;
    color: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    font-size: 14px;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease-in-out;
}

.nickname:hover {
    background-color: black;
}

.remove-button {
    margin-left: 8px;
    color: white; 
    font-size: 12px; 
    cursor: pointer;
    opacity: 0; 
    transition: opacity 0.2s ease-in-out; /* 부드러운 등장 */
}

.nickname:hover .remove-button {
    opacity: 1; /* 마우스 올렸을 때만 보이게 */
}

.image-preview {
  position: relative;
  text-align: center;
}

.image-preview img {
  width: 100%;
  border-radius: 8px;
  height: 120px; /* 고정된 높이 */
  object-fit: cover;
}

.image-preview .delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.image-preview .delete-btn:hover {
  background: rgba(255, 0, 0, 1);
}
/* 라디오 버튼 커스텀 스타일 */
.form-check-input {
  accent-color: #fff; /* 기본 강조색 (배경과 동일하지 않게 설정) */
  border: 2px solid #000000 !important; /* 파란색 테두리 */
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 라디오 버튼 활성화 상태 */
.form-check-input:checked {
  background-color: #000000 !important; /* 선택 시 버튼 내부 배경색 */
  border-color: #000000 !important;
}

@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

.shake {
  animation: shake 0.5s ease-in-out; /* 애니메이션 지속 시간과 타이밍 함수 */
}
.small-image {
  width: 100px; /* 원하는 크기로 설정 */
  height: 100px;
  object-fit: cover;
  cursor: pointer;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: transform 0.2s ease-in-out;
}
.small-image:hover {
  transform: scale(1.05);
}

/* 오버레이 스타일 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

/* 미리보기 컨테이너 */
.image-preview-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 90%;
  max-height: 90%;
  overflow: hidden;
}

/* 큰 이미지 스타일 */
.large-image {
  max-width: 70%; /* 컨테이너 너비에 맞추기 */
  max-height: 70%; /* 컨테이너 높이에 맞추기 */
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

.return-btn-wrap {
    position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%; /* 버튼 너비 (화면 크기에 따라 조정 가능) */
  max-width: 300px; /* 최대 너비 설정 */
  padding: 10px;
  color: white;
  border: none;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
}

/* 버튼 스타일 */
.scroll-btn,
.return-btn {
  padding: 8px 12px;
  background-color: #ffffff;
  border: none;
  border-radius: 4px;
  color: #000000;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.scroll-btn:hover,
.return-btn:hover {
  background-color: #e0e0e0;
}

.chat-room {
    height: 600px;
}
</style>