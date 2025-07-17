<template>
    <div class="b-container">
        <v-tour
            name="navbarTour"
            :steps="currentSteps"
            @finish="handleFinish"
            @skip="handleSkip"
        />
        <h2 class="title">그룹 추가</h2>
        <div class="group-add">
            <button type="button" class="btn btn-dark btn-block btn-group step2-group-create" data-bs-toggle="modal" data-bs-target="#exampleModal1">
                그룹 생성
            </button>
                <GroupCreate ref="groupCreate" @createModalClose="createModalClose" @stepChanged="onStepChanged"></GroupCreate>
            <button type="button" class="btn btn-dark btn-block btn-group step3-group-create" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                초대코드 입력
            </button>
                <inviteGroup v-show="groupInviteModal" @inviteModalClose="inviteModalClose" :inviteCode="inviteCode"></inviteGroup>
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
        // DOM이 완전히 렌더링된 후 투어 시작
        this.$nextTick(() => {
            if (this.isLogin && getCurrentStep() === TutorialStep.GROUP_CREATE) {
                console.log('start tour');
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
            currentModalStep: 1, // 모달 내부 스텝 추적
            baseSteps: [
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
                },
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
                }
            ],
            step2Steps: [
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
            ]
        };
    },
    computed: {
        currentSteps() {
            if (this.currentModalStep === 1) {
                return this.baseSteps;
            } else {
                return [...this.baseSteps, ...this.step2Steps];
            }
        }
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
            this.currentModalStep = 1; // 모달 닫힐 때 스텝 리셋
        },
        inviteModalClose() {
            this.groupInviteModal = false
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
        // 자식 컴포넌트에서 스텝 변경 알림을 받는 메서드
        onStepChanged(step) {
            this.currentModalStep = step;
            
            // 스텝이 2로 변경되면 투어를 업데이트하고 step7으로 이동
            if (step === 2) {
                this.$nextTick(() => {
                    // 투어가 진행 중이라면 step7-group-create로 이동
                    if (this.$tours['navbarTour'].isRunning) {
                        // 현재 투어를 일시 중지하고 새로운 스텝으로 이동
                        this.$tours['navbarTour'].stop();
                        
                        // 약간의 지연 후 step7부터 시작
                        setTimeout(() => {
                            this.$tours['navbarTour'].start(5); // step7-group-create는 인덱스 5
                        }, 100);
                    }
                });
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