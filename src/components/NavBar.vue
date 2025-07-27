<template>
  <nav class="navbar navbar-expand-lg navbar-light fixed-top shadow-sm" id="mainNav">
    <div class="container px-5">
      <v-tour
        name="navbarTour"
        :steps="currentSteps"
        @finish="handleFinish"
        @skip="handleSkip"
      />

      <a class="navbar-brand fw-bold step3-group-list" href="#page-top" @click="home">잼얘 가챠</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarResponsive"
        aria-controls="navbarResponsive"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        Menu <i class="bi-list"></i>
      </button>
      <div class="collapse navbar-collapse" id="navbarResponsive">
        <div v-if="isLogin">
          <button type="button" class="btn position-relative navbar-group-btn" @click="groups">
            그룹 정보
          </button>
          <button type="button" class="btn position-relative" @click="notify">
            쪽지함
            <span v-if="unreadCount > 0" class="badge position-absolute">{{ unreadCount }}</span>
          </button>
          <button type="button" class="btn btn-light" @click="myPage">MY</button>
        </div>
        <div v-else>
          <button type="button" class="btn btn-primary" @click="login">로그인</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { onMounted } from "vue";
import * as bootstrap from "bootstrap";
import { getCurrentStep, setStep, TutorialStep } from "@/js/tutorialHelper";
import { setupGlobalTourEventListeners } from '@/js/tourEventListeners';

export default {
  name: "NavBar",
  data() {
    return {
      welcomeSteps: [
        {
          target: ".navbar-group-btn",
          content: "먼저 그룹을 생성해야 잼얘가챠를 사용할 수 있어요! 그룹화면으로 이동해보세요!",
          params: { placement: "bottom" }
        }
      ]
    };
  },
  computed: {
    currentSteps() {
      const currentStep = getCurrentStep();
      if (currentStep === TutorialStep.WELCOME) {
        console.log("welcomeSteps");
        return this.welcomeSteps;
      }
      return this.welcomeSteps; 
    }
  },
  props: {
    isLogin: { type: Boolean, required: true },
    unreadCount: Number,
  },
  setup() {
    onMounted(() => {
      const mainNav = document.body.querySelector("#mainNav");
      if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
          target: "#mainNav",
          offset: 74,
        });
      }
    });
  },
  mounted() {
    // 전역 투어 이벤트 리스너 설정
    setupGlobalTourEventListeners(this);
    
    // tutorialState가 1이 아니면 투어 실행하지 않음
    if (this.isLogin && getCurrentStep() === TutorialStep.WELCOME) {
      this.$tours['navbarTour'].start();
    }
  },
  methods: {
    login() {
      this.$router.push("/login");
    },
    home() {
      this.$router.push("/");
    },
    myPage() {
      this.$router.push("/my");
    },
    groups() {
        if (getCurrentStep() === TutorialStep.WELCOME) {
            // 현재 투어를 완전히 중지
            if (this.$tours['navbarTour'] && this.$tours['navbarTour'].isRunning) {
                this.$tours['navbarTour'].stop();
            }
            
            setStep(TutorialStep.GROUP_CREATE)
            this.$nextTick(() => {
                // 다음 페이지로 이동
                this.$router.push("/groups");
            })
        } else {
            this.$router.push("/groups");
        }
    },
    notify() {
      this.$router.push("/notify-box");
    },
    handleFinish() {
      setStep(TutorialStep.GROUP_CREATE);
    },
    handleSkip() {
      setStep(TutorialStep.DONE);
    },
        // 투어 중 클릭 허용 대상 확인
    isTargetAllowed(target) {
      return this.currentTourTarget === target;
    },
    // 클릭 방지 함수
    preventClick(event) {
      event.preventDefault();
      event.stopPropagation();
    },
  },
};
</script>

<style>
.nav-link {
  cursor: pointer;
}
.btn-light {
  margin-right: 10px;
  margin-left: 10px;
}
.badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  background-color: red;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  width: 30px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 10px;
}
</style>
