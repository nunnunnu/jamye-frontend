<template>
    <div class="b-container">
        <h1 class="title" id="jamye-create1">{{ groupName }}가챠 잼얘 넣기 - 게시글 타입</h1>
        <div class="form-group">
            <input type="text" class="form-control" name="post-title" id="post-title" v-model="postTitle" placeholder="게시글 제목">
        </div>
        <div class="btn-post">
            <button type="button" class="btn btn-dark btn-imgbox btn-area" id="image-box-btn" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
            <button @click="toggleInput" class="btn btn-dark btn-area tag-btn-area">
                {{ isInputVisible ? "입력완료" : "태그 추가" }}
            </button>
        </div>
        <image-box :type="'POST'" :cursorPosition= "this.cursorPosition" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @addImageAtCursor="addImageAtCursor" @imageUploaded="onImageUploaded" @modalOpened="onModalOpened"></image-box>
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
                <button class="btn btn-dark tag-add-btn" @click="addTextTag">추가</button>
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
        <div class="post-container" id="post-content-area">
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
        <button class="btn btn-dark btn-block" @click="createPost()">생성</button>

        <!-- 이미지 보기 컴포넌트 -->
        <ImagePreviewOpen 
            v-if="showImagePreview" 
            :imageUrlLink="previewImageUrl" 
            @closePreview="closeImagePreview"
        />

        <!-- VueTour 컴포넌트 -->
        <v-tour name="postTutorial" :steps="steps" :options="tourOptions" :callbacks="tourCallbacks"></v-tour>
    </div>
</template>

