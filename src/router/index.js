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
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  
  export default router