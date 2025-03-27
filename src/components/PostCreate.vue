<template>
    <div class="b-container">
        <h1 class="title" id="jamye-create1">{{ groupName }}가챠 잼얘 넣기 - 게시글 타입</h1>
        <div class="form-group">
            <input type="text" class="form-control" name="post-title" id="post-title" v-model="postTitle" placeholder="게시글 제목">
        </div>
        <button type="button" class="btn btn-dark mb-3 btn-imgbox" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
        <button @click="toggleInput" class="btn btn-dark">
            {{ isInputVisible ? "입력완료" : "태그 추가" }}
            </button>
        <image-box :type="'POST'" :cursorPosition= "this.cursorPosition" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @addImageAtCursor="addImageAtCursor"></image-box>
        <div class="hashtag-container">
            <div v-if="isInputVisible" class="input-container">
            <input
                v-model="searchTerm"
                @input="fetchHashtags"
                placeholder="태그를 입력하세요"
                class="tag-input"
            />
            <ul v-if="searchResults.length" class="search-results">
                <li v-for="(tag, index) in searchResults" :key="index" @click="addTag(tag)">
                #{{ tag }}
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
                # {{ tag }}
                <span v-if="hoverIndex === index" @click="removeTag(index)" class="remove-tag">×</span>
            </div>
            </div>
        </div>
        <div class="post-container">
            <div
            id = "content"
            class="post-input"
            contenteditable="true"
            ref="postArea"
            @input="syncPostContent"
            placeholder="게시글 내용을 입력하세요..."
            ></div>
        </div>
        <button class="btn btn-dark btn-block" @click="createPost()">생성</button>
    </div>
</template>
<script>
import ImageBox from './ImageBox.vue';
import axios from '@/js/axios';
import { base64ToFile } from '@/js/fileScripts'

export default {
    components: {
        ImageBox
    },
    data() {
        return {
            groupName: null,
            isPreviewOpen: false, // 미리보기 상태
            previewImage: null,   // 현재 미리보기 이미지.
            imageMap: {},
            cursorPosition: null,
            postContent: String,
            isInputVisible: false,
            searchTerm: "",
            searchResults: [],
            selectedTags: [],
            hoverIndex: -1
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
            this.$toastr.warning("게시글을 작성할 그룹을 먼저 선택해주세요")
            this.$router.push("/")
        } else {
            this.groupName = group.name
        }
    },
    methods: {
        syncPostContent() {
            // contenteditable 내용 동기화
            this.postContent = this.$refs.postArea.innerHTML
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
            // 현재 커서 위치 저장
            this.cursorPosition = selection.getRangeAt(0);
            }
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
        createPost() {
            if(this.postTitle == null) {
                this.$toastr.warning("게시글 제목을 입력해주세요")
                const title = document.getElementById("post-title")          
                if(title) {
                    title.scrollIntoView({ behavior: "smooth", block: "start" })
                }  
                return
            }
            if (this.postContent && this.postContent.toString() === String.toString()) {
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

            var content = this.postContent.replace(/<img([^>]+)src="([^"]+)"([^>]*)>/g, (match, before, src, after) => {
                const imageId = Object.keys(this.imageMap).find(key => this.imageMap[key] === src);
                if (imageId) {
                    return `<img${before}src="${imageId}"${after}>`;
                }
                return match;
            });
            const groupSeq = this.$cookies.get("group").groupSequence;
            const data = {
                title: this.postTitle,
                groupSeq: groupSeq,
                content: {
                    content: content
                }
            };

            formdata.append('data', JSON.stringify(data));

            axios.post("/api/post/board", formdata
                , {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
            }).then((r) => {
                this.$router.push("/jamye/board" + r.data.data)
            })
        },
        handleImageMapUpdate(imageUidMap) {
            this.imageMap = imageUidMap
        },
        toggleInput() {
            this.isInputVisible = !this.isInputVisible;
            if (!this.isInputVisible) {
                if(this.searchTerm.trim() && !this.selectedTags.includes(this.searchTerm)) {
                    this.selectedTags.push(this.searchTerm)
                }
                this.searchTerm = "";
                this.searchResults = [];
            }
        },
        async fetchHashtags() {
            if (!this.searchTerm.trim()) {
                this.searchResults = [];
                return;
            }

            const groupSeq = this.$cookies.get("group").groupSequence;
            axios.get(`/api/post/tag/${groupSeq}?keyword=${this.searchTerm}`, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            }).then(r => {
                this.searchResults = r.data.data
            })   
                
        },
        addTag(tag) {
            if (!this.selectedTags.includes(tag)) {
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
.btn-imgbox {
    margin-top: 5px;
}
.post-container {
  width: 100%;
  max-width: 600px;
  height: 900px;
  margin: 0 auto;
}

.post-input {
  width: 100%;
  height: 880px;
  resize: none;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}

.hashtag-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tag-button {
  padding: 8px 12px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.input-container {
  position: relative;
}
.tag-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search-results {
  list-style: none;
  padding: 0;
  margin: 0;
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
}
.search-results li {
  padding: 8px;
  cursor: pointer;
}
.search-results li:hover {
  background: #f1f1f1;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-item {
  background: #e0e0e0;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}
.remove-tag {
  cursor: pointer;
  font-weight: bold;
}
</style>