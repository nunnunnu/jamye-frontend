<template>
    <div class="b-container">
        <!-- 투어 오버레이 -->
        <div v-if="isTourActive" class="tour-overlay" @click="preventClick"></div>

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
                    @click="startGroupCreateTour"
                    :disabled="isTourActive && !isTargetAllowed('step2-group-create')">
                그룹 생성
            </button>
                <GroupCreate ref="groupCreate" @createModalClose="createModalClose" @stepChanged="onStepChanged" @groupCreateComplete="handleGroupCreateComplete"></GroupCreate>
            <button type="button" class="btn btn-dark btn-block btn-group step3-group-create" 
                    data-bs-toggle="modal" 
                    data-bs-target="#exampleModal2"
                    @click="startInviteCodeTour"
                    :disabled="isTourActive && !isTargetAllowed('step3-group-create')">
                초대코드 입력
            </button>
                <inviteGroup ref="inviteGroup" v-show="groupInviteModal" @inviteModalClose="inviteModalClose" @inviteStepChanged="onInviteStepChanged" :inviteCode="inviteCode"></inviteGroup>
        </div>
    </div>
</template>

<script>
import GroupCreate from './GroupCreate.vue';
import InviteGroup from './InviteGroup.vue';
import { Modal } from 'bootstrap';
import { getCurrentStep, TutorialStep } from "@/js/tutorialHelper";

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
                this.isTourActive = true;
                // 약간의 지연을 주어 모든 컴포넌트가 렌더링되도록 함
                setTimeout(() => {
                    this.$tours['navbarTour'].start();
                }, 100);
            }
        });
        
        this.$nextTick(() => {
        Object.keys(this.$tours).forEach(tourName => {
        const tour = this.$tours[tourName];
        
        // 투어 객체가 존재하고 이벤트 리스너를 등록할 수 있는지 확인
        if (tour) {
            console.log(`Setting up event listeners for tour: ${tourName}`, tour);
            
            // 모든 가능한 이벤트를 시도
            const events = ['finish', 'skip', 'stop', 'end', 'close', 'cancel'];
            
            if (typeof tour.on === 'function') {
                events.forEach(eventName => {
                    tour.on(eventName, () => {
                        console.log(`Tour ${tourName} ${eventName} event triggered`);
                        if (eventName === 'finish') {
                            this.handleFinish();
                        } else {
                            this.handleSkip();
                        }
                    });
                });
            } else if (typeof tour.$on === 'function') {
                events.forEach(eventName => {
                    tour.$on(eventName, () => {
                        console.log(`Tour ${tourName} ${eventName} event triggered (alternative method)`);
                        if (eventName === 'finish') {
                            this.handleFinish();
                        } else {
                            this.handleSkip();
                        }
                    });
                });
            } else {
                console.warn(`Tour '${tourName}' doesn't have on or $on method`);
            }
        }
    });
    
    // DOM 이벤트 리스너로 스킵 버튼 클릭 감지
    this.setupSkipButtonListener();
    // DOM 이벤트 리스너로 피니시 버튼 클릭 감지
    this.setupFinishButtonListener();
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
            isTourActive: false,
            currentTourTarget: null,
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
                    target: ".invite-code-input",
                    content: "가입할 그룹의 초대코드를 입력해주세요.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    },
                    before: this.openInviteCodeModal
                },
                {
                    target: ".group-info-section",
                    content: "가입할 그룹의 정보를 확인해주세요. 가입하고자 하는 그룹이 맞나요?",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                },
                {
                    target: ".invite-next-btn",
                    content: "그룹 정보를 확인했다면 다음 단계로 진행해주세요.",
                    params: { 
                        placement: "top",
                        enableScrolling: false
                    }
                },
                {
                    target: ".invite-profile-image",
                    content: "가입될 그룹에서 사용할 프로필 사진을 설정해주세요.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                },
                {
                    target: ".invite-nickname-input",
                    content: "가입될 그룹에서 사용할 닉네임을 입력해주세요. 그룹에서 이미 사용중인 닉네임은 사용할 수 없으니 중복체크를 해주세요.",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                },
                {
                    target: ".nickname-duplicate-btn",
                    content: "닉네임 중복체크를 반드시 진행해주세요.",
                    params: { 
                        placement: "top",
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
            this.groupInviteModal = false
            this.currentInviteStep = 1;
        },
        inviteModalOpen() {
            this.groupInviteModal = true
        },
        handleFinish() {
            this.isTourActive = false;
            this.currentTourTarget = null;
            this.stopAllTours();
        },
        handleSkip() {
            console.log("handleSkip");
            this.isTourActive = false;
            this.currentTourTarget = null;
            this.stopAllTours();
        },
        handleGroupCreateComplete() {
            // 그룹 생성 완료 시 호출됨
            this.isTourActive = false;
            this.currentTourTarget = null;
            this.stopAllTours();
        },
        // 그룹 생성 투어 시작
        startGroupCreateTour() {
            if (this.isTourActive && !this.isTargetAllowed('step2-group-create')) return;
            
            // 다른 투어가 진행중이면 중지
            this.stopAllTours();
            this.isTourActive = true;
            this.currentTourTarget = 'step2-group-create';
            
            // 그룹 생성 전용 투어 시작
            setTimeout(() => {
                this.$tours['groupCreateTour'].start();
            }, 200); // 모달이 열릴 시간을 고려한 딜레이
        },
        // 초대코드 투어 시작
        startInviteCodeTour() {
            if (this.isTourActive && !this.isTargetAllowed('step3-group-create')) return;
            
            // 다른 투어가 진행중이면 중지
            this.stopAllTours();
            this.isTourActive = true;
            this.currentTourTarget = 'step3-group-create';
            
            // 초대코드 전용 투어 시작
            setTimeout(() => {
                this.$tours['inviteCodeTour'].start();
            }, 200);
        },
        // 모든 투어 중지
        stopAllTours() {
            if (this.$tours['navbarTour'] && this.$tours['navbarTour'].isRunning) {
                this.$tours['navbarTour'].stop();
            }
            if (this.$tours['groupCreateTour'] && this.$tours['groupCreateTour'].isRunning) {
                this.$tours['groupCreateTour'].stop();
            }
            if (this.$tours['inviteCodeTour'] && this.$tours['inviteCodeTour'].isRunning) {
                this.$tours['inviteCodeTour'].stop();
            }
            
            // 투어 상태 완전 초기화
            this.isTourActive = false;
            this.currentTourTarget = null;
        },
        // 투어 중 클릭 허용 대상 확인
        isTargetAllowed(target) {
            return this.currentTourTarget === target;
        },
        // 클릭 방지 함수
        preventClick(event) {
            event.preventDefault();
            event.stopPropagation();
        },
        
        // 스킵 버튼 클릭 감지
        setupSkipButtonListener() {
            // MutationObserver를 사용해서 DOM 변경을 감지
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        // 스킵 버튼이 추가되었는지 확인
                        const skipButtons = Array.from(document.querySelectorAll('[data-v-step="skip"], .v-tour__skip, button[class*="skip"]'));
                        // 텍스트로 "Skip"을 포함하는 버튼도 찾기
                        const allButtons = document.querySelectorAll('.v-tour button');
                        allButtons.forEach(button => {
                            if (button.textContent.includes('Skip') && !skipButtons.includes(button)) {
                                skipButtons.push(button);
                            }
                        });
                        skipButtons.forEach(button => {
                            if (!button.hasAttribute('data-skip-listener-added')) {
                                button.setAttribute('data-skip-listener-added', 'true');
                                button.addEventListener('click', () => {
                                    console.log('Skip button clicked via DOM listener');
                                    this.handleSkip();
                                });
                            }
                        });
                    }
                });
            });
            
            // body 전체를 관찰
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },
        
        // 피니시 버튼 클릭 감지
        setupFinishButtonListener() {
            // MutationObserver를 사용해서 DOM 변경을 감지
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        // 피니시 버튼이 추가되었는지 확인
                        const finishButtons = Array.from(document.querySelectorAll('[data-v-step="finish"], .v-tour__finish, button[class*="finish"]'));
                        // 텍스트로 "Finish"를 포함하는 버튼도 찾기
                        const allButtons = document.querySelectorAll('.v-tour button');
                        allButtons.forEach(button => {
                            if (button.textContent.includes('Finish') && !finishButtons.includes(button)) {
                                finishButtons.push(button);
                            }
                        });
                        finishButtons.forEach(button => {
                            if (!button.hasAttribute('data-finish-listener-added')) {
                                button.setAttribute('data-finish-listener-added', 'true');
                                button.addEventListener('click', () => {
                                    console.log('Finish button clicked via DOM listener');
                                    this.handleFinish();
                                });
                            }
                        });
                    }
                });
            });
            
            // body 전체를 관찰
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
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
        // 자식 컴포넌트에서 스텝 변경 알림을 받는 메서드 (그룹 생성)
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
            
            // next 버튼을 눌렀을 때 클릭 방지 해제
            if (step === 2) {
                this.isTourActive = false;
                this.currentTourTarget = null;
            }
        },
        // 자식 컴포넌트에서 스텝 변경 알림을 받는 메서드 (초대코드)
        onInviteStepChanged(step) {
            this.currentInviteStep = step;
            
            // 초대코드 투어가 진행 중이라면 해당 스텝으로 이동
            if (this.$tours['inviteCodeTour'].isRunning) {
                this.$tours['inviteCodeTour'].stop();
                
                setTimeout(() => {
                    if (step === 2) {
                        // 그룹 정보 확인 단계 (인덱스 1)
                        this.$tours['inviteCodeTour'].start(1);
                    } else if (step === 3) {
                        // 프로필 생성 단계 (인덱스 3)
                        this.$tours['inviteCodeTour'].start(3);
                    }
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

/* 투어 오버레이 */
.tour-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 9998;
    cursor: not-allowed;
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