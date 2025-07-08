import axios from 'axios';
import router from '@/router';
import { BASE_URL } from '@/js/config';
import { toast } from '@/main';

let activeRequests = 0;
let loadingCallback = null;

console.log("BASE_URL:" + BASE_URL);

const instance = axios.create({
  baseURL: BASE_URL
});

export const setLoadingCallback = (callback) => {
  loadingCallback = callback;
};

instance.interceptors.request.use((config) => {
  activeRequests++;
  if (loadingCallback && !config.skipLoading) loadingCallback(true); // 로딩 시작
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
  console.log("error:" + JSON.stringify(error.response));

  if (error.response && error.response.status === 403) {
    const refreshToken = localStorage.getItem('refreshToken'); // 수정함
    if (refreshToken == null) {
      toast.error("로그인을 먼저 해주세요");

      localStorage.removeItem("accessToken"); // 수정함
      localStorage.removeItem("refreshToken"); // 수정함
      localStorage.removeItem("id"); // 수정함
      localStorage.removeItem("sequence"); // 수정함
      localStorage.removeItem("groupSeq"); // 수정함

      router.push("/login");
      return;
    }

    try {
      const refreshResponse = await instance.post('/api/user/refresh', {
        refreshToken: refreshToken
      });

      const newAccessToken = refreshResponse.data.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken); // 수정함

      error.config.headers['Authorization'] = `Bearer ${newAccessToken}`; // 수정함
      return instance.request(error.config);
    } catch (refreshError) {
      if (refreshError.response?.data?.code === 'NON_EXISTENT_USER') {
        toast.error("잘못된 접근입니다. 다시 로그인해주세요");
      } else if (refreshError.response?.data?.code === 'SESSION_EXPIRED') {
        toast.error("다시 로그인해주세요.");
      }

      localStorage.removeItem("accessToken"); // 수정함
      localStorage.removeItem("refreshToken"); // 수정함
      localStorage.removeItem("id"); // 수정함
      localStorage.removeItem("sequence"); // 수정함
      localStorage.removeItem("groupSeq"); // 수정함

      router.push("/login");
      return;
    }
  } else if (error.response?.status >= 500) {
    toast.error("알수없는 오류입니다. 운영자에게 문의해주세요.");
  }

  if (activeRequests === 0 && loadingCallback) loadingCallback(false);
  return Promise.reject(error);
});

export default instance;
