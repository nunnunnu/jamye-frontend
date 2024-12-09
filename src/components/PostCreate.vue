<template>
    <div class="b-container">
        <br><br><br>
        <h1 class="modal-title fs-5" id="jamye-create1">{{ groupName }}가챠 잼얘 넣기 - 게시글 타입</h1>
        <div class="form-group">
            <input type="text" class="form-control" name="post-title" id="post-title" v-model="postTitle" placeholder="게시글 제목">
        </div>
        <button type="button" class="btn btn-dark mb-3 btn-imgbox" data-bs-toggle="modal" data-bs-target="#imageModal">이미지 보관함</button>
        <image-box :type="'POST'" :imageUidMap = "this.imageMap" @imageMap="handleImageMapUpdate" @messageImage="messageUpdate"></image-box>
        <div class="post-continer">
            <textarea
            v-model="postContent"
            ref="postArea"
            class="post-input"
            placeholder="게시글 내용을 입력하세요..."
            @input="rememberCursorPosition"
        ></textarea>
        </div>
    </div>
</template>
<script>
import ImageBox from './ImageBox.vue';

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
    // 현재 커서 위치 저장
    rememberCursorPosition() {
      const textarea = this.$refs.postArea;
      this.cursorPosition = textarea.selectionStart;
    },
    // 이미지 태그를 커서 위치에 삽입
    addImageAtCursor() {
      const textarea = this.$refs.postArea;
      const beforeCursor = this.postContent.slice(0, this.cursorPosition);
      const afterCursor = this.postContent.slice(this.cursorPosition);

      // 이미지 태그 삽입
      this.postContent = `${beforeCursor}<img src="example.jpg" alt="image" />${afterCursor}`;

      // 커서 위치를 업데이트 (이미지 태그 이후로 이동)
      this.cursorPosition += `<img src="example.jpg" alt="image" />`.length;

      // 커서 위치 갱신
      this.$nextTick(() => {
        textarea.setSelectionRange(this.cursorPosition, this.cursorPosition);
        textarea.focus();
      });
    },
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
  height: 1000px;
  margin: 0 auto;
}

.post-input {
  width: 100%;
  height: 1000px;
  max-height: 300px;
  resize: none;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
}
</style>