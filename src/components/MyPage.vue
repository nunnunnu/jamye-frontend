<template>
    <br>
    <br>
    <br>
    <div class="b-container">
        <h2 class="title"> 사용자 정보 </h2><br>
        <div class="user-info-box">
            <span class="user-id">{{ id }}</span>
            <button class="edit-btn" @click="editUserInfo">회원정보 수정</button>
        </div>
        <div class="mt-3 d-flex justify-content-between">
            <div class="custom-btn"><button class="btn btn-dark btn-sm btn-block text-danger">회원탈퇴</button></div>
            <div class="custom-btn"><button class="btn btn-dark btn-sm btn-block" @click="logout">로그아웃</button></div>
        </div>
        <br><br>
        <div class="group-header">
            <h2 class="title">내 그룹</h2>
            <button type="button" class="btn btn-outline-danger btn-sm">+</button>
        </div>
        <div>
            <div v-if="groups==0"> 아직 소속된 그룹이 없습니다.</div>
            <div v-else>
                <div class="group-info-box-container">
                    <div class="group-info-box" v-for="group in groups" :key="group.groupSequence">
                        <div class="group-image">
                            <img v-if="group.imageUrl == null" src="@/assets/img/file.png" class="img-thumbnail" alt="..." />
                            <img v-else :src="group.imageUrl" class="img-thumbnail" alt="Group Image" />
                        </div>
                        <div class="group-details">
                            <span class="group-name">{{ group.name }}</span>
                            <div class="small-font">
                                인원: {{ group.totalUsers }}
                            </div>
                        </div>
                        <div class="group-actions">
                            <button class="edit-btn" @click="editGroupProfile(group.id)">프로필 수정</button>
                            <button class="delete-btn" @click="leaveGroup(group.id)">그룹 탈퇴</button>
                        </div>
                    </div>
                    <br>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
export default {
    data() {
        return {
            id: null,
            groups: null
        }
    },
    props: {
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        if(!this.isLogin) {
            alert("로그인 후 접속가능한 페이지입니다.")
            this.$router.push("/login")
        }
        this.id = this.$cookies.get("id")
        this.loadMyGroupList()
    },
    methods: {
        logout() {
            this.$cookies.remove("accessToken")
            this.$cookies.remove("refreshToken")
            this.$cookies.remove("id")
            this.$emit('isLoginChange', false)
            this.$router.push("/")
        },
        loadMyGroupList() {
            axios.get("/api/group/list", {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then((response) => {
                console.log(response)
                console.log(response.data.data)
                this.groups = response.data.data
            })
            
        }
    }
    
}
</script>
<style scoped>
.user-info-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f0f0f0;
  outline-style: solid;
  outline-color: #d7d7d7;
  padding: 10px;
  border-radius: 10px;
  overflow: hidden; /* 내용이 넘칠 경우 숨김 처리 */
}

.user-id {
  font-size: 16px;
  color: #333;
  text-align: left;
  font-weight: bold;
  margin-left: 10px;
}

.edit-btn {
  font-size: 14px;
  padding: 5px 10px;
  background-color: #000000;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #3a3a3a;
}
.custom-btn {
    flex: 1; /* 버튼을 동일한 크기로 늘림 */
    margin: 0 10px; /* 버튼 간의 간격 */
    padding: 10px; /* 버튼 내부 여백 조정 */
    text-align: center; /* 텍스트 중앙 정렬 */
    border-radius: 5px; /* 모서리 둥글게 */
}
.btn-block {
    width: 100%;
}
.group-header {
  display: flex; /* 플렉스 박스를 사용하여 요소들을 가로로 배치 */
  align-items: center; /* 수직 정렬을 가운데로 */
  justify-content: space-between; /* 제목과 버튼 사이에 공간을 자동으로 배분 */
  margin-bottom: 20px; /* 하단 여백 추가 (필요에 따라 조정) */
}

.title {
  font-size: 24px; /* 제목 크기 조정 */
  margin: 0; /* 기본 여백 제거 */
}


.add-group-btn {
  padding: 10px 15px; /* 버튼 내부 여백 */
  background-color: #007bff; /* 버튼 배경 색상 */
  color: white; /* 버튼 글씨 색상 */
  border: none; /* 버튼 테두리 제거 */
  border-radius: 5px; /* 버튼 모서리 둥글게 */
  cursor: pointer; /* 커서 변경 */
  font-size: 16px; /* 버튼 글씨 크기 조정 */
}

.add-group-btn:hover {
  background-color: #0056b3; /* 호버 시 버튼 색상 변경 */
}

.group-info-box-container {
    max-height: 500px; /* 최대 높이를 설정 */
    overflow-y: auto; /* 세로 스크롤을 자동으로 추가 */
    padding-right: 10px; /* 스크롤바와 내용 사이 간격 */
}

/* 기존 스타일 */
.group-info-box {
    display: flex; /* Flexbox 사용 */
    align-items: center; /* 세로 중앙 정렬 */
    margin-bottom: 20px; /* 아래쪽 여백 추가 */
    margin-top: 10px;
    margin-left: 5px;
    background-color: #f0f0f0;
    border-radius: 20px;
    height: 90px;
    outline-style: solid;
    outline-color: #d7d7d7;
    overflow: hidden; /* 내용이 넘칠 경우 숨김 처리 */
}

.group-image {
    width: 60px; /* 이미지 크기 설정 */
    height: 60px; /* 이미지 크기 설정 */
    border-radius: 50%; /* 동그라미 형태 */
    overflow: hidden; /* 이미지가 동그라미를 넘지 않도록 설정 */
    margin-left: 10px;
    margin-right: 10px; /* 그룹명과의 간격 */
    display: flex;
    justify-content: center;
    align-items: center;
}

.group-image img {
    width: 100%; /* 부모 요소에 맞춰서 크기 조정 */
    height: 100%; /* 부모 요소에 맞춰서 크기 조정 */
    object-fit: cover; /* 이미지 비율 유지 */
}

.group-details {
    flex-grow: 1; /* 남은 공간을 차지하도록 설정 */
}

.group-name {
    font-size: 18px; /* 그룹명 크기 */
    font-weight: bold; /* 굵게 */
}

.small-font {
    font-size: 14px; /* 작은 글씨 크기 */
    color: #666; /* 색상 */
}
.group-actions {
    display: flex;
    gap: 10px;
    margin-right: 10px;
}

.edit-btn, .delete-btn {
    font-size: 14px;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.edit-btn {
    background-color: #000000;
    color: white;
}

.edit-btn:hover {
    background-color: #3a3a3a;
}

.delete-btn {
    background-color: #dc3545;
    color: white;
}

.delete-btn:hover {
    background-color: #c82333;
}
</style>
