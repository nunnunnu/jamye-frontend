<template>
    <div class="b-container">
        <h1 class="title">{{ board.title }}</h1>
        <div class="create-user">작성자: {{ board.createdUserNickName }}</div>
        <div class="editModeOpen" v-if="isEditing == null && board.createdUserSequence == $cookies.get('sequence')">
            <button @click="editMode" class="btn btn-dark">수정하기</button>
        </div>
        <div v-html="content"></div>
    </div>    
</template>
<script>
import axios from 'axios';
// import ImageBox from './ImageBox.vue';
import { base64ToFile } from '@/js/fileScripts';

export default {
    components: {
        // ImageBox
    },
    data() {
        return {
            board: {},
            isEditing: null,
            previewImage: null,
            isPreviewOpen: false,
            imageMap: {},
            imageAddKey: null,
            imageAddSeq: null,
            nickNameMap: {},
            deleteSeqs: new Set,
            userInGroup: {},
            selectedUser: null,
            content: ""
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
                this.board = r.data.data
                this.content = r.data.data.content.content
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
            if(key==1 && seq ==1) {
                return
            }
            const messageArray = this.messageResponse[key].message;

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
                    var lastMessage = messageText.pop()
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
                var tempMapUser = new Map
                var preUser = null
                tempKey = 1
                for(let [id, value] of Object.entries(tempMap)) {
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