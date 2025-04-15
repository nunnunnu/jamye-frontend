import { createRouter, createWebHistory } from 'vue-router'
import MainHome from "../components/MainHome.vue"
import Login from "../components/Login.vue"
import MyPage from "../components/MyPage.vue"
import MemberJoin from '@/components/MemberJoin.vue'
import GroupInfos from '@/components/GroupInfos.vue'
import GroupAdd from '@/components/GroupAdd.vue'
import GroupInfo from '@/components/GroupInfo.vue'
import MessageCreate from '@/components/MessageCreate.vue'
import ImageBox from '@/components/ImageBox.vue'
import PostCreate from '@/components/PostCreate.vue'
import JamyeList from '@/components/JamyeList.vue'
import BoardJamye from '@/components/BoardJamye.vue'
import MessageJamye from '@/components/MessageJamye.vue'
import LeaveGroup from '@/components/LeaveGroup.vue'
import UserInfoEdit from '@/components/UserInfoEdit.vue'
import EditProfile from '@/components/EditProfile.vue'
import NotifyBox from '@/components/NotifyBox.vue'
import ImagePreviewOpen from '@/components/ImagePreviewOpen.vue'
import CommentList from '@/components/CommentList.vue'
import DiscordLogin from '@/components/DiscordLogin.vue'
import KakaoLogin from '@/components/KakaoLogin.vue'
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
        path: "/jamye/message:postSeq",
        name: "messageJamye",
        component: MessageJamye,
        props: true
    },
    {
        path: "/jamye/board:postSeq",
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
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  
  export default router