<script>
import ImageBox from './ImageBox.vue';
import ImagePreviewOpen from '../ImagePreviewOpen.vue';
import axios from '@/js/axios';
import { base64ToFile } from '@/js/fileScripts';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
    components: {
        ImageBox,
        QuillEditor,
        ImagePreviewOpen
    },
    data() {
        return {
            groupName: null,
            isPreviewOpen: false,
            previewImage: null,
            imageMap: {},
            cursorPosition: null,
            showImagePreview: false,
            previewImageUrl: null,
            postContent: '',
            postTitle: '',
            isInputVisible: false,
            searchTerm: "",
            searchResults: [],
            selectedTags: [],
            hoverIndex: -1,
            groupSeq: null,
            tutorialState: 0, // 튜토리얼 상태 관리용
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
            },
            steps: [
                {
                    target: '#post-title',
                    content: '게시글의 제목을 입력해주세요',
                    params: {
                        placement: 'bottom'
                    }
                },
                {
                    target: '#post-content-area',
                    content: '게시글의 내용을 입력해주세요',
                    params: {
                        placement: 'top'
                    }
                },
                {
                    target: '#image-box-btn',
                    content: '이미지를 첨부하고 싶다면 첨부하고 싶은 위치에서 이미지보관함을 클릭해주세요',
                    params: {
                        placement: 'bottom'
                    },
                    before: () => {
                        // 모달이 열릴 때 자동으로 이미지 업로드 스텝으로 진행되도록 이벤트 리스너 추가
                        const modal = document.getElementById('imageModal');
                        if (modal) {
                            const handleModalShow = () => {
                                this.$nextTick(() => {
                                    // 단순히 다음 스텝으로만 이동
                                    this.$tours['postTutorial'].nextStep();
                                });
                                modal.removeEventListener('shown.bs.modal', handleModalShow);
                            };
                            modal.addEventListener('shown.bs.modal', handleModalShow);
                        }
                    }
                },
                {
                    target: '#imageUploadInput',
                    content: '게시글에 업로드할 이미지를 모두 선택해서 업로드해주세요',
                    params: {
                        placement: 'bottom'
                    },
                    before: () => {
                        // 모달이 열려있지 않다면 열기
                        const modal = document.getElementById('imageModal');
                        if (modal && !modal.classList.contains('show')) {
                            // Bootstrap 5 방식으로 모달 열기
                            modal.click();
                        }
                    }
                },
                {
                    target: '#imagePreviewContainer',
                    content: '게시글에 첨부하고 싶은 이미지를 *모두* 선택해주세요.',
                    params: {
                        placement: 'top'
                    },
                    before: () => {
                        // 이미지가 업로드되었는지 확인
                        const imageContainer = document.getElementById('imagePreviewContainer');
                        const hasImages = imageContainer && imageContainer.children.length > 0;
                        
                        if (!hasImages) {
                            // 이미지가 없으면 이전 스텝으로 돌아가기
                            setTimeout(() => {
                                this.$tours['postTutorial'].previousStep();
                            }, 100);
                            return false;
                        }
                    }
                },
                {
                    target: '#imageModal .btn-primary',
                    content: '삽입 버튼을 눌러 삽입해주세요. 삽입버튼이 없다면 게시글 내용의 원하는 위치를 다시 선택해주세요(창을 닫아도 업로드한 이미지는 유지됩니다)',
                    params: {
                        placement: 'top'
                    }
                },
                {
                    target: '.tag-btn-area',
                    content: '게시글에 태그를 달려면 태그추가 버튼을 선택해주세요. 클릭하면 태그 입력 필드가 나타나고, 그룹에서 이미 사용중인 태그는 목록으로 표시됩니다.',
                    params: {
                        placement: 'bottom'
                    },
                    before: () => {
                        // 태그 입력 필드가 보이지 않으면 태그 추가 버튼을 클릭
                        const tagInput = document.getElementById('tagInput');
                        if (!tagInput || !tagInput.offsetParent) {
                            const tagBtn = document.querySelector('.tag-btn-area');
                            if (tagBtn) {
                                tagBtn.click();
                            }
                        }
                        // 태그 입력 필드에 포커스
                        setTimeout(() => {
                            const tagInput = document.getElementById('tagInput');
                            if (tagInput) {
                                tagInput.focus();
                            }
                        }, 100);
                    }
                },
                {
                    target: '.tag-add-btn',
                    content: '모든 태그를 추가했다면 입력완료 버튼을 눌러 마무리를 지어주세요',
                    params: {
                        placement: 'bottom'
                    }
                },
                {
                    target: '.btn-block',
                    content: '이제 게시글을 생성해볼까요?',
                    params: {
                        placement: 'top'
                    }
                }
            ],
            tourOptions: {
                useKeyboardNavigation: false,
                labels: {
                    buttonSkip: '건너뛰기',
                    buttonPrevious: '이전',
                    buttonNext: '다음',
                    buttonStop: '완료'
                }
            },
            tourCallbacks: {
                onNextStep: (step) => {
                    // 이미지보관함 버튼 스텝(2번째 스텝)에서 다음을 누르면 모달 열기
                    if (step === 2) {
                        // 먼저 모달 열기
                        const modal = document.getElementById('imageModal');
                        if (modal && !modal.classList.contains('show')) {
                            modal.classList.add('show');
                            modal.style.display = 'block';
                            document.body.classList.add('modal-open');
                            
                            // 백드롭 추가
                            const backdrop = document.createElement('div');
                            backdrop.className = 'modal-backdrop fade show';
                            document.body.appendChild(backdrop);
                        }
                        
                        // 모달이 열린 후 튜토리얼을 이미지 업로드 스텝으로 이동
                        setTimeout(() => {
                            // 단순히 다음 스텝으로만 이동
                            this.$tours['postTutorial'].nextStep();
                        }, 500);
                    }
                    // 삽입 버튼 스텝(4번째 스텝)에서 다음을 누르면 모달 닫기
                    else if (step === 5) {
                        setTimeout(() => {
                            this.closeImageModal();
                        }, 300);
                    }
                },
                onStop: () => {
                    // 튜토리얼 종료 시 모달 닫기
                    this.closeImageModal();
                },
                onSkip: () => {
                    // 튜토리얼 건너뛰기 시 모달 닫기
                    this.closeImageModal();
                }
            }
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
        this.groupSeq = localStorage.getItem("groupSeq")
        
        // tutorialState 확인 (예시로 localStorage에서 가져온다고 가정)
        this.tutorialState = parseInt(localStorage.getItem("tutorialState")) || 0;
        
        if(!this.isLogin) {
            this.$toastr.warning("로그인 후 게시글 작성이 가능합니다.")
            this.$router.push("/login")
        } else if(this.groupSeq == null) {
            this.$toastr.warning("게시글을 작성할 그룹을 먼저 선택해주세요")
            this.$router.push("/")
        } else {
            axios.get("/api/group/name/" + this.groupSeq, {
              headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
          }).then(r => {
            this.groupName = r.data.data.name
          })
        }
    },
    mounted() {
        // tutorialState가 3이면 튜토리얼 시작
        if (this.tutorialState === 3) {
            this.$nextTick(() => {
                this.$tours['postTutorial'].start();
            });
        }
        
        // 에디터가 준비된 후 이미지 클릭 이벤트 설정
        this.$nextTick(() => {
            this.setupImageClickHandler();
        });
    },
    methods: {
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

                // 현재 커서 위치 가져오기 - null 체크 강화
                let range = quill.getSelection();
                if (!range && this.cursorPosition) {
                    range = this.cursorPosition;
                }
                if (!range || range.index === null || range.index === undefined) {
                    // 커서 위치가 없으면 에디터 끝에 삽입
                    range = { index: quill.getLength(), length: 0 };
                }

                // 모든 이미지를 한 번에 삽입하기 위해 Delta 형식으로 준비
                const insertIndex = range.index;
                let insertDelta = quill.getContents(insertIndex, 1);
                
                selectedImages.forEach((img, index) => {
                    const imgUrl = this.imageMap[img];
                    
                    // 이미지 삽입
                    quill.insertEmbed(insertIndex + index, 'image', imgUrl);
                });

                // 마지막 이미지 다음으로 커서 이동
                const finalPosition = insertIndex + selectedImages.length;
                
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
        createPost() {
            if(!this.postTitle || this.postTitle.trim() === '') {
                this.$toastr.warning("게시글 제목을 입력해주세요")
                const title = document.getElementById("post-title")          
                if(title) {
                    title.scrollIntoView({ behavior: "smooth", block: "start" })
                }  
                return
            }
            
            if (!this.postContent || this.postContent.trim() === '' || this.postContent === '<p><br></p>') {
                this.$toastr.warning("게시글 내용을 입력해주세요")
                return;
            }

            const formdata = new FormData()
            Object.entries(this.imageMap).forEach(([key, value]) => {
                if (value instanceof File) {
                    formdata.append(key, value);
                } else {
                    formdata.append(key, base64ToFile(value));
                }
            });

            // HTML 내용에서 이미지 src를 랜덤 문자열로 교체
            var content = this.postContent.replace(/<img([^>]+)src="([^"]+)"([^>]*)>/g, (match, before, src, after) => {
                const imageId = Object.keys(this.imageMap).find(key => this.imageMap[key] === src);
                if (imageId) {
                    return `<br><img${before}src="${imageId}"${after} alt="image" width="400" height="auto"/>`;
                }
                return match;
            });

            const data = {
                title: this.postTitle,
                groupSeq: this.groupSeq,
                content: {
                    content: content
                },
                tags: this.selectedTags
            };

            formdata.append('data', JSON.stringify(data));

            axios.post("/api/post/board", formdata, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            }).then((r) => {
                // 먼저 생성한 게시글 페이지로 이동
                this.$router.push({ 
                    name: 'boardJamye',
                    params: { postSeq: r.data.data },
                    query: { groupSeq: this.groupSeq }
                })
            })
        },
        handleImageMapUpdate(imageUidMap) {
            this.imageMap = imageUidMap
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
        setupImageClickHandler() {
            const quill = this.getQuillInstance();
            if (!quill) return;
            
            // 에디터 내의 이미지 클릭 이벤트 설정
            const editor = quill.root;
            editor.addEventListener('click', (e) => {
                if (e.target.tagName === 'IMG') {
                    e.preventDefault();
                    console.log('이미지 클릭됨:', e.target.src);
                    this.openImagePreview(e.target.src);
                }
            });
        },
        openImagePreview(imageUrl) {
            // base64 데이터인지 확인
            if (imageUrl.startsWith('data:image')) {
                this.previewImageUrl = imageUrl;
            } else {
                // 일반 URL인 경우
                this.previewImageUrl = imageUrl;
            }
            this.showImagePreview = true;
        },
        closeImagePreview() {
            this.showImagePreview = false;
            this.previewImageUrl = null;
        },
        closeImageModal() {
            const modal = document.getElementById('imageModal');
            if (modal && modal.classList.contains('show')) {
                modal.classList.remove('show');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                
                // 백드롭 제거
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
            }
        },
        onImageUploaded() {
            // 이미지 업로드 후 튜토리얼 다음 스텝으로 진행
            if (this.$tours && this.$tours['postTutorial']) {
                this.$nextTick(() => {
                    this.$tours['postTutorial'].nextStep();
                });
            }
        },
        onModalOpened() {
            // 모달이 열릴 때 튜토리얼을 이미지 업로드 스텝으로 진행
            if (this.$tours && this.$tours['postTutorial']) {
                this.$nextTick(() => {
                    // 튜토리얼이 실행 중이면 다음 스텝으로, 아니면 이미지 업로드 스텝으로 이동
                    if (this.$tours['postTutorial'].isRunning) {
                        this.$tours['postTutorial'].nextStep();
                    } else {
                        // 튜토리얼이 실행 중이 아니면 이미지 업로드 스텝으로 직접 이동
                        this.$tours['postTutorial'].start();
                        setTimeout(() => {
                            // 3번째 스텝까지 순차적으로 진행
                            for (let i = 0; i < 3; i++) {
                                this.$tours['postTutorial'].nextStep();
                            }
                        }, 100);
                    }
                });
            }
        }
    }
}
</script>

<style>
@import url("/src/css/tag.css");

.btn-post {
    margin-top: 5px;
}

.post-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 20px;
}

/* Quill 에디터 커스텀 스타일 */
.ql-editor {
    min-height: 300px;
    font-size: 16px;
}

.ql-toolbar {
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
}

.ql-container {
    border-bottom: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    max-height: 300px;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
    .ql-toolbar {
        padding: 8px;
    }
    
    .ql-toolbar .ql-formats {
        margin-right: 8px;
    }
}

/* 에디터 내 이미지 호버 효과 */
.ql-editor img {
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.ql-editor img:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border: 2px solid #007bff;
}

/* 이미지 보기 오버레이 스타일 */
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
    z-index: 9999;
    cursor: pointer;
    padding: 20px;
}

.image-preview-container {
    max-width: 100%;
    max-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}
</style>