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
}, (error) => {
  activeRequests--;
  if (activeRequests === 0 && loadingCallback) loadingCallback(false); // 로딩 종료
  return Promise.reject(error);
});

export default instance;
