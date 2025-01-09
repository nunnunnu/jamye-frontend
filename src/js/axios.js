import axios from 'axios';

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
      
      try {
        // const refreshResponse = await instance.post('/auth/refresh-token');
        // console.log('토큰 리프레시 성공:', refreshResponse.data);
      } catch (refreshError) {
        console.error('리프레시 API 호출 실패:', refreshError);
      }
    }
    if (activeRequests === 0 && loadingCallback) loadingCallback(false); 
    return Promise.reject(error);
});

export default instance;
