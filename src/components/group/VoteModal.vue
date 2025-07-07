<template>
    <div class="modal fade" id="voteModal" tabindex="-1" aria-labelledby="voteModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="voteModalLabel">그룹 삭제 투표</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                그룹 삭제 투표가 진행 중입니다. 
                그룹의 과반수가 삭제에 동의할 시 그룹과 보유 잼얘, 댓글이 일괄 삭제됩니다.<br>
                1. 투표 결과 과반수가 삭제에 동의한다면 작성한 잼얘와 댓글이 모두 자동 삭제됩니다.<br>
                2. 투표는 수정할 수 없습니다. 신중하게 결정해주세요.<br>
                3. 투표는 익명으로 진행됩니다.<br>
                4. 투표 과반수 동의 달성 시 남은 기간은 무시되며 즉시 그룹 삭제가 진행됩니다.<br>
                5. 기간 내에 투표에 참여하지않는다면 삭제 동의로 간주됩니다.
            </div>
            <div class="modal-footer">
                <button
                    class="btn btn-danger me-2"
                    data-bs-dismiss="modal"
                    @click="voteAdd('AGREE')"
                >
                    삭제 동의
                </button>
                <button
                    class="btn btn-primary"
                    data-bs-dismiss="modal"
                    @click="voteAdd('DISAGREE')"
                >
                    삭제 비동의
                </button>
                <button type="button" class="btn btn-dark" data-bs-dismiss="modal">닫기</button>
            </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from '@/js/axios'
export default {
    props: {
        vote: {
            type: Object,
            require: true
        },
        groupSeq: {
            type: Number,
            require: true
        }
    },
    methods: {
        voteAdd(voteType) {
            axios.post(`/api/group/vote/${voteType}/${this.groupSeq}`,  {
                headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }}).then(
                this.$toastr.success("그룹 삭제 투표가 완료되었습니다.")
            ).catch(this.$toastr.error("그룹 삭제 투표에 참가할 수 없습니다."))

        }
    }
}
</script>