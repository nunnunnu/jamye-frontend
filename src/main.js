import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import VueCookies from "vue-cookies";
import '@fortawesome/fontawesome-free/css/all.css';
import toastr from 'toastr'
import 'toastr/build/toastr.min.css'


const app = createApp(App)
app.use(router).use(bootstrap)
app.config.globalProperties.$http = axios
app.use(VueCookies)
app.$cookies.config("7d");
app.mount('#app')

toastr.options = {
    positionClass: "toast-top-center" // 중앙 상단
    // closeButton: true, // 닫기 버튼 추가
    // progressBar: true, // 진행 바 표시
};

app.config.globalProperties.$toastr = toastr

export const toast = toastr

// Add the necessary CSS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import bootstrap from 'bootstrap'

import { BASE_URL } from '@/js/config';
axios.defaults.baseURL=BASE_URL