<template>
    <div class="b-container">
        <h1 class="title" id="jamye-create1">{{ groupName }} 가챠 잼얘 목록</h1>
        <div class="jamye-info-box-container">
            <div class="jamye-info-box" v-for="jamye in jamyes" :key="jamye.postSequence"
                :class="{ selectable: jamye.isViewable }"
                @click="movePost(jamye.postType, jamye.postSequence)" 
            >
                <div class="jamye-header">
                    <div class="jamye-type">{{ jamye.postTypeName }}</div>
                    <div class="jamye-title">{{ jamye.title }}</div>
                    <div class="isViewable" v-if="jamye.isViewable">{{ jamye.isViewableName }}</div>
                </div>
                <div class="jamye-detail">
                    <div>작성자: {{ jamye.createdUserNickName }}</div>
                    <div>생성일: {{ jamye.createDate }}</div>
                    <div>수정일: {{ jamye.updateDate }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
export default{
    data() {
        return {
            jamyes: {}
        }
    },
    props: {
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
        axios.get("/api/post/" + group.groupSequence, {
                    headers: {
                        Authorization: `Bearer `+this.$cookies.get('accessToken')
                    }
                }).then(r => {
                    const jamyesData = r.data.data;

                    const formatDate = (dateString) => {
                        const apiTime = new Date(dateString);
                        return `${apiTime.getFullYear()}-${String(apiTime.getMonth() + 1).padStart(2, '0')}-${String(apiTime.getDate()).padStart(2, '0')} ${String(apiTime.getHours()).padStart(2, '0')}:${String(apiTime.getMinutes()).padStart(2, '0')}`;
                    };

                    jamyesData.forEach(jamye => {
                        if (jamye.createDate) {
                            jamye.createDate = formatDate(jamye.createDate); // 생성일 포맷
                        }
                        if (jamye.updateDate) {
                            jamye.updateDate = formatDate(jamye.updateDate); // 수정일 포맷
                        }
                        if (jamye.postType == 'MSG') {
                            jamye.postTypeName = "메세지"
                        } else {
                            jamye.postTypeName = "포스트"
                        }
                        if(jamye.isViewable) {
                            jamye.isViewableName = "보유"
                        }
                    });

                    this.jamyes = jamyesData;
                })
    },
    methods: {
        movePost(type, postSeq) {
            if(type == "MSG") {
                this.$router.push("/jamye/message" + postSeq)
            } else if(type == "BOR") {
                this.$router.push("/jamye/board" + postSeq)
            }
            
        }
    }
    
}
</script>
<style>
.jamye-info-box-container {
    max-height: 800px;
    overflow-y: auto;
    padding-right: 10px;
}
.jamye-info-box {
    align-items: center;
    margin-bottom: 20px;
    margin-top: 10px;
    margin-left: 5px;
    background-color: #ffffff;
    border-radius: 20px;
    height: 90px;
    outline-style: solid;
    outline-color: #d7d7d7;
    overflow: hidden;
}
.jamye-info-box.selectable {
    cursor: pointer;
    opacity: 1;
}

.jamye-info-box.selectable:hover {
    color: darkblue;
    /* transform: scale(1.05); */
}
.jamye-header {
    display: flex;
    justify-content: space-between;
}
.jamye-type {
    margin-left: 15px;
    margin-top: 15px;
    background-color: black;
    color: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 5px 10px;
    align-items: center;
    font-size: 14px;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease-in-out;
}
.jamye-title {
    font-weight: bold;
    font-size: 20px;
    margin-left: 15px;
    margin-top: 15px;
    margin-right: auto;
}
.isViewable {
    margin-top: 15px;
    margin-right: 10px;
    text-align: right;
    background-color: black;
    border-radius: 10px;
    color: white;
    padding: 5px 10px;
}
.jamye-detail {
    margin-left: 15px;
    margin-top: 10px;
    font-size: 15px;
    display: flex;
    gap: 10px
}
</style>
