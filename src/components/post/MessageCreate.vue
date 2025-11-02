<template>
    <div class="b-container" style="padding-top: 80px;">
        <div class="save-toast" v-if="showSaveToast">{{ saveToastMessage }}</div>
        <div>
            <div class="guide-overlay" v-if="showModal">
            <div class="guide-modal">
                <div class="guide-content">
                    <p>작성중인 게시물이 있습니다. 불러오시겠습니까?</p>
                    <p>아니오를 누르면 임시저장된 게시글을 다시 불러올 수 없습니다.</p>
                </div>
                <div class="guide-footer">
                    <button class="btn btn-danger" @click="onConfirmLoad">예</button>
                    <button class="btn btn-dark" @click="onRejectLoad">아니오</button>
                </div>

            </div>
            </div>
        </div>
        <!-- 메시지 잼얘 가이드 모달 -->
        <div v-if="showGuide" class="guide-overlay" @click="closeGuide">
            <div class="guide-modal" @click.stop>
                <div class="guide-header">
                    <h4>📱 메시지 잼얘 만들기 가이드</h4>
                    <button class="btn-close" @click="closeGuide">&times;</button>
                </div>
                <div class="guide-content">
                    <div class="guide-step" :class="{ active: currentStep === 1 }">
                        <div class="step-number">STEP 1</div>
                        <h5>캡처 준비</h5>
                        <p>변환할 카톡 캡처 이미지를 준비해주세요</p>
                        <img src="@/assets/img/guide/message.png" alt="guide1" class="guide-image">
                        <p class="step-note">💡 예시 이미지처럼 테마가 적용되지 않은 원본일수록 인식이 잘 됩니다</p>
                    </div>
                    
                    <div class="guide-step" :class="{ active: currentStep === 2 }">
                        <div class="step-number">STEP 2</div>
                        <h5>프로필 닉네임 등록</h5>
                        <p>캡처 속 대화 참여자의 닉네임을 프로필 닉네임 추가 버튼으로 등록하세요</p>
                        <img src="@/assets/img/guide/message2.png" alt="guide1" class="guide-image">
                        <p>예시 이미지에서 프로필 닉네임은 '양손 엄지척 무지', '화난 라이언' 입니다.</p>
                        <img src="@/assets/img/guide/nickname.png" alt="guide1" class="guide-image">
                        <p>프로필 닉네임 추가 버튼을 눌러 닉네임 추가 창을 엽니다.</p>
                        <img src="@/assets/img/guide/nickname2.png" alt="guide1" class="guide-image">
                        <p>프로필 닉네임과 매핑할 그룹 내 유저가 있다면 선택해주세요. 없다면 그냥 닉네임만 추가해주세요.</p>
                        <p class="step-note">💡 그룹에 속한 사용자라면 그룹 프로필과 연결해 닉네임 연동 가능</p>
                    </div>
                    
                    <div class="guide-step" :class="{ active: currentStep === 3 }">
                        <div class="step-number">STEP 3</div>
                        <h5>메시지 업로드 & 변환</h5>
                        <p>메시지 캡처 파일을 업로드한 뒤 메시지 변환 버튼을 눌러 변환하세요</p>
                        <img src="@/assets/img/guide/message3.png" alt="guide1" class="guide-image">
                        <p class="step-note">💡 매칭되지 않은 닉네임은 내 메시지로 인식돼 오른쪽에 배치됩니다</p>
                        <img src="@/assets/img/guide/message4.png" alt="guide1" class="guide-image">
                    </div>
                    
                    <div class="guide-step" :class="{ active: currentStep === 4 }">
                        <div class="step-number">STEP 4</div>
                        <h5>위치/내용 수정</h5>
                        <p>프로필 옆 버튼으로 전체 말풍선 이동, 수정, 삭제, 나/상대방 전환 가능</p>
                        <video
                            src="@/assets/img/guide/edit.mp4"
                            class="guide-image"
                            controls
                            autoplay
                            loop
                            muted
                            playsinline
                        ></video>
                    </div>

                    <div class="guide-step" :class="{ active: currentStep === 5 }">
                        <div class="step-number">STEP 5</div>
                        <h5>위치/내용 수정</h5>
                        <p>말풍선 옆 연결 버튼으로 말풍선을 답장으로 전환하고 원본 메세지를 연결할 수 있습니다.</p>
                        <video
                            src="@/assets/img/guide/reply.mp4"
                            class="guide-image"
                            controls
                            autoplay
                            loop
                            muted
                            playsinline
                        ></video>
                    </div>
                    
                    <div class="guide-step" :class="{ active: currentStep === 6 }">
                        <div class="step-number">STEP 6</div>
                        <h5>특수문자 정리</h5>
                        <video
                            src="@/assets/img/guide/remove.mp4"
                            class="guide-image"
                            controls
                            autoplay
                            loop
                            muted
                            playsinline
                        ></video>
                        <p>"문자 일괄 제거" 기능으로 테마 문자나 안읽은 수 표시를 제거할 수 있습니다</p>
                    </div>
                </div>
                <div class="guide-footer">
                    <button class="btn btn-outline-secondary" @click="prevStep" :disabled="currentStep === 1">이전</button>
                    <div class="step-indicators">
                        <span v-for="step in 6" :key="step" 
                              class="step-dot" 
                              :class="{ active: step === currentStep }"
                              @click="goToStep(step)"></span>
                    </div>
                    <button class="btn btn-modal" @click="nextStep" v-if="currentStep < 6">다음</button>
                    <button class="btn btn-modal" @click="closeGuide" v-if="currentStep === 6">시작하기</button>
                </div>
            </div>
        </div>
                <!-- 제목 입력 -->
                <div class="form-group" style="margin-bottom: 20px;">
                    <input type="text" class="form-control post-title-input" name="post-title" id="post-title" v-model="postTitle" placeholder="게시글 제목을 입력하세요">
                </div>

                <!-- 작성자 정보 -->
                <div class="post-meta-container">
                    <span class="post-meta-label">그룹</span>
                    <span class="post-meta-value">{{ groupName }}</span>
                    <div class="post-meta-divider"></div>
                    <span class="post-meta-label">타입</span>
                    <span class="post-meta-value">메시지</span>
                </div>

                <!-- 전체 편집 도구 (상단) -->
                <div class="button-toolbar">
                    <div class="button-group">
                        <button @click="toggleInput" class="btn btn-toggle" :class="{ active: isInputVisible }">
                            <i class="fas fa-hashtag"></i> {{ isInputVisible ? "태그 완료" : "태그 추가" }}
                        </button>
                        <button class="btn btn-toggle" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                            <i class="fas fa-eraser"></i> 문자일괄제거
                        </button>
                    </div>
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
                    <!-- 프로필 닉네임 관리 -->
                    <div class="button-toolbar">
                        <button type="button" class="btn btn-modal-trigger" data-bs-toggle="modal" data-bs-target="#nicknameAdd" @click="groupUserList()">
                            <i class="fas fa-user-plus"></i> 프로필 닉네임 추가
                        </button>
                    </div>

                    <!-- 메시지 변환 섹션 -->
                    <div class="message-convert-section">
                        <h6><i class="fas fa-file-import"></i> 카카오톡 메시지 이미지 변환</h6>
                        <div class="button-group file-input-wrapper">
                            <input type="file" accept="image/*" class="form-control" id="inputPassword2" placeholder="" @change="messageImageChange">
                            <button type="submit" class="btn btn-dark" @click="messageListGet">
                                <i class="fas fa-sync-alt"></i> 메시지 변환
                            </button>
                        </div>
                    </div>

                    <image-box :type="'MSG'" :imageKey="this.imageAddKey" :imageSeq="this.imageAddSeq" :message="this.messageResponse" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @messageImage="messageUpdate"></image-box>

                    <div class="collapse" id="collapseExample">
                        <div class="card card-body">
                            <div class="verification-group">
                                <input type="text" id="removeText" v-model="removeText" class="form-control" />
                                <button @click="deleteText" class="btn btn-dark">제거</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="hashtag-container">
                        <div v-if="isInputVisible" class="input-container">
                        <div class="input-group mb-3">
                            <input
                                v-model="searchTerm"
                                @input="fetchHashtags"
                                placeholder="태그를 입력하세요"
                                class="tag-input form-control"
                                id="tagInput"
                            />
                            <button class="btn btn-dark" @click="addTextTag">추가</button>
                        </div>
                            <ul v-if="searchResults.length" class="search-results">
                                <li v-for="(tag, index) in searchResults" :key="index" @click="addTag(tag)">
                                #{{ tag.tagName }}
                                </li>
                            </ul>
                        </div>

                        <div class="tag-list">
                            <div
                                v-for="(tag, index) in selectedTags"
                                :key="index"
                                class="tag-item"
                                @mouseover="hoverIndex = index"
                                @mouseleave="hoverIndex = -1"
                            >
                                # {{ tag.tagName }}
                                <span v-if="hoverIndex === index" @click="removeTag(index)" class="remove-tag">×</span>
                            </div>
                        </div>
                    </div>

                <!-- 메시지 편집 툴바 (본문 바로 위) -->
                <div class="message-editor-toolbar">
                    <span style="font-size: 13px; color: #6c757d; font-weight: 500; margin-right: 8px;">메시지 편집:</span>
                    <button type="button" class="btn btn-modal-trigger btn-sm" data-bs-toggle="modal" data-bs-target="#imageModal">
                        <i class="fas fa-images"></i> 이미지
                    </button>
                </div>

                <div class="card card-body message-card-with-toolbar">
                    <div class="chat-room">
                        <div v-for="[key, text] in Object.entries(messageResponse)" :key="key">                                                                        
                            <!-- 내 매세지 -->
                            <div v-if="text.myMessage" class="chat-message mt-3">
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container-me"  @click="scrollToMessage(key, msg)"   :id="'message-' + key + '_' + msg.seq" >
                                    <div class="info-container">
                                        <div class="button-container">
                                            <button class="circle-btn add tooltip-btn" @click="addEmptyMessage(key, msg.seq)">
                                                <i class="fas fa-plus"></i>
                                                <span class="tooltip-text">하단 메세지 추가</span>
                                            </button>
                                            <button class="circle-btn up-arrow tooltip-btn" @click="moveMessageUp(key, msg.seq)">
                                                <i class="fas fa-arrow-up"></i>
                                                <span class="tooltip-text">위로 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn" @click="moveMessageDown(key, msg.seq)">
                                                <i class="fas fa-arrow-down"></i>
                                                <span class="tooltip-text">아래로 이동</span>
                                            </button>
                                            <button class="circle-btn edit tooltip-btn" @click="editMessage(key, msg.seq)">
                                                <i class="fas fa-pencil-alt"></i>
                                                <span class="tooltip-text">메세지 수정</span>
                                            </button>
                                            <button class="circle-btn delete tooltip-btn" @click="removeMessageSeq(key, msg.seq)">
                                                <i class="fas fa-trash"></i>
                                                <span class="tooltip-text">메세지 삭제</span>
                                            </button>
                                            <button class="circle-btn camera tooltip-btn" data-bs-toggle="modal" data-bs-target="#imageModal" @click="selectImageKey(key, msg.seq)">
                                                <i class="fas fa-camera"></i>
                                                <span class="tooltip-text">이미지 메세지 추가</span>
                                            </button>
                                            <button class="circle-btn left tooltip-btn" @click="moveLeft(key, msg.seq)">
                                                <i class="fas fa-arrow-left"></i>
                                                <span class="tooltip-text">상대방 메세지로 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn" @click="toggleReplyMode(msg)" title="답장 연결">
                                                <i class="fas fa-link"></i>
                                                <span class="tooltip-text">답장 연결</span>
                                            </button>
                                        </div>
                                        <span class="send-date">{{ text.sendDate }}</span>
                                    </div>
                                    <p v-if="this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-me" @blur="saveMessage(key)">
                                        <template v-if="msg.isReply">
                                            <span class="reply-header">{{ msg.replyTo }}에게 답장</span><br />
                                            <span class="reply-message">{{ msg.replyMessage }}</span>
                                            <hr />
                                        </template>
                                        <input  type="text" v-model="msg.message" class="from-me" :id="'input-' + key + '_' + msg.seq">
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
                                            <button v-if="this.isEditing != null"
                                                class="btn btn-sm btn-link me-2 tooltip-btn" 
                                                @click="removeReply(msg)"
                                                title="답장 삭제"
                                            >
                                            🗑️
                                            <span class="tooltip-text">답장 삭제</span>
                                            </button>
                                            <span v-if="userNameMap[msg.replyTo] != null">
                                                <span class="reply-header">{{ userNameMap[msg.replyTo].nickname }}에게 답장</span>
                                            </span>
                                            <span v-else class="send-user">
                                                <span class="reply-header">{{ msg.replyTo }}에게 답장</span>
                                            </span>
                                            <br />
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
                                            <button class="circle-btn up-arrow tooltip-btn" @click="moveSendUserUp(key)">
                                                <i class="fas fa-arrow-up"></i>
                                                <span class="tooltip-text">유저 메세지 영역 위로 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn" @click="moveSendUserDown(key)">
                                                <i class="fas fa-arrow-down"></i>
                                                <span class="tooltip-text">유저 메세지 영역 아래로 이동</span>
                                            </button>
                                            <button class="circle-btn edit tooltip-btn" @click="editNickName(key)">
                                                <i class="fas fa-pencil-alt"></i>
                                                <span class="tooltip-text">유저 변경</span>
                                            </button>
                                            <button class="circle-btn delete tooltip-btn" @click="removeSendUser(key)">
                                                <i class="fas fa-trash"></i>
                                                <span class="tooltip-text">유저 메세지 영억 삭제</span>
                                            </button>
                                            <button class="circle-btn right tooltip-btn" @click="moveRight(key)">
                                                <i class="fas fa-arrow-right"></i>
                                                <span class="tooltip-text">내가 보낸 메세지로 이동</span>
                                            </button>
                                    </div>
                                </div>
                                
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container" :id="'message-' + key + '_' + msg.seq" @click="scrollToMessage(key, msg)">
                                    <p v-if="this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-them" @blur="saveMessage(key, msg)">
                                        <template v-if="msg.isReply">
                                            <div v-if="userNameMap[msg.replyTo] != null">
                                                <span class="reply-header-them">{{ userNameMap[msg.replyTo].nickname }}에게 답장</span>
                                            </div>
                                            <div v-else class="send-user">
                                                <span class="reply-header-them">{{ msg.replyTo }}에게 답장</span>
                                            </div>
                                            <br />
                                            <span class="reply-message-them">{{ msg.replyMessage }}</span>
                                            <hr />
                                        </template>
                                        <input  type="text" v-model="msg.message" @blur="saveMessage(key, msg)" class="from-them" :id="'input-' + key + '_' + msg.seq">
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
                                            <span class="reply-header-them">{{ msg.replyTo }}에게 답장</span>
                                            <button v-if="this.isEditing != null"
                                                class="btn btn-sm btn-link me-2 tooltip-btn" 
                                                @click="removeReply(msg)"
                                                title="답장 삭제"
                                            >
                                            🗑️
                                            <span class="tooltip-text">답장 삭제</span>
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
                                            <button class="circle-btn add tooltip-btn" @click="addEmptyMessage(key, msg.seq)">
                                                <i class="fas fa-plus"></i>
                                                <span class="tooltip-text">하단 메세지 추가</span>
                                            </button>
                                            <button class="circle-btn up-arrow tooltip-btn" @click="moveMessageUp(key, msg.seq)">
                                                <i class="fas fa-arrow-up"></i>
                                                <span class="tooltip-text">위로 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn" @click="moveMessageDown(key, msg.seq)">
                                                <i class="fas fa-arrow-down"></i>
                                                <span class="tooltip-text">아래로 이동</span>
                                            </button>
                                            <button class="circle-btn edit tooltip-btn" @click="editMessage(key, msg.seq)">
                                                <i class="fas fa-pencil-alt"></i>
                                                <span class="tooltip-text">메세지 수정</span>
                                            </button>
                                            <button class="circle-btn delete tooltip-btn" @click="removeMessageSeq(key, msg.seq)">
                                                <i class="fas fa-trash"></i>
                                                <span class="tooltip-text">메세지 삭제</span>
                                            </button>
                                            <button class="circle-btn camera tooltip-btn"  data-bs-toggle="modal" data-bs-target="#imageModal" @click="selectImageKey(key, msg.seq)">
                                                <i class="fas fa-camera"></i>
                                                <span class="tooltip-text">이미지 메세지 추가</span>
                                            </button>
                                            <button class="circle-btn right tooltip-btn" @click="moveOnlyMsgRight(key, msg.seq)">
                                                <i class="fas fa-arrow-right"></i>
                                                <span class="tooltip-text">내가보낸 메세지로 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn" @click="toggleReplyMode(msg)" title="답장 연결">
                                                <i class="fas fa-link"></i>
                                                <span class="tooltip-text">답장 연결</span>
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
                    <button 
                        v-if="replyMode" 
                        class="fixed-btn" 
                        @click="saveReplyTarget">
                        답장 연결
                    </button>
                </div>
                <div v-if="isPreviewOpen" class="image-preview-overlay" @click="closePreview">
                    <div class="image-preview-container">
                        <img :src="this.imageMap[previewImage]" alt="Preview Image" class="large-image" />
                    </div>
                </div>

                <!-- 생성 버튼 -->
                <div class="button-toolbar" style="justify-content: flex-end; margin-top: 20px;">
                    <button class="btn btn-primary-action" @click="createPost()">
                        <i class="fas fa-check-circle"></i> 게시글 생성
                    </button>
                </div>
            </div>
