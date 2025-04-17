<template>
    <div class="b-container">
        <h2 class="title">그룹 추가</h2>
        <div class="group-add">
            <button type="button" class="btn btn-dark btn-block btn-group" data-bs-toggle="modal" data-bs-target="#exampleModal1">
                그룹 생성
            </button>
                <GroupCreate @createModalClose="createModalClose"></GroupCreate>
            <button type="button" class="btn btn-dark btn-block btn-group" data-bs-toggle="modal" data-bs-target="#exampleModal2">
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

export default {
    components: {
        GroupCreate,
        InviteGroup
    },
    data() {
        return {
            groupCreateModal: null,
            groupInviteModal: false,
            groupAdd: null,
            inviteCode: null
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