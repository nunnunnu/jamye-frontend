<template>
    <div class="b-container">
        <v-tour
            name="navbarTour"
            :steps="firstSteps"
            @finish="handleFinish"
            @skip="handleSkip"
        />
        <v-tour
            name="groupCreateTour"
            :steps="groupCreateSteps"
            @finish="handleFinish"
            @skip="handleSkip"
        />
        <v-tour
            name="inviteCodeTour"
            :steps="inviteCodeSteps"
            @finish="handleFinish"
            @skip="handleSkip"
        />
        <h2 class="title">그룹 추가</h2>
        <div class="group-add">
            <button type="button" class="btn btn-dark btn-block btn-group step2-group-create" 
                    data-bs-toggle="modal" 
                    data-bs-target="#exampleModal1"
                    @click="startGroupCreateTour">
                그룹 생성
            </button>
                <GroupCreate ref="groupCreate" @createModalClose="createModalClose" @stepChanged="onStepChanged"></GroupCreate>
            <button type="button" class="btn btn-dark btn-block btn-group step3-group-create" 
                    data-bs-toggle="modal" 
                    data-bs-target="#exampleModal2"
                    @click="startInviteCodeTour">
                초대코드 입력
            </button>
                <inviteGroup v-show="groupInviteModal" 
                           @inviteModalClose="inviteModalClose" 
                           @inviteStepChanged="onInviteStepChanged"
                           :inviteCode="inviteCode"></inviteGroup>
        </div>
    </div>
</template>

<script>
import GroupCreate from './GroupCreate.vue';
import InviteGroup from './InviteGroup.vue';
import { Modal } from 'bootstrap';
import { getCurrentStep, setStep, TutorialStep } from "@/js/tutorialHelper";

