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
        
        <h2 class="title">그룹 정보</h2>
        
        <!-- 그룹 생성 완료 메시지 -->
        <div v-if="showGroupCreatedMessage" class="group-created-message">
            <div class="message-box">
                <h4>🎉 그룹이 생성되었어요!</h4>
                <p>잼얘를 생성해볼까요?</p>
                <div class="message-buttons">
                    <button type="button" class="btn btn-outline-secondary" @click="skipToHome">Skip</button>
                    <button type="button" class="btn btn-primary" @click="goToHome">잼얘 생성하기</button>
                </div>
            </div>
        </div>
        
        <div>
            <div class="group-header">
                <h4 class="title">내 그룹</h4>
                <button type="button" class="btn btn-outline-danger btn-sm step2-group-create" @click="goToAddGroup">+</button>
            </div>
        </div>
        <div class="group-info-box-container" v-if="groups.length != 0">
            <div class="group-info-box" v-for="group in groups" :key="group.groupSequence">
                <div class="group-image">
                    <img v-if="group.imageUrl == null" src="@/assets/img/file.png" class="img-thumbnail" alt="..." />
                    <img v-else :src="imageUrl(group.imageUrl)" class="img-thumbnail" alt="Group Image" />
                </div>
                <div class="group-details">
                    <span class="group-name">{{ group.name }}</span>
                    <div class="small-font">
                        인원: {{ group.totalUsers }}
                    </div>
                </div>
                <div class="group-actions">
                    <router-link class="btn btn-dark edit-button" :to="{name:'groupInfo', params:{seq:group.groupSequence}}">선택</router-link>
                </div>
            </div>
            <br>
        </div>
        <div v-else>
                가입된 그룹이 없습니다.
        </div>
    </div>
</template>

<script>
import axios from '@/js/axios';
import { imageUrl } from '@/js/fileScripts';
import { getCurrentStep, setStep, TutorialStep } from "@/js/tutorialHelper";
import { Modal } from 'bootstrap'; // Import Modal when it's actually used

export default {
    data() {
        return {
            groups: [],
            inviteCode: null, // Add inviteCode to data
            showGroupCreatedMessage: false,
            isTourActive: false,
            // 전체 개요 투어 (최초 접근시만)
            firstSteps: [
                {
                    target: ".step2-group-create",
                    content: "먼저 그룹을 생성해보세요!",
                    params: { 
                        placement: "bottom",
                        enableScrolling: false
                    }
                }
            ],
            // Add missing step arrays to avoid reference errors
            groupCreateSteps: [],
            inviteCodeSteps: []
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
        
        // 그룹 생성 완료 후 메시지 표시 체크
        if (getCurrentStep() === TutorialStep.GROUP_LIST_CHECK) {
            this.showGroupCreatedMessage = true;
        }
        
        this.loadMyGroupList();
    },
    mounted() {
        if (this.isLogin && getCurrentStep() === TutorialStep.GROUP_CREATE) {
            this.isTourActive = true;
            this.$tours['navbarTour'].start();
        }
        
        this.$nextTick(() => {
            Object.keys(this.$tours).forEach(tourName => {
            const tour = this.$tours[tourName];
            
            // 투어 객체가 존재하고 $on 메소드가 있는지 확인
            if (tour && typeof tour.$on === 'function') {
                tour.$on('finish', () => {
                    this.isTourActive = false;
                });
                
                tour.$on('skip', () => {
                    this.isTourActive = false;
                });
            } else {
                console.warn(`Tour '${tourName}' is not properly initialized or doesn't have $on method`);
            }
        });
    });
    },
    methods: {
        imageUrl,
        loadMyGroupList() {
            axios.get("/api/group/list", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            .then((response) => {
                this.groups = response.data.data;
            });
        },
        goToAddGroup() {
            if (this.isTourActive) return; // 투어 중일 때 클릭 방지
            this.$router.push('/add');
        },
        goToGroup(groupSeq) {
            if (this.isTourActive) return; // 투어 중일 때 클릭 방지
            this.$router.push(`/group${groupSeq}`);
        },
        goToHome() {
            setStep(TutorialStep.BOARD_POST_CREATE);
            this.showGroupCreatedMessage = false;
            this.$router.push('/');
        },
        skipToHome() {
            setStep(TutorialStep.DONE);
            this.showGroupCreatedMessage = false;
        },
        preventClick(event) {
            event.preventDefault();
            event.stopPropagation();
        },
        // Add missing methods referenced by v-tour
        handleFinish() {
            // Handle tour finish
            this.isTourActive = false;
            console.log('Tour finished');
        },
        handleSkip() {
            // Handle tour skip
            this.isTourActive = false;
            console.log('Tour skipped');
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
.group-info-box-container {
    max-height:700px;
}

/* 그룹 생성 완료 메시지 스타일 */
.group-created-message {
    margin-bottom: 20px;
    padding: 0;
}

.message-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.message-box h4 {
    margin-bottom: 10px;
    font-weight: bold;
}

.message-box p {
    margin-bottom: 15px;
    opacity: 0.9;
}

.message-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.message-buttons .btn {
    min-width: 120px;
    font-weight: 500;
}

.message-buttons .btn-outline-secondary {
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
}

.message-buttons .btn-outline-secondary:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: white;
    color: white;
}

.message-buttons .btn-primary {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: white;
    color: white;
}

.message-buttons .btn-primary:hover {
    background-color: white;
    color: #667eea;
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
/* :deep(.v-tour) {
    z-index: 10000;
}

:deep(.v-tour__target--highlighted) {
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.4);
    position: relative;
    z-index: 9999;
} */
</style>