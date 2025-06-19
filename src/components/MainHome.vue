<template>
    <b-container>
      <header class="masthead">
            <div class="container px-5">
                <div v-if="isLogin" class="dropdown" @click="groupList">
                    <a v-if="currentGroup==null" class="btn btn-dark dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        그룹을 선택해주세요.
                    </a>
                    <a v-else class="btn btn-dark dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        {{ currentGroup.name }}
                    </a>
                    <ul class="dropdown-menu">
                        <div v-if="groupInfos.length != 0">
                            <div v-for="group in groupInfos" :key="group.sequence">
                                <li><a class="dropdown-item" href="#" @click="groupSelect(group)">{{ group.name }}</a></li>
                            </div>
                        </div>
                        <div v-else>
                            <li><a> 가입된 그룹이 없습니다 </a></li>
                        </div>    
                    </ul>
                    
                </div>
                <div class="row gx-5 align-items-center">
                    <div class="col-lg-6">
                        <div class="mb-5 mb-lg-0 text-center text-lg-start">
                            <h1 class="display-1 lh-1 mb-3" style="font-weight: bold;">잼얘 가챠</h1>
                            <p class="lead fw-normal text-muted mb-5">Talk Funny(잼얘해봐)<br>U GO GIRL(님선하세요 소녀여)</p>
                            <div v-if="!this.isLogin">
                                <button type="button" class="btn btn-dark" @click="login">로그인 후 뽑기</button>
                            </div>
                            <div v-if="this.isLogin">
                                <div v-if="currentGroup != null" class="mt-3 d-flex justify-content-between">
                                    <button type="button" class="btn btn-dark custom-btn" @click="luckyDraw">뽑기</button>
                                    <button type="button" class="btn btn-dark custom-btn" data-bs-toggle="modal" data-bs-target="#jamye-create">잼얘 넣기</button>
                                        <div class="modal fade" id="jamye-create" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                            <div class="modal-dialog modal-dialog-centered">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h1 class="modal-title fs-5" id="jamye-create1">잼얘 생성</h1>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click.stop></button>
                                                    </div>
                                                    <div class="modal-body">
                                                            <!-- 게시글 정보 입력 화면 -->
                                                            <div class="group-add">
                                                                <button class="btn btn-dark btn-block btn-group" data-bs-dismiss="modal" aria-label="Close" @click="routerMessage()">메세지 형식</button>
                                                                <button class="btn btn-dark btn-block btn-group" data-bs-dismiss="modal" aria-label="Close" @click="routerPost()">
                                                                    게시글 형식
                                                                </button>
                                                                    <inviteGroup @inviteModalClose="inviteModalClose"></inviteGroup>
                                                            </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <router-link class="btn btn-dark custom-btn" :to="{name:'jamyeList'}">잼얘 목록</router-link>
                                </div>
                                <div v-if="currentGroup == null" class="mt-3 d-flex justify-content-between tooltip-btn">
                                    <button type="button" class="btn btn-dark custom-btn tooltip-btn" disabled>뽑기
                                    </button>
                                    <button type="button" class="btn btn-dark custom-btn tooltip-btn" disabled>잼얘 넣기
                                    </button>
                                    <button class="btn btn-dark custom-btn tooltip-btn" disabled>잼얘 목록
                                    </button>
                                    <span class="tooltip-text">그룹을 먼저 선택해주세요</span>
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
                                        <filter id="blurEdge" x="-50%" y="-50%" width="200%" height="200%">
                                            <feGaussianBlur stdDeviation="0.4" />
                                        </filter>
                                </defs>
                                <circle cx="50" cy="50" r="50" filter="url(#blurEdge)"></circle>
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="showBegModal" class="modal-overlay">     
                        <div class="modal-detail">
                            <p>더 이상 뽑을 수 있는 잼얘가 없습니다.
                                <br>잼얘를 구걸하시겠습니까?
                                <br>구걸 시 본인을 제외한 그룹의 모든 회원에게 쪽지가 전송됩니다.
                            </p>
                            <button class='btn btn-dark' @click="onBeg">잼얘 구걸하기</button>
                            <button class='btn btn-dark' @click="showBegModal = false">닫기</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

    </b-container>
  </template>
  
  <script>
import { nextTick } from 'vue';
import axios from '@/js/axios';
import gachaVideo from '@/assets/img/gacha.mp4'

