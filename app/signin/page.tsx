"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { ACCESS_TOKEN } from "@/constant/storageName";

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function Home() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${window.location.origin}/oauth&response_type=code`;
    if (kakaoLoginUrl) {
      window.location.href = kakaoLoginUrl;
    } else {
      console.error("Kakao login URL is not defined.");
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem(ACCESS_TOKEN, "mock-access-token-demo");
    router.replace("/");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full min-h-screen">
      <Image src="/images/logo.svg" alt="logo" width={231} height={36} />

      {isMock ? (
        <button
          onClick={handleDemoLogin}
          className="flex items-center justify-center w-[300px] min-h-[45px] bg-primary text-white rounded-lg cursor-pointer font-bold text-lg"
        >
          데모 로그인
        </button>
      ) : (
        <div
          onClick={handleKakaoLogin}
          className="flex items-center justify-center w-[300px] min-h-[45px] bg-gray-200 cursor-pointer relative"
        >
          <Image
            src="/images/kakao_login_large_wide.png"
            alt="login"
            fill={true}
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
