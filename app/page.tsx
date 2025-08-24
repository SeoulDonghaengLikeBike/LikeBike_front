"use client";

import ButtonModal from "@/components/common/ButtonModal";
import BikeLogMain from "@/components/main/BikeLogMain";
import CourseMain from "@/components/main/CourseMain";
import MainBase from "@/components/main/MainBase";
import NewsMain from "@/components/main/NewsMain";
import QuizMain from "@/components/main/QuizMain";
import RewardMain from "@/components/main/RewardMain";
import { HAS_SEEN_MODAL } from "@/constant/storageName";
import { useEffect, useState } from "react";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem(HAS_SEEN_MODAL);
    if (!hasSeenModal) setModalOpen(true);
  }, []);

  return (
    <>
      <ButtonModal
        isOpen={modalOpen}
        buttonText="확인"
        contents={[
          "라이크바이크 서비스는",
          "2025년 8월 24일부로 종료됩니다.",
          "서비스 리워드는",
          "300점 달성 시 지급됩니다.",
          "마지막까지 조금만 더 힘내주세요! 🎁",
        ]}
        title="[서비스 종료 예정 안내]"
        onClickButton={() => {
          localStorage.setItem(HAS_SEEN_MODAL, "true");
          setModalOpen(false);
        }}
        hasBackDrop={true}
      />
      <div className="flex flex-col w-full h-full gap-6">
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
