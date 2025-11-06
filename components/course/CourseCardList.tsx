"use client";

import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { createCourse } from "@/apis/course/createCourse";
import { ICourseCard, IKakaoMapPoint } from "@/types/course";
import CourseCard from "./CourseCard";
import ReactModal from "react-modal";
import { useRouter, useSearchParams } from "next/navigation";
import CourseSearch from "./CourseSearch";
import { IError } from "@/types/base";
import { AxiosError } from "axios";

interface Props {
  courseCount: number | undefined;
  setErrorModalIsOpen: (value: boolean) => void;
  setModalIsOpen: (value: boolean) => void;
  placeInfo: (IKakaoMapPoint | null)[];
  setPlaceInfo: Dispatch<SetStateAction<(IKakaoMapPoint | null)[]>>;
}

export default function CourseCardList({
  courseCount,
  setErrorModalIsOpen,
  setModalIsOpen,
  placeInfo,
  setPlaceInfo,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const modalIdx = params.has("modal") ? Number(params.get("modal")) : null;

  const isAlreadyCertified = courseCount && courseCount >= 2;

  const [courseInfo, setCourseInfo] = useState<ICourseCard[]>([
    { place: null, text: "", image: null },
    { place: null, text: "", image: null },
  ]);

  // 체크: 모든 코스 완성 여부
  const checkCompletedCourses = (res: ICourseCard[]) => {
    for (let i = 0; i < res.length; i++) {
      const course = res[i];
      if (!course.place || !course.text.trim()) return false;
      if ((i === 0 || i === res.length - 1) && !course.image) return false;
    }
    return true;
  };

  // 코스 제출
  const onSubmit = async () => {
    const res = courseInfo.map((v, idx) => ({ ...v, place: placeInfo[idx] }));
    if (!checkCompletedCourses(res)) {
      setShowError(true);
      setErrorModalIsOpen(true);
      return;
    }

    try {
      setLoading(true);
      await createCourse(res);
      setModalIsOpen(true);
    } catch (e) {
      console.error("Error creating course:", e);
      const error = e as AxiosError<IError>;
      alert(
        "인증에 실패했습니다. 다시 시도해주세요. [" +
          (error?.response?.data.data?.[0].error || "알 수 없는 오류") +
          "]"
      );
    } finally {
      setLoading(false);
    }
  };

  // 코스 삭제
  const removeCourse = useCallback((selectedId: number) => {
    setCourseInfo((prev) => prev.filter((_, idx) => idx !== selectedId));
    setPlaceInfo((prev) => prev.filter((_, idx) => idx !== selectedId));
  }, []);

  // 텍스트/이미지 업데이트
  const updateInfo = useCallback((newInfo: ICourseCard, index: number) => {
    setCourseInfo((prev) => {
      const updated = [...prev];
      updated[index] = newInfo;
      return updated;
    });
  }, []);

  // 장소 업데이트 (modalIdx 기준)
  const updatePlaceInfo = useCallback(
    (newPlace: IKakaoMapPoint | null) => {
      if (modalIdx == null) return;
      setPlaceInfo((prev) => {
        const updated = [...prev];
        updated[modalIdx] = newPlace;
        return updated;
      });
    },
    [modalIdx, setPlaceInfo]
  );

  // 코스 추가
  const addNextCourse = useCallback(() => {
    setCourseInfo((prev) => {
      if (prev.length >= 4) return prev;
      const updated = [...prev];
      updated.splice(-1, 0, {
        place: null,
        text: "",
        image: null,
        preview: null,
      });
      return updated;
    });

    setPlaceInfo((prev) => {
      if (prev.length >= 4) return prev;
      const updated = [...prev];
      updated.splice(-1, 0, null);
      return updated;
    });
  }, []);

  return (
    <>
      {/* 모달: 부모에서 단일 렌더 */}
      <ReactModal
        isOpen={modalIdx !== null}
        ariaHideApp={false}
        className="max-w-[460px] mx-auto p-6 bg-white rounded-lg shadow-lg outline-none h-[100vh]"
        style={{ overlay: { zIndex: 2000 }, content: { zIndex: 2100 } }}
      >
        {modalIdx !== null && (
          <CourseSearch
            onClose={() => router.back()}
            defaultPlace={placeInfo[modalIdx]}
            onSelect={(newPlace: IKakaoMapPoint) => {
              updatePlaceInfo(newPlace);
              router.back();
            }}
          />
        )}
      </ReactModal>

      {/* 코스 카드 리스트 */}
      {courseInfo.map((v, idx) => {
        const position =
          idx === 0
            ? "start"
            : idx === courseInfo.length - 1
              ? "end"
              : "stopover";

        return (
          <CourseCard
            key={idx}
            idx={idx}
            position={position}
            info={{
              place: placeInfo[idx],
              text: v.text,
              image: v.image,
              preview: v.preview,
            }}
            setInfo={(newInfo) => updateInfo(newInfo, idx)}
            removeCourse={() => removeCourse(idx)}
            addNextCourse={addNextCourse}
            courseLength={courseInfo.length}
            showError={showError}
          />
        );
      })}

      {/* 제출 버튼 */}
      <button
        className={`${
          isAlreadyCertified
            ? "bg-gray-lightest text-gray-medium"
            : "bg-contrast-dark text-white cursor-pointer"
        } p-4 rounded-xl text-center text-lg font-bold mt-4`}
        disabled={!!isAlreadyCertified || loading}
        onClick={() => {
          if (!loading) onSubmit();
        }}
      >
        {isAlreadyCertified
          ? "코스 추천 주 2회 제출 완료"
          : "코스 추천 제출하기"}
      </button>
    </>
  );
}