</template>
<script>
import axios from '@/js/axios';
import ImageBox from './ImageBox.vue';
import { base64ToFile } from '@/js/fileScripts'
import { getCurrentStep, setStep, TutorialStep } from '@/js/tutorialHelper';
import { saveMessage, getAllMessages, saveNickname, getNicknames, saveImage, getAllImages, hasSavedMessages, clearMessages, saveNicknamesArray, getNicknamesArray } from '@/js/store'

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
            returnButtonTimeout: null,
            isInputVisible: false,
            searchTerm: "",
            searchResults: [],
            selectedTags: [],
            hoverIndex: -1,
            groupSeq: null,
            showGuide: false,
            currentStep: 1,
            showModal: false,
            showSaveToast: false,
            saveToastMessage: '',
        }
    },
    props: {
        seq: Number,
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    async created() {
        this.groupSeq = localStorage.getItem("groupSeq")
        if(!this.isLogin) {
            this.$toastr.warning("로그인 후 게시글 작성이 가능합니다.")
            this.$router.push("/login")
        } else if(this.groupSeq == null) {
            this.$toastr.warning("메세지를 작성할 그룹을 먼저 선택해주세요")
            this.$router.push("/")
        } else {
            try {
                const r = await axios.get("/api/group/name/" + this.groupSeq, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                });
                this.groupName = r.data.data.name;

                const result = await hasSavedMessages();
                console.log("hasSavedMessages result:", result);
                if (result) {
                console.log("hasMessage");
                this.showModal = true; // ← this로 접근
                }
            } catch(e) {
                console.error(e);
            }
        }

        // tutorialState가 4이면 가이드 표시
        if (getCurrentStep() === TutorialStep.MESSAGE_POST_CREATE) {
            this.showGuide = true;
        }
    },
    mounted() {
        // setInterval(async () => {
        //     await this.sendMessagesFromData(this.messageResponse)
        //     await this.sendNickname()
        //     await this.sendImage()
        //     this.showToast("임시저장되었습니다.");
        // }, 1 * 60 * 1000) // 1분마다
    },
    methods: {
        showToast(message) {
            this.saveToastMessage = message;
            this.showSaveToast = true;
            setTimeout(() => {
                this.showSaveToast = false;
            }, 3000); // 3초간 표시
        },
        async onConfirmLoad() { // 수정함
            this.loadInitialData()
            this.showModal = false
        },
        async onRejectLoad() { // 수정함
            await clearMessages()
            this.showModal = false
        },
        async loadInitialData() {
            try {
                const msgs = await getAllMessages();
                if (msgs && msgs.length > 0) {
                    this.messageResponse = msgs.reduce((obj, item) => {
                        obj[item.id] = item;
                        return obj;
                    }, {});
                }

                this.nicknames = await getNicknamesArray();
                this.userNameMap = await getNicknames();

                const images = await getAllImages();
                if (images && images.length > 0) {
                    this.imageMap = images.reduce((obj, item) => {
                        obj[item.id] = item.data;
                        return obj;
                    }, {});
                }
            } catch(e) {
                console.error('초기 데이터 로드 실패', e)
            }
        },
        async sendMessagesFromData(data) {
            console.log("sendMessagesFromData", data)
            for (const key in data) {
                const chat = data[key]

                const plainChat = {
                    key,
                    sendUserSeq: chat.sendUserSeq,
                    sendUser: chat.myMessage ? null : chat.sendUser || 'unknown',
                    message: chat.message.map((msg, idx) => ({
                        seq: idx + 1,
                        message: msg.message,
                        isReply: msg.isReply || false,
                        replyMessage: msg.replyMessage || null,
                        replyTo: msg.replyTo || null,
                        replyNickNameSeq: msg.replyNickNameSeq || null,
                        imageKey: msg.imageKey || [],
                        imageUri: msg.imageUri || [],
                        messageSeq: msg.messageSeq || null,
                        replyMessageSeq: msg.replyMessageSeq || null,
                        replyToSeq: msg.replyToSeq || null,
                        replyToKey: msg.replyToKey || null
                    })),
                    sendDate: chat.sendDate || null,
                    myMessage: chat.myMessage
                }

                console.log("plainChat", plainChat)
                await saveMessage(plainChat) // 수정함
            }
        },
        async sendNickname() {
            if (this.userNameMap) {
                for (const [user, nickname] of Object.entries(this.userNameMap)) {
                    await saveNickname(user, nickname ? JSON.parse(JSON.stringify(nickname)) : null);
                }
            }
            if (this.nicknames) {
                await saveNicknamesArray(this.nicknames);
            }
        },
        async sendImage() {
            if (!this.imageMap) return
            for (const [id, data] of Object.entries(this.imageMap)) {
                await saveImage({ id, data });
            }
        },  
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
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            })
            .then(r => {
                console.log("결과 수신")
                if(this.messageResponse !=null && Object.keys(this.messageResponse).length != 0) {
                    const maxKey = Math.max(...Object.keys(this.messageResponse).map(Number));
                    console.log("maxKey: " + maxKey)
                    for(let [id, value] of Object.entries(r.data.data)) {
                        this.messageResponse[Number(maxKey) + Number(id)] = value
                    }
                    console.log("결과 추가 complate")
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
            const targetMessageId = `input-${key}_${seq}`
            
            this.$nextTick(() => { // 변경됨
                const targetMessage = document.getElementById(targetMessageId);
                if (targetMessage) {
                    targetMessage.focus();
                    targetMessage.classList.add('input-focus'); 

                    // 애니메이션 종료 후 클래스 제거
                    setTimeout(() => {
                        targetMessage.classList.remove('input-focus');
                    }, 500);
                        this.originMsg = null
                        this.returnButtonTimeout = null
                } else {
                    console.warn(`Element with ID ${targetMessageId} not found`);
                }
            });
            
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
            var newKey = key

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
                        newKey = tempKey + 1
                        console.log("origin_newKey:" + newKey)
                        console.log("origin" + JSON.stringify(originMsg))
                    }
                    if(downMsg.length != 0) {
                        tempKey = tempKey + 2
                        tempMap[tempKey] = {
                            ...value,
                            message: downMsg
                        }
                        newKey = tempKey - 1
                        console.log("down_newKey:" + newKey)
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

            removedMessage.seq = 1
            var randomUser = "임시"
            if(this.nicknames != null && this.nicknames.length != undefined && this.nicknames.length != 0) {
                randomUser = this.nicknames[0]
                console.log(randomUser)
                console.log(this.userNameMap[randomUser])
            }
            console.log(newKey)
            this.messageResponse[newKey] = { sendUserSeq: this.userNameMap[randomUser], sendUser: randomUser, message: [] };
            this.messageResponse[newKey].message.unshift(removedMessage);
            this.messageResponseTempRemove(this.messageResponse)
        },
        moveMessageUp(key, seq) {
            key = Number(key);
            seq = Number(seq);

            // Flatten the current structure into a list of individual messages
            let flatMessages = [];
            const sortedKeys = Object.keys(this.messageResponse).sort((a, b) => Number(a) - Number(b));
            sortedKeys.forEach(k => {
                const block = this.messageResponse[k];
                if (block && block.message) {
                    block.message.forEach(msg => {
                        flatMessages.push({
                            blockInfo: { sendUser: block.sendUser, myMessage: block.myMessage, sendDate: block.sendDate },
                            msg: msg
                        });
                    });
                }
            });

            // Find the global index of the message to move
            let globalIndex = -1;
            let count = 0;
            for (const k of sortedKeys) {
                const block = this.messageResponse[k];
                if (!block || !block.message) continue;

                if (Number(k) < key) {
                    count += block.message.length;
                } else if (Number(k) === key) {
                    globalIndex = count + (seq - 1);
                    break;
                }
            }

            if (globalIndex <= 0) return; // Cannot move up if it's the first message

            // Reorder the flat list
            const [messageToMove] = flatMessages.splice(globalIndex, 1);
            flatMessages.splice(globalIndex - 1, 0, messageToMove);

            // Rebuild the messageResponse object from the flat list
            this.messageResponse = this.rebuildMessageResponseFromFlat(flatMessages);
        },
        moveMessageDown(key, seq) {
            key = Number(key);
            seq = Number(seq);

            // Flatten the current structure
            let flatMessages = [];
            const sortedKeys = Object.keys(this.messageResponse).sort((a, b) => Number(a) - Number(b));
            sortedKeys.forEach(k => {
                const block = this.messageResponse[k];
                if (block && block.message) {
                    block.message.forEach(msg => {
                        flatMessages.push({
                            blockInfo: { sendUser: block.sendUser, myMessage: block.myMessage, sendDate: block.sendDate },
                            msg: msg
                        });
                    });
                }
            });

            // Find the global index of the message to move
            let globalIndex = -1;
            let count = 0;
            for (const k of sortedKeys) {
                const block = this.messageResponse[k];
                if (!block || !block.message) continue;
                
                if (Number(k) < key) {
                    count += block.message.length;
                } else if (Number(k) === key) {
                    globalIndex = count + (seq - 1);
                    break;
                }
            }

            if (globalIndex === -1 || globalIndex >= flatMessages.length - 1) return;

            // Reorder the flat list
            const [messageToMove] = flatMessages.splice(globalIndex, 1);
            flatMessages.splice(globalIndex + 1, 0, messageToMove);

            // Rebuild the messageResponse object from the flat list
            this.messageResponse = this.rebuildMessageResponseFromFlat(flatMessages);
        },
        rebuildMessageResponseFromFlat(flatMessageList) {
            if (!flatMessageList || flatMessageList.length === 0) {
                return {};
            }

            const newResponse = {};
            let currentBlock = null;
            let blockKey = 1;

            flatMessageList.forEach(msgWrapper => {
                const { blockInfo, msg } = msgWrapper;
                
                if (!currentBlock || 
                    currentBlock.myMessage !== blockInfo.myMessage || 
                    currentBlock.sendUser !== blockInfo.sendUser) 
                {
                    currentBlock = {
                        sendUser: blockInfo.sendUser,
                        myMessage: blockInfo.myMessage,
                        sendDate: blockInfo.sendDate,
                        message: []
                    };
                    newResponse[blockKey++] = currentBlock;
                }
                
                currentBlock.message.push(msg);
            });

            Object.values(newResponse).forEach(block => {
                block.message.forEach((msg, index) => {
                    msg.seq = index + 1;
                });
            });

            return newResponse;
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

            const copiedContent = JSON.parse(JSON.stringify(this.messageResponse))

            for (const key in copiedContent) {
            if (Object.prototype.hasOwnProperty.call(copiedContent, key)) {
                const item = copiedContent[key]
                if (item.sendUserSeq && typeof item.sendUserSeq === 'object') {
                    item.sendUserSeq = item.sendUserSeq.groupUserSequence // 수정함
                }
            }
            }

            const data = {
                title: this.postTitle,
                groupSeq: this.groupSeq,
                content: copiedContent
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
            formdata.append('tags', JSON.stringify(this.selectedTags))
            
                axios.post("/api/post/message", formdata, {
                    headers: {
                        Authorization: `Bearer `+localStorage.getItem('accessToken')
                    }
                }).then(async (r) => {
                    await clearMessages()
                    this.$router.push({ 
                        name: 'messageJamye',
                        params: { postSeq: r.data.data },
                        query: { groupSeq: this.groupSeq }
                    })
                })
        },
        groupUserList() {
            axios.get("/api/group/users/" + this.groupSeq, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
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
            this.replyOriginMessage.replyTo = this.messageResponse[this.selectedReplyKey].sendUser == null ? '나' : this.messageResponse[this.selectedReplyKey].sendUser
            this.replyOriginMessage.isReply = true
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
                        var preMsg = tempMapUser[tempKey-1]
                        var maxNum = 0;
                        if(preMsg != undefined && preMsg != null) {
                            maxNum = preMsg.message.reduce((max, msg) => {
                                return msg.seq > max ? msg.seq : max;
                            }, 0);
                            value.message.forEach(msg => preMsg.message.push({
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
        moveOnlyMsgRight(key, seq) {
            console.log(`start move Right - key=${key}, seq=${seq}`)
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
                        tempMap[tempKey] = {
                            ...value,
                            message: downMsg
                        }
                        console.log("down:" + JSON.stringify(downMsg))
                    }
                } else 
                if(Number(id) > Number(key)) {
                    console.log(`id=${id}, key=${key}`)
                    console.log("2down" + JSON.stringify(value))
                    tempKey = tempKey + 2
                    tempMap[tempKey] = value
                } else {
                    console.log("std" + tempKey + JSON.stringify(value))
                    tempMap[tempKey++] = value 
                }
            }
            console.log(JSON.parse(JSON.stringify(tempMap)))
            
            var newKey = Number(key) + 1
            var addMsg = tempMap[newKey]
            if(addMsg == undefined || addMsg == null) {
                addMsg = {
                    myMessage: true,
                    sendUser: null,
                    sendUserSeq: null,
                    message: []
                }
            }
            var newSeq = removedMessage.seq;
            if(removedMessage.seq == 1) {
                console.log("case1")
                if(tempMap[key] == undefined || tempMap[key] == null) {
                    newSeq = 1
                } else {
                    newSeq = tempMap[key].message.reduce((max, msg) => {
                                return msg.seq > max ? msg.seq : max;
                            }, 0);
                }

            } else {
                console.log("case2")
                newSeq = 1;
            }

            addMsg.message.push({ 
                imageKey: removedMessage.imageKey,
                imageUri: removedMessage.imageUri,
                isReply: removedMessage.isReply,
                message: removedMessage.message,
                replyMessage: removedMessage.removeMessage,
                replyTo: removedMessage.replyTo,
                seq: newSeq

            })
            tempMap[newKey] = addMsg
            console.log(JSON.parse(JSON.stringify(tempMap)))
            this.messageResponse = tempMap
            this.messageResponseTempRemove(this.messageResponse)
        },
        editNickName(key) {
            this.nickNameEdit[key] = true
        },
        editNickNameComplate(key, nickName) {
            this.nickNameEdit[key] = false
            const originNickName = this.messageResponse[key].sendUser
            for(let [, value] of Object.entries(this.messageResponse)) {
                value.message.forEach(text => {
                    if(text.replyTo == originNickName) {
                        text.replyTo = nickName
                    }
                })
            }
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
        },
        removeReply(msg) {
            msg.isReply = false
            msg.replyTo = null
            msg.replyMessage = null
            msg.replyMessageSeq = null
            msg.replyNickNameSeq = null
        },
        toggleInput() {
            this.isInputVisible = !this.isInputVisible;
            if (!this.isInputVisible) {
                const duplicateCheck = this.selectedTags.filter(it => it.tagName == this.searchTerm)
                if(this.searchTerm.trim() && duplicateCheck.length == 0) {
                    this.selectedTags.push({
                        tagName: this.searchTerm
                    })
                }
                this.searchTerm = "";
                this.searchResults = [];
            } else {
                this.$nextTick(() => { 
                const targetMessage = document.getElementById("tagInput");
                if (targetMessage) {
                    targetMessage.focus();
                    targetMessage.classList.add('input-focus'); 

                    setTimeout(() => {
                        targetMessage.classList.remove('input-focus');
                    }, 500);
                        this.originMsg = null
                        this.returnButtonTimeout = null
                }
            });
            }
        },
        addTextTag() {
            const duplicateCheck = this.selectedTags.filter(it => it.tagName == this.searchTerm)
            if(this.searchTerm.trim() && duplicateCheck.length == 0) {
                this.selectedTags.push({
                    tagName: this.searchTerm
                })
                this.searchTerm = ""
            } else if(duplicateCheck.length != 0) {
                this.$toastr.warning("이미 등록된 태그입니다")
            } else {
                this.$toastr.warning("추가할 태그를 입력해주세요")
            }
            this.$nextTick(() => { 
                const targetMessage = document.getElementById("tagInput");
                if (targetMessage) {
                    targetMessage.focus();
                    targetMessage.classList.add('input-focus'); 

                    setTimeout(() => {
                        targetMessage.classList.remove('input-focus');
                    }, 500);
                        this.originMsg = null
                        this.returnButtonTimeout = null
                    }
                })
        },
        async fetchHashtags() {
            if (!this.searchTerm.trim()) {
                this.searchResults = [];
                return;
            }

            const safeParam = encodeURIComponent(this.searchTerm);
            axios.get(`/api/post/tag/all/${this.groupSeq}?keyword=${safeParam}`, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                },
                skipLoading: true 
            }).then(r => {
                this.searchResults = r.data.data
            })   
                
        },
        addTag(tag) {
            const duplicateCheck = this.selectedTags.filter(it => it.tagName == tag.tagName)
            if (duplicateCheck.length == 0) {
                this.selectedTags.push(tag);
            }
            this.searchTerm = "";
            this.searchResults = [];
        },
        removeTag(index) {
            this.selectedTags.splice(index, 1);
        },
        closeGuide() {
            this.showGuide = false;
            setStep(TutorialStep.DONE)
        },
        nextStep() {
            if (this.currentStep < 6) {
                this.currentStep++;
            }
        },
        prevStep() {
            if (this.currentStep > 1) {
                this.currentStep--;
            }
        },
        goToStep(step) {
            this.currentStep = step;
        },
    }
}
</script>
<style>
@import url("/src/css/message.css");
@import url("/src/css/tag.css");

.save-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  z-index: 10001;
  font-size: 14px;
  font-weight: bold;
  opacity: 0;
  animation: toast-fade 3s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes toast-fade {
  0% {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  10% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  90% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
}

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
  max-width: 50%;
  max-height: 50%;
  /* overflow: hidden; */
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

/* 가이드 모달 스타일 */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.guide-modal {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #cdd6d6 0%, #e8edef 100%);
  color: #333333;
  border-radius: 15px 15px 0 0;
}

.guide-header h4 {
  margin: 0;
  font-weight: bold;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-content {
  padding: 25px;
}

.guide-step {
  display: none;
  animation: fadeIn 0.5s ease-in-out;
}

.guide-step.active {
  display: block;
}

.step-number {
  background: linear-gradient(135deg, #cdd6d6 0%, #e8edef 100%);
  color: #333333;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  display: inline-block;
  margin-bottom: 15px;
}

.guide-step h5 {
  color: #333;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.guide-step p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 10px;
}

.step-note {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #cdd6d6;
  font-size: 14px;
  color: #555;
}

.guide-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 15px 15px;
}

.step-indicators {
  display: flex;
  gap: 8px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #cdd6d6;
  transform: scale(1.2);
}

.step-dot:hover {
  background: #cdd6d6;
  opacity: 0.7;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .guide-modal {
    width: 95%;
    margin: 10px;
  }
  
  .guide-header {
    padding: 15px 20px;
  }
  
  .guide-content {
    padding: 20px;
  }
  
  .guide-footer {
    padding: 15px 20px;
  }
}
.guide-image {
  display: block;
  margin: 0 auto 18px auto;
  max-width: 300px;
  max-height: 220px;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  background: #f8f9fa;
}
</style>