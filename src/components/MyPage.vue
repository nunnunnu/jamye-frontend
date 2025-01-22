<template>
    <div class="b-container">
        <h2 class="title"> 사용자 정보 </h2><br>
        <div class="user-info-box">
            <span class="user-id">{{ id }}</span>
            <router-link class="edit-btn" :to="{name:'userInfoEdit'}">회원정보 수정</router-link>
        </div>
        <div class="mt-3 d-flex justify-content-between">
            <div class="custom-btn"><button class="btn btn-dark btn-sm btn-block text-danger" data-bs-toggle="modal" data-bs-target="#deleteUser">회원탈퇴</button></div>
                <div class="modal fade" id="deleteUser" tabindex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true" >
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                회원 탈퇴
                            </div>
                            <div class="modal-body">
                                정말 탈퇴하시겠습니까?<br>
                                탈퇴 시 소속 그룹에서 자동 탈퇴되며 모든 운영자 권한은 그룹 별 가장 오래 활동한 회원에게 자동 양도됩니다.<br>
                                탈퇴시 작성한 잼얘는 자동 삭제되지않습니다.<br><br>
                                비밀번호 인증
                                <input type="password" id="passwordCheck" class="nickName form-control" placeholder=" " v-model="passwordCheck" />
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close">닫기</button>
                                <button v-if="passwordCheck == null" class="btn btn-dark" @click="deleteUser" data-bs-dismiss="modal" aria-label="Close" disabled>탈퇴</button>
                                <button v-else class="btn btn-dark" @click="deleteUser" data-bs-dismiss="modal" aria-label="Close">탈퇴</button>
                            </div>
                        </div>
                    </div>
                </div>
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
                    <div class="group-info-box" v-for="group in groups" :key="group.groupSequence" >
                        <div class="group-image">
                            <img v-if="group == null || group.imageUrl == null" src="@/assets/img/file.png" class="img-thumbnail" alt="..." />
                            <img v-else :src="group.imageUrl" class="img-thumbnail" alt="Group Image" />
                        </div>
                        <div class="group-details">
                            <span class="group-name">{{ group.name }}</span>
                            <div class="small-font">
                                인원: {{ group.totalUsers }}
                            </div>
                        </div>
                        <div class="group-actions">
                            <button class="edit-btn" @click="editGroupProfile(group)" data-bs-toggle="modal" data-bs-target="#editGroupProfile">프로필 수정</button>
                            <EditProfile :selectGroup = "selectGroup" :groupNickNameInfo = "groupNickNameInfo" @resetGroup="resetGroup"></EditProfile>
                            <button class="delete-btn" data-bs-toggle="modal" data-bs-target="#leaveGroup">그룹 탈퇴</button>
                            <leave-group :group= "group"></leave-group>
                        </div>
                    </div>
                    <br>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from '@/js/axios';
import LeaveGroup from './LeaveGroup.vue';
import EditProfile from './EditProfile.vue';
export default {
    components: {
        LeaveGroup,
        EditProfile
    },
    data() {
        return {
            id: null,
            groups: null,
            selectGroup: {},
            groupNickNameInfo: {},
            passwordCheck: null
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
            this.$router.push("/")
            this.$emit("groupSelect", null)
            this.$emit('isLoginChange', false)
        },
        loadMyGroupList() {
            axios.get("/api/group/list", {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then((response) => {
                this.groups = response.data.data
            })
            
        },
        groupAdd() {
            this.$router.push("/add")
        },
        editGroupProfile(group) {
            this.selectGroup = group
            axios.get("/api/group/user/" + group.groupSequence, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                this.groupNickNameInfo = r.data.data
            })
        },
        deleteUser() {
            if(this.passwordCheck == null) {
                alert("비밀번호를 먼저 입력해주세요")
            }
            axios.post("/api/user", {
                password: this.passwordCheck
            }, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }
            }).then(() => {
                alert("탈퇴되었습니다.")
                this.$cookies.keys().forEach(cookie => {
                    this.$cookies.remove(cookie);
                });
                this.$emit('isLoginChange', false)
                this.$router.push("/")
            }).catch(e => {
                alert(e.response.data.message)
            })
        },
        moveGroup(seq) {
            this.$router.push("/group"+seq)
        },
        resetGroup() {
            this.selectGroup = null
            this.groupNickNameInfo = null
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
  overflow: hidden; 
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

.upload-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #f0f0f0;
    cursor: pointer;
    overflow: hidden;
    border: 2px solid #ddd;
    position: relative;
}

.nickName {
    margin-top: 20px;
    background-color: #f0f0f0;
    outline: solid #d7d7d7;
    height: 50px;
    border-radius: 15px;
    padding-right: 10px; /* 오른쪽 여백 추가 */
    padding-left: 10px; /* 왼쪽 여백 추가 */
}
.group-info-box {
    cursor: pointer;
}
</style>
