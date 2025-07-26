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
        <h2 class="title">그룹 정보</h2>
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

export default {
    data() {
        return {
            groups: [],
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
        this.loadMyGroupList();
    },
    mounted() {
        if (this.isLogin && getCurrentStep() === TutorialStep.GROUP_CREATE) {
        this.$tours['navbarTour'].start();
        }
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
            this.$router.push('/add');
        },
        goToGroup(groupSeq) {
            this.$router.push(`/group${groupSeq}`);
        },
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