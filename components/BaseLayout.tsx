"use client";

import { CircularProgress } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { ACCESS_TOKEN } from "@/constant/storageName";

import Header from "./Header";
import KakaoLoader from "./KakaoLoader";

// QueryClient를 컴포넌트 외부로 이동하여 캐싱이 작동하도록 수정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 요청 최소화를 위한 주요 옵션들
      refetchOnWindowFocus: false, // 창 포커싱 시 refetch 안 함
      refetchOnReconnect: false, // 네트워크 재연결 시 refetch 안 함
      retry: 1, // 실패 시 재시도 횟수 (0으로 끄는 것도 가능)
      staleTime: 1000 * 60 * 5, // 5분 동안은 stale 상태가 아님 → 재요청 안함
    },
  },
});

const BaseLayout = ({ children }: { children: ReactNode }) => {
  // 로컬스토리지에 accessToken이 없으면 로그인 페이지로 이동
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (!accessToken && pathname !== "/signin" && pathname !== "/oauth") {
      router.push("/signin");
    } else if (
      accessToken &&
      (pathname === "/signin" || pathname === "/oauth")
    ) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <KakaoLoader />
      <div className="flex flex-col justify-center items-center w-full h-full bg-gray-400">
        <div className="flex flex-col w-full max-w-[460px] h-full min-h-screen bg-gray-background">
          <Header />
          <div className="flex flex-col w-full h-full flex-1 p-4">
            {children}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default BaseLayout;
