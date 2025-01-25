import axios from 'axios';
// import VueCookie from 'vue-cookie';

let activeRequests = 0;
let loadingCallback = null;

const instance = axios.create({
  baseURL: 'http://localhost:8080',
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
    if (error.response && error.response.status === 403) {
      const refreshToken = document.cookie.match('(^|;) ?' + 'refreshToken' + '=([^;]*)(;|$)')[2];
      console.log(refreshToken)
      try {
        const refreshResponse = await instance.post('/api/user/refresh', {
          refreshToken: refreshToken
        });
        console.log(refreshResponse.data.data)
        var date = new Date();
        date.setDate(date.getDate() + 1000 * 60 * 60 * 24);
        console.log(date.toUTCString())
        console.log(encodeURIComponent("accessToken") + '=' + encodeURIComponent(refreshResponse.data.data.accessToken) + ';expires=' + date.toUTCString() + ';path=/')
        document.cookie = encodeURIComponent("accessToken") + '=' + encodeURIComponent(refreshResponse.data.data.accessToken) + ';expires=' + date.toUTCString() + ';path=/';
        
        console.log('토큰 리프레시 성공:', refreshResponse.data);
        error.config.headers['Authorization'] = `Beare ${refreshResponse.data.data.accessToken}`
        return instance.request(error.config)
      } catch (refreshError) {
        console.error('리프레시 API 호출 실패:', refreshError);
        
        // document.cookie = encodeURIComponent("accessToken") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        // document.cookie = encodeURIComponent("refreshToken") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        // document.cookie = encodeURIComponent("id") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        // document.cookie = encodeURIComponent("sequence") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';
        // document.cookie = encodeURIComponent("group") + '=; expires=Thu, 01 JAN 1999 00:00:10 GMT';

        // VueCookie.$router.push("/login")
      }
    }
    if (activeRequests === 0 && loadingCallback) loadingCallback(false); 
    return Promise.reject(error);
});

export default instance;
