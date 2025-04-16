<template>
    <div class="vote-status-bar">
      <div class="header" @click="toggleOpen">
        <span>🗳️ 현재 진행 중인 그룹 삭제 투표</span>
        <span>{{ isOpen ? '▲' : '▼' }}</span>
      </div>
      <div v-show="isOpen" class="vote-list">
        <div v-for="(vote, voteId) in votes" :key="voteId" class="vote-item">
          <span class="title">{{ vote.groupName }}그룹 투표 진행 현황 - </span>
          <span class="timer">⏱ {{ formatRemainingTime(vote.remainingTime) }}</span>
          <span class="timer">[현재 동의 인원 : {{ vote.agreeUserSeqs.length }}/{{ vote.standardVoteCount }}]</span>
          <span v-if="!vote.alreadyVoteCheck">
              <button class="btn btn-dark btn-sm btn-vote" data-bs-toggle="modal" data-bs-target="#voteModal">투표하기</button>
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
                삭제 동의 시 삭제 투표 결과 여부에 상관없이 그룹에서 자동 탈퇴됩니다.<br>
                탈퇴 시 작성한 잼얘와 댓글이 모두 자동 삭제됩니다. 신중하게 투표해주세요.<br>
            </div>
            <div class="modal-footer">
                <button
                    class="btn btn-danger me-2"
                    data-bs-dismiss="modal"
                >
                    삭제 동의
                </button>
                <button
                    class="btn btn-primary"
                    data-bs-dismiss="modal"
                >
                    삭제 비동의
                </button>
                <button type="button" class="btn btn-dark" data-bs-dismiss="modal">닫기</button>
            </div>
            </div>
        </div>
    </div>
          </span>
          <span class="timer btn-vote" v-else>☑️ 투표에 참여하셨습니다.</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  
  export default {
    components: {
    },
    name: "VoteStatusBar",
    props: {
      deleteVote: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        isOpen: true,
        votes: [],  // deleteVote를 복사한 데이터를 저장
        intervalId: null,
      };
    },
    watch: {
      deleteVote: {
        immediate: true,
        deep: true,
        handler(newVal) {
          if (newVal) {
            this.votes = Object.values(newVal).map((vote) => ({
              ...vote,
              remainingTime: this.calculateRemainingTime(vote.endDateAsLocalDateTime),
            }));
          }
        },
      },
    },
    created() {
      this.initializeVotes();
      this.startInterval();
    },
    methods: {
      toggleOpen() {
        this.isOpen = !this.isOpen;
      },
      formatRemainingTime(remainingTime) {
        const days = Math.floor(remainingTime / (60 * 60 * 24)); 
        const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
        const seconds = remainingTime % 60;
  
        return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
      },
      calculateRemainingTime(endDateTime) {
        const end = new Date(endDateTime);
        const now = new Date();
        const diffSec = Math.max(0, Math.floor((end - now) / 1000)); // 남은 초 계산
        return diffSec;
      },
      initializeVotes() {
        if (this.deleteVote) {
          this.votes = Object.values(this.deleteVote).map((vote) => ({
            ...vote,
            remainingTime: this.calculateRemainingTime(vote.endDateAsLocalDateTime), // 남은 시간 초기화
          }));
        }
      },
      startInterval() {
        if (this.intervalId) {
          clearInterval(this.intervalId); // 기존 타이머 제거
        }
        this.intervalId = setInterval(() => {
          if (Array.isArray(this.votes)) {
            this.votes.forEach((vote, index) => {
              const remainingTime = this.calculateRemainingTime(vote.endDateAsLocalDateTime);
              if (remainingTime !== vote.remainingTime) {
                this.votes[index].remainingTime = remainingTime; // 남은 시간 업데이트
              }
            });
          }
        }, 1000); // 1초마다 실행
      },
    },
    beforeUnmount() {
      clearInterval(this.intervalId); // 컴포넌트가 파괴되기 전에 타이머를 종료
    },
  };
  </script>
  
  <style scoped>
  .vote-status-bar {
    /* position: absolute; */
    top: 75px;
    left: 0;
    width: 100%;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    padding: 8px 16px;
    z-index: 999; 
    margin-top: 73px;
  }
  .header {
    font-weight: bold;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
  }
  .vote-list {
    margin-top: 8px;
  }
  .vote-item {
    justify-content: space-between;
    padding: 4px 0;
    border-top: 1px solid #eee;
  }
  .title {
    font-size: 14px;
  }
  .timer {
    font-size: 14px;
    color: #555;
  }
  .btn-vote {
    margin-left: 5px;
  }
  </style>
  