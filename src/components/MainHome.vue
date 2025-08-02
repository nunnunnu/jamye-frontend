<template>
    <b-container>
        <header class="masthead">
          <div v-if="showFirstGuide" class="first-guide-banner">
          <span>
              <b>잼얘가챠가 처음이신가요?</b> 먼저 <b>그룹을 생성</b>해야 잼얘가챠를 이용할 수 있습니다! 
              <b>상단 메뉴</b>에서 <b>그룹 정보</b>로 이동해 그룹을 생성해보세요!
          </span>
          <button class="btn btn-outline-secondary btn-sm" @click="skipFirstGuide" style="margin-left: 16px;">Skip</button>
          </div>
            <!-- vueTour 컴포넌트 추가 -->
            <v-tour
                name="mainHomeTour"
                :steps="tourSteps"
                @finish="handleTourFinish"
                @skip="handleTourSkip"
            />
            
            <!-- 메시지 투어 -->
            <v-tour
                name="messageTour"
                :steps="messageTourSteps"
                @finish="handleTourFinish"
                @skip="handleTourSkip"
            />
            
            <!-- 모달 내부 투어 -->
            <v-tour
                name="modalTour"
                :steps="modalTourSteps"
                @finish="handleModalTourFinish"
                @skip="handleModalTourSkip"
            />
            
            <!-- 메시지 모달 투어 -->
            <v-tour
                name="messageModalTour"
                :steps="messageModalTourSteps"
                @finish="handleModalTourFinish"
                @skip="handleModalTourSkip"
            />
            
            <div class="container px-5">
                <div v-if="isLogin" class="dropdown">
                    <a v-if="currentGroup==null" class="btn btn-dark dropdown-toggle group-select-btn" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" @click="groupList">
                        그룹을 선택해주세요.
                    </a>
                    <a v-else class="btn btn-dark dropdown-toggle group-select-btn" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" @click="groupList">
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
                                    <button type="button" class="btn btn-dark custom-btn jamye-create-btn" data-bs-toggle="modal" data-bs-target="#jamye-create">잼얘 넣기</button>
                                        <div class="modal fade" id="jamye-create" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" @mouseenter="checkModalTour">
                                            <div class="modal-dialog modal-dialog-centered">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h1 class="modal-title fs-5" id="jamye-create1">잼얘 생성</h1>
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click.stop></button>
                                                    </div>
                                                    <div class="modal-body">
                                                            <!-- 게시글 정보 입력 화면 -->
                                                            <div class="group-add">
                                                                <button class="btn btn-dark btn-block btn-group board-type-btn" data-bs-dismiss="modal" aria-label="Close" @click="routerPost()">
                                                                    게시글 형식
                                                                </button>
                                                                <button class="btn btn-dark btn-block btn-group message-type-btn" data-bs-dismiss="modal" aria-label="Close" @click="routerMessage()">메세지 형식</button>
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
import { getCurrentStep, TutorialStep, setStep } from '@/js/tutorialHelper';
import { setupGlobalTourEventListeners, cleanupGlobalTourEventListeners } from '@/js/tourEventListeners';

