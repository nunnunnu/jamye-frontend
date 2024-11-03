<template>
    <div class="b-container">
        <br><br><br>
        <h2 class="title">그룹 추가</h2>
        <div class="group-add">
            <button type="button" class="btn btn-dark btn-block btn-group" data-bs-toggle="modal" data-bs-target="#exampleModal1">
                그룹 생성
            </button>
                <GroupCreate @createModalClose="createModalClose"></GroupCreate>
            <button type="button" class="btn btn-dark btn-block btn-group" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                초대코드 입력
            </button>
                <inviteGroup @inviteModalClose="inviteModalClose"></inviteGroup>
        </div>
    </div>
</template>
<script>
import GroupCreate from './GroupCreate.vue';
import InviteGroup from './InviteGroup.vue';

export default {
    components: {
        GroupCreate,
        InviteGroup
    },
    data() {
        return {
            groupCreateModal: null,
            groupInviteModal: null,
            groupAdd: null
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
            alert("로그인 후 접근 가능한 페이지입니다.");
            this.$router.go("/");
            return;
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

</style>