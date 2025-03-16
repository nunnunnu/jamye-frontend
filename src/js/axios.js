import axios from 'axios';
import router from '@/router';
import { BASE_URL } from '@/js/config';
import { toast } from '@/main';

let activeRequests = 0;
let loadingCallback = null;
console.log(BASE_URL)
const instance = axios.create({
  baseURL: BASE_URL
});

export const setLoadingCallback = (callback) => {
  loadingCallback = callback;
};

instance.interceptors.request.use((config) => {
  activeRequests++;
  if (loadingCallback) loadingCallback(true); // 로딩 시작
  return config;
}, (error) => {
  return Promise.reject(error);
});

instance.interceptors.response.use((response) => {
  activeRequests--;
  if (activeRequests === 0 && loadingCallback) loadingCallback(false); // 로딩 종료
  return response;
}, async (error) => {
    activeRequests--;
    console.log(error.response)
    if (error.response && error.response.status === 403) {
      const match = document.cookie.match('(^|;) ?refreshToken=([^;]*)(;|$)');
      const refreshToken = match ? match[2] : null;
      if(refreshToken == null) {
        toast.error("로그인을 먼저 해주세요")
          document.cookie = encodeURIComponent("accessToken") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
          document.cookie = encodeURIComponent("refreshToken") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
          document.cookie = encodeURIComponent("id") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
          document.cookie = encodeURIComponent("sequence") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
          document.cookie = encodeURIComponent("group") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
          
          router.push("/login");
          return
      }
      try {
        const refreshResponse = await instance.post('/api/user/refresh', {
          refreshToken: refreshToken
        });
        var date = new Date();
        date.setTime(date.getTime() + 24 * 60 * 60 * 1000); 
        document.cookie = encodeURIComponent("accessToken") + '=' + encodeURIComponent(refreshResponse.data.data.accessToken) + ';expires=' + date.toUTCString() + ';path=/';
        
        error.config.headers['Authorization'] = `Bearer ${refreshResponse.data.data.accessToken}`
        return instance.request(error.config)
      } catch (refreshError) {
        console.log("됐나?")
        console.log(refreshError.response.data.code)
        if(refreshError.response.data.code == 'NON_EXISTENT_USER') {
          toast.error("잘못된 접근입니다. 다시 로그인해주세요")
        } else if(refreshError.response.data.code == 'SESSION_EXPIRED') {
          toast.error("다시 로그인해주세요.")
        }
        
        document.cookie = encodeURIComponent("accessToken") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        document.cookie = encodeURIComponent("refreshToken") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        document.cookie = encodeURIComponent("id") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        document.cookie = encodeURIComponent("sequence") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        document.cookie = encodeURIComponent("group") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        
        router.push("/login");
        return
      }
    }
      
    if (activeRequests === 0 && loadingCallback) loadingCallback(false); 
    return Promise.reject(error);
});

export default instance;
