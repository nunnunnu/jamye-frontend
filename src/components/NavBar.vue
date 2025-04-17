<template>
    <!-- 상단 메뉴 -->
    <nav class="navbar navbar-expand-lg navbar-light fixed-top shadow-sm" id="mainNav">
            <div class="container px-5">
                <a class="navbar-brand fw-bold" href="#page-top" @click="home">잼얘 가챠</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    Menu
                    <i class="bi-list"></i>
                </button>
                <div class="collapse navbar-collapse" id="navbarResponsive">
                    <div v-if="isLogin">
                        <button type="button" class="btn position-relative" @click="groups">
                            그룹 정보
                        </button>
                        <button type="button" class="btn position-relative" @click="notify">
                            쪽지함
                            <span v-if="unreadCount > 0" class="badge position-absolute">{{ unreadCount }}</span>
                            </button>


                        <button type="button" class="btn btn-light" @click="myPage">MY</button>
                    </div>
                    <div v-if="!isLogin">
                        <button type="button" class="btn btn-primary" @click="login">로그인</button>
                    </div>
                </div>
            </div>
        </nav>
</template>

<script>
import { onMounted } from 'vue';
import * as bootstrap from 'bootstrap';
// import axios from '@/js/axios';

export default {
  name: 'NavBar',
  data() {
    return {
        groupInfos: null,
        stompClient: null,
    }
  },
  props: {
        isLogin: {
            type: Boolean,
            required: true
        },
        unreadCount: {
            type: Number
        },
    },
    setup() {
        onMounted(() => {
            const mainNav = document.body.querySelector('#mainNav');
            if (mainNav) {
                new bootstrap.ScrollSpy(document.body, {
                target: '#mainNav',
                offset: 74,
                });
            }

            // 반응형 네비게이션 바 동작 처리
            const navbarToggler = document.body.querySelector('.navbar-toggler');
            const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
            responsiveNavItems.forEach(function (responsiveNavItem) {
                responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    navbarToggler.click();
                }
                });
            });
        });
    },
    created() {
        
    },
    methods: {
        login() {
            this.$router.push("/login")
        },
        home() {
            this.$router.push("/")
        },
        myPage() {
            this.$router.push("/my")
        },
        groups() {
            this.$router.push("/groups")
        },
        notify() {
            this.$router.push("/notify-box")
        }
    }
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
  width: 30px; /* 크기 조정 */
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center; /* 글씨 중앙 정렬 */
  line-height: 10px; /* 세로 중앙 정렬 */
}

</style>