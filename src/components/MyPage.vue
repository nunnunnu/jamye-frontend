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
            <button type="button" class="btn btn-outline-danger btn-sm" @click="groupAdd">+</button>
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
            return
        }
        this.id = this.$cookies.get("id")
        this.loadMyGroupList()
    },
    methods: {
        logout() {
            this.$cookies.remove("accessToken")
            this.$cookies.remove("refreshToken")
            this.$cookies.remove("id")
            this.$cookies.remove("sequence")
            this.$cookies.remove("group")
            this.$emit("groupSelect", null)
            this.$router.push("/")
            this.$emit('isLoginChange', false)
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
            
        },
        groupAdd() {
            this.$router.push("/add")
        }
    }
    
}
</script>
<style scoped>
@import url("../css/group-box.css");
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

.btn-block {
    width: 100%;
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
</style>
