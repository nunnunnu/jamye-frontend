<template>
    <div class="b-container">
        <!-- 게시글 생성 완료 메시지 -->
        <div v-if="showPostCreatedMessage" class="post-created-message">
            <div class="message-box">
                <h4>🎉 게시글 잼얘가 생성되었어요!</h4>
                <p>이제 메시지 잼얘를 넣어볼까요?</p>
                <div class="message-buttons">
                    <button type="button" class="btn btn-outline-secondary" @click="skipToHome">Skip</button>
                    <button type="button" class="btn btn-primary" @click="goToHome">메시지 잼얘 생성하기</button>
                </div>
            </div>
        </div>
        
        <div v-if="isEditing">
            <input class="title" type="text" v-model="board.title" style="width: 100%;">
        </div>
        <div v-else>
            <h1 class="title">{{ board.title }}</h1>
        </div>
        <div class="create-user">작성자: {{ board.createdUserNickName }}</div>
        <div class="editModeOpen" v-if="!isEditing && board.createdUserSequence == userSeq">
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
        <div v-else-if="isEditing && board.createdUserSequence == userSeq">
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
    <div>
        <div v-if="!isEditing" v-html="content" class="post-container-view"></div>
        <div v-else class="post-container">
            <QuillEditor
                ref="quillEditor"
                v-model:content="postContent"
                content-type="html"
                :options="editorOptions"
                @textChange="onEditorChange"
                @selectionChange="onSelectionChange"
                style="height: 400px;"
            />
        </div>
    </div>
        <comment-list v-if="board.postSequence != null" class="comment" :postSeq= "postSeq" :groupSeq="groupSeq"></comment-list>
    </div>    
</template>
<script>
import axios from '@/js/axios';
import ImageBox from './ImageBox.vue';
import CommentList from './CommentList.vue'
import { base64ToFile } from '@/js/fileScripts';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
    components: {
        ImageBox,
        CommentList,
        QuillEditor
    },
    data() {
        return {
            board: {},
            userSeq: null,
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
            showPostCreatedMessage: false,
            editorOptions: {
                theme: 'snow',
                placeholder: '게시글 내용을 입력하세요...',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ 'header': 1 }, { 'header': 2 }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }],
                        [{ 'align': [] }],
                        ['clean']
                    ]
                }
            }
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
            this.sequence = localStorage.getItem('sequence');
            
            // tutorialState가 3이면 게시글 생성 완료 메시지 표시
            const tutorialState = localStorage.getItem('tutorialState');
            if (tutorialState === '3') {
                this.showPostCreatedMessage = true;
            }
            
            axios.get(`/api/post/${this.groupSeq}/${this.postSeq}`, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
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
            this.userSeq = localStorage.getItem('sequence');
        }
    },
    methods: {
        editMode() {
            this.isEditing = true
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
                    return `<br><img${before}src="${imageId}"${after} alt="image" width="400" height="auto"/>`;
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
                        Authorization: `Bearer `+localStorage.getItem('accessToken')
                    }
                }
            ).then(r => {
                this.content = r.data.data
            })
        },
        onEditorChange() {
            // 에디터 내용이 변경될 때 호출
            this.saveCurrentSelection();
        },
        onSelectionChange(range) {
            // 커서 위치가 변경될 때 호출 - null 체크 추가
            if (range && range.index !== null && range.index !== undefined) {
                this.cursorPosition = range;
            }
        },
        saveCurrentSelection() {
            const quill = this.getQuillInstance();
            if (quill) {
                const selection = quill.getSelection();
                if (selection && selection.index !== null && selection.index !== undefined) {
                    this.cursorPosition = selection;
                }
            }
        },
        getQuillInstance() {
            return this.$refs.quillEditor?.getQuill?.();
        },
        addImageAtCursor(selectedImages) {
            // 에디터가 준비될 때까지 잠시 기다림
            this.$nextTick(() => {
                const quill = this.getQuillInstance();
                if (!quill) return;

                selectedImages.forEach((img, index) => {
                    const imgUrl = this.imageMap[img];
                    
                    // 현재 커서 위치 가져오기 - null 체크 강화
                    let range = quill.getSelection();
                    if (!range && this.cursorPosition) {
                        range = this.cursorPosition;
                    }
                    if (!range || range.index === null || range.index === undefined) {
                        range = { index: quill.getLength(), length: 0 };
                    }
                    
                    // 이미지 삽입 위치 계산 (여러 이미지일 경우 순차적으로 삽입)
                    const insertIndex = range.index + index;
                    
                    // 이미지 삽입
                    quill.insertEmbed(insertIndex, 'image', imgUrl);
                });

                // 마지막 이미지 다음으로 커서 이동
                const finalPosition = (quill.getSelection()?.index || quill.getLength()) + selectedImages.length;
                
                // 안전한 커서 설정
                setTimeout(() => {
                    try {
                        quill.setSelection(finalPosition, 0);
                        quill.focus();
                    } catch (error) {
                        console.warn('커서 설정 중 오류:', error);
                        quill.focus();
                    }
                }, 50);
            });
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
        handleImageMapUpdate(imageUidMap) {
            this.imageMap = imageUidMap
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
        goToHome() {
            // tutorialState를 다음 단계로 설정하고 메시지 잼얘 생성 페이지로 이동
            localStorage.setItem('tutorialState', '4');
            this.showPostCreatedMessage = false;
            this.$router.push('/');
        },
        skipToHome() {
            // tutorialState를 완료로 설정하고 메시지 숨기기
            localStorage.setItem('tutorialState', 'done');
            this.showPostCreatedMessage = false;
        }
    }
}
</script>
<style>
@import url("/src/css/message.css");

.menu-title {
    /* margin-top: 60px; */
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

.ql-align-center { text-align: center; }
.ql-align-right { text-align: right; }
.ql-align-justify { text-align: justify; }
.ql-indent-1 { padding-left: 3em; }
.ql-indent-2 { padding-left: 6em; }
.ql-font-serif {
    font-family: Georgia, serif;
}

.ql-font-monospace {
    font-family: "Courier New", Courier, monospace;
}

/* 인용구 */
blockquote {
    margin: 1em 0;
    padding-left: 1.2em;
    border-left: 4px solid #ccc;
    color: #666;
    font-style: italic;
    background-color: #f9f9f9;
    border-radius: 4px;
}

/* 코드블록 */
pre.ql-syntax {
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 12px;
    border-radius: 6px;
    font-family: 'Source Code Pro', monospace, monospace;
    font-size: 14px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
}

/* 게시글 생성 완료 메시지 스타일 */
.post-created-message {
    margin-top: 60px;
    padding: 0;
}

.message-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.message-box h4 {
    /* margin-bottom: 10px; */
    font-weight: bold;
}

.message-box p {
    /* margin-bottom: 15px; */
    opacity: 0.9;
}

.message-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.message-buttons .btn {
    min-width: 120px;
    font-weight: 500;
}

.message-buttons .btn-outline-secondary {
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
}

.message-buttons .btn-outline-secondary:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: white;
    color: white;
}

.message-buttons .btn-primary {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: white;
    color: white;
}

.message-buttons .btn-primary:hover {
    background-color: white;
    color: #667eea;
}
</style>