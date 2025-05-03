import { createRouter, createWebHistory } from 'vue-router'
import MainHome from "../components/MainHome.vue"
import Login from "../components/user/Login.vue"
import MyPage from "../components/user/MyPage.vue"
import MemberJoin from '@/components/user/MemberJoin.vue'
import GroupInfos from '@/components/group/GroupInfos.vue'
import GroupAdd from '@/components/group/GroupAdd.vue'
import GroupInfo from '@/components/group/GroupInfo.vue'
import MessageCreate from '@/components/post/MessageCreate.vue'
import ImageBox from '@/components/post/ImageBox.vue'
import PostCreate from '@/components/post/PostCreate.vue'
import JamyeList from '@/components/post/JamyeList.vue'
import BoardJamye from '@/components/post/BoardJamye.vue'
import MessageJamye from '@/components/post/MessageJamye.vue'
import LeaveGroup from '@/components/group/LeaveGroup.vue'
import UserInfoEdit from '@/components/user/UserInfoEdit.vue'
import EditProfile from '@/components/group/EditProfile.vue'
import NotifyBox from '@/components/user/NotifyBox.vue'
import ImagePreviewOpen from '@/components/ImagePreviewOpen.vue'
import CommentList from '@/components/post/CommentList.vue'
import DiscordLogin from '@/components/user/DiscordLogin.vue'
import KakaoLogin from '@/components/user/KakaoLogin.vue'
import FindId from '@/components/user/FindId.vue'
const routes = [
    {
        path: "/",
        name: 'home',
        component: MainHome
    },
    {
        path: "/login",
        name: 'login',
        component: Login
    },
    {
        path: "/my",
        name: "my",
        component: MyPage
    },
    {
        path: "/join",
        name: "join",
        component: MemberJoin
    },
    {
        path: "/groups",
        name: "groups",
        component: GroupInfos
    },
    {
        path: "/add",
        name: "add",
        component: GroupAdd
    },
    {
        path: "/group:seq",
        name: "groupInfo",
        component: GroupInfo,
        props: true
    },
    {
        path: "/create/message:seq",
        name: "messageCreate",
        component: MessageCreate,
        props: true
    },
    {
        path: "/create/post:seq",
        name: "postCreate",
        component: PostCreate,
        props: true
    },
    {
        path: "/image-box:imageKey&imageSeq",
        name: "imageBox",
        component: ImageBox,
        props: true
    },
    {
        path: "/jamye-list",
        name: "jamyeList",
        component: JamyeList
    },
    {
        path: "/jamye/message:postSeq&groupSeq",
        name: "messageJamye",
        component: MessageJamye,
        props: true
    },
    {
        path: "/jamye/board:postSeq&groupSeq",
        name: "boardJamye",
        component: BoardJamye,
        props: true
    },
    {
        path: "/leave-group",
        name: "leaveGroup",
        component: LeaveGroup,
        props: true
    },
    {
        path: "/edit-profile",
        name: "editProfile",
        component: EditProfile,
        props: true
    },
    {
        path: "/user-info",
        name: "userInfoEdit",
        component: UserInfoEdit,
    },
    {
        path: "/notify-box",
        name: "notifyBox",
        component: NotifyBox,
    },
    {
        path: "/image-preview-open",
        name: "imagePreviewOpen",
        component: ImagePreviewOpen,
        props: true
    },
    {
        path: "/comment-list:postSeq",
        name: "comment-list",
        component: CommentList,
        props: true
    },
    {
        path: "/oauth/redirect",
        name: "discordLogin",
        component: DiscordLogin
    },
    {
        path: "/oauth/kakao",
        name: "kakaoLogin",
        component: KakaoLogin,
    },
    { 
        path: '/:pathMatch(.*)*', 
        name: 'NotFound', 
        component: MainHome
      },
      {
        path: "/find/id:activeTab",
        name: "findId",
        component: FindId,
        props: true
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})
  
  
  export default router