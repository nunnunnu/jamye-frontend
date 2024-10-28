<template>
    <br><br><br>
    <div class="b-container">
        <h2 class="title">그룹 정보</h2>
        <div>
            <div class="group-header">
                <h4 class="title">내 그룹</h4>
                <button type="button" class="btn btn-outline-danger btn-sm" @click="groupAdd">+</button>
            </div>
        </div>
        <div class="group-info-box-container">
            <div class="group-info-box" v-for="group in groups" :key="group.groupSequence">
                <div class="group-image">
                    <img v-if="group.imageUrl == null" src="@/assets/img/file.png" class="img-thumbnail" alt="..." />
                    <img v-else :src="group.imageUrl" class="img-thumbnail" alt="Group Image" />
                </div>
                <div class="group-details">
                    <span class="group-name">{{ group.name }}</span>
                    <div class="small-font">
                        인원: {{ group.totalUsers }}
                    </div>
                </div>
                <div class="group-actions">
                    <button class="edit-btn" @click="selectGroup(group.groupSequence)">선택</button>
                </div>
            </div>
            <br>
        </div>
        <br>
        <div v-if="groupinfo!=null" class="group-container">
            <div class="group-header">
                <img src="@/assets/img/file.png" alt="Group Profile" class="group-profile-img" />
                <div class="group-info">
                    <span class="group-info-name">{{ groupinfo.name }}</span>
                    <button class="btn btn-dark edit-button" v-if="groupinfo.isMaster" @click="editGroupName">수정</button>
                </div>
            </div>
            <div class="user-list">
                <div class="user-item" v-for="user in groupinfo.users" :key="user.userSequence">
                    <img src="@/assets/img/file.png" alt="User Profile" class="user-profile-img" />
                    <div class="user-info">
                        <span class="user-name">
                            {{ user.nickname }}
                            <span v-if="user.grade=='MASTER'" class="master-badge">(마스터)</span>
                        </span>
                        <button v-if="user.userSequence==userSequence" class="btn btn-dark edit-button" @click="editUserName">수정</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import axios from 'axios';

export default {
    components: {
    },
    data() {
        return {
            groups: null,
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
            alert("로그인 후 접근 가능한 페이지입니다.");
            this.$router.go("/");
            return;
        }
        this.loadMyGroupList();
        if(this.groups == 0) {
            alert("소속된 그룹이 없습니다. 그룹 생성 페이지로 이동합니다.")
            this.$router.push("/add")
        }
        this.userSequence = this.$cookies.get("sequence")
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
        groupAdd() {
            this.$router.push("/add")
        },
        selectGroup(groupSeq) {
            axios.get("/api/group/"+groupSeq,{
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                this.groupinfo = r.data.data
            })
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
    max-height: 230px;
}
.group-container {
    text-align: center;
    max-width: 400px;
    margin: 0 auto;
    border: solid #ddd;
    border-radius: 15px;
    overflow: hidden;
}
.group-profile-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ddd;
}
.group-info-name {
    display: flex;
    justify-content: space-between;
    align-items: right;
    width: 100%;
    margin-left:10px;
    font-weight: bold; /* 굵게 */
}
.user-list {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
}
.user-item:last-child {
    border-bottom: none;
}
.user-profile-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #ddd;
}
.user-name {
    font-size: 1em;
    color: #333;
    justify-content: space-between;
    align-items: right;
    margin-left: 10px;
}
.master-badge {
    font-weight: bold;
    color: #d62727;
}
edit-button {
    display: inline;
}
.group-header {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 왼쪽과 오른쪽 정렬 */
    padding: 20px;
}

.group-info {
    display: flex;
    align-items: center;
    width: 100%; /* 부모 요소의 전체 너비 사용 */
    justify-content: space-between; /* 그룹명과 수정 버튼을 양 끝에 배치 */
}

.user-item {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 사용자 이름과 수정 버튼을 양 끝에 배치 */
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.user-info {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 사용자 이름과 수정 버튼을 양 끝에 배치 */
    width: 100%; /* 부모 요소의 전체 너비 사용 */
}
.edit-button {
    width: 70px;
}

</style>
