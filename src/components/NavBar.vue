<template>
  <nav class="navbar navbar-expand-lg navbar-light fixed-top shadow-sm" id="mainNav">
    <div class="container px-5">
      <v-tour
        name="navbarTour"
        :steps="firstSteps"
        @finish="handleFinish"
        @skip="handleSkip"
      />

      <a class="navbar-brand fw-bold" href="#page-top" @click="home">잼얘 가챠</a>
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

export default {
  name: "NavBar",
  data() {
    return {
      firstSteps: [
        {
          target: ".navbar-group-btn",
          content: "먼저 그룹을 생성해야 잼얘가챠를 사용할 수 있어요! 그룹화면으로 이동해보세요!",
          params: { placement: "bottom" }
        }
      ],
    };
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
            setStep(TutorialStep.GROUP_CREATE)
            this.$nextTick(() => {
            // 다음 페이지로 이동한 후 투어 시작
            this.$router.push("/groups").then(() => {
                this.$nextTick(() => {
                this.$tours['    m']?.start()
                })
            })
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
