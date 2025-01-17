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
                            <input type="file" class="form-control" id="inputPassword2" placeholder="" @change="messageImageChange">
                        </div>
                        <div class="col-auto">
                            <button type="submit" class="btn btn-dark mb-3" @click="messageListGet">메세지 변환</button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-dark mb-3" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
                    <image-box :type="'MSG'" :imageKey="this.imageAddKey" :imageSeq="this.imageAddSeq" :message="this.messageResponse" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @messageImage="messageUpdate"></image-box>
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
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container-me"  @click="scrollToMessage(msg)"   :id="'message-' + key + '_' + msg.seq" >
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
                                            <input class="reply-header" v-model="msg.replyTo"><br />
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
                                            <span class="reply-header">{{ msg.replyTo }}</span><br />
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
                                
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container" :id="'message-' + key + '_' + msg.seq" @click="scrollToMessage(msg)">
                                    <p v-if="this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-them" @blur="saveMessage(key, msg)">
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
            messageResponse: {"1":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"9:03 6","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"[모순]","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"■ 한달왜빡쳤어영?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"실장:.....(째릿)..........끅.......","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"2":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"악짱 '","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"진짜 임 ?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:18","myMessage":false},"3":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"탕 91 % 7","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"[ 모순 ]","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"주인공이름은 안진진","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"25 살","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"왜 안진진이냐면","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"원래 엄마랑 아빠랑 상의해서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"참진자 써서 안진 이었는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"4":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"징징이갖ㄷ음'","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:19","myMessage":false},"5":{"sendUserSeq":null,"sendUser":"노현주","message":[{"seq":1,"message":"진진 이 \"","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:19","myMessage":false},"6":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"진진 이","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":2,"message":"도잉","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null}],"sendDate":"오후 2:19","myMessage":false},"7":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"'아빠가 지멋대로 등록하러가는날에","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"진진이나은듯?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"하고진진으로 지음","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"\" 안진진 됨","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"ㅋㅋㅋㅋㅋㅋㅋㅋㅋ","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"암튼","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"•안진진양은 25년평생","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"그렇게좋아하는것도없고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"'열정적이었던것도없는인생","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"그래서 다짐함","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":11,"message":"이렇게 살면안됨!!","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":12,"message":"내인생을 최선을다해서살아야해!!","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":13,"message":"그럼어케살어","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":14,"message":"고민","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":15,"message":"많은방법이있겠지만","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":16,"message":"'진진양은 결혼하기로 다짐함","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":17,"message":"마침 진진양에게 2명의 남자가있거든","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":18,"message":"누구를선택할지는 아직잘몰라","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":19,"message":"그럼 진진양 가족소개","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":20,"message":"\" 엄마 있음","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":21,"message":"아빠...있나?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":22,"message":"실종임 일단 나중에 자세히 설명하겠음","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":23,"message":"・남동생있음","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":24,"message":"\"아주중요한 사실","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":25,"message":"\"엄마에게는 10분차이로태어난","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":26,"message":"쌍둥이가있음","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":27,"message":"일란성임 개똑같음","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":28,"message":"할아버지 가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"8":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"옹","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"지랄 시작","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:22","myMessage":false},"9":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"「에잉 딸이 2명이나...?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"'하고 처리해버린다는식으로","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"4월1일이 생일인데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"'걍 둘다 같은날에 중매결혼해서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"•치워버리듯이 결혼시키","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"10":{"sendUserSeq":null,"sendUser":"노현주","message":[{"seq":1,"message":"에 ㅇㅇ","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"열 받네 용","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:22","myMessage":false},"11":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"죽어","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:22","myMessage":false},"12":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"'중매아주머니가 처음데려온남자가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"안진진아버지","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"두번째데려온남자가 이모부","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"인데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"원래 첫번째남자가 눈에","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"가을이있다니염병하면서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"동생이먼저마음에들어했는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"동생 이 언니 가 10 분 먼저 태어 났으 니까 언니 가 먼저 결혼 해","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"하고 양보 함","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"\" 근데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":11,"message":"안타깝게도 안진진의아부지는","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":12,"message":"\"처음엔 괜찮았거든?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":13,"message":"근데 어느날 집에 손님데려와서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":14,"message":"술좀 먹이고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":15,"message":"집치우다가 어머니가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":16,"message":"\"저기서 접시좀가져와요","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":17,"message":"하니까","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":18,"message":"'나를구속하지마!!!! 하면서 어머니한테","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":19,"message":"접시 던짐","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"13":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"미친놈 이 가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"죽어~!!!!!!!!!","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"!!!!!!!!!!!!!1","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:25","myMessage":false},"14":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"'맞음 술먹으면 이상해짐","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"그래서 어머니가 친정으로도망갔는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:25","myMessage":true},"15":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"자살 해라 \"","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"빠른시일내에","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"자살 만 이 답","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:25","myMessage":false},"16":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"'그땐 애도없었거든","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"\"사실 맞은건아니고 피하긴했어","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"근데 주변어른들이","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"뭐 맞은것도아니고 술먹고 실수했겠지..","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"\"하는분위기가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"있어서 다시들어감","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"어머니도 그래.. 맞은것도아니잖아","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"\" 하고 감","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"근데 그게고쳐지겠나","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"17":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"안고쳐 지지","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"하","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"\"죽었으면\"","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":false},"18":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"\"술깨면 미안하다고싹싹빌고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"접시 사 오고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"티비 던져서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"술 깨면 다시","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"못던지는티비를 사야한다고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"사오더니 다음에술마시면","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"접시티비에던져서 박살내고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"반복","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"그러나 이모부집은..","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"'부자임 청담동저택에살어","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":11,"message":"뭐 건축하신다나?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":12,"message":"그래서 어린 안진진은 조금","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"19":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"잠깐 \"","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:27","myMessage":false},"20":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"묘한기분이야","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"우리엄마는 갈수록","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"술많이마시는아버지때문에","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"'시장에서 양말팔고계셔","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"'안진진씨는 엄마가 저렇게 결혼한 사실을","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"아","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"는겨 ?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"21":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"ㅇㅋㅇㅋ","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"넘어 가자","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"웅","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:27","myMessage":false},"22":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"구진 옷 입고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"곧 자세히 설명됨","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"' 암튼","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"'엄마는 구진옷입고있는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"이모집가면 이모가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"엄마랑똑같은얼굴로","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"이쁜 옷 입고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"우아하게계시니까","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"약간 기분이상해","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"\"근데 마침 학교에서 부모님직업","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":11,"message":"조사 하는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":12,"message":"이거 90년대배경임 참고로","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":13,"message":"'진진이가 엄마 직업을","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":14,"message":"사업이라고적은거","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":15,"message":"그래서 선생님이 부모님 2명 초대해서","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":16,"message":"직업에대해 얘기해달라는","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":17,"message":"걸 하는데","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":18,"message":"사업한다고 진진이한테","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":19,"message":"“어머니좀 모셔오라고한거임","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":20,"message":"울엄마 양말파는데..","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":21,"message":"좀 쪽 팔려","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":22,"message":"근데 진진이랑 이모랑","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null}],"sendDate":"오후 2:27","myMessage":true},"23":{"sendUserSeq":null,"sendUser":"노현주","message":[{"seq":1,"message":"습 나 이거 읽었었나 왜 알것같지`","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"게속 이어가주","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"감삼 다","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:29","myMessage":false},"24":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"음","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"난 안 읽은 듯","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:30","myMessage":false},"25":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"\"어떤관계냐면","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"읽었을수도?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"\" 유명 해서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"아버지지랄나면","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"엄마가 이모불러","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"그럼 이모가 차타고 달려와서 집에","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"진진이랑 동생 데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"리고 감","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"26":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"TT","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"오잉","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null}],"sendDate":"오후 2:30","myMessage":false},"27":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"\"이모집에서 자다가 아부지잠들면","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"학교 보내야 한다고 무니 가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"어","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"데려가 는 식","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"둘이 좀 친하지","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"이모랑 진진이랑?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"그래서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"진진이가 이모한테 부탁해서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"엄마말고 이모불러서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"참관하고 그래","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":11,"message":"\"아무튼 진진이는 자라면서 가출도하고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":12,"message":"좀 삐딱선도 타는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":13,"message":"진","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":14,"message":"처음 에는 맨날 진이 아버지 가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":15,"message":"집","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":16,"message":"에들어왔는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":17,"message":"언젠가부터 한달뒤에들어오고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":18,"message":"반년뒤에들어오고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":19,"message":"점점 기간이 길어지더니","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":20,"message":"'20살되고는 한번도 안들어왔어","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":21,"message":"아무튼 안들어오니까","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":22,"message":"그래서 실종임","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":23,"message":"돈훔쳐가는놈은없죠? 셋이서 사는중","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":24,"message":"진진이는 원래 서비스직 전전하다가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":25,"message":"이모부 추천으로","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":26,"message":"[사무직 들어가서 일하는중이고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"28":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"자살하셨나봐","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"개 이득","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:32","myMessage":false},"29":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"\"어느 4월 1일에","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"월급 받고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"'비와서 꽃집들어갔는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"여기서 꽃을사","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"그리고 택시를타","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"엄니생일이죠?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"그리고 결혼기념일이죠?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"30":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"어머니 생일인건","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"몰랐구 만","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"아나","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"ㅇㅎ","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"옮겨","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:33","myMessage":false},"31":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"\"근데 자기합리화 겁나하면서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"이모 집감","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"'이모 마침 이쪽도 결혼기념일이죠?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"'이모부가 엄청 이모한테 잘해","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"그래서 둘이","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"외","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"식 하려고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"나가려고하는거임","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"자식들은 유학갔고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"그래서 이모가 진진이오니까","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":11,"message":"어머!! 너두같이가장^^","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":12,"message":"해서 같이 밥먹으러감","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":13,"message":"근데 이모부진짜..","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":14,"message":"잘하긴하는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":15,"message":"노잼","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":16,"message":"\"이모도 표정에 노잼이라고써있음","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":17,"message":"그래서 진진이데려온거겠지","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":18,"message":"노잼 이라서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":19,"message":"근데 밥먹다가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":20,"message":"앗 저기 ?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":21,"message":"저 남자 는 ?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":22,"message":"김장우 씨 ?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"32":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"엥","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"누고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"장우 씨 는","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"헉스 바리","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"\" 아니 .","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:35","myMessage":false},"33":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"둘중 한명","isReply":true,"replyMessage":"마침 진 진양 에게 2 명의 남자 가 있거든","replyTo":"나 에게 답장","imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"장우씨한테 달려감","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"장우씨: 오 저기저분은 누구셔?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"누가봐도 내가 안진진낳았소라고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"써져","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"있넹","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"앗..아앗...","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"저희 엄마랑..이모부세요...^^","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"또 구라 침","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"엄마라고 구라칠거면","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"34":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"아빠라고하지","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"::","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"애매하게","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":false},"35":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"'일단 그렇게 이날은 끝","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"ㅋㅋ","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"암튼","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"이제 다른남자도","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"알려드려야겠죠?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"나영규 씨","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"나이 는 29","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"완전","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"시팔너J야?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"존나팍팍한J","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":11,"message":"'알아서 맛집하고 다 알아오긴하는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":12,"message":"노 잼임","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"36":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"O","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:38","myMessage":false},"37":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"데이트하고 돌아와서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"아 데이트 도","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"“나는 마음을못정했으니까","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"' 일요일","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"에","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"먼저 전화 해","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"나오라는사람한테 가야지","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"38":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"아나","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":"오후 2:39","myMessage":false},"39":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"'했는데 장우보다 영규가 먼저","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"전화 한거","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"근데 존나아쉬워함","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"'이미마음기울었죠?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"'데이트 끝나고 장우한테 바로전화해","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"\"근데 장우는 상심해서 여행갔어","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null}],"sendDate":null,"myMessage":true},"40":{"sendUserSeq":null,"sendUser":"이송은","message":[{"seq":1,"message":"그럴거면 장우랑 사귀라고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"흠","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":3,"message":"\" 그래","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null}],"sendDate":"오후 2:39","myMessage":false},"41":{"sendUserSeq":null,"sendUser":null,"message":[{"seq":1,"message":"존나 묘한기문으로","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":2,"message":"전화 도 못끊","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":3,"message":"고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":4,"message":"센치 해짐","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":5,"message":"\"마음기울었죠?","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":6,"message":"하지만 ..","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":7,"message":"이러는이유가있어","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":8,"message":"영규는 나름 좋은회사다녀","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":9,"message":"장우 는 ..","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":10,"message":"들꽃사진작가","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":11,"message":"'부모님도안계시고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":12,"message":"형이키워주셨는데","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":13,"message":"형이사업하는데 그렇게잘된것도아냐","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":14,"message":"그래서 이것저것 재보고있는중임","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":15,"message":"그러던 어니늘","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":16,"message":"어느날 동생이","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":17,"message":"갑자기","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":18,"message":"조폭 한다고","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":19,"message":"'범죄와의전쟁같은 영화보면서","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":20,"message":"목소리존나깔고다녀","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":21,"message":"이새끼 여자생겼구만","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":22,"message":"원래 여자문제로 사고많이치고다님","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":23,"message":"에","isReply":false,"replyMessage":null,"replyTo":null,"imageKey":[],"imageUri":[],"messageSeq":null,"replyMessageSeq":null,"replyToSeq":null,"replyToKey":null},{"seq":24,"message":"그래서 니 여자생김?하니까","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":25,"message":"흠 !","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null},{"seq":26,"message":"( 60 )","imageKey":[],"imageUri":[],"isReply":false,"replyMessage":null,"replyTo":null}],"sendDate":null,"myMessage":true}}
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
            alert("로그인 후 게시글 작성이 가능합니다.")
            this.$router.push("/login")
        } else if(group == null) {
            alert("메세지를 작성할 그룹을 먼저 선택해주세요")
            this.$router.push("/")
        } else {
            this.groupName = group.name
        }
    },
    methods: {
        nicknameAdd() {
            if(this.nickname == null) {
                alert("프로필 이름을 먼저 입력해주세요")
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
                console.log("??")
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
                alert("게시글 제목을 입력해주세요")
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
                alert("연결할 메세지를 선택해주세요")
                return
            }

            this.replyOriginMessage.replyToKey = this.selectedReplyKey
            this.replyOriginMessage.replyToSeq = this.selectedReplySeq

            this.replyMode = false;
            this.selectedReplySeq = null;
            this.selectedReplyKey = null;
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
            
        }

    },
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
</style>