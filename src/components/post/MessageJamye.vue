<template>
    <div class="b-container" style="padding-top: 80px;">
        <!-- 제목 -->
        <div v-if="isEditing" class="form-group" style="margin-bottom: 20px;">
            <input class="form-control post-title-input" type="text" v-model="message.title">
        </div>
        <div v-else style="margin-bottom: 16px; margin-top: -50px;">
            <h1 class="title" style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">{{ message.title }}</h1>
        </div>

        <!-- 작성자 정보 -->
        <div class="post-meta-container">
            <span class="post-meta-label">작성자</span>
            <span class="post-meta-value">{{ message.createdUserNickName }}</span>
        </div>
        <div class="editModeOpen" v-if="isEditing == null && message.createdUserSequence == userSeq">
            <div class="button-toolbar" style="margin-bottom: 12px;">
                <div class="button-group">
                    <button @click="editMode" class="btn btn-dark">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button @click="deletePost" class="btn btn-dark">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
            <div class="tag-list">
                <div
                    v-for="tag in tags" :key="tag.tagPostConnectionSeq"
                    class="tag-item"
                    @mouseover="hoverIndex = index"
                    @mouseleave="hoverIndex = -1"
                >
                    # {{ tag.tagName }}
                </div>
            </div>
        </div>
        <div class="editMode" v-if="isEditing != null">
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
                <div class="modal fade" id="nickNameMapping" tabindex="-1" aria-labelledby="nickNameMapping" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="nickNameMapping">
                                    <i class="fas fa-user-tag"></i> 닉네임 및 그룹 회원 연결 관리
                                </h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <!-- 기존 닉네임 목록 -->
                                <div class="nickname-modal-section">
                                    <h6>등록된 닉네임 목록</h6>
                                    <div v-for="[key, value] in Object.entries(this.nickNameMap)" :key="key">
                                        <div v-if="value != null && value.nickName != null" class="nickname-item">
                                            <span class="nickname-item-name">{{ value.nickName }}</span>
                                            <div class="nickname-item-mapping">
                                                <label>그룹 회원 연결:</label>
                                                <select
                                                    class="form-select form-select-sm"
                                                    :value="value.userSeqInGroup || ''"
                                                    @change="handleUserMapping(key, $event.target.value, 'existing')"
                                                >
                                                    <option value="">연결 안함</option>
                                                    <option
                                                        v-for="user in userInGroup"
                                                        :key="user.groupUserSequence"
                                                        :value="user.groupUserSequence"
                                                    >
                                                        {{ user.nickname }}
                                                    </option>
                                                </select>
                                            </div>
                                            <button
                                                class="nickname-item-remove"
                                                @click="removeNickname(key)"
                                                title="삭제"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>

                                    <!-- 새로 추가된 닉네임 -->
                                    <div v-for="info in this.addNickNameSet" :key="info.nickName" class="nickname-item">
                                        <span class="nickname-item-name">{{ info.nickName }}</span>
                                        <div class="nickname-item-mapping">
                                            <label>그룹 회원 연결:</label>
                                            <select
                                                class="form-select form-select-sm"
                                                :value="info.userSeqInGroup || ''"
                                                @change="handleUserMapping(info.nickName, $event.target.value, 'new')"
                                            >
                                                <option value="">연결 안함</option>
                                                <option
                                                    v-for="user in userInGroup"
                                                    :key="user.groupUserSequence"
                                                    :value="user.groupUserSequence"
                                                >
                                                    {{ user.nickname }}
                                                </option>
                                            </select>
                                        </div>
                                        <button
                                            class="nickname-item-remove"
                                            @click="removeNewNickname(info.nickName)"
                                            title="삭제"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <!-- 닉네임 추가 -->
                                <div class="nickname-modal-section">
                                    <h6>새 닉네임 추가</h6>
                                    <button class="btn btn-dark" @click="nickNameAdd" v-if="!nickNameEditMod">
                                        <i class="fas fa-plus"></i> 닉네임 추가
                                    </button>
                                    <div class="nickname-add-form" v-if="nickNameEditMod">
                                        <input
                                            class="form-control"
                                            v-model="nicknameInput"
                                            placeholder="메시지에 표시된 이름을 입력하세요"
                                        />
                                        <button class="btn btn-dark" @click="nickNameAddComplate">
                                            <i class="fas fa-check"></i> 추가 완료
                                        </button>
                                    </div>
                                </div>

                                <!-- 안내 -->
                                <div class="nickname-modal-notice">
                                    <i class="fas fa-info-circle"></i>
                                    변경사항은 '반영하기' 버튼을 클릭해야 저장됩니다.
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-dark" @click="updateNickNameInfo" data-bs-dismiss="modal" aria-label="Close">
                                    <i class="fas fa-save"></i> 반영하기
                                </button>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" aria-label="Close">
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
            </div>
            <div class="tag-list">
                <div
                    v-for="(tag, index) in tags"
                    :key="tag.tagPostConnectionSeq"
                    class="tag-item d-flex align-items-center justify-content-between px-2"
                    @mouseover="hoverIndex = index"
                    @mouseleave="hoverIndex = -1"
                    style="margin: 4px;"
                >
                    <span># {{ tag.tagName }}</span>
                    <span
                    v-if="hoverIndex === index"
                    class="text-danger fw-bold ms-2"
                    style="cursor: pointer;"
                    @click="removeTag(index)"
                    >
                    ×
                    </span>
                </div>
            </div>
        </div>

        <!-- 메시지 편집 툴바 (본문 바로 위, 수정 모드일 때만 표시) -->
        <div v-if="isEditing != null" class="message-editor-toolbar">
            <span style="font-size: 13px; color: #6c757d; font-weight: 500; margin-right: 8px;">메시지 편집:</span>
            <button type="button" class="btn btn-modal-trigger btn-sm" data-bs-toggle="modal" data-bs-target="#imageModal">
                <i class="fas fa-images"></i> 이미지
            </button>
            <button class="btn btn-modal-trigger btn-sm" data-bs-toggle="modal" data-bs-target="#nickNameMapping" @click="groupNickNameInfo()">
                <i class="fas fa-user-tag"></i> 닉네임
            </button>
        </div>

        <div class="card card-body" :class="{ 'message-card-with-toolbar': isEditing != null }">
                    <div class="chat-room">
                        <div v-for="[key, text] in Object.entries(this.messageResponse)" :key="key">                                                                        
                            <!-- 내 매세지 -->
                            <div v-if="text.myMessage" class="chat-message mt-3">
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container-me"  @click="scrollToMessage(key, msg)"   :id="'message-' + (msg.messageSeq!=null? msg.messageSeq : key + '_' + msg.seq)"
                                    :draggable="isEditing != null"
                                    @dragstart="isEditing != null ? handleDragStart($event, key, msg.seq) : null"
                                    @dragover="isEditing != null ? handleDragOver($event, key, msg.seq) : null"
                                    @drop="isEditing != null ? handleDrop($event, key, msg.seq) : null"
                                    @dragend="isEditing != null ? handleDragEnd() : null"
                                    :class="{
                                        'dragging': draggedMessage && draggedMessage.key === Number(key) && draggedMessage.seq === msg.seq,
                                        'drag-over': dragOverMessage && dragOverMessage.key === Number(key) && dragOverMessage.seq === msg.seq,
                                        'message-hover-delete': isMessageHighlighted(key, msg.seq, 'delete'),
                                        'message-hover-edit': isMessageHighlighted(key, msg.seq, 'edit'),
                                        'message-hover-move-up': isMessageHighlighted(key, msg.seq, 'move-up'),
                                        'message-hover-move-down': isMessageHighlighted(key, msg.seq, 'move-down'),
                                        'message-hover-add': isMessageHighlighted(key, msg.seq, 'add'),
                                        'message-hover-camera': isMessageHighlighted(key, msg.seq, 'camera'),
                                        'message-hover-switch': isMessageHighlighted(key, msg.seq, 'switch')
                                    }"
                                >
                                    <div class="info-container">
                                        <div class="button-container" v-if="this.isEditing != null">
                                            <button class="circle-btn add tooltip-btn"
                                                @click="addEmptyMessage(key, msg.seq)"
                                                @mouseenter="setHoverAction('add', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-plus"></i>
                                                <span class="tooltip-text">하단 메세지 추가</span>
                                            </button>
                                            <button class="circle-btn up-arrow tooltip-btn"
                                                @click="moveMessageUp(key, msg.seq)"
                                                @mouseenter="setHoverAction('move-up', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-arrow-up"></i>
                                                <span class="tooltip-text">위로 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn"
                                                @click="moveMessageDown(key, msg.seq)"
                                                @mouseenter="setHoverAction('move-down', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-arrow-down"></i>
                                                <span class="tooltip-text">아래로 이동</span>
                                            </button>
                                            <button class="circle-btn edit tooltip-btn"
                                                @click="editMessage(key, msg.seq)"
                                                @mouseenter="setHoverAction('edit', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-pencil-alt"></i>
                                                <span class="tooltip-text">메시지 수정</span>
                                            </button>
                                            <button class="circle-btn delete tooltip-btn"
                                                @click="removeMessageSeq(key, msg.seq, msg.messageSeq)"
                                                @mouseenter="setHoverAction('delete', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-trash"></i>
                                                <span class="tooltip-text">메세지 삭제</span>
                                            </button>
                                            <button class="circle-btn camera tooltip-btn"
                                                data-bs-toggle="modal"
                                                data-bs-target="#imageModal"
                                                @click="selectImageKey(key, msg.seq)"
                                                @mouseenter="setHoverAction('camera', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-camera"></i>
                                                <span class="tooltip-text">이미지 메세지 추가</span>
                                            </button>
                                            <button class="circle-btn left tooltip-btn"
                                                @click="moveLeft(key, msg.seq)"
                                                @mouseenter="setHoverAction('switch', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-arrow-left"></i>
                                                <span class="tooltip-text">메시지 왼쪽 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn"
                                                @click="toggleReplyMode(msg, key)"
                                                title="답장 연결"
                                                @mouseenter="setHoverAction('reply', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-link"></i>
                                                <span class="tooltip-text">답장 연결</span>
                                            </button>
                                        </div>
                                        <span class="send-date">{{ text.sendDate }}</span>
                                    </div>
                                    <p v-if="this.isEditing != null && this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-me" @blur="saveMessage(key)">
                                        <template v-if="msg.isReply">
                                            <span v-if="nickNameMap[msg.replyNickNameSeq]">
                                                <span class="reply-header">
                                                    <span v-if="nickNameMap[msg.replyNickNameSeq].userNameInGroup != null">
                                                        {{ nickNameMap[msg.replyNickNameSeq].userNameInGroup }}
                                                    </span>
                                                    <span v-else>
                                                        {{ nickNameMap[msg.replyNickNameSeq].nickName }}
                                                    </span>
                                                    에게 답장
                                                </span><br />
                                            </span>
                                            <div class="reply-message">{{ msg.replyMessage }}</div>
                                            <hr />
                                        </template>
                                        <input  type="text" v-model="msg.message" class="from-me" :id="'input-' + key + '_' + msg.seq">
                                        <span class="image-gallery">
                                            <img
                                                v-for="(image, index) in msg.imageUri"
                                                :key="index"
                                                :src="imageUrl(image.second)"
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
                                            @input="updateReplySeq(msg.messageSeq, key, msg.seq)"
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
                                            <span v-if="nickNameMap[msg.replyNickNameSeq]">
                                                <span class="reply-header">
                                                    <span v-if="nickNameMap[msg.replyNickNameSeq].userNameInGroup != null">
                                                        {{ nickNameMap[msg.replyNickNameSeq].userNameInGroup }}
                                                    </span>
                                                    <span v-else>
                                                        {{ nickNameMap[msg.replyNickNameSeq].nickName }}
                                                    </span>
                                                    에게 답장
                                                </span><br />
                                            </span>
                                            <span v-else>
                                                <span class="reply-header">나에게 답장</span><br />
                                            </span>
                                            <span class="reply-message">{{ msg.replyMessage }}</span>
                                            <hr />
                                        </template>
                                        {{ msg.message }}
                                        <span class="image-gallery">
                                            <img
                                                v-for="(image, index) in msg.imageUri"
                                                :key="index"
                                                :src="imageUrl(image.second)"
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
                                <div class="info-container">
                                    <div v-if="nickNameEdit[key]">
                                        <div v-if="this.nickNameMap[text.sendUserSeq] != null">
                                            <button v-if="this.nickNameMap[text.sendUserSeq].userNameInGroup != null" class="btn btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                {{ this.nickNameMap[text.sendUserSeq].userNameInGroup }}
                                                </button>
                                            <button v-else class="btn btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                {{ this.nickNameMap[text.sendUserSeq].nickName }}
                                            </button>
                                            <ul 
                                                class="dropdown-menu" 
                                                style="max-height: 200px; overflow-y: auto;"
                                            >
                                                <li 
                                                    v-for="[id, value] in Object.entries(nickNameMap)" 
                                                    :key="id"
                                                    @click="editNickNameComplate(key, id, value)"
                                                    style="padding: 8px; cursor: pointer;"
                                                >
                                                    {{ value.nickName }} <span v-if="value.userNameInGroup">| {{ value.userNameInGroup }}</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <button v-else class="btn btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                임시
                                        </button>
                                        <ul 
                                                class="dropdown-menu" 
                                                style="max-height: 200px; overflow-y: auto;"
                                            >
                                                <li 
                                                    v-for="[id, value] in Object.entries(nickNameMap)" 
                                                    :key="id"
                                                    @click="editNickNameComplate(key, id, value)"
                                                    style="padding: 8px; cursor: pointer;"
                                                >
                                                    {{ value.nickName }} <span v-if="value.userNameInGroup">| {{ value.userNameInGroup }}</span>
                                                </li>
                                            </ul>
                                    </div>
                                    <div v-else>
                                        <div v-if="this.nickNameMap[text.sendUserSeq] != null">
                                            <div v-if="this.nickNameMap[text.sendUserSeq].userNameInGroup != null">
                                                <div class="send-user">{{ this.nickNameMap[text.sendUserSeq].userNameInGroup }}</div>
                                            </div>
                                            <div v-else>
                                                <div class="send-user">{{ this.nickNameMap[text.sendUserSeq].nickName }}</div>
                                            </div>
                                        </div>
                                        <div v-else>
                                                임시
                                            </div>
                                    </div>
                                    <div class="button-container" v-if="this.isEditing != null">
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
                                                <span class="tooltip-text">닉네임 변경</span>
                                            </button>
                                            <button class="circle-btn delete tooltip-btn" @click="removeSendUser(key)">
                                                <i class="fas fa-trash"></i>
                                                <span class="tooltip-text">유저 메세지 영역 삭제</span>
                                            </button>
                                            <button class="circle-btn right tooltip-btn" @click="moveRight(key)">
                                                <i class="fas fa-arrow-right "></i>
                                                <span class="tooltip-text">내 메세지로 이동</span>
                                            </button>
                                    </div>
                                </div>
                                <div v-for="msg in text.message" :key="msg.seq" class="message-container" :id="'message-' + (msg.messageSeq!=null? msg.messageSeq : key + '_' + msg.seq)" @click="scrollToMessage(key, msg)"
                                    :draggable="isEditing != null"
                                    @dragstart="isEditing != null ? handleDragStart($event, key, msg.seq) : null"
                                    @dragover="isEditing != null ? handleDragOver($event, key, msg.seq) : null"
                                    @drop="isEditing != null ? handleDrop($event, key, msg.seq) : null"
                                    @dragend="isEditing != null ? handleDragEnd() : null"
                                    :class="{
                                        'dragging': draggedMessage && draggedMessage.key === Number(key) && draggedMessage.seq === msg.seq,
                                        'drag-over': dragOverMessage && dragOverMessage.key === Number(key) && dragOverMessage.seq === msg.seq,
                                        'message-hover-delete': isMessageHighlighted(key, msg.seq, 'delete'),
                                        'message-hover-edit': isMessageHighlighted(key, msg.seq, 'edit'),
                                        'message-hover-move-up': isMessageHighlighted(key, msg.seq, 'move-up'),
                                        'message-hover-move-down': isMessageHighlighted(key, msg.seq, 'move-down'),
                                        'message-hover-add': isMessageHighlighted(key, msg.seq, 'add'),
                                        'message-hover-camera': isMessageHighlighted(key, msg.seq, 'camera'),
                                        'message-hover-switch': isMessageHighlighted(key, msg.seq, 'switch')
                                    }"
                                >
                                    <p v-if="this.isEditing != null && this.isEditing[key] && this.isEditing[key][msg.seq]" class="from-them" @blur="saveMessage(key, msg)">
                                        <template v-if="msg.isReply">
                                             <span v-if="nickNameMap[msg.replyNickNameSeq]">
                                                <span class="reply-header-them">
                                                    <span v-if="nickNameMap[msg.replyNickNameSeq].userNameInGroup != null">
                                                        {{ nickNameMap[msg.replyNickNameSeq].userNameInGroup }}
                                                    </span>
                                                    <span v-else>
                                                        {{ nickNameMap[msg.replyNickNameSeq].nickName }}
                                                    </span>
                                                    에게 답장
                                                </span><br />
                                            </span>
                                            <div class="reply-message-them"> {{ msg.replyMessage }}</div>
                                            <hr />
                                        </template>
                                        <input  type="text" v-model="msg.message" @blur="saveMessage(key, msg)" class="from-them" :id="'input-' + key + '_' + msg.seq">
                                        <span class="image-gallery">
                                            <img
                                                v-for="(image, index) in msg.imageUri"
                                                :key="index"
                                                :src="imageUrl(image.second)"
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
                                    <p v-else class="from-them">
                                        <template v-if="msg.isReply">
                                            <span v-if="nickNameMap[msg.replyNickNameSeq]">
                                                <span class="reply-header-them">
                                                    <span v-if="nickNameMap[msg.replyNickNameSeq].userNameInGroup != null">
                                                        {{ nickNameMap[msg.replyNickNameSeq].userNameInGroup }}
                                                    </span>
                                                    <span v-else>
                                                        {{ nickNameMap[msg.replyNickNameSeq].nickName }}
                                                    </span>
                                                    에게 답장
                                                </span>
                                            </span>
                                            <span v-else>
                                                <span class="reply-header-them">나에게 답장</span>
                                            </span>
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
                                            @input="updateReplySeq(msg.messageSeq, key, msg.seq)"
                                            class="form-check-input mt-1"
                                        />
                                        {{ msg.message }}
                                        <span class="image-gallery">
                                            <img
                                                v-for="(image, index) in msg.imageUri"
                                                :key="index"
                                                :src="imageUrl(image.second)"
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
                                    <div class="info-container-them">
                                        <span class="send-date">{{ text.sendDate }}</span>
                                        <div class="button-container" v-if="this.isEditing != null">
                                            <button class="circle-btn add tooltip-btn"
                                                @click="addEmptyMessage(key, msg.seq)"
                                                @mouseenter="setHoverAction('add', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-plus"></i>
                                                <span class="tooltip-text">하단 메세지 추가</span>
                                            </button>
                                            <button class="circle-btn up-arrow tooltip-btn"
                                                @click="moveMessageUp(key, msg.seq)"
                                                @mouseenter="setHoverAction('move-up', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-arrow-up"></i>
                                                <span class="tooltip-text">위로 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn"
                                                @click="moveMessageDown(key, msg.seq)"
                                                @mouseenter="setHoverAction('move-down', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-arrow-down"></i>
                                                <span class="tooltip-text">아래로 이동</span>
                                            </button>
                                            <button class="circle-btn edit tooltip-btn"
                                                @click="editMessage(key, msg.seq)"
                                                @mouseenter="setHoverAction('edit', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-pencil-alt"></i>
                                                <span class="tooltip-text">메세지 수정</span>
                                            </button>
                                            <button class="circle-btn delete tooltip-btn"
                                                @click="removeMessageSeq(key, msg.seq, msg.messageSeq)"
                                                @mouseenter="setHoverAction('delete', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-trash"></i>
                                                <span class="tooltip-text">메세지 삭제</span>
                                            </button>
                                            <button class="circle-btn camera tooltip-btn"
                                                data-bs-toggle="modal"
                                                data-bs-target="#imageModal"
                                                @click="selectImageKey(key, msg.seq)"
                                                @mouseenter="setHoverAction('camera', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-camera"></i>
                                                <span class="tooltip-text">이미지 메세지 추가</span>
                                            </button>
                                            <button class="circle-btn right tooltip-btn"
                                                @click="moveOnlyMsgRight(key, msg.seq)"
                                                @mouseenter="setHoverAction('switch', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
                                                <i class="fas fa-arrow-right"></i>
                                            <span class="tooltip-text">내가보낸 메세지로 이동</span>
                                            </button>
                                            <button class="circle-btn down-arrow tooltip-btn"
                                                @click="toggleReplyMode(msg, key)"
                                                title="답장 연결"
                                                @mouseenter="setHoverAction('reply', key, msg.seq)"
                                                @mouseleave="clearHoverAction">
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

                <!-- 수정완료 버튼 (수정 모드일 때만 표시) -->
                <div v-if="isEditing != null" class="button-toolbar" style="justify-content: flex-end; margin-top: 20px;">
                    <button @click="editModeClose" class="btn btn-primary-action">
                        <i class="fas fa-check-circle"></i> 수정완료
                    </button>
                </div>

                <div v-if="isPreviewOpen" class="image-preview-overlay" @click="closePreview">
                    <div class="image-preview-container">
                        <img 
                            v-if="imageMap[previewImage]" 
                            :src="this.imageMap[previewImage]" 
                            alt="Preview Image" 
                            class="large-image" 
                            />
                        <img v-else :src="imageUrl(previewImage)" alt="Preview Image" class="large-image"/>
                    </div>
                </div>
                <comment-list v-if="message.postSequence != null && isEditing == null" class="comment" :postSeq= "postSeq" :groupSeq="groupSeq"></comment-list>
    </div>    
