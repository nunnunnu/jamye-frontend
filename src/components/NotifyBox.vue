<template>
    <div class="b-container">
        <div class="title">쪽지함</div>
        <div class="descript">모든 알람은 한달 뒤 삭제됩니다</div>
        <button v-if="isNoRead" class="btn btn-dark notifyBox" @click="allNotifyRead">모두 읽기</button>
        <button v-if="isNoRead" class="btn btn-dark" @click="allReadNotifyDelete">읽은 쪽지 삭제</button>
        <button v-else class="btn btn-dark" disabled>모두 읽기</button>
            <div v-for="notify in notifyList" :key="notify.notifySeq" class="message-item">
                <button v-if="notify.isRead" class="btn btn-dark read-button btn-sm" disabled>읽기</button>
                <button v-else class="btn btn-dark read-button btn-sm" @click="readNotify(notify)">읽기</button>
                <div class="message-content">{{ notify.message }}</div>
                <div class="message-date">{{ notify.createDate }}</div>
                <div class="action-buttons">
                    <button v-if="notify.groupSeq != null" class="btn btn-dark group-button btn-sm" @click="goToGroup(notify.groupSeq)">그룹 가기</button>
                    <button v-if="notify.postSeq != null" class="btn btn-dark post-button btn-sm" @click="goToPost(notify.groupSeq, notify.postSeq)">게시글 가기</button>
                </div>
            </div>
    </div>
</template>
<script>
import axios from '@/js/axios';
export default {
    data() {
        return {
            notifyList: [],
            isNoRead: false
        }
    },
    created() {
        this.getNotiftList()
    },
    methods: {
        getNotiftList() {
            axios.get("/api/user/notify", {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken'),
                    }
            }).then(r => {
                this.notifyList = r.data.data
                console.log("??")
                this.notifyList.forEach(element => {
                    if(!element.isRead) {
                        this.isNoRead = true
                    }
                });
            })
        },
        readNotify(notify) {
            axios.post("/api/user/notify/" + notify.notifySeq, {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }
        }).then(() => {
            notify.isRead = true
        })
        },
        goToGroup(groupSeq) {
            this.$router.push("/group" + groupSeq)
        },
        goToPost(groupSeq, postSeq) {
            axios.get(`/api/post/title/${groupSeq}/${postSeq}`, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }}
            ).then(r => {
                const postInfo = r.data.data
                if (postInfo.type == "MSG") {
                    this.$router.push("/jamye/message" + postInfo.postSequence)
                } else {
                    this.$router.push("/jamye/board" + postInfo.postSequence)
                }
            })
            this.$router.push("/post" + postSeq)
        },
        allNotifyRead() {
            axios.post("/api/user/notify/read/all", {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }})
                .then(() => {
                    this.isNoRead = false
                    this.getNotiftList()
                })
            
        },
        allReadNotifyDelete() {
            axios.delete("/api/user/notify/read/delete", {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }})
                .then(() => {
                    this.getNotiftList()
                })
        }
    }
}
</script>
<style>

.message-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

.message-content {
  font-size: 16px;
  color: #333;
}

.message-date {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.descript {
    margin-bottom: 10px;
}
.notifyBox{
    margin-right: 10px
}
</style>