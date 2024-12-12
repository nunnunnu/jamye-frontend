<template>
    <div class="b-container">
        <br><br><br>
        <h1 class="modal-title fs-5" id="jamye-create1">{{ groupName }} 가챠 잼얘 목록</h1>
        <div class="jamye-info-box-container">
            <div class="jamye-info-box" v-for="jamye in jamyes" :key="jamye.postSequence">
                <div class="jamye-title">{{ jamye.title }}</div>
                <div class="jamye-detail">
                    <div>{{ jamye.createdUserNickName }}</div>
                    <div>{{ jamye.createDate }}</div>
                    <div>{{ jamye.updateDate }}</div>
                    <div>{{ jamye.isViewable }}</div>
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
                    });

                    this.jamyes = jamyesData;
                })
    }
    
}
</script>
<style>
.jamye-info-box-container {
    max-height: 1000px; /* 최대 높이를 설정 */
    overflow-y: auto; /* 세로 스크롤을 자동으로 추가 */
    padding-right: 10px; /* 스크롤바와 내용 사이 간격 */
}
.jamye-info-box {
    align-items: center; /* 세로 중앙 정렬 */
    margin-bottom: 20px; /* 아래쪽 여백 추가 */
    margin-top: 10px;
    margin-left: 5px;
    background-color: #ffffff;
    border-radius: 20px;
    height: 90px;
    outline-style: solid;
    outline-color: #d7d7d7;
    overflow: hidden; /* 내용이 넘칠 경우 숨김 처리 */
}
.jamye-title {
    font-weight: bold;
    font-size: 20px;
    margin-left: 15px;
    margin-top: 15px
}
.jamye-detail {
    margin-left: 15px;
    margin-top: 15px;
    font-size: 15px;
    display: flex;
    gap: 10px
}
</style>
