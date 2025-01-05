<template>
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
                            <button class="edit-btn" @click="editGroupProfile(group)" data-bs-toggle="modal" data-bs-target="#editGroupProfile">프로필 수정</button>
                            <div class="modal fade" id="editGroupProfile" tabindex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true" v-if="selectGroup != null">
                                <div class="modal-dialog modal-dialog-centered">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            {{selectGroup.name}} 프로필 수정
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="upload-container">
                                                <input type="file" id="imageUpload" accept="image/*" @change="previewImage" style="display: none;">
                                                <label for="imageUpload" class="upload-label group-image">
                                                    <img v-if="imageSrc" :src="imageSrc" alt="Image Preview" class="image-preview" />
                                                    <img v-else-if="groupNickNameInfo.imageUrl!=null" :src="`http://localhost:8080/api/file/${groupNickNameInfo.imageUrl}`" class="image-preview">
                                                    <img v-else src="@/assets/img/file.png" class="img-thumbnail" alt="user In Group Image">
                                                </label>
                                            </div>
                                            <input type="text" id="groupName" class="nickName form-control" placeholder=" " v-model="groupNickNameInfo.nickname" />
                                            <div v-if="groupNickNameInfo.grade=='NORMAL'">일반 회원</div>
                                            <div v-else>운영자</div>
                                            <div>{{ groupNickNameInfo.createDate }}</div>
                                        </div>
                                        <div class="modal-footer">
                                            <button class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close">닫기</button>
                                            <button class="btn btn-dark" @click="updateUserInGroupInfo" data-bs-dismiss="modal" aria-label="Close">저장</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="delete-btn" data-bs-toggle="modal" data-bs-target="#leaveGroup" @click="selectOneGroup(group)">그룹 탈퇴</button>
                            <div class="modal fade" id="leaveGroup" tabindex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered" v-if="selectGroup != null">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            {{selectGroup.name}} 탈퇴
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            정말 {{selectGroup.name}} 그룹을 떠나시겠습니까?
                                            탈퇴 후 인원이 남지않은 그룹은 자동 삭제됩니다
                                        </div>
                                        <div class="modal-footer">
                                            <button class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close" @click="leaveGroup">탈퇴</button>
                                            <button class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close">취소</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
            groups: null,
            selectGroup: {},
            groupNickNameInfo: {},
            imageSrc: null,
            profileImage: null
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
        selectOneGroup(group) {
            this.selectGroup = group
        },
        previewImage(event) {
            const imgbox = this.$refs.imgbox //imgbox ref를 가진 div
            if(event.target.files && event.target.files[0]){ //파일있는지 검사
                this.profileImage = event.target.files[0]
            }else{
                imgbox.style.backgroundImage = ""
            }
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imageSrc = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        updateUserInGroupInfo() {
            const formData = new FormData();
            if (this.profileImage) {
                formData.append('profile', this.profileImage)
            }
            axios.post(`/api/group/${this.selectGroup.groupSequence}/${this.groupNickNameInfo.groupUserSequence}?nickName=${this.groupNickNameInfo.nickname}`, formData, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }
            })
            .then(response => {
                console.log('Update successful:', response.data);
                this.profileImage = null
                this.imageSrc = null
                this.selectGroup = null
                this.groupNickNameInfo = null
            })
            .catch(error => {
                console.error('Error updating user info:', error);
            });
        },
        leaveGroup() {
            axios.post("/api/group/leave/" + this.selectGroup.groupSequence, {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }
            }).then(() => {
                this.selectGroup = null
                this.$router.go()
            })
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
</style>