export default {
    components: {
        GroupCreate,
        InviteGroup
    },
    mounted() {
        // DOM이 완전히 렌더링된 후 전체 투어 시작 (최초 접근시)
        this.$nextTick(() => {
            if (this.isLogin && getCurrentStep() === TutorialStep.GROUP_CREATE) {
                console.log('start overview tour');
                // 약간의 지연을 주어 모든 컴포넌트가 렌더링되도록 함
                setTimeout(() => {
                    this.$tours['navbarTour'].start();
                }, 100);
            }
        });
    },
    data() {
        return {
            groupCreateModal: null,
            groupInviteModal: false,
            groupAdd: null,
            inviteCode: null,
            currentModalStep: 1,
            currentInviteStep: 1,
            // 전체 개요 투어 (최초 접근시만)
            firstSteps: [
                {
                    target: ".step2-group-create",
                    content: "초대코드가 없다면 그룹을 생성해보세요.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                },
                {
                    target: ".step3-group-create",
                    content: "초대코드가 있다면 초대코드를 사용해 그룹에 가입해보세요",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                }
            ],
            // 그룹 생성 전용 투어
            groupCreateSteps: [
                {
                    target: ".step4-group-create",
                    content: "그룹의 프로필 사진을 넣는 곳입니다.",
                    params: { 
                        placement: "right",
                        enableScrolling: false
                    },
                    before: this.openGroupCreateModal
                },
                {
                    target: ".step5-group-create",
                    content: "그룹 명을 넣는 곳입니다.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                },
                {
                    target: ".step6-group-create",
                    content: "그룹 설명을 넣는 곳입니다.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                },
                {
                    target: ".step7-group-create",
                    content: "회원님이 그룹에서 사용할 프로필 사진을 넣는 곳입니다.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                },
                {
                    target: ".step8-group-create",
                    content: "회원님이 그룹에서 사용할 닉네임을 넣는 곳입니다.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                }
            ],
            // 초대코드 전용 투어
            inviteCodeSteps: [
                {
                    target: ".step-invite-code-input",
                    content: "가입할 그룹의 초대코드를 입력해주세요.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    },
                    before: this.openInviteCodeModal
                },
                {
                    target: ".step-invite-group-info",
                    content: "가입할 그룹의 정보를 확인해주세요. 가입하고자 하는 그룹이 맞나요?",
                    params: { 
                        placement: "top",
                        enableScrolling: false
                    }
                },
                {
                    target: ".step-invite-profile-image",
                    content: "가입될 그룹에서 사용할 프로필 사진을 선택해주세요.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                },
                {
                    target: ".step-invite-nickname",
                    content: "가입될 그룹에서 사용할 닉네임을 입력해주세요. 그룹에서 이미 사용중인 닉네임은 사용할 수 없으니 중복체크를 해주세요.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                }
            ]
        };
    },
    props: {
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        if (!this.isLogin) {
            this.$toastr.warning("로그인 후 접근 가능한 페이지입니다.");
            this.$router.push("/login");
            return;
        }
        const inviteCode = this.$route.query.inviteCode
        if(inviteCode != null) {
            this.inviteCode = inviteCode
            this.$nextTick(() => {
                    const modalElement = document.getElementById('exampleModal2');
                    const modal = new Modal(modalElement);
                    modal.show();
            })
        }
    },
    methods: {
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
        createModalClose() {
            this.groupCreateModal = false;
            this.currentModalStep = 1;
        },
        inviteModalClose() {
            this.groupInviteModal = false;
            this.currentInviteStep = 1;
        },
        inviteModalOpen() {
            this.groupInviteModal = true
        },
        handleFinish() {
            setStep(TutorialStep.GROUP_CREATE);
        },
        handleSkip() {
            setStep(TutorialStep.DONE);
        },
        // 그룹 생성 투어 시작
        startGroupCreateTour() {
            // 다른 투어가 진행중이면 중지
            this.stopAllTours();
            
            // 그룹 생성 전용 투어 시작
            setTimeout(() => {
                this.$tours['groupCreateTour'].start();
            }, 200); // 모달이 열릴 시간을 고려한 딜레이
        },
        // 초대코드 투어 시작
        startInviteCodeTour() {
            // 다른 투어가 진행중이면 중지
            this.stopAllTours();
            
            // 초대코드 전용 투어 시작
            setTimeout(() => {
                this.$tours['inviteCodeTour'].start();
            }, 200);
        },
        // 모든 투어 중지
        stopAllTours() {
            if (this.$tours['navbarTour'].isRunning) {
                this.$tours['navbarTour'].stop();
            }
            if (this.$tours['groupCreateTour'].isRunning) {
                this.$tours['groupCreateTour'].stop();
            }
            if (this.$tours['inviteCodeTour'].isRunning) {
                this.$tours['inviteCodeTour'].stop();
            }
        },
        // 그룹 생성 모달을 여는 메서드
        openGroupCreateModal() {
            return new Promise((resolve) => {
                const modalElement = document.getElementById('exampleModal1');
                if (modalElement) {
                    const modal = new Modal(modalElement);
                    modal.show();
                    
                    // 모달이 완전히 열릴 때까지 대기
                    modalElement.addEventListener('shown.bs.modal', () => {
                        resolve();
                    }, { once: true });
                } else {
                    resolve();
                }
            });
        },
        // 초대코드 모달을 여는 메서드
        openInviteCodeModal() {
            return new Promise((resolve) => {
                const modalElement = document.getElementById('exampleModal2');
                if (modalElement) {
                    const modal = new Modal(modalElement);
                    modal.show();
                    
                    // 모달이 완전히 열릴 때까지 대기
                    modalElement.addEventListener('shown.bs.modal', () => {
                        resolve();
                    }, { once: true });
                } else {
                    resolve();
                }
            });
        },
        // 자식 컴포넌트(GroupCreate)에서 스텝 변경 알림을 받는 메서드
        onStepChanged(step) {
            this.currentModalStep = step;
            
            // 스텝이 2로 변경되면 투어를 업데이트하고 step7으로 이동
            if (step === 2) {
                this.$nextTick(() => {
                    // 투어가 진행 중이라면 step7-group-create로 이동
                    if (this.$tours['groupCreateTour'].isRunning) {
                        // 현재 투어를 일시 중지하고 새로운 스텝으로 이동
                        this.$tours['groupCreateTour'].stop();
                        
                        // 약간의 지연 후 step7부터 시작
                        setTimeout(() => {
                            this.$tours['groupCreateTour'].start(3); // step7-group-create는 인덱스 3
                        }, 100);
                    }
                });
            }
        },
        // 자식 컴포넌트(InviteGroup)에서 스텝 변경 알림을 받는 메서드
        onInviteStepChanged(step) {
            this.currentInviteStep = step;
            
            // 투어가 진행 중이라면 해당 스텝으로 이동
            if (this.$tours['inviteCodeTour'].isRunning) {
                this.$tours['inviteCodeTour'].stop();
                
                let tourStep = 0;
                // 스텝에 따라 투어 인덱스 결정
                if (step === 2) {
                    tourStep = 1; // 그룹 정보 확인 단계
                } else if (step === 3) {
                    tourStep = 2; // 프로필 생성 단계
                }
                
                setTimeout(() => {
                    this.$tours['inviteCodeTour'].start(tourStep);
                }, 100);
            }
        }
    }
};
</script>

<style scoped>
.btn-group {
    margin-top: 70px;
    height: 90px;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    font-size: 30px;
}

/* 투어 스타일 커스터마이징 */
:deep(.v-tour) {
    z-index: 10000;
}

:deep(.v-tour__target--highlighted) {
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.4);
    position: relative;
    z-index: 9999;
}
</style>