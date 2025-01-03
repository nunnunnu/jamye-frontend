<template>
    <div class="b-container">
        <h1 class="title">{{ board.title }}</h1>
        <div class="create-user">작성자: {{ board.createdUserNickName }}</div>
        <div class="editModeOpen" v-if="!isEditing && board.createdUserSequence == $cookies.get('sequence')">
            <button @click="editMode" class="btn btn-dark">수정하기</button>
        </div>
        <div v-else-if="isEditing && board.createdUserSequence == $cookies.get('sequence')">
            <button type="button" class="btn btn-dark mb-3 btn-imgbox" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
        <image-box :type="'POST'" :cursorPosition= "this.cursorPosition" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @addImageAtCursor="addImageAtCursor"></image-box>
            <button @click="editModeComplate" class="btn btn-dark">수정완료</button>
        </div>
        <div v-if="!isEditing" v-html="content"></div>
        <div v-else class="post-container">
            <div
            id = "content"
            class="post-input"
            contenteditable="true"
            ref="postArea"
            @input="syncPostContent"
            placeholder="게시글 내용을 입력하세요..."
            ></div>
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
            content: "",
            cursorPosition: null,
            postContent: String
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
            this.isEditing = true
            this.$nextTick(() => {
            // DOM이 렌더링된 이후 실행
                this.$refs.postArea.innerHTML = this.content;
            });
        },
        editModeComplate() {
            this.isEditing = false

            const formdata = new FormData()
            Object.entries(this.imageMap).forEach(([key, value]) => {
                if (value instanceof File) {
                    formdata.append(key, value);
                } else {
                    formdata.append(key, base64ToFile(value));
                }
            });
            var tempContent = this.postContent.replace(/<img([^>]+)src="([^"]+)"([^>]*)>/g, (match, before, src, after) => {
                const imageId = Object.keys(this.imageMap).find(key => this.imageMap[key] === src);
                if (imageId) {
                    return `<img${before}src="${imageId}"${after}>`;
                }
                return match;
            });
            const groupSeq = this.$cookies.get("group").groupSequence;
            const data = {
                content: tempContent
            }

            formdata.append('data', JSON.stringify(data));
            axios.post(`/api/post/board/${groupSeq}/${this.postSeq}`, formdata,
                {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
                }
            ).then(r => {
                this.content = r.data.data
            })
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
        syncPostContent() {
            // contenteditable 내용 동기화
            this.postContent = this.$refs.postArea.innerHTML
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
            // 현재 커서 위치 저장
            this.cursorPosition = selection.getRangeAt(0);
            }
        },
        handleImageMapUpdate(imageUidMap) {
            this.imageMap = imageUidMap
        },
        addImageAtCursor(selectedImages) {
            selectedImages.forEach(img => {
                const imgUrl = this.imageMap[img];

                const imgTag = `<br><img src="${imgUrl}" alt="image" width="200" height="auto"/>`;
                
                document.execCommand("insertHTML", false, imgTag);
            });

            this.postContent = this.$refs.postArea.innerHTML;
            this.moveCursorToEnd()
        },
        moveCursorToEnd() {
            const textarea = this.$refs.postArea;

            const selection = window.getSelection();
            const range = document.createRange();

            // 커서를 맨 뒤로 이동
            range.selectNodeContents(textarea);
            range.collapse(false); // false는 끝으로, true는 시작으로

            // 선택 범위 삭제 후 새 범위를 추가
            selection.removeAllRanges();
            selection.addRange(range);

            textarea.focus();
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