import { createRouter, createWebHistory } from 'vue-router'
import MainHome from "../components/MainHome.vue"
import Login from "../components/Login.vue"
import MyPage from "../components/MyPage.vue"
import MemberJoin from '@/components/MemberJoin.vue'
import GroupInfos from '@/components/GroupInfos.vue'
import GroupAdd from '@/components/GroupAdd.vue'

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
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  
  export default router