</template>
<script>
import axios from '@/js/axios';
import ImageBox from './ImageBox.vue';
import { base64ToFile } from '@/js/fileScripts';
import { imageUrl } from '@/js/fileScripts';
import CommentList from './CommentList.vue'
export default {
    components: {
        ImageBox,
        CommentList
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
            deleteNickNames: new Set,
            replyMode: false,
            selectedReplyMessageSeq: null,
            selectedReplyKey: null,
            selectedReplySeq: null,
            nickNameEdit: {},
            removeText: null,
            originMsg: null,
            returnButtonTimeout: null,
            addNickNameSet: new Set,
            tags: [],
            hoverIndex: -1,
            deleteTagSeqs: new Set,
            isInputVisible: false,
            searchTerm: "",
            searchResults: [],
            messageImage: null,
            replyOriginMessage: null,
            userSeq: null,
            hoveredAction: { type: null, key: null, seq: null }, // 호버 상태 추적
            draggedMessage: null, // 드래그 중인 메시지 정보 { key, seq }
            dragOverMessage: null, // 드래그 오버 중인 메시지 정보 { key, seq }
        }
    },
    props: {
        postSeq: Number,
        groupSeq: Number,
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        if(!this.isLogin) {
            this.$toastr.warning("로그인 후 게시글 작성이 가능합니다.")
            this.$router.push("/login")
        } else {
            this.userSeq = localStorage.getItem("sequence")
            axios.get(`/api/post/${this.groupSeq}/${this.postSeq}`, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            })
            .then(r => {
                this.message = r.data.data
                this.messageResponse = r.data.data.content.message
                this.nickNameMap = r.data.data.content.nickName
                this.tags = r.data.data.tags
            }).catch(() => {
                this.$toastr.error("잘못된 게시글 번호입니다. 운영자에게 문의해주세요")
                this.$router.push("/jamye-list")
            })
        }

    },
    methods: {
        imageUrl,
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
            const data = {
                title: this.message.title,
                message: this.messageResponse,
                nickName: this.nickNameMap,
                deleteMessage: Array.from(this.deleteSeqs),
                tagDisconnected: Array.from(this.deleteTagSeqs),
                tags: this.tags.filter(it => it.tagPostConnectionSeq == null)
            }

            formdata.append('data', JSON.stringify(data));
            axios.post(`/api/post/message/${this.groupSeq}/${this.postSeq}`,
            formdata
            ,
                {
                    headers: {
                        Authorization: `Bearer `+localStorage.getItem('accessToken')
                    }
                }
            ).catch(e => {
                console.log(e)
                this.$toastr.error("수정사항을 저장할 수 없습니다. 운영자에게 문의해주세요.")
            })

            this.isEditing = null
            this.replyMode = false
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
                console.log("messageText:"+ JSON.stringify(messageText))
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
            this.addNickNameSet.add({
                    "nickName": this.nicknameInput,
                })
            this.nickNameEditMod = false
            this.nicknameInput = null
        },
        groupNickNameInfo() {
            axios.get("/api/group/users/" + this.groupSeq, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            })
            .then(r => {
                this.userInGroup = r.data.data
            })
        },
        handleUserMapping(identifier, userSeqValue, type) {
            if (!userSeqValue || userSeqValue === '') {
                // "연결 안함" 선택
                if (type === 'existing') {
                    this.nickNameMap[identifier] = {
                        "nickName": this.nickNameMap[identifier].nickName,
                        "userSeqInGroup": null,
                        "userNameInGroup": null,
                        "imageUri": null
                    }
                } else {
                    const newSet = new Set();
                    this.addNickNameSet.forEach(add => {
                        if (add.nickName === identifier) {
                            newSet.add({
                                "nickName": identifier,
                                "userSeqInGroup": null,
                                "userNameInGroup": null,
                                "imageUri": null
                            });
                        } else {
                            newSet.add(add);
                        }
                    });
                    this.addNickNameSet = newSet;
                }
            } else {
                // 그룹 회원 선택
                const userInGroupInfo = this.userInGroup.find(u => u.groupUserSequence == userSeqValue);
                if (userInGroupInfo) {
                    if (type === 'existing') {
                        this.userInGroupSet(identifier, userInGroupInfo);
                    } else {
                        this.addUserInGroupSet(identifier, userInGroupInfo);
                    }
                }
            }
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
        addUserInGroupSet(nickName, userInGroupInfo) {
            const newSet = new Set();
            this.addNickNameSet.forEach(add => {
                if (add.nickName === nickName) {
                    newSet.add({
                        "nickName": nickName,
                        "userSeqInGroup": userInGroupInfo.groupUserSequence,
                        "userNameInGroup": userInGroupInfo.nickname,
                        "imageUri": userInGroupInfo.imageUrl
                    });
                } else {
                    newSet.add(add);
                }
            });
            this.addNickNameSet = newSet;
        },
        updateNickNameInfo() {
            var tempMap = new Map
            for(let [id, value] of Object.entries(this.nickNameMap)) {
                if(value.nickName != null) {
                    tempMap[id] = value
                }
            }
            axios.post(`/api/post/message/${this.groupSeq}/${this.postSeq}/nickName`, {
                "updateInfo" : tempMap,
                "deleteMessageNickNameSeqs" : Array.from(this.deleteNickNames),
                "createInfo": Array.from(this.addNickNameSet)
            }, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            })
            .then(r => {
                this.deleteNickNames = new Set
                this.nickNameMap = r.data.data
                this.addNickNameSet = new Set
            })
        },
        removeNickname(key) {
            console.log("test")
            for(let [, value] of Object.entries(this.messageResponse)) {
                console.log(value)
                if(value.sendUserSeq == key) {
                    
                    this.$toastr.warning("메세지 내역이 존재하는 닉네임입니다. 삭제 전 모든 메세지를 삭제해주세요")
                    return
                }
            }
            this.deleteNickNames.add(key)
            this.nickNameMap[key] = {"userNameInGroup": this.nickNameMap[key].nickName }
        },
        removeNewNickname(nickName) {
            console.log("test")
            const newSet = new Set();
            this.addNickNameSet.forEach(add => {
                if (add.nickName != nickName) {
                    newSet.add(add);
                } 
            });
            this.addNickNameSet = newSet;
        },
        toggleReplyMode(msg, key) {
            this.replyMode = true
                if (!this.replyMode) {
                    this.selectedReplyKey = null
                    this.selectedReplySeq = null; // 모드 비활성화 시 선택 초기화
                    this.replyOriginMessage = null
                    this.replyOriginKey = null
                } else {
                    this.replyOriginMessage = msg
                    this.replyOriginKey = key
                }
        },
        updateReplySeq(messageSeq, key, seq) {
            console.log(messageSeq)
            if(messageSeq != null) {
                this.selectedReplyMessageSeq = messageSeq
            } else {
                this.selectedReplyKey = key
                this.selectedReplySeq = seq
            }
        },
        saveReplyTarget() {
            if(this.selectedReplyMessageSeq == null && (this.selectedReplyKey == null || this.selectedReplySeq == null)) {
                this.$toastr.warning("연결할 메세지를 선택해주세요")
                return
            }

            if(this.selectedReplyMessageSeq != null) {
                this.replyOriginMessage.replyMessageSeq = this.selectedReplyMessageSeq
                for(let [, value] of Object.entries(this.messageResponse)) {
                    const newReplyMessage = value.message.filter(
                        (msg) => msg.messageSeq == this.selectedReplyMessageSeq
                    );
                    if(newReplyMessage != null && newReplyMessage != undefined && newReplyMessage.length != 0) {
                        console.log(newReplyMessage)
                        this.replyOriginMessage.replyMessage = newReplyMessage[0].message
                        this.replyOriginMessage.replyNickNameSeq = value.sendUserSeq == null ? null : value.sendUserSeq
                    }

                }
                this.selectedReplyMessageSeq = null
            } else {
                this.replyOriginMessage.replyToKey = this.selectedReplyKey
                this.replyOriginMessage.replyToSeq = this.selectedReplySeq
                this.replyOriginMessage.replyMessage = this.messageResponse[this.selectedReplyKey].message.filter(
                    (msg) => msg.seq == this.selectedReplySeq
                )[0].message;
                this.replyOriginMessage.replyNickNameSeq = this.messageResponse[this.selectedReplyKey].sendUserSeq == null ? null : this.messageResponse[this.selectedReplyKey].sendUserSeq
                this.replyOriginMessage.replyMessageSeq = null
                this.selectedReplyKey = null;
                this.selectedReplySeq = null;
            }

            this.replyOriginMessage.isReply = true

            this.replyMode = false;

            if(this.replyOriginMessage.seq == null 
            && ((this.replyOriginMessage.replyToKey == undefined || this.replyOriginMessage.replyToKey == null) 
            && (this.replyOriginMessage.replyToSeq == undefined || this.replyOriginMessage.replyToSeq == null))) {
                return
            }
            var targetMessageId = ''
            if(this.replyOriginMessage.messageSeq != null) {
                targetMessageId = `message-${this.replyOriginMessage.messageSeq}`
            } else {
                targetMessageId = `message-${this.replyOriginKey}_${this.replyOriginMessage.seq}`
            }
            console.log(targetMessageId)
            const targetMessage = document.getElementById(targetMessageId)          
            
            if(targetMessage) {
                targetMessage.scrollIntoView({ behavior: "auto", block: "start" })
            }
            this.replyOriginMessage = null

        },
        scrollToMessage(key, msg) {
            if(msg.replyMessageSeq == null && ((msg.replyToKey == undefined || msg.replyToKey == null) && (msg.replyToSeq == undefined || msg.replyToSeq == null))) {
                return
            }
            var targetMessageId = ''
            if(msg.replyMessageSeq != null) {
                targetMessageId = `message-${msg.replyMessageSeq}`
            } else {
                targetMessageId = `message-${msg.replyToKey}_${msg.replyToSeq}`
            }
            console.log(targetMessageId)
            const targetMessage = document.getElementById(targetMessageId)          
                if(targetMessage) {
                    targetMessage.scrollIntoView({ behavior: "auto", block: "start" })
                    targetMessage.classList.add('shake');

                    // 애니메이션 종료 후 클래스 제거
                    setTimeout(() => {
                    targetMessage.classList.remove('shake');
                    }, 500);
                    this.originMsg = 'message-' + (msg.messageSeq!=null? msg.messageSeq : key + '_' + msg.seq)
                    this.returnButtonTimeout = setTimeout(() => {
                        this.originMsg = null;
                    }, 10000); // 60,000ms = 1분
                }  
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
                sendUserSeq: null,
                myMessage: true
            };
            this.messageResponseTempRemove(this.messageResponse)
        },
        editNickName(key) {
            this.nickNameEdit[key] = true
        },
        editNickNameComplate(key, id, nickNameInfo) {
            this.nickNameEdit[key] = false
            this.messageResponse[key].sendUser = nickNameInfo.nickName
            this.messageResponse[key].sendUserSeq = id
        },
        messageResponseTempRemove(message) {
            console.log("message")
            console.log(message)
            var tempMapUser = new Map
            var preUser = null
            var tempKey = 1
            for(let [id, value] of Object.entries(message)) {
                if(id == 1) {
                    preUser = value.sendUserSeq
                    tempMapUser[tempKey++] = value
                    continue
                }
                if (value.sendUserSeq == preUser && tempKey != 1 && tempMapUser[tempKey - 1].sendUser != '임시' && value.sendUser != '임시') {
                        var maxNum = tempMapUser[tempKey - 1].message.reduce((max, msg) => {
                            return msg.seq > max ? msg.seq : max;
                        }, 0);
                        value.message.forEach(msg => tempMapUser[tempKey - 1].message.push({
                            ...msg,
                            seq: ++maxNum,
                        }))
                } else {
                    tempMapUser[tempKey++] = JSON.parse(JSON.stringify(value))
                }
                preUser = value.sendUserSeq
            }
            console.log(tempMapUser)
            this.messageResponse = JSON.parse(JSON.stringify(tempMapUser))
            console.log(this.messageResponse)
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

            const nextKey = Number(key) + 1
            removedMessage.seq = 1
            var randomUser = "임시"
            var randomkey = null
            if(this.nickNameMap != null && Object.keys(this.nickNameMap).length > 0) {
                const firstEntry = Object.entries(this.nickNameMap)[0]; // 첫 번째 엔트리 가져오기
                if (firstEntry) {
                    const [key, value] = firstEntry;
                    randomkey = key
                    randomUser = value.nickName
                    console.log("첫 번째 키:", key);
                    console.log("첫 번째 값:", value);

                    this.addNickNameSet.add({
                        "nickName": this.nicknameInput,
                    })
                }
            }
            console.log(nextKey)
            tempMap[nextKey] = { sendUserSeq: randomkey, sendUser: randomUser, message: [] };
            tempMap[nextKey].message.unshift(removedMessage);
            console.log(tempMap)
            this.messageResponseTempRemove(tempMap)
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
        deletePost() {
            axios.delete(`/api/post/${this.groupSeq}/${this.postSeq}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
          }).then( () => {
                this.$router.push("/jamye-list")
          }) 
        },
        removeTag(index) {
            const tag = this.tags.splice(index, 1)[0]
            this.deleteTagSeqs.add(tag.tagPostConnectionSeq)
        },
        toggleInput() {
            this.isInputVisible = !this.isInputVisible;
            if (!this.isInputVisible) {
                const duplicateCheck = this.tags.filter(it => it.tagName == this.searchTerm)
                if(this.searchTerm.trim() && duplicateCheck.length == 0) {
                    this.tags.push({
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
                this.searchResults = [];
            });
            }
        },
        addTextTag() {
            const duplicateCheck = this.tags.filter(it => it.tagName == this.searchTerm)
            if(this.searchTerm.trim() && duplicateCheck.length == 0) {
                this.tags.push({
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
            this.searchResults = []
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
            const duplicateCheck = this.tags.filter(it => it.tagName == tag.tagName)
            if (duplicateCheck.length == 0) {
                this.tags.push(tag);
            }
            this.searchTerm = "";
            this.searchResults = [];
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
                seq: newSeq,
                messageSeq: removedMessage.messageSeq

            })
            tempMap[newKey] = addMsg
            console.log(JSON.parse(JSON.stringify(tempMap)))
            this.messageResponse = tempMap
            this.messageResponseTempRemove(this.messageResponse)
        },
        messageListGet() {
            if(this.messageImage == null) {
                this.$toastr.warning("메세지 변환할 이미지를 첨부해주세요")
                return
            }
            const formdata = new FormData()
            formdata.append("image", this.messageImage)
            const nicknameParam = Object.values(this.nickNameMap).map(user => user.nickName);
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
                        for(let [seq, nickName] of Object.entries(this.nickNameMap)) {
                            if(value.sendUser == nickName.nickName) {
                                value.sendUserSeq = seq
                            }
                        }
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
        // 드래그 앤 드롭 핸들러
        handleDragStart(event, key, seq) {
            this.draggedMessage = { key: Number(key), seq: Number(seq) };

            // 말풍선을 드래그 이미지로 사용
            const target = event.currentTarget;
            const bubble = target.querySelector('p.from-me, p.from-them');

            if (bubble) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setDragImage(bubble, bubble.offsetWidth / 2, bubble.offsetHeight / 2);
            }
        },
        handleDragOver(event, key, seq) {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
            this.dragOverMessage = { key: Number(key), seq: Number(seq) };
        },
        handleDrop(event, targetKey, targetSeq) {
            event.preventDefault();
            event.stopPropagation();

            if (!this.draggedMessage) return;

            const sourceKey = this.draggedMessage.key;
            const sourceSeq = this.draggedMessage.seq;
            targetKey = Number(targetKey);
            targetSeq = Number(targetSeq);

            // 같은 메시지면 아무것도 안 함
            if (sourceKey === targetKey && sourceSeq === targetSeq) {
                this.draggedMessage = null;
                this.dragOverMessage = null;
                return;
            }

            // 전체 메시지 리스트를 flat하게 만들기
            const flatMessages = [];
            const sortedKeys = Object.keys(this.messageResponse).sort((a, b) => Number(a) - Number(b));

            let sourceIndex = -1;
            let targetIndex = -1;
            let currentIndex = 0;

            sortedKeys.forEach(k => {
                const block = this.messageResponse[k];
                if (block && block.message) {
                    block.message.forEach(msg => {
                        // sourceIndex와 targetIndex 찾기
                        if (Number(k) === sourceKey && msg.seq === sourceSeq) {
                            sourceIndex = currentIndex;
                        }
                        if (Number(k) === targetKey && msg.seq === targetSeq) {
                            targetIndex = currentIndex;
                        }

                        flatMessages.push({
                            blockInfo: {
                                sendUser: block.sendUser,
                                myMessage: block.myMessage,
                                sendDate: block.sendDate
                            },
                            msg: msg
                        });
                        currentIndex++;
                    });
                }
            });

            if (sourceIndex === -1 || targetIndex === -1) {
                this.draggedMessage = null;
                this.dragOverMessage = null;
                return;
            }

            // flatMessages 배열에서 순서 변경
            const [movedItem] = flatMessages.splice(sourceIndex, 1);
            flatMessages.splice(targetIndex, 0, movedItem);

            // rebuildMessageResponseFromFlat을 사용하여 messageResponse 재구성
            this.messageResponse = this.rebuildMessageResponseFromFlat(flatMessages);

            this.draggedMessage = null;
            this.dragOverMessage = null;
        },
        handleDragEnd() {
            this.draggedMessage = null;
            this.dragOverMessage = null;
        },
        // 헬퍼 메서드: 현재 메시지를 flat 리스트로 반환
        getFlatMessages() {
            const result = [];
            const sortedKeys = Object.keys(this.messageResponse).sort((a, b) => Number(a) - Number(b));

            sortedKeys.forEach(key => {
                const block = this.messageResponse[key];
                if (block && block.message) {
                    block.message.forEach(msg => {
                        result.push({
                            key: Number(key),
                            seq: msg.seq,
                            blockInfo: {
                                sendUser: block.sendUser,
                                myMessage: block.myMessage,
                                sendDate: block.sendDate
                            },
                            msg: msg
                        });
                    });
                }
            });

            return result;
        },
        // rebuildMessageResponseFromFlat 메서드
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
        // 호버 핸들러
        setHoverAction(type, key, seq) {
            this.hoveredAction = { type, key, seq };
        },
        clearHoverAction() {
            this.hoveredAction = { type: null, key: null, seq: null };
        },
        isMessageHighlighted(key, seq, highlightType) {
            return this.hoveredAction.type === highlightType &&
                   this.hoveredAction.key === key &&
                   this.hoveredAction.seq === seq;
        },
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
.card-body {
    margin-bottom: 10px;
}

.verification-group {
  display: flex;
  gap: 10px;
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

/* 드래그 앤 드롭 시각 효과 */
.message-container-me,
.message-container {
  cursor: move;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
}

/* 드래그 중인 메시지 */
.message-container-me.dragging,
.message-container.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  cursor: grabbing;
}

/* 드래그 중일 때 자식 요소들이 이벤트를 받지 않도록 */
.message-container-me.dragging *,
.message-container.dragging * {
  pointer-events: none;
}

/* 드래그 오버 시에도 자식 요소들이 이벤트를 받지 않도록 */
.message-container-me.drag-over *,
.message-container.drag-over * {
  pointer-events: none;
}

/* 드래그 오버 중인 메시지 (드롭 대상) */
.message-container-me.drag-over,
.message-container.drag-over {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.5) !important;
  background-color: rgba(13, 110, 253, 0.05) !important;
  border-radius: 8px;
}

/* 드래그 오버 중인 메시지의 말풍선 */
.message-container-me.drag-over p,
.message-container.drag-over p {
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3) !important;
}

/* 드래그 중 커서 변경 */
.message-container-me[draggable="true"]:active,
.message-container[draggable="true"]:active {
  cursor: grabbing;
}

/* 호버 시각 효과 - 메시지 삭제 */
.message-hover-delete {
    opacity: 0.3 !important;
    transition: all 0.3s ease !important;
    position: relative !important;
}

.message-hover-delete::after {
    content: '🗑️ 삭제됨';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(220, 53, 69, 0.95);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    pointer-events: none !important;
}

/* 호버 시각 효과 - 메시지 수정 */
.message-hover-edit {
    position: relative !important;
    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.4) !important;
}

.message-hover-edit::before {
    content: '✏️ 수정 가능';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(13, 110, 253, 0.95);
    color: white;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none !important;
}

/* 호버 시각 효과 - 위로 이동 */
.message-hover-move-up {
    position: relative !important;
    box-shadow: 0 4px 15px rgba(25, 135, 84, 0.4) !important;
    z-index: 5 !important;
}

.message-hover-move-up p {
    animation: move-up-preview 0.6s ease-in-out infinite !important;
}

.message-hover-move-up::before {
    content: '⬆️ 위로';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(25, 135, 84, 0.95);
    color: white;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none !important;
}

@keyframes move-up-preview {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* 호버 시각 효과 - 아래로 이동 */
.message-hover-move-down {
    position: relative !important;
    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.4) !important;
    z-index: 5 !important;
}

.message-hover-move-down p {
    animation: move-down-preview 0.6s ease-in-out infinite !important;
}

.message-hover-move-down::after {
    content: '⬇️ 아래로';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 193, 7, 0.95);
    color: white;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none !important;
}

@keyframes move-down-preview {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(10px); }
}

/* 호버 시각 효과 - 메시지 추가 */
.message-hover-add::after {
    content: '➕ 새 메시지';
    position: absolute;
    top: calc(100% + 3px);
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 10px;
    background: rgba(108, 117, 125, 0.9);
    border-radius: 4px;
    color: white;
    font-size: 11px;
    font-weight: bold;
    animation: arrow-point 1s ease-in-out infinite;
    pointer-events: none !important;
}

@keyframes arrow-point {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(3px); }
}

/* 호버 시각 효과 - 이미지 추가 */
.message-hover-camera::after {
    content: '➕ 이미지';
    position: absolute;
    top: calc(100% + 3px);
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 10px;
    background: rgba(108, 117, 125, 0.9);
    border-radius: 4px;
    color: white;
    font-size: 11px;
    font-weight: bold;
    animation: arrow-point 1s ease-in-out infinite;
    pointer-events: none !important;
}

/* 호버 시각 효과 - 메시지 전환 */
.message-hover-switch {
    position: relative !important;
}

.message-hover-switch::before {
    content: '↔️ 반대편으로';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(111, 66, 193, 0.95);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 10;
    animation: switch-preview 0.8s ease-in-out infinite;
    pointer-events: none !important;
}

.message-hover-switch p {
    animation: switch-slide 0.8s ease-in-out infinite !important;
}

@keyframes switch-slide {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-10px); }
}

/* 호버 시각 효과 - 답장 연결 */
.message-hover-reply {
    position: relative !important;
    box-shadow: 0 4px 15px rgba(111, 66, 193, 0.4) !important;
}

.message-hover-reply::before {
    content: '🔗 답장 모드';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(111, 66, 193, 0.95);
    color: white;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none !important;
}

.message-hover-reply::after {
    content: '다른 메시지를 선택하세요';
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(111, 66, 193, 0.85);
    color: white;
    padding: 3px 10px;
    border-radius: 5px;
    font-size: 10px;
    font-weight: normal;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none !important;
}
</style>