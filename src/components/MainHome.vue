<template>
    <b-container>
      <header class="masthead">
            <div class="container px-5">
                <div class="row gx-5 align-items-center">
                    <div class="col-lg-6">
                        <!-- Mashead text and app badges-->
                        <div class="mb-5 mb-lg-0 text-center text-lg-start">
                            <h1 class="display-1 lh-1 mb-3" style="font-weight: bold;">잼얘 가챠</h1>
                            <p class="lead fw-normal text-muted mb-5">Talk Funny(잼얘해봐)<br>U GO GIRL(님선하세요 소녀여)</p>
                            <div v-if="!this.isLogin">
                                <button type="button" class="btn btn-dark" @click="login">로그인 후 뽑기</button>
                            </div>
                            <div v-if="this.isLogin">
                                <div v-if="currentGroup != null" class="mt-3 d-flex justify-content-between">
                                    <button type="button" class="btn btn-dark custom-btn">뽑기</button>
                                    <button type="button" class="btn btn-dark custom-btn"  data-bs-toggle="modal" data-bs-target="#jamye-create">잼얘 넣기</button>
                                        <div class="modal fade" id="jamye-create" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                            <div class="modal-dialog modal-dialog-centered">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h1 v-if="step === 1" class="modal-title fs-5" id="jamye-create1">잼얘 생성 - 기본 정보 생성</h1>
                                                        <h1 v-if="step === 2" class="modal-title fs-5" id="jamye-create2">잼얘 생성</h1>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click.stop></button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <template v-if="step === 1">
                                                            <!-- 게시글 정보 입력 화면 -->
                                                            <div class="form-group">
                                                                <input type="text" class="form-control" name="post-title" id="post-title" placeholder="게시글 제목">
                                                            </div>
                                                            <br>
                                                            <div class="mt-3 d-flex justify-content-between">
                                                                <button class="btn btn-dark custom-btn">게시글 형식</button>
                                                                <button class="btn btn-dark custom-btn">메세지 형식</button>
                                                            </div>
                                                        </template>
                                                        <template v-if="step === 2">
                                                            <!-- 내 프로필 생성 화면 -->
                                                            
                                                        </template>
                                                    </div>
                                                    <div class="modal-footer">
                                                        <div v-if="step == 1" class="mt-3 d-flex justify-content-between">
                                                            <button class="btn btn-dark custom-btn">생성</button>
                                                        </div>
                                                        <button v-if="step === 2" type="button" class="btn btn-dark btn-block" @click="create">생성</button>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                </div>
                                <div v-if="currentGroup == null">
                                    <button type="button" class="btn btn-dark" disabled>뽑기</button>
                                    <button type="button" class="btn btn-dark" disabled>잼얘 넣기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <!-- Masthead device mockup feature-->
                        <div class="masthead-device-mockup">
                            <svg class="circle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="circleGradient" gradientTransform="rotate(45)">
                                        <stop class="gradient-start-color" offset="0%"></stop>
                                        <stop class="gradient-end-color" offset="100%"></stop>
                                    </linearGradient>
                                </defs>
                                <circle cx="50" cy="50" r="50"></circle>
                            </svg>
                                <svg class="shape-1 d-none d-sm-block" viewBox="0 0 240.83 240.83" xmlns="http://www.w3.org/2000/svg">
                                <rect x="-32.54" y="78.39" width="305.92" height="84.05" rx="42.03" transform="translate(120.42 -49.88) rotate(45)"></rect>
                                <rect x="-32.54" y="78.39" width="305.92" height="84.05" rx="42.03" transform="translate(-49.88 120.42) rotate(-45)"></rect>
                            </svg>
                            <svg class="shape-2 d-none d-sm-block" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="50"></circle>
                            </svg>
                            <div class="device-wrapper">
                                <div class="device" data-device="iPhoneX" data-orientation="portrait" data-color="black">
                                    <div class="screen bg-black">
                                        <video muted="muted" autoplay="" loop="" style="max-width: 100%; height: 100%"><source src="@/assets/img/demo-screen.mp4" type="video/mp4" /></video>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

    </b-container>
  </template>
  
  <script>

export default {
    name: 'MainHome',
    data() {
        return {
            currentGroup: null,
            step: 1
        }
    },
    methods: {
        login() {
            this.$router.push("/login")
        }
    },
    props: {
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        this.currentGroup = this.$cookies.get("group")
    }
}

</script>
  <style>
    a {
      text-decoration: none;
      color: black
    }
  
    .col-6 {
      display: flex;
      float: right;
      width: 100%;
    }
    .home{
      padding-bottom: 102px;
    }
  </style>