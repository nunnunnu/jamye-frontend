<template>
    <div class="b-container">
        <v-tour
            name="navbarTour"
            :steps="firstSteps"
            @finish="handleFinish"
            @skip="handleSkip"
        />
        <h2 class="title">그룹 추가</h2>
        <div class="group-add">
            <button type="button" class="btn btn-dark btn-block btn-group step2-group-create" data-bs-toggle="modal" data-bs-target="#exampleModal1">
                그룹 생성
            </button>
                <GroupCreate @createModalClose="createModalClose"></GroupCreate>
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
        if (this.isLogin && getCurrentStep() === TutorialStep.GROUP_CREATE) {
            console.log('start')
            this.$tours['navbarTour'].start();
        }
    },
    data() {
        return {
            groupCreateModal: null,
            groupInviteModal: false,
            groupAdd: null,
            inviteCode: null,
            firstSteps: [
                {
                    target: ".step2-group-create",
                    content: "초대코드가 없다면 그룹을 생성해보세요.",
                    params: { placement: "bottom" }
                },
                {
                    target: ".step3-group-create",
                    content: "초대코드가 있다면 초대코드를 사용해 그룹에 가입해보세요",
                    params: { placement: "bottom" }
                },
                {
                    target: ".step4-group-create",
                    content: "그룹의 프로필 사진을 넣는 곳입니다.",
                    params: { placement: "right" }
                },
                {
                    target: ".step5-group-create",
                    content: "그룹 명을 넣는 곳입니다.",
                    params: { placement: "bottom" }
                },
                {
                    target: ".step6-group-create",
                    content: "그룹 설명을 넣는 곳입니다.",
                    params: { placement: "bottom" }
                },
                {
                    target: ".step7-group-create",
                    content: "회원님이 그룹에서 사용할 프로필 사진을 넣는 곳입니다. ",
                    params: { placement: "bottom" }
                },
                {
                    target: ".step8-group-create",
                    content: "회원님이 그룹에서 사용할 닉네임을 넣는 곳입니다. ",
                    params: { placement: "bottom" }
                }
            ],
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
                    const modal = new Modal(modalElement);  // Modal 인스턴스 생성
                    modal.show();  // 모달 열기
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
            this.groupCreateModal = false
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

</style>