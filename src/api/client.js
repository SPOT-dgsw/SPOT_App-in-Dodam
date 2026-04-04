import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

// 도담 토큰을 저장할 변수
let dodamToken = null;

// 도담 토큰 설정 함수
export function setDodamToken(token) {
  dodamToken = token;
}

// 요청 인터셉터: 도담 토큰이 있으면 헤더에 추가
api.interceptors.request.use((config) => {
  if (dodamToken) {
    config.headers['X-Dodam-Token'] = dodamToken;
  }
  return config;
});

export default api;
