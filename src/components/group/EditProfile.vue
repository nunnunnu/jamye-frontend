<template>
    <div class="modal fade" id="editGroupProfile" tabindex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true" >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" v-if="selectGroup != null">
                <div class="modal-header">
                    {{selectGroup.name}} 프로필 수정
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="upload-container">
                        <div class="inputFile">
                            <input type="file" id="profileImageUpload" accept="image/*" @change="previewImage" style="display: none;">
                            <label for="profileImageUpload" class="upload-label group-image">
                            <img v-if="imageSrc != null" :src="imageSrc" alt="profile Preview" class="profile-preview" />
                            <img v-else-if="groupNickNameInfo != null && groupNickNameInfo.imageUrl!=null" :src="imageUrl(groupNickNameInfo.imageUrl)" class="image-preview">
                            <img v-else src="@/assets/img/file.png" class="img-thumbnail" alt="user In Group Image">
                        </label>
                        </div>
                    </div>
                    <div v-if="groupNickNameInfo != null">
                        <input type="text" id="groupName" class="nickName form-control" placeholder=" " v-model="newNickName" />
                        <div v-if="groupNickNameInfo.grade=='NORMAL'">일반 회원</div>
                        <div v-else>운영자</div>
                        <div>{{ groupNickNameInfo.createDate }}</div>
                    </div>
                    
                </div>
                <div class="modal-footer">
                    <button class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close">닫기</button>
                    <button class="btn btn-dark" @click="updateUserInGroupInfo" data-bs-dismiss="modal" aria-label="Close">저장</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from '@/js/axios';
import { imageUrl } from '@/js/fileScripts';
export default{
    props: {
        selectGroup: {
            require: true,
            type: Object
        },
        groupNickNameInfo: {
            require: false,
            type: Object
        }
    },
    data() {
        return {
            imageSrc: null,
            profileImage: null,
            data: null,
            newNickName: null,
        }
    },
    created() {
        this.data = this.groupNickNameInfo
    },
    mounted() {
    const input = document.getElementById("imageUpload");
    console.log("input 태그 확인:", input);
    if (input) {
        console.log("이벤트 리스너 존재 여부:", input.onchange);
    }
}
,
    methods: {
        previewImage(event) {
            const imgbox = this.$refs.imgbox //imgbox ref를 가진 div
            if(event.target.files && event.target.files[0]){ //파일있는지 검사
                this.profileImage = event.target.files[0]
            }else{
                imgbox.style.backgroundImage = ""
            }
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.imageSrc = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        updateUserInGroupInfo() {
            if(this.newNickName == null) {
                this.$toastr.warning("변경할 닉네임을 입력해주세요")
                return
            }
            const formData = new FormData();
            if (this.profileImage) {
                formData.append('profile', this.profileImage)
            }
            axios.post(`/api/group/${this.selectGroup.groupSequence}/${this.groupNickNameInfo.groupUserSequence}?nickName=${this.newNickName}`, formData, {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken'),
                }
            })
            .then(() => {
                this.profileImage = null
                this.imageSrc = null
                this.$emit("resetGroup")
            })
            .catch(error => {
                this.$toastr.error(error.response.data.message)
            });
            this.newNickName = null
        },
        imageUrl
    }
}
</script>
<style>
.inputFile {
    cursor: pointer;
}
</style>