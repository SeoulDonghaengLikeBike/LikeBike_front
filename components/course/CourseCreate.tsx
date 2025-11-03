import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState } from "react";

import { getCourseCount } from "@/apis/course/getCourseCount";

import BubbleChat from "../common/BubbleChat";
import ButtonModal from "../common/ButtonModal";
import EmSpan from "../common/EmSpan";
import WhiteBox from "../common/WhiteBox";
import CourseCardList from "./CourseCardList";
import KakaoMapView from "./KakaoMapView";
import { IKakaoMapPoint } from "@/types/course";
import { HAS_SEEN_COURSE_MODAL } from "@/constant/storageName";

interface Props {
  goToList: () => void;
}

const CourseCreate = ({ goToList }: Props) => {
  const { data: courseCount, refetch } = useQuery({
    queryKey: ["courseCount"],
    queryFn: getCourseCount,
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  const [placeInfo, setPlaceInfo] = useState<(IKakaoMapPoint | null)[]>([
    null,
    null,
  ]);

  const places = useMemo(
    () => placeInfo.filter((p) => p !== null),
    [placeInfo]
  );

  useEffect(() => {
    const res = localStorage.getItem(HAS_SEEN_COURSE_MODAL);
    if (res !== "true") setGuideModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ButtonModal
        buttonText="확인"
        contents={[
          "1. ‘도착지 선택’ 옆",
          "[+] 버튼을 누릅니다",
          "",
          "2. ‘경유지 선택’이 생성됩니다",
          "(최대 2개 생성 가능)",
          // "",
          // "*2주차(11/9~11/15) 특별 이벤트*",
          // "[출발지, 경유지, 도착지] 각각의",
          // "추천 이유를 다르게 적어 제출하면",
          // "우수 코스를 선정하여 보너스 점수를 드립니다!",
          // "(추후 LIKE BIKE 인스타그램 게재 예정)",
        ]}
        image={"/images/course_preview.jpg"}
        isOpen={guideModalOpen}
        title="‘경유지 추가 기능’ 안내"
        onClickButton={() => {
          setGuideModalOpen(false);
          localStorage.setItem(HAS_SEEN_COURSE_MODAL, "true");
        }}
        isRed
        hasBackDrop
      />
      <ButtonModal
        buttonText="추천 내역 확인하기"
        contents={[
          "점수 지급에 1~2일이 소요됩니다.",
          "우수 사례의 경우, 공식 인스타그램에 공유될 수 있습니다.",
        ]}
        isList
        isOpen={modalIsOpen}
        isRed
        onClickButton={() => {
          setModalIsOpen(false);
          refetch();
          goToList();
        }}
        title="‘자전거 코스 추천’ 완료"
      />
      <ButtonModal
        buttonText="확인"
        contents={["장소 선택 / 사진 업로드 / 추천 이유", "작성 필요"]}
        isOpen={errorModalIsOpen}
        isRed
        onClickButton={() => {
          setErrorModalIsOpen(false);
        }}
        title="‘자전거 코스 추천’ 제출 실패"
      />
      <BubbleChat text="이렇게 인증해주세요!" />
      <div className="flex flex-col gap-2">
        <WhiteBox>
          <div>
            ① 추천하고 싶은 <EmSpan>[장소]</EmSpan> 선택하기
          </div>
          <div>
            ② 장소 옆 <EmSpan>[사진]</EmSpan> 업로드하기
          </div>
          <div>
            ③ <EmSpan>[추천 이유]</EmSpan>를 적고 코스 추천 제출하기
          </div>
        </WhiteBox>
      </div>
      <div className="flex flex-col gap-4">
        <div
          className={`bg-gray-light rounded-2xl h-[174px] w-full flex items-center justify-center`}
        >
          <KakaoMapView places={places} />
        </div>
        <Suspense>
          <CourseCardList
            courseCount={courseCount}
            setErrorModalIsOpen={setErrorModalIsOpen}
            setModalIsOpen={setModalIsOpen}
            placeInfo={placeInfo}
            setPlaceInfo={setPlaceInfo}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default CourseCreate;
