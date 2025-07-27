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
                            <input type="text" id="groupName" class="group-name form-control invite-code-input" placeholder="ㅑㅜ" v-model="inviteCodeCopy" />
                            <label for="groupName" class="placeholder-label">초대코드<span class="required">*</span></label>
                        </div> 
                    </template>
                    <template v-if="step === 2">
                        <!-- 그룹 정보 확인 -->
                        <div class="group-info-section">
                            <div class="upload-container">
                                <label for="profileImageUpload" class="upload-label">
                                    <img v-if="groupInfo.imageUrl != null" :src="imageUrl(groupInfo.imageUrl)" alt="Image Preview" class="image-preview" />
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
                        </div>
                    </template>
                    <template v-if="step === 3">
                        <div class="upload-container">
                            <input type="file" id="profileImageUpload" accept="image/*" @change="profilePreviewImage" style="display: none;">
                            <label for="profileImageUpload" class="upload-label invite-profile-image">
                                <img v-if="profileimageSrc" :src="profileimageSrc" alt="Image Preview" class="image-preview" />
                                <span v-else class="upload-icon">+</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="nickname" class="nickname group-name form-control invite-nickname-input" placeholder="닉네임" v-model="nickname" />
                            <label for="nickname" class="placeholder-label3">닉네임<span class="required">*</span></label>
                            <button class="btn btn-dark btn-dup nickname-duplicate-btn" @click="nickNameCheck">중복 체크</button>
                        </div>
                    </template>
                </div>
                <div class="modal-footer">
                    <button v-if="step === 1" type="button" class="btn btn-dark btn-block" @click="nextOne">다음</button>
                    <div v-if="step === 2" class="mt-3 d-flex justify-content-between">
                        <button type="button" class="btn btn-dark btn-block" @click="back" >이전</button>
                        <button type="button" class="btn btn-dark btn-block invite-next-btn" @click="nextTwo" >다음</button>
                    </div>
                    <div v-if="step === 3">
                        <button v-if="nickNameDupCheck" type="button" class="btn btn-dark btn-block"  data-bs-dismiss="modal" aria-label="Close" @click="create">가입</button>
                        <button v-else type="button" class="btn btn-dark btn-block"  disabled>가입</button>
                    </div>
                </div> 
            </div>
        </div>
    </div>
</template>

<script>
import axios from '@/js/axios';
import { Modal } from 'bootstrap';
import { imageUrl } from '@/js/fileScripts';
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
            nickNameDupCheck : false,
            inviteCodeCopy: this.inviteCode
        }
    },
    props: {
        inviteCode: {
            type: String,
            require: false
        }
    },
    methods: {
        imageUrl,
        nextOne() {
            if(this.inviteCodeCopy == '' || this.inviteCodeCopy == null || this.inviteCodeCopy == undefined) {
                this.$toastr.warning("그룹 명을 입력하지않으셨습니다.")
                return
            }
            axios.get("/api/group/group-info/"+this.inviteCodeCopy, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            })
            .then(resposne => {
                this.groupInfo = resposne.data.data
                this.step = 2;
                
                // 부모 컴포넌트에 단계 변경 알림
                this.$emit('inviteStepChanged', this.step);
            })
            .catch(e => {
                this.$toastr.error(e.response.data.message)
            })
            
        },
        nextTwo() {            
            this.step = 3;
            
            // 부모 컴포넌트에 단계 변경 알림
            this.$emit('inviteStepChanged', this.step);
        },
        back() {            
            this.step = 1;
            this.inviteCodeCopy = null
            this.groupInfo = null
            
            // 부모 컴포넌트에 단계 변경 알림
            this.$emit('inviteStepChanged', this.step);
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
            this.step = 1;
        },
        modalClose() {
            this.resetForm();
            this.$emit("inviteModalClose", false)
        },
        create() {
            if(this.nickname == null) {
                this.$toastr.warning("가입할 그룹에서 사용할 프로필을 작성해주세요")
                return
            }
            axios.post("/api/group/invite", {
                "groupSequence": this.groupInfo.groupSequence,
                "inviteCode": this.inviteCodeCopy,
                "nickName": this.nickname,
                "profileImageUrl": this.profileimageSrc
            }, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            }).then(() => {
                this.modalClose()  
                const modalInstance = Modal.getInstance(document.getElementById('exampleModal2'))
                if (modalInstance) modalInstance.hide()
                
                this.$router.push("/groups")
            }).catch(e => {
                this.$toastr.error(e.response.data.message)
            })
        },
        nickNameCheck() {
            axios.get(`/api/group/${this.groupInfo.groupSequence}/nick-name?nickName=${this.nickname}`, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            }).then(() => {
                this.nickNameDupCheck = true
            }).catch(e => {
                this.$toastr.error(e.response.data.message)
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
    padding-right: 10px;
    padding-left: 10px;
}
.group-description {
    margin-top: 10px;
    background-color: #f0f0f0;
    outline: solid #d7d7d7;
    height: 100px;
    border-radius: 15px;
    padding-left: 10px;
}
.placeholder-label {
    position: absolute;
    left: 30px;
    top: 52%;
    transform: translateY(-50%);
    color: gray;
    pointer-events: none;
    transition: 0.2s ease all;
    text-align: right;
}
.placeholder-label2 {
    position: absolute;
    left: 30px;
    top: 70%;
    transform: translateY(-50%);
    color: gray;
    pointer-events: none;
    transition: 0.2s ease all;
    text-align: right;
}
.placeholder-label3 {
    position: absolute;
    left: 30px;
    top: -65%;
    transform: translateY(-50%);
    color: gray;
    pointer-events: none;
    transition: 0.2s ease all;
    text-align: right;
}
.required {
    color: red;
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
    color: transparent;
}
.btn-dup{
    margin-top: 5px;
}

/* 투어 하이라이트를 위한 스타일 */
.invite-code-input,
.group-info-section,
.invite-next-btn,
.invite-profile-image,
.invite-nickname-input,
.nickname-duplicate-btn {
    position: relative;
    z-index: 1;
}

.group-info-section {
    padding: 10px;
    border-radius: 10px;
    background-color: rgba(0, 0, 0, 0.02);
}
</style>