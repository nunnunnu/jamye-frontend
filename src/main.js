import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import VueCookies from "vue-cookies";
import '@fortawesome/fontawesome-free/css/all.css';

const app = createApp(App)
app.use(router).use(bootstrap)
app.config.globalProperties.$http = axios
app.use(VueCookies)
app.$cookies.config("7d");
app.mount('#app')

// Add the necessary CSS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import bootstrap from 'bootstrap'

axios.defaults.baseURL="http://localhost:8080"