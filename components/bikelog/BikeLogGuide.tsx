import { useQuery } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import createBikeLog from "@/apis/bikelog/createBikeLog";
import { getBikeCount } from "@/apis/bikelog/getBikeCount";
import { EXAMPLE_IMAGES } from "@/constant/bikelog";

import BubbleChat from "../common/BubbleChat";
import ButtonModal from "../common/ButtonModal";
import EmSpan from "../common/EmSpan";
import WhiteBox from "../common/WhiteBox";
import ExampleStatusCard from "./ExampleStatusCard";
import UploadModal from "./UploadModal";
import { HAS_SEEN_BIKE_MODAL } from "@/constant/storageName";
import UploadConfirmModal from "./UploadConfirmModal";
import { IError } from "@/types/base";
import { AxiosError } from "axios";

const BikeLogGuide = ({ setValue }: { setValue: (value: any) => void }) => {
  const hatFile = useRef<File | null>(null);
  const bikeFile = useRef<File | null>(null);
  const [hatUploadModalOpen, setHatUploadModalOpen] = useState(false);
  const [bikeUploadModalOpen, setBikeUploadModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [confrimModalOpen, setConfirmModalOpen] = useState(false);
  const [hatPreview, setHatPreview] = useState<string | null>(null);
  const [bikePreview, setBikePreview] = useState<string | null>(null);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const { data: bikeCount } = useQuery({
    queryKey: ["bikeCount"],
    queryFn: getBikeCount,
  });

  const isAlreadyCertified = bikeCount && bikeCount > 0;

  const clearUpload = () => {
    hatFile.current = null;
    bikeFile.current = null;
    setBikePreview(null);
    setHatPreview(null);
    setConfirmModalOpen(false);
  };

  const handleUpload = async () => {
    setConfirmModalOpen(false);

    if (hatFile.current && bikeFile.current) {
      try {
        await createBikeLog({
          bike_photo: bikeFile.current,
          safety_gear_photo: hatFile.current,
        });
        clearUpload();
        setCompleteModalOpen(true);
      } catch (e) {
        setConfirmModalOpen(true);
        const error = e as AxiosError<IError>;
        console.log("e", e);
        alert(
          "인증에 실패했습니다. 다시 시도해주세요. [" +
            (error?.response?.data.data?.[0].error || "알 수 없는 오류") +
            "]"
        );
      }
    } else {
      setConfirmModalOpen(true);
      alert("모든 사진을 업로드해주세요!");
    }
  };

  useEffect(() => {
    const res = localStorage.getItem(HAS_SEEN_BIKE_MODAL);
    if (res !== "true") setGuideModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ButtonModal
        buttonText="확인"
        contents={[
          "‘안전모+사용자’는",
          "얼굴이 확인되는 셀카 1장",
          "",
          "‘자전거’는 브레이크 달린",
          "자전거만 찍은 사진 1장",
          "",
          "각 1장씩 (총 2장 세트)으로",
          "인증해주세요.",
        ]}
        image={"/images/bike_preview.jpg"}
        isOpen={guideModalOpen}
        title="자전거 타기 인증 예시"
        onClickButton={() => {
          setGuideModalOpen(false);
          localStorage.setItem(HAS_SEEN_BIKE_MODAL, "true");
        }}
        hasBackDrop
      />
      <ButtonModal
        buttonText="인증 내역 확인하기"
        contents={[
          "점수 지급에 1~2일이 소요됩니다.",
          "점수는 자동 지급됩니다.",
        ]}
        isList
        isOpen={completeModalOpen}
        onClickButton={() => {
          setValue(2);
          setCompleteModalOpen(false);
        }}
        title="‘자전거 타기 인증’ 완료"
      />
      <UploadModal
        prefix="hat"
        confirm={{
          title: `[안전모+사용자]를 업로드할까요?`,
          onOk: (file, preview) => {
            hatFile.current = file;
            setHatPreview(preview);
            setHatUploadModalOpen(false);
            setBikeUploadModalOpen(true);
          },
          onCancel: () => {
            hatFile.current = null;
            setHatPreview(null);
            bikeFile.current = null;
            setBikePreview(null);
          },
        }}
        upload={{
          title: "[안전모+사용자] 업로드",
          contents: [
            "안전모를 착용한 사용자 얼굴이",
            "보이는 정면 사진을 업로드",
          ],
          isOpen: hatUploadModalOpen,
          setOpen: setHatUploadModalOpen,
        }}
      />
      <UploadModal
        prefix="bike"
        confirm={{
          title: `[자전거]를 업로드할까요?`,
          onOk: async (file, preview) => {
            bikeFile.current = file;
            setBikePreview(preview);
            setBikeUploadModalOpen(false);
            setConfirmModalOpen(true);
          },
          onCancel: () => {
            bikeFile.current = null;
            setBikePreview(null);
          },
        }}
        upload={{
          title: "[자전거] 업로드",
          contents: ["브레이크가 확인되는 자전거 사진을 업로드"],
          isOpen: bikeUploadModalOpen,
          setOpen: setBikeUploadModalOpen,
        }}
      />
      <UploadConfirmModal
        hatPreview={hatPreview}
        bikePreview={bikePreview}
        confirmOpen={confrimModalOpen}
        onCancel={clearUpload}
        onOk={async () => {
          await handleUpload();
        }}
      />
      <BubbleChat text="이렇게 인증해주세요!" />
      <WhiteBox>
        <div>
          ① 하단의 <EmSpan>[인증 시작]</EmSpan> 누르기
        </div>
        <div>
          ② <EmSpan>[안전모+사용자, 자전거]</EmSpan> 업로드 하기
        </div>
      </WhiteBox>
      <BubbleChat text="인증 기준" />
      <div className="flex flex-row gap-2 overflow-x-auto">
        {EXAMPLE_IMAGES.map((v, idx) => (
          <div key={idx}>
            <ExampleStatusCard
              chipText={v.chipText}
              status={v.status ? "success" : "error"}
            >
              <img
                alt="example"
                className="object-cover h-full pb-4"
                height={160}
                src={`/images/bikelog/image${v.imageIdx}.png`}
                width={120}
              />
            </ExampleStatusCard>
            <div className="text-xs mt-2 flex flex-col gap-1">
              <strong>[인증 {v.status ? "성공" : "실패"}] </strong>
              {v.description}
            </div>
          </div>
        ))}
      </div>

      <BubbleChat
        text={isAlreadyCertified ? "오늘 인증 완료!" : "버튼을 눌러주세요!"}
      />
      {isAlreadyCertified ? (
        <button className="bg-gray-lightest p-10 text-center rounded-2xl text-gray-medium">
          <div>하루 1번, 인증 할 수 있어요!</div>
          <div className="text-2xl font-bold">인증 완료</div>
        </button>
      ) : (
        <button
          className="bg-secondary-light p-10 text-center rounded-2xl cursor-pointer"
          onClick={() => setHatUploadModalOpen(true)}
        >
          <div>아직 점수를 받지 않았어요!</div>
          <div className="text-2xl font-bold">인증 시작</div>
        </button>
      )}
    </div>
  );
};

export default BikeLogGuide;
