<template>
    <div class="modal fade" id="leaveGroup" tabindex="-1" aria-labelledby="exampleModalLabel1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    {{group.name}} 탈퇴
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    정말 {{group.name}} 그룹을 떠나시겠습니까?<br>
                    탈퇴 후 인원이 남지않은 그룹은 자동 삭제됩니다<br>
                    (해당 그룹의 운영자라면 탈퇴 후 운영자 권리는 가장 오래된 회원에게 자동 양도됩니다.)
                </div>
                <div class="modal-footer">
                    <button class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close" @click="leaveGroup">탈퇴</button>
                    <button class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close">취소</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import { Modal } from 'bootstrap';
export default {
    data() { 
        return {
            
        }
    },
    props: {
        group: {
            type: Object,
            required: true
        }
    },
    created() {
        
    },
    methods: {
        leaveGroup() {
            axios.post("/api/group/leave/" + this.group.groupSequence, {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken'),
                }
            }).then(() => {
                if(this.$cookies.get("group").groupSequence == this.group.groupSequence) {
                    this.$cookies.remove("group")
                }
                const modalInstance = Modal.getInstance(document.getElementById('leaveGroup'))
                if (modalInstance) modalInstance.hide()
                    this.$router.push("/groups")
                });
                
            }
        }
    }
</script>
