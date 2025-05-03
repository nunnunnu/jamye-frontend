<template>
    <div class="b-container">
        <div v-if="isEditing">
            <input class="title" type="text" v-model="board.title" style="width: 100%;">
        </div>
        <div v-else>
            <h1 class="title">{{ board.title }}</h1>
        </div>
        <div class="create-user">작성자: {{ board.createdUserNickName }}</div>
        <div class="editModeOpen" v-if="!isEditing && board.createdUserSequence == $cookies.get('sequence')">
            <button @click="editMode" class="btn btn-dark btn-area">수정</button>
            <button @click="deletePost" class="btn btn-dark btn-area">삭제</button>
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
        <div v-else-if="isEditing && board.createdUserSequence == $cookies.get('sequence')">
            <button type="button" class="btn btn-dark btn-area" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
            <image-box :type="'POST'" :cursorPosition= "this.cursorPosition" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @addImageAtCursor="addImageAtCursor"></image-box>
            <button @click="toggleInput" class="btn btn-dark btn-area">
                {{ isInputVisible ? "입력완료" : "태그 추가" }}
            </button>
            <button @click="editModeComplate" class="btn btn-dark btn-area">수정완료</button>
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
        <div v-if="!isEditing" v-html="content" class="post-container-view"></div>
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
        <comment-list v-if="board.postSequence != null" class="comment" :postSeq= "postSeq" :groupSeq="groupSeq"></comment-list>
    </div>    
</template>
<script>
import axios from '@/js/axios';
import ImageBox from './ImageBox.vue';
import CommentList from './CommentList.vue'
import { base64ToFile } from '@/js/fileScripts';

export default {
    components: {
        ImageBox,
        CommentList
    },
    data() {
        return {
            board: {},
            isEditing: false,
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
            postContent: String,
            tags: [],
            hoverIndex: -1,
            deleteTagSeqs: new Set,
            isInputVisible: false,
            searchTerm: "",
            searchResults: [],
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
            axios.get(`/api/post/${this.groupSeq}/${this.postSeq}`, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                this.board = r.data.data
                this.content = r.data.data.content.content
                this.postContent = this.content
                this.tags = r.data.data.tags
            }).catch(() => {
                this.$toastr.error("잘못된 게시글 번호입니다.")
                this.$router.push("/jamye-list")
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
            const data = {
                title: this.board.title,
                content: tempContent,
                tagDisconnected: Array.from(this.deleteTagSeqs),
                tags: this.tags.filter(it => it.tagPostConnectionSeq == null)

            }

            formdata.append('data', JSON.stringify(data));
            axios.post(`/api/post/board/${this.groupSeq}/${this.postSeq}`, formdata,
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
        },
        deletePost() {
            axios.delete(`/api/post/${this.groupSeq}/${this.postSeq}`, {
              headers: {
                Authorization: `Bearer ${this.$cookies.get('accessToken')}`
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
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
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
.post-container-view {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 10px;
    height: 400px;
}
.post-container {
    margin-top: 10px;
    max-height: 500px;
    max-height: 400px;
    overflow-y: auto;
}
.comment {
    margin-top: 10px;
}
.input-group  {
    margin-top: 10px;
}
</style>