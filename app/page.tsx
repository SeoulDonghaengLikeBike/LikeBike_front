"use client";

import ButtonModal from "@/components/common/ButtonModal";
import BikeLogMain from "@/components/main/BikeLogMain";
import CourseMain from "@/components/main/CourseMain";
import NewsMain from "@/components/main/NewsMain";
import QuizMain from "@/components/main/QuizMain";
import RewardMain from "@/components/main/RewardMain";
import {
  HAS_SEEN_CLOSE_MODAL,
  HAS_SEEN_QUIZ_NOTICE_MODAL,
} from "@/constant/storageName";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function Home() {
  // const router = useRouter();
  // const isBlock = dayjs().format("YYYY-MM-DD") == "2025-11-01";
  const [mainModalOpen, setMainModalOpen] = useState(false);

  useEffect(() => {
    const res = localStorage.getItem(HAS_SEEN_CLOSE_MODAL);
    if (res !== "true") setMainModalOpen(true);
  }, []);

  return (
    <>
      {/* <ButtonModal
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
      /> */}

      <ButtonModal
        isOpen={mainModalOpen}
        buttonText="확인"
        contents={[
          "라이크바이크 서비스는",
          "2025년 11월 15일부로 종료되었습니다.",
          "리워드 관련 안내는",
          "등록된 연락처를 통해 개별 전달됩니다.",
          "그동안 이용해 주셔서 감사합니다. 🙏",
        ]}
        title="[서비스 종료 안내]"
        onClickButton={() => {
          setMainModalOpen(false);
          localStorage.setItem(HAS_SEEN_CLOSE_MODAL, "true");
        }}
        hasBackDrop={true}
      />
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