export default {
    name: 'MainHome',
    data() {
        return {
            currentGroup: null,
            groupInfos: {},
            showBegModal: false,
            showFirstGuide: false,
            tourSteps: [
                {
                    target: '.group-select-btn',
                    content: '방금 생성한 그룹을 먼저 선택해보세요!',
                    params: { 
                        placement: 'right',
                        enableScrolling: false
                    }
                },
                {
                    target: '.jamye-create-btn',
                    content: '잼얘는 여기서 생성할 수 있어요',
                    params: { 
                        placement: 'bottom',
                        enableScrolling: false
                    }
                }
            ],
            messageTourSteps: [
                {
                    target: 'button[data-bs-target="#jamye-create"]',
                    content: '이제 메세지 잼얘를 생성해볼까요?',
                    params: { 
                        placement: 'bottom',
                        enableScrolling: false
                    }
                }
            ],
            modalTourSteps: [
                {
                    target: '#jamye-create .board-type-btn',
                    content: '잼얘는 메세지 타입과 게시글 타입이 있어요! 먼저 게시글 먼저 작성해볼까요?',
                    params: { 
                        placement: 'bottom',
                        enableScrolling: false
                    }
                }
            ],
            messageModalTourSteps: [
                {
                    target: '.message-type-btn',
                    content: '여기서 메세지 잼얘를 작성해보아요!',
                    params: { 
                        placement: 'bottom',
                        enableScrolling: false
                    }
                }
            ]
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
            // 튜토리얼 상태가 3이면 모달 투어 중지
            if (getCurrentStep() === TutorialStep.BOARD_POST_CREATE) {
                if (this.$tours && this.$tours['modalTour']) {
                    this.$tours['modalTour'].stop();
                }
            }
            
            nextTick(() => {
               this.$router.push({ name: 'postCreate', params: { seq: this.currentGroup.groupSequence } });
            });
        },
        groupSelect(group) {
            this.$emit("groupSelect", group)
            localStorage.setItem("groupSeq", group.groupSequence)
            this.getGroupInfo(group.groupSequence)
            
            // 튜토리얼 상태가 3이면 vueTour를 다음 단계로 진행
            if (getCurrentStep() === TutorialStep.BOARD_POST_CREATE) {
                if (this.$tours && this.$tours['mainHomeTour']) {
                    this.$tours['mainHomeTour'].nextStep();
                }
            }
        },
        groupList() {
            axios.get("/api/group/list", {
                headers: {
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
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
                    Authorization: `Bearer ` + localStorage.getItem('accessToken')
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
                    Authorization: `Bearer `+localStorage.getItem('accessToken')
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
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
          }).then(r => {
                this.currentGroup = r.data.data
          }).catch(() => {
            localStorage.removeItem("groupSeq")
          }) 
        },
        handleModalOpen() {
            const currentStep = getCurrentStep();
            if (currentStep === TutorialStep.BOARD_POST_CREATE || currentStep === TutorialStep.MESSAGE_POST_CREATE) {
                // 모달이 완전히 열린 후 투어 시작
                setTimeout(() => {
                    this.startModalTour();
                }, 500);
            }
        },
        startModalTour() {
            const currentStep = getCurrentStep();
            
            // 타겟 요소 확인
            const targetElement = document.querySelector('#jamye-create .board-type-btn');
            console.log('Target element:', targetElement);
            
            if (targetElement && this.$tours) {
                console.log('Starting modal tour');
                
                // tutorialState가 4이면 메시지 모달 투어 사용
                if (currentStep === TutorialStep.MESSAGE_POST_CREATE) {
                    if (this.$tours['messageModalTour']) {
                        this.$tours['messageModalTour'].start();
                    }
                } else {
                    if (this.$tours['modalTour']) {
                        this.$tours['modalTour'].start();
                    }
                }
            } else {
                console.log('Modal tour not available or target not found');
                // 다시 시도
                setTimeout(() => {
                    if (this.$tours) {
                        console.log('Retrying modal tour');
                        
                        // tutorialState가 4이면 메시지 모달 투어 사용
                        if (currentStep === TutorialStep.MESSAGE_POST_CREATE) {
                            if (this.$tours['messageModalTour']) {
                                this.$tours['messageModalTour'].start();
                            }
                        } else {
                            if (this.$tours['modalTour']) {
                                this.$tours['modalTour'].start();
                            }
                        }
                    }
                }, 500);
            }
        },
        checkModalTour() {
            const currentStep = getCurrentStep();
            if (currentStep === TutorialStep.BOARD_POST_CREATE || currentStep === TutorialStep.MESSAGE_POST_CREATE) {
                // 마우스가 버튼 위에 올라갔을 때 투어 시작
                setTimeout(() => {
                    if (this.$tours) {
                        console.log('Starting modal tour on mouse enter');
                        
                        // tutorialState가 4이면 메시지 모달 투어 사용
                        if (currentStep === TutorialStep.MESSAGE_POST_CREATE) {
                            if (this.$tours['messageModalTour']) {
                                this.$tours['messageModalTour'].start();
                            }
                        } else {
                            if (this.$tours['modalTour']) {
                                this.$tours['modalTour'].start();
                            }
                        }
                    }
                }, 100);
            }
        },
        handleTourFinish() {
            console.log('Tour finished');
            setStep(TutorialStep.MESSAGE_POST_CREATE);
        },
        handleTourSkip() {
            console.log('Tour skipped');
            setStep(TutorialStep.MESSAGE_POST_CREATE);
        },
        handleModalTourFinish() {
            console.log('Modal Tour finished');
            setStep(TutorialStep.MESSAGE_POST_CREATE);
        },
        handleModalTourSkip() {
            console.log('Modal Tour skipped');
            setStep(TutorialStep.MESSAGE_POST_CREATE);
        }
    },
    props: {
        isLogin: {
            type: Boolean,
            required: true
        }
    },
    created() {
        const groupSeq = localStorage.getItem("groupSeq")
        if(groupSeq != null) {
            this.getGroupInfo(groupSeq)
        }
        axios.get("/").then(r => {
            console.log("응답 데이터:", r)
            console.log("접속테스트 성공:", r.data)
        }).catch(e => {
            console.log("접속테스트 성공:", e)
        })
    },
    mounted() {
        // 전역 투어 이벤트 리스너 설정
        setupGlobalTourEventListeners(this);
        
        // 모달 이벤트 리스너 추가
        const jamyeCreateModal = document.getElementById('jamye-create');
        if (jamyeCreateModal) {
            jamyeCreateModal.addEventListener('shown.bs.modal', this.handleModalOpen);
        }
        
        // 튜토리얼 상태가 3이면 투어 시작
        if (this.isLogin && getCurrentStep() === TutorialStep.BOARD_POST_CREATE) {
            this.$nextTick(() => {
                if (this.$tours && this.$tours['mainHomeTour']) {
                    this.$tours['mainHomeTour'].start();
                }
            });
        }
        
        // 튜토리얼 상태가 4이면 메시지 잼얘 생성 투어 시작
        if (this.isLogin && getCurrentStep() === TutorialStep.MESSAGE_POST_CREATE) {
            console.log('Starting message tour for tutorial state 4');
            this.$nextTick(() => {
                if (this.$tours && this.$tours['messageTour']) {
                    console.log('Message tour available, starting...');
                    this.$tours['messageTour'].start();
                } else {
                    console.log('Message tour not available:', this.$tours);
                }
            });
        }
        
        // tutorialState 직접 확인
        const tutorialState = localStorage.getItem('tutorialState');
        console.log('Current tutorial state:', tutorialState);
        if (this.isLogin && tutorialState === '4') {
            console.log('Starting message tour for tutorial state 4 (direct check)');
            setTimeout(() => {
                if (this.$tours && this.$tours['messageTour']) {
                    console.log('Message tour available, starting...');
                    this.$tours['messageTour'].start();
                } else {
                    console.log('Message tour not available:', this.$tours);
                }
            }, 500);
        }
        if (tutorialState === '0' || tutorialState === null) {
            this.showFirstGuide = true;
        }
    },
    beforeUnmount() {
        // 이벤트 리스너 제거
        cleanupGlobalTourEventListeners();
        const jamyeCreateModal = document.getElementById('jamye-create');
        if (jamyeCreateModal) {
            jamyeCreateModal.removeEventListener('shown.bs.modal', this.handleModalOpen);
        }
    },
    skipFirstGuide() {
    this.showFirstGuide = false;
    localStorage.setItem('tutorialState', 'done');
  },
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
    
    /* 잼얘 넣기 버튼에 대한 vueTour 스타일 */
    .jamye-create-btn {
        position: relative;
    }
    
    /* 모달 내부 버튼들에 대한 스타일 */
    .board-type-btn, .message-type-btn {
        position: relative;
    }
    
    /* vueTour Skip 버튼 숨기기 */
    :deep(.v-tour__skip) {
        display: none !important;
    }
    .first-guide-banner {
  width: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 18px 16px;
  font-size: 16px;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.first-guide-banner b {
  color: #ffe082;
}
.first-guide-banner .btn {
  margin-left: 18px;
  background: #fff;
  color: #764ba2;
  border: none;
  font-weight: bold;
}
.first-guide-banner .btn:hover {
  background: #eee;
}
</style>