<template>
    <div class="modal fade" id="exampleModal1" tabindex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 v-if="step === 1" class="modal-title fs-5" id="exampleModalLabel1">그룹 생성 - 그룹 정보 입력</h1>
                    <h1 v-if="step === 2" class="modal-title fs-5" id="exampleModalLabel1">그룹 생성 - 내 프로필 생성</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="modalClose"></button>
                </div>
                <div class="modal-body">
                    <template v-if="step === 1">
                        <!-- 그룹 정보 입력 화면 -->
                        <div class="upload-container">
                            <input type="file" id="imageUpload" accept="image/*" @change="previewImage" style="display: none;">
                            <label for="imageUpload" class="upload-label step4-group-create">
                                <img v-if="imageSrc" :src="imageSrc" alt="Image Preview" class="image-preview" />
                                <span v-else class="upload-icon">+</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="groupName" class="group-name step5-group-create form-control" placeholder=" " v-model="groupName" />
                            <label for="groupName" class="placeholder-label">그룹 명<span class="required">*</span></label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="groupDescription" v-model="groupDescription" class="group-description step6-group-create form-control group-description" placeholder=" " />
                            <label for="groupDescription" class="placeholder-label2">그룹 설명(200자)</label>
                        </div>
                    </template>
                    <template v-if="step === 2">
                        <!-- 내 프로필 생성 화면 -->
                        <div class="upload-container">
                            <input type="file" id="profileImageUpload" accept="image/*" @change="profilePreviewImage" style="display: none;">
                            <label for="profileImageUpload" class="upload-label step7-group-create">
                                <img v-if="profileimageSrc" :src="profileimageSrc" alt="Image Preview" class="image-preview" />
                                <span v-else class="upload-icon">+</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <input type="text" id="nickname" class="nickname group-name form-control step8-group-create" placeholder=" " v-model="nickname" />
                            <label for="nickname" class="placeholder-label3">닉네임<span class="required">*</span></label>
                        </div>
                    </template>
                </div>
                <div class="modal-footer">
                    <button v-if="step === 1" type="button" class="btn btn-dark btn-block" @click="next">다음</button>
                    <button v-if="step === 2" type="button" class="btn btn-dark btn-block step9-group-create" @click="create">생성</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from '@/js/axios';
import { base64ToFile } from '@/js/fileScripts';
import { Modal } from 'bootstrap';
import { setStep, TutorialStep } from "@/js/tutorialHelper";

export default {
    name: 'GroupCreate',
    data() {
        return {
            imageSrc: null,
            groupDescription: '',
            groupName: '',
            nickname: '',
            step: 1,
            profileimageSrc: null,
        }
    },
    methods: {
        next() {
            if(this.groupName == '' || this.groupName == null || this.groupName == undefined) {
                this.$toastr.warning("그룹 명을 입력하지않으셨습니다.")
                return
            }
            this.step = 2;
            
            // 부모 컴포넌트에 단계 변경 알림 (즉시 emit)
            this.$emit('stepChanged', this.step);
        },
        create() {
            if(this.nickname == '' || this.nickname == null || this.nickname == undefined) {
                this.$toastr.warning("닉네임을 입력하지않으셨습니다.")
                return
            }
            
            const formdata = new FormData()
            const data = {
                "name": this.groupName,
                "description": this.groupDescription,
                "nickname": this.nickname,
            }

            formdata.append('data', JSON.stringify(data));

            if(this.imageSrc != null) {
                formdata.append('imageUrl', base64ToFile(this.imageSrc))
            }
            if(this.profileimageSrc != null) {
                formdata.append('profileImageUrl', base64ToFile(this.profileimageSrc))
            }

            axios.post("/api/group", formdata, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
                }
            }).then(() => {
                // 성공 메시지 표시
                this.$toastr.success("그룹 생성 완료!");
                
                // 모달 완전히 닫기
                this.closeModalCompletely();
                
                // 투어 단계 업데이트
                setStep(TutorialStep.GROUP_LIST_CHECK);
                
                // /groups로 리다이렉트
                this.$router.push('/groups').then(() => {
                    // 페이지 이동 후 그룹 목록 새로고침 이벤트 발생
                    this.$emit("groupCreateComplete");
                });
            })
        },
        closeModalCompletely() {
            // 모달 인스턴스 가져오기
            const modalElement = document.getElementById('exampleModal1');
            const modalInstance = Modal.getInstance(modalElement);
            
            if (modalInstance) {
                modalInstance.hide();
            }
            
            // 모달 백드롭 제거
            this.$nextTick(() => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.remove();
                }
                // body에서 modal 관련 클래스 제거
                document.body.classList.remove('modal-open');
                document.body.style.removeProperty('overflow');
                document.body.style.removeProperty('padding-right');
            });
            
            // 폼 리셋
            this.resetForm();
        },
        modalClose() {
            this.closeModalCompletely();
            this.$emit("createModalClose", false)
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
            this.profileimageSrc = null;
            this.step = 1;
        },
        // 투어를 위한 수동 다음 단계 호출
        tourNext() {
            if (this.step === 1) {
                // 임시로 그룹명 입력 (투어용)
                if (!this.groupName) {
                    this.groupName = "테스트 그룹";
                }
                this.next();
            }
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
    margin-top: 20px;
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
    top: 80%;
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

/* 투어 하이라이트 스타일 */
.step4-group-create,
.step5-group-create,
.step6-group-create,
.step7-group-create,
.step8-group-create {
    position: relative;
    z-index: 1;
}
</style>