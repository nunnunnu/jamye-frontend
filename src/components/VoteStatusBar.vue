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
          <button class="btn btn-dark btn-sm btn-vote">투표하기</button>
        </div>
      </div>
    </div>
  </template>
  
<script>
  export default {
    name: "VoteStatusBar",
    props: {
      deleteVote: {
        type: Object,
        required: true,
      }
    },
    data() {
      return {
        isOpen: true,
        votes: [],  // deleteVote를 복사한 데이터를 저장
        intervalId: null
      };
    },
    watch: {
        deleteVote(newVal) {
            this.votes = newVal
      }
    },
    created() {
      this.votes = Object.values(this.deleteVote).map(vote => ({
        ...vote,
        remainingTime: this.calculateRemainingTime(vote.endDateTime)  // 남은 시간 초기화
      }));
      this.startInterval();
    },
    methods: {
        toggleOpen() {
            this.isOpen = !this.isOpen;
        },
        formatRemainingTime(remainingTime) {
            const days = Math.floor(remainingTime / (60 * 60 * 24)); // 일
            const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60)); // 시간
            const minutes = Math.floor((remainingTime % (60 * 60)) / 60); // 분
            const seconds = remainingTime % 60; // 초

            return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
        },
        calculateRemainingTime(endDateTime) {
            const end = new Date(endDateTime);
            const now = new Date();
            const diffSec = Math.max(0, Math.floor((end - now) / 1000)); // 남은 초 계산
            return diffSec;
        },
        startInterval() {
            if (this.intervalId) {
            clearInterval(this.intervalId);  // 기존 타이머 제거
            }
            this.intervalId = setInterval(() => {
            this.votes.forEach((vote, index) => {
                const remainingTime = this.calculateRemainingTime(vote.endDateTime);
                if (remainingTime !== vote.remainingTime) {
                this.votes[index].remainingTime = remainingTime; // 남은 시간 업데이트
                }
            });
            }, 1000);  // 1초마다 실행
        }
        },
        beforeUnmount() {
        clearInterval(this.intervalId); // 컴포넌트가 파괴되기 전에 타이머를 종료
        },
        // onChangeVoteList(newVoteList) {
        //     this.votes = newVoteList
        // }
    };
</script>
  
<style scoped>
  .vote-status-bar {
    position: fixed;
    top: 75px; /* NavBar 높이에 맞춰 조절 */
    left: 0;
    width: 100%;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    padding: 8px 16px;
    z-index: 999; /* NavBar 바로 아래에 올 수 있도록 조정 */
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
  