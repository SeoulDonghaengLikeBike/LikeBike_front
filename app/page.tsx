"use client";

import ButtonModal from "@/components/common/ButtonModal";
import BikeLogMain from "@/components/main/BikeLogMain";
import CourseMain from "@/components/main/CourseMain";
import NewsMain from "@/components/main/NewsMain";
import QuizMain from "@/components/main/QuizMain";
import RewardMain from "@/components/main/RewardMain";
import { HAS_SEEN_QUIZ_NOTICE_MODAL } from "@/constant/storageName";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function Home() {
  // const router = useRouter();
  // const isBlock = dayjs().format("YYYY-MM-DD") == "2025-11-01";
  const mainModalBlock = dayjs().isAfter("2025-11-05");
  const [mainModalOpen, setMainModalOpen] = useState(false);

  useEffect(() => {
    const res = localStorage.getItem(HAS_SEEN_QUIZ_NOTICE_MODAL);
    if (res !== "true") setMainModalOpen(true);
  }, []);

  return (
    <>
      <ButtonModal
        buttonText="확인"
        contents={[
          "안녕하세요, LIKE BIKE 운영팀입니다.",
          "",
          "11월 4일 안전 퀴즈 관련하여",
          "(Q. 어린이용 자전거가 성인 도로에서 위험한 이유는?)",
          "",
          "3가지 선택지 모두 정답 처리하는 것으로 결정하였습니다.",
          "(사유: 정답 중복 인정)",
          "",
          "따라서 11월 4일 퀴즈 참여자 전원을 대상으로",
          "정답 점수 10점을 지급할 예정이오니 참고 부탁드립니다.",
          "",
          "※ 기존 정답자 점수 변경 없음",
          "※ 오답자에게 10점 추가 지급",
          "",
          "앞으로 이와 같은 문제가 발생하지 않도록 노력하겠습니다.",
          "감사합니다. 🙏",
        ]}
        isOpen={mainModalOpen && mainModalBlock}
        title="11월 4일 안전 퀴즈 점수 인정 안내"
        onClickButton={() => {
          setMainModalOpen(false);
          localStorage.setItem(HAS_SEEN_QUIZ_NOTICE_MODAL, "true");
        }}
        hasBackDrop
      />

      {/* <ButtonModal
        isOpen={isBlock}
        buttonText="서비스 안내 보기"
        contents={[
          "내일 드디어 Likbike가 오픈합니다.",
          "서비스가 궁금하다면 지금 미리 살펴보세요!",
        ]}
        title="🎉 곧 만나요!"
        onClickButton={() => {
          router.push(
            `https://www.notion.so/22957842371d80f7a36dd27c1ec0d192?v=22757842371d80dab4ac000ce7a6f8c5&source=copy_link`
          );
        }}
        hasBackDrop={true}
      /> */}
      <div className="flex flex-col w-full h-full gap-4 pb-3">
        <RewardMain />
        <div className="grid grid-cols-2 gap-2">
          <BikeLogMain />
          <div className="flex flex-col gap-2">
            <QuizMain />
            <CourseMain />
          </div>
        </div>
        <div>
          <NewsMain />
        </div>
      </div>
    </>
  );
}
