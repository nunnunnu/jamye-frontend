import { createRouter, createWebHistory } from 'vue-router'
import MainHome from "../components/MainHome.vue"
import Login from "../components/Login.vue"


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
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  
  export default router