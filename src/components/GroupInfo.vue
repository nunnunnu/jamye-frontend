<template>
    <div class="b-container">
        <h2 class="title">그룹 상세 정보</h2>
        <div v-if="groupInfo!=null" class="group-container">
            <div class="group-header">
                <img src="@/assets/img/file.png" alt="Group Profile" class="group-profile-img" />
                <div class="group-info">
                    <span class="group-info-name">{{ groupInfo.name }}</span>
                    <button class="btn btn-dark edit-button" v-if="groupInfo.isMaster" @click="editGroupName">수정</button>
                </div>
            </div>
            <div>
                {{ groupInfo.description }}
            </div>
            <div class="user-list">
                <div class="user-item" v-for="user in groupInfo.users" :key="user.userSequence">
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
        <button class="btn btn-dark btn-block group-btn">그룹 탈퇴</button>
        <button class="btn btn-dark btn-block group-btn" data-bs-toggle="modal" data-bs-target="#exampleModal" @click="getInviteCode">초대코드 발급</button>
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">초대코드 발급</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                        <input class="invite-code" type="text" v-model="inviteCode" disabled>
                        <div>발급된 초대코드는 한시간 후 만료됩니다.</div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close">닫기</button>
                </div>
            </div>
        </div>
    </div>
        <button v-if="groupInfo.isMaster" class="btn btn-dark btn-block group-btn" @click="isGroupDeletionVoteInProgress" data-bs-toggle="modal" data-bs-target="#deleteVoteModal">그룹 삭제 투표 진행</button>
        <div class="modal fade" id="deleteVoteModal" tabindex="-1" aria-labelledby="deleteVoteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="deleteVoteModalLabel">그룹 삭제 투표 개시</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    그룹 삭제 투표가 진행됩니다.<br>
                    그룹 내 회원이 과반수 이상이 찬성한다면 즉시 삭제됩니다.<br>
                    과반수가 동의하지 않았다면 삭제는 무산됩니다.<br>
                    일주일 내로 투표가 재 진행된다면 2차 투표가 시작됩니다.<br>
                    2차 투표에서도 과반수가 동의하지 않는다면 재투표에서 그룹 삭제에 동의한 인원은 그룹에서 탈퇴됩니다(작성한 잼얘도 함께 삭제됩니다)
                    <br>
                    <div v-if="voteInfo != null">
                        <div v-if="voteInfo.isNowVoting">
                            <span v-if="voteInfo.hasRevoted">현재 2차 투표 진행 중 입니다.</span>
                            <span v-else>현재 1차 투표 진행 중 입니다.</span>
                            동의 인원 : {{ voteInfo.agreeUserSeqs.length }}
                            비동의 인원 : {{ voteInfo.disagreeUserSeqs.length }}
                        </div>
                        <div v-else-if="voteInfo.isWaitingDeleteReVoted">
                            1차 투표에서 과반수의 삭제 승인을 얻지못해 2차 투표 대기중입니다.
                            삭제를 누르면 2차 투표가 진행됩니다.
                            만약 재투표에서도 과반수의 동의를 얻지못한다면 운영자는 자동 그룹탈퇴처리되며 운영자 권한은 가입 기간이 가장 오래된 유저에게 자동 양도됩니다.
                        </div>
                    </div>                    
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close" @click="deleteGroupVote">삭제</button>
                    <button type="button" class="btn btn-dark" data-bs-dismiss="modal" aria-label="Close">닫기</button>
                </div>
            </div>
        </div>
        </div>
        
    </div>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    name: 'groupInfo',
    data() {
        return {
            groupInfo: null,
            userSequence: null,
            inviteCode: null,
            voteInfo: null
        }
    },
    props: {
        seq: Number
    },
    created() {
        this.userSequence = this.$cookies.get("sequence")
        axios.get("/api/group/"+this.seq, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                this.groupInfo = r.data.data
            }).catch(e => {
                alert(e.response.data.message)
                this.$router.push("/groups")
            })
    },
    methods: {
        deleteGroupVote() {
            axios.delete("/api/group/"+this.seq, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                if(r.data.data) {
                    alert("그룹이 삭제 완료되었습니다")
                    this.$router.push("groups")
                } else {
                    alert("삭제 투표가 시작되었습니다. 과반수 이상 동의시 모든 그룹 내 모든 게시글이 삭제됩니다.")
                }
            })
            .catch(e=> {
                alert(e.response.data.message)
            })
        },
        getInviteCode() {
            axios.get("/api/group/invite/"+this.seq, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            })
            .then(r=> {
                this.inviteCode = r.data.data    
            })
            .catch(e => {
                alert(e.response.data.message + ": 잠시 후 다시 시도해주세요.")
            })
            
        },
        isGroupDeletionVoteInProgress() {
            axios.get("/api/group/vote-info/"+this.seq, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            }).then(r => {
                this.voteInfo = r.data.data
            })
        }
    }
}
</script>
<style scoped>
.group-container {
    text-align: center;
    margin: 0 auto;
    border: solid #ddd;
    border-radius: 15px;
    overflow: hidden;
    width: 100%;
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
.group-btn {
    margin-top: 10px;
}
.invite-code {
    width: 100%;
    height: 40px;
    border-radius: 15px;
}
</style>
