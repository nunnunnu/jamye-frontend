<template>
    <div class="b-container">
        <h2 class="title">그룹 정보</h2>
        <div>
            <div class="group-header">
                <h4 class="title">내 그룹</h4>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="groupAdd">+</button>
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

export default {
    components: {
    },
    data() {
        return {
            groups: {},
            groupinfo: null,
            userSequence: null
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
            this.$toastr.warning('로그인 후 접속가능한 페이지입니다.');
            this.$router.push("/login");
            return;
        }
        this.loadMyGroupList();
        if(this.groups == 0) {
            this.$toastr.warning("소속된 그룹이 없습니다. 그룹 생성 페이지로 이동합니다.")
            this.$router.push("/add")
        }
    },
    methods: {
        imageUrl,
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
        groupAdd() {
            this.$router.push("/add")
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


</style>
