import axios from "axios";

import { ACCESS_TOKEN } from "@/constant/storageName";

import { refreshAccessToken } from "./user/refreshToken";
import { mockAdapter } from "@/mocks/mockAdapter";

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const axiosInstance = axios.create({
  baseURL: isMock ? "" : process.env.NEXT_PUBLIC_API_URL,
  ...(isMock ? { adapter: mockAdapter } : {}),
});

axiosInstance.interceptors.request.use(
  (config) => {
    // 경로가 signin, signup, oauth가 아닌 경우에만 토큰을 헤더에 추가
    // 토큰 없으면 리퀘스트 안보냄
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      return config; // 토큰이 없으면 요청을 보내지 않음
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 토큰 재발급 중복 요청 방지를 위한 플래그
let isRefreshing = false;

// 응답 에러 처리 및 토큰 재발급
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();

        // 토큰 업데이트 후 재요청
        localStorage.setItem(ACCESS_TOKEN, newAccessToken);
        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem(ACCESS_TOKEN);
        console.error("Token refresh failed:", refreshError);

        // 알림 표시 후 로그인 페이지로 리다이렉트
        // alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    // 401이지만 이미 재시도했거나 재발급 중인 경우
    if (error.response && error.response.status === 401) {
      console.error(
        "Unauthorized access - token refresh failed or already attempted",
      );
    }

    return Promise.reject(error);
  },
);
