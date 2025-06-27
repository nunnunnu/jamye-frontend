<template>
    <div class="b-container">
        <h1 class="title" id="jamye-create1">{{ groupName }}가챠 잼얘 넣기 - 게시글 타입</h1>
        <div class="form-group">
            <input type="text" class="form-control" name="post-title" id="post-title" v-model="postTitle" placeholder="게시글 제목">
        </div>
        <div class="btn-post">
            <button type="button" class="btn btn-dark btn-imgbox btn-area" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
            <button @click="toggleInput" class="btn btn-dark btn-area">
                {{ isInputVisible ? "입력완료" : "태그 추가" }}
            </button>
        </div>
        <image-box :type="'POST'" :cursorPosition= "this.cursorPosition" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @addImageAtCursor="addImageAtCursor"></image-box>
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
        <div class="post-container">
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
    </div>
</template>

<script>
import ImageBox from './ImageBox.vue';
import axios from '@/js/axios';
import { base64ToFile } from '@/js/fileScripts';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

export default {
    components: {
        ImageBox,
        QuillEditor
    },
    data() {
        return {
            groupName: null,
            isPreviewOpen: false,
            previewImage: null,
            imageMap: {},
            cursorPosition: null,
            postContent: '',
            postTitle: '',
            isInputVisible: false,
            searchTerm: "",
            searchResults: [],
            selectedTags: [],
            hoverIndex: -1,
            groupSeq: null,
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
        seq: Number,
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        this.groupSeq = this.$cookies.get("groupSeq")
        if(!this.isLogin) {
            this.$toastr.warning("로그인 후 게시글 작성이 가능합니다.")
            this.$router.push("/login")
        } else if(this.groupSeq == null) {
            this.$toastr.warning("게시글을 작성할 그룹을 먼저 선택해주세요")
            this.$router.push("/")
        } else {
            axios.get("/api/group/name/" + this.groupSeq, {
              headers: {
              Authorization: `Bearer ${this.$cookies.get('accessToken')}`
              }
          }).then(r => {
            this.groupName = r.data.data.name
          })
        }
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
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            }).then((r) => {
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
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
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
</style>