export default {
    name: 'MainHome',
    data() {
        return {
            currentGroup: null,
            groupInfos: {},
            showBegModal: false
        }
    },
    methods: {
        login() {
            this.$router.push("/login")
        },
        routerMessage() {
            nextTick(() => {
               this.$router.push({ name: 'messageCreate', params: { seq: this.currentGroup.groupSequence } });
            });
        },
        routerPost() {
            nextTick(() => {
               this.$router.push({ name: 'postCreate', params: { seq: this.currentGroup.groupSequence } });
            });
        },
        groupSelect(group) {
            this.$emit("groupSelect", group)
            this.$cookies.set("groupSeq", group.groupSequence)
            this.getGroupInfo(group.groupSequence)
        },
        groupList() {
            axios.get("/api/group/list", {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            }).then (r => {
                this.groupInfos = r.data.data
            })
        },
        luckyDraw() {
            if(this.currentGroup == null) {
                this.$toastr.warning("잼얘를 뽑을 그룹을 먼저 선택해주세요.")
                return
            }
    
            axios.get("/api/post/lucky-draw/" + this.currentGroup.groupSequence, {
            headers: {
                    Authorization: `Bearer ` + this.$cookies.get('accessToken')
                }
            })
            .then(r => {
                const postInfo = r.data.data

                // 1. 비디오 엘리먼트 동적 생성
                const video = document.createElement('video')
                video.src = gachaVideo
                video.autoplay = true
                video.playsInline = true
                video.muted = true // 모바일 autoplay 보장용
                video.style.position = 'fixed'
                video.style.top = '50%'
                video.style.left = '50%'
                video.style.transform = 'translate(-50%, -50%)'
                video.style.width = 'auto'
                video.style.height = '80vh' // 세로 기준으로 꽉 차게
                video.style.zIndex = '9999'
                video.style.objectFit = 'cover'

                document.body.appendChild(video)

                // 2. 영상이 끝나면 페이지 이동 + 영상 제거
                video.addEventListener('ended', () => {
                    document.body.removeChild(video)

                    if (postInfo.type === "MSG") {
                        this.$router.push({
                            name: 'messageJamye',
                            params: { postSeq: postInfo.postSequence },
                            query: { groupSeq: this.currentGroup.groupSequence }
                        })
                    } else {
                        this.$router.push({
                            name: 'boardJamye',
                            params: { postSeq: postInfo.postSequence },
                            query: { groupSeq: this.currentGroup.groupSequence }
                        })
                    }
                })
            })
            .catch(e => {
                if (e.response?.data?.code === 'ALL_POSTS_ALREADY_OWNED') {
                    this.showBegModal=true
                } else {
                    this.$toastr.error(e.response.data.message)
                }
            })

            
        },
        onBeg() {
            axios.post(`/api/group/${this.currentGroup.groupSequence}/panhandling`, {}, {
                headers: {
                    Authorization: `Bearer `+this.$cookies.get('accessToken')
                }
            }).then(() => {
                this.$toastr.success("잼얘 독촉 성공")
                this.showBegModal = false
            }).catch(e => {
                this.$toastr.error(e.response.data.message)
            })
            
        },
        getGroupInfo(groupSeq) {
            console.log(groupSeq)
            axios.get("/api/group/name/" + groupSeq, {
              headers: {
              Authorization: `Bearer ${this.$cookies.get('accessToken')}`
              }
          }).then(r => {
                this.currentGroup = r.data.data
          }).catch(() => {
            this.$cookies.remove("groupSeq")
          }) 
        }
    },
    props: {
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        const groupSeq = this.$cookies.get("groupSeq")
        if(groupSeq != null) {
            this.getGroupInfo(groupSeq)
        }
        axios.get("/").then(r => {
            console.log("응답 데이터:", r)
            console.log("접속테스트 성공:", r.data)
        }).catch(e => {
            console.log("접속테스트 성공:", e)
        })
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
    .btn-group {
        margin-top: 10px;
        height: 60px;
        align-items: center;
        justify-content: center;
        border-radius: 15px;
        font-size: 30px;
    }
    .title {
        font-size: 30px; /* 제목 크기 조정 */
        margin: 0; /* 기본 여백 제거 */
        margin-top: 65px;
        margin-bottom: 10px;
    }
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6); /* 반투명 배경 */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }
    .modal-detail {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
    }
    .modal-detail button {
        margin: 0.5rem;
    }
</style>