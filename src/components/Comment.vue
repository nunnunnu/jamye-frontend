<template>
    <div class="input-group mb-3">
        <span class="input-group-text">댓글</span>
        <textarea class="form-control" aria-label="With textarea" v-model="comment"></textarea>
        <button class="btn btn-outline-dark" type="button" id="button-addon1" @click="createComment">등록</button>
    </div>
    <div  v-if="comments.length != 0">
        <div class="comments" v-for="comment in comments" :key="comment.commentSeq">
            <div class="comment">
                <div class="comment-body">
                    <div class="comment-header">
                        <span class="comment-author">{{ comment.nickName }}</span>
                        <span class="comment-date">{{ comment.updateDate }}</span>
                        <div class="comment-actions" v-if="userSeq == comment.userSeq">
                            <button class="edit-btn" v-if="isEditingSeq == null || isEditingSeq != comment.commentSeq" title="수정" @click="editComment(comment.commentSeq)">&#9998;</button>
                            <button class="complete-btn" v-else @click="completeEdit(comment)">✔️</button>
                            <button class="delete-btn" title="삭제" @click="deleteComment(comment.commentSeq)">&#10006;</button>
                        </div>
                    </div>
                    <div v-if="isEditingSeq != null && isEditingSeq == comment.commentSeq">
                        <input class="comment-edit-input" v-model="comment.comment" ref="editInput">
                    </div>
                    <div class="comment-text" v-else>
                        {{ comment.comment }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        등록된 댓글이 없습니다
    </div>  
</template>

<script>
import axios from '@/js/axios'
export default {
    props: {
        postSeq: {
            type: Number,
            requeire: true
        }
    },
    data() {
        return {
            groupSeq: null,
            comments: {},
            comment: null,
            userSeq: null,
            isEditingSeq: null
        }
    },
    created() {
        this.userSeq = this.$cookies.get('sequence');
        var group = this.$cookies.get("group")
        if(group == null) {
            alert("그룹을 먼저 선택해주세요")
            this.$router.push("/")
            return
        }
        this.groupSeq = group.groupSequence
        this.getCommentList()
    },
    methods: {
        getCommentList() {
            axios.get(`/api/comment/${this.groupSeq}/${this.postSeq}`, {
              headers: {
                Authorization: `Bearer ${this.$cookies.get('accessToken')}`
              }
          }).then(r => {
                this.comments = r.data.data
          }) 
        },
        createComment() {
            if(this.comment == null || this.comment.trim() === '') {
                alert("댓글을 먼저 입력해주세요")
                return
            }
            axios.post(`/api/comment/${this.groupSeq}/${this.postSeq}`, {
                comment: this.comment
            }, {
              headers: {
                Authorization: `Bearer ${this.$cookies.get('accessToken')}`
              }
          }).then(() => {
            this.getCommentList()
            this.comment = null
          })
        }, 
        editComment(commentSeq) {
            this.isEditingSeq = commentSeq
            this.$nextTick(() => {
                if (Array.isArray(this.$refs.editInput)) {
                    this.$refs.editInput[0].focus();
                } else {
                    this.$refs.editInput.focus();
                }
            });

        }, 
        completeEdit(comment) {
            this.isEditingSeq = null
            axios.post(`/api/comment/${this.groupSeq}/${this.postSeq}/${comment.commentSeq}`, {
                comment: comment.comment
            }, {
              headers: {
                Authorization: `Bearer ${this.$cookies.get('accessToken')}`
              }
          })
        },
        deleteComment(commentSeq) {
            axios.delete(`/api/comment/${this.groupSeq}/${this.postSeq}/${commentSeq}`, {
              headers: {
                Authorization: `Bearer ${this.$cookies.get('accessToken')}`
              }
          }).then( () => {
            this.getCommentList()
          }) 
        }
    }
}
</script>

<style>
.comments {
  max-width: 800px;
  margin: 20px auto;
}

.comment {
  display: flex;
  padding: 5px 10px;
  outline: solid #d7d7d7;
  border-radius: 5px;
  overflow: hidden;
}

.comment:last-child {
  border-bottom: none;
}

.comment-avatar {
  flex-shrink: 0;
  margin-right: 15px;
}

.comment-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  margin-right: 10px;
  font-size: 1em;
}

.comment-date {
  color: #888;
  font-size: 0.9em;
  margin-left: 5px;
}

.comment-text {
  line-height: 1.5;
  margin-bottom: 10px;
  font-size: 1em;
}

.comment-actions {
  font-size: 0.9em;
}

.comment-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 8px;
  font-size: 1.2em;
}

.edit-btn, .delete-btn {
  color: #555;  
  margin-left: 5px
}

.edit-btn:hover, .delete-btn:hover {
  color: white; /* 마우스 오버 시 초록색 */
}
.comment-edit-input {
  border: none;
  outline: none;
  background-color: transparent;
  width: 100%;
  padding: 8px;
  font-size: 16px;
}

.comment-edit-input:focus {
  border-bottom: 1px solid #000000; /* 포커스 시 밑줄 효과 */
}


</style>