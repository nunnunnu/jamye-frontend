<template>
    <div class="modal fade" id="exampleModal2" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 v-if="step === 1" class="modal-title fs-5" id="exampleModalLabel">초대코드 입력</h1>
                    <h1 v-if="step === 2" class="modal-title fs-5" id="exampleModalLabel">초대코드 입력 - 그룹 정보 확인</h1>
                    <h1 v-if="step === 3" class="modal-title fs-5" id="exampleModalLabel">초대코드 입력 - 내 프로필 생성</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="modalClose"></button>
                </div>
                <div class="modal-body">
                    <template v-if="step === 1">
                        <!-- 초대코드 입력 화면 -->
                        <div class="form-group">
                            <input type="text" id="groupName" class="group-name form-control" placeholder=" " v-model="inviteCode" />
                            <label for="groupName" class="placeholder-label">초대코드<span class="required">*</span></label>
                        </div> 
                    </template>
                    <template v-if="step === 2">
                        <!-- 그룹 정보 확인 -->
                        <div class="upload-container">
                            <label for="profileImageUpload" class="upload-label">
                                <img v-if="groupInfo.imageUrl != null" :src="groupInfo.imageUrl" alt="Image Preview" class="image-preview" />
                                <!-- <span v-else class="upload-icon">+</span> -->
                            </label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="nickname" class="nickname group-name form-control" placeholder=" " v-model="groupInfo.name" disabled/>
                            <label for="nickname" class="placeholder-label3">{{ groupInfo.name }}</label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="groupDescription" v-model="groupDescription" class="group-description form-control group-description" placeholder=" " disabled/>
                            <label for="groupDescription" class="placeholder-label2">{{ groupInfo.description }}</label>
                        </div>
                    </template>
                    <template v-if="step === 3">
                        <div class="upload-container">
                            <input type="file" id="profileImageUpload" accept="image/*" @change="profilePreviewImage" style="display: none;">
                            <label for="profileImageUpload" class="upload-label">
                                <img v-if="profileimageSrc" :src="profileimageSrc" alt="Image Preview" class="image-preview" />
                                <span v-else class="upload-icon">+</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="nickname" class="nickname group-name form-control" placeholder=" " v-model="nickname" />
                            <label for="nickname" class="placeholder-label3">닉네임<span class="required">*</span></label>
                        </div>
                    </template>
                </div>
                <div class="modal-footer">
                    <button v-if="step === 1" type="button" class="btn btn-dark btn-block" @click="nextOne">다음</button>
                    <div v-if="step === 2" class="mt-3 d-flex justify-content-between">
                        <button type="button" class="btn btn-dark btn-block" @click="back" >이전</button>
                        <button type="button" class="btn btn-dark btn-block" @click="nextTwo" >다음</button>
                    </div>
                    <button v-if="step === 3" type="button" class="btn btn-dark btn-block"  data-bs-dismiss="modal" aria-label="Close" @click="create">가입</button>
                </div> 
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';
export default {
    data() {
        return {
            imageSrc: null,
            groupDescription: '',
            groupName: '',
            nickname: '',
            step: 1,
            profileimageSrc: null,
            groupInfo: null,
            inviteCode: null
        }
    },
    methods: {
        nextOne() {
            if(this.inviteCode == '' || this.inviteCode == null || this.inviteCode == undefined) {
                alert("그룹 명을 입력하지않으셨습니다.")
                return
            }
            axios.get("/api/group/group-info/"+this.inviteCode, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(resposne => {
                this.groupInfo = resposne.data.data
                this.step = 2; // '다음' 버튼 클릭 시 다음 단계로 이동
            })
            .catch(e => {
                alert(e.response.data.message)
            })
            
        },
        nextTwo() {            
            this.step = 3;

        },
        back() {            
            this.step = 1;
            this.inviteCode = null
            this.groupInfo = null

        },
        previewImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imageSrc = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        profilePreviewImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.profileimageSrc = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        resetForm() {
            this.groupDescription = '';
            this.groupName = '';
            this.nickname = '';
            this.imageSrc = null;
        },
        modalClose() {
            this.$emit("inviteModalClose", false)
        },
        create() {
            if(this.nickname == null) {
                alert("가입할 그룹에서 사용할 프로필을 작성해주세요")
                return
            }
            axios.post("/api/group/invite", {
                "groupSequence": this.groupInfo.groupSequence,
                "inviteCode": this.inviteCode,
                "nickName": this.nickname,
                "profileImageUrl": this.profileimageSrc
            }, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            }).then(() => {
                this.modalClose()  
                const modalInstance = Modal.getInstance(document.getElementById('exampleModal2'))
                if (modalInstance) modalInstance.hide()
                
                this.$router.push("/groups")
            }).catch(e => {
                alert(e.response.data.message)
            })
        }
    }
}
</script>

<style scoped>
.upload-container {
    position: relative;
    display: flex;
    justify-content: center;
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
.upload-icon {
    font-size: 24px;
    color: #888;
}
.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.group-name {
    margin-top: 7px;
    background-color: #f0f0f0;
    outline: solid #d7d7d7;
    height: 50px;
    border-radius: 15px;
    padding-right: 10px; /* 오른쪽 여백 추가 */
    padding-left: 10px; /* 왼쪽 여백 추가 */
}
.group-description {
    margin-top: 10px; /* 여백 수정 */
    background-color: #f0f0f0;
    outline: solid #d7d7d7;
    height: 100px;
    border-radius: 15px;
    padding-left: 10px; /* 왼쪽 여백 추가 */
}
.placeholder-label {
    position: absolute;
    left: 30px;
    top: 52%; /* 중앙 정렬 */
    transform: translateY(-50%);
    color: gray; /* 그룹 명 색상 변경 */
    pointer-events: none; /* 클릭 방지 */
    transition: 0.2s ease all;
    text-align: right; /* 오른쪽 정렬 추가 */
}
.placeholder-label2 {
    position: absolute;
    left: 30px;
    top: 70%; /* 중앙 정렬 */
    transform: translateY(-50%);
    color: gray; /* 그룹 명 색상 변경 */
    pointer-events: none; /* 클릭 방지 */
    transition: 0.2s ease all;
    text-align: right; /* 오른쪽 정렬 추가 */
}
.placeholder-label3 {
    position: absolute;
    left: 30px;
    top: 80%; /* 중앙 정렬 */
    transform: translateY(-50%);
    color: gray; /* 그룹 명 색상 변경 */
    pointer-events: none; /* 클릭 방지 */
    transition: 0.2s ease all;
    text-align: right; /* 오른쪽 정렬 추가 */
}
.required {
    color: red; /* * 색상 */
}
.group-name:focus + .placeholder-label + .placeholder-label2,
.group-name:not(:placeholder-shown) + .placeholder-label {
    opacity: 0;
}
.group-description:focus + .placeholder-label + .placeholder-label2,
.group-description:not(:placeholder-shown) .placeholder-label2 {
    opacity: 0;
}
.nickname:focus + .placeholder-label3,
.nickname:not(:placeholder-shown) + .placeholder-label3 {
    opacity: 0;
}
input::placeholder {
    color: transparent; /* 기본 placeholder 숨기기 */
}
</style>