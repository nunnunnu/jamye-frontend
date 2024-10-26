<template>
    <br><br><br>
    <div class="b-container">
        <h2 class="title">그룹 정보</h2>
        <button type="button" class="btn btn-dark btn-block btn-group" data-bs-toggle="modal" data-bs-target="#exampleModal" @click="createModal">
            그룹 생성
        </button>
        <div v-if="groupCreateModal">
            <GroupCreate></GroupCreate>
        </div>
        <div class="btn btn-dark btn-block btn-group">
            초대코드 입력
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import GroupCreate from './GroupCreate.vue';

export default {
    components: {
        GroupCreate
    },
    data() {
        return {
            groups: null,
            groupCreateModal: null
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
        this.loadMyGroupList();
    },
    methods: {
        loadMyGroupList() {
            axios.get("/api/group/list", {
                headers: {
                    Authorization: `Bearer ${this.$cookies.get('accessToken')}`
                }
            })
            .then((response) => {
                this.groups = response.data.data;
            });
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
        createModal() {
            this.groupCreateModal = true
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
